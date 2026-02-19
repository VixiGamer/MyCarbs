import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../App';
import { Food, SortOption } from '../types';
import { Search, Plus, ArrowUpDown, Heart, X, CheckCircle, Settings, Edit2, Wheat, Trash2, MinusCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CalculatorModal from '../components/CalculatorModal';
import AddFoodModal from '../components/AddFoodModal';

const Dashboard: React.FC = () => {
  const { foods, user, toggleFoodFavorite, updateFoodItem } = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalInitialCategory, setModalInitialCategory] = useState<string | undefined>(undefined);
  
  // Picker Modal State (for "Add to [Category]")
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<string>('');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickedFoodIds, setPickedFoodIds] = useState<Set<string>>(new Set());

  // Manage List Modal State (New Delete Method)
  const [showManageListModal, setShowManageListModal] = useState(false);
  // Track which items are currently being deleted to show loading state
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // When foods change (deleted/updated), check if selected food still exists
  useEffect(() => {
    if (selectedFood) {
        const found = foods.find(f => f.id === selectedFood.id);
        if (!found) {
            setSelectedFood(null); // Close modal if deleted
        } else {
            // Update selected food reference to reflect edits
            if (found !== selectedFood) setSelectedFood(found);
        }
    }
  }, [foods, selectedFood]);

  // Use categories from user profile
  const allCategories = useMemo(() => {
    return ['All', ...(user?.categories || [])];
  }, [user?.categories]);

  // Filter & Sort Logic
  const filteredFoods = useMemo(() => {
    let result = foods.filter(f => {
      // Check if food matches search
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
      
      // Check if food belongs to category
      let matchesCategory = false;
      if (selectedCategory === 'All') {
          matchesCategory = true;
      } else {
          // Backward compatibility check + array check
          if (f.categories) {
              matchesCategory = f.categories.includes(selectedCategory);
          } else if ((f as any).category) {
              matchesCategory = (f as any).category === selectedCategory;
          }
      }
      return matchesSearch && matchesCategory;
    });

    switch (sortOption) {
      case 'alpha_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'carbs_high':
        result.sort((a, b) => b.carbsPer100g - a.carbsPer100g);
        break;
      case 'carbs_low':
        result.sort((a, b) => a.carbsPer100g - b.carbsPer100g);
        break;
      case 'date_desc':
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }
    return result;
  }, [foods, search, selectedCategory, sortOption]);

  const handleGlobalAdd = () => {
    setModalInitialCategory(selectedCategory === 'All' ? undefined : selectedCategory);
    setShowAddModal(true);
  };

  const handleCategoryAddClick = (cat: string) => {
    setPickerCategory(cat);
    setPickerSearch('');
    setPickedFoodIds(new Set()); 
    setShowPickerModal(true);
  };

  const togglePickFood = (id: string) => {
      const newSet = new Set(pickedFoodIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setPickedFoodIds(newSet);
  };

  const handleConfirmPick = async () => {
      const updates = Array.from(pickedFoodIds).map(id => {
          const food = foods.find(f => f.id === id);
          if (food) {
              const currentCategories = food.categories || [(food as any).category] || [];
              if (!currentCategories.includes(pickerCategory)) {
                  return updateFoodItem({
                      ...food,
                      categories: [...currentCategories, pickerCategory]
                  });
              }
          }
          return Promise.resolve();
      });

      await Promise.all(updates);
      setShowPickerModal(false);
  };

  // Remove from specific list logic
  const handleRemoveFromList = async (e: React.MouseEvent, food: Food) => {
     e.stopPropagation();
     e.preventDefault();

     if (!selectedCategory || selectedCategory === 'All') return;

     // Immediate feedback interaction without window.confirm blocking
     setDeletingIds(prev => new Set(prev).add(food.id));

     try {
         // Get current categories safely
         const currentCategories = food.categories || [];
         
         // Create new array without the selected category
         const newCategories = currentCategories.filter(c => c !== selectedCategory);
         
         await updateFoodItem({
             ...food,
             categories: newCategories
         });
     } catch (error) {
         console.error("Failed to remove item", error);
         alert("Failed to remove item. Please try again.");
     } finally {
         // Remove from deleting state
         setDeletingIds(prev => {
            const next = new Set(prev);
            next.delete(food.id);
            return next;
         });
     }
  };

  const filteredPickerFoods = foods.filter(f => f.name.toLowerCase().includes(pickerSearch.toLowerCase()));

  // Items for the Manage List Modal (specific to current category)
  const manageListItems = foods.filter(f => {
      if (selectedCategory === 'All') return false; 
      if (f.categories) return f.categories.includes(selectedCategory);
      return (f as any).category === selectedCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  if (!user) return null;

  return (
    <div className="pt-6 pb-24 px-4 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* App Header */}
      <Link to="/" className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-200 dark:shadow-none">
             <Wheat className="w-6 h-6" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">MyCarbs</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Diabetes Food Management</p>
        </div>
      </Link>

      {/* Page Controls Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Food Collection</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tap a food to calculate dose</p>
        </div>
        <button 
          onClick={() => handleGlobalAdd()}
          className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full shadow-lg md:hidden"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button 
          onClick={() => handleGlobalAdd()}
          className="hidden md:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          <Plus className="w-5 h-5" /> Add Food
        </button>
      </div>

      {/* Search & Controls */}
      <div className="space-y-4 mb-6 sticky top-0 z-30 bg-slate-50 dark:bg-slate-950 pt-2 pb-4 transition-colors">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search foods..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
             <select 
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value as SortOption)}
               className="appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 pl-9 pr-8 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-primary-500"
             >
               <option value="date_desc">Newest</option>
               <option value="alpha_asc">A-Z</option>
               <option value="carbs_high">High Carb</option>
               <option value="carbs_low">Low Carb</option>
             </select>
             <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Category Chips */}
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                selectedCategory === cat
                  ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Manage Lists Button */}
          <Link 
            to="/profile"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-colors"
            title="Manage Sections"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Modify List items toolbar - Only show when a specific category is selected */}
        {selectedCategory !== 'All' && (
            <div className="flex flex-row items-center justify-center gap-2 p-2 rounded-xl border bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30 animate-in fade-in slide-in-from-top-2 mx-auto max-w-lg">
                <button 
                    onClick={() => setShowManageListModal(true)}
                    className="flex-1 justify-center text-xs font-bold px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-sm"
                >
                    <Edit2 className="w-4 h-4" /> Manage Foods
                </button>
                <button 
                    onClick={() => handleCategoryAddClick(selectedCategory)}
                    className="flex-1 justify-center bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add to {selectedCategory}
                </button>
            </div>
        )}
      </div>

      {/* MAIN GRID/LIST VIEW */}
      <div className={
        user.viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" 
            : "grid grid-cols-1 md:grid-cols-2 gap-3" // List mode now uses Grid with 1 col mobile, 2 cols desktop
      }>
        {filteredFoods.map((food) => (
          <div 
            key={food.id}
            onClick={() => setSelectedFood(food)}
            className={`group bg-white dark:bg-slate-900 shadow-sm border cursor-pointer hover:shadow-md transition-all active:scale-[0.99] overflow-hidden flex relative ${
                user.viewMode === 'grid' 
                    ? 'flex-col rounded-xl' 
                    : 'flex-row items-center p-2 rounded-lg gap-3'
            } border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900`}
          >

            {/* Image Container */}
            <div className={`relative flex-shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden ${
                user.viewMode === 'grid' 
                    ? 'w-full aspect-square' 
                    : 'w-12 h-12 rounded-lg'
            }`}>
              <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
            </div>

            {/* Content Container */}
            <div className={`flex-1 min-w-0 ${user.viewMode === 'grid' ? 'p-3' : ''}`}>
              <div className="flex justify-between items-start">
                <h3 className={`font-bold text-slate-900 dark:text-white truncate ${user.viewMode === 'grid' ? 'text-sm mb-1' : 'text-sm'}`}>
                    {food.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {food.categories ? food.categories.join(', ') : (food as any).category}
              </p>
              
              <div className="mt-1">
                 <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                   {food.carbsPer100g}g / 100g
                 </span>
              </div>
            </div>

            {/* Favorite Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFoodFavorite(food.id);
                }}
                className={`transition-colors rounded-full flex items-center justify-center ${
                    user.viewMode === 'grid' 
                        ? 'absolute top-2 right-2 p-1.5 shadow-sm' 
                        : 'p-2'
                } ${
                    food.isFavorite
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                    : user.viewMode === 'grid' 
                        ? 'text-slate-400 bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70' 
                        : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                >
                <Heart className={`w-5 h-5 ${food.isFavorite ? 'fill-current' : ''}`} />
            </button>

          </div>
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center animate-in fade-in zoom-in-95">
           <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <Wheat className="w-8 h-8 text-slate-300 dark:text-slate-600" />
           </div>
           <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">
               {selectedCategory === 'All' ? 'No foods found' : `No foods in ${selectedCategory}`}
           </p>
           <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
               {selectedCategory === 'All' ? 'Try adjusting your search or add a new food.' : `Tap the "Add to ${selectedCategory}" button to populate this list.`}
           </p>
        </div>
      )}

      {/* MANAGE LIST MODAL */}
      {showManageListModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Manage {selectedCategory}</h3>
                        <p className="text-xs text-slate-500">Remove items from this list</p>
                    </div>
                    <button onClick={() => setShowManageListModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {manageListItems.length === 0 ? (
                         <div className="text-center py-8 text-slate-400">
                             <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                             <p>No items in this list.</p>
                         </div>
                    ) : (
                        manageListItems.map(f => (
                            <div key={f.id} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                <img src={f.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-slate-200" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{f.name}</p>
                                    <p className="text-xs text-slate-500">{f.categories ? f.categories.join(', ') : (f as any).category}</p>
                                </div>
                                <button 
                                    onClick={(e) => handleRemoveFromList(e, f)}
                                    disabled={deletingIds.has(f.id)}
                                    className={`p-2 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] ${
                                        deletingIds.has(f.id) 
                                        ? 'bg-slate-100 dark:bg-slate-800' 
                                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                                    }`}
                                    title="Remove from list"
                                >
                                    {deletingIds.has(f.id) ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => setShowManageListModal(false)}
                        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl transition-all"
                    >
                        Done
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* PICKER MODAL */}
      {showPickerModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Add to {pickerCategory}</h3>
                    <button onClick={() => setShowPickerModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            autoFocus
                            placeholder="Search existing foods..."
                            value={pickerSearch}
                            onChange={(e) => setPickerSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredPickerFoods.map(f => {
                         const isSelected = pickedFoodIds.has(f.id);
                         const alreadyInCat = f.categories ? f.categories.includes(pickerCategory) : (f as any).category === pickerCategory;
                         
                         if (alreadyInCat) return null; 

                         return (
                            <div key={f.id} onClick={() => togglePickFood(f.id)} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <img src={f.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-slate-200" />
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{f.name}</p>
                                    <p className="text-xs text-slate-500">{f.categories ? f.categories.join(', ') : (f as any).category}</p>
                                </div>
                            </div>
                        );
                    })}
                    {filteredPickerFoods.length === 0 && (
                        <p className="text-center text-slate-400 py-8 text-sm">No foods match your search.</p>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={handleConfirmPick}
                        disabled={pickedFoodIds.size === 0}
                        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
                    >
                        Add {pickedFoodIds.size} Foods
                    </button>
                </div>
             </div>
        </div>
      )}

      {selectedFood && (
        <CalculatorModal 
          food={selectedFood} 
          user={user} 
          onClose={() => setSelectedFood(null)} 
        />
      )}

      {showAddModal && (
        <AddFoodModal 
          initialCategory={modalInitialCategory} 
          onClose={() => { setShowAddModal(false); setModalInitialCategory(undefined); }} 
        />
      )}
    </div>
  );
};

export default Dashboard;