import { useState, useEffect } from "react";
import { ShoppingBag, Clock, Truck, CheckCircle } from "lucide-react";
import api from "../../api/axiosConfig";

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const transformedOrders = data.orders.map((order) => ({
          orderId: order._id,
          customerName: order.user.name,
          datePlaced: order.createdAt,
          totalAmount: order.totalPrice,
          status: order.orderStatus,
        }));
        setOrders(transformedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      Pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      Shipped: { bg: "bg-blue-100", text: "text-blue-700", icon: Truck },
      Delivered: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
    };
    const { bg, text, icon: Icon } = styles[status] || styles.Pending;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${bg} ${text}`}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const markAsDelivered = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/orders/${orderId}/deliver`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: "Delivered" } : o,
        ),
      );
    } catch (error) {
      console.error("Failed to mark delivered", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const shippedOrders = orders.filter((o) => o.status === "Shipped").length;

  if (loading)
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage customer orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Pending / Shipped</p>
          <p className="text-2xl font-bold text-gray-800">
            {pendingOrders} / {shippedOrders}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800">No orders yet</h3>
          <p className="text-gray-500 mt-1">
            Orders will appear here when customers make purchases
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date Placed
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">
                        {order.orderId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(order.datePlaced)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    {/* {order.status === "Paid" && ( */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => markAsDelivered(order.orderId)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                      >
                        Mark as Delivered
                      </button>
                    </td>
                    {/* )} */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
