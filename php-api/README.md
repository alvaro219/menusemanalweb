# PHP API Backend para Menú Semanal

API REST en PHP que actúa como intermediario entre el frontend Angular y Supabase.

## Configuración

1. Edita `config.php` con tus credenciales de Supabase:
   - `SUPABASE_URL`: URL de tu proyecto Supabase
   - `SUPABASE_KEY`: Clave anónima de Supabase
   - `SUPABASE_SERVICE_KEY`: Clave de servicio (para operaciones admin)

2. Sube los archivos a un servidor con PHP 7.4+ y `mod_rewrite` habilitado.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PUT/DELETE | `/api/meals` | CRUD de comidas |
| GET/POST/PUT | `/api/weekly-menus` | Menús semanales |
| GET/POST/PUT/DELETE | `/api/meal-times` | Tiempos de comida |
| GET/POST/PUT/DELETE | `/api/custom-meal-types` | Tipos personalizados |
| GET/POST/PUT | `/api/menu-config` | Configuración del menú |
| GET/DELETE | `/api/friends` | Lista/eliminar amigos |
| GET/POST/PUT | `/api/friend-requests` | Solicitudes de amistad |
| GET/POST/DELETE | `/api/shared-menus` | Menús compartidos |
| GET/PUT | `/api/profiles` | Perfil de usuario |

## Autenticación

Todas las peticiones requieren un header `Authorization: Bearer <token>` con el token JWT de Supabase.

## Notas

- El frontend Angular usa directamente el cliente JS de Supabase para todas las operaciones.
- Esta API PHP es una alternativa para escenarios donde se necesite un backend propio (validación extra, lógica de negocio, etc.).
- Para desplegar en producción, asegúrate de configurar CORS correctamente.
