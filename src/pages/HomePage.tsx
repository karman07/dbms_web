import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Users,
  CheckCircle,
  Server,
  Code,
  Layout,
  FileText,
  BookOpen,
  HelpCircle,
  Clock,
  Target,
  Rocket,
  Glasses,
  Zap,
  Star,
  ShieldCheck,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { staggerContainer, fadeInUp, scaleIn, BUTTON_STYLES } from "@/constants";
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
        setCourseData(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error('Failed to fetch course for curriculum:', error);
      } finally {
        setLoadingCurriculum(false);
      }
    };
    fetchCourse();
  }, []);



  const handleStartLearning = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      onAuthOpen('login');
    }
  };

  // Grouped Curriculum Config - Transformed from Live Data
  const modules = courseData?.sections.map((section, sIdx) => ({
    title: section.title,
    description: section.description,
    duration: `${section.lessons.length} Lessons • ${Math.round(section.lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 0), 0) / 60 * 10) / 10} Hours`,
    sectionId: section._id,
    sectionIdx: sIdx,
    lessons: section.lessons
  })) || [];

  const handleLessonClick = (sectionId: string, lessonId: string) => {
    if (!isAuthenticated) { onAuthOpen('login'); return; }
    navigate('/course', { state: { sectionId, lessonId } });
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center lg:text-left z-10"
          >


            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
              DBMS Teaching & <br />Learning Hub
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Designed for faculty, students, and professionals to provide a clear, structured, and complete pathway for teaching and learning university-level Database Management Systems.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button
                size="lg"
                onClick={handleStartLearning}
                className={BUTTON_STYLES.gradient + " text-lg px-10 py-7 h-auto rounded-xl font-bold tracking-tight shadow-2xl"}
              >
                Start Learning Now <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Conceptual Clarity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Hands-on Practice</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Career Readiness</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Main Window */}
              <div className="relative bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 aspect-square sm:aspect-[4/3] lg:aspect-auto lg:h-[500px]">
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
                <div className="p-4 sm:p-6 font-mono text-[10px] sm:text-sm leading-relaxed overflow-hidden">
                  <div className="text-slate-400 mb-2">-- World-class expertise query</div>
                  <div className="flex flex-wrap mb-1">
                    <span className="text-purple-400 font-bold">SELECT</span>
                    <span className="text-white ml-2">*</span>
                    <span className="text-purple-400 ml-2 font-bold">FROM</span>
                    <span className="text-blue-300 ml-2">world</span>
                  </div>
                  <div className="flex mb-4">
                    <span className="text-purple-400 font-bold">WHERE</span>
                    <span className="text-blue-300 ml-2">teacher</span>
                    <span className="text-white ml-2">=</span>
                    <span className="text-green-400 ml-2">'the best'</span>;
                  </div>

                  <div className="bg-slate-900/40 rounded-xl p-3 sm:p-5 border border-slate-800/60 shadow-inner">
                    <div className="grid grid-cols-[0.8fr_1.4fr_1fr] gap-2 sm:gap-6 border-b border-slate-700/50 pb-2 sm:pb-3 mb-2 sm:mb-3 text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                      <span>ID</span>
                      <span>Instructor</span>
                      <span>Expertise</span>
                    </div>
                    <div className="grid grid-cols-[0.8fr_1.4fr_1fr] gap-2 sm:gap-6 text-[9px] sm:text-xs text-slate-300 items-center">
                      <span className="text-blue-500/80 font-mono truncate">WSU_01</span>
                      <span className="font-semibold tracking-tight truncate">Dr. Parteek Bhatia</span>
                      <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0">
                        <span className="text-emerald-400 font-bold flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] whitespace-nowrap">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                          The Best
                        </span>
                        <span className="text-[7px] sm:text-[10px] text-slate-500 font-medium">Experienced</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Overlay Card - Live Monitor */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-[140px] sm:w-64 ring-4 ring-slate-900/5 dark:ring-black/20 z-20"
                  >
                    <div className="flex justify-between items-center mb-1.5 sm:mb-3">
                      <span className="text-[7px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">DBMS Monitor</span>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-end gap-0.5 sm:gap-1 h-6 sm:h-12">
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
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-1.5 sm:pt-2">
                        <code className="text-[7px] sm:text-xs text-slate-400 font-mono tracking-tighter sm:tracking-normal">latency_ms</code>
                        <code className="text-[8px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">12ms</code>
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

      {/* Platform Core Purpose */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-sm mb-4">The Simple Goal</h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Structured Excellence in One Place</h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Providing a clear and complete pathway for teaching and learning DBMS—week by week—without requiring instructors to build from scratch. Faculty may adopt the course as-is or customize individual components to fit their syllabus.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Glasses, title: "Conceptual Clarity", desc: "Build a deep understanding before diving into tools.", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { icon: Code, title: "Hands-on Practice", desc: "Theory meets industry-standard implementation.", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
              { icon: FileText, title: "Assessment Support", desc: "Fair and efficient grading with rubric-friendly tools.", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
              { icon: Target, title: "Career Readiness", desc: "Prepare for interviews and high-scale production.", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What the Platform Provides - 7 Sections */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">What the Platform Provides</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              {
                icon: Layout,
                title: "1. Weekly Course Structure",
                content: "A step-by-step weekly roadmap aligned with a standard DBMS syllabus, enabling consistent coverage across the semester."
              },
              {
                icon: BookOpen,
                title: "2. Readings",
                content: "Curated from 'Simplified Approach to DBMS'. Concept-first content designed for understanding, not memorization."
              },
              {
                icon: Users,
                title: "3. In-Class Activities",
                content: "Structured hands-on activities and reasoning exercises designed for minimal instructor intervention."
              },
              {
                icon: Code,
                title: "4. Lab Assignments",
                content: "Practical exercises aligned with weekly topics. Focus on learning by doing without unnecessary tool complexity."
              },
              {
                icon: HelpCircle,
                title: "5. Assignments & Assessments",
                content: "Homework and problem-solving assignments with rubric-friendly structure for efficient grading."
              },
              {
                icon: Server,
                title: "6. Project Ideas",
                content: "Real-world inspired database problems scalable for undergraduate and graduate-level courses."
              },
              {
                icon: Play,
                title: "7. Teaching Resources",
                content: "Lecture slides, videos covering core concepts, and supplementary notes for direct instructor reuse.",
                extraWide: true
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`flex gap-6 ${item.extraWide ? 'md:col-span-2 lg:col-span-3 lg:max-w-2xl lg:mx-auto' : ''}`}
              >
                <div className="shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-black">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Alignment Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Course Structure Alignment</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                The platform follows a standard DBMS syllabus progression, making it easy to align with most university calendars and departmental requirements.
              </p>
              <div className="space-y-4">
                {[
                  "Database fundamentals and data modeling",
                  "Relational model and schema design",
                  "SQL and relational algebra concepts",
                  "Normalization and functional dependencies",
                  "Transactions, concurrency, and recovery",
                  "Indexing and query processing",
                  "Distributed and modern database concepts"
                ].map((topic, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-6 bg-blue-600/5 dark:bg-blue-400/5 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <h5 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide text-xs">Total Flexibility</h5>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Faculty may adjust pacing to match semester length, skip or reorder weeks, or integrate with existing content.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-xl text-slate-900 dark:text-white">Instructor Efficiency</h4>
                </div>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex gap-3">
                    <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Minimize lecture preparation time</span>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Reduce ad-hoc material creation</span>
                  </li>
                  <li className="flex gap-3">
                    <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Classroom-tested activities included</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-xl text-slate-900 dark:text-white">Academic Integrity</h4>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Supporting formal academic evaluation with secure materials:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">Mid-semester samples</span>
                  <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">Exam & quiz samples</span>
                  <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">Instructor-only access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Experience */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-16">The Student Experience</h3>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { title: "Reasoning over Memo", desc: "Build intuition and reasoning, not just learning SQL syntax. Connect theory to practical reasoning." },
              { title: "Career Placement", desc: "Strong conceptual foundation in DBMS for technical interviews and top-tier placements." },
              { title: "Self-Study Mode", desc: "Support coursework with preparations, revisions, and concept reinforcement." }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black mb-6">{i + 1}</div>
                <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white mb-4 line-tight">{item.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-64 -mt-64 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-16 tracking-tight">Who This Is For</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { segment: "New Instructors", text: "Seeking a clear, structured pathway for teaching without fragmented slides." },
              { segment: "Experienced Faculty", text: "Looking to elevate their course with deeper explanations and meaningful activities." },
              { segment: "Students", text: "Who want to truly understand how database systems work—building reasoning and intuition." },
              { segment: "Interview Prep", text: "Graduating students preparing for technical placements needing a strong conceptual foundation." },
              { segment: "Lifelong Learners", text: "Professionals who want professional-grade database knowledge for university courses." }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <Star className="w-6 h-6 text-blue-400 mb-6 group-hover:scale-125 transition-transform" />
                <h4 className="font-bold text-xl mb-3 text-blue-100">{item.segment}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-5xl font-extrabold text-center mb-16 text-slate-900 dark:text-white tracking-tight">Design Philosophy</h3>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
            {[
              "Concept-first, not tool-first",
              "Reasoning over memorization",
              "Classroom-tested & instructor-friendly",
              "Minimal friction for faculty",
              "Maximum clarity for learners"
            ].map((phi, i) => (
              <div key={i} className="px-8 py-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 font-black text-sm uppercase tracking-widest flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {phi}
              </div>
            ))}
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
              <div className="aspect-[4/5] rounded-3xl overflow-hidden relative shadow-2xl bg-slate-200 w-full max-w-sm mx-auto md:max-w-none">
                <img
                  src="https://parteekbhatia.com/assets/image-BndRrwmw.png"
                  alt="Dr. Parteek Kumar Bhatia"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white z-10">
                  <p className="text-[10px] font-bold tracking-widest opacity-80 uppercase mb-1">Instructor</p>
                  <p className="font-serif italic text-base sm:text-lg opacity-90">"Data is the new oil"</p>
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
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">Meet the Creator</span>
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
                  <a
                    href="https://www.linkedin.com/in/parteek-kumar-0237ab33/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold px-6">View Profile</Button>
                  </a>
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
          className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready to Elevate Your DBMS Course?</h2>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Join thousands of students and faculty members using the most complete, university-ready DBMS platform in the world.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={handleStartLearning} className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-8 text-xl h-auto rounded-2xl font-black shadow-2xl transition-all hover:scale-[1.05] hover:-translate-y-1 active:scale-95">
                Join the Hub - Get Started
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Curriculum Roadmap */}
      <section id="curriculum" className="py-24 bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Weekly Roadmap</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">Aligned with standard university DBMS syllabi.</p>
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
                  className={`border-2 rounded-[2rem] overflow-hidden transition-all duration-300 ${activeModule === idx ? 'border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 shadow-lg shadow-blue-500/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950'}`}
                >
                  <button
                    onClick={() => setActiveModule(activeModule === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${activeModule === idx ? 'bg-blue-600 text-white rotate-6' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h3 className={`font-black text-lg sm:text-xl ${activeModule === idx ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{module.title}</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{module.duration}</p>
                      </div>
                    </div>
                    <div className={`transition-transform duration-300 ${activeModule === idx ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                      <ChevronDown className="w-6 h-6" />
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
                        <div className="px-6 sm:px-8 pb-10 md:pl-[7.5rem]">
                          {module.description && (
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 border-l-4 border-blue-500 dark:border-blue-700 pl-4 sm:pl-6 py-1 font-medium">
                              {module.description}
                            </p>
                          )}
                          <div className="space-y-6">
                            {module.lessons.map((lesson, lIdx) => (
                              <div key={lIdx} className="group/lesson relative pl-10 pb-2 last:pb-0">
                                <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 last:hidden" />
                                <div className={`absolute left-0 top-1.5 w-[20px] h-[20px] rounded-full border-4 z-10 transition-colors ${isAuthenticated ? 'border-blue-500 bg-white dark:bg-slate-900 group-hover/lesson:bg-blue-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`} />

                                <button
                                  onClick={() => handleLessonClick(module.sectionId, lesson._id)}
                                  className="w-full text-left p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-md cursor-pointer group/card"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                                      {lesson.title}
                                    </h4>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover/card:text-blue-500 flex-shrink-0 mt-1 transition-colors" />
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-4">
                                    {lesson.media && lesson.media.length > 0 && (
                                      <span className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                                        <Play className="w-3.5 h-3.5" /> Videos
                                      </span>
                                    )}
                                    {lesson.docSubtopics && lesson.docSubtopics.length > 0 && (
                                      <span className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg">
                                        <BookOpen className="w-3.5 h-3.5" /> Readings
                                      </span>
                                    )}
                                    {lesson.linkedAssignments && lesson.linkedAssignments.length > 0 && (
                                      <span className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg">
                                        <FileText className="w-3.5 h-3.5" /> Labs
                                      </span>
                                    )}
                                    {lesson.linkedQuizzes && lesson.linkedQuizzes.length > 0 && (
                                      <span className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
                                        <HelpCircle className="w-3.5 h-3.5" /> Quiz
                                      </span>
                                    )}
                                    {lesson.estimatedMinutes ? (
                                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-auto">
                                        <Clock className="w-3.5 h-3.5" /> {lesson.estimatedMinutes}m
                                      </span>
                                    ) : null}
                                  </div>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No roadmap modules found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}