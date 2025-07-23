#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import time
from pathlib import Path


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'university_recommender.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Check if this is the first run and create cache if needed
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        cache_path = Path(__file__).parent / 'vector_store_cache'
        if not cache_path.exists():
            print("🚀 First-time setup detected. Creating vector store cache...")
            print("This may take 5-10 minutes on first run...")
            
            try:
                # Import and create cache
                from recommendations.langchain_service_fast import UniversityRecommendationService
                start_time = time.time()
                
                # Initialize service (this creates the cache)
                service = UniversityRecommendationService()
                
                # Test the service
                test_preferences = {
                    'desired_program': 'Computer Science',
                    'program_level': "Master's",
                    'preferred_countries': ['United States']
                }
                
                recommendations = service.get_recommendations(test_preferences, top_k=3)
                
                end_time = time.time()
                print(f"✅ Cache created successfully in {end_time - start_time:.2f} seconds")
                print(f"✅ Test recommendations generated: {len(recommendations)} results")
                print("🎉 System is now optimized for fast startup!")
                
            except Exception as e:
                print(f"❌ Error creating cache: {e}")
                print("⚠️  System will continue without cache. First requests may be slow.")
    
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
