import { Injectable, signal } from '@angular/core';
import { Materia, Pregunta } from '../models/materia';
import { db } from '../repositories/app-database'; // Asegurate de que esta ruta coincida con la tuya
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';



@Injectable({ providedIn: 'root' })
export class MateriasService {
  // El estado interno arranca vacío, se llenará al cargar la app
  private materiasSignal = signal<Materia[]>([]);

  // Lo exponemos como Readonly
  materias = this.materiasSignal.asReadonly();

  constructor() {
    // Apenas arranca el servicio, disparamos la lectura de la base de datos local
    this.cargarMateriasIniciales();
  }

  // ==========================================
  // LECTURA (BASE DE DATOS -> SIGNAL)
  // ==========================================

  async editarMateria(materiaEditada: Materia) {
    try {
      // put() en Dexie funciona como "Upsert" (si el ID existe, lo pisa/actualiza)
      await db.materias.put(materiaEditada);

      // Actualizamos el Signal buscando la materia por ID y reemplazándola
      this.materiasSignal.update(materias =>
        materias.map(m => m.id === materiaEditada.id ? materiaEditada : m)
      );
    } catch (error) {
      console.error('Error al editar la materia', error);
      throw error;
    }
  }

  async eliminarMateria(id: string) {
    try {
      // 1. Borramos físicamente de IndexedDB
      await db.materias.delete(id);

      // 2. Filtramos el Signal para sacar la materia borrada de la vista
      this.materiasSignal.update(materias => materias.filter(m => m.id !== id));

    } catch (error) {
      console.error('Error al eliminar la materia de la BD', error);
      throw error;
    }
  }

  async cargarMateriasIniciales() {
    try {
      // Traemos las primeras 10 materias desde IndexedDB
      const materiasLocales = await db.materias.limit(10).toArray();
      this.materiasSignal.set(materiasLocales);
    } catch (error) {
      console.error('Error al cargar materias desde la base de datos', error);
    }
  }

  async buscarMateriasPorTexto(termino: string) {
    if (!termino.trim()) {
      await this.cargarMateriasIniciales();
      return;
    }

    // Buscador indexado: Ultra rápido, no satura memoria
    const resultados = await db.materias
      .where('nombre').startsWithIgnoreCase(termino)
      .or('codigo').startsWithIgnoreCase(termino)
      .limit(10)
      .toArray();

    this.materiasSignal.set(resultados);
  }

  obtenerMateriaPorId(id: string): Materia | undefined {
    // La lectura de ID específico sigue siendo sincrónica porque buscamos en la RAM (Signal)
    return this.materiasSignal().find(m => m.id === id);
  }

  buscarMateria(id: string): Materia | undefined {
    return this.obtenerMateriaPorId(id); // Reutilizamos método para no duplicar código
  }


  // ==========================================
  // ESCRITURA (SIGNAL + BASE DE DATOS)
  // ==========================================

  async agregarMateria(materia: Materia) {
    // 1. Guardamos en el disco del celular
    await db.materias.put(materia);
    // 2. Si lo anterior funcionó, actualizamos la pantalla
    this.materiasSignal.update(state => [...state, materia]);
  }

  async agregarPreguntaAMateria(materiaId: string, nuevaP: Pregunta) {
    const materia = this.obtenerMateriaPorId(materiaId);
    if (!materia) return;

    const existe = materia.preguntas.some(p => p.id === nuevaP.id);
    if (existe) return;

    // Preparamos el objeto completo actualizado
    const materiaActualizada = { ...materia, preguntas: [...materia.preguntas, nuevaP] };

    // Actualizamos toda la materia en la base de datos (reemplaza a la vieja)
    await db.materias.put(materiaActualizada);

    // Actualizamos el signal
    this.materiasSignal.update(state => state.map(m => m.id === materiaId ? materiaActualizada : m));
  }

  async eliminarPreguntaDeMateria(materiaId: string, preguntaId: string) {
    const materia = this.obtenerMateriaPorId(materiaId);
    if (!materia) return;

    const materiaActualizada = {
      ...materia,
      preguntas: materia.preguntas.filter(p => p.id !== preguntaId)
    };

    await db.materias.put(materiaActualizada);

    this.materiasSignal.update(materias => materias.map(m => m.id === materiaId ? materiaActualizada : m));
  }

  async actualizarPreguntaAMateria(materiaId: string, preguntaActualizada: Pregunta) {
    const materia = this.obtenerMateriaPorId(materiaId);
    if (!materia) return;

    const materiaActualizada = {
      ...materia,
      preguntas: materia.preguntas.map(p => p.id === preguntaActualizada.id ? preguntaActualizada : p)
    };

    await db.materias.put(materiaActualizada);

    this.materiasSignal.update(materias => materias.map(m => m.id === materiaId ? materiaActualizada : m));
  }

  async importarMateria(materiaJson: Materia) {
    const nuevaMateria: Materia = {
      ...materiaJson,
      id: materiaJson.id || 'mat-' + Date.now()
    };

    await db.materias.put(nuevaMateria);
    this.materiasSignal.update(materias => [...materias, nuevaMateria]);
  }

  // ==========================================
  // UTILIDADES (I/O DEL SISTEMA)
  // ==========================================

  async exportarMateria(materia: Materia) {
    const dataStr = JSON.stringify(materia, null, 2);
    const nombreArchivo = `materia_${materia.nombre.toLowerCase().replace(/\s+/g, '_')}.json`;

    // VERIFICAMOS LA PLATAFORMA
    if (Capacitor.getPlatform() !== 'web') {
      // --- LÓGICA PARA ANDROID / APK ---
      try {
        // 1. Escribimos el archivo en una carpeta temporal del celu (Cache)
        const result = await Filesystem.writeFile({
          path: nombreArchivo,
          data: dataStr,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });

        // 2. Usamos el plugin Share para que el usuario elija qué hacer con el archivo
        // Esto es mucho más cómodo en mobile que una descarga directa
        await Share.share({
          title: 'Exportar Materia',
          url: result.uri, // Usamos la URI nativa del archivo recién creado
          dialogTitle: 'Guardar o enviar archivo'
        });

      } catch (error) {
        console.error('Error exportando en Android:', error);
        alert('Error al intentar guardar el archivo en el dispositivo.');
      }

    } else {
      // --- LÓGICA PARA NAVEGADOR (WEB) ---
      // Mantenemos tu código actual que ya sabemos que funciona en PC
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  
}