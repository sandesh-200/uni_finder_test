from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
import json
import time
import os
from .models import UserSubmission
from .serializers import (
    AvailableOptionsSerializer, UserSubmissionCreateSerializer
)
from .langchain_service_fast import UniversityRecommendationService
from django.contrib.auth.models import AnonymousUser


def get_recommendation_service():
    """Get or create the recommendation service instance"""
    if not hasattr(get_recommendation_service, '_service'):
        try:
            get_recommendation_service._service = UniversityRecommendationService()
        except Exception as e:
            print(f"Error initializing recommendation service: {e}")
            get_recommendation_service._service = None
    return get_recommendation_service._service


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint to verify system status"""
    try:
        service = get_recommendation_service()
        
        # Check if service is available
        if service is None:
            return Response({
                'status': 'initializing',
                'message': 'System is initializing. Please wait a few minutes for first-time setup.',
                'cache_status': 'building',
                'ready': False
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Check if cache exists
        cache_path = os.path.join(os.path.dirname(__file__), '..', 'vector_store_cache')
        cache_exists = os.path.exists(cache_path)
        
        # Test basic functionality
        try:
            test_options = service.get_available_programs()
            service_ready = len(test_options) > 0
        except Exception as e:
            service_ready = False
        
        return Response({
            'status': 'operational' if service_ready else 'initializing',
            'message': 'System is ready' if service_ready else 'System is still initializing',
            'cache_status': 'ready' if cache_exists else 'building',
            'ready': service_ready,
            'cache_exists': cache_exists,
            'programs_count': len(test_options) if service_ready else 0
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'System error: {str(e)}',
            'cache_status': 'error',
            'ready': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    """Get university recommendations based on user preferences"""
    start_time = time.time()
    
    try:
        # Check if service is ready
        service = get_recommendation_service()
        if service is None:
            return Response({
                'error': 'System is still initializing',
                'message': 'Please wait a few minutes for the system to finish setting up. This happens on first startup.',
                'retry_after': 60  # Suggest retry after 1 minute
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Extract user preferences from request
        data = request.data
        
        # Create user submission record
        submission_data = {
            'desired_program': data.get('desired_program', ''),
            'program_level': data.get('program_level', ''),
            'program_type': data.get('program_type', ''),
            'preferred_countries': data.get('preferred_countries', []),
            'preferred_locations': data.get('preferred_locations', []),
            'max_tuition_usd': data.get('max_tuition_usd'),
            'preferred_currency': data.get('preferred_currency', 'USD'),
            'min_global_rank': data.get('min_global_rank'),
            'university_types': data.get('university_types', []),
            'gpa': data.get('gpa'),
            'test_scores': data.get('test_scores', {}),
            'additional_preferences': data.get('additional_preferences', '')
        }
        
        # Create submission serializer
        submission_serializer = UserSubmissionCreateSerializer(data=submission_data)
        if submission_serializer.is_valid():
            # Save the submission with user
            submission = submission_serializer.save(user=request.user)
        else:
            print(f"Submission validation errors: {submission_serializer.errors}")
        
        # Get recommendations from service
        recommendations = service.get_recommendations(data)
        
        # Calculate search duration
        search_duration = int((time.time() - start_time) * 1000)  # Convert to milliseconds
        
        # Update submission with results
        if 'submission' in locals():
            submission.recommendations_count = len(recommendations)
            submission.search_results = recommendations
            submission.search_duration_ms = search_duration
            submission.ip_address = get_client_ip(request)
            submission.user_agent = request.META.get('HTTP_USER_AGENT', '')
            submission.save()
        
        return Response({
            'recommendations': recommendations,
            'search_duration_ms': search_duration,
            'submission_id': submission.id if 'submission' in locals() else None
        })
        
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        return Response({
            'error': 'Failed to get recommendations',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['GET'])
@permission_classes([AllowAny])
def get_available_options(request):
    """Get available options for dropdowns"""
    try:
        service = get_recommendation_service()
        
        # Check if service is ready
        if service is None:
            return Response({
                'error': 'System is still initializing',
                'message': 'Please wait a few minutes for the system to finish setting up.',
                'retry_after': 60
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        options = {
            'programs': service.get_available_programs(),
            'countries': service.get_available_countries(),
            'previous_degrees': service.get_available_previous_degrees(),
            'previous_courses': service.get_available_previous_courses()
        }
        
        serializer = AvailableOptionsSerializer(options)
        return Response(serializer.data)
        
    except Exception as e:
        print(f"Error in get_available_options: {str(e)}")
        return Response({
            'error': 'Failed to get available options',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_submissions(request):
    """Get user's search history"""
    try:
        submissions = UserSubmission.objects.filter(user=request.user).order_by('-created_at')
        from .serializers import UserSubmissionSerializer
        serializer = UserSubmissionSerializer(submissions, many=True)
        return Response({
            'submissions': serializer.data
        })
    except Exception as e:
        print(f"Error in get_user_submissions: {str(e)}")
        return Response({
            'error': 'Failed to get user submissions',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
