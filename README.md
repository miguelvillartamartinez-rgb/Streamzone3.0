# StreamZone

Plataforma web estilo streaming desarrollada como **Trabajo de Fin de Grado (TFG)**. Combina un frontend en **Angular**, una API REST propia en **Node.js + Express**, persistencia en **PostgreSQL** y consumo de la API externa **TMDB** para catálogo y búsqueda de películas.

---

## Descripción del proyecto

**StreamZone** permite a un usuario autenticado explorar películas, buscar títulos en TMDB, marcar contenido como **favorito** o **ver más tarde**, y consultar sus listas personales. El catálogo visual incluye además sagas locales (Star Wars, Transformers) para demostrar navegación y estado en cliente.

La aplicación sigue una arquitectura **cliente-servidor**: el navegador ejecuta Angular; las operaciones de negocio (usuarios, favoritos, listas) pasan por la API propia y se almacenan en PostgreSQL; la consulta de películas en tiempo real se hace contra TMDB.

---

## Objetivo

Diseñar e implementar una aplicación web full-stack que integre:

- Interfaz de usuario moderna (Angular).
- API REST mantenible (Express).
- Base de datos relacional (PostgreSQL).
- Servicio externo de metadatos cinematográficos (TMDB).

Demostrando competencias de desarrollo web, persistencia de datos, consumo de APIs y pruebas de integración.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 20, TypeScript, RxJS, HTML5, CSS3 |
| Backend | Node.js, Express, `pg`, `dotenv`, `cors` |
| Base de datos | PostgreSQL |
| API externa | [The Movie Database (TMDB)](https://www.themoviedb.org/) |
| Herramientas | Angular CLI, npm, Git |

---

## Estructura de carpetas

```text
Streamzone3.0/
├── README.md                 # Este archivo (visión general)
├── PRUEBAS.md                # Documentación de pruebas (Fase 6)
├── docs/
│   └── MEMORIA_BORRADOR.md   # Borrador de memoria del TFG
├── Streamzone3.0-main/       # Frontend Angular
│   ├── src/app/              # Componentes, servicios, guards
│   ├── proxy.conf.json       # Proxy /api → localhost:4000
│   └── package.json
├── backend/                  # API REST Express
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── models/
│   ├── .env.example
│   └── package.json
└── database/                 # Scripts SQL
    ├── schema.sql
    ├── seed.sql
    └── README.md
```

---

## Arquitectura cliente-servidor

```text
┌─────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Angular (localhost:4200)                │    │
│  │  Login · Home · Favoritos · Ver más tarde            │    │
│  └──────────┬──────────────────────────┬────────────────┘    │
└─────────────┼──────────────────────────┼────────────────────┘
              │ /api/* (proxy)            │ HTTPS
              ▼                           ▼
   ┌──────────────────┐        ┌─────────────────────┐
   │ Express :4000    │        │  TMDB API (externa)  │
   │  API REST propia │        │  Búsqueda / catálogo │
   └────────┬─────────┘        └─────────────────────┘
            │
            ▼
   ┌──────────────────┐
   │  PostgreSQL      │
   │  BD: streamzone  │
   └──────────────────┘
```

- **Angular → Express → PostgreSQL:** usuarios, favoritos, ver más tarde, películas persistidas.
- **Angular → TMDB:** solo lectura de catálogo y búsqueda (no se guarda el catálogo completo en BD).

---

## TMDB (API externa)

- Se usa para obtener películas populares y resultados de búsqueda.
- La API key se configura en `Streamzone3.0-main/src/app/config/api.config.ts`.
- Al añadir a favoritos o ver más tarde, se envían al backend los metadatos básicos (`tmdb_id`, `title`, `overview`, `poster_path`, `release_date`) para guardarlos en la tabla `movies`.

Documentación oficial: https://developer.themoviedb.org/docs

---

## PostgreSQL (persistencia propia)

Tablas principales: `users`, `movies`, `favorites`, `watch_later`.  
Scripts en la carpeta `database/`.

---

## Requisitos previos

- **Node.js** 18 o superior
- **npm**
- **PostgreSQL** 14+ (o compatible)
- **Cliente `psql`** o pgAdmin (opcional)
- **API key de TMDB** (gratuita)

---

## 1. Creación de la base de datos

Conéctate a PostgreSQL y ejecuta:

```sql
CREATE DATABASE streamzone;
```

---

## 2. Ejecutar `schema.sql` y `seed.sql`

Desde la **raíz del proyecto** (`Streamzone3.0`):

```powershell
psql -U postgres -d streamzone -f database/schema.sql
psql -U postgres -d streamzone -f database/seed.sql
```

En Windows, si `psql` no está en el PATH:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d streamzone -f database/schema.sql
```

Más detalles en [database/README.md](database/README.md).

---

## 3. Configuración del backend (`backend/.env`)

```powershell
cd backend
Copy-Item .env.example .env
```

Edita `.env` con tus credenciales:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=streamzone
DB_USER=postgres
DB_PASSWORD=tu_password
```

---

## 4. Instalación y arranque del backend

```powershell
cd backend
npm install
npm start
```

Comprueba: http://localhost:4000/api/health → debe devolver `"database": "connected"`.

Modo desarrollo (reinicio automático):

```powershell
npm run dev
```

Documentación detallada: [backend/README.md](backend/README.md).

---

## 5. Instalación y arranque del frontend

En **otra terminal**:

```powershell
cd Streamzone3.0-main
npm install
npm start
```

Abre: http://localhost:4200

El proxy (`proxy.conf.json`) redirige las peticiones `/api/*` al backend en el puerto 4000.

---

## Usuario de prueba

Tras ejecutar `seed.sql`:

| Campo | Valor |
|-------|--------|
| Email | `admin@streamzone.com` |
| Contraseña | `admin123` |
| Username | `admin` |

---

## Funcionalidades principales

| Funcionalidad | Descripción |
|---------------|-------------|
| Login / sesión | Autenticación contra PostgreSQL; sesión en `localStorage` (`id`, `username`, `email`) |
| Home | Catálogo local y modo TMDB con búsqueda |
| Favoritos | Listado y eliminación de películas TMDB guardadas en BD |
| Ver más tarde | Lista personal persistida en PostgreSQL |
| Guards | Rutas protegidas (`authGuard`, `loginGuard`) |

### Endpoints API principales

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/health` | Estado de API y conexión BD |
| POST | `/api/users/login` | Inicio de sesión |
| POST | `/api/users/register` | Registro (backend; UI opcional) |
| GET/POST | `/api/favorites` | Favoritos |
| GET/POST | `/api/watch-later` | Ver más tarde |
| GET/POST | `/api/movies` | Catálogo persistido |

---

## Pruebas realizadas

Se documentaron **14 casos de prueba** y **6 integraciones** extremo a extremo en:

📄 **[PRUEBAS.md](PRUEBAS.md)**

Incluye: arranque, health check, login, TMDB, favoritos, ver más tarde, PostgreSQL, proxy y evidencias sugeridas para la memoria.

---

## Limitaciones actuales

- Contraseñas en texto plano (entorno de desarrollo/TFG).
- Sin JWT ni refresh tokens.
- Catálogo local (Star Wars/Transformers) en `localStorage`, no en PostgreSQL.
- Dependencia de conectividad y API key de TMDB.
- Despliegue documentado solo en entorno local.
- Registro de usuario en backend sin pantalla dedicada en el frontend.

---

## Mejoras futuras

- **bcrypt** + **JWT** para autenticación segura.
- Pantalla de registro en Angular.
- Sincronización del catálogo local con el backend.
- Tests automatizados y Docker Compose.
- Despliegue en producción (HTTPS, variables de entorno seguras).

---

## Documentación adicional

| Documento | Contenido |
|-----------|-----------|
| [PRUEBAS.md](PRUEBAS.md) | Casos de prueba y validación |
| [docs/MEMORIA_BORRADOR.md](docs/MEMORIA_BORRADOR.md) | Borrador de memoria del TFG |
| [database/README.md](database/README.md) | Scripts SQL |
| [backend/README.md](backend/README.md) | API REST y ejemplos curl |
| [Streamzone3.0-main/README.md](Streamzone3.0-main/README.md) | Frontend Angular |

---

## Autoría

- **Proyecto:** StreamZone  
- **Alumno/a:** [Nombre y apellidos del alumno]  
- **Centro educativo:** [Nombre del centro]  
- **Ciclo formativo:** [DAM / DAW / otro]  
- **Curso académico:** [AAAA-AAAA]  
- **Tutor/a:** [Nombre del tutor — completar antes de entrega]

---

*StreamZone — Documentación Fase 7. Trabajo de Fin de Grado.*
