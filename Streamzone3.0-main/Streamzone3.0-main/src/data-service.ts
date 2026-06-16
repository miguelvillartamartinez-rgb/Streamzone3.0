import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, sep } from 'node:path';

// Obtener el directorio de datos - funciona tanto en desarrollo como en producción
function getDataDir(): string {
  // Obtener el directorio raíz del proyecto
  // En desarrollo con Vite, process.cwd() puede estar en .angular/vite-root/Streamzone
  // Necesitamos subir hasta encontrar el directorio con src/data
  let projectRoot = process.cwd();
  
  console.log(`📍 process.cwd(): ${projectRoot}`);
  
  // Si estamos en .angular/vite-root, subir hasta el proyecto raíz
  if (projectRoot.includes('.angular')) {
    // Subir desde .angular/vite-root/Streamzone hasta la raíz del proyecto
    const parts = projectRoot.split(sep);
    const angularIndex = parts.findIndex(p => p === '.angular');
    if (angularIndex !== -1) {
      projectRoot = parts.slice(0, angularIndex).join(sep);
      console.log(`🔧 Ajustado project root a: ${projectRoot}`);
    }
  }
  
  // Intentar diferentes rutas posibles
  const possiblePaths = [
    join(projectRoot, 'src', 'data'), // Desarrollo - ruta correcta
    join(projectRoot, 'data'), // Alternativa
  ];
  
  console.log(`🔍 Buscando directorio de datos. Project root: ${projectRoot}`);
  console.log(`🔍 Rutas a probar:`, possiblePaths);
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      console.log(`✅ Directorio encontrado: ${path}`);
      return path;
    }
  }
  
  // Si no existe, usar la primera opción (desarrollo) y crear si es necesario
  const defaultPath = possiblePaths[0];
  console.log(`⚠️ Directorio no encontrado, usando: ${defaultPath}`);
  console.log(`⚠️ Verificando si existe src: ${join(projectRoot, 'src')}`);
  console.log(`⚠️ Existe src?: ${existsSync(join(projectRoot, 'src'))}`);
  
  try {
    // Crear el directorio src/data si no existe
    const srcDir = join(projectRoot, 'src');
    if (!existsSync(srcDir)) {
      console.log(`📁 Creando directorio src: ${srcDir}`);
      mkdirSync(srcDir, { recursive: true });
    }
    if (!existsSync(defaultPath)) {
      console.log(`📁 Creando directorio data: ${defaultPath}`);
      mkdirSync(defaultPath, { recursive: true });
      console.log(`📁 Directorio creado: ${defaultPath}`);
    }
  } catch (error) {
    console.error(`❌ Error creando directorio:`, error);
    throw error;
  }
  
  return defaultPath;
}

// Función genérica para leer un archivo JSON
export function readJsonFile<T>(filename: string): T[] {
  const currentDataDir = getDataDir();
  const filePath = join(currentDataDir, filename);
  
  console.log(`📖 Leyendo archivo: ${filePath}`);
  
  if (!existsSync(filePath)) {
    console.log(`⚠️ Archivo no existe, creando: ${filePath}`);
    // Asegurarse de que el directorio existe antes de crear el archivo
    try {
      const dir = join(filePath, '..');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 Directorio creado: ${dir}`);
      }
      writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
      console.log(`✅ Archivo creado: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error creando ${filename}:`, error);
      throw error;
    }
    return [];
  }

  try {
    const data = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data) as T[];
    console.log(`✅ Archivo leído correctamente: ${filename} (${parsed.length} registros)`);
    return parsed;
  } catch (error) {
    console.error(`❌ Error leyendo ${filename}:`, error);
    return [];
  }
}

// Función genérica para escribir un archivo JSON
export function writeJsonFile<T>(filename: string, data: T[]): void {
  const currentDataDir = getDataDir();
  const filePath = join(currentDataDir, filename);
  
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 Archivo guardado: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error escribiendo ${filename}:`, error);
    throw error;
  }
}

// Tipos para las entidades
export interface Usuario {
  id: number;
  email: string;
  contraseña: string;
  nombre?: string;
}

export interface Pelicula {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
}

export interface EstadoPeliculasUsuario {
  userId: number;
  favoritosStarWars: number[];
  favoritosTransformers: number[];
  verMasTardeStarWars: number[];
  verMasTardeTransformers: number[];
}

// Funciones específicas para usuarios
export function getUsuarios(): Usuario[] {
  return readJsonFile<Usuario>('usuarios.json');
}

export function saveUsuarios(usuarios: Usuario[]): void {
  writeJsonFile<Usuario>('usuarios.json', usuarios);
}

export function findUsuarioByEmail(email: string): Usuario | undefined {
  const usuarios = getUsuarios();
  console.log(`🔍 Buscando usuario: ${email}`);
  console.log(`📋 Usuarios disponibles:`, usuarios.map(u => u.email));
  const found = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    console.log(`✅ Usuario encontrado: ${found.email}`);
  } else {
    console.log(`❌ Usuario no encontrado`);
  }
  return found;
}

export function addUsuario(usuario: Omit<Usuario, 'id'>): Usuario {
  const usuarios = getUsuarios();
  const newId = usuarios.length > 0 
    ? Math.max(...usuarios.map(u => u.id)) + 1 
    : 1;
  
  const newUsuario: Usuario = {
    ...usuario,
    id: newId
  };
  
  usuarios.push(newUsuario);
  saveUsuarios(usuarios);
  return newUsuario;
}

// Funciones específicas para películas
export function getPeliculas(): Pelicula[] {
  return readJsonFile<Pelicula>('peliculas.json');
}

export function savePeliculas(peliculas: Pelicula[]): void {
  writeJsonFile<Pelicula>('peliculas.json', peliculas);
}

export function findPeliculaById(id: number): Pelicula | undefined {
  const peliculas = getPeliculas();
  return peliculas.find(p => p.id === id);
}

export function addPelicula(pelicula: Omit<Pelicula, 'id'>): Pelicula {
  const peliculas = getPeliculas();
  const newId = peliculas.length > 0 
    ? Math.max(...peliculas.map(p => p.id)) + 1 
    : 1;
  
  const newPelicula: Pelicula = {
    ...pelicula,
    id: newId
  };
  
  peliculas.push(newPelicula);
  savePeliculas(peliculas);
  return newPelicula;
}

export function updatePelicula(id: number, pelicula: Partial<Pelicula>): Pelicula | null {
  const peliculas = getPeliculas();
  const index = peliculas.findIndex(p => p.id === id);
  
  if (index === -1) {
    return null;
  }
  
  peliculas[index] = { ...peliculas[index], ...pelicula };
  savePeliculas(peliculas);
  return peliculas[index];
}

export function deletePelicula(id: number): boolean {
  const peliculas = getPeliculas();
  const index = peliculas.findIndex(p => p.id === id);
  
  if (index === -1) {
    return false;
  }
  
  peliculas.splice(index, 1);
  savePeliculas(peliculas);
  return true;
}

// ===== Estado de películas por usuario (favoritos / ver más tarde) =====

export function getEstadoPeliculasUsuarios(): EstadoPeliculasUsuario[] {
  return readJsonFile<EstadoPeliculasUsuario>('estado-peliculas.json');
}

export function saveEstadoPeliculasUsuarios(estados: EstadoPeliculasUsuario[]): void {
  writeJsonFile<EstadoPeliculasUsuario>('estado-peliculas.json', estados);
}

export function getOrCreateEstadoPeliculasUsuario(userId: number): EstadoPeliculasUsuario {
  const estados = getEstadoPeliculasUsuarios();
  let estado = estados.find(e => e.userId === userId);

  if (!estado) {
    estado = {
      userId,
      favoritosStarWars: [],
      favoritosTransformers: [],
      verMasTardeStarWars: [],
      verMasTardeTransformers: []
    };
    estados.push(estado);
    saveEstadoPeliculasUsuarios(estados);
  }

  return estado;
}

export function updateEstadoPeliculasUsuario(
  userId: number,
  partial: Partial<Omit<EstadoPeliculasUsuario, 'userId'>>
): EstadoPeliculasUsuario {
  const estados = getEstadoPeliculasUsuarios();
  const index = estados.findIndex(e => e.userId === userId);

  let updated: EstadoPeliculasUsuario;

  if (index === -1) {
    const base = getOrCreateEstadoPeliculasUsuario(userId);
    updated = { ...base, ...partial };
    estados.push(updated);
  } else {
    updated = { ...estados[index], ...partial };
    estados[index] = updated;
  }

  saveEstadoPeliculasUsuarios(estados);
  return updated;
}

