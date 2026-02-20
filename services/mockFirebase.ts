import { User, Food, FoodCategory } from '../types';

// Initial Mock Data
const MOCK_FOODS: Food[] = [
  {
    id: '1',
    name: 'Medium Apple',
    carbsPer100g: 14,
    portions: [{ name: '1 medium apple', carbs: 25 }],
    categories: [FoodCategory.FRUIT, FoodCategory.SNACK],
    isFavorite: true,
    createdAt: Date.now(),
    imageUrl: 'https://cdn.pixabay.com/photo/2016/11/29/03/23/apples-1867043_1280.jpg',
    quantityButtons: [0.5, 1, 2]
  },
  {
    id: '2',
    name: 'White Bread',
    carbsPer100g: 49,
    portions: [{ name: '1 slice', carbs: 15 }, { name: '1 loaf', carbs: 200 }],
    categories: [FoodCategory.BREAKFAST],
    isFavorite: false,
    createdAt: Date.now() - 10000,
    imageUrl: 'https://cdn.pixabay.com/photo/2016/07/11/17/31/bread-1510155_1280.jpg',
    quantityButtons: [1, 2, 4]
  },
  {
    id: '3',
    name: 'Pasta (Cooked)',
    carbsPer100g: 31,
    portions: [{ name: '1 cup', carbs: 45 }],
    categories: [FoodCategory.DINNER, FoodCategory.LUNCH],
    isFavorite: true,
    createdAt: Date.now() - 20000,
    imageUrl: 'https://cdn.pixabay.com/photo/2020/05/10/15/10/tagliatelle-5154360_1280.jpg'
  },
  {
    id: '4',
    name: 'Banana',
    carbsPer100g: 23,
    portions: [{ name: '1 medium banana', carbs: 27 }],
    categories: [FoodCategory.FRUIT, FoodCategory.BREAKFAST, FoodCategory.SNACK],
    isFavorite: false,
    createdAt: Date.now() - 30000,
    imageUrl: 'https://cdn.pixabay.com/photo/2015/11/05/23/08/banana-1025109_1280.jpg'
  },
  {
    id: '5',
    name: 'Pizza Margherita',
    carbsPer100g: 33,
    portions: [{ name: '1 slice', carbs: 35 }, { name: 'Whole Pizza', carbs: 260 }],
    categories: [FoodCategory.DINNER, FoodCategory.LUNCH],
    isFavorite: true,
    createdAt: Date.now() - 40000,
    imageUrl: 'https://cdn.pixabay.com/photo/2017/12/10/14/47/pizza-3010062_1280.jpg'
  }
];

const STORAGE_KEYS = {
  USER: 'mycarbs_user',
  FOODS: 'mycarbs_foods',
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async signIn(email: string): Promise<User> {
    await delay(800);
    // Simulate login - retrieve user
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Simple email check
      if (parsed.email.toLowerCase() !== email.toLowerCase()) {
         throw new Error("User not found or email mismatch.");
      }

      // Migration check for old users without new fields
      if (!parsed.categories) {
        parsed.categories = [...Object.values(FoodCategory), ...(parsed.customCategories || [])];
        delete parsed.customCategories;
      }
      if (!parsed.themePreference) parsed.themePreference = 'system';
      if (!parsed.accentColor) parsed.accentColor = 'cyan';
      if (!parsed.viewMode) parsed.viewMode = 'list'; // Default to list
      if (!parsed.customQuantities) parsed.customQuantities = [0.5, 1, 2, 3];
      return parsed;
    }
    
    throw new Error("Account does not exist. Please Sign Up.");
  },

  async signUp(email: string): Promise<User> {
    await delay(800);
    // Check if already exists
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
         // For this single-user mock, we just overwrite, 
         // but in real world we'd check if email matches.
         // Let's assume overwrite is okay or behave like a fresh start
    }

    const newUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      icr: 15, // Default ratio
      categories: Object.values(FoodCategory), // Initialize with defaults so they can be edited
      themePreference: 'system',
      accentColor: 'cyan',
      viewMode: 'list',
      customQuantities: [0.5, 1, 2, 3]
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return newUser;
  },

  async loginAsGuest(): Promise<User> {
    await delay(800);
    const guestUser: User = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      email: 'guest@mycarbs.app',
      name: 'Guest',
      icr: 15,
      categories: Object.values(FoodCategory),
      themePreference: 'system',
      accentColor: 'cyan',
      viewMode: 'list',
      customQuantities: [0.5, 1, 2, 3]
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(guestUser));
    return guestUser;
  },

  async signOut(): Promise<void> {
    await delay(300);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  async updateUser(user: User): Promise<User> {
    await delay(500);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  async deleteAccount(): Promise<void> {
    await delay(1000);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.FOODS);
  }
};

export const mockDataService = {
  async getFoods(): Promise<Food[]> {
    await delay(600);
    const stored = localStorage.getItem(STORAGE_KEYS.FOODS);
    if (stored) {
      let parsedFoods = JSON.parse(stored);
      // Migration: Convert single category to array if needed
      parsedFoods = parsedFoods.map((f: any) => {
        if (!f.categories && f.category) {
            return { ...f, categories: [f.category] };
        }
        return f;
      });
      return parsedFoods;
    }
    // Initialize with mock data if empty
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(MOCK_FOODS));
    return MOCK_FOODS;
  },

  async addFood(food: Omit<Food, 'id' | 'createdAt'>): Promise<Food> {
    await delay(600);
    const newFood: Food = {
      ...food,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    const currentFoods = await this.getFoods();
    const updatedFoods = [newFood, ...currentFoods];
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(updatedFoods));
    return newFood;
  },

  async updateFood(food: Food): Promise<Food> {
    await delay(400);
    const currentFoods = await this.getFoods();
    const updatedFoods = currentFoods.map(f => f.id === food.id ? food : f);
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(updatedFoods));
    return food;
  },

  async toggleFavorite(foodId: string): Promise<Food[]> {
    const currentFoods = await this.getFoods();
    const updatedFoods = currentFoods.map(f => 
      f.id === foodId ? { ...f, isFavorite: !f.isFavorite } : f
    );
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(updatedFoods));
    return updatedFoods;
  },

  async deleteFood(foodId: string): Promise<Food[]> {
    const currentFoods = await this.getFoods();
    const updatedFoods = currentFoods.filter(f => f.id !== foodId);
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(updatedFoods));
    return updatedFoods;
  }
};