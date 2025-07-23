from django.urls import path
from . import views
 
urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('recommendations/', views.get_recommendations, name='get_recommendations'),
    path('available-options/', views.get_available_options, name='get_available_options'),
    path('user-submissions/', views.get_user_submissions, name='get_user_submissions'),
] 