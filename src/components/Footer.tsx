import { Database, Mail, MessageCircle, Phone } from "lucide-react";
import { BUTTON_STYLES, GRADIENTS } from "../constants";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <Database className="h-10 w-10 text-blue-400" />
              <span className={`text-2xl font-bold ${GRADIENTS.gradientText}`}>
                Course Hub
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Master database management with Parteek Bhatia's comprehensive course. 
              From basics to advanced concepts, we've got you covered.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className={BUTTON_STYLES.ghost}>
                <Mail className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className={BUTTON_STYLES.ghost}>
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className={BUTTON_STYLES.ghost}>
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Course</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Curriculum</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Instructor</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Reviews</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            © 2026 DBMS Mastery by Parteek Bhatia. All rights reserved.
          </div>
          <div className="text-gray-400 text-sm">
            Built with ❤️ for aspiring database professionals
          </div>
        </div>
      </div>
    </footer>
  );
}