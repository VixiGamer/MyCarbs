import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Eye, EyeOff, Wheat, User } from 'lucide-react';

const AuthPage: React.FC = () => {
  const { login, register, loginAsGuest } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Default to true (Login), unless param says otherwise
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Handle Query Params for ?mode=signup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'signup') {
        setIsLogin(false);
    } else if (mode === 'login') {
        setIsLogin(true);
    }
  }, [location]);

  const validatePassword = (pwd: string) => {
      const hasLength = pwd.length >= 6;
      const hasNumber = /\d/.test(pwd);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
      
      return {
          isValid: hasLength && hasNumber && hasSpecial,
          details: { hasLength, hasNumber, hasSpecial }
      };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    try {
      if (!isLogin) {
          // --- SIGN UP FLOW ---
          const { isValid, details } = validatePassword(password);
          
          if (!isValid) {
              if (!details.hasLength) setError('Password must be at least 6 characters.');
              else if (!details.hasNumber) setError('Password must contain at least 1 number.');
              else if (!details.hasSpecial) setError('Password must contain at least 1 special character.');
              else setError('Invalid password.');
              return; // STOP: Do not call register
          }

          if (password !== confirmPassword) {
              setError('Passwords do not match.');
              return; // STOP
          }

          // Strict Registration
          await register(email);
          navigate('/dashboard');

      } else {
          // --- LOGIN FLOW ---
          if (password.length < 1) {
              setError('Please enter your password.');
              return;
          }
          
          // Login checks existence in mock service now
          await login(email);
          navigate('/dashboard');
      }
    } catch (err: any) {
        setError(err.message || 'An error occurred.');
    }
  };

  const handleGuestLogin = async () => {
      try {
          await loginAsGuest();
          navigate('/dashboard');
      } catch (err: any) {
          setError(err.message || 'Failed to login as guest.');
      }
  };

  const toggleMode = () => {
      setIsLogin(!isLogin);
      setError('');
      // Update URL without reload to reflect state (optional, but good for refresh)
      window.history.replaceState(null, '', `#/auth?mode=${!isLogin ? 'login' : 'signup'}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col justify-center px-6 transition-colors">
      <div className="w-full max-w-sm mx-auto">
        
        <div className="mb-10 text-center">
           <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-primary-200 dark:shadow-none">
             <Wheat className="w-7 h-7" />
           </div>
           <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
               {isLogin ? 'Welcome Back' : 'Create Account'}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2">Diabetes Food Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all pr-10"
                placeholder="••••••••"
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>
          </div>

          {!isLogin && (
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="••••••••"
                />
                <ul className="mt-3 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <li className={`text-xs flex items-center gap-2 ${password.length >= 6 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} /> 6+ characters
                    </li>
                    <li className={`text-xs flex items-center gap-2 ${/\d/.test(password) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} /> At least 1 number
                    </li>
                    <li className={`text-xs flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} /> At least 1 special char
                    </li>
                </ul>
            </div>
          )}

          {error && <p className="text-rose-600 text-sm bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg font-medium border border-rose-100 dark:border-rose-900/30">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLogin ? 'Log In' : 'Sign Up'} <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-4 text-center">
          <button 
            onClick={toggleMode}
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>

          <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-4 text-xs text-slate-400 uppercase">Or</span>
          </div>

          <button 
            onClick={handleGuestLogin}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 mb-4"
          >
             <User className="w-4 h-4" /> Continue as Guest
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;