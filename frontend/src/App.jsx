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
import SelectCoursePage from "./pages/SelectCoursePage";
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
import LecturerLayout from "./layouts/LecturerLayout";
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerContentList from "./pages/lecturer/LecturerContentList";
import LecturerContentForm from "./pages/lecturer/LecturerContentForm";
import LecturerAttempts from "./pages/lecturer/LecturerAttempts";
import LecturerGrading from "./pages/lecturer/LecturerGrading";
import LecturerResults from "./pages/lecturer/LecturerResults";
import LecturerStudents from "./pages/lecturer/LecturerStudents";
import LecturerStudentProgress from "./pages/lecturer/LecturerStudentProgress";
import LecturerProfile from "./pages/lecturer/LecturerProfile";
import LecturerSettings from "./pages/lecturer/LecturerSettings";
import LecturerHelp from "./pages/lecturer/LecturerHelp";
import AdminLecturers from "./pages/AdminLecturers";
import AdminLecturerDetail from "./pages/AdminLecturerDetail";

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
          
          {/* Payment Success Routes */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/content-payment-success" element={<ContentPaymentSuccess />} />
          <Route path="/plan-payment-success" element={<PlanPaymentSuccess />} />
          <Route path="/subject-payment-success" element={<SubjectPaymentSuccess />} />

          {/* ==================== STUDENT ROUTES ==================== */}
          <Route
            path="/select-course"
            element={
              <ProtectedRoute role="student">
                <SelectCoursePage />
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
            {/* Dashboard */}
            <Route index element={<LecturerDashboard />} />
            <Route path="dashboard" element={<LecturerDashboard />} />
            
            {/* Content Management */}
            <Route path="content" element={<LecturerContentList />} />
            <Route path="content/create" element={<LecturerContentForm />} />
            <Route path="content/:id/edit" element={<LecturerContentForm />} />
            
            {/* Assessment & Grading */}
            <Route path="attempts" element={<LecturerAttempts />} />
            <Route path="attempts/:attemptId" element={<LecturerGrading />} />
            <Route path="grading" element={<LecturerGrading />} />
            <Route path="results" element={<LecturerResults />} />
            
            {/* Student Management */}
            <Route path="students" element={<LecturerStudents />} />
            <Route path="students/:studentId/progress" element={<LecturerStudentProgress />} />
            <Route path="progress" element={<LecturerStudentProgress />} />
            
            {/* Profile & Settings */}
            <Route path="profile" element={<LecturerProfile />} />
            <Route path="settings" element={<LecturerSettings />} />
            <Route path="help" element={<LecturerHelp />} />
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