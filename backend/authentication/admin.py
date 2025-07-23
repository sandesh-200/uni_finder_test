from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile, LoginHistory


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Admin interface for User model"""
    
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined', 'last_login')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'terms_accepted', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth')}),
        ('Account Status', {'fields': ('is_active', 'is_email_verified', 'terms_accepted', 'terms_accepted_at')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Email Verification', {'fields': ('email_verification_token', 'email_verification_expires')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model"""
    
    list_display = ('user', 'current_education_level', 'current_institution', 'gpa', 'login_count', 'last_activity')
    list_filter = ('current_education_level', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'current_institution')
    ordering = ('-last_activity',)
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Academic Information', {'fields': ('current_education_level', 'current_institution', 'gpa')}),
        ('Preferences', {'fields': ('preferred_countries', 'preferred_programs', 'budget_range')}),
        ('Activity', {'fields': ('last_activity', 'login_count')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ('last_activity', 'login_count', 'created_at', 'updated_at')


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    """Admin interface for LoginHistory model"""
    
    list_display = ('user', 'login_time', 'ip_address', 'success')
    list_filter = ('success', 'login_time')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'ip_address')
    ordering = ('-login_time',)
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Login Details', {'fields': ('login_time', 'ip_address', 'user_agent', 'success')}),
    )
    
    readonly_fields = ('login_time', 'ip_address', 'user_agent')
    
    def has_add_permission(self, request):
        """Disable manual addition of login history"""
        return False
