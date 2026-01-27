import { motion } from "framer-motion";
import { Typewriter } from "./Typewriter";
import { GRADIENTS } from "../constants";
import { Footer } from "./Footer";
import { 
  Users, 
  BookOpen, 
  Award, 
  Target, 
  Heart,
  CheckCircle,
  Lightbulb,
  Shield,
  Database,
  Code,
  GraduationCap
} from "lucide-react";

// Professional Logo Component
const Logo = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="relative">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
        <Database className="w-12 h-12 text-white" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
        <Code className="w-4 h-4 text-white" />
      </div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
        <GraduationCap className="w-3 h-3 text-white" />
      </div>
    </div>
  </div>
);

interface AboutPageProps {}

export function AboutPage({}: AboutPageProps) {
  const stats = [
    { icon: Users, label: "Students Worldwide", value: "50,000+" },
    { icon: BookOpen, label: "Course Modules", value: "17" },
    { icon: Award, label: "Years Teaching", value: "15+" },
    { icon: Target, label: "Success Rate", value: "98%" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">

      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Logo />
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                About
              </span>{" "}
              <span className="text-gray-900 dark:text-white">Course Hub</span>
            </h1>
            <div className="mb-8">
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-4">
                <Typewriter text="Empowering students worldwide with expert-led database education and practical skills for career success." delay={2000} speed={50} />
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                by <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">Parteek Bhatia</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Company Overview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Students learning" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  <Typewriter text="Our Mission" delay={300} speed={120} />
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                To democratize high-quality database education by making expert-level instruction accessible to students worldwide, 
                regardless of their background or location.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                We bridge the gap between academic theory and industry practice, ensuring our students are not just 
                knowledgeable but also job-ready.
              </p>
              <div className="space-y-4">
                {[
                  "Top-rated DBMS course with 4.9/5 student rating",
                  "Featured instructor from Washington State University",
                  "Comprehensive curriculum covering all fundamentals"
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instructor Spotlight */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Meet Dr. Parteek Kumar Bhatia
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              World-renowned database expert and educator
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-1">
              <img 
                src="https://parteekbhatia.com/assets/image-BndRrwmw.png" 
                alt="Dr. Parteek Kumar Bhatia" 
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Associate Professor, Washington State University
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-4">
                  Ph.D. in Computer Science | 15+ Years Teaching Experience
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Academic Excellence</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                    <li>• Ph.D. from Thapar Institute</li>
                    <li>• Postdoc at Tel Aviv University</li>
                    <li>• 100+ Published Research Papers</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Industry Impact</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                    <li>• Young Faculty Research Fellow</li>
                    <li>• 50,000+ Students Taught</li>
                    <li>• Industry Consultant</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Dr. Bhatia brings over 15 years of academic and industry experience to make complex database concepts 
                accessible to students worldwide. His teaching methodology combines theoretical depth with practical applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                Our Impact in Numbers
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Measurable results that demonstrate our commitment to educational excellence
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                className="text-center"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                  <div className={`${GRADIENTS.gradientAccent} w-16 h-16 mx-auto mb-6 rounded-xl p-4 shadow-lg`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Experience */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                <Typewriter text="Why Students Choose Us" delay={200} speed={120} />
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Student-First Approach",
                description: "Every decision we make prioritizes student success and learning outcomes.",
                image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              },
              {
                icon: Lightbulb,
                title: "Innovation in Education",
                description: "Cutting-edge teaching methods combined with proven academic principles.",
                image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              },
              {
                icon: Shield,
                title: "Quality Assurance",
                description: "Rigorous content review and continuous improvement based on student feedback.",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 + 0.3, duration: 0.6 }}
                className="group"
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <img 
                    src={value.image} 
                    alt={value.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-600 p-3">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}