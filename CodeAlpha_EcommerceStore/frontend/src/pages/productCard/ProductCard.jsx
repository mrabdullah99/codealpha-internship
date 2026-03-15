import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Star, StarOff, Heart } from "lucide-react";
import { useEffect, useState } from "react";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [heart, setHeart] = useState(false);
  const currency = useSelector((state) => state.app.currency || "$");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [redirectOrder, setRedirectOrder] = useState(false);
  const isLoggedIn = useSelector((state) => !!state.auth.user);

  useEffect(() => {
    if (redirectOrder) {
      const timer = setTimeout(() => {
        navigate("/checkout");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [redirectOrder, navigate]);
  return (
    <div className=" flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer">
      {message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 transition-all duration-300 ${
            messageType === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message}
        </div>
      )}
      {/* Product Image */}
      <div className=" cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
        <img
          onClick={() => {
            navigate(`/product/${product._id}`);
            window.scrollTo(0, 0);
          }}
          src={product.images[0]}
          alt={product.name}
          className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
        />

        <button
          className={`absolute top-2 right-2  p-2 rounded-full shadow-md`}
        >
          <Heart
            onClick={() => setHeart((prev) => !prev)}
            className={`h-6 w-6 cursor-pointer transition-all duration-300 ease-in-out ${
              heart
                ? "scale-110 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                : "text-gray-400 hover:text-gray-600 hover:scale-105"
            }`}
            fill={heart ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={heart ? 0 : 2}
          />
        </button>
      </div>

      {/* Product Info */}
      <p className="md:text-base font-medium pt-2 w-full truncate">
        {product.name}
      </p>
      <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
        {product.description}
      </p>

      {/* Rating Section */}
      <div className="flex items-center gap-2">
        <p className="text-xs">4.5</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className="h-3 w-3 text-yellow-500">
              {index < 4 ? <Star size={12} /> : <StarOff size={12} />}
            </span>
          ))}
        </div>
      </div>

      {/* Price and Button */}
      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-base font-medium">
          {currency}
          {product.offerPrice}
        </p>
        <button
          onClick={() => {
            if (isLoggedIn) {
              setMessageType("success");
              setMessage(`Processing`);
              setRedirectOrder(true);
            } else {
              setMessageType("error");
              setMessage("Please login First");
              setTimeout(() => setMessage(""), 2000);
            }
          }}
          className="max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition"
        >
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
