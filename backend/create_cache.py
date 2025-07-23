#!/usr/bin/env python
"""
Script to pre-load the vector store cache for faster startup
"""
import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
project_dir = Path(__file__).resolve().parent
sys.path.append(str(project_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'university_recommender.settings')
django.setup()

from recommendations.langchain_service import UniversityRecommendationService
import time

def create_cache():
    """Create the vector store cache for faster loading"""
    print("🚀 Creating vector store cache for faster startup...")
    print("This may take 5-10 minutes on first run...")
    
    start_time = time.time()
    
    try:
        # Initialize the service (this will create the cache)
        service = UniversityRecommendationService()
        
        # Test that it works
        test_preferences = {
            'desired_program': 'Computer Science',
            'program_level': "Master's",
            'preferred_countries': ['United States']
        }
        
        recommendations = service.get_recommendations(test_preferences, top_k=3)
        
        end_time = time.time()
        print(f"✅ Cache created successfully in {end_time - start_time:.2f} seconds")
        print(f"✅ Test recommendations generated: {len(recommendations)} results")
        
        # Check if cache file exists
        cache_path = os.path.join(project_dir, 'vector_store_cache')
        if os.path.exists(cache_path):
            print(f"✅ Cache saved to: {cache_path}")
            print("🎉 System is now optimized for fast startup!")
        else:
            print("⚠️  Cache file not found - check permissions")
            
    except Exception as e:
        print(f"❌ Error creating cache: {e}")
        return False
    
    return True

if __name__ == '__main__':
    create_cache() 