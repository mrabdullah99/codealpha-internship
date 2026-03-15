import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Package, Truck, CreditCard } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosConfig.js";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-colors ${
        error
          ? "border-red-400 focus:ring-2 focus:ring-red-200"
          : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const BuyNowPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products?.list || []);
  const cartItems = useSelector((state) => state.cart?.cartItems || {});
  const user = useSelector((state) => state.auth?.user || {});

  const cartItemsArray = Object.keys(cartItems)
    .map((itemId) => {
      const product = products.find((p) => p._id === itemId);
      if (!product) return null;
      return {
        ...product,
        quantity: cartItems[itemId],
      };
    })
    .filter(Boolean);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    street: "",
    city: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [redirectOrder, setRedirectOrder] = useState(false);

  const subtotal = cartItemsArray.reduce(
    (sum, item) => sum + (item.offerPrice || item.price) * item.quantity,
    0,
  );
  const shippingCost = 10.0;
  const taxRate = 0.05;
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + shippingCost + tax;

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
    }
    if (redirectOrder) {
      const timer = setTimeout(() => {
        navigate("/myorders");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, redirectOrder, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.street.trim())
      newErrors.street = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "Postal code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        products: cartItemsArray.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          address: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: "Pakistan",
        },
        paymentMethod: "COD",
        totalPrice: grandTotal,
      };

      const { data } = await axios.post("/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessageType("success");
      setMessage(`Order placed successfully! Order ID: ${data._id}`);
      setRedirectOrder(true);
    } catch (error) {
      console.error("Order error:", error);
      setMessageType("error");
      setMessage("Insufficient stock for this order");
      setTimeout(() => setMessage(""), 2000);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column */}
            <div className="md:w-[70%] space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Order Items
                </h2>
                <div className="flex flex-col gap-4">
                  {cartItemsArray.map((product, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {product.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.brand} • {product.color}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-gray-800">
                            ${product.offerPrice}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ${product.price}
                          </span>
                          <span className="text-sm text-gray-500 ml-auto">
                            Quantity: {product.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-blue-600" />
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                  <div className="md:col-span-2">
                    <InputField
                      label="Street Address"
                      name="street"
                      placeholder="123 Main Street"
                      value={formData.street}
                      onChange={handleChange}
                      error={errors.street}
                    />
                  </div>
                  <InputField
                    label="City"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                  />
                  <InputField
                    label="Postal Code"
                    name="postalCode"
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={handleChange}
                    error={errors.postalCode}
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-600" />
                  Payment Method
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  <p className="font-medium mb-1">Cash on Delivery</p>
                  <p>You can pay when the order is delivered.</p>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:w-[30%]">
              <div className="bg-white rounded-xl shadow-sm p-6 md:sticky md:top-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItemsArray.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (5%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Grand Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock size={18} />
                  {loading ? "Processing..." : "Place Order"}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span>Your order information is secure</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyNowPage;
