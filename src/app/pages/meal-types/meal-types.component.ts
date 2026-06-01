import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ConfirmModalService } from '../../components/confirm-modal/confirm-modal.service';
import { CustomMealType } from '../../models/meal.model';

@Component({
  selector: 'app-meal-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 sm:space-y-6 animate-fade-in pb-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span class="material-icons-round text-sky-400">category</span>
            Tipos de Comida
          </h1>
          <p class="text-slate-400 text-sm mt-1">Tipos predefinidos + personalizados</p>
        </div>
        <button (click)="openAddModal()" class="btn-primary flex items-center gap-2 text-sm">
          <span class="material-icons-round text-lg">add</span>
          Añadir Tipo
        </button>
      </div>

      <!-- Default Types -->
      <div>
        <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tipos predefinidos</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div *ngFor="let dt of defaultTypes" class="glass-card p-4 text-center !rounded-xl">
            <div class="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center" [style.background]="dt.color + '20'">
              <span class="material-icons-round text-xl" [style.color]="dt.color">{{ dt.icon }}</span>
            </div>
            <p class="text-sm font-medium text-slate-200">{{ dt.name }}</p>
          </div>
        </div>
      </div>

      <!-- Custom Types -->
      <div>
        <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tipos personalizados</h2>
        <div class="grid gap-3">
          <div *ngFor="let ct of customTypes; let i = index"
               class="glass-card p-4 flex items-center gap-4 !rounded-xl animate-slide-up"
               [style.animation-delay]="i * 50 + 'ms'"
               [class.opacity-50]="!ct.is_active">
            
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" [style.background]="ct.color + '20'">
              <span class="material-icons-round text-xl" [style.color]="ct.color">{{ ct.icon }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-slate-200">{{ ct.display_name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="w-3 h-3 rounded-full" [style.background]="ct.color"></span>
                <span class="text-xs text-slate-500">{{ ct.is_active ? 'Activo' : 'Inactivo' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-1 flex-shrink-0">
              <button (click)="toggleActive(ct)" class="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      [class]="ct.is_active ? 'text-green-400' : 'text-slate-500'">
                <span class="material-icons-round text-base">{{ ct.is_active ? 'toggle_on' : 'toggle_off' }}</span>
              </button>
              <button (click)="openEditModal(ct)" class="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-sky-400 transition-colors">
                <span class="material-icons-round text-base">edit</span>
              </button>
              <button (click)="deleteType(ct)" class="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors">
                <span class="material-icons-round text-base">delete_outline</span>
              </button>
            </div>
          </div>

          <p *ngIf="customTypes.length === 0 && !loading" class="text-center text-slate-500 py-8">
            No hay tipos personalizados
          </p>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" (click)="showModal = false">
        <div class="glass-card p-5 sm:p-6 w-full sm:max-w-md animate-slide-up rounded-t-2xl sm:rounded-2xl" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white mb-4">{{ editing ? 'Editar' : 'Añadir' }} Tipo</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Nombre</label>
              <input [(ngModel)]="formDisplayName" class="input-field" placeholder="Ej: Legumbres">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Color</label>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let c of colorOptions" (click)="formColor = c"
                        [class]="formColor === c ? 'ring-2 ring-white scale-110' : ''"
                        class="w-8 h-8 rounded-full transition-all" [style.background]="c">
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Icono</label>
              <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                <button *ngFor="let ic of iconOptions" (click)="formIcon = ic"
                        [class]="formIcon === ic ? 'ring-2 ring-sky-400 bg-sky-500/20' : 'bg-slate-800/40 hover:bg-slate-700/40'"
                        class="w-10 h-10 rounded-xl flex items-center justify-center transition-all">
                  <span class="material-icons-round text-lg text-slate-300">{{ ic }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="showModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button (click)="saveType()" class="btn-primary flex-1" [disabled]="!formDisplayName.trim()">
              {{ editing ? 'Guardar' : 'Añadir' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <span class="material-icons-round text-4xl text-sky-400 animate-spin">refresh</span>
      </div>
    </div>
  `
})
export class MealTypesComponent implements OnInit {
  customTypes: CustomMealType[] = [];
  loading = true;
  showModal = false;
  editing: CustomMealType | null = null;

  formDisplayName = '';
  formColor = '#3b82f6';
  formIcon = 'restaurant';

  defaultTypes = [
    { name: 'Proteína', color: '#ef4444', icon: 'restaurant' },
    { name: 'Pescado', color: '#3b82f6', icon: 'set_meal' },
    { name: 'Carbohidratos', color: '#f59e0b', icon: 'bakery_dining' },
    { name: 'Verduras', color: '#22c55e', icon: 'eco' },
  ];

  colorOptions = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];

  iconOptions = [
    'restaurant', 'set_meal', 'bakery_dining', 'eco', 'egg',
    'kebab_dining', 'ramen_dining', 'rice_bowl', 'local_pizza',
    'icecream', 'local_cafe', 'local_bar', 'tapas', 'soup_kitchen',
    'brunch_dining', 'dinner_dining', 'fastfood', 'cake'
  ];

  constructor(private supabase: SupabaseService, private confirmService: ConfirmModalService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      this.customTypes = await this.supabase.getCustomMealTypes();
    } catch (err) {
      console.error('Error loading custom types:', err);
    } finally {
      this.loading = false;
    }
  }

  openAddModal() {
    this.editing = null;
    this.formDisplayName = '';
    this.formColor = '#3b82f6';
    this.formIcon = 'restaurant';
    this.showModal = true;
  }

  openEditModal(ct: CustomMealType) {
    this.editing = ct;
    this.formDisplayName = ct.display_name;
    this.formColor = ct.color;
    this.formIcon = ct.icon;
    this.showModal = true;
  }

  async saveType() {
    if (!this.formDisplayName.trim()) return;
    try {
      if (this.editing?.id) {
        const updated = await this.supabase.updateCustomMealType(this.editing.id, {
          display_name: this.formDisplayName.trim(),
          color: this.formColor,
          icon: this.formIcon
        });
        const idx = this.customTypes.findIndex(t => t.id === this.editing!.id);
        if (idx >= 0) this.customTypes[idx] = updated;
      } else {
        const name = this.formDisplayName.trim().toLowerCase().replace(/\s+/g, '_');
        const newType = await this.supabase.addCustomMealType({
          name,
          display_name: this.formDisplayName.trim(),
          color: this.formColor,
          icon: this.formIcon,
          is_active: true
        });
        this.customTypes.push(newType);
      }
      this.showModal = false;
    } catch (err) {
      console.error('Error saving type:', err);
    }
  }

  async toggleActive(ct: CustomMealType) {
    try {
      ct.is_active = !ct.is_active;
      await this.supabase.updateCustomMealType(ct.id!, { is_active: ct.is_active });
    } catch (err) {
      ct.is_active = !ct.is_active;
      console.error('Error toggling active:', err);
    }
  }

  async deleteType(ct: CustomMealType) {
    const ok = await this.confirmService.confirm({
      title: 'Eliminar tipo de comida',
      message: `¿Eliminar "${ct.display_name}"?`,
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) return;
    try {
      await this.supabase.deleteCustomMealType(ct.id!);
      this.customTypes = this.customTypes.filter(t => t.id !== ct.id);
    } catch (err) {
      console.error('Error deleting type:', err);
    }
  }
}
