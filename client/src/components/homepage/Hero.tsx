import { GiGraduateCap } from "react-icons/gi";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

const Hero = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (user) {
            // User is authenticated, go to university search
            navigate("/finduniversity");
        } else {
            // User is not authenticated, go to login
            navigate("/login", { state: { from: { pathname: "/finduniversity" } } });
        }
    };

    return (
        <div className="flex flex-col sm:flex-col justify-center md:flex-row p-8 sm:w-full gap-8 items-center bg-[#F9FAFB] place-items-center">
            <div className="flex flex-col gap-5 w-full">
                <div className="flex items-center gap-3 justify-center sm:justify-center md:justify-start">
                    <GiGraduateCap size={30} className="text-[#1E293B]" />
                    <h1 className="font-sora text-xl sm:text-xl md:text-2xl text-[#1E293B] font-semibold">
                        Find your Perfect University with AI
                    </h1>
                </div>
                <p className="font-sora text-[#64748B] text-md text-center sm:text-center md:text-start">
                    Answer a few questions and let our smart system match
                    you with the best universities for your goals, budget, and location.
                </p>
                <div className="flex items-center justify-center sm:justify-center md:justify-start">
                    <button 
                        onClick={handleGetStarted}
                        disabled={loading}
                        className={`px-5 py-3 w-fit rounded-full font-sora font-semibold text-sm transition-colors cursor-pointer ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                                : 'bg-[#F59E0B] text-[#0F172A] hover:bg-[#B45309]'
                        }`}
                    >
                        {loading ? 'Loading...' : user ? 'Start Searching' : 'Get Started'}
                    </button>
                </div>
            </div>

            <div className="w-full flex justify-center">
                <img src='./High-School-bro.png' alt="High school students illustration" className="w-2/3" />
            </div>
        </div>
    );
};

export default Hero;