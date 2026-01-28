import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

import { AboutPage } from "@/components/AboutPage";
import { ContactPage } from "@/components/ContactPage";
import { HomePage } from "@/pages/HomePage";
import UserProfilePage from "@/pages/UserProfilePage";

import { Footer } from "./components/Footer";
import { Navigation } from "./components/Header";



function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        
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
          <Route path="/about" element={<AboutPage/>} />
          <Route path="/contact" element={<ContactPage onBack={() => window.history.back()} />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;