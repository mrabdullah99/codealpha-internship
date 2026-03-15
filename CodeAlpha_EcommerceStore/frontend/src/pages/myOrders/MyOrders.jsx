import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axiosConfig.js";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  Truck,
  ShoppingBag,
} from "lucide-react";

const MyOrders = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user || {});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get("/orders/myorders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (error) {
      console.error(
        "Failed to fetch orders:",
        error.response?.data || error.message,
      );
      alert(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (sessionId) {
        const token = localStorage.getItem("token");
        try {
          await api.post(
            "/stripe/verify-payment",
            { sessionId },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } catch (err) {
          console.error("Verification error:", err);
        }
        window.history.replaceState({}, "", "/myorders");
      }
    };

    verifyPayment();
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      Pending:
        "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200",
      Paid: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200",
      Delivered:
        "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200",
    };

    const icons = {
      Pending: <Clock size={14} className="inline mr-1" />,
      Paid: <CreditCard size={14} className="inline mr-1" />,
      Delivered: <Truck size={14} className="inline mr-1" />,
    };

    return (
      <span
        className={`px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center shadow-sm ${styles[status]}`}
      >
        {icons[status]}
        {status}
      </span>
    );
  };

  const handlePayNow = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in");

    try {
      const { data } = await api.post(
        "/stripe/create-checkout-session",
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to initiate payment");
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <ShoppingBag className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              My Orders
            </h1>
          </div>
          <p className="text-gray-600 ml-16">
            Track and manage your order history
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading your orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
              <Package className="text-gray-400" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Order ID
                      </p>
                      <p className="text-lg font-bold text-gray-800 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500 font-medium">
                        Order Date
                      </p>
                      <p className="text-gray-700 font-semibold">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Price Section */}
                    <div className="flex-shrink-0">
                      <p className="text-sm text-gray-500 font-medium mb-1">
                        Total Amount
                      </p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 lg:justify-center">
                      <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
                        {order.isPaid ? (
                          <CheckCircle className="text-emerald-500" size={20} />
                        ) : (
                          <XCircle className="text-rose-400" size={20} />
                        )}
                        <span className="text-sm font-semibold text-gray-700">
                          Payment {order.isPaid ? "Completed" : "Pending"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
                        {order.isDelivered ? (
                          <CheckCircle className="text-emerald-500" size={20} />
                        ) : (
                          <XCircle className="text-rose-400" size={20} />
                        )}
                        <span className="text-sm font-semibold text-gray-700">
                          {order.isDelivered ? "Delivered" : "In Transit"}
                        </span>
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                      <div>{getStatusBadge(order.orderStatus)}</div>

                      {!order.isPaid ? (
                        <button
                          onClick={() => handlePayNow(order._id)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                          <CreditCard size={18} />
                          <span>Pay Now</span>
                        </button>
                      ) : (
                        <div className="px-6 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
                          <span className="text-emerald-700 font-semibold flex items-center gap-2">
                            <CheckCircle size={18} />
                            Paid
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
