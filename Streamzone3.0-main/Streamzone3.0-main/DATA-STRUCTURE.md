# Estructura de Datos - StreamZone

Esta aplicación utiliza archivos JSON para almacenar datos en lugar de una base de datos. Esto es ideal para proyectos de aprendizaje en Angular.

## Estructura de Archivos

Los datos se almacenan en la carpeta `src/data/`:

- `usuarios.json` - Almacena los usuarios del sistema
- `peliculas.json` - Almacena las películas disponibles

## Formato de Datos

### Usuarios (`usuarios.json`)

```json
[
  {
    "id": 1,
    "email": "admin@gmail.com",
    "contraseña": "admin123",
    "nombre": "Administrador"
  }
]
```

**Campos:**
- `id`: Identificador único (número)
- `email`: Correo electrónico del usuario (string, único)
- `contraseña`: Contraseña en texto plano (para aprendizaje)
- `nombre`: Nombre del usuario (string, opcional)

### Películas (`peliculas.json`)

```json
[
  {
    "id": 1,
    "nombre": "Inception",
    "descripcion": "Descripción de la película...",
    "imagen": "assets/peliculas/inception.jpg"
  }
]
```

**Campos:**
- `id`: Identificador único (número)
- `nombre`: Nombre de la película (string)
- `descripcion`: Descripción de la película (string)
- `imagen`: Ruta a la imagen en la carpeta assets (string)

## Servicio de Datos

El archivo `src/data-service.ts` contiene todas las funciones para leer y escribir datos:

### Funciones para Usuarios:
- `getUsuarios()`: Obtiene todos los usuarios
- `findUsuarioByEmail(email)`: Busca un usuario por email
- `addUsuario(usuario)`: Agrega un nuevo usuario
- `saveUsuarios(usuarios)`: Guarda la lista de usuarios

### Funciones para Películas:
- `getPeliculas()`: Obtiene todas las películas
- `findPeliculaById(id)`: Busca una película por ID
- `addPelicula(pelicula)`: Agrega una nueva película
- `updatePelicula(id, pelicula)`: Actualiza una película
- `deletePelicula(id)`: Elimina una película
- `savePeliculas(peliculas)`: Guarda la lista de películas

## Usuarios de Prueba

Por defecto, la aplicación incluye estos usuarios:

1. **Admin:**
   - Email: `admin@gmail.com`
   - Contraseña: `admin123`

2. **Usuario Demo:**
   - Email: `usuario@streamzone.com`
   - Contraseña: `usuario123`

## Notas Importantes

⚠️ **Seguridad**: Las contraseñas se almacenan en texto plano. Esto es solo para fines de aprendizaje. En producción, siempre usa hash (bcrypt) para las contraseñas.

📝 **Persistencia**: Los datos se guardan en archivos JSON en el servidor. Los cambios se reflejan inmediatamente en los archivos.

🔄 **Relaciones Futuras**: En el futuro, se pueden agregar relaciones entre usuarios y películas (favoritos, vistas, etc.) agregando campos adicionales o archivos JSON de relación.




