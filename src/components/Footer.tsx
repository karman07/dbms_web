import { Link } from "react-router-dom";
import { List, Facebook, Github, Linkedin, GraduationCap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="bg-blue-600 rounded-lg p-1.5 transition-transform group-hover:scale-105">
                <List className="h-6 w-6 text-white" strokeWidth={3} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                DB<span className="text-blue-600">Mastery</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Empowering students and professional-grade database knowledge and practical skills.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/parteek.bhatia.54/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/parteek-kumar-0237ab33/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://scholar.google.com/citations?user=w5-YIk0AAAAJ&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Google Scholar"
              >
                <GraduationCap className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/bhatiaparteek"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Spacer Column (optional, or just use gap) */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Navigation Column */}
          <div className="lg:col-span-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-6">Navigation</h3>
            <ul className="space-y-4">
              <li><a href="/#hero" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Overview</a></li>
              <li><a href="/#curriculum" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Curriculum</a></li>
              <li><a href="/#stats" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Resources</a></li>
              <li><a href="/#instructor" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Instructor</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-6">Support</h3>
            <ul className="space-y-4">
              <li><a href="/#contact" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Us</a></li>
              {/* <li><a href="/#stats" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Resources</a></li> */}
              <li><Link to="/privacy" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            © {currentYear} DBMastery Education Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              English (US)
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}