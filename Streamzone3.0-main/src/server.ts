import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import {
  findUsuarioByEmail,
  getPeliculas,
  getUsuarios,
  getOrCreateEstadoPeliculasUsuario,
  updateEstadoPeliculasUsuario
} from './data-service';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Middleware para parsear JSON
app.use(express.json());

function getUserIdFromHeader(req: express.Request): number | null {
  const raw = req.header('x-user-id');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isNaN(id) ? null : id;
}

/**
 * API Endpoints - deben ir antes de las rutas estáticas
 */
app.post('/api/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
      return;
    }

    // Buscar usuario en el archivo JSON
    const user = findUsuarioByEmail(email.toLowerCase().trim());

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${email}`);
      res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
      return;
    }

    // Verificar contraseña (en texto plano para simplicidad en aprendizaje)
    if (password !== user.contraseña) {
      console.log(`❌ Contraseña incorrecta para: ${email}`);
      res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
      return;
    }

    console.log(`✅ Login exitoso para: ${email}`);

    // Login exitoso
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre || user.email
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack available');
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/peliculas', async (req, res): Promise<void> => {
  try {
    const peliculas = getPeliculas();
    res.json(peliculas);
  } catch (error) {
    console.error('❌ Error obteniendo películas:', error);
    res.status(500).json({
      error: 'Error al obtener películas',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/me', async (req, res): Promise<void> => {
  try {
    const userId = getUserIdFromHeader(req);
    if (userId === null) {
      res.status(401).json({ error: 'Falta header x-user-id' });
      return;
    }

    const usuarios = getUsuarios();
    const user = usuarios.find(u => u.id === userId);

    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      nombre: user.nombre || user.email
    });
  } catch (error) {
    console.error('❌ Error en /api/me:', error);
    res.status(500).json({
      error: 'Error al obtener usuario actual',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/me/estado-peliculas', async (req, res): Promise<void> => {
  try {
    const userId = getUserIdFromHeader(req);
    if (userId === null) {
      res.status(401).json({ error: 'Falta header x-user-id' });
      return;
    }

    const estado = getOrCreateEstadoPeliculasUsuario(userId);
    res.json(estado);
  } catch (error) {
    console.error('❌ Error en /api/me/estado-peliculas (GET):', error);
    res.status(500).json({
      error: 'Error al obtener estado de películas',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/me/estado-peliculas', async (req, res): Promise<void> => {
  try {
    const userId = getUserIdFromHeader(req);
    if (userId === null) {
      res.status(401).json({ error: 'Falta header x-user-id' });
      return;
    }

    const {
      favoritosStarWars,
      favoritosTransformers,
      verMasTardeStarWars,
      verMasTardeTransformers
    } = req.body || {};

    const updated = updateEstadoPeliculasUsuario(userId, {
      favoritosStarWars,
      favoritosTransformers,
      verMasTardeStarWars,
      verMasTardeTransformers
    });

    res.json(updated);
  } catch (error) {
    console.error('❌ Error en /api/me/estado-peliculas (POST):', error);
    res.status(500).json({
      error: 'Error al guardar estado de películas',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * También se inicia en desarrollo para que el proxy funcione.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
const shouldStartServer = isMainModule(import.meta.url) || 
                         process.env['pm_id'] || 
                         process.env['NODE_ENV'] !== 'production';

if (shouldStartServer) {
  const port = process.env['PORT'] || 4000;
  
  // Verificar si el puerto ya está en uso (para evitar errores en desarrollo)
  app.listen(port, (error) => {
    if (error) {
      // Si el puerto está en uso, solo mostrar un warning en desarrollo
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'EADDRINUSE' && process.env['NODE_ENV'] !== 'production') {
        console.log(`⚠️  Puerto ${port} ya en uso. El servidor Express puede estar corriendo en otro proceso.`);
      } else {
        throw error;
      }
    } else {
      console.log(`✅ Servidor Express API iniciado en http://localhost:${port}`);
    }
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
