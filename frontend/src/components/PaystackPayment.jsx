// components/PaystackPayment.jsx
import axios from "../api/axios";

const PaystackPayment = ({ plan }) => {
  const handlePayment = async () => {
    try {
      const res = await axios.post("/payments/initiate-plan", {
        planId: plan._id,
      });

      // Use different callback URL for plans vs subjects
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + (err.response?.data?.message || "Please try again"));
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
    >
      Pay ₵{plan.price}
    </button>
  );
};

export default PaystackPayment;