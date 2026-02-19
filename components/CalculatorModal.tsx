import React, { useState, useEffect, useMemo } from 'react';
import { Food, User, Portion } from '../types';
import { X, Calculator, Droplets, Edit2, Trash2, MoreVertical, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../App';
import AddFoodModal from './AddFoodModal'; // Used for editing

interface CalculatorModalProps {
  food: Food;
  user: User;
  onClose: () => void;
}

type Mode = 'unit' | 'weight';

const CalculatorModal: React.FC<CalculatorModalProps> = ({ food: initialFood, user, onClose }) => {
  const { deleteFoodItem } = useAppContext();
  
  // Local state to track updates if food is edited
  const [food, setFood] = useState(initialFood);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculation State
  const [mode, setMode] = useState<Mode>('unit');
  const [quantity, setQuantity] = useState<number>(1); // Multiplier
  const [weight, setWeight] = useState<number>(100); // Grams
  const [totalCarbs, setTotalCarbs] = useState<number>(0);
  
  // Portion Selection
  const normalizedPortions: Portion[] = useMemo(() => {
    if (food.portions && food.portions.length > 0) return food.portions;
    if ((food as any).standardUnitName) {
        return [{ name: (food as any).standardUnitName, carbs: (food as any).standardUnitCarbs }];
    }
    return [{ name: 'Portion', carbs: 0 }];
  }, [food]);

  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);

  // Update logic when inputs change
  useEffect(() => {
    if (mode === 'unit') {
      const p = normalizedPortions[selectedPortionIndex] || { carbs: 0 };
      setTotalCarbs(Math.round(p.carbs * quantity));
    } else {
      setTotalCarbs(Math.round((food.carbsPer100g / 100) * weight));
    }
  }, [mode, quantity, weight, food, selectedPortionIndex, normalizedPortions]);

  // Update local food state if prop changes (or after edit)
  useEffect(() => {
    setFood(initialFood);
  }, [initialFood]);

  const insulinUnits = user.icr > 0 ? (totalCarbs / user.icr).toFixed(1) : '—';

  const handleDelete = async () => {
    if (!isDeleting) {
        setIsDeleting(true); // First click: ask for confirmation
        return;
    }
    // Second click: actually delete
    await deleteFoodItem(food.id);
    onClose();
  };

  const handleManualQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0) {
          setQuantity(val);
      } else if (e.target.value === '') {
          setQuantity(0);
      }
  };

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

  // Determine which quantity buttons to show: Food specific -> User Custom -> Default
  const quantityButtons = food.quantityButtons && food.quantityButtons.length > 0 
    ? food.quantityButtons 
    : (user.customQuantities && user.customQuantities.length > 0 ? user.customQuantities : [0.5, 1, 2, 3]);

  if (isEditing) {
      return <AddFoodModal existingFood={food} onClose={() => { setIsEditing(false); onClose(); }} />;
  }

  // Categories display
  const displayCategory = food.categories ? food.categories.join(', ') : (food as any).category;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Scrollable Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="overflow-y-auto flex-1 relative">
            {/* Header - Image (Scrolls with content) */}
            <div className="relative w-full aspect-square shrink-0">
            <img 
                src={food.imageUrl || 'https://cdn.pixabay.com/photo/2014/11/05/15/57/salmon-518032_1280.jpg'} 
                alt={food.name} 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h2 className="text-3xl font-bold text-white leading-tight pr-8">{food.name}</h2>
                <p className="text-slate-300 text-base mt-1">{displayCategory}</p>
            </div>
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors z-20"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Context Menu for Edit/Delete */}
            <div className="absolute top-4 left-4 z-20">
                <button 
                    onClick={() => setShowMenu(!showMenu)} 
                    className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                >
                    <MoreVertical className="w-6 h-6" />
                </button>
                {showMenu && (
                    <div className="absolute top-12 left-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 w-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-left border border-slate-100 dark:border-slate-700">
                        <button onClick={() => setIsEditing(true)} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium flex items-center gap-2 dark:text-slate-200">
                            <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button 
                            onClick={handleDelete} 
                            className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                                isDeleting 
                                ? 'bg-rose-500 text-white hover:bg-rose-600' 
                                : 'hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600'
                            }`}
                        >
                            {isDeleting ? <><AlertTriangle className="w-4 h-4" /> Confirm?</> : <><Trash2 className="w-4 h-4" /> Delete</>}
                        </button>
                    </div>
                )}
            </div>
            </div>

            {/* Content */}
            <div className="p-6">
            
            {/* Toggle Mode */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
                <button
                onClick={() => setMode('unit')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === 'unit' 
                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-300 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                >
                Per Portion
                </button>
                <button
                onClick={() => setMode('weight')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === 'weight' 
                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-300 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                >
                By Weight (g)
                </button>
            </div>

            {/* Inputs */}
            <div className="mb-8">
                {mode === 'unit' ? (
                <div className="space-y-4">
                    
                    {/* Portion Selector (If multiple) */}
                    {normalizedPortions.length > 1 && (
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Portion Type</label>
                            <select 
                                value={selectedPortionIndex}
                                onChange={(e) => setSelectedPortionIndex(Number(e.target.value))}
                                className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 outline-none"
                            >
                                {normalizedPortions.map((p, idx) => (
                                    <option key={idx} value={idx}>{p.name} ({p.carbs}g)</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between items-end mb-2">
                             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Quantity:</p>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Custom:</span>
                                <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={quantity}
                                    onChange={handleManualQuantityChange}
                                    className="w-16 px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                        {quantityButtons.map((val) => (
                            <button
                            key={val}
                            onClick={() => setQuantity(val)}
                            className={`py-2 rounded-lg border font-semibold transition-all ${
                                quantity === val
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-200'
                            }`}
                            >
                            {getLabel(val)}
                            </button>
                        ))}
                        </div>
                    </div>
                    
                    <p className="text-center text-xs text-slate-400 mt-1">
                    Base: {normalizedPortions[selectedPortionIndex]?.name} ({normalizedPortions[selectedPortionIndex]?.carbs}g)
                    </p>
                </div>
                ) : (
                <div className="space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Enter Weight (grams):</p>
                    <div className="flex items-center space-x-4">
                    <input 
                        type="range" 
                        min="0" 
                        max="500" 
                        value={weight} 
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="relative">
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="w-24 pl-3 pr-8 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-right focus:border-primary-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">g</span>
                    </div>
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-2">
                    Ratio: {food.carbsPer100g}g carbs per 100g
                    </p>
                </div>
                )}
            </div>

            {/* Results Card */}
            <div className="bg-slate-900 dark:bg-black rounded-2xl p-6 text-white shadow-xl flex flex-col items-center relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-20"></div>

                <div className="grid grid-cols-2 gap-8 w-full relative z-10">
                    <div className="flex flex-col items-center border-r border-slate-700">
                    <span className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Total Carbs</span>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-4xl font-bold tracking-tight">{totalCarbs}</span>
                        <span className="text-base text-slate-400">g</span>
                    </div>
                    </div>

                    <div className="flex flex-col items-center">
                    <span className="text-emerald-400 text-xs uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> Insulin Dose
                    </span>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-4xl font-bold tracking-tight text-emerald-400">{insulinUnits}</span>
                        <span className="text-base text-emerald-400/70">units</span>
                    </div>
                    </div>
                </div>

                {user.icr === 0 && (
                    <p className="text-xs text-red-300 mt-4 bg-red-900/30 px-3 py-1 rounded-full">
                    ⚠️ Set your ICR in profile to calculate insulin.
                    </p>
                )}
            </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorModal;