import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/Typewriter";
import { GRADIENTS, BUTTON_STYLES, fadeIn, staggerContainer, scaleIn, fadeInUp, slideIn } from "@/constants";
import {
  Users,
  BookOpen,
  Award,

  Star,
  Play,
  Clock,
  Globe,
  Smartphone,
  Code,
  Target,
  Zap,
  Shield,
  TrendingUp,
  GraduationCap,
  ExternalLink,
  Youtube,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";

interface HomePageProps {
  onAuthOpen: (mode: 'login' | 'signup') => void;
}

export function HomePage({ onAuthOpen }: HomePageProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const curriculumScrollRef = useRef<HTMLElement>(null);
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [curriculumRef, curriculumInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [instructorRef, instructorInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.1, triggerOnce: true });

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Function to scroll to curriculum section
  const scrollToCurriculum = () => {
    curriculumScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to handle start learning click
  const handleStartLearning = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      onAuthOpen('signup');
    }
  };

  const topics = [
    { icon: BookOpen, title: "Basics of DBMSs", description: "Foundation concepts and principles" },
    { icon: Code, title: "DBMS vs File System", description: "Understanding the key differences" },
    { icon: Target, title: "Three Level Architecture", description: "External, Conceptual, and Internal levels" },
    { icon: Zap, title: "Data Models", description: "Relational, Hierarchical, Network models" },
    { icon: Shield, title: "Keys & Constraints", description: "Primary, Foreign, Super, Candidate keys" },
    { icon: BookOpen, title: "ER Model Design", description: "Entity Relationship modeling" },
    { icon: Users, title: "Entity Concepts", description: "Strong/weak entities, dependencies" },
    { icon: TrendingUp, title: "ER to Tables", description: "Converting models to database tables" },
    { icon: Award, title: "Normalization", description: "1NF, 2NF, 3NF, BCNF concepts" },
    { icon: BookOpen, title: "Functional Dependencies", description: "Full, Partial, Transitive dependencies" },
    { icon: Clock, title: "Transaction Management", description: "ACID properties and concurrency" },
    { icon: Code, title: "SQL Fundamentals", description: "Table creation and management" },
    { icon: Play, title: "Data Operations", description: "Insert, Update, Delete operations" },
    { icon: Globe, title: "Table Modifications", description: "ALTER TABLE commands" },
    { icon: Smartphone, title: "SQL Joins", description: "Inner, Outer, Self joins" },
    { icon: Star, title: "Advanced Joins", description: "Cartesian products and complex joins" },
    { icon: GraduationCap, title: "Data Grouping", description: "GROUP BY and aggregate functions" }
  ];

  const features = [
    {
      icon: Globe,
      title: "Zero Prerequisites",
      description: "No prior technical experience required. Just need a computer/mobile with internet connectivity."
    },
    {
      icon: Users,
      title: "Beginner Friendly",
      description: "Designed for complete beginners who want to quick start their database career in short time."
    },
    {
      icon: BookOpen,
      title: "University Focused",
      description: "Perfect preparation for university examinations with comprehensive coverage of all topics."
    },
    {
      icon: Award,
      title: "Interview Ready",
      description: "Prepare for placement interviews with practical knowledge and real-world examples."
    },
    {
      icon: BookOpen,
      title: "Industry Standards",
      description: "Learn Oracle, SQL Server, MySQL, PostgreSQL - the leading commercial and open-source systems."
    },
    {
      icon: Smartphone,
      title: "Flexible Access",
      description: "Learn from any device - computer or mobile phone. Study at your own pace, anywhere."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="text-center"
          >
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                <span className="text-gray-900 dark:text-white">Master Database Management</span>
                <br />
                <span className={GRADIENTS.gradientText}>
                  <Typewriter text="From Zero to Expert" delay={1000} speed={100} />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Learn everything about databases - from basic concepts to advanced SQL operations. 
                <span className={`font-semibold ${GRADIENTS.gradientText}`}>Perfect for students, professionals, and interview preparation.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
              <Button 
                size="lg" 
                className={BUTTON_STYLES.gradient + " text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 rounded-xl w-full sm:w-auto"}
                onClick={handleStartLearning}
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Start Learning Now
              </Button>
              <Button 
                size="lg" 
                className={
                  "border bg-white dark:bg-gray-900 border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 rounded-xl w-full sm:w-auto shadow-sm transition-all duration-200"
                }
                onClick={scrollToCurriculum}
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-black dark:text-white" />
                View Curriculum
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-5xl mx-auto px-4">
              {[
                { icon: Users, label: "Students Enrolled", value: "10,000+" },
                { icon: Clock, label: "Hours of Content", value: "25+" },
                { icon: BookOpen, label: "Topics Covered", value: "17" },
                { icon: Award, label: "Success Rate", value: "98%" }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeIn} 
                  className="text-center"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className={GRADIENTS.gradientAccent + " w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg"}>
                      <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instructor Section */}
      <section ref={instructorRef} className="py-20 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={instructorInView ? "visible" : "hidden"}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
                Meet Your Instructor
              </h2>
              <p className="text-lg sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Learn from a world-class academic expert with extensive research and teaching experience
              </p>
            </motion.div>

            <div className="flex flex-col lg:flex-row items-center gap-12 sm:gap-16 max-w-6xl mx-auto">
              <motion.div 
                className="flex-shrink-0"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img 
                  src="https://parteekbhatia.com/assets/image-BndRrwmw.png" 
                  alt="Dr. Parteek Kumar Bhatia" 
                  className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover shadow-2xl"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex-1 text-left">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Dr. Parteek Kumar Bhatia
                </h3>
                <p className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-semibold mb-6 sm:mb-8">
                  Associate Professor, Washington State University
                </p>
                <div className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                  <p className="mb-4">
                    Dr. Parteek Kumar Bhatia is an Associate Professor in the School of Electrical Engineering and Computer Science at Washington State University. He previously served as Professor and Associate Dean at Thapar Institute of Engineering and Technology, India.
                  </p>
                  <p>
                    He holds a Ph.D. in Computer Science from Thapar Institute and completed postdoctoral research at Tel Aviv University. He is a recipient of the prestigious Young Faculty Research Fellowship from the Government of India.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className={`${GRADIENTS.gradientAccent} text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg`}
                    onClick={() => window.open('https://parteekbhatia.com/about', '_blank')}
                  >
                    Read More
                  </Button>
                  <div className="flex gap-3 justify-center sm:justify-start">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-gray-300 hover:border-[#4D7BEB] hover:bg-[#4D7BEB]/5 transition-all duration-200"
                      onClick={() => window.open('https://parteekbhatia.com', '_blank')}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-200"
                      onClick={() => window.open('https://www.youtube.com/@parteekbhatia', '_blank')}
                    >
                      <Youtube className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-gray-300 hover:border-gray-800 hover:bg-gray-50 transition-all duration-200"
                      onClick={() => window.open('https://github.com/bhatiaparteek', '_blank')}
                    >
                      <Github className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all duration-200"
                      onClick={() => window.open('https://www.linkedin.com/in/parteek-kumar-0237ab33/', '_blank')}
                    >
                      <Linkedin className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
          >
            <motion.div variants={fadeInUp} className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                <Typewriter text="Why Choose This Course?" delay={300} speed={80} />
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Designed for complete beginners with no prior technical experience required
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  variants={scaleIn}
                  className="group relative overflow-hidden"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 h-full">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${GRADIENTS.gradientAccent} p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6">{feature.description}</p>
            
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section ref={curriculumScrollRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={curriculumRef}
            variants={staggerContainer}
            initial="hidden"
            animate={curriculumInView ? "visible" : "hidden"}
          >
            <motion.div variants={fadeInUp} className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                <Typewriter text="Complete Curriculum" delay={200} speed={90} />
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                From basic concepts to advanced SQL operations - everything you need to master databases
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {topics.map((topic, index) => (
                <motion.div 
                  key={index} 
                  variants={slideIn}
                  className="group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 h-full">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className={`${GRADIENTS.gradientAccent} rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <topic.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">{topic.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{topic.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Master Database Management?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of students who have transformed their careers with Parteek Bhatia's comprehensive DBMS course. 
                Start your journey from zero to database expert today!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-12">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className={BUTTON_STYLES.gradient + " text-lg sm:text-xl px-10 sm:px-12 py-4 sm:py-6 rounded-xl w-full sm:w-auto"}
                    onClick={handleStartLearning}
                  >
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    Enroll Now - Start Learning
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className={
                      "border bg-white dark:bg-gray-900 border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 text-lg sm:text-xl px-10 sm:px-12 py-4 sm:py-6 rounded-xl w-full sm:w-auto shadow-sm transition-all duration-200"
                    }
                  >
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-black dark:text-white" />
                    Download Syllabus
                  </Button>
                </motion.div>
              </div>

            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}