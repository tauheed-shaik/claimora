import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { ArrowRight, Receipt, FileSpreadsheet, ShieldCheck, Zap } from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-amber-200">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="flex items-center justify-between p-4 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-sm">
              <Receipt className="h-5 w-5 text-stone-900" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-stone-900 font-heading">Claimora</span>
          </div>
          <div>
            {user ? (
              <Link to="/dashboard">
                <Button className="rounded-full px-6">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="rounded-full px-6">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-stone-50 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-400/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        
        <motion.div 
          className="max-w-5xl mx-auto px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            <span>The new standard for deployment expenses</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-stone-900 tracking-tight leading-[1.1] mb-8 font-heading">
            Elevate Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">
              Reimbursement Workflow
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate receipt tracking, generate instant Excel & PDF reimbursement packs, and focus on your mission. Designed for professionals on the move.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="rounded-full w-full sm:w-auto group">
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="lg" className="rounded-full w-full sm:w-auto group">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading mb-4">Everything you need, nothing you don't</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">Claimora is built to eliminate manual Excel logging and fragmented receipt management.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-stone-50 border border-stone-100"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                <Receipt className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-heading">Rapid Receipt Capture</h3>
              <p className="text-stone-600 leading-relaxed">
                Snap photos of your bills on the go. Our system automatically compresses and securely stores them in the cloud.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-stone-50 border border-stone-100"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                <FileSpreadsheet className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-heading">One-Click Export</h3>
              <p className="text-stone-600 leading-relaxed">
                Generate a professional Excel report and a compiled PDF of all receipts instantly. No more manual data entry.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-stone-50 border border-stone-100"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-heading">Secure & Partitioned</h3>
              <p className="text-stone-600 leading-relaxed">
                Your data is strictly partitioned by deployment. Keep your trips organized and your financial data secure.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading mb-4">How Claimora Works</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">Three simple steps to automate your reimbursement workflow.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 -z-10"></div>
            
            {[
              { step: '01', title: 'Create Deployment', desc: 'Set up a new workspace for your upcoming trip or project.' },
              { step: '02', title: 'Log Expenses', desc: 'Snap photos of receipts and log details on the go.' },
              { step: '03', title: 'Export & Get Paid', desc: 'Generate a complete Excel & PDF pack with one click.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                <div className="h-24 w-24 mx-auto bg-white rounded-full border-4 border-stone-50 shadow-xl flex items-center justify-center mb-6 relative z-10">
                  <span className="text-3xl font-bold text-amber-500 font-heading">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3 font-heading">{item.title}</h3>
                <p className="text-stone-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-stone-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-2xl md:text-4xl font-medium leading-tight mb-8 font-heading">
              "Claimora has completely transformed how our field engineers handle expenses. What used to take hours of manual Excel entry now takes seconds."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-stone-800 border border-stone-700 overflow-hidden">
                <img src="https://picsum.photos/seed/sarah/100/100" alt="Sarah J." className="h-full w-full object-cover" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Sarah Jenkins</div>
                <div className="text-stone-400 text-sm">Operations Director, TechCorp</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-amber-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 font-heading mb-6">Ready to streamline your deployments?</h2>
          <p className="text-xl text-stone-800 mb-10 max-w-2xl mx-auto">Join thousands of professionals who have ditched manual spreadsheets for Claimora.</p>
          <Link to={user ? "/dashboard" : "/login"}>
            <Button size="lg" className="rounded-full bg-stone-900 text-white hover:bg-stone-800 hover:scale-105 transition-all shadow-xl">
              {user ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 py-12 text-center text-stone-400">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-md bg-amber-400 flex items-center justify-center">
            <Receipt className="h-3 w-3 text-stone-900" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-heading">Claimora</span>
        </div>
        <p className="text-sm">© 2026 Claimora Expense Automation. All rights reserved.</p>
      </footer>
    </div>
  );
}
