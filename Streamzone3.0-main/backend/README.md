# StreamZone — Backend

API REST para el TFG de StreamZone. Stack: **Node.js**, **Express** y **PostgreSQL** (`pg`).

## Estructura

```
backend/
├── package.json
├── .env.example
├── README.md
└── src/
    ├── server.js
    ├── db.js
    ├── routes/
    │   ├── userRoutes.js
    │   ├── movieRoutes.js
    │   ├── favoriteRoutes.js
    │   └── watchLaterRoutes.js
    ├── controllers/
    │   ├── userController.js
    │   ├── movieController.js
    │   ├── favoriteController.js
    │   └── watchLaterController.js
    ├── models/
    │   ├── userModel.js
    │   ├── movieModel.js
    │   ├── favoriteModel.js
    │   └── watchLaterModel.js
    └── utils/
        └── movieValidation.js
```

## Requisitos

- Node.js 18 o superior
- PostgreSQL en ejecución con la base `streamzone` (ver `database/README.md`)

## Instalación y arranque

```powershell
cd backend
npm install
npm start
```

El servidor queda en **http://localhost:4000**.

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado de la API y BD |
| POST | `/api/users/register` | Registro |
| POST | `/api/users/login` | Login |
| GET | `/api/movies` | Listar películas guardadas |
| POST | `/api/movies` | Crear o devolver película por `tmdb_id` |
| GET | `/api/favorites/:userId` | Favoritos de un usuario (con datos de película) |
| POST | `/api/favorites` | Añadir favorito |
| DELETE | `/api/favorites/:id` | Eliminar favorito |
| GET | `/api/watch-later/:userId` | Ver más tarde de un usuario |
| POST | `/api/watch-later` | Añadir a ver más tarde |
| DELETE | `/api/watch-later/:id` | Eliminar de ver más tarde |

> Sin JWT en esta fase. El `user_id` se envía en el body o en la URL.

---

## Fase 4 — Probar películas, favoritos y ver más tarde

Usuario de prueba del seed: **id = 1** (`admin@gmail.com` / `admin123`).

### GET /api/movies

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/movies"
```

### POST /api/movies (crear o recuperar por tmdb_id)

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/movies" `
  -ContentType "application/json" `
  -Body '{"tmdb_id":550,"title":"Fight Club","overview":"Un oficinista insomne...","poster_path":"/pB8BM7pdSp6B6Ih7QZ4DrFu3zm3.jpg","release_date":"1999-10-15"}'
```

### Añadir favorito (POST /api/favorites)

Inserta la película en `movies` si no existe y crea la relación en `favorites`:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/favorites" `
  -ContentType "application/json" `
  -Body '{"user_id":1,"tmdb_id":550,"title":"Fight Club","overview":"Un oficinista insomne...","poster_path":"/pB8BM7pdSp6B6Ih7QZ4DrFu3zm3.jpg","release_date":"1999-10-15"}'
```

### Listar favoritos (GET /api/favorites/:userId)

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/favorites/1"
```

Respuesta esperada (cada favorito incluye el objeto `movie`):

```json
{
  "success": true,
  "user_id": 1,
  "count": 3,
  "favorites": [
    {
      "id": 1,
      "user_id": 1,
      "created_at": "...",
      "movie": {
        "id": 1,
        "tmdb_id": 11,
        "title": "Star Wars: Episodio IV...",
        "overview": "...",
        "poster_path": "/2l05cFWJacyqGzSnHRDBok20i10.jpg",
        "release_date": "1977-05-25",
        "created_at": "..."
      }
    }
  ]
}
```

### Eliminar favorito (DELETE /api/favorites/:id)

Sustituye `1` por el `id` del favorito (no el id de la película):

```powershell
Invoke-RestMethod -Method DELETE -Uri "http://localhost:4000/api/favorites/1"
```

### Añadir a ver más tarde (POST /api/watch-later)

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/watch-later" `
  -ContentType "application/json" `
  -Body '{"user_id":1,"tmdb_id":603,"title":"The Matrix","overview":"Un hacker descubre la verdad...","poster_path":"/f89U3ADr1oiN1QxkZbzeJC8a0k.jpg","release_date":"1999-03-31"}'
```

### Listar ver más tarde (GET /api/watch-later/:userId)

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/watch-later/1"
```

### Eliminar de ver más tarde (DELETE /api/watch-later/:id)

```powershell
Invoke-RestMethod -Method DELETE -Uri "http://localhost:4000/api/watch-later/1"
```

---

## Fase 3 — Usuarios

### Registro

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/users/register" `
  -ContentType "application/json" `
  -Body '{"username":"demo","email":"demo@streamzone.com","password":"demo123"}'
```

### Login

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/users/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@gmail.com","password":"admin123"}'
```

### Seguridad

- Contraseñas en **texto plano** solo para desarrollo.
- **Mejora futura:** `bcrypt` + **JWT**.

---

## Códigos de error habituales

| Código | Situación |
|--------|-----------|
| 400 | Campos obligatorios inválidos o `userId` incorrecto |
| 401 | Login incorrecto |
| 404 | Usuario, favorito o watch_later no encontrado |
| 409 | Email ya registrado |
| 500 | Error interno del servidor |

## Integración con Angular

El frontend (`Streamzone3.0-main`) usa proxy hacia `http://localhost:4000`. En la siguiente fase se conectarán estos endpoints desde Angular.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor |
| `DB_HOST` | Host PostgreSQL |
| `DB_PORT` | Puerto PostgreSQL |
| `DB_NAME` | Base de datos (`streamzone`) |
| `DB_USER` | Usuario PostgreSQL |
| `DB_PASSWORD` | Contraseña PostgreSQL |
