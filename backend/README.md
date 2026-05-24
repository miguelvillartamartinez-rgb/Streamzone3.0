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
    │   └── userRoutes.js
    ├── controllers/
    │   └── userController.js
    └── models/
        └── userModel.js
```

## Requisitos

- Node.js 18 o superior
- PostgreSQL en ejecución con la base `streamzone` creada (ver `database/README.md`)

## Configuración

1. Copia el archivo de entorno:

```powershell
Copy-Item .env.example .env
```

2. Edita `.env` con tus credenciales de PostgreSQL.

3. Asegúrate de haber ejecutado `database/schema.sql` y `database/seed.sql`.

## Instalación y arranque

```powershell
cd backend
npm install
npm start
```

Modo desarrollo (reinicio automático, Node 18+):

```powershell
npm run dev
```

El servidor queda en **http://localhost:4000**.

## Endpoints disponibles

| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | `/api/health`           | Estado de la API y BD    |
| POST   | `/api/users/register`   | Registro de usuario      |
| POST   | `/api/users/login`      | Inicio de sesión         |

### Seguridad (Fase 3)

- Las contraseñas se guardan y comparan en **texto plano** solo para simplificar el desarrollo del TFG.
- **Mejora futura:** usar `bcrypt` para hashear al registrar y comparar al hacer login; añadir **JWT** para sesiones en fases posteriores.

---

## Probar con curl

### Health check

```bash
curl http://localhost:4000/api/health
```

### Registro (`POST /api/users/register`)

```bash
curl -X POST http://localhost:4000/api/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"demo\",\"email\":\"demo@streamzone.com\",\"password\":\"demo123\"}"
```

PowerShell (alternativa):

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/users/register" `
  -ContentType "application/json" `
  -Body '{"username":"demo","email":"demo@streamzone.com","password":"demo123"}'
```

Respuesta esperada (201):

```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "user": {
    "id": 2,
    "username": "demo",
    "email": "demo@streamzone.com",
    "created_at": "2026-05-24T..."
  }
}
```

### Login (`POST /api/users/login`)

Con el usuario del seed (`admin@streamzone.com` / `admin123`):

```bash
curl -X POST http://localhost:4000/api/users/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@streamzone.com\",\"password\":\"admin123\"}"
```

PowerShell:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/users/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@streamzone.com","password":"admin123"}'
```

Respuesta esperada (200):

```json
{
  "success": true,
  "message": "Inicio de sesión correcto",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@streamzone.com",
    "created_at": "..."
  }
}
```

### Errores habituales

**Campos vacíos (400):**

```json
{ "success": false, "message": "email y password son obligatorios" }
```

**Email ya registrado (409):**

```json
{ "success": false, "message": "El email ya está registrado" }
```

**Credenciales incorrectas (401):**

```json
{ "success": false, "message": "Email o contraseña incorrectos" }
```

---

## Probar con Postman

1. Crea una colección **StreamZone API**.
2. Variable de entorno: `baseUrl` = `http://localhost:4000`.
3. **Register:** POST `{{baseUrl}}/api/users/register`  
   Body → raw → JSON:
   ```json
   {
     "username": "demo",
     "email": "demo@streamzone.com",
     "password": "demo123"
   }
   ```
4. **Login:** POST `{{baseUrl}}/api/users/login`  
   Body → raw → JSON:
   ```json
   {
     "email": "admin@streamzone.com",
     "password": "admin123"
   }
   ```

## Integración con Angular

El frontend (`Streamzone3.0-main`) tiene un proxy hacia `http://localhost:4000` en `proxy.conf.json`. En fases posteriores se conectarán login y registro desde Angular.

## Variables de entorno

| Variable       | Descripción              |
|----------------|--------------------------|
| `PORT`         | Puerto del servidor API  |
| `DB_HOST`      | Host de PostgreSQL       |
| `DB_PORT`      | Puerto de PostgreSQL     |
| `DB_NAME`      | Nombre de la base de datos |
| `DB_USER`      | Usuario de PostgreSQL    |
| `DB_PASSWORD`  | Contraseña de PostgreSQL |
