import { useEffect } from 'react';
import { Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const PrivacyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-16 text-center">
                    <Link to="/">
                        <Button variant="ghost" className="mb-8 text-slate-500 hover:text-blue-600 font-bold group">
                            <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Button>
                    </Link>
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-2xl mb-6">
                        <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 mt-2">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        Your privacy is our priority. Learn how we handle your data with transparency and care.
                    </p>
                </div>

                {/* Content */}
                <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[3rem] p-8 lg:p-12 border border-slate-100 dark:border-white/5 shadow-inner space-y-12">

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <Eye className="h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px]">Information We Collect</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            We collect information to provide better services to all our users. This includes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4 font-medium">
                            <li>Account information: Name, email address, and profile details when you sign up.</li>
                            <li>Usage data: Details of how you use our service, such as course progress and quiz scores.</li>
                            <li>Technical data: IP address, browser type, and device information for security and optimization.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <Lock className="h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px]">How We Use Data</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            Your information is used solely to enhance your learning experience:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4 font-medium">
                            <li>To personalize your learning path and track progress.</li>
                            <li>To communicate important updates about the course.</li>
                            <li>To improve our website's functionality and content.</li>
                            <li>To maintain a secure environment for all students.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <FileText className="h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px]">Data Protection</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers and is never sold to third parties. We use industry-standard encryption to protect sensitive data during transmission.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-slate-200 dark:border-white/5 pt-12">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Us</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            If you have any questions about this Privacy Policy, please contact us at:
                            <br />
                            <span className="text-blue-600 dark:text-blue-400 font-bold mt-2 inline-block">parteek.bhatia@gmail.com</span>
                        </p>
                    </section>

                    <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pt-8">
                        Last Updated: February 10, 2026
                    </div>
                </div>
            </div>
        </div>
    );
};
