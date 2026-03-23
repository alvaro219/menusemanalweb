import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import {
  Meal, MealType, MealTime, DayMenu, DayMealEntry, WeeklyMenu,
  DAYS_OF_WEEK, DEFAULT_MEAL_TIMES, MEAL_TYPE_COLORS, MEAL_TYPE_ICONS, MEAL_TYPE_LABELS
} from '../../models/meal.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <span class="material-icons-round text-sky-400">calendar_month</span>
            Menú Semanal
          </h1>
          <p class="text-slate-400 text-sm mt-1">Planifica tus comidas de la semana</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button (click)="generateMenu()" class="btn-primary flex items-center gap-2 text-sm">
            <span class="material-icons-round text-lg">auto_awesome</span>
            Generar Menú
          </button>
          <button (click)="showWeeklyView = !showWeeklyView" class="btn-secondary flex items-center gap-2 text-sm">
            <span class="material-icons-round text-lg">{{ showWeeklyView ? 'view_agenda' : 'table_chart' }}</span>
            {{ showWeeklyView ? 'Vista Tarjetas' : 'Vista Semanal' }}
          </button>
          <button (click)="shareMenu()" class="btn-secondary flex items-center gap-2 text-sm">
            <span class="material-icons-round text-lg">share</span>
            Compartir
          </button>
        </div>
      </div>

      <!-- Weekly Table View -->
      <div *ngIf="showWeeklyView" class="glass-card p-4 overflow-x-auto animate-slide-up">
        <table class="w-full min-w-[600px]">
          <thead>
            <tr class="border-b border-sky-500/10">
              <th class="text-left py-3 px-2 text-sm font-semibold text-slate-300">Día</th>
              <th *ngFor="let mt of mealTimes" class="text-left py-3 px-2 text-sm font-semibold text-slate-300">
                {{ mt.emoji }} {{ mt.display_name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let day of weeklyMenu?.days" class="border-b border-sky-500/5 hover:bg-white/[0.02] transition-colors">
              <td class="py-3 px-2 font-medium text-sky-300 text-sm">{{ day.day }}</td>
              <td *ngFor="let mt of mealTimes" class="py-3 px-2">
                <ng-container *ngIf="getMealForTime(day, mt.name) as entry">
                  <div class="flex items-center gap-2">
                    <span class="material-icons-round text-xs" [style.color]="getMealTypeColor(entry.meal_type)">
                      {{ getMealTypeIcon(entry.meal_type) }}
                    </span>
                    <span class="text-sm text-slate-300">{{ entry.meal_name }}</span>
                    <span *ngIf="entry.is_favorite" class="material-icons-round text-xs text-pink-400">favorite</span>
                  </div>
                </ng-container>
                <span *ngIf="!getMealForTime(day, mt.name)" class="text-slate-600 text-xs italic">Sin asignar</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card View -->
      <div *ngIf="!showWeeklyView" class="grid gap-4">
        <div *ngFor="let day of weeklyMenu?.days; let di = index"
             class="glass-card p-5 animate-slide-up" [style.animation-delay]="di * 50 + 'ms'">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center">
              <span class="text-lg font-bold text-sky-300">{{ day.day.charAt(0) }}</span>
            </div>
            <h3 class="text-lg font-semibold text-white">{{ day.day }}</h3>
          </div>

          <div class="grid gap-3">
            <div *ngFor="let entry of day.meals; let mi = index"
                 class="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/40 transition-all"
                 draggable="true"
                 (dragstart)="onDragStart($event, di, mi)"
                 (dragover)="onDragOver($event)"
                 (drop)="onDrop($event, di, mi)">
              
              <!-- Meal Time Label -->
              <div class="flex-shrink-0 w-20">
                <span class="text-xs font-medium text-slate-500">{{ getMealTimeEmoji(entry.meal_time) }} {{ getMealTimeLabel(entry.meal_time) }}</span>
              </div>

              <!-- Type Icon -->
              <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" 
                   [style.background]="getMealTypeColor(entry.meal_type) + '20'">
                <span class="material-icons-round text-sm" [style.color]="getMealTypeColor(entry.meal_type)">
                  {{ getMealTypeIcon(entry.meal_type) }}
                </span>
              </div>

              <!-- Meal Name -->
              <span class="flex-1 text-sm text-slate-200 truncate">{{ entry.meal_name }}</span>

              <!-- Actions -->
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="randomizeMeal(di, mi)" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-sky-400 transition-colors" title="Aleatorizar">
                  <span class="material-icons-round text-base">shuffle</span>
                </button>
                <button (click)="openMealSelector(di, mi)" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-violet-400 transition-colors" title="Seleccionar">
                  <span class="material-icons-round text-base">edit_note</span>
                </button>
                <button (click)="toggleFavorite(di, mi)" class="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        [class]="entry.is_favorite ? 'text-pink-400' : 'text-slate-500 hover:text-pink-400'" title="Favorito">
                  <span class="material-icons-round text-base">{{ entry.is_favorite ? 'favorite' : 'favorite_border' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meal Selector Modal -->
      <div *ngIf="showMealSelector" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="showMealSelector = false">
        <div class="glass-card p-6 w-full max-w-lg max-h-[80vh] flex flex-col animate-slide-up" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Seleccionar Comida</h3>
            <button (click)="showMealSelector = false" class="p-1 rounded-lg hover:bg-white/5 text-slate-400">
              <span class="material-icons-round">close</span>
            </button>
          </div>

          <input [(ngModel)]="selectorSearch" placeholder="Buscar comida..." class="input-field mb-4">

          <!-- Type Filter -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button (click)="selectorTypeFilter = null"
                    [class]="!selectorTypeFilter ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-slate-800/40 text-slate-400 border-slate-700/50'"
                    class="px-3 py-1 rounded-full text-xs font-medium border transition-all">
              Todos
            </button>
            <button *ngFor="let type of mealTypes" (click)="selectorTypeFilter = type"
                    [class]="selectorTypeFilter === type ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-slate-800/40 text-slate-400 border-slate-700/50'"
                    class="px-3 py-1 rounded-full text-xs font-medium border transition-all">
              {{ getMealTypeLabel(type) }}
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-1">
            <button *ngFor="let meal of filteredSelectorMeals()"
                    (click)="selectMeal(meal)"
                    class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left">
              <span class="material-icons-round text-sm" [style.color]="getMealTypeColor(meal.type)">
                {{ getMealTypeIcon(meal.type) }}
              </span>
              <span class="flex-1 text-sm text-slate-200">{{ meal.name }}</span>
              <span *ngIf="meal.is_favorite" class="material-icons-round text-xs text-pink-400">favorite</span>
            </button>
            <p *ngIf="filteredSelectorMeals().length === 0" class="text-center text-slate-500 py-8 text-sm">No se encontraron comidas</p>
          </div>
        </div>
      </div>

      <!-- Share Modal -->
      <div *ngIf="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="showShareModal = false">
        <div class="glass-card p-6 w-full max-w-md animate-slide-up" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">Compartir Menú</h3>
            <button (click)="showShareModal = false" class="p-1 rounded-lg hover:bg-white/5 text-slate-400">
              <span class="material-icons-round">close</span>
            </button>
          </div>

          <div class="mb-4">
            <button (click)="copyMenuText()" class="btn-secondary w-full flex items-center justify-center gap-2 mb-3">
              <span class="material-icons-round text-lg">content_copy</span>
              Copiar como texto
            </button>
            <p *ngIf="copied" class="text-center text-green-400 text-sm">¡Copiado!</p>
          </div>

          <div *ngIf="friends.length > 0">
            <p class="text-sm text-slate-400 mb-3">Enviar a un amigo:</p>
            <div class="space-y-2">
              <button *ngFor="let friend of friends" (click)="shareWithFriend(friend.id)"
                      class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                  {{ (friend.display_name || friend.email).charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm text-slate-200">{{ friend.display_name || friend.email }}</p>
                  <p class="text-xs text-slate-500">{{ friend.email }}</p>
                </div>
                <span *ngIf="sharedWith[friend.id]" class="material-icons-round text-green-400 text-lg ml-auto">check_circle</span>
              </button>
            </div>
          </div>
          <p *ngIf="friends.length === 0" class="text-sm text-slate-500 text-center py-4">No tienes amigos aún. Añade amigos desde la pestaña Amigos.</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <span class="material-icons-round text-4xl text-sky-400 animate-spin">refresh</span>
          <span class="text-slate-400">Cargando menú...</span>
        </div>
      </div>
    </div>
  `
})
export class MenuComponent implements OnInit {
  weeklyMenu: WeeklyMenu | null = null;
  meals: Meal[] = [];
  mealTimes: MealTime[] = [];
  friends: any[] = [];
  mealTypes = Object.values(MealType);
  loading = true;
  showWeeklyView = false;
  showMealSelector = false;
  showShareModal = false;
  selectorSearch = '';
  selectorTypeFilter: MealType | null = null;
  selectedDayIndex = 0;
  selectedMealIndex = 0;
  copied = false;
  sharedWith: Record<string, boolean> = {};

  private dragData: { dayIndex: number; mealIndex: number } | null = null;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [meals, mealTimes, menu, friends] = await Promise.all([
        this.supabase.getMeals(),
        this.supabase.getMealTimes(),
        this.supabase.getWeeklyMenu(),
        this.supabase.getFriends()
      ]);
      this.meals = meals.filter(m => !m.is_hidden);
      this.mealTimes = mealTimes.length > 0 ? mealTimes : DEFAULT_MEAL_TIMES as any;
      this.friends = friends;
      this.weeklyMenu = menu;
      if (!this.weeklyMenu || !this.weeklyMenu.days || this.weeklyMenu.days.length === 0) {
        this.generateMenu();
      }
    } catch (err) {
      console.error('Error loading menu data:', err);
    } finally {
      this.loading = false;
    }
  }

  async generateMenu() {
    const days: DayMenu[] = DAYS_OF_WEEK.map(day => ({
      day,
      meals: this.mealTimes.map(mt => {
        const filtered = this.meals.filter(m => m.meal_time === mt.name);
        const meal = filtered.length > 0
          ? filtered[Math.floor(Math.random() * filtered.length)]
          : null;
        return {
          meal_time: mt.name,
          meal_id: meal?.id,
          meal_name: meal?.name || 'Sin asignar',
          meal_type: meal?.type || MealType.vegetables,
          is_favorite: meal?.is_favorite || false,
        } as DayMealEntry;
      })
    }));

    this.weeklyMenu = { days, ...(this.weeklyMenu?.id ? { id: this.weeklyMenu.id } : {}) };
    await this.saveMenu();
  }

  async randomizeMeal(dayIndex: number, mealIndex: number) {
    if (!this.weeklyMenu) return;
    const entry = this.weeklyMenu.days[dayIndex].meals[mealIndex];
    const filtered = this.meals.filter(m => m.meal_time === entry.meal_time);
    if (filtered.length === 0) return;
    const meal = filtered[Math.floor(Math.random() * filtered.length)];
    entry.meal_id = meal.id;
    entry.meal_name = meal.name;
    entry.meal_type = meal.type;
    entry.is_favorite = meal.is_favorite;
    await this.saveMenu();
  }

  openMealSelector(dayIndex: number, mealIndex: number) {
    this.selectedDayIndex = dayIndex;
    this.selectedMealIndex = mealIndex;
    this.selectorSearch = '';
    this.selectorTypeFilter = null;
    this.showMealSelector = true;
  }

  filteredSelectorMeals(): Meal[] {
    let filtered = this.meals;
    if (this.weeklyMenu) {
      const entry = this.weeklyMenu.days[this.selectedDayIndex].meals[this.selectedMealIndex];
      filtered = filtered.filter(m => m.meal_time === entry.meal_time);
    }
    if (this.selectorTypeFilter) {
      filtered = filtered.filter(m => m.type === this.selectorTypeFilter);
    }
    if (this.selectorSearch) {
      const search = this.selectorSearch.toLowerCase();
      filtered = filtered.filter(m => m.name.toLowerCase().includes(search));
    }
    return filtered;
  }

  async selectMeal(meal: Meal) {
    if (!this.weeklyMenu) return;
    const entry = this.weeklyMenu.days[this.selectedDayIndex].meals[this.selectedMealIndex];
    entry.meal_id = meal.id;
    entry.meal_name = meal.name;
    entry.meal_type = meal.type;
    entry.is_favorite = meal.is_favorite;
    this.showMealSelector = false;
    await this.saveMenu();
  }

  async toggleFavorite(dayIndex: number, mealIndex: number) {
    if (!this.weeklyMenu) return;
    const entry = this.weeklyMenu.days[dayIndex].meals[mealIndex];
    entry.is_favorite = !entry.is_favorite;
    if (entry.meal_id) {
      try {
        await this.supabase.updateMeal(entry.meal_id, { is_favorite: entry.is_favorite });
      } catch (err) {
        console.error('Error updating favorite:', err);
      }
    }
    await this.saveMenu();
  }

  // Drag and Drop
  onDragStart(event: DragEvent, dayIndex: number, mealIndex: number) {
    this.dragData = { dayIndex, mealIndex };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  async onDrop(event: DragEvent, targetDayIndex: number, targetMealIndex: number) {
    event.preventDefault();
    if (!this.dragData || !this.weeklyMenu) return;
    const { dayIndex: srcDay, mealIndex: srcMeal } = this.dragData;
    const srcEntry = this.weeklyMenu.days[srcDay].meals[srcMeal];
    const tgtEntry = this.weeklyMenu.days[targetDayIndex].meals[targetMealIndex];

    if (srcEntry.meal_time === tgtEntry.meal_time) {
      const temp = { ...srcEntry };
      Object.assign(srcEntry, { meal_id: tgtEntry.meal_id, meal_name: tgtEntry.meal_name, meal_type: tgtEntry.meal_type, is_favorite: tgtEntry.is_favorite });
      Object.assign(tgtEntry, { meal_id: temp.meal_id, meal_name: temp.meal_name, meal_type: temp.meal_type, is_favorite: temp.is_favorite });
      await this.saveMenu();
    }
    this.dragData = null;
  }

  // Share
  shareMenu() {
    this.showShareModal = true;
    this.copied = false;
    this.sharedWith = {};
  }

  getMenuText(): string {
    if (!this.weeklyMenu) return '';
    let text = '🍽️ Menú Semanal\n\n';
    for (const day of this.weeklyMenu.days) {
      text += `📅 ${day.day}\n`;
      for (const entry of day.meals) {
        const emoji = this.getMealTimeEmoji(entry.meal_time);
        text += `  ${emoji} ${this.getMealTimeLabel(entry.meal_time)}: ${entry.meal_name}`;
        if (entry.is_favorite) text += ' ❤️';
        text += '\n';
      }
      text += '\n';
    }
    return text;
  }

  async copyMenuText() {
    try {
      await navigator.clipboard.writeText(this.getMenuText());
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    } catch {}
  }

  async shareWithFriend(friendId: string) {
    if (!this.weeklyMenu) return;
    try {
      await this.supabase.shareMenuWithFriend(friendId, this.weeklyMenu);
      this.sharedWith[friendId] = true;
    } catch (err) {
      console.error('Error sharing menu:', err);
    }
  }

  async saveMenu() {
    if (!this.weeklyMenu) return;
    try {
      const saved = await this.supabase.saveWeeklyMenu(this.weeklyMenu);
      this.weeklyMenu.id = saved.id;
    } catch (err) {
      console.error('Error saving menu:', err);
    }
  }

  getMealForTime(day: DayMenu, timeName: string): DayMealEntry | null {
    return day.meals.find(m => m.meal_time === timeName) || null;
  }

  getMealTimeEmoji(timeName: string): string {
    return this.mealTimes.find(t => t.name === timeName)?.emoji || '🍽️';
  }

  getMealTimeLabel(timeName: string): string {
    return this.mealTimes.find(t => t.name === timeName)?.display_name || timeName;
  }

  getMealTypeColor(type: MealType): string {
    return MEAL_TYPE_COLORS[type] || '#94a3b8';
  }

  getMealTypeIcon(type: MealType): string {
    return MEAL_TYPE_ICONS[type] || 'restaurant';
  }

  getMealTypeLabel(type: MealType): string {
    return MEAL_TYPE_LABELS[type] || type;
  }
}
