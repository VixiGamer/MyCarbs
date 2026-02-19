import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Palette, Smartphone, Calculator, List, Lock, Heart, Edit2, LayoutGrid } from 'lucide-react';

const FeatureItem: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="flex gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
    <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="fixed w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Link>
          <span className="font-bold text-slate-900 dark:text-white">All Features</span>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Complete Feature Set</h1>
            <p className="text-slate-500 dark:text-slate-400">Discover everything MyCarbs can do for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureItem 
                icon={<Calculator className="w-6 h-6" />}
                title="Smart Insulin Calculator"
                desc="Calculates insulin dosage instantly based on your personal Insulin-to-Carb Ratio (ICR). Supports both portion-based and weight-based (grams) calculations."
            />
             <FeatureItem 
                icon={<List className="w-6 h-6" />}
                title="Custom Food Library"
                desc="Create, edit, and delete foods. Organize them into categories. Duplicate existing foods to quickly expand your database."
            />
             <FeatureItem 
                icon={<Palette className="w-6 h-6" />}
                title="Deep Personalization"
                desc="Choose from 10 accent colors and toggle between Light, Dark, or System themes. customize your experience to match your style."
            />
            <FeatureItem 
                icon={<Smartphone className="w-6 h-6" />}
                title="Mobile Optimized"
                desc="Large buttons, easy scrolling, and one-handed navigation designed for use on the go. Swipe, tap, and calculate."
            />
            <FeatureItem 
                icon={<Edit2 className="w-6 h-6" />}
                title="Custom Quantities"
                desc="Configure specific quick-select buttons (e.g., 0.5, 1, 2) for each individual food item to match your usual serving sizes."
            />
             <FeatureItem 
                icon={<LayoutGrid className="w-6 h-6" />}
                title="Flexible Views"
                desc="Switch between Grid View (visual cards) and List View (compact rows) in your settings to browse your food collection your way."
            />
             <FeatureItem 
                icon={<Heart className="w-6 h-6" />}
                title="Favorites System"
                desc="Mark your most frequent meals as favorites for instant access. Filter specifically for favorites to save time."
            />
            <FeatureItem 
                icon={<Lock className="w-6 h-6" />}
                title="Enhanced Security"
                desc="Secure account management with password visibility toggles and confirmation checks to ensure your data stays safe."
            />
        </div>

        <div className="mt-12 p-6 bg-primary-600 rounded-3xl text-center text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
            <Link to="/auth" className="inline-block bg-white text-primary-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                Create Account
            </Link>
        </div>
      </main>
    </div>
  );
};

export default FeaturesPage;