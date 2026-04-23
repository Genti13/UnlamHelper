import { Injectable, signal } from '@angular/core';
import { Materia, Pregunta } from '../models/materia';
import { db } from '../repositories/app-database';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class MateriasService {
  materiasSignal = signal<Materia[]>([]);
  totalMaterias = signal<number>(0);
  paginaActual = signal<number>(1);
  itemsPorPagina = 10;

  materias = this.materiasSignal.asReadonly();

  constructor() {
    this.cargarMaterias();
  }

  // ==========================================
  // LECTURA Y PAGINACIÓN
  // ==========================================

  async cargarMaterias() {
    try {
      const total = await db.materias.count();
      this.totalMaterias.set(total);

      // Calculamos el máximo de páginas actual
      const maxPaginas = Math.ceil(total / this.itemsPorPagina);

      // REGLA: Si eliminamos el último de una página, saltamos a la anterior
      if (this.paginaActual() > maxPaginas && maxPaginas > 0) {
        this.paginaActual.set(maxPaginas);
      }

      const skip = (this.paginaActual() - 1) * this.itemsPorPagina;

      const materiasLocales = await db.materias
        .reverse()
        .offset(skip)
        .limit(this.itemsPorPagina)
        .toArray();

      this.materiasSignal.set(materiasLocales);
    } catch (error) {
      console.error('Error al cargar materias', error);
    }
  }

  cambiarPagina(nuevaPagina: number) {
    this.paginaActual.set(nuevaPagina);
    this.cargarMaterias();
  }

  // ==========================================
  // ESCRITURA (CON REGLAS DE PAGINACIÓN)
  // ==========================================

  async agregarMateria(materia: Materia) {
    // Forzamos ID único
    const nueva = { ...materia, id: 'mat-' + Date.now() };
    await db.materias.put(nueva);
    await this.cargarMaterias(); // Recargamos para respetar el límite de 10 por vista
  }

  async importarMateria(materiaJson: Materia) {
    const nuevaMateria: Materia = {
      ...materiaJson,
      id: 'mat-' + Date.now() // Forzamos ID nuevo siempre
    };

    await db.materias.put(nuevaMateria);
    
    // REGLA: Si hay menos de 10 en la pantalla, la agregamos visualmente. 
    // Si no, solo actualizamos el total (el usuario la verá al paginar).
    const totalActual = await db.materias.count();
    this.totalMaterias.set(totalActual);

    if (this.materiasSignal().length < this.itemsPorPagina) {
        this.materiasSignal.update(materias => [nuevaMateria, ...materias]);
    }
  }

  async eliminarMateria(id: string) {
    try {
      await db.materias.delete(id);
      // Al llamar a cargarMaterias, se aplica la lógica de saltar página si quedó vacía
      await this.cargarMaterias();
    } catch (error) {
      console.error('Error al eliminar', error);
    }
  }

  async editarMateria(materiaEditada: Materia) {
    try {
      await db.materias.put(materiaEditada);
      this.materiasSignal.update(materias =>
        materias.map(m => m.id === materiaEditada.id ? materiaEditada : m)
      );
    } catch (error) {
      console.error('Error al editar', error);
    }
  }

  // ==========================================
  // GESTIÓN DE PREGUNTAS
  // ==========================================

  async agregarPreguntaAMateria(materiaId: string, nuevaP: Pregunta) {
    const materia = await db.materias.get(materiaId);
    if (!materia) return;

    const materiaActualizada = { ...materia, preguntas: [...materia.preguntas, nuevaP] };
    await db.materias.put(materiaActualizada);
    this.refrescarMateriaEnSignal(materiaActualizada);
  }

  async eliminarPreguntaDeMateria(materiaId: string, preguntaId: string) {
    const materia = await db.materias.get(materiaId);
    if (!materia) return;

    const materiaActualizada = {
      ...materia,
      preguntas: materia.preguntas.filter(p => p.id !== preguntaId)
    };
    await db.materias.put(materiaActualizada);
    this.refrescarMateriaEnSignal(materiaActualizada);
  }

  async actualizarPreguntaAMateria(materiaId: string, preguntaActualizada: Pregunta) {
    const materia = await db.materias.get(materiaId);
    if (!materia) return;

    const materiaActualizada = {
      ...materia,
      preguntas: materia.preguntas.map(p => p.id === preguntaActualizada.id ? preguntaActualizada : p)
    };
    await db.materias.put(materiaActualizada);
    this.refrescarMateriaEnSignal(materiaActualizada);
  }

  private refrescarMateriaEnSignal(materia: Materia) {
    this.materiasSignal.update(state => state.map(m => m.id === materia.id ? materia : m));
  }

  // ==========================================
  // BÚSQUEDA Y UTILIDADES
  // ==========================================

  async buscarMateriasPorTexto(termino: string) {
    if (!termino.trim()) {
      await this.cargarMaterias();
      return;
    }

    const resultados = await db.materias
      .where('nombre').startsWithIgnoreCase(termino)
      .or('codigo').startsWithIgnoreCase(termino)
      .limit(10)
      .toArray();

    this.materiasSignal.set(resultados);
  }

  obtenerMateriaPorId(id: string): Materia | undefined {
    return this.materiasSignal().find(m => m.id === id);
  }

  async exportarMateria(materia: Materia) {
    const dataStr = JSON.stringify(materia, null, 2);
    const nombreArchivo = `materia_${materia.nombre.toLowerCase().replace(/\s+/g, '_')}.json`;

    if (Capacitor.getPlatform() !== 'web') {
      try {
        const result = await Filesystem.writeFile({
          path: nombreArchivo,
          data: dataStr,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });

        await Share.share({
          title: 'Exportar Materia',
          url: result.uri,
          dialogTitle: 'Guardar o enviar archivo'
        });
      } catch (error) {
        console.error('Error exportando en Android', error);
      }
    } else {
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