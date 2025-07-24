import { FaRegUser, FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { MdOutlineMailOutline, MdOutlineLocalPhone } from "react-icons/md";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import type { RegisterData } from "../../services/authService";

const RegisterMain = () => {
    const [formData, setFormData] = useState<RegisterData>({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
        terms_accepted: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const clearErrors = () => {
        setError("");
        setFieldErrors({});
    };

    const validatePassword = (password: string) => {
        const errors: string[] = [];
        
        if (password.length < 8) {
            errors.push("At least 8 characters");
        }
        if (!/\d/.test(password)) {
            errors.push("At least one number");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("At least one lowercase letter");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("At least one uppercase letter");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push("At least one special character");
        }
        
        return errors;
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, color: "gray", text: "" };
        
        const errors = validatePassword(password);
        const strength = Math.max(0, 5 - errors.length);
        
        if (strength <= 1) return { strength, color: "red", text: "Very Weak" };
        if (strength <= 2) return { strength, color: "orange", text: "Weak" };
        if (strength <= 3) return { strength, color: "yellow", text: "Fair" };
        if (strength <= 4) return { strength, color: "lightgreen", text: "Good" };
        return { strength, color: "green", text: "Strong" };
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        // First name validation
        if (!formData.first_name.trim()) {
            errors.first_name = "First name is required";
        } else if (formData.first_name.trim().length < 2) {
            errors.first_name = "First name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(formData.first_name.trim())) {
            errors.first_name = "First name can only contain letters and spaces";
        }
        
        // Last name validation
        if (!formData.last_name.trim()) {
            errors.last_name = "Last name is required";
        } else if (formData.last_name.trim().length < 2) {
            errors.last_name = "Last name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(formData.last_name.trim())) {
            errors.last_name = "Last name can only contain letters and spaces";
        }
        
        // Email validation
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = "Please enter a valid email address";
        }
        
        // Phone number validation (optional)
        if (formData.phone_number && !/^\+?1?\d{9,15}$/.test(formData.phone_number.replace(/[^\d+]/g, ''))) {
            errors.phone_number = "Please enter a valid phone number";
        }
        
        // Password validation
        if (!formData.password) {
            errors.password = "Password is required";
        } else {
            const passwordErrors = validatePassword(formData.password);
            if (passwordErrors.length > 0) {
                errors.password = `Password must have: ${passwordErrors.join(', ')}`;
            }
        }
        
        // Confirm password validation
        if (!formData.confirm_password) {
            errors.confirm_password = "Please confirm your password";
        } else if (formData.password !== formData.confirm_password) {
            errors.confirm_password = "Passwords don't match";
        }
        
        // Terms validation
        if (!formData.terms_accepted) {
            errors.terms_accepted = "You must accept the terms and conditions";
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof RegisterData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear field error when user starts typing
        if (fieldErrors[field as string]) {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
        }
        
        // Clear general error when user starts typing
        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await register(formData);
            console.log("Registration successful");
            
            // Redirect to homepage or dashboard
            navigate("/");
        } catch (err: any) {
            // Handle field-specific errors from backend
            if (err.message) {
                // Check if it's a field-specific error
                const fieldMatch = err.message.match(/(\w+):\s*(.+)/);
                if (fieldMatch) {
                    const [, field, message] = fieldMatch;
                    setFieldErrors({ [field]: message });
                } else {
            setError(err.message || "Registration failed");
                }
            } else {
                setError("Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="bg-gradient-to-br from-blue-100 to-purple-200 p-8 md:p-20 flex flex-col md:flex-row items-center justify-center w-full gap-8 min-h-screen">
            <div className="w-full md:w-1/2 space-y-6 shadow-lg rounded-xl p-4 bg-white/70 backdrop-blur-lg">
                <h1 className="text-center font-sora-semi-bold text-3xl">Register Your Account</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="firstName" className="flex items-center gap-2">
                        <FaRegUser size={20} />
                        <span className="text-lg font-semibold">First Name</span>
                    </label>
                    <input
                        type="text"
                        id="firstName"
                            value={formData.first_name}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            className={`border w-full py-2 px-4 rounded-lg ${
                                fieldErrors.first_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter your first name"
                            required
                            disabled={loading}
                    />
                        {fieldErrors.first_name && (
                            <p className="text-red-500 text-sm">{fieldErrors.first_name}</p>
                        )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="lastName" className="flex items-center gap-2">
                        <FaRegUser size={20} />
                        <span className="text-lg font-semibold">Last Name</span>
                    </label>
                    <input
                        type="text"
                        id="lastName"
                            value={formData.last_name}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            className={`border w-full py-2 px-4 rounded-lg ${
                                fieldErrors.last_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter your last name"
                            required
                            disabled={loading}
                    />
                        {fieldErrors.last_name && (
                            <p className="text-red-500 text-sm">{fieldErrors.last_name}</p>
                        )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2">
                        <MdOutlineMailOutline size={20} />
                        <span className="text-lg font-semibold">Email</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`border w-full py-2 px-4 rounded-lg ${
                                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter your email"
                            required
                            disabled={loading}
                    />
                        {fieldErrors.email && (
                            <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                        )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center gap-2">
                        <MdOutlineLocalPhone size={20} />
                        <span className="text-lg font-semibold">Phone Number</span>
                        <span className="text-sm text-gray-500">(Optional)</span>
                    </label>
                    <input
                        type="tel"
                        id="phone"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            className={`border w-full py-2 px-4 rounded-lg ${
                                fieldErrors.phone_number ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter your phone number"
                            disabled={loading}
                    />
                        {fieldErrors.phone_number && (
                            <p className="text-red-500 text-sm">{fieldErrors.phone_number}</p>
                        )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center gap-2">
                        <FaRegEyeSlash size={20} />
                        <span className="text-lg font-semibold">Password</span>
                    </label>
                        <div className="relative">
                    <input
                                type={showPassword ? "text" : "password"}
                        id="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`border w-full py-2 px-4 pr-10 rounded-lg ${
                                    fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                        placeholder="Enter your password"
                            required
                                disabled={loading}
                    />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={loading}
                            >
                                {showPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="space-y-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-2 flex-1 rounded ${
                                                level <= passwordStrength.strength
                                                    ? `bg-${passwordStrength.color}`
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-sm ${passwordStrength.color === 'gray' ? 'text-gray-500' : `text-${passwordStrength.color}`}`}>
                                    {passwordStrength.text}
                                </p>
                            </div>
                        )}
                        {fieldErrors.password && (
                            <p className="text-red-500 text-sm">{fieldErrors.password}</p>
                        )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <FaRegEyeSlash size={20} />
                        <span className="text-lg font-semibold">Confirm Password</span>
                    </label>
                        <div className="relative">
                    <input
                                type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                            value={formData.confirm_password}
                            onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                                className={`border w-full py-2 px-4 pr-10 rounded-lg ${
                                    fieldErrors.confirm_password ? 'border-red-500' : 'border-gray-300'
                                }`}
                        placeholder="Re-type your password"
                            required
                                disabled={loading}
                    />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={loading}
                            >
                                {showConfirmPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
                            </button>
                        </div>
                        {fieldErrors.confirm_password && (
                            <p className="text-red-500 text-sm">{fieldErrors.confirm_password}</p>
                        )}
                </div>
             
                <div className="flex items-start gap-2">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={formData.terms_accepted}
                            onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
                            className="mt-1" 
                            disabled={loading}
                        />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the <span className="text-blue-600 underline cursor-pointer">Terms and Conditions</span> and <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
                    </label>
                </div>
                    {fieldErrors.terms_accepted && (
                        <p className="text-red-500 text-sm">{fieldErrors.terms_accepted}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`cursor-pointer w-full py-3 rounded-lg font-semibold transition ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Login
                    </a>
                </p>
            </div>

            {/* Image Section */}
            <div className="w-full md:w-1/2">
                <img src="./signup.png" alt="Signup illustration" className="w-full h-auto object-contain" />
            </div>
        </div>
    );
};

export default RegisterMain;