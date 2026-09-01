// src/pages/Cart.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingBag,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaLock,
  FaCreditCard,
  FaSpinner,
  FaBook,
  FaCrown,
  FaShoppingCart,
  FaChevronLeft,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    checkout,
    loading,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to proceed with checkout");
      localStorage.setItem("redirectAfterLogin", "/cart");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    try {
      await checkout();
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to initiate payment");
      setIsCheckingOut(false);
    }
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.05; // 5% tax (adjust as needed)
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-['Inter',sans-serif]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4">
            <FaShoppingBag className="text-blue-600 dark:text-blue-400 text-sm" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Your Cart</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Review your items and proceed to checkout
          </p>
        </div>

        {/* Cart Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-12 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                  <FaShoppingCart className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Looks like you haven't added any items yet.
                </p>
                <button
                  onClick={() => navigate("/programs")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Browse Programs
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.type}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-5 hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {/* Item Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            item.type === "plan"
                              ? "bg-gradient-to-br from-purple-500 to-pink-500"
                              : "bg-gradient-to-br from-blue-500 to-cyan-500"
                          }`}>
                            {item.type === "plan" ? (
                              <FaCrown className="text-white text-xl" />
                            ) : (
                              <FaBook className="text-white text-xl" />
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {item.type === "plan" ? "Plan" : "Subject"}
                                  </span>
                                  {item.type === "subject" && item.programName && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {item.programName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">
                                  ₵{(item.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  ₵{item.price.toFixed(2)} each
                                </p>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <FaMinus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                </button>
                                <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <FaPlus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id, item.type)}
                                className="text-red-500 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                                aria-label="Remove item"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Clear Cart Button */}
                {cartItems.length > 1 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 mt-4"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                    Clear All Items
                  </button>
                )}
              </>
            )}
          </div>

          {/* Order Summary - Right Column */}
          {cartItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 sticky top-32">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({getCartCount()} items)</span>
                    <span>₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (5%)</span>
                    <span>₵{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCheckingOut || loading ? (
                    <>
                      <FaSpinner className="animate-spin w-5 h-5" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaLock className="w-4 h-4" />
                      Proceed to Checkout
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <FaCreditCard className="w-3.5 h-3.5" />
                  <span>Secure payment via Paystack</span>
                </div>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate("/programs")}
                  className="w-full mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <FaChevronLeft className="w-3 h-3" />
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;