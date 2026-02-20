import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, ArrowRight, Smartphone, Wheat } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <header className="fixed w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                <Wheat className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MyCarbs</span>
          </div>
          <Link to="/auth?mode=login" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            Log In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-32 md:pb-20 px-6 max-w-6xl mx-auto text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="w-3 h-3" /> Designed by a Diabetic
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Carb counting <br/>
              <span className="text-primary-600 dark:text-primary-500">reimagined.</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              Stop guessing. Calculate your insulin dosage instantly based on your personal ratio. Simple, fast, and precise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/auth?mode=signup" className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-primary-600 rounded-xl shadow-lg hover:bg-primary-700 transition-all hover:-translate-y-1">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/features" className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Learn More
              </Link>
            </div>
          </div>
          <div className="flex-1 relative w-full mt-10 md:mt-0">
             <div className="w-full max-w-md mx-auto aspect-square bg-blue-50 dark:bg-slate-900 rounded-full flex items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent dark:from-blue-900/20 rounded-full animate-pulse"></div>
               <Activity className="w-32 h-32 text-primary-200 dark:text-primary-900" />
               
               {/* Floating Cards */}
               <div className="absolute top-1/4 -left-2 md:-left-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-in slide-in-from-left duration-700 z-10">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">🍎</div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Apple</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">25g Carbs</p>
                  </div>
               </div>

               <div className="absolute bottom-1/4 -right-2 md:-right-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-in slide-in-from-right duration-700 delay-200 z-10">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">💉</div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Dose</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">2.5 Units</p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why MyCarbs?</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Built for the daily reality of diabetes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Instant Math</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Forget mental math. Input grams or portions, and we apply your personal Insulin-to-Carb Ratio instantly.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
               <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Mobile First</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Large buttons, high contrast, and one-handed operation. Perfect for checking quickly while dining out.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
               <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Personal Database</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Build your own library of foods. Save your favorites and customize portion sizes to what you actually eat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-slate-900 dark:bg-slate-800 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl dark:shadow-none border border-transparent dark:border-slate-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Take control of your numbers.</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto relative z-10">Join thousands of diabetics managing their health with precision.</p>
          <Link to="/auth?mode=signup" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors relative z-10">
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-400 text-sm bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 transition-colors duration-300">
        &copy; {new Date().getFullYear()} MyCarbs. Not medical advice. Consult your doctor.
      </footer>
    </div>
  );
};

export default LandingPage;