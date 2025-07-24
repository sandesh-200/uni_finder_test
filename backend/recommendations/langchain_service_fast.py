import json
import pandas as pd
import numpy as np
import time
from typing import List, Dict, Any, Optional
from django.conf import settings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
import logging
import os

logger = logging.getLogger(__name__)


class UniversityRecommendationService:
    """Service for intelligent university recommendations using LangChain with Gemini - FAST VERSION"""
    
    def __init__(self):
        start_time = time.time()
        logger.info("🚀 Initializing UniversityRecommendationService (Fast Version)...")
        
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=settings.GEMINI_API_KEY
        )
        self.vector_store = None
        self.university_data = None
        
        # Check for cached vector store
        cache_path = os.path.join(settings.BASE_DIR, 'vector_store_cache')
        if os.path.exists(cache_path):
            try:
                logger.info("📦 Loading cached vector store...")
                cache_start = time.time()
                self.vector_store = FAISS.load_local(cache_path, self.embeddings, allow_dangerous_deserialization=True)
                self._load_data_minimal()  # Load only metadata
                cache_duration = time.time() - cache_start
                logger.info(f"✅ Loaded cached vector store successfully in {cache_duration:.2f}s")
                return
            except Exception as e:
                logger.warning(f"❌ Failed to load cached vector store: {e}")
        
        logger.info("🔄 No cache found. Creating vector store from scratch...")
        # Load fresh data if no cache
        self._load_data()
        
        # Save cache for future use
        try:
            os.makedirs(cache_path, exist_ok=True)
            self.vector_store.save_local(cache_path)
            logger.info("✅ Saved vector store cache for future use")
        except Exception as e:
            logger.warning(f"❌ Failed to save vector store cache: {e}")
        
        init_duration = time.time() - start_time
        logger.info(f"✅ Service initialized in {init_duration:.2f}s")
    
    def _load_data(self):
        """Load and process university data"""
        start_time = time.time()
        logger.info("📊 Loading university data...")
        
        try:
            with open(settings.UNIVERSITY_DATASET_PATH, 'r') as f:
                self.university_data = json.load(f)
            
            # Convert to DataFrame for easier processing
            df = pd.DataFrame(self.university_data)
            
            # Create documents for vector search
            documents = []
            for _, row in df.iterrows():
                # Create a comprehensive text representation of each university course
                text = f"""
                University: {row.get('university_name', 'N/A')}
                Course: {row.get('university_course_name', 'N/A')}
                Program: {row.get('course_program_label', 'N/A')}
                Parent Course: {row.get('parent_course_name', 'N/A')}
                Level: {row.get('program_type', 'N/A')} - {row.get('university_courses_credential', 'N/A')}
                Location: {row.get('location_name', 'N/A')}, {row.get('country_name', 'N/A')}
                Global Rank: {row.get('university_global_rank', 'N/A')}
                Tuition (USD): ${row.get('university_course_tuition_usd', 'N/A')}
                University Type: {row.get('university_type', 'N/A')}
                Currency: {row.get('country_currency', 'N/A')}
                Scholarship Count: {row.get('scholarship_count', 'N/A')}
                GRE Required: {row.get('is_gre_required', 'N/A')}
                University Views: {row.get('university_views', 'N/A')}
                Tuition Affordability: {row.get('tuition_affordability', 'N/A')}
                University Quality: {row.get('university_quality', 'N/A')}
                Country Popularity: {row.get('country_popularity', 'N/A')}
                """
                
                metadata = {
                    'university_id': row.get('university_id'),
                    'course_id': row.get('university_course_id'),
                    'university_name': row.get('university_name'),
                    'university_slug': row.get('university_slug'),
                    'course_name': row.get('university_course_name'),
                    'course_program_label': row.get('course_program_label'),
                    'program_level': row.get('program_level'),
                    'program_type': row.get('program_type'),
                    'credential': row.get('university_courses_credential'),
                    'parent_course': row.get('parent_course_name'),
                    'location': row.get('location_name'),
                    'country': row.get('country_name'),
                    'global_rank': row.get('university_global_rank'),
                    'tuition_usd': row.get('university_course_tuition_usd'),
                    'tuition_local': row.get('university_course_tuition_local'),
                    'university_type': row.get('university_type'),
                    'currency': row.get('country_currency'),
                    'is_partner': row.get('is_partner'),
                    'is_published': row.get('is_published'),
                    'university_views': row.get('university_views'),
                    'scholarship_count': row.get('scholarship_count'),
                    'is_gre_required': row.get('is_gre_required'),
                    'tuition_affordability': row.get('tuition_affordability'),
                    'university_quality': row.get('university_quality'),
                    'country_popularity': row.get('country_popularity'),
                }
                
                # Log any missing critical fields for debugging
                missing_fields = [key for key, value in metadata.items() if value is None]
                if missing_fields:
                    logger.warning(f"Missing fields for university {metadata.get('university_name', 'Unknown')}: {missing_fields}")
                
                doc = Document(page_content=text, metadata=metadata)
                documents.append(doc)
            
            # Create vector store
            vector_start = time.time()
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
            vector_duration = time.time() - vector_start
            logger.info(f"✅ Loaded {len(documents)} university courses into vector store in {vector_duration:.2f}s")
            
        except Exception as e:
            logger.error(f"❌ Error loading university data: {e}")
            raise
        
        total_duration = time.time() - start_time
        logger.info(f"✅ Data loading completed in {total_duration:.2f}s")
    
    def _load_data_minimal(self):
        """Load only essential data for cached vector store"""
        try:
            with open(settings.UNIVERSITY_DATASET_PATH, 'r') as f:
                self.university_data = json.load(f)
            logger.info(f"📊 Loaded {len(self.university_data)} university courses (minimal)")
        except Exception as e:
            logger.error(f"❌ Error loading minimal data: {e}")
            raise
    
    def get_recommendations(self, user_preferences: Dict[str, Any], top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Get intelligent university recommendations based on user preferences - FAST VERSION
        """
        start_time = time.time()
        logger.info(f"🎯 Getting recommendations for preferences: {user_preferences}")
        
        try:
            # Create query based on user preferences
            query_start = time.time()
            query = self._create_query_from_preferences(user_preferences)
            query_duration = time.time() - query_start
            
            # Get similar documents from vector store
            vector_start = time.time()
            similar_docs = self.vector_store.similarity_search_with_score(
                query, k=top_k * 2  # Get more candidates for filtering
            )
            vector_duration = time.time() - vector_start
            logger.info(f"✅ Vector search completed in {vector_duration:.2f}s, found {len(similar_docs)} candidates")
            
            # Filter and rank recommendations
            processing_start = time.time()
            recommendations = []
            
            for i, (doc, score) in enumerate(similar_docs):
                # Calculate match percentage based on preferences
                match_start = time.time()
                match_percentage = self._calculate_match_percentage(doc.metadata, user_preferences)
                match_duration = time.time() - match_start
                
                # Generate fast fallback reasoning (no API calls)
                reasoning_start = time.time()
                llm_reasoning = self._generate_fallback_reasoning(doc.metadata, user_preferences, match_percentage)
                reasoning_duration = time.time() - reasoning_start
                
                recommendation = {
                    'course_id': doc.metadata.get('course_id'),
                    'university_id': doc.metadata.get('university_id'),
                    'university_name': doc.metadata.get('university_name'),
                    'university_slug': doc.metadata.get('university_slug'),
                    'course_name': doc.metadata.get('course_name'),
                    'course_program_label': doc.metadata.get('course_program_label'),
                    'program_level': doc.metadata.get('program_level'),
                    'program_type': doc.metadata.get('program_type'),
                    'credential': doc.metadata.get('credential'),
                    'parent_course': doc.metadata.get('parent_course'),
                    'location': doc.metadata.get('location'),
                    'country': doc.metadata.get('country'),
                    'global_rank': doc.metadata.get('global_rank'),
                    'tuition_usd': doc.metadata.get('tuition_usd'),
                    'tuition_local': doc.metadata.get('tuition_local'),
                    'university_type': doc.metadata.get('university_type'),
                    'currency': doc.metadata.get('currency'),
                    'is_partner': doc.metadata.get('is_partner'),
                    'is_published': doc.metadata.get('is_published'),
                    'university_views': doc.metadata.get('university_views'),
                    'scholarship_count': doc.metadata.get('scholarship_count'),
                    'is_gre_required': doc.metadata.get('is_gre_required'),
                    'tuition_affordability': doc.metadata.get('tuition_affordability'),
                    'university_quality': doc.metadata.get('university_quality'),
                    'country_popularity': doc.metadata.get('country_popularity'),
                    'similarity_score': float(score),
                    'match_percentage': match_percentage,
                    'llm_reasoning': llm_reasoning,
                    'relevance_score': (match_percentage + (1 - float(score))) / 2
                }
                
                recommendations.append(recommendation)
            
            # Sort by relevance score and return top_k
            recommendations.sort(key=lambda x: x['relevance_score'], reverse=True)
            final_recommendations = recommendations[:top_k]
            
            processing_duration = time.time() - processing_start
            total_duration = time.time() - start_time
            
            logger.info(f"✅ Generated {len(final_recommendations)} recommendations in {total_duration:.2f}s")
            return final_recommendations
            
        except Exception as e:
            logger.error(f"❌ Error getting recommendations: {e}")
            logger.error(f"❌ Error details: {type(e).__name__}")
            import traceback
            logger.error(f"❌ Full traceback: {traceback.format_exc()}")
            return []
    
    def _create_query_from_preferences(self, preferences: Dict[str, Any]) -> str:
        """Create a search query from user preferences"""
        query_parts = []
        
        if preferences.get('desired_program'):
            query_parts.append(f"Program: {preferences['desired_program']}")
        
        if preferences.get('program_level'):
            query_parts.append(f"Level: {preferences['program_level']}")
        
        if preferences.get('program_type'):
            query_parts.append(f"Degree: {preferences['program_type']}")
        
        if preferences.get('preferred_countries'):
            countries = ", ".join(preferences['preferred_countries'])
            query_parts.append(f"Countries: {countries}")
        
        if preferences.get('preferred_locations'):
            locations = ", ".join(preferences['preferred_locations'])
            query_parts.append(f"Locations: {locations}")
        
        if preferences.get('university_types'):
            types = ", ".join(preferences['university_types'])
            query_parts.append(f"University Types: {types}")
        
        if preferences.get('additional_preferences'):
            query_parts.append(f"Additional: {preferences['additional_preferences']}")
        
        query = " ".join(query_parts)
        return query
    
    def _calculate_match_percentage(self, course_metadata: Dict[str, Any], preferences: Dict[str, Any]) -> float:
        """Calculate how well a course matches user preferences (0-100)"""
        match_points = 0
        total_points = 0
        
        # Program match
        if preferences.get('desired_program'):
            total_points += 25
            if course_metadata.get('parent_course') and preferences['desired_program'].lower() in course_metadata['parent_course'].lower():
                match_points += 25
            elif course_metadata.get('course_name') and preferences['desired_program'].lower() in course_metadata['course_name'].lower():
                match_points += 20
        
        # Program level match
        if preferences.get('program_level'):
            total_points += 15
            if course_metadata.get('program_type') and preferences['program_level'].lower() in course_metadata['program_type'].lower():
                match_points += 15
        
        # Location match
        if preferences.get('preferred_countries'):
            total_points += 20
            if course_metadata.get('country') and course_metadata['country'] in preferences['preferred_countries']:
                match_points += 20
        
        # University type match
        if preferences.get('university_types'):
            total_points += 15
            if course_metadata.get('university_type') and course_metadata['university_type'] in preferences['university_types']:
                match_points += 15
        
        # Tuition match
        if preferences.get('max_tuition_usd') and course_metadata.get('tuition_usd'):
            total_points += 15
            if course_metadata['tuition_usd'] <= preferences['max_tuition_usd']:
                match_points += 15
        
        # Global rank match
        if preferences.get('min_global_rank') and course_metadata.get('global_rank'):
            total_points += 10
            if course_metadata['global_rank'] <= preferences['min_global_rank']:
                match_points += 10
        
        match_percentage = (match_points / total_points * 100) if total_points > 0 else 0
        return match_percentage
    
    def _generate_fallback_reasoning(self, course_metadata: Dict[str, Any], preferences: Dict[str, Any], match_percentage: float) -> str:
        """Generate intelligent fallback reasoning without LLM"""
        reasons = []
        
        # Program match
        if preferences.get('desired_program') and course_metadata.get('parent_course') and preferences['desired_program'].lower() in course_metadata['parent_course'].lower():
            reasons.append(f"Perfect program match: {preferences['desired_program']}")
        
        # Location match
        if preferences.get('preferred_countries') and course_metadata.get('country') and course_metadata['country'] in preferences['preferred_countries']:
            reasons.append(f"Located in your preferred country: {course_metadata['country']}")
        
        # Tuition match
        if preferences.get('max_tuition_usd') and course_metadata.get('tuition_usd') and course_metadata['tuition_usd'] <= preferences['max_tuition_usd']:
            reasons.append(f"Within your budget: ${course_metadata['tuition_usd']:,.0f}")
        
        # Rank match
        if preferences.get('min_global_rank') and course_metadata.get('global_rank') and course_metadata['global_rank'] <= preferences['min_global_rank']:
            reasons.append(f"Meets your ranking criteria: #{course_metadata['global_rank']}")
        
        # University type match
        if preferences.get('university_types') and course_metadata.get('university_type') and course_metadata['university_type'] in preferences['university_types']:
            reasons.append(f"University type matches: {course_metadata['university_type']}")
        
        # Scholarship information
        if course_metadata.get('scholarship_count') and course_metadata['scholarship_count'] > 0:
            reasons.append(f"Offers {course_metadata['scholarship_count']} scholarship opportunities")
        
        # GRE requirement
        if course_metadata.get('is_gre_required') and course_metadata['is_gre_required'] != 'NA':
            reasons.append(f"GRE requirement: {course_metadata['is_gre_required']}")
        
        # University quality
        if course_metadata.get('university_quality'):
            quality_score = course_metadata['university_quality']
            if quality_score > 0.8:
                reasons.append("High university quality score")
            elif quality_score > 0.6:
                reasons.append("Good university quality score")
        
        # Tuition affordability
        if course_metadata.get('tuition_affordability'):
            affordability = course_metadata['tuition_affordability']
            if affordability > 0.7:
                reasons.append("Highly affordable tuition")
            elif affordability > 0.5:
                reasons.append("Moderately affordable tuition")
        
        if reasons:
            reasoning = f"This course matches {match_percentage:.1f}% of your preferences. Key factors: {'; '.join(reasons)}."
        else:
            reasoning = f"This course matches {match_percentage:.1f}% of your preferences based on program, location, and cost factors."
        
        return reasoning
    
    def get_available_programs(self) -> List[str]:
        """Get list of available programs/courses with better variety"""
        if not self.university_data:
            return []
        
        # Count program frequencies to determine popularity
        program_counts = {}
        for item in self.university_data:
            if item.get('parent_course_name'):
                program = item['parent_course_name']
                program_counts[program] = program_counts.get(program, 0) + 1
        
        # Sort by frequency (popularity) and then alphabetically
        sorted_programs = sorted(program_counts.items(), key=lambda x: (-x[1], x[0]))
        
        # Return all programs sorted by popularity
        return [program for program, count in sorted_programs]
    
    def get_available_countries(self) -> List[str]:
        """Get list of available countries with better variety"""
        if not self.university_data:
            return []
        
        # Count country frequencies to determine popularity
        country_counts = {}
        for item in self.university_data:
            if item.get('country_name'):
                country = item['country_name']
                country_counts[country] = country_counts.get(country, 0) + 1
        
        # Sort by frequency (popularity) and then alphabetically
        sorted_countries = sorted(country_counts.items(), key=lambda x: (-x[1], x[0]))
        
        # Return all countries sorted by popularity
        return [country for country, count in sorted_countries]
    
    def get_available_locations(self) -> List[str]:
        """Get list of available locations"""
        if not self.university_data:
            return []
        
        locations = set()
        for item in self.university_data:
            if item.get('location_name'):
                locations.add(item['location_name'])
        
        return sorted(list(locations))
    
    def get_available_previous_degrees(self) -> List[str]:
        """Get list of common previous degree types"""
        return [
            "Bachelor's Degree",
            "Master's Degree", 
            "PhD/Doctorate",
            "Associate's Degree",
            "Diploma",
            "High School Diploma",
            "Certificate",
            "Foundation Year",
            "A-Levels",
            "IB Diploma"
        ]
    
    def get_available_previous_courses(self) -> List[str]:
        """Get list of common previous course types"""
        return [
            "Computer Science",
            "Information Technology",
            "Business Administration",
            "Engineering",
            "Mathematics",
            "Physics",
            "Chemistry",
            "Biology",
            "Economics",
            "Psychology",
            "Sociology",
            "History",
            "English Literature",
            "Political Science",
            "International Relations",
            "Medicine",
            "Law",
            "Education",
            "Arts",
            "Music",
            "Design",
            "Architecture",
            "Accounting",
            "Finance",
            "Marketing",
            "Human Resources",
            "Nursing",
            "Pharmacy",
            "Agriculture",
            "Environmental Science"
        ] 