import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService, ThemeColors, DEFAULT_THEME } from '../../services/theme.service';
import {
  MenuConfig, MealType, MealTime, MealTimeDistribution, TypeDistribution,
  CustomMealType, DEFAULT_MEAL_TIMES,
  MEAL_TYPE_COLORS, MEAL_TYPE_ICONS, MEAL_TYPE_LABELS
} from '../../models/meal.model';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-4">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <span class="material-icons-round text-sky-400">settings</span>
          Configuración
        </h1>
        <p class="text-slate-400 text-sm mt-1">Personaliza tu experiencia</p>
      </div>

      <!-- Theme Colors -->
      <div class="glass-card p-6 !rounded-xl">
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="material-icons-round text-base">palette</span>
          Colores del Tema
        </h2>
        <p class="text-sm text-slate-400 mb-6">Personaliza los colores de tu página</p>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Color primario</label>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let c of primaryColors" (click)="themeColors.primary = c; previewTheme()"
                      [class]="themeColors.primary === c ? 'ring-2 ring-white scale-110' : ''"
                      class="w-8 h-8 rounded-full transition-all" [style.background]="c">
              </button>
              <label class="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden relative" title="Color personalizado">
                <span class="material-icons-round text-slate-500 text-sm">add</span>
                <input type="color" [(ngModel)]="themeColors.primary" (input)="previewTheme()" class="absolute inset-0 opacity-0 cursor-pointer">
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Color de acento</label>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let c of accentColors" (click)="themeColors.accent = c; previewTheme()"
                      [class]="themeColors.accent === c ? 'ring-2 ring-white scale-110' : ''"
                      class="w-8 h-8 rounded-full transition-all" [style.background]="c">
              </button>
              <label class="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden relative" title="Color personalizado">
                <span class="material-icons-round text-slate-500 text-sm">add</span>
                <input type="color" [(ngModel)]="themeColors.accent" (input)="previewTheme()" class="absolute inset-0 opacity-0 cursor-pointer">
              </label>
            </div>
          </div>

          <!-- Background Colors -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-3">Fondo (gradiente)</label>

            <!-- Quick presets -->
            <p class="text-xs text-slate-500 mb-2">Presets rápidos</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <button *ngFor="let bg of bgPresets" (click)="applyBgPreset(bg)"
                      [class]="isBgPresetActive(bg) ? 'ring-2 ring-white scale-105' : ''"
                      class="w-14 h-7 rounded-lg transition-all"
                      [style.background]="'linear-gradient(135deg, ' + bg.bgStart + ', ' + bg.bgMid + ', ' + bg.bgEnd + ')'">
              </button>
            </div>

            <!-- bgStart -->
            <div class="mb-3">
              <p class="text-xs text-slate-500 mb-1.5">Color inicio</p>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let c of bgColors" (click)="themeColors.bgStart = c; previewTheme()"
                        [class]="themeColors.bgStart === c ? 'ring-2 ring-white scale-110' : ''"
                        class="w-8 h-8 rounded-full transition-all" [style.background]="c">
                </button>
                <label class="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden relative" title="Color personalizado">
                  <span class="material-icons-round text-slate-500 text-sm">add</span>
                  <input type="color" [(ngModel)]="themeColors.bgStart" (input)="previewTheme()" class="absolute inset-0 opacity-0 cursor-pointer">
                </label>
              </div>
            </div>

            <!-- bgMid -->
            <div class="mb-3">
              <p class="text-xs text-slate-500 mb-1.5">Color centro</p>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let c of bgColors" (click)="themeColors.bgMid = c; previewTheme()"
                        [class]="themeColors.bgMid === c ? 'ring-2 ring-white scale-110' : ''"
                        class="w-8 h-8 rounded-full transition-all" [style.background]="c">
                </button>
                <label class="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden relative" title="Color personalizado">
                  <span class="material-icons-round text-slate-500 text-sm">add</span>
                  <input type="color" [(ngModel)]="themeColors.bgMid" (input)="previewTheme()" class="absolute inset-0 opacity-0 cursor-pointer">
                </label>
              </div>
            </div>

            <!-- bgEnd -->
            <div class="mb-3">
              <p class="text-xs text-slate-500 mb-1.5">Color final</p>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let c of bgColors" (click)="themeColors.bgEnd = c; previewTheme()"
                        [class]="themeColors.bgEnd === c ? 'ring-2 ring-white scale-110' : ''"
                        class="w-8 h-8 rounded-full transition-all" [style.background]="c">
                </button>
                <label class="w-8 h-8 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer overflow-hidden relative" title="Color personalizado">
                  <span class="material-icons-round text-slate-500 text-sm">add</span>
                  <input type="color" [(ngModel)]="themeColors.bgEnd" (input)="previewTheme()" class="absolute inset-0 opacity-0 cursor-pointer">
                </label>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="p-4 rounded-xl border border-slate-700/50">
            <p class="text-xs text-slate-500 mb-2">Vista previa</p>
            <div class="space-y-2">
              <div class="h-8 w-full rounded-lg" [style.background]="'linear-gradient(135deg, ' + themeColors.primary + ', ' + themeColors.accent + ')'"></div>
              <div class="h-10 w-full rounded-lg" [style.background]="'linear-gradient(180deg, ' + themeColors.bgStart + ', ' + themeColors.bgMid + ', ' + themeColors.bgEnd + ')'"></div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button (click)="resetTheme()" class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
            <span class="material-icons-round text-base">refresh</span>
            Resetear
          </button>
          <button (click)="saveTheme()" [disabled]="savingTheme" class="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <span *ngIf="savingTheme" class="material-icons-round animate-spin text-base">refresh</span>
            {{ savingTheme ? 'Guardando...' : 'Guardar Colores' }}
          </button>
        </div>
        <p *ngIf="themeMsg" class="text-center text-green-400 text-sm mt-2">{{ themeMsg }}</p>
      </div>

      <!-- Per-MealTime Type Distribution -->
      <div class="glass-card p-6 !rounded-xl">
        <h2 class="text-lg font-semibold text-white mb-2">Distribución de Tipos por Tiempo de Comida</h2>
        <p class="text-sm text-slate-400 mb-6">Configura el porcentaje de cada tipo para cada tiempo de comida</p>

        <!-- Meal time tabs -->
        <div class="flex gap-1 p-1 rounded-xl bg-slate-800/40 mb-6">
          <button *ngFor="let mt of mealTimes" (click)="selectedMealTime = mt.name"
                  [class]="selectedMealTime === mt.name ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-300'"
                  class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
            <span>{{ mt.emoji }}</span>
            {{ mt.display_name }}
          </button>
        </div>

        <!-- Sliders for selected meal time -->
        <div *ngFor="let mtDist of perMealTimeDist">
          <div *ngIf="mtDist.meal_time === selectedMealTime" class="space-y-5">
            <div *ngFor="let dist of mtDist.types" class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-icons-round text-sm" [style.color]="getTypeColor(dist.meal_type)">
                    {{ getTypeIcon(dist.meal_type) }}
                  </span>
                  <span class="text-sm font-medium text-slate-200">{{ getTypeLabel(dist.meal_type) }}</span>
                </div>
                <span class="text-sm font-bold text-sky-300">{{ dist.percentage }}%</span>
              </div>
              <div class="relative">
                <input type="range" [(ngModel)]="dist.percentage" min="0" max="100" step="5"
                       class="w-full h-2 rounded-full appearance-none cursor-pointer"
                       [style.background]="'linear-gradient(to right, ' + getTypeColor(dist.meal_type) + ' ' + dist.percentage + '%, rgba(30,41,59,0.6) ' + dist.percentage + '%)'">
              </div>
            </div>

            <div class="p-3 rounded-xl" [class]="getMealTimeTotal(mtDist) === 100 ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'">
              <div class="flex items-center justify-between">
                <span class="text-sm" [class]="getMealTimeTotal(mtDist) === 100 ? 'text-green-400' : 'text-amber-400'">
                  Total: {{ getMealTimeTotal(mtDist) }}%
                </span>
                <span *ngIf="getMealTimeTotal(mtDist) !== 100" class="text-xs text-amber-400">Debe sumar 100%</span>
                <span *ngIf="getMealTimeTotal(mtDist) === 100" class="material-icons-round text-green-400 text-sm">check_circle</span>
              </div>
            </div>
          </div>
        </div>

        <button (click)="saveConfig()" [disabled]="saving || !allMealTimesValid()" class="btn-primary w-full mt-4 flex items-center justify-center gap-2">
          <span *ngIf="saving" class="material-icons-round animate-spin text-lg">refresh</span>
          {{ saving ? 'Guardando...' : 'Guardar Configuración' }}
        </button>
        <p *ngIf="savedMsg" class="text-center text-green-400 text-sm mt-2">{{ savedMsg }}</p>
      </div>

      <!-- Profile -->
      <div class="glass-card p-6 !rounded-xl">
        <h2 class="text-lg font-semibold text-white mb-4">Perfil</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Nombre</label>
            <input [(ngModel)]="displayName" class="input-field" placeholder="Tu nombre">
          </div>
          <button (click)="updateProfile()" class="btn-primary flex items-center gap-2 text-sm">
            <span class="material-icons-round text-lg">save</span>
            Actualizar Perfil
          </button>
          <p *ngIf="profileMsg" class="text-green-400 text-sm">{{ profileMsg }}</p>
        </div>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <span class="material-icons-round text-4xl text-sky-400 animate-spin">refresh</span>
      </div>
    </div>
  `,
  styles: [`
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      cursor: pointer;
    }
  `]
})
export class ConfigComponent implements OnInit {
  mealTimes: MealTime[] = [];
  customTypes: CustomMealType[] = [];
  allTypeKeys: string[] = [];
  perMealTimeDist: MealTimeDistribution[] = [];
  selectedMealTime = '';
  loading = true;
  saving = false;
  savedMsg = '';
  displayName = '';
  profileMsg = '';
  themeColors: ThemeColors = { ...DEFAULT_THEME };
  savingTheme = false;
  themeMsg = '';

  primaryColors = [
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#22c55e',
    '#14b8a6', '#06b6d4'
  ];

  accentColors = [
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
    '#6366f1', '#0ea5e9'
  ];

  bgColors = [
    '#0f172a', '#1e293b', '#0c0a09', '#1c1917', '#171717',
    '#0a0a0a', '#0f0f23', '#1a1a3e', '#0d1117', '#161b22',
    '#172554', '#1e1b4b', '#14532d', '#422006', '#4c0519',
    '#27272a', '#262626', '#1f2937', '#111827', '#0c4a6e'
  ];

  bgPresets: Partial<ThemeColors>[] = [
    { bgStart: '#0f172a', bgMid: '#1e293b', bgEnd: '#0f172a' },
    { bgStart: '#0c0a09', bgMid: '#1c1917', bgEnd: '#0c0a09' },
    { bgStart: '#0f172a', bgMid: '#172554', bgEnd: '#0f172a' },
    { bgStart: '#0a0a0a', bgMid: '#171717', bgEnd: '#0a0a0a' },
    { bgStart: '#0f0f23', bgMid: '#1a1a3e', bgEnd: '#0f0f23' },
    { bgStart: '#0d1117', bgMid: '#161b22', bgEnd: '#0d1117' },
  ];

  constructor(private supabase: SupabaseService, private themeService: ThemeService) {}

  async ngOnInit() {
    this.loading = true;
    try {
      this.themeColors = this.themeService.getTheme();

      const [config, mealTimes, customTypes, profile] = await Promise.all([
        this.supabase.getMenuConfig(),
        this.supabase.getMealTimes(),
        this.supabase.getCustomMealTypes(),
        this.supabase.getProfile()
      ]);

      this.mealTimes = mealTimes.length > 0 ? mealTimes : DEFAULT_MEAL_TIMES as any;
      this.customTypes = customTypes.filter(ct => ct.is_active);
      this.displayName = profile?.display_name || '';

      // Build allTypeKeys: default + custom
      this.allTypeKeys = [
        ...Object.values(MealType),
        ...this.customTypes.map(ct => ct.name)
      ];

      // Set initial selected meal time
      if (this.mealTimes.length > 0) {
        this.selectedMealTime = this.mealTimes[0].name;
      }

      // Load or build per-meal-time distribution
      if (config?.per_meal_time_distribution && config.per_meal_time_distribution.length > 0) {
        this.perMealTimeDist = config.per_meal_time_distribution;
        // Ensure all meal times and all type keys exist
        for (const mt of this.mealTimes) {
          let mtDist = this.perMealTimeDist.find(d => d.meal_time === mt.name);
          if (!mtDist) {
            mtDist = { meal_time: mt.name, types: this.buildDefaultTypes() };
            this.perMealTimeDist.push(mtDist);
          } else {
            // Add any missing type keys
            for (const key of this.allTypeKeys) {
              if (!mtDist.types.find(t => t.meal_type === key)) {
                mtDist.types.push({ meal_type: key, percentage: 0 });
              }
            }
          }
        }
      } else {
        // Build default distribution for each meal time
        this.perMealTimeDist = this.mealTimes.map(mt => ({
          meal_time: mt.name,
          types: this.buildDefaultTypes()
        }));
      }
    } catch (err) {
      console.error('Error loading config:', err);
      this.mealTimes = DEFAULT_MEAL_TIMES as any;
      this.allTypeKeys = Object.values(MealType);
      this.selectedMealTime = this.mealTimes[0]?.name || '';
      this.perMealTimeDist = this.mealTimes.map(mt => ({
        meal_time: mt.name,
        types: this.buildDefaultTypes()
      }));
    } finally {
      this.loading = false;
    }
  }

  buildDefaultTypes(): TypeDistribution[] {
    const defaults = Object.values(MealType);
    const pct = Math.floor(100 / this.allTypeKeys.length);
    return this.allTypeKeys.map((key, i) => ({
      meal_type: key,
      percentage: i === 0 ? 100 - pct * (this.allTypeKeys.length - 1) : pct
    }));
  }

  getMealTimeTotal(mtDist: MealTimeDistribution): number {
    return mtDist.types.reduce((sum, d) => sum + d.percentage, 0);
  }

  allMealTimesValid(): boolean {
    return this.perMealTimeDist.every(mt => this.getMealTimeTotal(mt) === 100);
  }

  previewTheme() {
    this.themeService.saveTheme(this.themeColors);
  }

  applyBgPreset(bg: Partial<ThemeColors>) {
    this.themeColors.bgStart = bg.bgStart!;
    this.themeColors.bgMid = bg.bgMid!;
    this.themeColors.bgEnd = bg.bgEnd!;
    this.previewTheme();
  }

  isBgPresetActive(bg: Partial<ThemeColors>): boolean {
    return this.themeColors.bgStart === bg.bgStart && this.themeColors.bgMid === bg.bgMid && this.themeColors.bgEnd === bg.bgEnd;
  }

  async saveTheme() {
    this.savingTheme = true;
    this.themeMsg = '';
    try {
      await this.themeService.saveTheme(this.themeColors);
      this.themeMsg = '¡Colores guardados!';
      setTimeout(() => this.themeMsg = '', 3000);
    } catch (err) {
      console.error('Error saving theme:', err);
    } finally {
      this.savingTheme = false;
    }
  }

  resetTheme() {
    this.themeColors = { ...DEFAULT_THEME };
    this.themeService.saveTheme(this.themeColors);
  }

  async saveConfig() {
    this.saving = true;
    this.savedMsg = '';
    try {
      await this.supabase.saveMenuConfig({
        type_distribution: this.perMealTimeDist[0]?.types || [],
        per_meal_time_distribution: this.perMealTimeDist
      });
      this.savedMsg = '¡Configuración guardada!';
      setTimeout(() => this.savedMsg = '', 3000);
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      this.saving = false;
    }
  }

  async updateProfile() {
    this.profileMsg = '';
    try {
      await this.supabase.updateProfile({ display_name: this.displayName });
      this.profileMsg = '¡Perfil actualizado!';
      setTimeout(() => this.profileMsg = '', 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
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
}
