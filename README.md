# 🚨 Alerta Segura

Sistema web para el reporte ciudadano de **huecos y luminarias dañadas**, desarrollado para la asignatura **Ingeniería Web II**.

La aplicación permite registrar reportes con descripción, fotografía y ubicación geográfica. Cuenta con autenticación mediante JWT, roles de usuario, administración de reportes, mapas interactivos y almacenamiento de fotografías.

---

## 📌 Tecnologías utilizadas

### Backend

* Node.js
* Express
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcryptjs
* Multer
* CORS
* dotenv

### Frontend

* React
* Vite
* Axios
* React Router DOM
* React Leaflet
* Leaflet
* OpenStreetMap

### Infraestructura

* Docker
* Docker Compose
* MongoDB 7

---

## ✨ Funcionalidades principales

### 🔐 Autenticación

* Registro de usuarios.
* Inicio de sesión.
* Autenticación mediante JWT.
* Contraseñas protegidas mediante `bcryptjs`.
* Sesión protegida mediante token.
* Expiración del JWT después de 7 días.

### 👥 Roles y permisos

Existen dos roles:

* **Administrador**
* **Usuario**

Un usuario puede:

* Crear reportes.
* Editar sus propios reportes.
* Eliminar sus propios reportes.
* Consultar reportes.
* Ver el mapa general.

El administrador puede, además:

* Cambiar el estado de cualquier reporte.
* Consultar todos los usuarios.
* Cambiar el rol de los usuarios.
* Administrar los reportes desde el panel de administración.

Los estados disponibles son:

* `pending` — Pendiente
* `in_progress` — En progreso
* `resolved` — Resuelto

---

## 📸 Fotografías

Los reportes permiten adjuntar fotografías como evidencia.

Características:

* JPG
* PNG
* WebP
* Tamaño máximo: 5 MB
* Vista previa antes de enviar.
* Las imágenes se almacenan como archivos en el servidor.
* MongoDB almacena únicamente la URL de la imagen.
* No se utiliza Base64 para almacenar las fotografías.

Las imágenes se encuentran en:

```text
backend/uploads/
```

La carpeta se crea automáticamente cuando se realiza la primera subida.

---

## 📍 Geolocalización

Cada reporte almacena su ubicación utilizando **GeoJSON**.

La estructura utiliza un objeto `Point`:

```json
{
  "type": "Point",
  "coordinates": [-74.08, 4.68]
}
```

Las coordenadas se almacenan en el orden:

```text
[longitud, latitud]
```

El modelo también proporciona los valores `lat` y `lng` para facilitar su utilización desde el frontend.

### Funcionalidades del mapa

* Seleccionar una ubicación manualmente.
* Utilizar la ubicación actual del navegador.
* Visualizar reportes en un mapa general.
* Consultar la información de cada reporte desde los marcadores.
* Mini-mapa en la página de detalle.

---

## 📊 Dashboard

El Dashboard permite consultar los reportes registrados y muestra estadísticas generales:

* Total de reportes.
* Reportes pendientes.
* Reportes en progreso.
* Reportes resueltos.

También permite:

* Filtrar por estado.
* Consultar reportes paginados.
* Abrir el detalle de un reporte.
* Editar reportes propios.
* Eliminar reportes propios.

---

## 🔎 Página de detalle

Cada reporte tiene una página individual:

```text
/reportes/:id
```

En ella se puede consultar:

* Fotografía del reporte.
* Fotografía ampliada mediante lightbox.
* Descripción.
* Tipo de reporte.
* Estado.
* Fecha.
* Autor.
* Ubicación.
* Mini-mapa.

Los administradores pueden cambiar el estado directamente desde esta página.

---

# 📁 Estructura del proyecto

```text
proyecto-semestral/
│
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   │
│   ├── uploads/
│   │
│   └── src/
│       ├── config/
│       │   └── database.js
│       │
│       ├── models/
│       │   ├── User.js
│       │   └── Report.js
│       │
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── requireAdmin.js
│       │   └── logger.js
│       │
│       └── routes/
│           ├── auth.js
│           ├── reports.js
│           └── users.js
│
└── frontend/
    ├── package.json
    └── src/
        ├── api/
        │   └── client.js
        │
        ├── context/
        │   └── AuthContext.jsx
        │
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── StatusBadge.jsx
        │   └── LocationPicker.jsx
        │
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── NewReport.jsx
            ├── MapView.jsx
            └── AdminPanel.jsx
```

---

# ⚙️ Requisitos

Antes de ejecutar el proyecto se necesita tener instalado:

* Node.js
* npm
* Docker Desktop
* Git

Se recomienda utilizar una versión reciente de Node.js.

---

# 🐳 1. Ejecutar MongoDB

Desde la carpeta raíz del proyecto:

```bash
docker compose up -d
```

Esto inicia un contenedor de MongoDB utilizando MongoDB 7.

MongoDB queda disponible en:

```text
mongodb://127.0.0.1:27017
```

La base de datos utilizada por el proyecto es:

```text
alerta_segura
```

Para comprobar que el contenedor está funcionando:

```bash
docker compose ps
```

Para detener MongoDB:

```bash
docker compose down
```

Los datos se mantienen mediante un volumen persistente de Docker.

---

# 🖥️ 2. Configurar el Backend

Entrar a la carpeta:

```bash
cd backend
```

Instalar las dependencias:

```bash
npm install
```

En Windows PowerShell, si `npm` presenta problemas con la política de ejecución, se puede utilizar:

```powershell
npm.cmd install
```

Crear el archivo `.env`:

### Windows

```powershell
copy .env.example .env
```

### Linux/macOS

```bash
cp .env.example .env
```

El archivo `.env` contiene las variables necesarias para MongoDB, JWT y el servidor.

---

# 🌱 3. Insertar datos de prueba

Con MongoDB funcionando, ejecutar:

```bash
npm run seed
```

El comando elimina los datos existentes y crea:

* 3 usuarios.
* 4 reportes de ejemplo.

En Windows PowerShell:

```powershell
npm.cmd run seed
```

Las cuentas de prueba son:

| Rol           | Correo                   | Contraseña     |
| ------------- | ------------------------ | -------------- |
| Administrador | `admin@alertasegura.com` | `admin123`     |
| Usuario       | `valentina@example.com`  | `valentina123` |
| Usuario       | `carlos@example.com`     | `carlos123`    |

> Estas credenciales son únicamente para desarrollo y pruebas.

---

# ▶️ 4. Ejecutar el Backend

Desde `backend/`:

```bash
npm start
```

En Windows PowerShell:

```powershell
npm.cmd start
```

El servidor debe mostrar:

```text
Conectado a MongoDB -> mongodb://127.0.0.1:27017/alerta_segura
Servidor ejecutándose en http://localhost:3000
```

El backend estará disponible en:

```text
http://localhost:3000
```

Mantener esta terminal abierta mientras se utiliza el frontend.

---

# 🌐 5. Ejecutar el Frontend

Abrir una segunda terminal.

Entrar al frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

En PowerShell:

```powershell
npm.cmd install
```

Ejecutar Vite:

```bash
npm run dev
```

En PowerShell:

```powershell
npm.cmd run dev
```

El frontend estará disponible normalmente en:

```text
http://localhost:5173
```

---

# 🔗 API REST

La API utiliza el backend disponible en:

```text
http://localhost:3000
```

## Autenticación

| Método | Endpoint         | Autenticación | Descripción                   |
| ------ | ---------------- | ------------- | ----------------------------- |
| POST   | `/auth/register` | No            | Registrar usuario             |
| POST   | `/auth/login`    | No            | Iniciar sesión                |
| GET    | `/auth/me`       | JWT           | Consultar usuario autenticado |

## Reportes

| Método | Endpoint                         | Autenticación | Descripción              |
| ------ | -------------------------------- | ------------- | ------------------------ |
| GET    | `/reports?page=1&limit=10`       | No            | Lista reportes           |
| GET    | `/reports/map`                   | No            | Reportes con coordenadas |
| POST   | `/reports`                       | JWT           | Crear reporte            |
| GET    | `/reports/query/by-status`       | No            | Filtrar por estado       |
| GET    | `/reports/query/by-user/:userId` | No            | Reportes de un usuario   |
| GET    | `/reports/:id`                   | No            | Obtener reporte          |
| PUT    | `/reports/:id`                   | JWT           | Actualizar reporte       |
| PATCH  | `/reports/:id/status`            | Admin         | Cambiar estado           |
| DELETE | `/reports/:id`                   | JWT           | Eliminar reporte         |

## Usuarios

| Método | Endpoint          | Autenticación | Descripción     |
| ------ | ----------------- | ------------- | --------------- |
| GET    | `/users`          | Admin         | Listar usuarios |
| PATCH  | `/users/:id/role` | Admin         | Cambiar rol     |

## Fotografías

| Método | Endpoint            | Autenticación | Descripción        |
| ------ | ------------------- | ------------- | ------------------ |
| POST   | `/uploads`          | JWT           | Subir fotografía   |
| GET    | `/uploads/:archivo` | No            | Obtener fotografía |

Para subir una fotografía se utiliza `multipart/form-data` con el campo:

```text
photo
```

---

# 🔒 Seguridad

El proyecto implementa:

* JWT para autenticación.
* bcryptjs para proteger las contraseñas.
* Middleware de autenticación.
* Middleware de autorización para administradores.
* Restricción de edición y eliminación a propietarios o administradores.
* Restricción del cambio de estado a administradores.
* Validación de archivos de imagen.
* Límite de tamaño para fotografías.
* Variables sensibles mediante `.env`.

El archivo `.env` no debe subirse al repositorio.

---

# 🗺️ Rutas principales del Frontend

| Ruta             | Descripción             |
| ---------------- | ----------------------- |
| `/login`         | Inicio de sesión        |
| `/registro`      | Registro                |
| `/`              | Dashboard               |
| `/nuevo-reporte` | Crear reporte           |
| `/mapa`          | Mapa general            |
| `/reportes/:id`  | Detalle del reporte     |
| `/admin`         | Panel de administración |

Las rutas administrativas están protegidas según el rol del usuario.

---

# 👤 Flujo de usuario

```text
                    ┌──────────────┐
                    │    Login     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     JWT      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Dashboard   │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
       Nuevo reporte      Mapa       Mis reportes
             │
             ▼
       📍 Ubicación
             │
             ▼
       📷 Fotografía
             │
             ▼
       Crear reporte
```

---

# 👑 Flujo del administrador

```text
Administrador
      │
      ├── Dashboard
      │
      ├── Reportes
      │      └── Cambiar estado
      │
      ├── Mapa
      │
      └── Panel de administración
             ├── Consultar usuarios
             └── Cambiar roles
```

---

# 🗄️ Modelo de datos

## User

```text
User
├── name
├── email
├── password
└── role
```

Roles:

```text
user
admin
```

## Report

```text
Report
├── description
├── type
├── status
├── image
├── geo
├── user
└── timestamps
```

La ubicación utiliza GeoJSON:

```text
geo
├── type: Point
└── coordinates: [lng, lat]
```

El campo `geo` cuenta con un índice geoespacial `2dsphere`.

---

# 🧪 Pruebas

Para probar el sistema:

### Administrador

```text
Correo:
admin@alertasegura.com

Contraseña:
admin123
```

Permite probar:

* Login.
* Dashboard.
* Reportes.
* Cambio de estados.
* Panel administrativo.
* Gestión de roles.

### Usuario

```text
Correo:
valentina@example.com

Contraseña:
valentina123
```

Permite probar:

* Login.
* Crear reportes.
* Subir fotografías.
* Seleccionar ubicación.
* Editar reportes propios.
* Eliminar reportes propios.
* Consultar el mapa.

---

# 📷 Flujo de creación de un reporte

```text
1. Iniciar sesión
       ↓
2. Nuevo reporte
       ↓
3. Seleccionar tipo
       ↓
4. Escribir descripción
       ↓
5. Seleccionar fotografía
       ↓
6. Ver vista previa
       ↓
7. Seleccionar ubicación
       ↓
8. Enviar reporte
       ↓
9. Subir fotografía
       ↓
10. Guardar URL en MongoDB
       ↓
11. Crear reporte
```

---

# 🛠️ Comandos rápidos

### Iniciar MongoDB

```bash
docker compose up -d
```

### Ver contenedores

```bash
docker compose ps
```

### Detener MongoDB

```bash
docker compose down
```

### Backend

```bash
cd backend
npm install
npm run seed
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 📚 Contexto académico

**Proyecto:** Alerta Segura
**Asignatura:** Ingeniería Web II
**Tecnologías principales:** Node.js, Express, React, MongoDB y Docker.

El proyecto busca implementar una solución web para facilitar el reporte y seguimiento de problemas de infraestructura urbana mediante fotografías y geolocalización.

---

## 👨‍💻 Autores

Proyecto desarrollado como parte de la asignatura **Ingeniería Web II**.
VALERY HERRERA
DANIEL ROJAS

---

## 📄 Licencia

Proyecto académico desarrollado con fines educativos.
