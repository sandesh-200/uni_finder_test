import { FaGlobe } from "react-icons/fa"


const Main = () => {
    return (
        <div className="flex items-center justify-center bg-[#F3F4F6] p-8">
            <div className="border p-4 grid gird-cols-1 sm:grid-cols-1 md:grid-cols-2 w-1/2 gap-3 ">
                <div className="p-4 border">
                    <div className="flex flex-col gap-3 bg-white p-4">
                        <div className="flex items-center gap-2">
                            <FaGlobe size={20} />
                            <h1 className="font-sora-semi-bold text-xl">Country</h1>
                        </div>
                        <p>Type the country you want to study </p>

                    </div>
                </div>
                <div className="border p-4">
                    <img src="./High-School-bro.png" alt="" />
                </div>
            </div>

        </div>

    )
}
export default Main