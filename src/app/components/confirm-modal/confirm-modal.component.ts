import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from './confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="service.visible" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" (click)="service.cancel()">
      <div class="glass-card p-5 sm:p-6 w-full sm:max-w-sm animate-slide-up rounded-t-2xl sm:rounded-2xl" (click)="$event.stopPropagation()">
        <h3 class="text-lg font-semibold text-white mb-2">{{ service.title }}</h3>
        <p class="text-sm text-slate-400 mb-6">{{ service.message }}</p>
        <div class="flex gap-3">
          <button *ngIf="service.showCancel" (click)="service.cancel()" class="btn-secondary flex-1">Cancelar</button>
          <button (click)="service.accept()" class="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-white"
                  [class]="service.danger ? 'bg-red-500/80 hover:bg-red-500' : 'btn-primary'">
            {{ service.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  constructor(public service: ConfirmModalService) {}
}
