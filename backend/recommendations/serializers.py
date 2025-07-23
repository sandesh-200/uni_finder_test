from rest_framework import serializers
from .models import UserSubmission


class AvailableOptionsSerializer(serializers.Serializer):
    programs = serializers.ListField(child=serializers.CharField())
    countries = serializers.ListField(child=serializers.CharField())
    previous_degrees = serializers.ListField(child=serializers.CharField())
    previous_courses = serializers.ListField(child=serializers.CharField())


class UserSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSubmission
        fields = [
            'id', 'user', 'desired_program', 'program_level', 'program_type',
            'preferred_countries', 'preferred_locations', 'max_tuition_usd',
            'preferred_currency', 'min_global_rank', 'university_types',
            'gpa', 'test_scores', 'additional_preferences', 'recommendations_count',
            'search_results', 'search_duration_ms', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'recommendations_count', 'search_results', 'search_duration_ms', 'created_at']


class UserSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSubmission
        fields = [
            'desired_program', 'program_level', 'program_type',
            'preferred_countries', 'preferred_locations', 'max_tuition_usd',
            'preferred_currency', 'min_global_rank', 'university_types',
            'gpa', 'test_scores', 'additional_preferences'
        ] 