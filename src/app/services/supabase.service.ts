import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Meal, DayMenu, CustomMealType, MealTime, WeeklyMenu,
  FriendRequest, SharedMenu, UserProfile, MenuConfig
} from '../models/meal.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _user = new BehaviorSubject<User | null>(null);
  private _session = new BehaviorSubject<Session | null>(null);
  private _sessionReady = new BehaviorSubject<boolean>(false);

  user$ = this._user.asObservable();
  session$ = this._session.asObservable();
  sessionReady$ = this._sessionReady.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session.next(session);
      this._user.next(session?.user ?? null);
      this._sessionReady.next(true);
    }).catch(() => {
      this._sessionReady.next(true);
    });
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.next(session);
      this._user.next(session?.user ?? null);
      if (!this._sessionReady.value) this._sessionReady.next(true);
    });
  }

  get currentUser(): User | null {
    return this._user.value;
  }

  // Auth
  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  // Meals
  async getMeals(): Promise<Meal[]> {
    const { data, error } = await this.supabase
      .from('meals')
      .select('*')
      .eq('user_id', this.currentUser?.id)
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async addMeal(meal: Partial<Meal>): Promise<Meal> {
    const { data, error } = await this.supabase
      .from('meals')
      .insert({ ...meal, user_id: this.currentUser?.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateMeal(id: string, meal: Partial<Meal>): Promise<Meal> {
    const { data, error } = await this.supabase
      .from('meals')
      .update(meal)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteMeal(id: string): Promise<void> {
    const { error } = await this.supabase.from('meals').delete().eq('id', id);
    if (error) throw error;
  }

  // Weekly Menu
  async getWeeklyMenu(): Promise<WeeklyMenu | null> {
    const { data, error } = await this.supabase
      .from('weekly_menus')
      .select('*')
      .eq('user_id', this.currentUser?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async saveWeeklyMenu(menu: WeeklyMenu): Promise<WeeklyMenu> {
    if (menu.id) {
      const { data, error } = await this.supabase
        .from('weekly_menus')
        .update({ days: menu.days })
        .eq('id', menu.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase
        .from('weekly_menus')
        .insert({ user_id: this.currentUser?.id, days: menu.days })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  // Custom Meal Types
  async getCustomMealTypes(): Promise<CustomMealType[]> {
    const { data, error } = await this.supabase
      .from('custom_meal_types')
      .select('*')
      .eq('user_id', this.currentUser?.id)
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async addCustomMealType(type: Partial<CustomMealType>): Promise<CustomMealType> {
    const { data, error } = await this.supabase
      .from('custom_meal_types')
      .insert({ ...type, user_id: this.currentUser?.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateCustomMealType(id: string, type: Partial<CustomMealType>): Promise<CustomMealType> {
    const { data, error } = await this.supabase
      .from('custom_meal_types')
      .update(type)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteCustomMealType(id: string): Promise<void> {
    const { error } = await this.supabase.from('custom_meal_types').delete().eq('id', id);
    if (error) throw error;
  }

  // Meal Times
  async getMealTimes(): Promise<MealTime[]> {
    const { data, error } = await this.supabase
      .from('meal_times')
      .select('*')
      .eq('user_id', this.currentUser?.id)
      .order('order_index');
    if (error) throw error;
    return data || [];
  }

  async addMealTime(time: Partial<MealTime>): Promise<MealTime> {
    const { data, error } = await this.supabase
      .from('meal_times')
      .insert({ ...time, user_id: this.currentUser?.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateMealTime(id: string, time: Partial<MealTime>): Promise<MealTime> {
    const { data, error } = await this.supabase
      .from('meal_times')
      .update(time)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteMealTime(id: string): Promise<void> {
    const { error } = await this.supabase.from('meal_times').delete().eq('id', id);
    if (error) throw error;
  }

  // Menu Config
  async getMenuConfig(): Promise<MenuConfig | null> {
    const { data, error } = await this.supabase
      .from('menu_config')
      .select('*')
      .eq('user_id', this.currentUser?.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async saveMenuConfig(config: MenuConfig): Promise<MenuConfig> {
    const existing = await this.getMenuConfig();
    if (existing?.id) {
      const { data, error } = await this.supabase
        .from('menu_config')
        .update({ type_distribution: config.type_distribution })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase
        .from('menu_config')
        .insert({ user_id: this.currentUser?.id, type_distribution: config.type_distribution })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  // Friend Requests
  async sendFriendRequest(receiverEmail: string): Promise<FriendRequest> {
    const { data: users, error: userError } = await this.supabase
      .from('user_profiles')
      .select('id')
      .eq('email', receiverEmail)
      .single();
    if (userError) throw new Error('Usuario no encontrado');
    
    const { data, error } = await this.supabase
      .from('friendships')
      .insert({
        sender_id: this.currentUser?.id,
        receiver_id: users.id,
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    const { data, error } = await this.supabase
      .from('friendships')
      .select(`
        *,
        sender:user_profiles!friendships_sender_id_fkey(id, email, display_name, username),
        receiver:user_profiles!friendships_receiver_id_fkey(id, email, display_name, username)
      `)
      .or(`sender_id.eq.${this.currentUser?.id},receiver_id.eq.${this.currentUser?.id}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: any) => ({
      ...r,
      sender_email: r.sender?.email,
      sender_name: r.sender?.display_name || r.sender?.username,
      receiver_email: r.receiver?.email,
      receiver_name: r.receiver?.display_name || r.receiver?.username,
    }));
  }

  async respondToFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const { error } = await this.supabase
      .from('friendships')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);
    if (error) throw error;
  }

  async getFriends(): Promise<UserProfile[]> {
    const { data, error } = await this.supabase
      .from('friendships')
      .select(`
        *,
        sender:user_profiles!friendships_sender_id_fkey(id, email, display_name, username, avatar_url),
        receiver:user_profiles!friendships_receiver_id_fkey(id, email, display_name, username, avatar_url)
      `)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${this.currentUser?.id},receiver_id.eq.${this.currentUser?.id}`);
    if (error) throw error;
    
    return (data || []).map((r: any) => {
      if (r.sender_id === this.currentUser?.id) {
        return { id: r.receiver.id, email: r.receiver.email, display_name: r.receiver.display_name || r.receiver.username, avatar_url: r.receiver.avatar_url };
      }
      return { id: r.sender.id, email: r.sender.email, display_name: r.sender.display_name || r.sender.username, avatar_url: r.sender.avatar_url };
    });
  }

  async removeFriend(friendId: string): Promise<void> {
    const { error } = await this.supabase
      .from('friendships')
      .delete()
      .eq('status', 'accepted')
      .or(`and(sender_id.eq.${this.currentUser?.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${this.currentUser?.id})`);
    if (error) throw error;
  }

  // Share Menu
  async shareMenuWithFriend(friendId: string, menu: WeeklyMenu): Promise<void> {
    const { error } = await this.supabase
      .from('shared_menus')
      .insert({
        owner_id: this.currentUser?.id,
        shared_with_id: friendId,
        menu_data: menu
      });
    if (error) throw error;
  }

  async getSharedMenus(): Promise<SharedMenu[]> {
    const { data, error } = await this.supabase
      .from('shared_menus')
      .select(`
        *,
        owner:user_profiles!shared_menus_owner_id_fkey(id, email, display_name, username)
      `)
      .eq('shared_with_id', this.currentUser?.id)
      .order('shared_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r: any) => ({
      ...r,
      owner_name: r.owner?.display_name || r.owner?.username,
      owner_email: r.owner?.email,
    }));
  }

  async deleteSharedMenu(id: string): Promise<void> {
    const { error } = await this.supabase.from('shared_menus').delete().eq('id', id);
    if (error) throw error;
  }

  // User Profile
  async getProfile(): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', this.currentUser?.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('id', this.currentUser?.id);
    if (error) throw error;
  }
}
