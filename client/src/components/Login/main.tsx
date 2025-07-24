import { MdOutlineMailOutline } from "react-icons/md";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

const LoginMain = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Get the intended destination from location state, or default to homepage
    const from = location.state?.from?.pathname || "/";

    const clearErrors = () => {
        setError("");
        setFieldErrors({});
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        // Email validation
        if (!email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address";
        }
        
        // Password validation
        if (!password) {
            errors.password = "Password is required";
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await login(email.trim(), password);
            console.log("Login successful");
            
            // Redirect to intended destination or homepage
            navigate(from, { replace: true });
        } catch (err: any) {
            // Handle field-specific errors from backend
            if (err.message && err.message.includes('email')) {
                setFieldErrors({ email: err.message });
            } else if (err.message && err.message.includes('password')) {
                setFieldErrors({ password: err.message });
            } else {
            setError(err.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: 'email' | 'password', value: string) => {
        if (field === 'email') {
            setEmail(value);
        } else {
            setPassword(value);
        }
        
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
        }
        
        // Clear general error when user starts typing
        if (error) {
            setError("");
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br items-center justify-center from-blue-100 to-purple-200">
            {/* Left Side: Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl p-8 space-y-6 border border-white/30">
                    <h1 className="text-3xl font-sora-semi-bold text-center text-gray-800">
                        Login to your Account
                    </h1>

                    {from !== "/" && (
                        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                            Please login to access the requested page.
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="flex gap-2 items-center text-gray-700">
                            <MdOutlineMailOutline size={20} />
                            <span className="text-base font-sora-semi-bold">Email</span>
                        </label>
                        <input
                            type="email"
                                id="email"
                                value={email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full border py-2 px-4 rounded-lg font-sora-regular focus:outline-none focus:ring-2 transition-colors ${
                                    fieldErrors.email 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder="Enter your Email"
                                required
                                disabled={loading}
                        />
                            {fieldErrors.email && (
                                <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                            )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="flex gap-2 items-center text-gray-700">
                            <FaRegEyeSlash size={20} />
                            <span className="text-base font-sora-semi-bold">Password</span>
                        </label>
                            <div className="relative">
                        <input
                                    type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`w-full border py-2 px-4 pr-10 rounded-lg font-sora-regular focus:outline-none focus:ring-2 transition-colors ${
                                        fieldErrors.password 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500'
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
                            {fieldErrors.password && (
                                <p className="text-red-500 text-sm">{fieldErrors.password}</p>
                            )}
                    </div>

                    {/* Login Button */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded-lg font-sora-semi-bold transition duration-300 shadow-md ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                    </button>
                    </form>

                    {/* Register Redirect */}
                    <p className="text-center text-sm font-sora-regular text-gray-600">
                        Don't have an account?{" "}
                        <a href="/register" className="text-blue-600 hover:underline font-sora-semi-bold">
                            Register
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginMain;