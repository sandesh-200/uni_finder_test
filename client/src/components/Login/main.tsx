import { MdOutlineMailOutline } from "react-icons/md";
import { FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

const LoginMain = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Get the intended destination from location state, or default to homepage
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(email, password);
            console.log("Login successful");
            
            // Redirect to intended destination or homepage
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
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
                                onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 py-2 px-4 rounded-lg font-sora-regular focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your Email"
                                required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="flex gap-2 items-center text-gray-700">
                            <FaRegEyeSlash size={20} />
                            <span className="text-base font-sora-semi-bold">Password</span>
                        </label>
                        <input
                            type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 py-2 px-4 rounded-lg font-sora-regular focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                                required
                        />
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