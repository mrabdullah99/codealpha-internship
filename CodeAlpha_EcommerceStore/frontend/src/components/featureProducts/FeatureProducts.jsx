import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const products = [
  {
    id: 1,
    image: `${import.meta.env.VITE_API_URL}/uploads/boy_with_laptop_image.png`,
    title: "Unparalleled Sound",
    description: "Experience crystal-clear audio with premium headphones.",
  },
  {
    id: 2,
    image: `${import.meta.env.VITE_API_URL}/uploads/boy_with_earphone_image.jpg`,
    title: "Stay Connected",
    description: "Compact and stylish earphones for every occasion.",
  },
  {
    id: 3,
    image: `${import.meta.env.VITE_API_URL}/uploads/boy_with_headphone_image.jpg`,
    title: "Power in Every Pixel",
    description: "Shop the latest laptops for work, gaming, and more.",
  },
];
const FeatureProducts = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-5xl mx-auto mt-15 mb-5">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Featured Products</p>
        <div className="w-28 h-0.5 bg-blue-600 mt-2"></div>
      </div>

      <div className=" md:mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-14 mt-12 px-4 md:px-14">
        {products.map(({ id, image, title, description }, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div key={id} className="relative group">
              <img
                src={image}
                alt={title}
                className="group-hover:brightness-75 transition duration-300 w-full h-100 md:h-84  object-cover"
              />
              <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-5 left-5 text-white space-y-2">
                <p className="text-xl md:text-2xl font-medium">{title}</p>
                <p className="text-sm md:text-base max-w-50 leading-5">
                  {description}
                </p>
                <button
                  onClick={() => navigate(`/product/${id}`)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                >
                  Buy Now
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureProducts;
