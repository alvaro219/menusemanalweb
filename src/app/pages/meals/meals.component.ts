import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import {
  Meal, MealType, MealTime, DEFAULT_MEAL_TIMES,
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
        <button (click)="openAddModal()" class="btn-primary flex items-center gap-2 text-sm">
          <span class="material-icons-round text-lg">add</span>
          Añadir Comida
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <button (click)="filterType = null"
                [class]="!filterType ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-slate-800/40 text-slate-400 border-slate-700/50'"
                class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all">
          Todos
        </button>
        <button *ngFor="let type of mealTypes" (click)="filterType = type"
                [class]="filterType === type ? 'text-sky-300 border-sky-500/30' : 'text-slate-400 border-slate-700/50'"
                [style.background]="filterType === type ? getMealTypeColor(type) + '20' : ''"
                class="px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 bg-slate-800/40">
          <span class="material-icons-round text-xs" [style.color]="getMealTypeColor(type)">{{ getMealTypeIcon(type) }}</span>
          {{ getMealTypeLabel(type) }}
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
             class="glass-card p-4 flex items-center gap-3 animate-slide-up !rounded-xl"
             [style.animation-delay]="i * 30 + 'ms'"
             [class.opacity-50]="meal.is_hidden">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               [style.background]="getMealTypeColor(meal.type) + '15'">
            <span class="material-icons-round text-lg" [style.color]="getMealTypeColor(meal.type)">
              {{ getMealTypeIcon(meal.type) }}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-slate-200 truncate">{{ meal.name }}</span>
              <span *ngIf="meal.is_favorite" class="material-icons-round text-xs text-pink-400">favorite</span>
              <span *ngIf="meal.is_hidden" class="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">oculta</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-slate-500">{{ getMealTimeDisplay(meal.meal_time) }}</span>
              <span class="text-xs px-1.5 py-0.5 rounded-full" [style.background]="getMealTypeColor(meal.type) + '15'" [style.color]="getMealTypeColor(meal.type)">
                {{ getMealTypeLabel(meal.type) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1 flex-shrink-0">
            <button (click)="toggleFavorite(meal)" class="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    [class]="meal.is_favorite ? 'text-pink-400' : 'text-slate-600 hover:text-pink-400'">
              <span class="material-icons-round text-base">{{ meal.is_favorite ? 'favorite' : 'favorite_border' }}</span>
            </button>
            <button (click)="toggleHidden(meal)" class="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    [class]="meal.is_hidden ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'">
              <span class="material-icons-round text-base">{{ meal.is_hidden ? 'visibility_off' : 'visibility' }}</span>
            </button>
            <button (click)="openEditModal(meal)" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-sky-400 transition-colors">
              <span class="material-icons-round text-base">edit</span>
            </button>
            <button (click)="deleteMeal(meal)" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-red-400 transition-colors">
              <span class="material-icons-round text-base">delete_outline</span>
            </button>
          </div>
        </div>

        <p *ngIf="filteredMeals().length === 0" class="text-center text-slate-500 py-12">
          No se encontraron comidas
        </p>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="showModal = false">
        <div class="glass-card p-6 w-full max-w-md animate-slide-up" (click)="$event.stopPropagation()">
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
                <button *ngFor="let type of mealTypes" (click)="formType = type"
                        [class]="formType === type ? 'border-sky-500/50 bg-sky-500/10' : 'border-slate-700/50 bg-slate-800/40'"
                        class="flex items-center gap-2 p-3 rounded-xl border transition-all">
                  <span class="material-icons-round text-sm" [style.color]="getMealTypeColor(type)">{{ getMealTypeIcon(type) }}</span>
                  <span class="text-sm text-slate-300">{{ getMealTypeLabel(type) }}</span>
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
  mealTypes = Object.values(MealType);
  loading = true;
  searchQuery = '';
  filterType: MealType | null = null;
  showFavoritesOnly = false;
  showModal = false;
  editingMeal: Meal | null = null;

  formName = '';
  formMealTime = 'comida';
  formType: MealType = MealType.vegetables;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [meals, mealTimes] = await Promise.all([
        this.supabase.getMeals(),
        this.supabase.getMealTimes()
      ]);
      this.meals = meals;
      this.mealTimes = mealTimes.length > 0 ? mealTimes : DEFAULT_MEAL_TIMES as any;
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
          type: this.formType
        });
        const idx = this.meals.findIndex(m => m.id === this.editingMeal!.id);
        if (idx >= 0) this.meals[idx] = updated;
      } else {
        const newMeal = await this.supabase.addMeal({
          name: this.formName.trim(),
          meal_time: this.formMealTime,
          type: this.formType,
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
    if (!confirm(`¿Eliminar "${meal.name}"?`)) return;
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

  getMealTypeColor(type: MealType): string { return MEAL_TYPE_COLORS[type] || '#94a3b8'; }
  getMealTypeIcon(type: MealType): string { return MEAL_TYPE_ICONS[type] || 'restaurant'; }
  getMealTypeLabel(type: MealType): string { return MEAL_TYPE_LABELS[type] || type; }
}
