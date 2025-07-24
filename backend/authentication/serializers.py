from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from django.contrib.auth.password_validation import get_default_password_validators
from .models import User, UserProfile, LoginHistory
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Enhanced serializer for user registration with detailed validation"""
    
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        max_length=128,
        help_text="Password must be at least 8 characters long"
    )
    confirm_password = serializers.CharField(write_only=True)
    terms_accepted = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'password', 'confirm_password', 'terms_accepted'
        ]
        extra_kwargs = {
            'first_name': {
                'required': True,
                'min_length': 2,
                'max_length': 50,
                'help_text': 'First name must be between 2 and 50 characters'
            },
            'last_name': {
                'required': True,
                'min_length': 2,
                'max_length': 50,
                'help_text': 'Last name must be between 2 and 50 characters'
            },
            'email': {
                'required': True,
                'help_text': 'Please enter a valid email address'
            },
            'phone_number': {
                'required': False,
                'help_text': 'Phone number is optional'
            }
        }
    
    def validate_first_name(self, value):
        """Validate first name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("First name must be at least 2 characters long")
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("First name can only contain letters and spaces")
        return value.strip()
    
    def validate_last_name(self, value):
        """Validate last name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters long")
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Last name can only contain letters and spaces")
        return value.strip()
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if not value:
            raise serializers.ValidationError("Email is required")
        
        # Check email format
        email_validator = EmailValidator()
        try:
            email_validator(value)
        except ValidationError:
            raise serializers.ValidationError("Please enter a valid email address")
        
        # Check if email already exists
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("An account with this email already exists")
        
        return value.lower().strip()
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value:
            # Remove all non-digit characters except +
            cleaned = re.sub(r'[^\d+]', '', value)
            if not re.match(r'^\+?1?\d{9,15}$', cleaned):
                raise serializers.ValidationError(
                    "Please enter a valid phone number (e.g., +1234567890 or 1234567890)"
                )
        return value
    
    def validate_password(self, value):
        """Enhanced password validation with detailed feedback"""
        try:
            # Use Django's password validators
            validate_password(value)
        except ValidationError as e:
            # Convert Django validation errors to user-friendly messages
            error_messages = []
            for error in e.error_list:
                if 'too short' in str(error).lower():
                    error_messages.append("Password must be at least 8 characters long")
                elif 'too common' in str(error).lower():
                    error_messages.append("This password is too common. Please choose a more unique password")
                elif 'numeric' in str(error).lower():
                    error_messages.append("Password must contain at least one number")
                elif 'similar' in str(error).lower():
                    error_messages.append("Password is too similar to your personal information")
                else:
                    error_messages.append(str(error))
            
            if error_messages:
                raise serializers.ValidationError(" ".join(error_messages))
        
        return value
    
    def validate(self, attrs):
        """Validate registration data"""
        # Check password confirmation
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': "Passwords don't match. Please make sure both passwords are identical."
            })
        
        # Check terms acceptance
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError({
                'terms_accepted': "You must accept the terms and conditions to create an account."
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create new user with enhanced error handling"""
        try:
            validated_data.pop('confirm_password')
            terms_accepted = validated_data.pop('terms_accepted')
        
        # Create user
            user = User.objects.create_user(
                username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            terms_accepted=terms_accepted
        )
        
        # Create user profile
            UserProfile.objects.create(user=user)
        
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create account: {str(e)}")


class UserLoginSerializer(serializers.Serializer):
    """Enhanced serializer for user login with detailed error messages"""
    
    email = serializers.EmailField(
        help_text="Please enter your email address"
    )
    password = serializers.CharField(
        help_text="Please enter your password"
    )
    
    def validate_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required")
        
        email_validator = EmailValidator()
        try:
            email_validator(value)
        except ValidationError:
            raise serializers.ValidationError("Please enter a valid email address")
        
        return value.lower().strip()
    
    def validate(self, attrs):
        """Validate login credentials with detailed error messages"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Both email and password are required")
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'email': "No account found with this email address. Please check your email or register a new account."
            })
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({
                'email': "This account has been deactivated. Please contact support for assistance."
            })
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError({
                'password': "Incorrect password. Please check your password and try again."
            })
        
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'current_education_level', 'current_institution', 'gpa',
            'preferred_countries', 'preferred_programs', 'budget_range',
            'last_activity', 'login_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['last_activity', 'login_count', 'created_at', 'updated_at']
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'phone_number': obj.user.phone_number,
            'is_email_verified': obj.user.is_email_verified,
            'date_joined': obj.user.date_joined
        }


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'is_email_verified', 'terms_accepted', 'date_joined', 'last_login',
            'profile'
        ]
        read_only_fields = ['id', 'is_email_verified', 'date_joined', 'last_login']


class PasswordChangeSerializer(serializers.Serializer):
    """Enhanced serializer for password change"""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, 
        validators=[validate_password],
        min_length=8,
        max_length=128
    )
    confirm_password = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        """Validate old password"""
        if not value:
            raise serializers.ValidationError("Current password is required")
        return value
    
    def validate_new_password(self, value):
        """Validate new password with detailed feedback"""
        try:
            validate_password(value)
        except ValidationError as e:
            error_messages = []
            for error in e.error_list:
                if 'too short' in str(error).lower():
                    error_messages.append("New password must be at least 8 characters long")
                elif 'too common' in str(error).lower():
                    error_messages.append("This password is too common. Please choose a more unique password")
                elif 'numeric' in str(error).lower():
                    error_messages.append("Password must contain at least one number")
                elif 'similar' in str(error).lower():
                    error_messages.append("Password is too similar to your personal information")
                else:
                    error_messages.append(str(error))
            
            if error_messages:
                raise serializers.ValidationError(" ".join(error_messages))
        
        return value
    
    def validate(self, attrs):
        """Validate password change"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': "New passwords don't match. Please make sure both passwords are identical."
            })
        
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                'new_password': "New password must be different from your current password."
            })
        
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Validate email exists"""
        if not User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("No account found with this email address. Please check your email or register a new account.")
        return value.lower().strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Enhanced serializer for password reset confirmation"""
    
    token = serializers.CharField()
    new_password = serializers.CharField(
        validators=[validate_password],
        min_length=8,
        max_length=128
    )
    confirm_password = serializers.CharField()
    
    def validate_new_password(self, value):
        """Validate new password with detailed feedback"""
        try:
            validate_password(value)
        except ValidationError as e:
            error_messages = []
            for error in e.error_list:
                if 'too short' in str(error).lower():
                    error_messages.append("New password must be at least 8 characters long")
                elif 'too common' in str(error).lower():
                    error_messages.append("This password is too common. Please choose a more unique password")
                elif 'numeric' in str(error).lower():
                    error_messages.append("Password must contain at least one number")
                elif 'similar' in str(error).lower():
                    error_messages.append("Password is too similar to your personal information")
                else:
                    error_messages.append(str(error))
            
            if error_messages:
                raise serializers.ValidationError(" ".join(error_messages))
        
        return value
    
    def validate(self, attrs):
        """Validate password reset"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': "Passwords don't match. Please make sure both passwords are identical."
            })
        return attrs


class LoginHistorySerializer(serializers.ModelSerializer):
    """Serializer for login history"""
    
    class Meta:
        model = LoginHistory
        fields = ['login_time', 'ip_address', 'user_agent', 'success']
        read_only_fields = ['login_time', 'ip_address', 'user_agent', 'success'] 