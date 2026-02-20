import React, { useState, useRef } from 'react';
import { useAppContext } from '../App';
import { Settings, LogOut, Save, User as UserIcon, Plus, Trash2, LayoutGrid, Edit2, X, Check, Camera, Moon, Sun, Monitor, Palette, MousePointerClick, List, Wheat, Download, Upload, AlertTriangle, Database } from 'lucide-react';
import { ThemeOption, AccentColor, ViewMode } from '../types';
import { Link } from 'react-router-dom';

const COLORS: AccentColor[] = ['blue', 'emerald', 'violet', 'rose', 'amber', 'cyan', 'teal', 'fuchsia', 'lime', 'slate'];

const ProfilePage: React.FC = () => {
  const { user, logout, updateUserProfile, foods, addFoodItem } = useAppContext();
  
  const [icr, setIcr] = useState(user?.icr || 15);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  
  // Use user.categories instead of splitting
  const [categories, setCategories] = useState<string[]>(user?.categories || []);
  
  // Appearance
  const [theme, setTheme] = useState<ThemeOption>(user?.themePreference || 'system');
  const [accent, setAccent] = useState<AccentColor>(user?.accentColor || 'blue');
  const [viewMode, setViewMode] = useState<ViewMode>(user?.viewMode || 'grid');

  // Custom Section Management
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // UI States
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingInsulin, setIsEditingInsulin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSaveAccount = async () => {
    await updateUserProfile({ 
      ...user, 
      name,
      email,
      photoUrl,
    });
    setIsEditingAccount(false);
  };

  const handleSaveInsulin = async () => {
    await updateUserProfile({ 
      ...user, 
      icr: Number(icr),
    });
    setIsEditingInsulin(false);
  };

  // Immediate Autosave for Appearance & Categories
  const changeTheme = async (t: ThemeOption) => {
    setTheme(t);
    await updateUserProfile({ ...user, themePreference: t });
  };

  const changeAccent = async (c: AccentColor) => {
    setAccent(c);
    await updateUserProfile({ ...user, accentColor: c });
  };

  const changeViewMode = async (v: ViewMode) => {
      setViewMode(v);
      await updateUserProfile({ ...user, viewMode: v });
  };

  // Categories Logic - Autosave logic
  const saveCategories = async (newCats: string[]) => {
      setCategories(newCats);
      await updateUserProfile({ ...user, categories: newCats });
  };

  const addCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updated = [...categories, newCategory.trim()];
      await saveCategories(updated);
      setNewCategory('');
    }
  };

  const deleteCategory = async (index: number) => {
    if (window.confirm(`Are you sure you want to delete the section "${categories[index]}"?`)) {
        const updated = [...categories];
        updated.splice(index, 1);
        await saveCategories(updated);
    }
  };

  const startEditCategory = (index: number, currentName: string) => {
    setEditingCategoryIndex(index);
    setEditingCategoryName(currentName);
  };

  const saveEditCategory = async (index: number) => {
    if (editingCategoryName.trim()) {
      const updated = [...categories];
      updated[index] = editingCategoryName.trim();
      await saveCategories(updated);
      setEditingCategoryIndex(null);
    }
  };

  // Photo Upload Logic
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Export Logic
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(foods, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mycarbs_foods.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import Logic
  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedFoods = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedFoods)) {
          if (window.confirm(`Found ${importedFoods.length} foods. Import them? This will add them to your existing library.`)) {
             let count = 0;
             for (const food of importedFoods) {
               if (food.name && food.carbsPer100g) {
                 // Strip ID and createdAt to generate new ones
                 const { id, createdAt, ...rest } = food;
                 await addFoodItem(rest);
                 count++;
               }
             }
             alert(`Successfully imported ${count} foods.`);
          }
        } else {
            alert("Invalid file format. Expected a list of foods.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse JSON file.");
      }
      // Reset input
      if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="pt-6 pb-24 px-4 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* App Header */}
      <Link to="/" className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-200 dark:shadow-none">
             <Wheat className="w-6 h-6" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
              Hello {user.name || user.email.split('@')[0]}
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">MyCarbs - Diabetes Food Management</p>
        </div>
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account and medical settings</p>
      </div>

      {/* Grid Layout for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Column 1 */}
        <div className="space-y-6">
            {/* User Info / Edit Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-slate-400" /> Account Details
                </h3>
                {isEditingAccount ? (
                    <div className="flex gap-2">
                        <button onClick={handleSaveAccount} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg">Save</button>
                        <button onClick={() => setIsEditingAccount(false)} className="text-xs text-slate-500">Cancel</button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsEditingAccount(true)}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                        Edit
                    </button>
                )}
                </div>
                
                <div className="flex flex-col items-center mb-6">
                <div 
                    onClick={handlePhotoClick}
                    className="relative group w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-4 cursor-pointer hover:border-primary-400 transition-colors"
                >
                    {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <UserIcon className="w-10 h-10" />
                    </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    </div>
                    
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                    />
                </div>
                
                <div className="w-full space-y-4">
                    {isEditingAccount ? (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nickname</label>
                            <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                            <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="you@example.com"
                            />
                        </div>
                    </>
                    ) : (
                        <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{name || user.email.split('@')[0]}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                    )}
                </div>
                </div>
            </div>

            {/* Insulin Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Insulin Settings</h3>
                    </div>
                    {isEditingInsulin ? (
                        <div className="flex gap-2">
                            <button onClick={handleSaveInsulin} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg">Save</button>
                            <button onClick={() => setIsEditingInsulin(false)} className="text-xs text-slate-500">Cancel</button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsEditingInsulin(true)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                            Edit
                        </button>
                    )}
                </div>

                <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Insulin-to-Carb Ratio (ICR)
                </label>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400">1 :</span>
                    {isEditingInsulin ? (
                        <input 
                        type="number" 
                        value={icr}
                        onChange={(e) => setIcr(Number(e.target.value))}
                        className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-lg font-bold focus:ring-2 focus:ring-primary-500 outline-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    ) : (
                         <div className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-lg font-bold">
                            {icr}
                         </div>
                    )}
                    <span className="text-sm font-bold text-slate-400">g</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Example: 1 unit of insulin covers {icr} grams of carbs.</p>
                </div>
            </div>
        </div>
        
        {/* Column 2 */}
        <div className="space-y-6">
            {/* Categories */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                <LayoutGrid className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">Food Sections</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Manage the list of categories available for your foods.</p>
                
                <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                {categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    {editingCategoryIndex === idx ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input 
                            type="text" 
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-primary-300 focus:outline-none text-sm dark:text-white"
                            autoFocus
                            />
                            <button onClick={() => saveEditCategory(idx)} className="text-emerald-500 p-1"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingCategoryIndex(null)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{cat}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => startEditCategory(idx, cat)} className="text-slate-400 hover:text-primary-600 p-1">
                            <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteCategory(idx)} className="text-rose-300 hover:text-rose-600 p-1">
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        </>
                    )}
                    </div>
                ))}
                {categories.length === 0 && (
                    <p className="text-sm text-slate-400 italic">No sections available.</p>
                )}
                </div>

                <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="New Category..."
                />
                <button 
                    onClick={addCategory}
                    className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 p-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50"
                >
                    <Plus className="w-6 h-6" />
                </button>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">Appearance</h3>
                </div>

                {/* View Mode */}
                <div className="mb-6">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">View Mode</p>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                    onClick={() => changeViewMode('grid')}
                    className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'grid' 
                        ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    >
                    <LayoutGrid className="w-4 h-4" /> Grid
                    </button>
                    <button
                    onClick={() => changeViewMode('list')}
                    className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'list' 
                        ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    >
                    <List className="w-4 h-4" /> List
                    </button>
                </div>
                </div>

                {/* Theme Switcher */}
                <div className="mb-6">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Theme</p>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {(['system', 'light', 'dark'] as ThemeOption[]).map((t) => (
                        <button
                        key={t}
                        onClick={() => changeTheme(t)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                            theme === t 
                            ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        >
                        {t === 'system' && <Monitor className="w-4 h-4" />}
                        {t === 'light' && <Sun className="w-4 h-4" />}
                        {t === 'dark' && <Moon className="w-4 h-4" />}
                        <span className="capitalize">{t}</span>
                        </button>
                    ))}
                </div>
                </div>

                {/* Accent Color */}
                <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Accent Color</p>
                <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => (
                        <button
                        key={c}
                        onClick={() => changeAccent(c)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            accent === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: `var(--color-${c}-500, ${c === 'slate' ? '#64748b' : ''})` }} 
                        >
                        {/* Inline styles for preview bubbles */}
                        <div className={`w-8 h-8 rounded-full ${
                            c === 'blue' ? 'bg-blue-500' : 
                            c === 'emerald' ? 'bg-emerald-500' :
                            c === 'violet' ? 'bg-violet-500' :
                            c === 'rose' ? 'bg-rose-500' :
                            c === 'amber' ? 'bg-amber-500' :
                            c === 'cyan' ? 'bg-cyan-500' :
                            c === 'teal' ? 'bg-teal-500' :
                            c === 'fuchsia' ? 'bg-fuchsia-500' :
                            c === 'lime' ? 'bg-lime-500' :
                            'bg-slate-500'
                        }`}>
                            {accent === c && <Check className="w-5 h-5 text-white mx-auto mt-1.5" />}
                        </div>
                        </button>
                    ))}
                </div>
                </div>
            </div>
        </div>
      </div>

      {/* Data Management Section (Moved to bottom) */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">Data Management</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                <Download className="w-4 h-4" /> Export Foods (JSON)
            </button>
            
            <div className="relative">
                <button 
                    onClick={handleImportClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <Upload className="w-4 h-4" /> Import Foods (JSON)
                </button>
                <input 
                    type="file" 
                    ref={importInputRef} 
                    onChange={handleImportFile} 
                    accept=".json" 
                    className="hidden" 
                />
            </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                <strong>Note:</strong> Currently, MyCarbs saves your data directly in your browser (Local Storage). 
                We are working on cloud synchronization to securely store your foods in a database soon. 
                Please export your data regularly to avoid losing it if you clear your browser cache.
            </p>
        </div>
      </div>

      {/* Footer - Log Out Only */}
      <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-6 border-t border-slate-200 dark:border-slate-800 pt-8">
        <button 
            onClick={logout}
            className="w-full md:w-auto px-8 py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 font-semibold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center gap-2"
        >
            <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      {/* Footer Text */}
      <footer className="mt-8 py-6 text-center text-xs text-slate-400">
        MyCarbs v1.1
      </footer>

    </div>
  );
};

export default ProfilePage;