import { Link, useNavigate, useLocation } from "react-router"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleFindUniversity = () => {
        if (user) {
            navigate("/finduniversity");
        } else {
            navigate("/login", { state: { from: { pathname: "/finduniversity" } } });
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="sticky top-0 z-50 flex justify-between px-8 py-4 bg-white items-center shadow-sm border-b border-gray-200">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">U</span>
                </div>
                <span className="text-xl font-bold text-gray-900">UniFinder</span>
            </div>
            <div className="flex items-center justify-center gap-4">
                <Link 
                    to="/" 
                    className={`transition-colors ${
                        isActive('/') 
                            ? 'text-blue-600 font-medium' 
                            : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                    Home
                </Link>
                <button 
                    onClick={handleFindUniversity}
                    className={`transition-colors cursor-pointer ${
                        isActive('/finduniversity') 
                            ? 'text-blue-600 font-medium' 
                            : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                    Find University
                </button>
                <Link 
                    to="/about" 
                    className={`transition-colors ${
                        isActive('/about') 
                            ? 'text-blue-600 font-medium' 
                            : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                    About Us
                </Link>
                <Link 
                    to="/contact" 
                    className={`transition-colors ${
                        isActive('/contact') 
                            ? 'text-blue-600 font-medium' 
                            : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                    Contact Us
                </Link>
            </div>
            <div className="flex items-center gap-4">
                {!loading && (
                    <>
                        {user ? (
                            <>
                                <span className="text-sm text-gray-600">
                                    Welcome, {user.first_name}!
                                </span>
                                <button 
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link 
                                to="/login" 
                                className="bg-blue-200 text-white hover:bg-blue-400 cursor-pointer px-5 py-2 rounded-full"
                            >
                    Login
                            </Link>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Navbar