import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import {
  Meal, MealType, MealTime, DayMenu, DayMealEntry, WeeklyMenu,
  MenuConfig, MealTimeDistribution, TypeDistribution, CustomMealType,
  DAYS_OF_WEEK, DEFAULT_MEAL_TIMES, MEAL_TYPE_COLORS, MEAL_TYPE_ICONS, MEAL_TYPE_LABELS
} from '../../models/meal.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 sm:space-y-6 animate-fade-in pb-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span class="material-icons-round text-sky-400">calendar_month</span>
            Menú Semanal
          </h1>
          <p class="text-slate-400 text-sm mt-1">Planifica tus comidas de la semana</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <button (click)="generateMenu()" class="btn-primary flex items-center gap-1.5 sm:gap-2 text-sm">
            <span class="material-icons-round text-base sm:text-lg">auto_awesome</span>
            Generar Menú
          </button>
          <button (click)="showWeeklyView = !showWeeklyView" class="btn-secondary flex items-center gap-1.5 sm:gap-2 text-sm">
            <span class="material-icons-round text-base sm:text-lg">{{ showWeeklyView ? 'view_agenda' : 'table_chart' }}</span>
            {{ showWeeklyView ? 'Vista Tarjetas' : 'Vista Semanal' }}
          </button>
          <button (click)="shareMenu()" class="btn-secondary flex items-center gap-1.5 sm:gap-2 text-sm">
            <span class="material-icons-round text-base sm:text-lg">share</span>
            Compartir
          </button>
        </div>
      </div>

      <!-- Weekly Table View - Desktop -->
      <div *ngIf="showWeeklyView" class="glass-card p-3 sm:p-4 animate-slide-up">
        <!-- Desktop table -->
        <div class="hidden sm:block overflow-x-auto">
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
        <!-- Mobile list -->
        <div class="sm:hidden space-y-3">
          <div *ngFor="let day of weeklyMenu?.days" class="p-3 rounded-xl bg-slate-800/30">
            <p class="text-sm font-semibold text-sky-300 mb-2">{{ day.day }}</p>
            <div class="space-y-1.5">
              <div *ngFor="let mt of mealTimes" class="flex items-start gap-2">
                <ng-container *ngIf="getMealForTime(day, mt.name) as entry">
                  <span class="material-icons-round text-xs mt-0.5" [style.color]="getMealTypeColor(entry.meal_type)">
                    {{ getMealTypeIcon(entry.meal_type) }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <span class="text-sm text-slate-300 break-words">{{ entry.meal_name }}</span>
                    <span *ngIf="entry.is_favorite" class="material-icons-round text-xs text-pink-400 ml-1">favorite</span>
                    <p class="text-[10px] text-slate-500">{{ mt.emoji }} {{ mt.display_name }}</p>
                  </div>
                </ng-container>
                <ng-container *ngIf="!getMealForTime(day, mt.name)">
                  <span class="text-slate-600 text-xs italic">{{ mt.emoji }} Sin asignar</span>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card View -->
      <div *ngIf="!showWeeklyView" class="grid gap-3 sm:gap-4">
        <div *ngFor="let day of weeklyMenu?.days; let di = index"
             class="glass-card p-3 sm:p-5 animate-slide-up overflow-hidden" [style.animation-delay]="di * 50 + 'ms'">
          <div class="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-sm sm:text-lg font-bold text-sky-300">{{ day.day.charAt(0) }}</span>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-white">{{ day.day }}</h3>
          </div>

          <p class="text-[10px] text-slate-500 mb-2 flex items-center gap-1 sm:hidden">
            <span class="material-icons-round text-xs">touch_app</span>
            Mantén pulsado para reordenar
          </p>
          <p class="text-[10px] sm:text-xs text-slate-500 mb-2 items-center gap-1 hidden sm:flex">
            <span class="material-icons-round text-xs">swap_vert</span>
            Arrastra para reordenar
          </p>

          <div class="grid gap-1.5 sm:gap-2">
            <div *ngFor="let entry of day.meals; let mi = index"
                 class="group flex items-center gap-1.5 sm:gap-3 p-2 sm:p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/40 transition-all cursor-grab active:cursor-grabbing overflow-hidden"
                 [ngClass]="{'ring-1 ring-sky-400/40': dragOverTarget?.day === di && dragOverTarget?.meal === mi}"
                 draggable="true"
                 (dragstart)="onDragStart($event, di, mi)"
                 (dragover)="onDragOver($event, di, mi)"
                 (dragleave)="onDragLeave()"
                 (drop)="onDrop($event, di, mi)"
                 (dragend)="onDragLeave()">

              <!-- Drag Handle (hidden on mobile) -->
              <div class="flex-shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors hidden sm:block">
                <span class="material-icons-round text-base">drag_indicator</span>
              </div>

              <!-- Type Icon -->
              <div class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                   [style.background]="getMealTypeColor(entry.meal_type) + '20'">
                <span class="material-icons-round text-xs sm:text-sm" [style.color]="getMealTypeColor(entry.meal_type)">
                  {{ getMealTypeIcon(entry.meal_type) }}
                </span>
              </div>

              <!-- Meal Info -->
              <div class="flex-1 min-w-0">
                <span class="block text-[13px] sm:text-sm text-slate-200 truncate">{{ entry.meal_name }}</span>
                <span class="text-[10px] text-slate-500">{{ getMealTimeEmoji(entry.meal_time) }} {{ getMealTimeLabel(entry.meal_time) }}</span>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-0 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button (click)="randomizeMeal(di, mi)" class="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-sky-400 transition-colors" title="Aleatorizar">
                  <span class="material-icons-round text-[16px] sm:text-base">shuffle</span>
                </button>
                <button (click)="openMealSelector(di, mi)" class="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-violet-400 transition-colors" title="Seleccionar">
                  <span class="material-icons-round text-[16px] sm:text-base">edit_note</span>
                </button>
                <button (click)="toggleFavorite(di, mi)" class="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        [class]="entry.is_favorite ? 'text-pink-400' : 'text-slate-500 hover:text-pink-400'" title="Favorito">
                  <span class="material-icons-round text-[16px] sm:text-base">{{ entry.is_favorite ? 'favorite' : 'favorite_border' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meal Selector Modal -->
      <div *ngIf="showMealSelector" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" (click)="showMealSelector = false">
        <div class="glass-card p-5 sm:p-6 w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col animate-slide-up rounded-t-2xl sm:rounded-2xl" (click)="$event.stopPropagation()">
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
      <div *ngIf="showShareModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" (click)="showShareModal = false">
        <div class="glass-card p-5 sm:p-6 w-full sm:max-w-md max-h-[85vh] flex flex-col animate-slide-up rounded-t-2xl sm:rounded-2xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 class="text-lg font-semibold text-white">Compartir Menú</h3>
            <button (click)="showShareModal = false" class="p-1 rounded-lg hover:bg-white/5 text-slate-400">
              <span class="material-icons-round">close</span>
            </button>
          </div>

          <div class="mb-4 flex-shrink-0">
            <button (click)="copyMenuText()" class="btn-secondary w-full flex items-center justify-center gap-2 mb-3">
              <span class="material-icons-round text-lg">content_copy</span>
              Copiar como texto
            </button>
            <p *ngIf="copied" class="text-center text-green-400 text-sm">¡Copiado!</p>
          </div>

          <div *ngIf="friends.length > 0" class="flex flex-col flex-1 min-h-0">
            <p class="text-sm text-slate-400 mb-3 flex-shrink-0">Selecciona amigos:</p>
            <div class="space-y-2 overflow-y-auto flex-1 pr-1">
              <button *ngFor="let friend of friends" (click)="toggleFriendSelection(friend.id)"
                      class="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                      [class]="selectedFriends[friend.id] ? 'bg-sky-500/15 border border-sky-500/30' : 'hover:bg-white/5 border border-transparent'">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {{ (friend.display_name || friend.email).charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-200">{{ friend.display_name || friend.email }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ friend.email }}</p>
                </div>
                <span *ngIf="selectedFriends[friend.id]" class="material-icons-round text-sky-400 text-lg flex-shrink-0">check_circle</span>
                <span *ngIf="!selectedFriends[friend.id]" class="material-icons-round text-slate-600 text-lg flex-shrink-0">radio_button_unchecked</span>
              </button>
            </div>
            <div class="flex-shrink-0 pt-3 mt-2 border-t border-slate-700/50">
              <button (click)="shareWithSelected()" [disabled]="selectedFriendsCount === 0 || sharing"
                      class="btn-primary w-full flex items-center justify-center gap-2">
                <span *ngIf="sharing" class="material-icons-round animate-spin text-lg">refresh</span>
                <span *ngIf="!sharing" class="material-icons-round text-lg">send</span>
                {{ sharing ? 'Enviando...' : 'Enviar a ' + selectedFriendsCount + ' amigo' + (selectedFriendsCount !== 1 ? 's' : '') }}
              </button>
              <p *ngIf="shareMsg" class="text-center text-green-400 text-sm mt-2">{{ shareMsg }}</p>
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
  customTypes: CustomMealType[] = [];
  menuConfig: MenuConfig | null = null;
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
  selectedFriends: Record<string, boolean> = {};
  sharing = false;
  shareMsg = '';

  private dragData: { dayIndex: number; mealIndex: number } | null = null;
  dragOverTarget: { day: number; meal: number } | null = null;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [meals, mealTimes, menu, friends, config, customTypes] = await Promise.all([
        this.supabase.getMeals(),
        this.supabase.getMealTimes(),
        this.supabase.getWeeklyMenu(),
        this.supabase.getFriends(),
        this.supabase.getMenuConfig(),
        this.supabase.getCustomMealTypes()
      ]);
      this.meals = meals.filter(m => !m.is_hidden);
      this.mealTimes = mealTimes.length > 0 ? mealTimes : DEFAULT_MEAL_TIMES as any;
      this.friends = friends;
      this.menuConfig = config;
      this.customTypes = customTypes.filter(ct => ct.is_active);
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

  /** Pick a meal type based on weighted distribution for a given meal_time */
  private pickTypeByDistribution(mealTimeName: string): string | null {
    const dist = this.menuConfig?.per_meal_time_distribution?.find(d => d.meal_time === mealTimeName);
    if (!dist || dist.types.length === 0) return null;
    const total = dist.types.reduce((s, t) => s + t.percentage, 0);
    if (total <= 0) return null;
    let r = Math.random() * total;
    for (const t of dist.types) {
      r -= t.percentage;
      if (r <= 0) return t.meal_type;
    }
    return dist.types[dist.types.length - 1].meal_type;
  }

  /** Pick a random meal for a meal_time, respecting type distribution and avoiding used IDs.
   *  Favorites are prioritized: if there are favorite meals matching the criteria, pick from those first. */
  private pickMeal(mealTimeName: string, usedIds: Set<string>): Meal | null {
    const available = this.meals.filter(m => m.meal_time === mealTimeName && !usedIds.has(m.id || ''));
    if (available.length === 0) return null;

    const desiredType = this.pickTypeByDistribution(mealTimeName);
    if (desiredType) {
      const typed = available.filter(m => m.type === desiredType || (m as any).custom_type_id === desiredType);
      if (typed.length > 0) {
        const favs = typed.filter(m => m.is_favorite);
        if (favs.length > 0) return favs[Math.floor(Math.random() * favs.length)];
        return typed[Math.floor(Math.random() * typed.length)];
      }
    }
    // Fallback: pick any available meal, favs first
    const favs = available.filter(m => m.is_favorite);
    if (favs.length > 0) return favs[Math.floor(Math.random() * favs.length)];
    return available[Math.floor(Math.random() * available.length)];
  }

  async generateMenu() {
    const usedIds = new Set<string>();

    const days: DayMenu[] = DAYS_OF_WEEK.map(day => ({
      day,
      meals: this.mealTimes.map(mt => {
        const meal = this.pickMeal(mt.name, usedIds);
        if (meal?.id) usedIds.add(meal.id);
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

    // Collect all meal IDs already used in the menu, excluding the current slot
    const usedIds = new Set<string>();
    for (const day of this.weeklyMenu.days) {
      for (const e of day.meals) {
        if (e !== entry && e.meal_id) usedIds.add(e.meal_id);
      }
    }

    const meal = this.pickMeal(entry.meal_time, usedIds);
    if (!meal) return;
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

  onDragOver(event: DragEvent, dayIndex: number, mealIndex: number) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverTarget = { day: dayIndex, meal: mealIndex };
  }

  onDragLeave() {
    this.dragOverTarget = null;
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
    this.dragOverTarget = null;
  }

  // Share
  shareMenu() {
    this.showShareModal = true;
    this.copied = false;
    this.selectedFriends = {};
    this.shareMsg = '';
  }

  toggleFriendSelection(friendId: string) {
    this.selectedFriends[friendId] = !this.selectedFriends[friendId];
  }

  get selectedFriendsCount(): number {
    return Object.values(this.selectedFriends).filter(v => v).length;
  }

  async shareWithSelected() {
    if (!this.weeklyMenu || this.selectedFriendsCount === 0) return;
    this.sharing = true;
    this.shareMsg = '';
    try {
      const ids = Object.entries(this.selectedFriends).filter(([_, v]) => v).map(([id]) => id);
      for (const friendId of ids) {
        await this.supabase.shareMenuWithFriend(friendId, this.weeklyMenu);
      }
      this.shareMsg = `¡Menú enviado a ${ids.length} amigo${ids.length !== 1 ? 's' : ''}!`;
      this.selectedFriends = {};
    } catch (err) {
      console.error('Error sharing menu:', err);
    } finally {
      this.sharing = false;
    }
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
