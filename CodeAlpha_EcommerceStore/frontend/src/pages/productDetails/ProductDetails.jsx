import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addToCartLocal, addToCartDB } from "../../redux/slices/cartSlice";

const ProductDetails = () => {
  const [mainImage, setMainImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [redirectOrder, setRedirectOrder] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => !!state.auth.user);
  const products = useSelector((state) => state.products.list);
  const product = products.find((p) => p._id === id);

  useEffect(() => {
    if (product?.image?.length) {
      setMainImage(product.image[0]);
    }
    if (redirectOrder) {
      const timer = setTimeout(() => {
        navigate("/checkout");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [product, redirectOrder, navigate]);

  if (!products.length) {
    return <p className="text-center py-20">Loading...</p>;
  }

  if (!product)
    return (
      <p className="text-center py-20 text-4xl font-semibold">
        Product not found.
      </p>
    );

  return (
    <>
      <div className="px-6 md:px-16 lg:px-32 mt-17 space-y-10">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* LEFT SIDE - IMAGES */}
          <div className="px-5 md:px-16 lg:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(img)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${product.images[0]}`}
                    alt=""
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - PRODUCT DETAILS */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800 mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 mt-3">{product.description}</p>

            <p className="text-3xl font-medium mt-6">
              ${product.offerPrice}
              <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                ${product.price}
              </span>
            </p>

            <hr className="my-6" />

            <table className="table-auto max-w-72">
              <tbody>
                <tr>
                  <td className="font-medium text-gray-600">Brand</td>
                  <td className="text-gray-700">Generic</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-600">Color</td>
                  <td className="text-gray-700">Multi</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-600">Category</td>
                  <td className="text-gray-700">{product.category}</td>
                </tr>
              </tbody>
            </table>

            {/* BUTTONS */}
            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={async () => {
                  if (isLoggedIn) {
                    try {
                      await dispatch(
                        addToCartDB({
                          productId: product._id,
                          quantity: 1,
                        }),
                      ).unwrap();
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 2000);
                    } catch (error) {
                      console.error("Failed to add to cart:", error);
                    }
                  } else {
                    dispatch(addToCartLocal(product._id));
                  }
                  navigate("/cart");
                }}
                className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>

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
                className="w-full py-3.5 bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
