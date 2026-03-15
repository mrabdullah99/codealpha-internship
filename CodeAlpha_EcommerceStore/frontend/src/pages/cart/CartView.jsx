import { useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCartQuantity,
  fetchCartFromDB,
  updateCartQuantityDB,
} from "../../redux/slices/cartSlice";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const itemTotal = (item.offerPrice || item.price) * item.quantity;

  return (
    <div className="rounded-xl shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.images?.[0] || ""}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {item.brand} • {item.color}
          </p>
          <p className="text-lg font-bold text-gray-800 mt-2">
            ${(item.offerPrice || item.price).toFixed(2)}
          </p>
        </div>

        {/* Quantity Controls - Mobile/Desktop */}
        <div className="flex items-center justify-between md:justify-start md:gap-8 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Qty:</span>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
              <button
                onClick={() =>
                  onUpdateQuantity(item._id, Math.max(1, item.quantity - 1))
                }
                disabled={item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-800">
                ${itemTotal.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => onRemove(item._id)}
              className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              aria-label="Remove item"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartView = () => {
  const cartItems = useSelector((state) => state.cart?.cartItems || {});
  const products = useSelector((state) => state.products?.list || []);
  const isLoggedIn = useSelector((state) => !!state.auth.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(isLoggedIn);
    if (isLoggedIn) {
      dispatch(fetchCartFromDB());
    } else {
    }
  }, [isLoggedIn, dispatch]);

  const cartItemsArray = Object.keys(cartItems)
    .map((itemId) => {
      const product = products.find((p) => p._id === itemId);
      if (!product) {
        console.warn(`Product with ID ${itemId} not found`);
        return null;
      }

      return {
        ...product,
        quantity: cartItems[itemId],
      };
    })
    .filter(Boolean);

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (isLoggedIn) {
      await dispatch(
        updateCartQuantityDB({ productId: id, quantity: newQuantity }),
      );
    } else {
      dispatch(updateCartQuantity({ itemId: id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = async (id) => {
    if (isLoggedIn) {
      await dispatch(updateCartQuantityDB({ productId: id, quantity: 0 }));
    } else {
      await dispatch(updateCartQuantity({ itemId: id, quantity: 0 }));
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/all-products");
  };

  const subtotal = cartItemsArray.reduce(
    (sum, item) => sum + (item.offerPrice || item.price) * item.quantity,
    0,
  );
  const shippingCost = 10.0;
  const taxRate = 0.05;
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + shippingCost + tax;

  if (cartItemsArray.length === 0) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Start shopping to add items to your cart!
            </p>
            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <ShoppingBag size={20} />
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingCart size={32} className="text-blue-600" />
            Shopping Cart
          </h1>
          <p className="text-gray-500 mt-2">
            {cartItemsArray.length} item{cartItemsArray.length !== 1 ? "s" : ""}{" "}
            in your cart
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cart Items List */}
          <div className="md:w-[65%] space-y-4">
            {cartItemsArray.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}

            {/* Continue Shopping Button - Mobile */}
            <button
              onClick={handleContinueShopping}
              className="w-full md:w-auto flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium py-3 px-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ArrowRight size={20} className="rotate-180" />
              Continue Shopping
            </button>
          </div>

          {/* Order Summary - Sticky on Desktop */}
          <div className="lg:w-[35%]">
            <div className="bg-white rounded-xl shadow-sm p-6 md:sticky md:top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package size={24} className="text-blue-600" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItemsArray.length} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    ${shippingCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isLoggedIn) handleCheckout();
                  else alert("Login First");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>

              <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                <Package size={14} />
                <span>Free shipping on orders over $100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
