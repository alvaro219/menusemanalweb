export enum MealType {
  protein = 'protein',
  fish = 'fish',
  carbohydrates = 'carbohydrates',
  vegetables = 'vegetables',
}

export interface Meal {
  id?: string;
  name: string;
  meal_time: string;
  type: MealType;
  is_favorite: boolean;
  is_hidden: boolean;
  custom_type_id?: string | null;
  user_id?: string;
}

export interface DayMenu {
  id?: string;
  day: string;
  meals: DayMealEntry[];
  user_id?: string;
  week_id?: string;
}

export interface DayMealEntry {
  meal_time: string;
  meal_id?: string;
  meal_name: string;
  meal_type: MealType;
  is_favorite: boolean;
}

export interface CustomMealType {
  id?: string;
  name: string;
  display_name: string;
  color: string;
  icon: string;
  is_active: boolean;
  user_id?: string;
}

export interface MealTime {
  id?: string;
  name: string;
  display_name: string;
  emoji: string;
  order_index: number;
  user_id?: string;
}

export interface WeeklyMenu {
  id?: string;
  user_id?: string;
  created_at?: string;
  days: DayMenu[];
}

export interface MenuConfig {
  id?: string;
  user_id?: string;
  type_distribution: TypeDistribution[];
}

export interface TypeDistribution {
  meal_type: MealType;
  percentage: number;
}

export interface FriendRequest {
  id?: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  sender_email?: string;
  receiver_email?: string;
  sender_name?: string;
  receiver_name?: string;
}

export interface SharedMenu {
  id?: string;
  owner_id: string;
  shared_with_id: string;
  menu_data: WeeklyMenu;
  shared_at?: string;
  owner_name?: string;
  owner_email?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const DEFAULT_MEAL_TIMES: MealTime[] = [
  { name: 'comida', display_name: 'Comida', emoji: '🍽️', order_index: 0 },
  { name: 'cena', display_name: 'Cena', emoji: '🌙', order_index: 1 },
];

export const MEAL_TYPE_COLORS: Record<MealType, string> = {
  [MealType.protein]: '#ef4444',
  [MealType.fish]: '#3b82f6',
  [MealType.carbohydrates]: '#f59e0b',
  [MealType.vegetables]: '#22c55e',
};

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  [MealType.protein]: 'restaurant',
  [MealType.fish]: 'set_meal',
  [MealType.carbohydrates]: 'bakery_dining',
  [MealType.vegetables]: 'eco',
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.protein]: 'Proteína',
  [MealType.fish]: 'Pescado',
  [MealType.carbohydrates]: 'Carbohidratos',
  [MealType.vegetables]: 'Verduras',
};
