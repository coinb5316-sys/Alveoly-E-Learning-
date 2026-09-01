// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
        updateTotals(parsed);
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    updateTotals(cartItems);
  }, [cartItems]);

  const updateTotals = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotalPrice(total);
    setTotalItems(count);
  };

  // Add item to cart
  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        toast.success(`Updated ${item.name} quantity`);
        return prev.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      toast.success(`Added ${item.name} to cart`);
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (id, type) => {
    setCartItems((prev) => {
      const filtered = prev.filter((i) => !(i.id === id && i.type === type));
      toast.success("Item removed from cart");
      return filtered;
    });
  };

  // Update item quantity
  const updateQuantity = (id, type, quantity) => {
    if (quantity < 1) {
      removeFromCart(id, type);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id && i.type === type ? { ...i, quantity } : i
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared");
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Get cart count
  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Checkout - Initiate payment
  const checkout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return null;
    }

    try {
      setLoading(true);
      
      // Check if items are plans or subjects
      const isPlan = cartItems[0]?.type === "plan";
      
      let response;
      if (isPlan) {
        // For plans - only one plan at a time
        const planId = cartItems[0]?.id;
        if (!planId) throw new Error("Invalid plan");
        
        response = await axios.post("/payments/initiate-plan", {
          planId,
        });
      } else {
        // For subjects - multiple subjects
        const subjectIds = cartItems.map(item => item.id);
        response = await axios.post("/payments/initiate-subjects", {
          subjectIds,
        });
      }

      setLoading(false);
      
      // Redirect to payment gateway
      if (response.data.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      } else if (response.data.data?.authorization_url) {
        window.location.href = response.data.data.authorization_url;
      } else {
        throw new Error("No payment URL received");
      }
      
      return response.data;
    } catch (err) {
      setLoading(false);
      console.error("Checkout error:", err);
      toast.error(err.response?.data?.message || "Failed to initiate payment");
      return null;
    }
  };

  const value = {
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    checkout,
    loading,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};