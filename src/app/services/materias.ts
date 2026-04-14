import { Injectable, signal } from '@angular/core';
import { Materia, Pregunta } from '../models/materia';

const DATOS_SIMULADOS: Materia[] = [
  {
    id: 'm-101',
    nombre: 'Programación Web II',
    codigo: '2633 - Com: 01-2939',
    preguntas: [
      {
        id: 'p-101-1',
        tema: 'Angular',
        enunciado: '¿Qué decorador se utiliza para definir un componente en Angular?',
        correctaId: 2,
        opciones: [
          { id: 1, texto: '@Injectable' },
          { id: 2, texto: '@Component' },
          { id: 3, texto: '@Directive' },
          { id: 4, texto: '@Module' }
        ]
      },
      {
        id: 'p-101-2',
        tema: 'TypeScript',
        enunciado: '¿Cuál es el tipo de dato para manejar valores verdaderos o falsos?',
        correctaId: 1,
        opciones: [
          { id: 1, texto: 'boolean' },
          { id: 2, texto: 'string' },
          { id: 3, texto: 'number' }
        ]
      }
    ]
  },
  {
    id: 'm-102',
    nombre: 'Base de Datos',
    codigo: '2650 - Com: 01-3000',
    preguntas: [
      {
        id: 'p-102-1',
        tema: 'SQL',
        enunciado: '¿Qué comando se utiliza para extraer datos de una base de datos?',
        correctaId: 3,
        opciones: [
          { id: 1, texto: 'EXTRACT' },
          { id: 2, texto: 'PULL' },
          { id: 3, texto: 'SELECT' },
          { id: 4, texto: 'GET' }
        ]
      }
    ]
  },
  {
    id: 'm-103',
    nombre: 'Matemática Discreta',
    codigo: '1024 - Com: 02-1000',
    preguntas: [] // Materia sin preguntas para probar el "estado vacío"
  }
];

@Injectable({ providedIn: 'root' })
export class MateriasService {
  // El estado interno de tu aplicación
  private materiasSignal = signal<Materia[]>(DATOS_SIMULADOS);

  // Lo exponemos como Readonly para que los componentes lo lean pero no lo rompan
  materias = this.materiasSignal.asReadonly();

  agregarMateria(materia: Materia) {
    this.materiasSignal.update(state => [...state, materia]);
  }

  buscarMateria(id: string): Materia | undefined {
    return this.materiasSignal().find(m => m.id === id);
  }

  // src/app/core/services/materias.service.ts

  agregarPreguntaAMateria(materiaId: string, nuevaP: Pregunta) {
    this.materiasSignal.update(state => state.map(m => {
      if (m.id === materiaId) {
        const existe = m.preguntas.some(p => p.id === nuevaP.id);
        if (existe) return m;
        return { ...m, preguntas: [...m.preguntas, nuevaP] };
      }
      return m;
    }));
  }

  eliminarPreguntaDeMateria(materiaId: string, preguntaId: string) {
    this.materiasSignal.update(materias => materias.map(m => {
      if (m.id === materiaId) {
        return {
          ...m,
          preguntas: m.preguntas.filter(p => p.id !== preguntaId)
        };
      }
      return m;
    }));
  }

  actualizarPreguntaAMateria(materiaId: string, preguntaActualizada: Pregunta) {
    this.materiasSignal.update(materias => materias.map(m => {
      if (m.id === materiaId) {
        return {
          ...m,
          preguntas: m.preguntas.map(p =>
            p.id === preguntaActualizada.id ? preguntaActualizada : p
          )
        };
      }
      return m;
    }));
  }

  obtenerMateriaPorId(id: string): Materia | undefined {
    // Buscamos dentro del Signal el objeto que coincida con el ID
    return this.materiasSignal().find(m => m.id === id);
  }
}