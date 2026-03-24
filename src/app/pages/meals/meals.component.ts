import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ConfirmModalService } from '../../components/confirm-modal/confirm-modal.service';
import {
  Meal, MealType, MealTime, CustomMealType, UserProfile, DEFAULT_MEAL_TIMES,
  MEAL_TYPE_COLORS, MEAL_TYPE_ICONS, MEAL_TYPE_LABELS
} from '../../models/meal.model';

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <span class="material-icons-round text-sky-400">lunch_dining</span>
            Biblioteca de Comidas
          </h1>
          <p class="text-slate-400 text-sm mt-1">{{ meals.length }} comidas registradas</p>
        </div>
        <div class="flex gap-2">
          <button (click)="openShareMealsModal()" class="btn-secondary flex items-center gap-2 text-sm">
            <span class="material-icons-round text-lg">share</span>
            Compartir
          </button>
          <button (click)="openAddModal()" class="btn-primary flex items-center gap-2 text-sm">
            <span class="material-icons-round text-lg">add</span>
            Añadir Comida
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <button (click)="filterType = null"
                [class]="!filterType ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-slate-800/40 text-slate-400 border-slate-700/50'"
                class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all">
          Todos
        </button>
        <button *ngFor="let type of allTypeKeys" (click)="filterType = type"
                [class]="filterType === type ? 'text-sky-300 border-sky-500/30' : 'text-slate-400 border-slate-700/50'"
                [style.background]="filterType === type ? getTypeColor(type) + '20' : ''"
                class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 bg-slate-800/40">
          <span class="material-icons-round text-xs" [style.color]="getTypeColor(type)">{{ getTypeIcon(type) }}</span>
          {{ getTypeLabel(type) }}
        </button>
        <button (click)="showFavoritesOnly = !showFavoritesOnly"
                [class]="showFavoritesOnly ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-slate-800/40 text-slate-400 border-slate-700/50'"
                class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5">
          <span class="material-icons-round text-xs">favorite</span>
          Favoritos
        </button>
      </div>

      <!-- Search -->
      <input [(ngModel)]="searchQuery" placeholder="Buscar comidas..." class="input-field">

      <!-- Meals List -->
      <div class="grid gap-2">
        <div *ngFor="let meal of filteredMeals(); let i = index"
             class="glass-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3 animate-slide-up !rounded-xl overflow-hidden"
             [style.animation-delay]="i * 30 + 'ms'"
             [class.opacity-50]="meal.is_hidden">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               [style.background]="getTypeColor(meal.type) + '15'">
            <span class="material-icons-round text-base sm:text-lg" [style.color]="getTypeColor(meal.type)">
              {{ getTypeIcon(meal.type) }}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1 sm:gap-2">
              <span class="text-xs sm:text-sm font-medium text-slate-200 truncate">{{ meal.name }}</span>
              <span *ngIf="meal.is_favorite" class="material-icons-round text-xs text-pink-400 flex-shrink-0">favorite</span>
              <span *ngIf="meal.is_hidden" class="text-[10px] text-slate-500 bg-slate-700/50 px-1 py-0.5 rounded flex-shrink-0">oculta</span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[10px] sm:text-xs text-slate-500">{{ getMealTimeDisplay(meal.meal_time) }}</span>
              <span class="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full" [style.background]="getTypeColor(meal.type) + '15'" [style.color]="getTypeColor(meal.type)">
                {{ getTypeLabel(meal.type) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button (click)="toggleFavorite(meal)" class="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    [class]="meal.is_favorite ? 'text-pink-400' : 'text-slate-600 hover:text-pink-400'">
              <span class="material-icons-round text-sm sm:text-base">{{ meal.is_favorite ? 'favorite' : 'favorite_border' }}</span>
            </button>
            <button (click)="toggleHidden(meal)" class="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 transition-colors hidden sm:block"
                    [class]="meal.is_hidden ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'">
              <span class="material-icons-round text-sm sm:text-base">{{ meal.is_hidden ? 'visibility_off' : 'visibility' }}</span>
            </button>
            <button (click)="openEditModal(meal)" class="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-sky-400 transition-colors">
              <span class="material-icons-round text-sm sm:text-base">edit</span>
            </button>
            <button (click)="deleteMeal(meal)" class="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-red-400 transition-colors">
              <span class="material-icons-round text-sm sm:text-base">delete_outline</span>
            </button>
          </div>
        </div>

        <p *ngIf="filteredMeals().length === 0" class="text-center text-slate-500 py-12">
          No se encontraron comidas
        </p>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="showModal = false">
        <div class="glass-card p-6 w-full max-w-md animate-slide-up max-h-[85vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white mb-4">{{ editingMeal ? 'Editar' : 'Añadir' }} Comida</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Nombre</label>
              <input [(ngModel)]="formName" class="input-field" placeholder="Ej: Pasta con tomate">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Tiempo de comida</label>
              <select [(ngModel)]="formMealTime" class="input-field">
                <option *ngFor="let mt of mealTimes" [value]="mt.name">{{ mt.emoji }} {{ mt.display_name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
              <div class="grid grid-cols-2 gap-2">
                <button *ngFor="let type of allTypeKeys" (click)="formType = type"
                        [class]="formType === type ? 'border-sky-500/50 bg-sky-500/10' : 'border-slate-700/50 bg-slate-800/40'"
                        class="flex items-center gap-2 p-3 rounded-xl border transition-all">
                  <span class="material-icons-round text-sm" [style.color]="getTypeColor(type)">{{ getTypeIcon(type) }}</span>
                  <span class="text-sm text-slate-300">{{ getTypeLabel(type) }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button (click)="showModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button (click)="saveMeal()" class="btn-primary flex-1" [disabled]="!formName.trim()">
              {{ editingMeal ? 'Guardar' : 'Añadir' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Share Meals Modal -->
      <div *ngIf="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="showShareModal = false">
        <div class="glass-card p-6 w-full max-w-md max-h-[85vh] flex flex-col animate-slide-up" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 class="text-lg font-semibold text-white">Compartir Biblioteca de Comidas</h3>
            <button (click)="showShareModal = false" class="p-1 rounded-lg hover:bg-white/5 text-slate-400">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          <p class="text-sm text-slate-400 mb-3 flex-shrink-0">Se compartirán {{ meals.length }} comidas. Selecciona amigos:</p>
          <div *ngIf="shareFriends.length > 0" class="flex flex-col flex-1 min-h-0">
            <div class="space-y-2 overflow-y-auto flex-1 pr-1">
              <button *ngFor="let friend of shareFriends" (click)="toggleShareFriend(friend.id)"
                      class="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                      [class]="selectedShareFriends[friend.id] ? 'bg-sky-500/15 border border-sky-500/30' : 'hover:bg-white/5 border border-transparent'">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {{ (friend.display_name || friend.email).charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-200">{{ friend.display_name || friend.email }}</p>
                </div>
                <span *ngIf="selectedShareFriends[friend.id]" class="material-icons-round text-sky-400 text-lg flex-shrink-0">check_circle</span>
                <span *ngIf="!selectedShareFriends[friend.id]" class="material-icons-round text-slate-600 text-lg flex-shrink-0">radio_button_unchecked</span>
              </button>
            </div>
            <div class="flex-shrink-0 pt-3 mt-2 border-t border-slate-700/50">
              <button (click)="shareMealsWithSelected()" [disabled]="selectedShareFriendsCount === 0 || sharingMeals"
                      class="btn-primary w-full flex items-center justify-center gap-2">
                <span *ngIf="sharingMeals" class="material-icons-round animate-spin text-lg">refresh</span>
                <span *ngIf="!sharingMeals" class="material-icons-round text-lg">send</span>
                {{ sharingMeals ? 'Enviando...' : 'Enviar a ' + selectedShareFriendsCount + ' amigo' + (selectedShareFriendsCount !== 1 ? 's' : '') }}
              </button>
              <p *ngIf="shareMealsMsg" class="text-center text-green-400 text-sm mt-2">{{ shareMealsMsg }}</p>
            </div>
          </div>
          <p *ngIf="shareFriends.length === 0" class="text-sm text-slate-500 text-center py-4">No tienes amigos aún.</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <span class="material-icons-round text-4xl text-sky-400 animate-spin">refresh</span>
      </div>
    </div>
  `
})
export class MealsComponent implements OnInit {
  meals: Meal[] = [];
  mealTimes: MealTime[] = [];
  customTypes: CustomMealType[] = [];
  mealTypes = Object.values(MealType);
  allTypeKeys: string[] = [];
  loading = true;
  searchQuery = '';
  filterType: string | null = null;
  showFavoritesOnly = false;
  showModal = false;
  editingMeal: Meal | null = null;

  formName = '';
  formMealTime = 'comida';
  formType: string = MealType.vegetables;

  showShareModal = false;
  shareFriends: UserProfile[] = [];
  selectedShareFriends: Record<string, boolean> = {};
  sharingMeals = false;
  shareMealsMsg = '';

  constructor(private supabase: SupabaseService, private confirmService: ConfirmModalService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [meals, mealTimes, customTypes] = await Promise.all([
        this.supabase.getMeals(),
        this.supabase.getMealTimes(),
        this.supabase.getCustomMealTypes()
      ]);
      this.meals = meals;
      this.mealTimes = mealTimes.length > 0 ? mealTimes : DEFAULT_MEAL_TIMES as any;
      this.customTypes = customTypes.filter(ct => ct.is_active);
      this.allTypeKeys = [
        ...Object.values(MealType),
        ...this.customTypes.map(ct => ct.name)
      ];
    } catch (err) {
      console.error('Error loading meals:', err);
    } finally {
      this.loading = false;
    }
  }

  filteredMeals(): Meal[] {
    let filtered = this.meals;
    if (this.filterType) filtered = filtered.filter(m => m.type === this.filterType);
    if (this.showFavoritesOnly) filtered = filtered.filter(m => m.is_favorite);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(m => m.name.toLowerCase().includes(q));
    }
    return filtered;
  }

  openAddModal() {
    this.editingMeal = null;
    this.formName = '';
    this.formMealTime = this.mealTimes[0]?.name || 'comida';
    this.formType = MealType.vegetables;
    this.showModal = true;
  }

  openEditModal(meal: Meal) {
    this.editingMeal = meal;
    this.formName = meal.name;
    this.formMealTime = meal.meal_time;
    this.formType = meal.type;
    this.showModal = true;
  }

  async saveMeal() {
    if (!this.formName.trim()) return;
    try {
      if (this.editingMeal?.id) {
        const updated = await this.supabase.updateMeal(this.editingMeal.id, {
          name: this.formName.trim(),
          meal_time: this.formMealTime,
          type: this.formType as MealType
        });
        const idx = this.meals.findIndex(m => m.id === this.editingMeal!.id);
        if (idx >= 0) this.meals[idx] = updated;
      } else {
        const newMeal = await this.supabase.addMeal({
          name: this.formName.trim(),
          meal_time: this.formMealTime,
          type: this.formType as MealType,
          is_favorite: false,
          is_hidden: false
        });
        this.meals.push(newMeal);
      }
      this.showModal = false;
    } catch (err) {
      console.error('Error saving meal:', err);
    }
  }

  async toggleFavorite(meal: Meal) {
    try {
      meal.is_favorite = !meal.is_favorite;
      await this.supabase.updateMeal(meal.id!, { is_favorite: meal.is_favorite });
    } catch (err) {
      meal.is_favorite = !meal.is_favorite;
      console.error('Error toggling favorite:', err);
    }
  }

  async toggleHidden(meal: Meal) {
    try {
      meal.is_hidden = !meal.is_hidden;
      await this.supabase.updateMeal(meal.id!, { is_hidden: meal.is_hidden });
    } catch (err) {
      meal.is_hidden = !meal.is_hidden;
      console.error('Error toggling hidden:', err);
    }
  }

  async deleteMeal(meal: Meal) {
    const ok = await this.confirmService.confirm({
      title: 'Eliminar comida',
      message: `¿Eliminar "${meal.name}"?`,
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) return;
    try {
      await this.supabase.deleteMeal(meal.id!);
      this.meals = this.meals.filter(m => m.id !== meal.id);
    } catch (err) {
      console.error('Error deleting meal:', err);
    }
  }

  getMealTimeDisplay(timeName: string): string {
    const mt = this.mealTimes.find(t => t.name === timeName);
    return mt ? `${mt.emoji} ${mt.display_name}` : timeName;
  }

  getTypeColor(type: string): string {
    if (MEAL_TYPE_COLORS[type as MealType]) return MEAL_TYPE_COLORS[type as MealType];
    const ct = this.customTypes.find(c => c.name === type);
    return ct?.color || '#94a3b8';
  }

  getTypeIcon(type: string): string {
    if (MEAL_TYPE_ICONS[type as MealType]) return MEAL_TYPE_ICONS[type as MealType];
    const ct = this.customTypes.find(c => c.name === type);
    return ct?.icon || 'restaurant';
  }

  getTypeLabel(type: string): string {
    if (MEAL_TYPE_LABELS[type as MealType]) return MEAL_TYPE_LABELS[type as MealType];
    const ct = this.customTypes.find(c => c.name === type);
    return ct?.display_name || type;
  }

  async openShareMealsModal() {
    this.showShareModal = true;
    this.selectedShareFriends = {};
    this.shareMealsMsg = '';
    try {
      this.shareFriends = await this.supabase.getFriends();
    } catch { this.shareFriends = []; }
  }

  toggleShareFriend(id: string) {
    this.selectedShareFriends[id] = !this.selectedShareFriends[id];
  }

  get selectedShareFriendsCount(): number {
    return Object.values(this.selectedShareFriends).filter(v => v).length;
  }

  async shareMealsWithSelected() {
    if (this.meals.length === 0 || this.selectedShareFriendsCount === 0) return;
    this.sharingMeals = true;
    this.shareMealsMsg = '';
    try {
      const ids = Object.entries(this.selectedShareFriends).filter(([_, v]) => v).map(([id]) => id);
      for (const friendId of ids) {
        await this.supabase.shareMealsWithFriend(friendId, this.meals);
      }
      this.shareMealsMsg = `¡Comidas enviadas a ${ids.length} amigo${ids.length !== 1 ? 's' : ''}!`;
      this.selectedShareFriends = {};
    } catch (err) {
      console.error('Error sharing meals:', err);
    } finally {
      this.sharingMeals = false;
    }
  }
}
