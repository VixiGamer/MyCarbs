import React, { useState } from 'react';
import { useAppContext } from '../App';
import { Food } from '../types';
import { Heart, Wheat } from 'lucide-react';
import { Link } from 'react-router-dom';
import CalculatorModal from '../components/CalculatorModal';

const FavoritesPage: React.FC = () => {
  const { foods, user, toggleFoodFavorite } = useAppContext();
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const favoriteFoods = foods.filter(f => f.isFavorite);

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

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
           <Heart className="w-6 h-6 text-rose-500 fill-current" /> Favorites
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your go-to meals.</p>
      </div>

      {favoriteFoods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
             <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No favorites yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2">Tap the heart icon on items in your collection to add them here.</p>
          <Link to="/dashboard" className="mt-6 text-primary-600 font-semibold hover:underline">
            Go to Collection
          </Link>
        </div>
      ) : (
        <div className={
            user.viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" 
                : "grid grid-cols-1 md:grid-cols-2 gap-3"
        }>
          {favoriteFoods.map((food) => {
             return (
                <div 
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`group bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-md hover:border-primary-200 dark:hover:border-primary-900 transition-all active:scale-[0.99] overflow-hidden flex relative ${
                      user.viewMode === 'grid' 
                          ? 'flex-col rounded-xl' 
                          : 'flex-row items-center p-2 rounded-lg gap-3'
                  }`}
                >
                  <div className={`relative flex-shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden ${
                      user.viewMode === 'grid' 
                          ? 'w-full aspect-square' 
                          : 'w-12 h-12 rounded-lg'
                  }`}>
                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                  </div>

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
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFoodFavorite(food.id);
                    }}
                    className={`transition-colors rounded-full flex items-center justify-center ${
                        user.viewMode === 'grid' 
                          ? 'absolute top-2 right-2 p-1.5 shadow-sm' 
                          : 'p-2'
                    } text-rose-500 bg-rose-50 dark:bg-rose-900/20`}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
             );
          })}
        </div>
      )}

      {selectedFood && (
        <CalculatorModal 
          food={selectedFood} 
          user={user} 
          onClose={() => setSelectedFood(null)} 
        />
      )}

      {/* Footer Removed */}
    </div>
  );
};

export default FavoritesPage;