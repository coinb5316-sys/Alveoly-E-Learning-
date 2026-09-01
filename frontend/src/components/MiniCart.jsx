// src/components/MiniCart.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingBag, FaTimes, FaTrash } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const MiniCart = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, getCartTotal, getCartCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <FaShoppingBag className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Cart ({getCartCount()})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)]">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
              <Link
                to="/programs"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700"
                onClick={onClose}
              >
                Browse Programs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.type}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === "plan"
                      ? "bg-gradient-to-br from-purple-500 to-pink-500"
                      : "bg-gradient-to-br from-blue-500 to-cyan-500"
                  }`}>
                    {item.type === "plan" ? (
                      <FaCrown className="text-white text-sm" />
                    ) : (
                      <FaBook className="text-white text-sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ₵{item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.type)}
                    className="p-1.5 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-4">
              <span>Total</span>
              <span>₵{getCartTotal().toFixed(2)}</span>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-center block hover:shadow-lg transition-all"
            >
              View Cart & Checkout
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MiniCart;