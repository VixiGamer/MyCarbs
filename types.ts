export enum FoodCategory {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
  SNACK = 'Snack',
  DRINK = 'Drink',
  FRUIT = 'Fruit',
  SWEET = 'Sweet',
  OTHER = 'Other'
}

export type ThemeOption = 'system' | 'light' | 'dark';
export type AccentColor = 'blue' | 'emerald' | 'violet' | 'rose' | 'amber' | 'cyan' | 'teal' | 'fuchsia' | 'lime' | 'slate';
export type ViewMode = 'grid' | 'list';

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  icr: number; // Insulin-to-Carb Ratio
  categories: string[]; // All categories (defaults + custom)
  themePreference: ThemeOption;
  accentColor: AccentColor;
  viewMode: ViewMode;
  customQuantities?: number[];
}

export interface Portion {
  name: string; 
  carbs: number;
}

export interface Food {
  id: string;
  name: string;
  carbsPer100g: number;
  portions: Portion[]; 
  categories: string[]; // Changed from single category string to array
  isFavorite: boolean;
  imageUrl?: string;
  createdAt: number;
  quantityButtons?: number[]; // Specific quick select buttons for this food
}

export type SortOption = 'date_desc' | 'alpha_asc' | 'carbs_high' | 'carbs_low';