import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MenuComponent } from './pages/menu/menu.component';
import { MealsComponent } from './pages/meals/meals.component';
import { MealTimesComponent } from './pages/meal-times/meal-times.component';
import { MealTypesComponent } from './pages/meal-types/meal-types.component';
import { FriendsComponent } from './pages/friends/friends.component';
import { ConfigComponent } from './pages/config/config.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'menu', pathMatch: 'full' },
      { path: 'menu', component: MenuComponent },
      { path: 'meals', component: MealsComponent },
      { path: 'meal-times', component: MealTimesComponent },
      { path: 'meal-types', component: MealTypesComponent },
      { path: 'friends', component: FriendsComponent },
      { path: 'config', component: ConfigComponent },
    ]
  },
  { path: '**', redirectTo: 'menu' }
];
