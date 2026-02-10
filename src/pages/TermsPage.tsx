import { useEffect } from 'react';
import { Scale, Milestone, UserCheck, ShieldAlert, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const TermsPage = () => {
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
                        <Scale className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 mt-2">
                        Terms of Service
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        Please read these terms carefully before using our platform.
                    </p>
                </div>

                {/* Content */}
                <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[3rem] p-8 lg:p-12 border border-slate-100 dark:border-white/5 shadow-inner space-y-12">

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <Milestone className="h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px]">1. Acceptance of Terms</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            By accessing or using DBMastery, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <UserCheck className="h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px]">2. Use License</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            Permission is granted to temporarily access the materials (information or software) on DBMastery's website for personal, non-commercial transitory viewing only.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 ml-4 font-medium text-sm">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose;</li>
                            <li>Attempt to decompile or reverse engineer any software;</li>
                            <li>Remove any copyright or other proprietary notations.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <ShieldAlert className="h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px]">3. Disclaimer</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            The materials on DBMastery's website are provided on an 'as is' basis. DBMastery makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <Scale className="h-5 w-5" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-[11px]">4. Limitations</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            In no event shall DBMastery or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DBMastery's website.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-slate-200 dark:border-white/5 pt-12">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Governing Law</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
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
