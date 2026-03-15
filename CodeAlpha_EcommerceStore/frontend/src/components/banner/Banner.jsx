import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
const Banner = () => {
  return (
    <motion.div
      className="bg-[#E6E9F2] max-w-5xl mx-auto md:mx-auto flex flex-col md:flex-row items-center justify-between py-14 md:py-0 md:pl-20 my-16 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <img
        src={`${import.meta.env.VITE_API_URL}/uploads/jbl_soundbox_image.png`}
        alt="jbl_soundbox_image"
        className="max-w-56"
      />

      <div className="flex flex-col items-center justify-center text-center space-y-2 px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-semibold max-w-[290px]">
          Level Up Your Gaming Experience
        </h2>
        <p className="max-w-[343px] font-medium text-gray-800/60">
          From immersive sound to precise controls—everything you need to win
        </p>
        <div className="group flex items-center justify-center gap-1 px-12 py-2.5 bg-blue-600 hover:bg-blue-700 rounded text-white">
          Buy Now
          <button className="group-hover:translate-x-1 transition">
            <ArrowRight />
          </button>
        </div>
      </div>

      <img
        src={`${import.meta.env.VITE_API_URL}/uploads/md_controller_image.png`}
        alt="md_controller_image"
        className="hidden md:block max-w-80"
      />
      <img
        src={`${import.meta.env.VITE_API_URL}/uploads/sm_controller_image.png`}
        alt="sm_controller_image"
        className="md:hidden"
      />
    </motion.div>
  );
};

export default Banner;
