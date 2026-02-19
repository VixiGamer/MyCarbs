import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Heart, User, PlusCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:top-0 md:bottom-auto md:max-w-7xl md:mx-auto md:relative md:border-b z-50 transition-colors">
      <div className="flex justify-around items-center h-16 md:px-6">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/dashboard') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-xs font-medium">Foods</span>
        </Link>
        
        <Link 
          to="/favorites" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/favorites') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs font-medium">Favorites</span>
        </Link>

        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/profile') ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;