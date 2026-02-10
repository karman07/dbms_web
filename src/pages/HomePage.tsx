import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Award,
  Play,
  Users,
  CheckCircle,
  ChevronDown,
  Database,
  Server,
  Code,
  Shield,
  Layout,
  FileText,
  BookOpen,
  HelpCircle,
  Link as LinkIcon,
  Clock,

} from "lucide-react";
import { fadeIn, staggerContainer, fadeInUp, scaleIn } from "@/constants";
import { ContactSection } from "@/components/ContactSection";
import courseService, { Course } from "@/services/course.service";

interface HomePageProps {
  onAuthOpen: (mode: 'login' | 'signup') => void;
}

export function HomePage({ onAuthOpen }: HomePageProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<number | null>(0);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);

  const curriculumScrollRef = useRef<HTMLElement>(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Fetch course data for curriculum
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoadingCurriculum(true);
        const data = await courseService.getCourse();
        // If API returns an array, take the first course
        setCourseData(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error('Failed to fetch course for curriculum:', error);
      } finally {
        setLoadingCurriculum(false);
      }
    };
    fetchCourse();
  }, []);

  const scrollToCurriculum = () => {
    curriculumScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartLearning = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      onAuthOpen('login');
    }
  };

  // Grouped Curriculum Config - Transformed from Live Data
  const modules = courseData?.sections.map((section) => ({
    title: section.title,
    description: section.description,
    duration: `${section.lessons.length} Lessons • ${Math.round(section.lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 0), 0) / 60 * 10) / 10} Hours`,
    lessons: section.lessons
  })) || [];

  const features = [
    {
      icon: Layout,
      title: "Relational Modeling",
      description: "Learn how to design robust schemas from scratch using ER diagrams, entity relationships, and rigorous normalization techniques."
    },
    {
      icon: Server,
      title: "Query Optimization",
      description: "Stop writing slow queries. Master indexing, execution plans, and cost-based optimization to make your data lightning fast."
    },
    {
      icon: Shield,
      title: "ACID Compliance",
      description: "Understand concurrency control, locking mechanisms, and transaction isolation levels to ensure data integrity at all times."
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Hero Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center lg:text-left z-10"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Updated for 2026
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
              Mastering <br />
              Database Management Systems (DBMS)
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Go from SQL beginner to database architect. Learn relational modeling, query optimization, and transaction management with industry-standard practices.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button
                size="lg"
                onClick={handleStartLearning}
                className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-6 h-auto rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
              >
                Enroll Now <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToCurriculum}
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-base px-8 py-6 h-auto rounded-xl"
              >
                <Play className="w-4 h-4 ml-2 mr-2 fill-current" /> Watch Preview
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center gap-4 justify-center lg:justify-start text-sm text-slate-500 dark:text-slate-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gray-200 flex items-center justify-center overflow-hidden`}>
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                ))}
              </div>
              <p>Join <span className="font-bold text-slate-900 dark:text-white">10,000+</span> students already learning</p>
            </motion.div>
          </motion.div>

          {/* Hero Visual Mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Main Window */}
              <div className="relative bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 aspect-[4/3] lg:aspect-auto lg:h-[500px]">
                {/* Window Header */}
                <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="ml-4 text-xs text-slate-500 font-mono">dbms_mastery.sql — Edited</div>
                </div>

                {/* Code Content */}
                <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden">
                  <div className="text-slate-500 mb-2">-- Create optimized users table</div>
                  <div className="flex mb-1">
                    <span className="text-purple-400">CREATE TABLE</span>
                    <span className="text-blue-400 ml-2">users</span>
                    <span className="text-slate-400 ml-1">(</span>
                  </div>
                  <div className="pl-4 text-slate-300 mb-1">
                    <span className="text-blue-300">id</span> UUID <span className="text-purple-400">PRIMARY KEY</span>,
                  </div>
                  <div className="pl-4 text-slate-300 mb-1">
                    <span className="text-blue-300">email</span> VARCHAR(255) <span className="text-purple-400">UNIQUE NOT NULL</span>,
                  </div>
                  <div className="pl-4 text-slate-300 mb-1">
                    <span className="text-blue-300">metadata</span> JSONB <span className="text-purple-400">DEFAULT</span> <span className="text-green-400">'{"{}"}'</span>
                  </div>
                  <div className="text-slate-400 mb-4">);</div>

                  <div className="text-slate-500 mb-2">-- Analyze query performance</div>
                  <div className="flex flex-wrap mb-1">
                    <span className="text-purple-400">EXPLAIN ANALYZE</span>
                    <span className="text-blue-400 ml-2">SELECT</span> * <span className="text-purple-400 ml-2">FROM</span> orders
                  </div>
                  <div className="flex mb-1">
                    <span className="text-purple-400">WHERE</span> user_id = <span className="text-orange-400">$1</span>;
                  </div>

                  {/* Floating Overlay Card - Live Monitor */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-6 right-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-64 ring-4 ring-slate-900/5 dark:ring-black/20"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DBMS Monitor</span>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-end gap-1 h-12">
                        <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-sm overflow-hidden relative">
                          <motion.div initial={{ height: "0%" }} animate={{ height: "40%" }} transition={{ duration: 1, delay: 1 }} className="absolute bottom-0 w-full bg-blue-400" />
                        </div>
                        <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-sm overflow-hidden relative">
                          <motion.div initial={{ height: "0%" }} animate={{ height: "70%" }} transition={{ duration: 1, delay: 1.2 }} className="absolute bottom-0 w-full bg-blue-500" />
                        </div>
                        <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-sm overflow-hidden relative">
                          <motion.div initial={{ height: "0%" }} animate={{ height: "30%" }} transition={{ duration: 1, delay: 1.4 }} className="absolute bottom-0 w-full bg-blue-400" />
                        </div>
                        <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-sm overflow-hidden relative">
                          <motion.div initial={{ height: "0%" }} animate={{ height: "85%" }} transition={{ duration: 1, delay: 1.6 }} className="absolute bottom-0 w-full bg-blue-600" />
                        </div>
                        <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-sm overflow-hidden relative">
                          <motion.div initial={{ height: "0%" }} animate={{ height: "55%" }} transition={{ duration: 1, delay: 1.8 }} className="absolute bottom-0 w-full bg-blue-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-2">
                        <code className="text-xs text-slate-400">latency_ms</code>
                        <code className="text-xs font-bold text-blue-600 dark:text-blue-400">12ms</code>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Back Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-3xl -z-10 rounded-[3rem]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 bg-white dark:bg-gray-950 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          >
            {[
              { sm: "45+", lg: "Video Hours" },
              { sm: "12", lg: "Real-World Projects" },
              { sm: "Lifetime", lg: "Course Access" },
              { sm: "Certificate", lg: "Upon Completion" }
            ].map((stat, idx) => (
              <motion.div key={idx} variants={fadeIn} className="flex flex-col items-center text-center relative">
                {idx !== 0 && <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-200 dark:bg-slate-800" />}
                <span className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.sm}</span>
                <span className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.lg}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features "Master Every Layer" */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-base font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Why This Course?</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Master Every Layer of Data</h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              This isn't just a SQL course. We dive deep into the theoretical foundations and the practical implementations that power modern web-scale applications.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800 group"
              >
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Roadmap */}
      <section id="curriculum" ref={curriculumScrollRef} className="py-24 bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Curriculum Roadmap</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">From foundation to mastery in 4 comprehensive modules.</p>
          </div>

          <div className="space-y-4">
            {loadingCurriculum ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Live Roadmap...</p>
              </div>
            ) : modules.length > 0 ? (
              modules.map((module, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${activeModule === idx ? 'border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'}`}
                >
                  <button
                    onClick={() => setActiveModule(activeModule === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl transition-colors ${activeModule === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {idx === 0 ? <Database className="w-5 h-5" /> : idx === 1 ? <Layout className="w-5 h-5" /> : idx === 2 ? <CheckCircle className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${activeModule === idx ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{module.title}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">{module.duration}</p>
                      </div>
                    </div>
                    <div className={`transition-transform duration-300 ${activeModule === idx ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {activeModule === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 sm:pl-[5.5rem] pr-6 pb-8">
                          {module.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-1 italic">
                              {module.description}
                            </p>
                          )}
                          <div className="space-y-4">
                            {module.lessons.map((lesson, lIdx) => (
                              <div key={lIdx} className="group/lesson relative pl-8 pb-1 last:pb-0">
                                {/* Connector line */}
                                <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 last:hidden" />
                                <div className="absolute left-0 top-1.5 w-[16px] h-[16px] rounded-full border-2 border-blue-400 bg-white dark:bg-slate-900 z-10" />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 hover:bg-white dark:hover:bg-slate-900 transition-all">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover/lesson:text-blue-600 dark:group-hover/lesson:text-blue-400 transition-colors">
                                      {lesson.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                      {lesson.estimatedMinutes && (
                                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                          <Clock className="w-3.5 h-3.5" /> {lesson.estimatedMinutes} mins
                                        </span>
                                      )}
                                      {lesson.media && lesson.media.length > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold">
                                          <Play className="w-3.5 h-3.5" /> {lesson.media.length} {lesson.media.length === 1 ? 'Video' : 'Videos'}
                                        </span>
                                      )}
                                      {lesson.linkedQuizzes && lesson.linkedQuizzes.length > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                          <HelpCircle className="w-3.5 h-3.5" /> {lesson.linkedQuizzes.length} {lesson.linkedQuizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                                        </span>
                                      )}
                                      {lesson.docSubtopics && lesson.docSubtopics.length > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                                          <BookOpen className="w-3.5 h-3.5" /> {lesson.docSubtopics.length} {lesson.docSubtopics.length === 1 ? 'Reading' : 'Readings'}
                                        </span>
                                      )}
                                      {lesson.linkedAssignments && lesson.linkedAssignments.length > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold">
                                          <FileText className="w-3.5 h-3.5" /> {lesson.linkedAssignments.length} {lesson.linkedAssignments.length === 1 ? 'Assignment' : 'Assignments'}
                                        </span>
                                      )}
                                      {lesson.resources && lesson.resources.length > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                          <LinkIcon className="w-3.5 h-3.5" /> {lesson.resources.length} {lesson.resources.length === 1 ? 'Resource' : 'Resources'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* <Button size="sm" variant="ghost" className="hidden sm:flex text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1 h-8 text-xs font-bold rounded-lg border border-transparent hover:border-blue-200">
                                    Preview <Play className="w-3 h-3 ml-1.5 fill-current" />
                                  </Button> */}
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* <div className="mt-8 pt-6 border-t border-dashed border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Section Complete Roadmap</p>
                            <Button variant="ghost" className="p-0 h-auto text-blue-600 dark:text-blue-400 font-bold text-xs hover:text-blue-700 hover:bg-transparent hover:underline group">
                              Full Syllabus <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
                            </Button>
                          </div> */}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No curriculum modules found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section id="instructor" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full md:w-80 flex-shrink-0"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden relative shadow-2xl bg-slate-200">
                <img
                  src="https://parteekbhatia.com/assets/image-BndRrwmw.png"
                  alt="Dr. Parteek Kumar Bhatia"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white z-10">
                  <p className="text-xs font-bold tracking-widest opacity-80 uppercase mb-1">Instructor</p>
                  <p className="font-serif italic text-lg opacity-90">"Data is the new oil"</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">Meet the Expert</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">Dr. Parteek Bhatia</h2>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-8">Associate Professor & Author • Washington State University</p>

              <div className="relative mb-10 pl-6 border-l-4 border-blue-200 dark:border-blue-900">
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed italic relative z-10">
                  "With extensive research in distributed systems and AI, Dr. Bhatia helps students build scalable data solutions. He believes that understanding the 'why' behind database design is the foundation for becoming a master architect."
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">50k+</h4>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Students</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">4.9/5</h4>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Rating</p>
                </div>
                <div className="col-span-2 flex gap-3 items-center sm:justify-end">
                  <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">View Profile</Button>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Award className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-blue-600 rounded-[2.5rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30"
        >
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Architect Your Data?</h2>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get instant access to all video lessons, project files, and the exclusive student community. Start your journey to becoming a DBMS expert today.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={handleStartLearning} className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-7 text-lg h-auto rounded-xl font-bold shadow-xl transition-transform hover:-translate-y-1">
                Join the Course - Free
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-200 font-medium">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Lifetime Access</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Certificate Included</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      {/* <footer className="bg-white dark:bg-slate-950 py-12 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Database className="w-4 h-4" />
            </div>
            DBMastery
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 font-medium">
            <button onClick={scrollToCurriculum} className="hover:text-slate-900 dark:hover:text-white transition-colors">Curriculum</button>
            <button className="hover:text-slate-900 dark:hover:text-white transition-colors">Instructor</button>
            <button className="hover:text-slate-900 dark:hover:text-white transition-colors">Resources</button>
            <button className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</button>
          </div>
          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} DBMastery Education Inc. All rights reserved.
          </div>
        </div>
      </footer> */}
    </div>
  );
}