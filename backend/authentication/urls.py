from django.urls import path
from .views import (
    UserRegistrationView, UserLoginView, UserLogoutView, UserProfileView,
    PasswordChangeView, PasswordResetRequestView, PasswordResetConfirmView,
    LoginHistoryView, check_auth_status
)

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('auth-status/', check_auth_status, name='auth-status'),
    
    # Profile management
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Password management
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Login history
    path('login-history/', LoginHistoryView.as_view(), name='login-history'),
] 