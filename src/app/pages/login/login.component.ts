import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="glass-card p-8 w-full max-w-md animate-fade-in">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 mb-4">
            <span class="material-icons-round text-3xl text-white">restaurant_menu</span>
          </div>
          <h1 class="text-2xl font-bold text-white glow-text">Menú Semanal</h1>
          <p class="text-slate-400 mt-2">Inicia sesión para continuar</p>
        </div>

        <div *ngIf="errorMsg" class="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ errorMsg }}
        </div>

        <form (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" [(ngModel)]="email" name="email" class="input-field" placeholder="tu@email.com" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" class="input-field" placeholder="••••••••" required>
          </div>
          <button type="submit" [disabled]="loading" class="btn-primary w-full py-3 text-center flex items-center justify-center gap-2">
            <span *ngIf="loading" class="material-icons-round animate-spin text-lg">refresh</span>
            {{ loading ? 'Entrando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <p class="text-center text-slate-400 mt-6 text-sm">
          ¿No tienes cuenta? 
          <a routerLink="/register" class="text-sky-400 hover:text-sky-300 font-medium">Regístrate</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private supabase: SupabaseService, private router: Router) {}

  async onLogin() {
    this.loading = true;
    this.errorMsg = '';
    try {
      await this.supabase.signIn(this.email, this.password);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.errorMsg = err.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
