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
    """User registration endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register a new user"""
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                with transaction.atomic():
                    user = serializer.save()
                    
                    # Generate token for immediate login
                    token, created = Token.objects.get_or_create(user=user)
                    
                    # Log successful registration
                    logger.info(f"New user registered: {user.email}")
                    
                    return Response({
                        'message': 'User registered successfully',
                        'user': UserSerializer(user).data,
                        'token': token.key
                    }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'message': 'Registration failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({
                'message': 'Registration failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserLoginView(APIView):
    """User login endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Login user"""
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
                
                logger.info(f"User logged in: {user.email}")
                
                return Response({
                    'message': 'Login successful',
                    'user': UserSerializer(user).data,
                    'token': token.key
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Login failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'message': 'Login failed',
                'error': str(e)
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
    """User logout endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user"""
        try:
            # Delete token
            if hasattr(request.user, 'auth_token'):
                request.user.auth_token.delete()
            
            # Logout user
            logout(request)
            
            logger.info(f"User logged out: {request.user.email}")
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({
                'message': 'Logout failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    """User profile management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user profile"""
        try:
            user = request.user
            return Response({
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Profile get error: {str(e)}")
            return Response({
                'message': 'Failed to get profile',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update user profile"""
        try:
            user = request.user
            user_serializer = UserSerializer(user, data=request.data, partial=True)
            profile_serializer = UserProfileSerializer(user.profile, data=request.data, partial=True)
            
            if user_serializer.is_valid() and profile_serializer.is_valid():
                user_serializer.save()
                profile_serializer.save()
                
                logger.info(f"Profile updated: {user.email}")
                
                return Response({
                    'message': 'Profile updated successfully',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                errors = {}
                if not user_serializer.is_valid():
                    errors.update(user_serializer.errors)
                if not profile_serializer.is_valid():
                    errors.update(profile_serializer.errors)
                
                return Response({
                    'message': 'Profile update failed',
                    'errors': errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return Response({
                'message': 'Profile update failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordChangeView(APIView):
    """Password change endpoint"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Change user password"""
        try:
            serializer = PasswordChangeSerializer(data=request.data)
            if serializer.is_valid():
                user = request.user
                
                # Check old password
                if not user.check_password(serializer.validated_data['old_password']):
                    return Response({
                        'message': 'Current password is incorrect'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                
                # Delete all tokens to force re-login
                Token.objects.filter(user=user).delete()
                
                logger.info(f"Password changed: {user.email}")
                
                return Response({
                    'message': 'Password changed successfully. Please login again.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Password change failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Password change error: {str(e)}")
            return Response({
                'message': 'Password change failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetRequestView(APIView):
    """Password reset request endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Request password reset"""
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
                    'message': 'Password reset email sent',
                    'token': reset_token  # Remove this in production
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Password reset request failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Password reset request error: {str(e)}")
            return Response({
                'message': 'Password reset request failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetConfirmView(APIView):
    """Password reset confirmation endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Confirm password reset"""
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
                        'message': 'Invalid or expired reset token'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(serializer.validated_data['new_password'])
                user.email_verification_token = None
                user.email_verification_expires = None
                user.save()
                
                # Delete all tokens
                Token.objects.filter(user=user).delete()
                
                logger.info(f"Password reset completed: {user.email}")
                
                return Response({
                    'message': 'Password reset successful. Please login with your new password.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Password reset confirmation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Password reset confirmation error: {str(e)}")
            return Response({
                'message': 'Password reset confirmation failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginHistoryView(APIView):
    """Login history endpoint"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user login history"""
        try:
            history = LoginHistory.objects.filter(user=request.user)[:10]
            serializer = LoginHistorySerializer(history, many=True)
            
            return Response({
                'login_history': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Login history error: {str(e)}")
            return Response({
                'message': 'Failed to get login history',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth_status(request):
    """Check authentication status"""
    try:
        return Response({
            'authenticated': True,
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Auth status check error: {str(e)}")
        return Response({
            'authenticated': False,
            'error': str(e)
        }, status=status.HTTP_401_UNAUTHORIZED)
