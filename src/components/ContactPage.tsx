import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GRADIENTS, BUTTON_STYLES, fadeIn, fadeInUp } from "@/constants";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,

  MessageCircle
} from "lucide-react";

interface ContactPageProps {
  onBack: () => void;
}


export function ContactPage({}: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // FAQ state for expand/collapse
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Handle form submission
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "support@coursehub.com",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 5pm"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Washington State University",
      description: "Pullman, WA, USA"
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: "9:00 AM - 6:00 PM",
      description: "Monday to Friday"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className={`text-5xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg`}>
              Contact <span className={`text-gray-900 dark:text-white ${GRADIENTS.gradientText}`}>Us</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about our courses? Need support? We're here to help you succeed in your learning journey.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Info & Form Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-2xl transition-all duration-300"
              >
                <div className={`${GRADIENTS.gradientAccent} w-16 h-16 mx-auto mb-5 rounded-xl p-4 flex items-center justify-center shadow-lg`}>
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{info.title}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">{info.details}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-10"
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-6`}>Send us a Message</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Fill out the form below and we'll get back to you as soon as possible. 
                We typically respond within 24 hours.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this regarding?"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <Button type="submit" className={`${BUTTON_STYLES.gradient} w-full py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200`}>
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* FAQ Section - Interactive Accordion */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-10 shadow-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center mb-6">
                <MessageCircle className={`${GRADIENTS.gradientAccent} w-8 h-8 p-1 rounded-lg text-white mr-3`} />
                <h3 className={`text-2xl font-bold mb-0`}>Frequently Asked Questions</h3>
              </div>
              <div className="space-y-4">
                {[
                  {
                    q: "How long does it take to complete the course?",
                    a: "The course is self-paced and typically takes 4-6 weeks to complete, depending on your schedule and learning pace."
                  },
                  {
                    q: "Do I get a certificate upon completion?",
                    a: "Yes, you'll receive a certificate of completion that you can add to your LinkedIn profile and resume."
                  },
                  {
                    q: "Is there any prerequisite knowledge required?",
                    a: "No prerequisites required! The course is designed for complete beginners and builds up from the fundamentals."
                  },
                  {
                    q: "What kind of support do you provide?",
                    a: "We provide email support, discussion forums, and regular Q&A sessions with the instructor."
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none transition-colors duration-200 ${openFaq === idx ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      aria-expanded={openFaq === idx}
                    >
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{faq.q}</span>
                      <svg className={`w-5 h-5 ml-2 transform transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <motion.div
                      initial={false}
                      animate={openFaq === idx ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {openFaq === idx && (
                        <div className="px-6 pb-5 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}