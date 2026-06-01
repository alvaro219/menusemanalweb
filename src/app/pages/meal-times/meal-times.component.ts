import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ConfirmModalService } from '../../components/confirm-modal/confirm-modal.service';
import { MealTime } from '../../models/meal.model';

@Component({
  selector: 'app-meal-times',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 sm:space-y-6 animate-fade-in pb-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span class="material-icons-round text-sky-400">schedule</span>
            Tiempos de Comida
          </h1>
          <p class="text-slate-400 text-sm mt-1">Configura cuándo comes</p>
        </div>
        <button (click)="openAddModal()" class="btn-primary flex items-center gap-2 text-sm">
          <span class="material-icons-round text-lg">add</span>
          Añadir Tiempo
        </button>
      </div>

      <div class="grid gap-3">
        <div *ngFor="let mt of mealTimes; let i = index"
             class="glass-card p-4 flex items-center gap-4 animate-slide-up !rounded-xl"
             [style.animation-delay]="i * 50 + 'ms'"
             draggable="true"
             (dragstart)="onDragStart($event, i)"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event, i)">
          
          <div class="flex-shrink-0 cursor-grab text-slate-600 hover:text-slate-400">
            <span class="material-icons-round">drag_indicator</span>
          </div>

          <div class="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-2xl flex-shrink-0">
            {{ mt.emoji }}
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-slate-200">{{ mt.display_name }}</p>
            <p class="text-xs text-slate-500">Orden: {{ mt.order_index + 1 }} · ID: {{ mt.name }}</p>
          </div>

          <div class="flex items-center gap-1 flex-shrink-0">
            <button (click)="openEditModal(mt)" class="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-sky-400 transition-colors">
              <span class="material-icons-round text-base">edit</span>
            </button>
            <button (click)="deleteMealTime(mt)" class="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors">
              <span class="material-icons-round text-base">delete_outline</span>
            </button>
          </div>
        </div>

        <p *ngIf="mealTimes.length === 0 && !loading" class="text-center text-slate-500 py-12">
          No hay tiempos de comida configurados
        </p>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" (click)="showModal = false">
        <div class="glass-card p-5 sm:p-6 w-full sm:max-w-md animate-slide-up rounded-t-2xl sm:rounded-2xl" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-white mb-4">{{ editing ? 'Editar' : 'Añadir' }} Tiempo de Comida</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Nombre</label>
              <input [(ngModel)]="formDisplayName" class="input-field" placeholder="Ej: Desayuno">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Identificador</label>
              <input [(ngModel)]="formName" class="input-field" placeholder="Ej: desayuno" [disabled]="!!editing">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Emoji</label>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let e of emojiOptions" (click)="formEmoji = e"
                        [class]="formEmoji === e ? 'ring-2 ring-sky-400 bg-sky-500/20' : 'bg-slate-800/40 hover:bg-slate-700/40'"
                        class="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all">
                  {{ e }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="showModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button (click)="saveMealTime()" class="btn-primary flex-1" [disabled]="!formDisplayName.trim() || !formName.trim()">
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
export class MealTimesComponent implements OnInit {
  mealTimes: MealTime[] = [];
  loading = true;
  showModal = false;
  editing: MealTime | null = null;

  formName = '';
  formDisplayName = '';
  formEmoji = '🍽️';

  emojiOptions = ['🍽️', '🌙', '☀️', '🌅', '🍳', '🥗', '🍕', '☕', '🥐', '🍰', '🫖', '🥤'];

  private dragIndex: number | null = null;

  constructor(private supabase: SupabaseService, private confirmService: ConfirmModalService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      this.mealTimes = await this.supabase.getMealTimes();
    } catch (err) {
      console.error('Error loading meal times:', err);
    } finally {
      this.loading = false;
    }
  }

  openAddModal() {
    this.editing = null;
    this.formName = '';
    this.formDisplayName = '';
    this.formEmoji = '🍽️';
    this.showModal = true;
  }

  openEditModal(mt: MealTime) {
    this.editing = mt;
    this.formName = mt.name;
    this.formDisplayName = mt.display_name;
    this.formEmoji = mt.emoji;
    this.showModal = true;
  }

  async saveMealTime() {
    if (!this.formName.trim() || !this.formDisplayName.trim()) return;
    try {
      if (this.editing?.id) {
        const updated = await this.supabase.updateMealTime(this.editing.id, {
          display_name: this.formDisplayName.trim(),
          emoji: this.formEmoji
        });
        const idx = this.mealTimes.findIndex(t => t.id === this.editing!.id);
        if (idx >= 0) this.mealTimes[idx] = updated;
      } else {
        const newTime = await this.supabase.addMealTime({
          name: this.formName.trim().toLowerCase().replace(/\s+/g, '_'),
          display_name: this.formDisplayName.trim(),
          emoji: this.formEmoji,
          order_index: this.mealTimes.length
        });
        this.mealTimes.push(newTime);
      }
      this.showModal = false;
    } catch (err) {
      console.error('Error saving meal time:', err);
    }
  }

  async deleteMealTime(mt: MealTime) {
    const ok = await this.confirmService.confirm({
      title: 'Eliminar tiempo de comida',
      message: `¿Eliminar "${mt.display_name}"?`,
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) return;
    try {
      await this.supabase.deleteMealTime(mt.id!);
      this.mealTimes = this.mealTimes.filter(t => t.id !== mt.id);
    } catch (err) {
      console.error('Error deleting meal time:', err);
    }
  }

  // Drag & Drop reorder
  onDragStart(event: DragEvent, index: number) {
    this.dragIndex = index;
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  async onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (this.dragIndex === null || this.dragIndex === targetIndex) return;
    const item = this.mealTimes.splice(this.dragIndex, 1)[0];
    this.mealTimes.splice(targetIndex, 0, item);
    this.dragIndex = null;

    for (let i = 0; i < this.mealTimes.length; i++) {
      this.mealTimes[i].order_index = i;
      try {
        await this.supabase.updateMealTime(this.mealTimes[i].id!, { order_index: i });
      } catch (err) {
        console.error('Error reordering:', err);
      }
    }
  }
}
