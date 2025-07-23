import { FaRegUser, FaRegEyeSlash } from "react-icons/fa6";
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
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleInputChange = (field: keyof RegisterData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validate passwords match
        if (formData.password !== formData.confirm_password) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        // Validate terms acceptance
        if (!formData.terms_accepted) {
            setError("You must accept the terms and conditions");
            setLoading(false);
            return;
        }

        try {
            await register(formData);
            console.log("Registration successful");
            
            // Redirect to homepage or dashboard
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

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
                        className="border w-full py-2 px-4 rounded-lg"
                        placeholder="Enter your first name"
                            required
                    />
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
                        className="border w-full py-2 px-4 rounded-lg"
                        placeholder="Enter your last name"
                            required
                    />
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
                        className="border w-full py-2 px-4 rounded-lg"
                        placeholder="Enter your email"
                            required
                    />
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
                        className="border w-full py-2 px-4 rounded-lg"
                        placeholder="Enter your phone number"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center gap-2">
                        <FaRegEyeSlash size={20} />
                        <span className="text-lg font-semibold">Password</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                        className="border w-full py-2 px-4 rounded-lg"
                        placeholder="Enter your password"
                            required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <FaRegEyeSlash size={20} />
                        <span className="text-lg font-semibold">Confirm Password</span>
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                            value={formData.confirm_password}
                            onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                        className="border w-full py-2 px-4 rounded-lg"
                        placeholder="Re-type your password"
                            required
                    />
                </div>
             
                <div className="flex items-start gap-2">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={formData.terms_accepted}
                            onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
                            className="mt-1" 
                        />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the <span className="text-blue-600 underline cursor-pointer">Terms and Conditions</span> and <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
                    </label>
                </div>

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