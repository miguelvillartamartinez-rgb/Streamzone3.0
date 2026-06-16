# StreamZone

StreamZone es una plataforma web estilo streaming desarrollada con Angular.  
Permite explorar películas, buscar contenido, gestionar favoritos y crear listas personales para ver más tarde, combinando catálogo local con consumo de datos desde TMDB y persistencia en PostgreSQL.

## Qué es StreamZone

Proyecto final orientado a DAM para demostrar:
- Arquitectura Angular con componentes standalone.
- Consumo de API REST propia (Node.js + Express + PostgreSQL).
- Consumo de API externa TMDB para catálogo y búsqueda.
- Gestión de sesión de usuario en cliente.
- Interfaz visual moderna y responsive.

## Tecnologías utilizadas

- Angular 20
- TypeScript
- RxJS
- Node.js + Express (backend en carpeta `../backend`)
- PostgreSQL
- API externa: [TMDB](https://www.themoviedb.org/)

## Funcionalidades principales

- Login contra `POST /api/users/login` (PostgreSQL).
- Registro en `/register` contra `POST /api/users/register` (enlace desde login).
- Home con catálogo visual y búsqueda TMDB.
- Favoritos y “ver más tarde” de películas TMDB guardados en PostgreSQL.
- Catálogo local Star Wars / Transformers en `localStorage` (sin `tmdb_id` en backend).
- Control de acceso con guards.

> **Gmail / Googlemail:** login y registro solo aceptan direcciones `@gmail.com` o `@googlemail.com`.

## Arranque del proyecto (Fase 5)

Necesitas **tres servicios** en este orden:

### 1. PostgreSQL

- Base de datos `streamzone` creada.
- Scripts ejecutados: `database/schema.sql` y `database/seed.sql`.
- Credenciales configuradas en `backend/.env`.

### 2. Backend (puerto 4000)

```powershell
cd ..\backend
npm install
npm start
```

Comprueba: [http://localhost:4000/api/health](http://localhost:4000/api/health) → `"database": "connected"`.

Usuario de prueba del seed: `admin@gmail.com` / `admin123`.

### 3. Frontend Angular (puerto 4200)

```powershell
cd Streamzone3.0-main
npm install
npm start
```

Abre: [http://localhost:4200](http://localhost:4200)

El proxy (`proxy.conf.json`) redirige las peticiones `/api/*` al backend en `http://localhost:4000`.  
**No uses URL absolutas** en los servicios Angular; usa rutas como `/api/users/login`.

## Estructura básica del proyecto

```text
src/app/
  home/                      # Catálogo y acciones TMDB
  favoritos/                 # Lista de favoritos
  ver-mas-tarde/             # Lista ver más tarde
  login/                     # Inicio de sesión
  register/                  # Registro de usuario (/register)
  services/
    user-api.service.ts      # Login/registro → backend
    favorites-api.service.ts # Favoritos → PostgreSQL
    watch-later-api.service.ts
    peliculas-api.service.ts # TMDB (sin cambios)
  auth.ts                    # Sesión (id, username, email en localStorage)
```

## Persistencia de datos

| Dato | Dónde se guarda |
|------|-----------------|
| Sesión usuario (`id`, `username`, `email`) | `localStorage` |
| Favoritos / ver más tarde (películas TMDB) | PostgreSQL vía API |
| Favoritos / ver más tarde (Star Wars, Transformers) | `localStorage` (catálogo local) |
| Búsqueda y listados TMDB | API TMDB en tiempo real |

Si el backend no está disponible, las películas TMDB usan **fallback temporal** en `localStorage` (ver comentarios en `home.ts`).

## Comprobación de compilación

```powershell
npm run build
```

## Credenciales TMDB

Configura tu API key en `src/app/config/api.config.ts` si usas búsqueda/catálogo TMDB.
