from django.db import models
from django.conf import settings


class UserSubmission(models.Model):
    """Model to store user search submissions and results"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    
    # Search parameters
    desired_program = models.CharField(max_length=255)
    program_level = models.CharField(max_length=50)
    program_type = models.CharField(max_length=50)
    preferred_countries = models.JSONField(default=list)
    preferred_locations = models.JSONField(default=list)
    max_tuition_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    preferred_currency = models.CharField(max_length=10, default='USD')
    min_global_rank = models.IntegerField(null=True, blank=True)
    university_types = models.JSONField(default=list)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    test_scores = models.JSONField(default=dict)
    additional_preferences = models.TextField(blank=True)
    
    # Search results
    recommendations_count = models.IntegerField(default=0)
    search_results = models.JSONField(default=list)  # Store the actual recommendations
    
    # Metadata
    search_duration_ms = models.IntegerField(null=True, blank=True)  # How long the search took
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "User Submissions"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Submission by {self.user.email} - {self.desired_program} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
