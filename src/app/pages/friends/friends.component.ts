import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { FriendRequest, UserProfile, SharedMenu, WeeklyMenu, MEAL_TYPE_COLORS, MEAL_TYPE_ICONS, MealType } from '../../models/meal.model';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <span class="material-icons-round text-sky-400">people</span>
            Amigos
          </h1>
          <p class="text-slate-400 text-sm mt-1">Conecta y comparte menús</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 p-1 rounded-xl bg-slate-800/40">
        <button (click)="activeTab = 'friends'" 
                [class]="activeTab === 'friends' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-300'"
                class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
          <span class="material-icons-round text-base">group</span>
          Amigos ({{ friends.length }})
        </button>
        <button (click)="activeTab = 'requests'" 
                [class]="activeTab === 'requests' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-300'"
                class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 relative">
          <span class="material-icons-round text-base">mail</span>
          Solicitudes
          <span *ngIf="pendingRequests.length > 0" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
            {{ pendingRequests.length }}
          </span>
        </button>
        <button (click)="activeTab = 'shared'" 
                [class]="activeTab === 'shared' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-300'"
                class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
          <span class="material-icons-round text-base">share</span>
          Recibidos
        </button>
      </div>

      <!-- Send Friend Request -->
      <div class="glass-card p-4 !rounded-xl">
        <div class="flex gap-3">
          <input [(ngModel)]="friendEmail" placeholder="Nombre de usuario o nombre..." class="input-field flex-1" (keyup.enter)="sendRequest()">
          <button (click)="sendRequest()" [disabled]="!friendEmail.trim() || sendingRequest" class="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
            <span *ngIf="sendingRequest" class="material-icons-round animate-spin text-base">refresh</span>
            <span *ngIf="!sendingRequest" class="material-icons-round text-base">person_add</span>
            Enviar
          </button>
        </div>
        <p *ngIf="requestMsg" class="text-sm mt-2" [class]="requestError ? 'text-red-400' : 'text-green-400'">{{ requestMsg }}</p>
      </div>

      <!-- Friends Tab -->
      <div *ngIf="activeTab === 'friends'" class="grid gap-3">
        <div *ngFor="let friend of friends; let i = index"
             class="glass-card p-4 flex items-center gap-4 !rounded-xl animate-slide-up"
             [style.animation-delay]="i * 50 + 'ms'">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {{ (friend.display_name || friend.email).charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-slate-200">{{ friend.display_name || 'Sin nombre' }}</p>
            <p class="text-xs text-slate-500 truncate">{{ friend.email }}</p>
          </div>
          <button (click)="removeFriend(friend)" class="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors" title="Eliminar amigo">
            <span class="material-icons-round text-base">person_remove</span>
          </button>
        </div>
        <p *ngIf="friends.length === 0 && !loading" class="text-center text-slate-500 py-12">
          No tienes amigos aún. ¡Envía una solicitud!
        </p>
      </div>

      <!-- Requests Tab -->
      <div *ngIf="activeTab === 'requests'" class="space-y-3">
        <div *ngIf="pendingRequests.length > 0">
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Solicitudes recibidas</h3>
          <div class="grid gap-3">
            <div *ngFor="let req of pendingRequests; let i = index"
                 class="glass-card p-4 flex items-center gap-4 !rounded-xl animate-slide-up"
                 [style.animation-delay]="i * 50 + 'ms'">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {{ (req.sender_name || req.sender_email || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-200">{{ req.sender_name || 'Sin nombre' }}</p>
                <p class="text-xs text-slate-500 truncate">{{ req.sender_email }}</p>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <button (click)="respondRequest(req, 'accepted')" class="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors" title="Aceptar">
                  <span class="material-icons-round text-base">check</span>
                </button>
                <button (click)="respondRequest(req, 'rejected')" class="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Rechazar">
                  <span class="material-icons-round text-base">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="sentRequests.length > 0">
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-6">Solicitudes enviadas</h3>
          <div class="grid gap-3">
            <div *ngFor="let req of sentRequests"
                 class="glass-card p-4 flex items-center gap-4 !rounded-xl">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {{ (req.receiver_name || req.receiver_email || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-200">{{ req.receiver_name || 'Sin nombre' }}</p>
                <p class="text-xs text-slate-500 truncate">{{ req.receiver_email }}</p>
              </div>
              <span class="text-xs px-2 py-1 rounded-full"
                    [class]="req.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : req.status === 'accepted' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'">
                {{ req.status === 'pending' ? 'Pendiente' : req.status === 'accepted' ? 'Aceptada' : 'Rechazada' }}
              </span>
            </div>
          </div>
        </div>

        <p *ngIf="pendingRequests.length === 0 && sentRequests.length === 0 && !loading" class="text-center text-slate-500 py-12">
          No hay solicitudes
        </p>
      </div>

      <!-- Shared Menus Tab -->
      <div *ngIf="activeTab === 'shared'" class="grid gap-3">
        <div *ngFor="let sm of sharedMenus; let i = index"
             class="glass-card p-4 !rounded-xl animate-slide-up"
             [style.animation-delay]="i * 50 + 'ms'">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {{ (sm.owner_name || sm.owner_email || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-slate-200">{{ sm.owner_name || 'Sin nombre' }}</p>
              <p class="text-xs text-slate-500">{{ sm.shared_at | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <button (click)="deleteSharedMenu(sm)" class="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors">
              <span class="material-icons-round text-base">delete_outline</span>
            </button>
          </div>

          <!-- Shared menu preview -->
          <div *ngIf="sm.menu_data?.days" class="space-y-2">
            <div *ngFor="let day of sm.menu_data.days" class="p-2 rounded-lg bg-slate-800/30">
              <p class="text-xs font-medium text-sky-300 mb-1">{{ day.day }}</p>
              <div *ngFor="let entry of day.meals" class="flex items-center gap-2 text-xs text-slate-400">
                <span class="material-icons-round text-[10px]" [style.color]="getMealTypeColor(entry.meal_type)">
                  {{ getMealTypeIcon(entry.meal_type) }}
                </span>
                <span>{{ entry.meal_name }}</span>
              </div>
            </div>
          </div>
        </div>

        <p *ngIf="sharedMenus.length === 0 && !loading" class="text-center text-slate-500 py-12">
          No has recibido menús compartidos
        </p>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <span class="material-icons-round text-4xl text-sky-400 animate-spin">refresh</span>
      </div>
    </div>
  `
})
export class FriendsComponent implements OnInit {
  friends: UserProfile[] = [];
  allRequests: FriendRequest[] = [];
  sharedMenus: SharedMenu[] = [];
  loading = true;
  activeTab: 'friends' | 'requests' | 'shared' = 'friends';
  friendEmail = '';
  sendingRequest = false;
  requestMsg = '';
  requestError = false;

  constructor(private supabase: SupabaseService) {}

  get pendingRequests(): FriendRequest[] {
    return this.allRequests.filter(r => r.status === 'pending' && r.receiver_id === this.supabase.currentUser?.id);
  }

  get sentRequests(): FriendRequest[] {
    return this.allRequests.filter(r => r.sender_id === this.supabase.currentUser?.id);
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [friends, requests, shared] = await Promise.all([
        this.supabase.getFriends(),
        this.supabase.getFriendRequests(),
        this.supabase.getSharedMenus()
      ]);
      this.friends = friends;
      this.allRequests = requests;
      this.sharedMenus = shared;
    } catch (err) {
      console.error('Error loading friends data:', err);
    } finally {
      this.loading = false;
    }
  }

  async sendRequest() {
    if (!this.friendEmail.trim()) return;
    this.sendingRequest = true;
    this.requestMsg = '';
    this.requestError = false;
    try {
      await this.supabase.sendFriendRequest(this.friendEmail.trim());
      this.requestMsg = '¡Solicitud enviada!';
      this.friendEmail = '';
      await this.loadData();
    } catch (err: any) {
      this.requestError = true;
      this.requestMsg = err.message || 'Error al enviar solicitud';
    } finally {
      this.sendingRequest = false;
    }
  }

  async respondRequest(req: FriendRequest, status: 'accepted' | 'rejected') {
    try {
      await this.supabase.respondToFriendRequest(req.id!, status);
      await this.loadData();
    } catch (err) {
      console.error('Error responding to request:', err);
    }
  }

  async removeFriend(friend: UserProfile) {
    if (!confirm(`¿Eliminar a "${friend.display_name || friend.email}" de tus amigos?`)) return;
    try {
      await this.supabase.removeFriend(friend.id);
      await this.loadData();
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  }

  async deleteSharedMenu(sm: SharedMenu) {
    try {
      await this.supabase.deleteSharedMenu(sm.id!);
      this.sharedMenus = this.sharedMenus.filter(s => s.id !== sm.id);
    } catch (err) {
      console.error('Error deleting shared menu:', err);
    }
  }

  getMealTypeColor(type: MealType): string { return MEAL_TYPE_COLORS[type] || '#94a3b8'; }
  getMealTypeIcon(type: MealType): string { return MEAL_TYPE_ICONS[type] || 'restaurant'; }
}
