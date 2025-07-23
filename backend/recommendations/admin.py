from django.contrib import admin
from .models import UserSubmission


@admin.register(UserSubmission)
class UserSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'desired_program', 'program_level', 'recommendations_count', 'search_duration_ms', 'created_at')
    list_filter = ('program_level', 'program_type', 'created_at')
    search_fields = ('user__email', 'desired_program', 'preferred_countries')
    readonly_fields = ('created_at', 'updated_at', 'search_duration_ms', 'ip_address', 'user_agent')
    
    fieldsets = (
        ('User Information', {'fields': ('user',)}),
        ('Search Parameters', {
            'fields': (
                'desired_program', 'program_level', 'program_type',
                'preferred_countries', 'preferred_locations', 'max_tuition_usd',
                'preferred_currency', 'min_global_rank', 'university_types',
                'gpa', 'test_scores', 'additional_preferences'
            )
        }),
        ('Search Results', {
            'fields': ('recommendations_count', 'search_results')
        }),
        ('Metadata', {
            'fields': ('search_duration_ms', 'ip_address', 'user_agent', 'created_at', 'updated_at')
        }),
    )
