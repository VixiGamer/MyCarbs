import React, { useState, useEffect } from 'react';
import { FoodCategory, Food } from '../types';
import { X, Upload, Check, Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Search, Copy } from 'lucide-react';
import { useAppContext } from '../App';

interface AddFoodModalProps {
  onClose: () => void;
  existingFood?: Food; // If present, we are editing
  initialCategory?: string; // Pre-select a category
}

const QUANTITY_OPTIONS = [0.17, 0.25, 0.33, 0.5, 0.67, 0.75, 0.83, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

const AddFoodModal: React.FC<AddFoodModalProps> = ({ onClose, existingFood, initialCategory }) => {
  const { addFoodItem, updateFoodItem, user, foods } = useAppContext();
  
  // Form State
  const [name, setName] = useState('');
  const [carbsPer100g, setCarbsPer100g] = useState('');
  // Changed to array state for multi-select
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customQuantities, setCustomQuantities] = useState<number[]>([0.5, 1, 2, 3]);
  
  // Image State
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');

  // Portions State
  const [portions, setPortions] = useState<{name: string, carbs: string}[]>([{ name: '', carbs: '' }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Copy Feature State
  const [showCopySearch, setShowCopySearch] = useState(false);
  const [copySearchQuery, setCopySearchQuery] = useState('');

  // Initialize selected categories
  useEffect(() => {
    if (initialCategory) {
        setSelectedCategories([initialCategory]);
    } else {
        setSelectedCategories([FoodCategory.OTHER]);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (existingFood) {
      populateForm(existingFood);
    } else if (user?.customQuantities) {
        setCustomQuantities(user.customQuantities);
    }
  }, [existingFood, user]);

  const populateForm = (food: Food) => {
      setName(food.name);
      setCarbsPer100g(food.carbsPer100g.toString());
      
      // Handle categories (migration support if coming from old data structure)
      if (food.categories && food.categories.length > 0) {
          setSelectedCategories(food.categories);
      } else if ((food as any).category) {
          setSelectedCategories([(food as any).category]);
      } else {
          setSelectedCategories([FoodCategory.OTHER]);
      }
      
      if (food.portions && food.portions.length > 0) {
        setPortions(food.portions.map(p => ({ name: p.name, carbs: p.carbs.toString() })));
      } else if ((food as any).standardUnitName) {
         setPortions([{ 
             name: (food as any).standardUnitName, 
             carbs: (food as any).standardUnitCarbs 
         }]);
      }
      
      if (food.quantityButtons) {
          setCustomQuantities(food.quantityButtons);
      } else if (user?.customQuantities) {
          setCustomQuantities(user.customQuantities);
      }

      if (food.imageUrl) {
          if (food.imageUrl.startsWith('data:')) {
              setImageMode('upload');
              setUploadedImage(food.imageUrl);
          } else {
              setImageMode('url');
              setImageUrlInput(food.imageUrl);
          }
      }
  };

  // Use user categories
  const availableCategories = user?.categories || Object.values(FoodCategory);

  const toggleCategory = (cat: string) => {
      if (selectedCategories.includes(cat)) {
          // Prevent removing the last category
          if (selectedCategories.length > 1) {
              setSelectedCategories(selectedCategories.filter(c => c !== cat));
          }
      } else {
          setSelectedCategories([...selectedCategories, cat]);
      }
  };

  const handleAddPortion = () => {
    setPortions([...portions, { name: '', carbs: '' }]);
  };

  const handleRemovePortion = (index: number) => {
    if (portions.length > 1) {
      const updated = [...portions];
      updated.splice(index, 1);
      setPortions(updated);
    }
  };

  const handlePortionChange = (index: number, field: 'name' | 'carbs', value: string) => {
    const updated = [...portions];
    updated[index] = { ...updated[index], [field]: value };
    setPortions(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleQuantity = (val: number) => {
    if (customQuantities.includes(val)) {
        setCustomQuantities(customQuantities.filter(q => q !== val).sort((a,b) => a - b));
    } else {
        setCustomQuantities([...customQuantities, val].sort((a,b) => a - b));
    }
  };

  const handleCopyFood = (food: Food) => {
      populateForm(food);
      setShowCopySearch(false);
      // If we are "Adding to [InitialCategory]", make sure that category is included
      if (initialCategory && !food.categories?.includes(initialCategory)) {
          setSelectedCategories(prev => [...prev, initialCategory]);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean portions
    const cleanPortions = portions.filter(p => p.name && p.carbs).map(p => ({
        name: p.name,
        carbs: Number(p.carbs)
    }));

    if (cleanPortions.length === 0) {
        // Fallback default
        cleanPortions.push({ name: '1 portion', carbs: 0 });
    }

    const finalImageUrl = imageMode === 'upload' 
        ? (uploadedImage || existingFood?.imageUrl || `https://cdn.pixabay.com/photo/2014/11/05/15/57/salmon-518032_1280.jpg`)
        : imageUrlInput;

    const payload: any = {
      name,
      carbsPer100g: Number(carbsPer100g),
      portions: cleanPortions,
      categories: selectedCategories,
      imageUrl: finalImageUrl,
      isFavorite: existingFood?.isFavorite || false,
      quantityButtons: customQuantities
    };

    if (existingFood) {
        await updateFoodItem({ ...existingFood, ...payload });
    } else {
        await addFoodItem(payload);
    }

    setIsSubmitting(false);
    onClose();
  };

  // Filter for Copy Search
  const filteredCopyFoods = foods.filter(f => f.name.toLowerCase().includes(copySearchQuery.toLowerCase()));

  const getLabel = (val: number) => {
      if (val === 0.17) return '1/6';
      if (val === 0.25) return '1/4';
      if (val === 0.33) return '1/3';
      if (val === 0.5) return '1/2';
      if (val === 0.67) return '2/3';
      if (val === 0.75) return '3/4';
      if (val === 0.83) return '5/6';
      return val;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
      {/* 
        Scroll Fix:
        - Used `h-[90dvh]` for fixed height on mobile to prevent growing beyond screen
        - Used `flex flex-col` to structure header, body, footer
      */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden h-[90dvh] md:h-auto md:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{existingFood ? 'Edit Food' : 'Add New Food'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy from Existing Overlay */}
        {!existingFood && !showCopySearch && (
            <div className="bg-primary-50 dark:bg-primary-900/10 px-6 py-3 flex items-center justify-between border-b border-primary-100 dark:border-primary-900/30 shrink-0">
                <span className="text-sm text-primary-700 dark:text-primary-300 font-medium">Want to start from a template?</span>
                <button 
                  onClick={() => setShowCopySearch(true)}
                  className="text-xs bg-white dark:bg-slate-800 text-primary-600 border border-primary-200 dark:border-slate-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center gap-1"
                >
                    <Copy className="w-3 h-3" /> Copy Existing
                </button>
            </div>
        )}

        {showCopySearch && (
             <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      autoFocus
                      placeholder="Search existing food to copy..."
                      value={copySearchQuery}
                      onChange={(e) => setCopySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <button onClick={() => setShowCopySearch(false)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                    {filteredCopyFoods.slice(0, 10).map(f => (
                        <div key={f.id} onClick={() => handleCopyFood(f)} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                             <img src={f.imageUrl} className="w-8 h-8 rounded bg-slate-200 object-cover" />
                             <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{f.name}</p>
                                 <p className="text-xs text-slate-500">{f.categories ? f.categories.join(', ') : (f as any).category}</p>
                             </div>
                             <span className="text-xs font-bold text-slate-400">Select</span>
                        </div>
                    ))}
                    {filteredCopyFoods.length === 0 && <p className="text-xs text-center text-slate-400 py-2">No matches found.</p>}
                </div>
             </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-slate-900">
          <form id="add-food-form" onSubmit={handleSubmit} className="space-y-6 p-6">
            
            {/* Image Section */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Food Image</label>
                
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-3">
                    <button 
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 ${imageMode === 'upload' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
                    >
                        <Upload className="w-4 h-4" /> Upload
                    </button>
                    <button 
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 ${imageMode === 'url' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-500'}`}
                    >
                        <LinkIcon className="w-4 h-4" /> Link URL
                    </button>
                </div>

                {imageMode === 'upload' ? (
                     <div className="relative group w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-primary-400 transition-colors">
                        {uploadedImage ? (
                            <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">Tap to upload photo</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                    </div>
                ) : (
                    <input 
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Food Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sourdough Bread"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Carbs per 100g</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    value={carbsPer100g}
                    onChange={(e) => setCarbsPer100g(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-sm font-medium">g</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categories</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {availableCategories.map(cat => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                            <button
                                type="button"
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    isSelected 
                                    ? 'bg-primary-500 text-white border-primary-600'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
              </div>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-300 flex items-center gap-2">
                    Standard Portions
                 </h3>
              </div>
              
              <div className="space-y-3">
                 {portions.map((portion, idx) => (
                     <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">Portion Name</label>
                            <input
                                required
                                value={portion.name}
                                onChange={(e) => handlePortionChange(idx, 'name', e.target.value)}
                                placeholder="e.g. 1 slice"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-primary-200 dark:border-primary-800 focus:border-primary-500 outline-none text-sm"
                            />
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">Carbs</label>
                            <input
                                required
                                type="number"
                                value={portion.carbs}
                                onChange={(e) => handlePortionChange(idx, 'carbs', e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-primary-200 dark:border-primary-800 focus:border-primary-500 outline-none text-sm"
                            />
                        </div>
                        {portions.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => handleRemovePortion(idx)}
                                className="mb-2 p-1 text-rose-400 hover:text-rose-600"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                     </div>
                 ))}
              </div>

              <button 
                type="button" 
                onClick={handleAddPortion}
                className="mt-4 text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:text-primary-800"
              >
                  <Plus className="w-4 h-4" /> Add another portion
              </button>
            </div>

            {/* Quick Quantities Configuration */}
            <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quick Quantity Buttons</label>
                 <p className="text-xs text-slate-500 mb-2">Select which shortcut buttons to show for this food item.</p>
                 <div className="flex flex-wrap gap-2">
                    {QUANTITY_OPTIONS.map((val) => {
                        const isSelected = customQuantities.includes(val);
                        return (
                            <button
                                type="button"
                                key={val}
                                onClick={() => toggleQuantity(val)}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                                    isSelected 
                                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300' 
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                {getLabel(val)}
                            </button>
                        );
                    })}
                </div>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-10">
          <button
            type="submit"
            form="add-food-form"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-200 dark:shadow-none active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : <><Check className="w-5 h-5" /> {existingFood ? 'Save Changes' : 'Save Food'}</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddFoodModal;