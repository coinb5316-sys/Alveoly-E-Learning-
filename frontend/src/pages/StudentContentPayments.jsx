// pages/StudentContentPayments.jsx - FIXED
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Loader2, CreditCard, CheckCircle, Clock, XCircle, Calendar } from "lucide-react";

const StudentContentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("/content-payments/my-purchases");
        console.log("Purchased content response:", res.data);
        
        // Extract data properly - the response is an array of content objects, not payments
        const purchasedContent = res.data || [];
        setPayments(purchasedContent);
      } catch (err) {
        console.error("Error fetching purchased content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          My Purchased Content
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View all the content you've unlocked
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Purchased Content
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You haven't purchased any content yet. Browse subjects to unlock premium content.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map((content) => (
            <div key={content._id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{content.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Type: <span className="capitalize">{content.type}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 dark:text-green-400">₵{content.price || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    Purchased: {content.purchasedAt ? new Date(content.purchasedAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentContentPayments;