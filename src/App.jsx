import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import SkillExplorerPage from './pages/SkillExplorerPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import LearningPage from './pages/LearningPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import CodingPracticePage from './pages/CodingPracticePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectSubmitPage from './pages/ProjectSubmitPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InterviewReadinessPage from './pages/InterviewReadinessPage';
import SkillReportPage from './pages/SkillReportPage';
import AIMentorPage from './pages/AIMentorPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import OnboardingPage from './pages/OnboardingPage';
import DiagnosticAssessmentPage from './pages/DiagnosticAssessmentPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/diagnostic-assessment" element={<ProtectedRoute><DiagnosticAssessmentPage /></ProtectedRoute>} />
          
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><SkillExplorerPage /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailsPage /></ProtectedRoute>} />
          <Route path="/learn/:courseId/:lessonId" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/quiz-result" element={<ProtectedRoute><QuizResultPage /></ProtectedRoute>} />
          <Route path="/coding" element={<ProtectedRoute><CodingPracticePage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/project-submit" element={<ProtectedRoute><ProjectSubmitPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewReadinessPage /></ProtectedRoute>} />
          <Route path="/interview-session" element={<ProtectedRoute><InterviewSessionPage /></ProtectedRoute>} />
          <Route path="/skill-report" element={<ProtectedRoute><SkillReportPage /></ProtectedRoute>} />
          <Route path="/ai-mentor" element={<ProtectedRoute><AIMentorPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
