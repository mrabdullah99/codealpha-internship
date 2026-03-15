import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../../pages/productCard/ProductCard";

const HomeProducts = () => {
  const navigate = useNavigate();

  const products = useSelector((state) => state.products.list);

  return (
    <div className="max-w-5xl md:mx-auto flex flex-col pt-14">
      <p className="text-3xl font-medium">Popular products</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-center gap-6 mt-6 pb-14 w-full">
        {Array.isArray(products) &&
          products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
      </div>

      <button
        onClick={() => navigate("/all-products")}
        className="hover:bg-slate-50/90 text-gray-500/70 self-center px-12 py-2.5 border rounded transition"
      >
        See more
      </button>
    </div>
  );
};
export default HomeProducts;
