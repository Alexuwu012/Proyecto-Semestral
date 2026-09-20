# Alerta Segura — MongoDB + JWT + Geolocalización

Proyecto de **Ingeniería Web II** (Alerta Segura). API REST en Node.js/Express
con MongoDB (Mongoose) y autenticación JWT, + frontend en React/Vite con
mapa interactivo (Leaflet).

## Qué incluye esta versión

- **Autenticación real con JWT**: registro e inicio de sesión, contraseñas
  hasheadas con bcrypt. El primer usuario que se registra queda como
  administrador automáticamente; los siguientes entran como usuarios normales.
- **Roles y autorización**: un usuario normal puede crear, editar y borrar
  *sus propios* reportes. **Solo un administrador puede cambiar el estado**
  de un reporte (pendiente / en progreso / resuelto) y gestionar roles de
  usuarios, desde un panel de administración dedicado en el frontend.
- **Geolocalización**: cada reporte guarda coordenadas (lat/lng) en formato
  GeoJSON. El formulario de creación permite usar la ubicación del navegador
  o marcar el punto en un mapa interactivo. Hay una vista de **mapa general**
  con todos los reportes.
- **Frontend rediseñado**: login/registro, navegación protegida por rol,
  tarjetas de reportes, mapa y panel de administración con una identidad
  visual propia (no es el estilo por defecto de un scaffold).
- **Fotos reales de los reportes**: al crear un reporte se puede subir una
  foto (JPG/PNG/WebP, máx. 5 MB) con vista previa antes de enviar. Las fotos
  se guardan como archivos en el servidor (`backend/uploads/`) y se sirven
  como estáticos; no se guardan como Base64 en MongoDB, solo su URL.
- **Estadísticas**: el Dashboard muestra tarjetas con el total de reportes y
  el conteo por estado (pendiente / en progreso / resuelto).
- **Página de detalle** (`/reportes/:id`): al hacer clic en cualquier
  reporte (desde el Dashboard, el mapa o el panel admin) se abre una vista
  con la foto en grande (con lightbox al hacer clic), la ubicación en un
  mini-mapa, fecha, autor y, si eres admin, los botones para cambiar el
  estado directamente ahí.

## Estructura

```
proyecto-semestral/
├── docker-compose.yml     # levanta MongoDB en un contenedor
├── backend/
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   └── src/
│       ├── config/database.js
│       ├── models/ (User.js, Report.js)
│       ├── middleware/ (auth.js -> JWT, requireAdmin.js, logger.js)
│       └── routes/ (auth.js, reports.js, users.js)
└── frontend/
    └── src/
        ├── api/client.js          # axios + interceptor que adjunta el JWT
        ├── context/AuthContext.jsx
        ├── components/ (Navbar, ProtectedRoute, StatusBadge, LocationPicker)
        └── pages/ (Login, Register, Dashboard, NewReport, MapView, AdminPanel)
```

## 1. Levantar la base de datos (MongoDB)

Necesitas Docker instalado. Desde la raíz del proyecto:

```bash
docker compose up -d
```

Esto levanta MongoDB en `localhost:27017` con los datos guardados en un volumen
persistente (`mongo_data`). Si prefieres no usar Docker, instala MongoDB
Community Server localmente y asegúrate de que quede escuchando en
`mongodb://127.0.0.1:27017`.

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # revisa/cambia JWT_SECRET antes de producción
npm run seed               # inserta usuarios y reportes de ejemplo (borra lo existente)
npm start
```

Debe mostrar:

```
Conectado a MongoDB -> mongodb://127.0.0.1:27017/alerta_segura
Servidor ejecutándose en http://localhost:3000
```

El seed crea estas cuentas de prueba:

| Rol   | Correo                     | Contraseña   |
|-------|-----------------------------|--------------|
| admin | admin@alertasegura.com      | admin123     |
| user  | valentina@example.com       | valentina123 |
| user  | carlos@example.com          | carlos123    |

### Endpoints

| Método | Ruta                              | Auth requerida        | Descripción                                    |
|--------|------------------------------------|------------------------|-------------------------------------------------|
| POST   | `/auth/register`                   | No                      | Crea una cuenta y devuelve un JWT                |
| POST   | `/auth/login`                      | No                      | Inicia sesión y devuelve un JWT                  |
| GET    | `/auth/me`                         | JWT                     | Datos del usuario autenticado                    |
| GET    | `/reports?page=1&limit=10`          | No                      | Lista reportes con paginación                    |
| GET    | `/reports/map`                     | No                      | Todos los reportes con coordenadas (para el mapa)|
| POST   | `/reports`                          | JWT                     | Crea un reporte (guarda `lat`/`lng`)             |
| GET    | `/reports/query/by-status`          | No                      | Filtra por `status` y ordena por fecha           |
| GET    | `/reports/query/by-user/:userId`    | No                      | Reportes de un usuario, ordenados por descripción|
| GET    | `/reports/:id`                      | No                      | Obtiene un reporte                               |
| PUT    | `/reports/:id`                      | JWT (dueño o admin)     | Actualiza un reporte (el `status` solo lo cambia un admin) |
| PATCH  | `/reports/:id/status`               | JWT + rol admin         | Cambia el estado de un reporte                   |
| DELETE | `/reports/:id`                      | JWT (dueño o admin)     | Elimina un reporte                               |
| GET    | `/users`                            | JWT + rol admin         | Lista usuarios                                   |
| PATCH  | `/users/:id/role`                   | JWT + rol admin         | Cambia el rol de un usuario                      |
| POST   | `/uploads`                          | JWT                     | Sube una foto (campo `photo`, multipart/form-data) y devuelve `{ url }` |
| GET    | `/uploads/:archivo`                 | No                      | Sirve la foto subida (estático)                  |

## 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Desde ahí puedes:

- Registrarte o iniciar sesión.
- Crear un reporte marcando su ubicación en el mapa (o usando tu ubicación actual).
- Ver la lista paginada de reportes y filtrar por estado.
- Ver todos los reportes en un mapa general (`/mapa`).
- Si tu cuenta es **admin**: entrar al panel de administración (`/admin`) para
  cambiar el estado de cualquier reporte y el rol de cualquier usuario.

## Qué cambió respecto a la versión anterior

- **Autenticación**: el token fijo `alerta-segura-2026` fue reemplazado por
  JWT real (registro/login con bcrypt, expiración de 7 días).
- **Autorización por rol**: se agregó el campo `role` (`user`/`admin`) al
  modelo `User` y un middleware `requireAdmin`. Cambiar el estado de un
  reporte ahora es una acción exclusiva de administradores.
- **Geolocalización**: el modelo `Report` guarda un campo `geo` en formato
  GeoJSON (`Point`, con índice `2dsphere`) además de virtuals `lat`/`lng`
  para que el frontend no tenga que lidiar con el orden `[lng, lat]`.
- **Frontend**: se reescribió por completo con `react-router-dom`
  (login, registro, rutas protegidas), un mapa interactivo con
  `react-leaflet`/OpenStreetMap para elegir ubicación y visualizar reportes,
  un panel de administración, y un rediseño visual completo.
