import { useState, useEffect, useRef } from "react";
import { GiCash, GiGraduateCap } from "react-icons/gi";
import { IoIosArrowDown } from "react-icons/io";
import { FiBook, FiGlobe } from "react-icons/fi";
import { BsFileEarmarkSlides } from "react-icons/bs";
import apiService from "../services/api";
import type { UserPreferences, UniversityRecommendation, AvailableOptions } from "../services/api";
import SearchableDropdown from "./SearchableDropdown";
import { logger } from "../utils/logger";

const dropdownClasses =
  "flex items-center border border-[#CBD5E1] rounded-lg px-4 py-2 gap-2 bg-white relative w-full shadow-sm";

const selectClasses =
  "appearance-none w-full bg-transparent text-sm text-[#1E293B] font-sora-regular outline-none cursor-pointer pr-6";

const TellUs = () => {
  const [degree, setDegree] = useState("");
  const [course, setCourse] = useState("");
  const [country, setCountry] = useState("");
  const [prevDegree, setPrevDegree] = useState("");
  const [prevCourse, setPrevCourse] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [budget, setBudget] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<UniversityRecommendation[]>([]);
  const [availableOptions, setAvailableOptions] = useState<AvailableOptions>({
    programs: [],
    countries: [],
    previous_degrees: [],
    previous_courses: []
  });
  const [error, setError] = useState("");

  // Static degree levels since they're not in the API response
  const degreeLevels = ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'];

  // Ref for the recommendations section
  const recommendationsRef = useRef<HTMLDivElement>(null);

  // Load available options on component mount
  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    try {
      setError("");
      const options = await apiService.getAvailableOptions();
      setAvailableOptions(options);
    } catch (error: any) {
      logger.error('Failed to load available options:', error);
      setError(error.message || 'Failed to load available options. Please try again.');
    }
  };

  // Auto-scroll to recommendations when they are loaded
  useEffect(() => {
    if (submitted && recommendations.length > 0 && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [submitted, recommendations]);

  const handleSubmit = async () => {
    if (!degree || !course || !country) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert form data to API preferences format
      const preferences: UserPreferences = {
        desired_program: course,
        program_level: degree,
        program_type: degree,
        preferred_countries: [country],
        max_tuition_usd: budget ? parseFloat(budget) : undefined,
        gpa: cgpa ? parseFloat(cgpa) : undefined,
        additional_preferences: `Previous degree: ${prevDegree} in ${prevCourse}`
      };

      const results = await apiService.getRecommendations(preferences);
      setRecommendations(results.recommendations);
      setSubmitted(true);
      
      // Log submission details for monitoring
      logger.info('Search completed:', {
        duration: results.search_duration_ms,
        submissionId: results.submission_id,
        recommendationsCount: results.recommendations.length
      });
    } catch (error: any) {
      logger.error('Error getting recommendations:', error);
      setError(error.message || 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-sora font-bold text-[#1E293B] mb-6">
                Tell us about your preferences
              </h2>

              <div className="space-y-6">
                {/* Degree Level */}
                <div>
                  <label className="block text-sm font-sora font-medium text-[#374151] mb-2">
                    What degree level are you looking for? *
                  </label>
                  <div className={dropdownClasses}>
                    <FiBook className="text-[#6B7280]" />
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className={selectClasses}
                    >
                      <option value="">Select degree level</option>
                      {degreeLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <IoIosArrowDown className="text-[#6B7280] absolute right-3" />
                  </div>
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-sora font-medium text-[#374151] mb-2">
                    What course are you interested in? *
                  </label>
                  <SearchableDropdown
                    options={availableOptions.programs}
                    value={course}
                    onChange={setCourse}
                    placeholder="Search for a course..."
                    disabled={availableOptions.programs.length === 0}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-sora font-medium text-[#374151] mb-2">
                    Which country would you prefer? *
                  </label>
                  <SearchableDropdown
                    options={availableOptions.countries}
                    value={country}
                    onChange={setCountry}
                    placeholder="Search for a country..."
                    disabled={availableOptions.countries.length === 0}
                  />
                </div>

                {/* Previous Degree */}
                <div>
                  <label className="block text-sm font-sora font-medium text-[#374151] mb-2">
                    What was your previous degree?
                  </label>
                  <SearchableDropdown
                    options={availableOptions.previous_degrees}
                    value={prevDegree}
                    onChange={setPrevDegree}
                    placeholder="Search for a degree..."
                    disabled={availableOptions.previous_degrees.length === 0}
                  />
                </div>

                {/* Previous Course */}
                <div>
                  <label className="block text-sm font-sora font-medium text-[#374151] mb-2">
                    What was your previous course?
                  </label>
                  <SearchableDropdown
                    options={availableOptions.previous_courses}
                    value={prevCourse}
                    onChange={setPrevCourse}
                    placeholder="Search for a course..."
                    disabled={availableOptions.previous_courses.length === 0}
                  />
                </div>

                {/* CGPA */}
                <div>
                  <label className="block text-sm font-sora font-medium text-[#374151] mb-2">
                    What is your CGPA?
                  </label>
                  <div className={dropdownClasses}>
                    <GiGraduateCap className="text-[#6B7280]" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="Enter your CGPA (0-4)"
                      className="w-full bg-transparent text-sm text-[#1E293B] font-sora-regular outline-none"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-sora font-medium text-[#374151] mb-2">
                    What is your budget (USD)?
                  </label>
                  <div className={dropdownClasses}>
                    <GiCash className="text-[#6B7280]" />
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Enter your budget in USD"
                      className="w-full bg-transparent text-sm text-[#1E293B] font-sora-regular outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`mt-6 w-full py-3 rounded-full font-medium transition-all cursor-pointer ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
                  }`}
                >
                  {loading ? 'Finding Universities...' : 'Find Universities'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="hidden md:flex w-full md:w-1/2 justify-center items-center">
            <img
              src="/High-School-bro.png"
              alt="Illustration"
              className="max-w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Recommendations Section */}
        {submitted && recommendations.length > 0 && (
          <div ref={recommendationsRef} className="mt-12">
            <h3 className="text-2xl font-sora font-bold text-[#1E293B] mb-6">
              Recommended Universities
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-sora font-semibold text-[#1E293B] text-lg">
                      {recommendation.university_name}
                    </h4>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {recommendation.match_percentage.toFixed(1)}% Match
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-[#64748B]">
                    <p><span className="font-medium">Program:</span> {recommendation.program_name || recommendation.course_name || recommendation.parent_course || 'Not specified'}</p>
                    <p><span className="font-medium">Country:</span> {recommendation.country}</p>
                    {recommendation.tuition_fee_usd && (
                      <p><span className="font-medium">Tuition:</span> ${recommendation.tuition_fee_usd.toLocaleString()}</p>
                    )}
                    {recommendation.global_rank && (
                      <p><span className="font-medium">Global Rank:</span> #{recommendation.global_rank}</p>
                    )}
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                    <p className="font-medium text-[#374151] mb-1">Why this university?</p>
                    <p className="text-[#64748B]">{recommendation.reasoning || 'This university matches your preferences based on program, location, and cost factors.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TellUs;
