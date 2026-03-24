import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService, ThemeColors, DEFAULT_THEME } from '../../services/theme.service';
import { MenuConfig, MealType, TypeDistribution, MEAL_TYPE_COLORS, MEAL_TYPE_ICONS, MEAL_TYPE_LABELS } from '../../models/meal.model';

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

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Fondo</label>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let bg of bgPresets; let i = index" (click)="applyBgPreset(bg)"
                      [class]="isBgPresetActive(bg) ? 'ring-2 ring-white scale-105' : ''"
                      class="w-16 h-8 rounded-lg transition-all"
                      [style.background]="'linear-gradient(135deg, ' + bg.bgStart + ', ' + bg.bgMid + ', ' + bg.bgEnd + ')'">
              </button>
            </div>
          </div>

          <!-- Preview -->
          <div class="p-4 rounded-xl border border-slate-700/50">
            <p class="text-xs text-slate-500 mb-2">Vista previa</p>
            <div class="flex items-center gap-3">
              <div class="h-8 flex-1 rounded-lg" [style.background]="'linear-gradient(135deg, ' + themeColors.primary + ', ' + themeColors.accent + ')'"></div>
              <div class="h-8 w-16 rounded-lg" [style.background]="'linear-gradient(135deg, ' + themeColors.bgStart + ', ' + themeColors.bgMid + ')'"></div>
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

      <!-- Type Distribution -->
      <div class="glass-card p-6 !rounded-xl">
        <h2 class="text-lg font-semibold text-white mb-4">Distribución de Tipos</h2>
        <p class="text-sm text-slate-400 mb-6">Configura el porcentaje de cada tipo de comida en el menú generado</p>
        
        <div class="space-y-5">
          <div *ngFor="let dist of typeDistribution" class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-icons-round text-sm" [style.color]="getMealTypeColor(dist.meal_type)">
                  {{ getMealTypeIcon(dist.meal_type) }}
                </span>
                <span class="text-sm font-medium text-slate-200">{{ getMealTypeLabel(dist.meal_type) }}</span>
              </div>
              <span class="text-sm font-bold text-sky-300">{{ dist.percentage }}%</span>
            </div>
            <div class="relative">
              <input type="range" [(ngModel)]="dist.percentage" min="0" max="100" step="5"
                     class="w-full h-2 rounded-full appearance-none cursor-pointer"
                     [style.background]="'linear-gradient(to right, ' + getMealTypeColor(dist.meal_type) + ' ' + dist.percentage + '%, rgba(30,41,59,0.6) ' + dist.percentage + '%)'">
            </div>
          </div>
        </div>

        <div class="mt-6 p-3 rounded-xl" [class]="totalPercentage === 100 ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'">
          <div class="flex items-center justify-between">
            <span class="text-sm" [class]="totalPercentage === 100 ? 'text-green-400' : 'text-amber-400'">
              Total: {{ totalPercentage }}%
            </span>
            <span *ngIf="totalPercentage !== 100" class="text-xs text-amber-400">Debe sumar 100%</span>
            <span *ngIf="totalPercentage === 100" class="material-icons-round text-green-400 text-sm">check_circle</span>
          </div>
        </div>

        <button (click)="saveConfig()" [disabled]="saving || totalPercentage !== 100" class="btn-primary w-full mt-4 flex items-center justify-center gap-2">
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
  typeDistribution: TypeDistribution[] = [];
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

  bgPresets: Partial<ThemeColors>[] = [
    { bgStart: '#0f172a', bgMid: '#1e293b', bgEnd: '#0f172a' },
    { bgStart: '#0c0a09', bgMid: '#1c1917', bgEnd: '#0c0a09' },
    { bgStart: '#0f172a', bgMid: '#172554', bgEnd: '#0f172a' },
    { bgStart: '#0a0a0a', bgMid: '#171717', bgEnd: '#0a0a0a' },
    { bgStart: '#0f0f23', bgMid: '#1a1a3e', bgEnd: '#0f0f23' },
    { bgStart: '#0d1117', bgMid: '#161b22', bgEnd: '#0d1117' },
  ];

  constructor(private supabase: SupabaseService, private themeService: ThemeService) {}

  get totalPercentage(): number {
    return this.typeDistribution.reduce((sum, d) => sum + d.percentage, 0);
  }

  async ngOnInit() {
    this.loading = true;
    try {
      this.themeColors = this.themeService.getTheme();
      const config = await this.supabase.getMenuConfig();
      if (config?.type_distribution) {
        this.typeDistribution = config.type_distribution;
      } else {
        this.typeDistribution = [
          { meal_type: MealType.protein, percentage: 30 },
          { meal_type: MealType.fish, percentage: 20 },
          { meal_type: MealType.carbohydrates, percentage: 25 },
          { meal_type: MealType.vegetables, percentage: 25 },
        ];
      }
      const profile = await this.supabase.getProfile();
      this.displayName = profile?.display_name || '';
    } catch (err) {
      console.error('Error loading config:', err);
      this.typeDistribution = [
        { meal_type: MealType.protein, percentage: 30 },
        { meal_type: MealType.fish, percentage: 20 },
        { meal_type: MealType.carbohydrates, percentage: 25 },
        { meal_type: MealType.vegetables, percentage: 25 },
      ];
    } finally {
      this.loading = false;
    }
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
      await this.supabase.saveMenuConfig({ type_distribution: this.typeDistribution });
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

  getMealTypeColor(type: MealType): string { return MEAL_TYPE_COLORS[type] || '#94a3b8'; }
  getMealTypeIcon(type: MealType): string { return MEAL_TYPE_ICONS[type] || 'restaurant'; }
  getMealTypeLabel(type: MealType): string { return MEAL_TYPE_LABELS[type] || type; }
}
