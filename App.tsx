import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, Food, AccentColor } from './types';
import { mockAuthService, mockDataService } from './services/mockFirebase';
import { Loader2 } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import Navbar from './components/Navbar';

// --- Color Palettes (Tailwind mapping) ---
const COLOR_PALETTES: Record<AccentColor, Record<string, string>> = {
  blue: { '50': '239 246 255', '100': '219 234 254', '200': '191 219 254', '300': '147 197 253', '400': '96 165 250', '500': '59 130 246', '600': '37 99 235', '700': '29 78 216', '800': '30 64 175', '900': '30 58 138' },
  emerald: { '50': '236 253 245', '100': '209 250 229', '200': '167 243 208', '300': '110 231 183', '400': '52 211 153', '500': '16 185 129', '600': '5 150 105', '700': '4 120 87', '800': '6 95 70', '900': '6 78 59' },
  violet: { '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253', '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149' },
  rose: { '50': '255 241 242', '100': '255 228 230', '200': '254 205 211', '300': '253 164 175', '400': '251 113 133', '500': '244 63 94', '600': '225 29 72', '700': '190 18 60', '800': '159 18 57', '900': '136 19 55' },
  amber: { '50': '255 251 235', '100': '254 243 199', '200': '253 230 138', '300': '252 211 77', '400': '251 191 36', '500': '245 158 11', '600': '217 119 6', '700': '180 83 9', '800': '146 64 14', '900': '120 53 15' },
  cyan: { '50': '236 254 255', '100': '207 250 254', '200': '165 243 252', '300': '103 232 249', '400': '34 211 238', '500': '6 182 212', '600': '8 145 178', '700': '14 116 144', '800': '21 94 117', '900': '22 78 99' },
  teal: { '50': '240 253 250', '100': '204 251 241', '200': '153 246 228', '300': '94 234 212', '400': '45 212 191', '500': '20 184 166', '600': '13 148 136', '700': '15 118 110', '800': '17 94 89', '900': '19 78 74' },
  fuchsia: { '50': '253 244 255', '100': '250 232 255', '200': '245 208 254', '300': '240 171 252', '400': '232 121 249', '500': '217 70 239', '600': '192 34 216', '700': '162 27 182', '800': '134 25 143', '900': '112 26 117' },
  lime: { '50': '247 254 231', '100': '236 252 203', '200': '217 249 157', '300': '190 242 100', '400': '163 230 53', '500': '132 204 22', '600': '101 163 13', '700': '77 124 15', '800': '63 98 18', '900': '54 83 20' },
  slate: { '50': '248 250 252', '100': '241 245 249', '200': '226 232 240', '300': '203 213 225', '400': '148 163 184', '500': '100 116 139', '600': '71 85 105', '700': '51 65 85', '800': '30 41 59', '900': '15 23 42' },
};

// --- Contexts ---

interface AppContextType {
  user: User | null;
  foods: Food[];
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  register: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updatedUser: User) => Promise<void>;
  deleteAccount: () => Promise<void>;
  addFoodItem: (food: Omit<Food, 'id' | 'createdAt'>) => Promise<void>;
  updateFoodItem: (food: Food) => Promise<void>;
  toggleFoodFavorite: (id: string) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply Theme and Accent Color
  useEffect(() => {
    if (!user) return;

    // 1. Dark Mode Logic
    const root = window.document.documentElement;
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    root.classList.remove('light', 'dark');
    if (user.themePreference === 'system') {
      if (isSystemDark) root.classList.add('dark');
    } else {
      root.classList.add(user.themePreference);
    }

    // 2. Accent Color Logic (Update CSS Variables)
    const palette = COLOR_PALETTES[user.accentColor || 'cyan'];
    if (palette) {
      Object.keys(palette).forEach(key => {
        root.style.setProperty(`--primary-${key}`, palette[key]);
      });
    }

  }, [user?.themePreference, user?.accentColor]);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        // Check for existing session in generic storage (simulated)
        const storedUser = localStorage.getItem('mycarbs_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          const foodData = await mockDataService.getFoods();
          setFoods(foodData);
        }
      } catch (e) {
        console.error("Failed to init", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const u = await mockAuthService.signIn(email);
      setUser(u);
      const foodData = await mockDataService.getFoods();
      setFoods(foodData);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      const u = await mockAuthService.loginAsGuest();
      setUser(u);
      const foodData = await mockDataService.getFoods();
      setFoods(foodData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string) => {
    setIsLoading(true);
    try {
      const u = await mockAuthService.signUp(email);
      setUser(u);
      const foodData = await mockDataService.getFoods();
      setFoods(foodData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await mockAuthService.signOut();
      setUser(null);
      setFoods([]);
      // Reset theme
      document.documentElement.classList.remove('dark');
      document.documentElement.style.removeProperty('--primary-500'); // simple cleanup
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updatedUser: User) => {
    const u = await mockAuthService.updateUser(updatedUser);
    setUser(u);
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      await mockAuthService.deleteAccount();
      setUser(null);
      setFoods([]);
      // Reset theme
      document.documentElement.classList.remove('dark');
      document.documentElement.style.removeProperty('--primary-500');
    } finally {
      setIsLoading(false);
    }
  };

  const addFoodItem = async (food: Omit<Food, 'id' | 'createdAt'>) => {
    await mockDataService.addFood(food);
    const updated = await mockDataService.getFoods();
    setFoods(updated);
  };

  const updateFoodItem = async (food: Food) => {
    await mockDataService.updateFood(food);
    const updated = await mockDataService.getFoods();
    setFoods(updated);
  };

  const toggleFoodFavorite = async (id: string) => {
    const updated = await mockDataService.toggleFavorite(id);
    setFoods(updated);
  };

  const deleteFoodItem = async (id: string) => {
    const updated = await mockDataService.deleteFood(id);
    setFoods(updated);
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      foods, 
      isLoading, 
      login, 
      loginAsGuest,
      register,
      logout, 
      updateUserProfile,
      deleteAccount,
      addFoodItem,
      updateFoodItem,
      toggleFoodFavorite,
      deleteFoodItem
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Layouts ---

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAppContext();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto min-h-screen bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300">
         {children}
      </div>
      <Navbar />
    </div>
  );
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppContext();
  if (user && window.location.hash !== '#/features') { // Allow accessing features page even if logged in
     // check handled by routing generally, but FeaturesPage is public
  }
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>;
};

// --- Main App ---

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
          <Route path="/auth" element={<PublicLayout><AuthPage /></PublicLayout>} />
          
          <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
          <Route path="/favorites" element={<PrivateLayout><FavoritesPage /></PrivateLayout>} />
          <Route path="/profile" element={<PrivateLayout><ProfilePage /></PrivateLayout>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}