// src/App.js — Complete route tree
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- Public pages ---------- */
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

/* ---------- Shared ---------- */
import ProtectedRoute from "./components/ProtectedRoutes";
import CookieBanner from "./components/CookieBanner";
import SplashScreen from "./components/SplashScreen";

/* ---------- Student ---------- */
import StudentDashboard from "./pages/StudentDashboard";
import StudentLayout from "./pages/StudentLayout";
import StudentCourses from "./pages/StudentCourses";
import StudentSubjects from "./pages/StudentSubjects";
import StudentPlans from "./pages/StudentPlans";
import StudentPayments from "./pages/StudentPayments";
import StudentLessons from "./pages/StudentLessons";
import LessonQuiz from "./components/student/LessionQuiz";
import StudentExams from "./pages/StudentExams";
import StudentTrial from "./pages/StudentTrial";
import StudentProgress from "./pages/StudentProgress";
import StudentTestimonials from "./pages/StudentTestimonials";
import StudentContentPayments from "./pages/StudentContentPayments";
import StudentLiveClasses from "./pages/StudentLiveClasses";
import StudentExamResults from "./pages/StudentExamResults";
import AIChat from "./pages/AIChat";
import NursingGamesHub from "./pages/student/NursingGamesHub";
import GameMatch from "./pages/student/GameMatch";
import GameMatchResults from "./pages/student/GameMatchResults";
import SelectProgramPage from "./pages/SelectProgramPage";

/* ---------- Admin ---------- */
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/AdminLayout";
import AdminCourses from "./pages/AdminCourses";
import AdminSubjects from "./pages/AdminSubjects";
import AdminQuestions from "./pages/AdminQuestions";
import AdminUsers from "./pages/AdminUsers";
import AdminPlans from "./pages/AdminPlans";
import AdminPayments from "./pages/AdminPayments";
import AdminContent from "./pages/AdminContent";
import AdminExamResults from "./pages/AdminExamResults";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminInbox from "./pages/AdminInbox";
import AdminContentPayments from "./pages/AdminContentPayments";
import AdminLecturers from "./pages/AdminLecturers";
import AdminLecturerDetail from "./pages/AdminLecturerDetail";
import AdminQuestionApproval from "./pages/AdminQuestionApproval";
import AdminLiveClasses from "./pages/AdminLiveClasses";
import AdminCreateLiveClass from "./pages/AdminCreateLiveClass";
import AdminPrograms from "./pages/AdminPrograms";
import AdminTopics from "./pages/AdminTopics";
import AIAdmin from "./pages/AIAdmin";
import AIPlansAdmin from "./pages/AIPlansAdmin";
import AIGenerator from "./pages/AdminAIGeneratorU";
import PerformanceDashboard from "./pages/admin/PerformanceDashboard";
import AdminNotifications from "./pages/admin/AdminNotifications";

/* ---------- Admin blog (editorial) ---------- */
import AdminBlogPosts from "./pages/admin/blog/AdminBlogPosts";
import AdminBlogPostEditor from "./pages/admin/blog/AdminBlogPostEditor";
import AdminBlogCategories from "./pages/admin/blog/AdminBlogCategories";
import AdminBlogTags from "./pages/admin/blog/AdminBlogTags";
import AdminBlogAuthors from "./pages/admin/blog/AdminBlogAuthors";
import AdminBlogComments from "./pages/admin/blog/AdminBlogComments";
import AdminBlogPodcasts from "./pages/admin/blog/AdminBlogPodcasts";
import AdminBlogVideos from "./pages/admin/blog/AdminBlogVideos";
import AdminBlogMedia from "./pages/admin/blog/AdminBlogMedia";
import AdminBlogTestimonials from "./pages/admin/blog/AdminBlogTestimonials";

/* ---------- Lecturer ---------- */
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
import LecturerExams from "./pages/LecturerExams";
import LecturerPerformance from "./pages/LecturerPerformance";
import LecturerGradingList from "./pages/LecturerGradingList";
import LecturerProgressSelect from "./pages/LecturerProgressSelect";
import LecturerLiveClasses from "./pages/LecturerLiveClasses";
import NursingGames from "./pages/lecturer/NursingGames";
import LiveClassRoom from "./components/LiveClassRoom";

/* ---------- Careers ---------- */
import CareerPage from "./pages/CareerPage";
import CareerWhatWeDo from "./pages/CareerWhatWeDo";
import LiveAtAlveoly from "./pages/LiveAtAlveoly";
import CareerBenefits from "./pages/CareerBenefits";
import CareerJobs from "./pages/CareerJobs";
import JobDetails from "./pages/JobDetails";
import JobApplication from "./pages/JobApplication";

/* ---------- Legal / Programs by field ---------- */
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Disclaimer from "./pages/Disclaimer";
import CookiePolicy from "./pages/CookiePolicy";
import MedicalPage from "./pages/Medical";
import NursingPage from "./pages/NursingPage";
import AccountingPage from "./pages/AccountingPage";
import FinancePage from "./pages/FinancePage";
import HighSchoolPage from "./pages/HighSchoolPage";
import GradSchoolPage from "./pages/GradSchoolPage";
import LegalPage from "./pages/LegalPage";
import PharmacyPage from "./pages/PharmacyPage";
import Pricing from "./pages/Pricing";

/* ---------- Payments ---------- */
import PaymentSuccess from "./pages/PaymentSuccess";
import ContentPaymentSuccess from "./pages/ContentPaymentSucess";
import PlanPaymentSuccess from "./pages/PlanPaymentSuccess";
import SubjectPaymentSuccess from "./pages/SubjectPaymentSuccess";
import JoinLiveClass from "./pages/JoinLiveClass";

/* ---------- Blog (public journal) ---------- */
import Blog from "./pages/Blog";
import BlogPost from "./pages/blog/BlogPost";
import BlogCategory from "./pages/blog/BlogCategory";
import BlogAuthor from "./pages/blog/BlogAuthor";
import BlogSearch from "./pages/blog/BlogSearch";
import BlogTag from "./pages/blog/BlogTag";
import BlogArchive from "./pages/blog/BlogArchive";
import BlogPodcasts from "./pages/blog/BlogPodcasts";
import BlogVideos from "./pages/blog/BlogVideos";

/* ---------- Trust policies (public) ---------- */
import EditorialPolicy from "./pages/EditorialPolicy";
import AdvertisingPolicy from "./pages/AdvertisingPolicy";
import MedicalReviewPolicy from "./pages/MedicalReviewPolicy";
import Sitemap from "./pages/Sitemap";

function App() {
  /* ---------- Splash ---------- */
  const [showSplash, setShowSplash] = useState(() => {
    const hasVisited = sessionStorage.getItem("alveoly_has_visited");
    return !hasVisited;
  });

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.backgroundColor = "#f9fafb";

    return () => {
      document.documentElement.style.scrollBehavior = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSplash]);

  const handleSplashFinish = () => {
    sessionStorage.setItem("alveoly_has_visited", "true");
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

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
          {/* ============================================================
              PUBLIC ROUTES
          ============================================================ */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/contact_us" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* ---------- BLOG / JOURNAL ----------
              Order matters: specific paths first, then dynamic slug.
              This prevents /blog/search, /blog/archive, etc.
              from being swallowed by /blog/:slug.
          */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/search" element={<BlogSearch />} />
          <Route path="/blog/archive" element={<BlogArchive />} />
          <Route path="/blog/podcasts" element={<BlogPodcasts />} />
          <Route path="/blog/videos" element={<BlogVideos />} />
          <Route path="/blog/category/:slug" element={<BlogCategory />} />
          <Route path="/blog/author/:id" element={<BlogAuthor />} />
          <Route path="/blog/tag/:tag" element={<BlogTag />} />
          {/* Dynamic slug last — /blog/:slug catches single-segment paths only */}
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* ---------- Trust policies ---------- */}
          <Route path="/editorial-policy" element={<EditorialPolicy />} />
          <Route path="/advertising-policy" element={<AdvertisingPolicy />} />
          <Route path="/medical-review-policy" element={<MedicalReviewPolicy />} />
          <Route path="/sitemap" element={<Sitemap />} />

          {/* ---------- Legal ---------- */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* ---------- Careers ---------- */}
          <Route path="/careers" element={<CareerPage />} />
          <Route path="/careers/what-we-do" element={<CareerWhatWeDo />} />
          <Route path="/careers/life-at-alveoly" element={<LiveAtAlveoly />} />
          <Route path="/careers/benefits" element={<CareerBenefits />} />
          <Route path="/careers/jobs" element={<CareerJobs />} />
          <Route path="/careers/jobs/:slug" element={<JobDetails />} />
          <Route path="/careers/jobs/apply" element={<JobApplication />} />

          {/* ---------- Programs by field ---------- */}
          <Route path="/medical" element={<MedicalPage />} />
          <Route path="/nursing" element={<NursingPage />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/high-school" element={<HighSchoolPage />} />
          <Route path="/grad-school" element={<GradSchoolPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />

          {/* ---------- Payment success ---------- */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/content-payment-success" element={<ContentPaymentSuccess />} />
          <Route path="/plan-payment-success" element={<PlanPaymentSuccess />} />
          <Route path="/subject-payment-success" element={<SubjectPaymentSuccess />} />
          <Route path="/join/:classId" element={<JoinLiveClass />} />

          {/* ============================================================
              STUDENT ROUTES
          ============================================================ */}
          <Route
            path="/select-program"
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
            <Route path="exam-results" element={<StudentExamResults />} />
            <Route path="lessons/:lessonId/quiz" element={<LessonQuiz />} />
            <Route path="exams/:courseId/:subjectId" element={<StudentExams />} />
            <Route path="trial/:courseId/:subjectId" element={<StudentTrial />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="testimonials" element={<StudentTestimonials />} />
            <Route path="content-payment" element={<StudentContentPayments />} />
            <Route path="live-classes" element={<StudentLiveClasses />} />
            <Route path="live-class/:classId" element={<LiveClassRoom />} />
            <Route path="ai" element={<AIChat />} />
            <Route path="nursing-games" element={<NursingGamesHub />} />
            <Route path="game-match/:matchId" element={<GameMatch />} />
            <Route path="game-match/:matchId/results" element={<GameMatchResults />} />
          </Route>

          {/* ============================================================
              ADMIN ROUTES
          ============================================================ */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* ---------- Core ---------- */}
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="topics" element={<AdminTopics />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="question-approval" element={<AdminQuestionApproval />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />

            {/* ---------- AI ---------- */}
            <Route path="ai" element={<AIAdmin />} />
            <Route path="ai-plans" element={<AIPlansAdmin />} />
            <Route path="ai-generator" element={<AIGenerator />} />

            {/* ---------- Blog / Journal (editorial admin) ---------- */}
            <Route path="blog/posts" element={<AdminBlogPosts />} />
            <Route path="blog/create" element={<AdminBlogPostEditor />} />
            <Route path="blog/edit/:id" element={<AdminBlogPostEditor />} />
            <Route path="blog/categories" element={<AdminBlogCategories />} />
            <Route path="blog/tags" element={<AdminBlogTags />} />
            <Route path="blog/authors" element={<AdminBlogAuthors />} />
            <Route path="blog/comments" element={<AdminBlogComments />} />
            <Route path="blog/podcasts" element={<AdminBlogPodcasts />} />
            <Route path="blog/videos" element={<AdminBlogVideos />} />
            <Route path="blog/media" element={<AdminBlogMedia />} />
            <Route path="blog/testimonials" element={<AdminBlogTestimonials />} />

            {/* ---------- Blog trust policies (editors) ----------
                These three stubs will be replaced by dedicated
                editor pages next. Kept here so the sidebar links resolve. */}
            <Route
              path="blog/editorial-policy"
              element={<EditorialPolicy />}
            />
            <Route
              path="blog/medical-review-policy"
              element={<MedicalReviewPolicy />}
            />
            <Route
              path="blog/advertising-policy"
              element={<AdvertisingPolicy />}
            />

            {/* ---------- Content ---------- */}
            <Route path="lecturers" element={<AdminLecturers />} />
            <Route path="lecturers/:id" element={<AdminLecturerDetail />} />
            <Route path="content-payment" element={<AdminContentPayments />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="live-classes" element={<AdminLiveClasses />} />
            <Route path="live-classes/create" element={<AdminCreateLiveClass />} />
            <Route path="live-classes/:id/edit" element={<AdminCreateLiveClass />} />
            <Route path="live-class/:classId" element={<LiveClassRoom />} />

            {/* ---------- Engagement ---------- */}
            <Route path="results" element={<AdminExamResults />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="in-box" element={<AdminInbox />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>

          {/* ============================================================
              LECTURER ROUTES
          ============================================================ */}
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
            <Route
              path="students/:studentId/progress"
              element={<LecturerStudentProgress />}
            />
            <Route
              path="progress/:studentId"
              element={<LecturerStudentProgress />}
            />
            <Route path="profile" element={<LecturerProfile />} />
            <Route path="settings" element={<LecturerSettings />} />
            <Route path="help" element={<LecturerHelp />} />
            <Route path="live-classes" element={<LecturerLiveClasses />} />
            <Route path="live-class/:classId" element={<LiveClassRoom />} />
            <Route path="nursing-games" element={<NursingGames />} />
          </Route>

          {/* ============================================================
              404 CATCH-ALL
          ============================================================ */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <CookieBanner />
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
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h1>
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