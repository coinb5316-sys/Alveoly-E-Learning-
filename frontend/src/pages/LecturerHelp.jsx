// pages/lecturer/LecturerHelp.jsx
import { useState } from "react";
import { HelpCircle, Mail, BookOpen, Video, MessageSquare, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const LecturerHelp = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How do I create new content for my students?",
      a: "Go to 'Create Content' from the sidebar. Choose the content type (lesson, exam, practice, or assignment), fill in the details, add questions if applicable, and publish."
    },
    {
      q: "How do I grade student submissions?",
      a: "Navigate to 'Student Submissions' from the sidebar, select the submission you want to grade, review the answers, assign a score, and provide feedback."
    },
    {
      q: "Can I set time limits for exams?",
      a: "Yes! When creating an exam, you can set a timer in minutes. Students will see a countdown timer while taking the exam."
    },
    {
      q: "How do I view student progress reports?",
      a: "Go to 'My Students' and click 'View Progress' on any student to see detailed analytics including scores, completion rates, and performance trends."
    },
    {
      q: "Can I allow students to retake exams?",
      a: "Yes, you can set the maximum number of attempts when creating content. For individual cases, you can manually allow retakes from the grading page."
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Help & Support</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get help with using the lecturer portal</p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <a href="#" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center hover:shadow-md transition-all">
          <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="font-medium text-gray-900">Documentation</p>
          <p className="text-xs text-gray-500">Read full guides</p>
        </a>
        <a href="#" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center hover:shadow-md transition-all">
          <Video className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="font-medium text-gray-900">Video Tutorials</p>
          <p className="text-xs text-gray-500">Watch step-by-step</p>
        </a>
        <a href="mailto:support@alveoly.com" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center hover:shadow-md transition-all">
          <Mail className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-medium text-gray-900">Contact Support</p>
          <p className="text-xs text-gray-500">support@alveoly.com</p>
        </a>
      </div>

      {/* FAQs */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-lg">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Chat */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold">Need more help?</h3>
            <p className="text-blue-100 text-sm">Chat with our support team for immediate assistance</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:shadow-lg transition-all">
            <MessageSquare className="h-4 w-4" />
            Start Live Chat
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LecturerHelp;