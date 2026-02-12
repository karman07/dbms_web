import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import { AboutPage } from "@/components/AboutPage";
import { ContactPage } from "@/components/ContactPage";
import { HomePage } from "@/pages/HomePage";
import UserProfilePage from "@/pages/UserProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import DocsPage from "@/pages/DocsPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import CoursePage from "@/pages/CoursePage";
import NotesPage from "@/pages/NotesPage";
import StudyMaterialPage from "@/pages/StudyMaterialPage";
import AssignmentsPage from "@/pages/AssignmentsPage";
import QuizzesPage from "@/pages/QuizzesPage";
import QuizPage from "@/pages/QuizPage";
import QuizResultsPage from "@/pages/QuizResultsPage";
import NotificationSettingsPage from "@/pages/NotificationSettingsPage";
import NotificationsPage from "@/pages/NotificationsPage";

import { Footer } from "./components/Footer";
import { Navigation } from "@/components/Header";
import { NotesProvider } from "@/contexts/NotesContext";



function AppContent() {
  const location = useLocation();
  const isDashboardRoute = ['/dashboard', '/docs', '/activities', '/course', '/notes', '/study-material', '/assignments', '/quizzes', '/quiz', '/quiz-results', '/profile', '/notification-settings', '/notifications'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {!isDashboardRoute && <Navigation />}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onAuthOpen={(mode) => {
                const event = new CustomEvent('openAuth', { detail: { mode } });
                window.dispatchEvent(event);
              }}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage onBack={() => window.history.back()} />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/quiz-results" element={<QuizResultsPage />} />
        <Route path="/study-material" element={<StudyMaterialPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notification-settings" element={<NotificationSettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>

      {!isDashboardRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <NotesProvider>
        <AppContent />
      </NotesProvider>
    </Router>
  );
}

export default App;