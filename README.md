# 🍽️ Menú Semanal Web

Aplicación web para generar y gestionar menús semanales de comida. Permite aleatorizar comidas, seleccionarlas manualmente, marcarlas como favoritas, personalizar tipos y tiempos de comida, y compartir menús con amigos.

## Stack Tecnológico

- **Frontend**: Angular 17 + TailwindCSS + TypeScript
- **Backend**: PHP REST API
- **Base de Datos**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deploy**: GitHub Pages

## Configuración

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta el script `supabase-schema.sql` en el SQL Editor de Supabase
3. Copia tu **URL** y **anon key** del proyecto

### 2. Configurar credenciales

Edita `src/environments/environment.ts` y `environment.prod.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseKey: 'TU-ANON-KEY',
};
```

### 3. Instalar y ejecutar

```bash
npm install
ng serve
```

La app estará en `http://localhost:4200`

### 4. Build para producción

```bash
ng build --configuration=production --base-href /menusemanalweb/
```

### 5. Deploy a GitHub Pages

El proyecto incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`) que despliega automáticamente al hacer push a `main`/`master`.

**URL**: https://alvaro219.github.io/menusemanalweb/

## Funcionalidades

- **Menú Semanal**: Genera menús aleatorios Lunes-Viernes con aleatorizar/seleccionar/favoritos por comida
- **Drag & Drop**: Arrastra comidas entre días
- **Vista Semanal**: Tabla compacta con todos los platos
- **Biblioteca de Comidas**: CRUD completo con filtros por tipo y favoritos
- **Tiempos de Comida**: Personaliza cuándo comes (Comida, Cena, Desayuno, etc.)
- **Tipos de Comida**: Tipos predefinidos + personalizados con color e icono
- **Amigos**: Envía/acepta solicitudes de amistad
- **Compartir Menú**: Comparte tu menú con amigos o cópialo como texto
- **Configuración**: Distribución de tipos y perfil de usuario

## PHP API (Opcional)

La carpeta `php-api/` contiene un backend PHP que actúa como intermediario con Supabase. Es opcional ya que el frontend usa directamente el cliente JS de Supabase.

## Estructura del Proyecto

```
src/app/
├── models/meal.model.ts           # Modelos e interfaces
├── services/supabase.service.ts   # Servicio Supabase
├── guards/auth.guard.ts           # Guard de autenticación
├── components/layout/             # Layout principal con nav
├── pages/
│   ├── login/                     # Login
│   ├── register/                  # Registro
│   ├── menu/                      # Menú semanal
│   ├── meals/                     # Biblioteca de comidas
│   ├── meal-times/                # Tiempos de comida
│   ├── meal-types/                # Tipos de comida
│   ├── friends/                   # Amigos y menús compartidos
│   └── config/                    # Configuración
php-api/                           # Backend PHP (opcional)
supabase-schema.sql                # Schema de base de datos
```

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
