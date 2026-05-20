// App.js - WITH EDIT ROUTE ADDED
import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import AboutPage from "./pages/About";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Admissions from "./pages/Admissions";
import Contact from "./pages/Contact";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SelectProgramPage from "./pages/SelectProgramPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLayout from "./pages/StudentLayout";
import AdminLayout from "./pages/AdminLayout";
import AdminCourses from "./pages/AdminCourses";
import AdminSubjects from "./pages/AdminSubjects";
import AdminQuestions from "./pages/AdminQuestions";
import AdminUsers from "./pages/AdminUsers";
import StudentCourses from "./pages/StudentCourses";
import StudentSubjects from "./pages/StudentSubjects";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminPlans from "./pages/AdminPlans";
import StudentPlans from "./pages/StudentPlans";
import AdminPayments from "./pages/AdminPayments";
import StudentPayments from "./pages/StudentPayments";
import PerformanceDashboard from "./pages/admin/PerformanceDashboard";
import AdminContent from "./pages/AdminContent";
import StudentLessons from "./pages/StudentLessons";
import LessonQuiz from "./components/student/LessionQuiz";
import AdminExamResults from "./pages/AdminExamResults";
import StudentExams from "./pages/StudentExams";
import StudentTrial from "./pages/StudentTrial";
import StudentProgress from "./pages/StudentProgress";
import StudentTestimonials from "./pages/StudentTestimonials";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminInbox from "./pages/AdminInbox";
import ContentPaymentSuccess from "./pages/ContentPaymentSucess";
import StudentContentPayments from "./pages/StudentContentPayments";
import AdminContentPayments from "./pages/AdminContentPayments";
import PlanPaymentSuccess from "./pages/PlanPaymentSuccess";
import SubjectPaymentSuccess from "./pages/SubjectPaymentSuccess";

// Lecturer Imports
import LecturerLayout from "./pages/LecturerLayout";
import LecturerDashboard from "./pages/LecturerDashboard";
import LecturerContentList from "./pages/LecturerContentList";
import LecturerContentForm from "./pages/LecturerContentForm";
import LecturerGrading from "./pages/LecturerGrading";
import LecturerResults from "./pages/LecturerResults";
import LecturerStudents from "./pages/LecturerStudents";
import LecturerStudentProgress from "./pages/LecturerStudentProgress";
import LecturerProfile from "./pages/LecturerProfile";
import LecturerSettings from "./pages/LecturerSettings";
import LecturerHelp from "./pages/LecturerHelp";
import AdminLecturers from "./pages/AdminLecturers";
import AdminLecturerDetail from "./pages/AdminLecturerDetail";
import LecturerExams from "./pages/LecturerExams";
import AdminQuestionApproval from "./pages/AdminQuestionApproval";
import LecturerPerformance from "./pages/LecturerPerformance";
import LecturerGradingList from "./pages/LecturerGradingList";
import LecturerProgressSelect from "./pages/LecturerProgressSelect";
import LecturerLiveClasses from "./pages/LecturerLiveClasses";
import LiveClassRoom from "./components/LiveClassRoom";
import StudentLiveClasses from "./pages/StudentLiveClasses";
import AdminLiveClasses from "./pages/AdminLiveClasses";
import AdminCreateLiveClass from "./pages/AdminCreateLiveClass";
import JoinLiveClass from "./pages/JoinLiveClass";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Disclaimer from "./pages/Disclaimer";
import CookiePolicy from "./pages/CookiePolicy";
import AIAdmin from "./pages/AIAdmin";
import AIPlansAdmin from "./pages/AIPlansAdmin";
import AIGenerator from "./pages/AdminAIGeneratorU";
import AIChat from "./pages/AIChat";
import AdminPrograms from "./pages/AdminPrograms";

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.backgroundColor = "#f9fafb";
    
    return () => {
      document.documentElement.style.scrollBehavior = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
<Route path="/disclaimer" element={<Disclaimer />} />
<Route path="/cookies" element={<CookiePolicy />} />
          
          {/* Payment Success Routes */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/content-payment-success" element={<ContentPaymentSuccess />} />
          <Route path="/plan-payment-success" element={<PlanPaymentSuccess />} />
          <Route path="/subject-payment-success" element={<SubjectPaymentSuccess />} />
          <Route path="/join/:classId" element={<JoinLiveClass />} />

          {/* ==================== STUDENT ROUTES ==================== */}
          <Route
            path="/select-course"
            element={
              <ProtectedRoute role="student">
                <SelectProgramPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="plans" element={<StudentPlans />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="lessons/:subjectId" element={<StudentLessons />} />
            <Route path="lessons/:lessonId/quiz" element={<LessonQuiz />} />
            <Route path="exams/:courseId/:subjectId" element={<StudentExams />} />
            <Route path="trial/:courseId/:subjectId" element={<StudentTrial />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="testimonials" element={<StudentTestimonials />} />
            <Route path="content-payment" element={<StudentContentPayments />} />
            <Route path="live-classes" element={<StudentLiveClasses />} />
            <Route path="live-class/:classId" element={<LiveClassRoom />} />
            <Route path="ai" element={<AIChat />} />
          </Route>

          {/* ==================== ADMIN ROUTES ==================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="results" element={<AdminExamResults />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="in-box" element={<AdminInbox />} />
            <Route path="content-payment" element={<AdminContentPayments />} />
            <Route path="lecturers" element={<AdminLecturers />} />
            <Route path="lecturers/:id" element={<AdminLecturerDetail />} />
            <Route path="question-approval" element={<AdminQuestionApproval />} />
            <Route path="live-classes" element={<AdminLiveClasses />} />
            <Route path="live-classes/create" element={<AdminCreateLiveClass />} />
            <Route path="live-classes/:id/edit" element={<AdminCreateLiveClass />} />
            <Route path="live-class/:classId" element={<LiveClassRoom />} />
            <Route path="ai" element={<AIAdmin />} />
            <Route path="ai-plans" element={<AIPlansAdmin />} />
            <Route path="ai-generator" element={<AIGenerator />} />
          </Route>

          {/* ==================== LECTURER ROUTES ==================== */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute role="lecturer">
                <LecturerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LecturerDashboard />} />
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="content" element={<LecturerContentList />} />
            <Route path="content/create" element={<LecturerContentForm />} />
            <Route path="content/edit/:id" element={<LecturerContentForm />} />
            <Route path="exams" element={<LecturerExams />} />
            <Route path="attempts" element={<LecturerPerformance />} />
            <Route path="grading" element={<LecturerGradingList />} />
            <Route path="grading/:attemptId" element={<LecturerGrading />} />
            <Route path="results" element={<LecturerResults />} />
            <Route path="students" element={<LecturerStudents />} />
            <Route path="progress" element={<LecturerProgressSelect />} />
            <Route path="students/:studentId/progress" element={<LecturerStudentProgress />} />
            <Route path="progress/:studentId" element={<LecturerStudentProgress />} />
            <Route path="profile" element={<LecturerProfile />} />
            <Route path="settings" element={<LecturerSettings />} />
            <Route path="help" element={<LecturerHelp />} />
            <Route path="live-classes" element={<LecturerLiveClasses />} />
            <Route path="live-class/:classId" element={<LiveClassRoom />} />
          </Route>

          {/* ==================== 404 CATCH-ALL ROUTE ==================== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
}

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <div className="text-9xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default App;