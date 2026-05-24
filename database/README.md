# StreamZone — Base de datos (Fase 2)

Scripts SQL para crear y poblar la base de datos **PostgreSQL** de StreamZone.

## Estructura

```
database/
├── schema.sql   # Tablas: users, movies, favorites, watch_later
├── seed.sql     # Datos de prueba
└── README.md
```

## Requisitos

- PostgreSQL instalado y en ejecución
- Cliente `psql` (incluido con PostgreSQL) o pgAdmin

Las credenciales deben coincidir con las de `backend/.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`).

## 1. Crear la base de datos

Abre una terminal y conéctate a PostgreSQL como superusuario (ajusta el usuario si no usas `postgres`):

```bash
psql -U postgres
```

Dentro de `psql`:

```sql
CREATE DATABASE streamzone;
\q
```

En Windows (PowerShell), si `psql` no está en el PATH, usa la ruta completa, por ejemplo:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
```

## 2. Ejecutar el esquema (`schema.sql`)

Desde la **raíz del proyecto** (`Streamzone3.0`):

```bash
psql -U postgres -d streamzone -f database/schema.sql
```

PowerShell (misma raíz):

```powershell
psql -U postgres -d streamzone -f database/schema.sql
```

Esto crea las tablas:

| Tabla         | Descripción                          |
|---------------|--------------------------------------|
| `users`       | Usuarios registrados                 |
| `movies`      | Películas del catálogo (con `tmdb_id`) |
| `favorites`   | Favoritos por usuario                |
| `watch_later` | Lista “Ver más tarde” por usuario    |

## 3. Ejecutar los datos de prueba (`seed.sql`)

```bash
psql -U postgres -d streamzone -f database/seed.sql
```

PowerShell:

```powershell
psql -U postgres -d streamzone -f database/seed.sql
```

### Datos insertados

| Tipo          | Detalle |
|---------------|---------|
| Usuario       | `admin` — `admin@streamzone.com` / `admin123` |
| Películas     | 5 títulos (Star Wars IV, Inception, The Dark Knight, Interstellar, Transformers) |
| Favoritos     | 3 películas del usuario admin |
| Ver más tarde | 2 películas del usuario admin |

> La contraseña en `seed.sql` está en texto plano solo para pruebas locales. En fases posteriores del backend se sustituirá por un hash seguro.

## 4. Comprobar que las tablas existen

Conéctate a la base de datos:

```bash
psql -U postgres -d streamzone
```

Listar tablas:

```sql
\dt
```

Deberías ver: `users`, `movies`, `favorites`, `watch_later`.

Contar registros:

```sql
SELECT 'users' AS tabla, COUNT(*) FROM users
UNION ALL
SELECT 'movies', COUNT(*) FROM movies
UNION ALL
SELECT 'favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'watch_later', COUNT(*) FROM watch_later;
```

Resultado esperado tras el seed:

| tabla         | count |
|---------------|-------|
| users         | 1     |
| movies        | 5     |
| favorites     | 3     |
| watch_later   | 2     |

Consulta de ejemplo (favoritos del admin con título de película):

```sql
SELECT u.username, m.title, f.created_at
FROM favorites f
JOIN users u ON u.id = f.user_id
JOIN movies m ON m.id = f.movie_id;
```

Salir de `psql`:

```sql
\q
```

## 5. Relación con el backend

Cuando `backend/.env` apunte a la base `streamzone`, el endpoint `GET /api/health` debería devolver `"database": "connected"` si PostgreSQL está en marcha y las credenciales son correctas.

En esta fase **no hay endpoints** de usuarios, favoritos ni watch later; solo scripts SQL y documentación.

## Orden recomendado (resumen)

1. `CREATE DATABASE streamzone;`
2. `psql ... -f database/schema.sql`
3. `psql ... -f database/seed.sql`
4. Comprobar con `\dt` y las consultas `COUNT(*)`

Si necesitas repetir el seed en desarrollo, vacía las tablas antes de volver a ejecutar `seed.sql`:

```sql
TRUNCATE watch_later, favorites, movies, users RESTART IDENTITY CASCADE;
```
