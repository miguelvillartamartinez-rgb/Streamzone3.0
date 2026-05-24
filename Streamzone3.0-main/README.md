# StreamZone

StreamZone es una plataforma web estilo streaming desarrollada con Angular.  
Permite explorar películas, buscar contenido, gestionar favoritos y crear listas personales para ver más tarde, combinando catálogo local con consumo de datos desde TMDB.

## Qué es StreamZone

Proyecto final orientado a DAM para demostrar:
- Arquitectura básica Angular con componentes standalone.
- Consumo de API REST.
- Gestión de estado de usuario en cliente.
- Interfaz visual moderna y responsive.

## Tecnologías utilizadas

- Angular 20
- TypeScript
- RxJS
- HTML5 / CSS3
- Angular Router
- Angular HttpClient + interceptores
- API externa: [TMDB](https://www.themoviedb.org/)

## Funcionalidades principales

- Login y control de acceso con guards.
- Home con catálogo visual tipo plataforma de streaming.
- Búsqueda de películas en catálogo local y en API externa.
- Favoritos (Star Wars, Transformers y películas cargadas desde API).
- Lista "Ver más tarde" (catálogo local y películas de API).
- Persistencia en `localStorage`.
- Estados visuales de carga, error y resultados vacíos.

## Instalación y ejecución

1. Entrar en la carpeta del proyecto:
```bash
cd Streamzone3.0-main
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en desarrollo:
```bash
npm start
```

4. Abrir en navegador:
- `http://localhost:4200`

## Estructura básica del proyecto

```text
src/
  app/
    home/                # Pantalla principal y catálogo
    favoritos/           # Vista de favoritos
    ver-mas-tarde/       # Vista de lista personalizada
    login/               # Autenticación de usuario
    services/            # Servicios de API y lógica de datos
    config/              # Configuración de API
    pipes/               # Pipes reutilizables
```

## Mejoras realizadas

- Refactor ligero en `home` para limpiar lógica repetida.
- Mejora de estados API (cargando/error) y mensajes de feedback.
- Optimización de favoritos/ver-más-tarde de API para evitar lecturas repetidas de `localStorage`.
- Soporte visual en `Favoritos` y `Ver más tarde` para mostrar también películas guardadas desde API.
- Fallback de imagen por defecto al fallar posters.
- Ajustes de estilo y responsive básico en vistas secundarias.
- Limpieza de código no utilizado y eliminación de estilos inline.

## Comprobación de compilación

Para validar que el proyecto compila correctamente:

```bash
npm run build
```
