from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db import transaction
import logging
from datetime import timedelta
import uuid

from .models import User, UserProfile, LoginHistory
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserProfileSerializer, PasswordChangeSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, LoginHistorySerializer
)

logger = logging.getLogger(__name__)


class UserRegistrationView(APIView):
    """Enhanced user registration endpoint with detailed error handling"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register a new user with comprehensive error handling"""
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                with transaction.atomic():
                    user = serializer.save()
                    
                    # Generate token for immediate login
                    token, created = Token.objects.get_or_create(user=user)
                    
                    # Log successful registration
                    logger.info(f"New user registered successfully: {user.email}")
                    
                    return Response({
                        'success': True,
                        'message': 'Account created successfully! Welcome to UniFinder.',
                        'user': UserSerializer(user).data,
                        'token': token.key
                    }, status=status.HTTP_201_CREATED)
            else:
                # Enhanced error response with field-specific errors
                error_details = {}
                for field, errors in serializer.errors.items():
                    if isinstance(errors, list):
                        error_details[field] = errors[0]  # Take first error for each field
                    else:
                        error_details[field] = str(errors)
                
                return Response({
                    'success': False,
                    'message': 'Registration failed. Please check the errors below.',
                    'errors': error_details,
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Registration failed due to a server error. Please try again.',
                'error': 'Internal server error',
                'error_type': 'server_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserLoginView(APIView):
    """Enhanced user login endpoint with detailed error handling"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Login user with comprehensive error handling"""
        try:
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                
                # Login user
                login(request, user)
                
                # Generate or get token
                token, created = Token.objects.get_or_create(user=user)
                
                # Update last login
                user.last_login = timezone.now()
                user.save()
                
                # Log login history
                LoginHistory.objects.create(
                    user=user,
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    success=True
                )
                
                # Update profile login count
                profile = user.profile
                profile.login_count += 1
                profile.save()
                
                logger.info(f"User logged in successfully: {user.email}")
                
                return Response({
                    'success': True,
                    'message': 'Login successful! Welcome back.',
                    'user': UserSerializer(user).data,
                    'token': token.key
                }, status=status.HTTP_200_OK)
            else:
                # Enhanced error response with field-specific errors
                error_details = {}
                for field, errors in serializer.errors.items():
                    if isinstance(errors, list):
                        error_details[field] = errors[0]  # Take first error for each field
                    else:
                        error_details[field] = str(errors)
                
                return Response({
                    'success': False,
                    'message': 'Login failed. Please check your credentials.',
                    'errors': error_details,
                    'error_type': 'authentication_error'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Login failed due to a server error. Please try again.',
                'error': 'Internal server error',
                'error_type': 'server_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserLogoutView(APIView):
    """Enhanced user logout endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user with enhanced error handling"""
        try:
            # Delete token
            if hasattr(request.user, 'auth_token'):
                request.user.auth_token.delete()
            
            # Logout user
            logout(request)
            
            logger.info(f"User logged out successfully: {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Logout successful. You have been signed out.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Logout failed. Please try again.',
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    """Enhanced user profile management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user profile with enhanced error handling"""
        try:
            user = request.user
            return Response({
                'success': True,
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Profile get error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve profile. Please try again.',
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update user profile with enhanced error handling"""
        try:
            user = request.user
            user_serializer = UserSerializer(user, data=request.data, partial=True)
            profile_serializer = UserProfileSerializer(user.profile, data=request.data, partial=True)
            
            if user_serializer.is_valid() and profile_serializer.is_valid():
                user_serializer.save()
                profile_serializer.save()
                
                logger.info(f"Profile updated successfully: {user.email}")
                
                return Response({
                    'success': True,
                    'message': 'Profile updated successfully.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                # Combine errors from both serializers
                errors = {}
                if not user_serializer.is_valid():
                    for field, field_errors in user_serializer.errors.items():
                        if isinstance(field_errors, list):
                            errors[field] = field_errors[0]
                        else:
                            errors[field] = str(field_errors)
                
                if not profile_serializer.is_valid():
                    for field, field_errors in profile_serializer.errors.items():
                        if isinstance(field_errors, list):
                            errors[field] = field_errors[0]
                        else:
                            errors[field] = str(field_errors)
                
                return Response({
                    'success': False,
                    'message': 'Profile update failed. Please check the errors below.',
                    'errors': errors,
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Profile update failed due to a server error. Please try again.',
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordChangeView(APIView):
    """Enhanced password change endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Change user password with enhanced error handling"""
        try:
            serializer = PasswordChangeSerializer(data=request.data)
            if serializer.is_valid():
                user = request.user
                
                # Check old password
                if not user.check_password(serializer.validated_data['old_password']):
                    return Response({
                        'success': False,
                        'message': 'Password change failed.',
                        'errors': {
                            'old_password': 'Current password is incorrect. Please check your password and try again.'
                        },
                        'error_type': 'authentication_error'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                
                # Delete all tokens to force re-login
                Token.objects.filter(user=user).delete()
                
                logger.info(f"Password changed successfully: {user.email}")
                
                return Response({
                    'success': True,
                    'message': 'Password changed successfully. Please login with your new password.'
                }, status=status.HTTP_200_OK)
            else:
                # Enhanced error response
                error_details = {}
                for field, errors in serializer.errors.items():
                    if isinstance(errors, list):
                        error_details[field] = errors[0]
                    else:
                        error_details[field] = str(errors)
                
                return Response({
                    'success': False,
                    'message': 'Password change failed. Please check the errors below.',
                    'errors': error_details,
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Password change error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Password change failed due to a server error. Please try again.',
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetRequestView(APIView):
    """Enhanced password reset request endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Request password reset with enhanced error handling"""
        try:
            serializer = PasswordResetRequestSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                user = User.objects.get(email=email)
                
                # Generate reset token
                reset_token = str(uuid.uuid4())
                user.email_verification_token = reset_token
                user.email_verification_expires = timezone.now() + timedelta(hours=24)
                user.save()
                
                # TODO: Send email with reset link
                # For now, just return the token (in production, send via email)
                
                logger.info(f"Password reset requested: {email}")
                
                return Response({
                    'success': True,
                    'message': 'Password reset email sent. Please check your email for instructions.',
                    'token': reset_token  # Remove this in production
                }, status=status.HTTP_200_OK)
            else:
                # Enhanced error response
                error_details = {}
                for field, errors in serializer.errors.items():
                    if isinstance(errors, list):
                        error_details[field] = errors[0]
                    else:
                        error_details[field] = str(errors)
                
                return Response({
                    'success': False,
                    'message': 'Password reset request failed. Please check the errors below.',
                    'errors': error_details,
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Password reset request error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Password reset request failed due to a server error. Please try again.',
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetConfirmView(APIView):
    """Enhanced password reset confirmation endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Confirm password reset with enhanced error handling"""
        try:
            serializer = PasswordResetConfirmSerializer(data=request.data)
            if serializer.is_valid():
                token = serializer.validated_data['token']
                
                try:
                    user = User.objects.get(
                        email_verification_token=token,
                        email_verification_expires__gt=timezone.now()
                    )
                except User.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'Password reset failed.',
                        'errors': {
                            'token': 'Invalid or expired reset token. Please request a new password reset.'
                        },
                        'error_type': 'token_error'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(serializer.validated_data['new_password'])
                user.email_verification_token = None
                user.email_verification_expires = None
                user.save()
                
                # Delete all tokens
                Token.objects.filter(user=user).delete()
                
                logger.info(f"Password reset completed successfully: {user.email}")
                
                return Response({
                    'success': True,
                    'message': 'Password reset successful. Please login with your new password.'
                }, status=status.HTTP_200_OK)
            else:
                # Enhanced error response
                error_details = {}
                for field, errors in serializer.errors.items():
                    if isinstance(errors, list):
                        error_details[field] = errors[0]
                    else:
                        error_details[field] = str(errors)
                
                return Response({
                    'success': False,
                    'message': 'Password reset confirmation failed. Please check the errors below.',
                    'errors': error_details,
                    'error_type': 'validation_error'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Password reset confirmation error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Password reset confirmation failed due to a server error. Please try again.',
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginHistoryView(APIView):
    """Enhanced login history endpoint"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user login history with enhanced error handling"""
        try:
            history = LoginHistory.objects.filter(user=request.user)[:10]
            serializer = LoginHistorySerializer(history, many=True)
            
            return Response({
                'success': True,
                'login_history': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Login history error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve login history. Please try again.',
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth_status(request):
    """Enhanced authentication status check"""
    try:
        return Response({
            'success': True,
            'authenticated': True,
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Auth status check error: {str(e)}")
        return Response({
            'success': False,
            'authenticated': False,
            'message': 'Authentication check failed.',
            'error': 'Internal server error'
        }, status=status.HTTP_401_UNAUTHORIZED)
