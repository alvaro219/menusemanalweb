import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { firstValueFrom, filter, take, timeout, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    await firstValueFrom(
      this.supabase.sessionReady$.pipe(
        filter((ready: boolean) => ready === true),
        take(1),
        timeout(3000),
        catchError(() => of(true))
      )
    );

    const user = this.supabase.currentUser;
    if (user) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
