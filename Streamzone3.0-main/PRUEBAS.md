# StreamZone — Documentación de pruebas (Fase 6)

Documento de validación para la memoria del TFG.  
Proyecto: **StreamZone** — plataforma web estilo streaming con Angular, Node.js/Express, PostgreSQL y API externa TMDB.

**Entorno de pruebas:**

| Componente | URL / ubicación |
|------------|-----------------|
| Backend API | http://localhost:4000 |
| Frontend Angular | http://localhost:4200 |
| Base de datos | PostgreSQL (`streamzone`) |
| Proxy desarrollo | `Streamzone3.0-main/proxy.conf.json` → `/api` → `:4000` |

**Usuario de prueba (seed):** `admin@gmail.com` / `admin123` (id de usuario: 1).

> Login y registro requieren cuenta **Gmail** o **Googlemail**.

---

## 1. Tabla de casos de prueba

| ID | Funcionalidad | Pasos realizados | Resultado esperado | Resultado obtenido | Estado |
|----|---------------|------------------|--------------------|--------------------|--------|
| P-01 | Arranque del backend | 1. PostgreSQL en ejecución.<br>2. `cd backend` → `npm install` → `npm start`.<br>3. Comprobar consola. | Servidor escuchando en puerto 4000 sin errores fatales. | Mensaje `StreamZone API escuchando en http://localhost:4000`. | ✅ Correcto |
| P-02 | Health check API | 1. Backend en marcha.<br>2. `GET http://localhost:4000/api/health` (navegador o curl). | JSON con `status: "ok"` y `database: "connected"`. | Respuesta JSON correcta con base de datos conectada. | ✅ Correcto |
| P-03 | Arranque del frontend | 1. Backend en marcha.<br>2. `cd Streamzone3.0-main` → `npm install` → `npm start`.<br>3. Abrir http://localhost:4200. | Aplicación Angular carga; pantalla de login visible. | Login accesible en puerto 4200. | ✅ Correcto |
| P-04 | Login correcto | 1. En login, email `admin@gmail.com` y contraseña `admin123`.<br>2. Pulsar **Entrar**. | Redirección a `/home`; sesión guardada (`id`, `username`, `email` en localStorage). | Acceso a Home con nombre de usuario visible. | ✅ Correcto |
| P-05 | Login incorrecto | 1. Email `admin@gmail.com` y contraseña errónea.<br>2. Pulsar **Entrar**. | Mensaje de error; botón deja de cargar; no se accede a Home. | Mensaje *"Email o contraseña incorrectos"*; loading se desactiva. | ✅ Correcto |
| P-06 | Búsqueda TMDB | 1. Login correcto.<br>2. Activar modo API/TMDB en Home.<br>3. Buscar término (≥2 caracteres), ej. `matrix`. | Resultados de películas TMDB visibles sin interacción extra en pantalla. | Listado de películas mostrado al completar la petición. | ✅ Correcto |
| P-07 | Añadir favorito (TMDB) | 1. En Home (modo TMDB), pulsar ⭐ en una película.<br>2. Revisar consola (F12) y red. | `POST /api/favorites` con `user_id`, `tmdb_id`, `title`, `overview`, `poster_path`, `release_date`. Icono activo solo si respuesta OK. | Petición 200/201; icono ⭐ activo; datos en PostgreSQL. | ✅ Correcto |
| P-08 | Listar favoritos | 1. Tras P-07, ir a **Favoritos**. | Películas TMDB guardadas visibles con título e imagen; sección API no vacía. | Películas listadas correctamente desde backend. | ✅ Correcto |
| P-09 | Eliminar favorito | 1. En **Favoritos**, pulsar **Eliminar** en una película TMDB. | `DELETE /api/favorites/:id`; película desaparece de la lista. | Eliminación correcta en UI y en base de datos. | ✅ Correcto |
| P-10 | Añadir ver más tarde (TMDB) | 1. En Home (modo TMDB), pulsar ⏰ en una película.<br>2. Revisar red. | `POST /api/watch-later` con mismos campos que favoritos. Icono activo solo si respuesta OK. | Petición correcta; icono ⏰ activo; registro en PostgreSQL. | ✅ Correcto |
| P-11 | Listar ver más tarde | 1. Tras P-10, ir a **Ver más tarde**. | Películas TMDB guardadas visibles. | Listado correcto desde backend. | ✅ Correcto |
| P-12 | Eliminar ver más tarde | 1. En **Ver más tarde**, pulsar **Eliminar**. | `DELETE /api/watch-later/:id`; registro eliminado. | Eliminación correcta en UI y BD. | ✅ Correcto |
| P-13 | Comprobación PostgreSQL | 1. Tras añadir favorito/ver más tarde, ejecutar consultas SQL (sección 4). | Filas en `movies`, `favorites` y/o `watch_later` coherentes con la UI. | Datos persistentes y relaciones correctas (`user_id`, `movie_id`). | ✅ Correcto |
| P-14 | Proxy `/api` Angular → backend | 1. Frontend en `ng serve` (proxy activo).<br>2. Login o favoritos desde la app.<br>3. Pestaña Red: peticiones a `/api/...` (no a `:4000` directo en URL del navegador). | Peticiones relativas `/api/*` resueltas a `localhost:4000` por proxy. | Comunicación correcta; CORS sin bloqueos en desarrollo. | ✅ Correcto |
| P-15 | Registro correcto | 1. Ir a `/register` (o enlace «Regístrate ahora» en login).<br>2. Completar username, email Gmail nuevo, contraseña y confirmación.<br>3. Pulsar **Crear cuenta**. | `POST /api/users/register` con 201; redirección a `/home`; sesión en `localStorage` (`id`, `username`, `email`). | Usuario creado en PostgreSQL; acceso a Home. | ✅ Correcto |
| P-16 | Registro fallido | 1. En `/register`, probar email no Gmail (ej. `user@test.com`) o email ya registrado.<br>2. Pulsar **Crear cuenta**. | Mensaje de error claro; no redirección a Home; no sesión creada. | Error de validación Gmail o 409 por duplicado. | ✅ Correcto |

**Leyenda de estado:** ✅ Correcto · ⚠️ Parcial · ❌ Incorrecto

---

## 2. Pruebas de integración (Angular → backend → PostgreSQL)

Flujo extremo a extremo validado:

```
[Usuario en navegador]
       │
       ▼
[Angular 4200]  ── /api/* (proxy) ──►  [Express 4000]
       │                                      │
       │ localStorage: id, username, email    ▼
       │                               [PostgreSQL streamzone]
       │
[TMDB API] ◄── solo catálogo/búsqueda (sin persistencia en BD)
```

| Integración | Descripción | Verificación |
|-------------|-------------|--------------|
| I-01 | Login | Angular `POST /api/users/login` → Express valida en `users` → sesión en cliente. | P-04, P-05 |
| I-07 | Registro | Angular `POST /api/users/register` desde `/register` → usuario en `users` → sesión en cliente. | P-15, P-16 |
| I-02 | Alta de película + favorito | Home envía datos TMDB → `movies` (upsert por `tmdb_id`) → `favorites`. | P-07, P-13 |
| I-03 | Lectura de favoritos | Favoritos `GET /api/favorites/:userId` → JOIN `movies` → mapeo a plantilla. | P-08 |
| I-04 | Alta ver más tarde | Mismo flujo que favoritos en tabla `watch_later`. | P-10, P-11 |
| I-05 | Eliminación en cascada | DELETE por `id` de relación; UI y BD sincronizados. | P-09, P-12 |
| I-06 | Coherencia de usuario | Mismo `user_id` en POST y GET (sesión localStorage). | P-07, P-08, P-13 |

**Comandos útiles de integración (PowerShell):**

```powershell
# Health
Invoke-RestMethod http://localhost:4000/api/health

# Login
Invoke-RestMethod -Method POST -Uri http://localhost:4000/api/users/login `
  -ContentType "application/json" `
  -Body '{"email":"admin@gmail.com","password":"admin123"}'

# Listar favoritos usuario 1
Invoke-RestMethod http://localhost:4000/api/favorites/1
```

---

## 3. Incidencias corregidas durante el desarrollo

| Incidencia | Causa | Solución aplicada |
|------------|-------|-------------------|
| Login con contraseña incorrecta: pantalla cargando indefinidamente | Error HTTP 401 + detección de cambios sin Zone.js | Manejo explícito del 401 en `auth.ts`; `detectChanges()` en `login.ts` |
| Búsqueda TMDB: resultados no visibles hasta hacer clic | `provideZonelessChangeDetection` sin refresco de vista | `ChangeDetectorRef.detectChanges()` tras actualizar arrays en Home |
| Favoritos/ver más tarde: icono activo pero lista vacía | SSR ejecutaba `ngOnInit` sin `localStorage`; fallback localStorage vacío | Carga API en `afterNextRender()`; eliminación de fallback TMDB en favoritos |
| Icono activo sin datos en PostgreSQL | Fallback localStorage en error de red | Solo actualizar UI tras respuesta exitosa del backend |
| URL de login antigua `/api/login` | Endpoint legacy en SSR | Uso de `POST /api/users/login` vía `UserApiService` |

---

## 4. Consultas SQL de comprobación (P-13)

```sql
-- Favoritos del usuario admin (id = 1)
SELECT f.id AS favorite_id, f.user_id, m.tmdb_id, m.title, m.poster_path, f.created_at
FROM favorites f
JOIN movies m ON m.id = f.movie_id
WHERE f.user_id = 1
ORDER BY f.created_at DESC;

-- Ver más tarde del usuario admin
SELECT w.id AS watch_later_id, w.user_id, m.tmdb_id, m.title, w.created_at
FROM watch_later w
JOIN movies m ON m.id = w.movie_id
WHERE w.user_id = 1
ORDER BY w.created_at DESC;

-- Resumen de conteos
SELECT 'users' AS tabla, COUNT(*)::text AS total FROM users
UNION ALL SELECT 'movies', COUNT(*)::text FROM movies
UNION ALL SELECT 'favorites', COUNT(*)::text FROM favorites
UNION ALL SELECT 'watch_later', COUNT(*)::text FROM watch_later;
```

---

## 5. Limitaciones actuales

- **Autenticación:** contraseñas en texto plano en desarrollo; sin JWT ni refresh token.
- **Autorización:** `user_id` enviado en el body; no hay validación por token en cada petición.
- **Catálogo local:** Star Wars y Transformers siguen en `localStorage` (sin `tmdb_id` en backend).
- **TMDB:** dependencia de API key externa y conectividad; sin caché offline de catálogo.
- **SSR:** rutas prerenderizadas; la lógica de sesión y listas depende del navegador (`afterNextRender`).
- **Gmail obligatorio:** login y registro solo aceptan `@gmail.com` o `@googlemail.com`.
- **Un solo entorno:** pruebas documentadas en desarrollo local (no despliegue en producción).

---

## 6. Mejoras futuras

| Prioridad | Mejora |
|-----------|--------|
| Alta | Hash de contraseñas con **bcrypt** y autenticación **JWT** (mejora opcional al final). |
| Alta | Guards en backend que validen el usuario autenticado en cada ruta protegida. |
| Media | Sincronizar catálogo local (Star Wars/Transformers) con backend usando `tmdb_id` o identificadores propios. |
| Media | Paginación en listados de favoritos y ver más tarde. |
| Baja | Tests automatizados (Jest/Supertest en backend; Jasmine/Karma o Playwright en frontend). |
| Baja | Docker Compose (PostgreSQL + backend + frontend) para despliegue reproducible. |
| Baja | Internacionalización (i18n) y temas claro/oscuro. |

---

## 7. Orden recomendado de ejecución de pruebas

1. P-01 → P-02 (backend y base de datos).
2. P-03 → P-05 (frontend y autenticación).
3. P-15 → P-16 (registro de usuario en `/register`).
4. P-14 (comprobar proxy en pestaña Red del navegador).
5. P-06 → P-09 (flujo favoritos TMDB).
6. P-10 → P-12 (flujo ver más tarde TMDB).
7. P-13 (validación en PostgreSQL).
8. Revisar integraciones I-01 a I-07 como checklist transversal.

---

## 8. Evidencias sugeridas para la memoria

Para cada bloque funcional, se recomienda capturar:

- Captura de `GET /api/health` con `database: "connected"`.
- Captura de login correcto e incorrecto.
- Captura de registro correcto (P-15) y registro fallido (P-16).
- Captura de búsqueda TMDB en Home.
- Captura de Favoritos y Ver más tarde con películas TMDB.
- Captura de resultado de consulta SQL (`favorites` / `watch_later`).
- Captura de pestaña Red mostrando `POST /api/favorites` y `GET /api/favorites/1` vía proxy.

---

*Documento generado en Fase 6 — Pruebas y validación. StreamZone TFG.*
