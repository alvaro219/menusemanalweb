import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Top Nav -->
      <header class="glass sticky top-0 z-50 border-b border-sky-500/10">
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="material-icons-round text-white text-xl">restaurant_menu</span>
            </div>
            <span class="text-lg font-bold text-white hidden sm:block">Menú Semanal</span>
          </a>
          
          <div class="flex items-center gap-2">
            <span class="text-sm text-slate-400 hidden md:block">{{ userEmail }}</span>
            <button (click)="logout()" class="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-red-400 transition-all" title="Cerrar sesión">
              <span class="material-icons-round">logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Nav -->
      <nav class="glass sticky bottom-0 z-50 border-t border-sky-500/10 safe-area-bottom">
        <div class="max-w-6xl mx-auto px-2">
          <div class="flex justify-around">
            <a routerLink="/menu" routerLinkActive="text-sky-400 bg-sky-500/10"
               class="flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition-all text-slate-400 hover:text-sky-300">
              <span class="material-icons-round text-xl">calendar_month</span>
              <span class="text-[10px] font-medium">Menú</span>
            </a>
            <a routerLink="/meals" routerLinkActive="text-sky-400 bg-sky-500/10"
               class="flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition-all text-slate-400 hover:text-sky-300">
              <span class="material-icons-round text-xl">lunch_dining</span>
              <span class="text-[10px] font-medium">Comidas</span>
            </a>
            <a routerLink="/meal-times" routerLinkActive="text-sky-400 bg-sky-500/10"
               class="flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition-all text-slate-400 hover:text-sky-300">
              <span class="material-icons-round text-xl">schedule</span>
              <span class="text-[10px] font-medium">Tiempos</span>
            </a>
            <a routerLink="/meal-types" routerLinkActive="text-sky-400 bg-sky-500/10"
               class="flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition-all text-slate-400 hover:text-sky-300">
              <span class="material-icons-round text-xl">category</span>
              <span class="text-[10px] font-medium">Tipos</span>
            </a>
            <a routerLink="/friends" routerLinkActive="text-sky-400 bg-sky-500/10"
               class="flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition-all text-slate-400 hover:text-sky-300">
              <span class="material-icons-round text-xl">people</span>
              <span class="text-[10px] font-medium">Amigos</span>
            </a>
            <a routerLink="/config" routerLinkActive="text-sky-400 bg-sky-500/10"
               class="flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition-all text-slate-400 hover:text-sky-300">
              <span class="material-icons-round text-xl">settings</span>
              <span class="text-[10px] font-medium">Config</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  userEmail = '';

  constructor(private supabase: SupabaseService, private router: Router, private themeService: ThemeService) {}

  ngOnInit() {
    this.supabase.user$.subscribe(user => {
      this.userEmail = user?.email || '';
    });
    this.themeService.loadTheme();
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
