import Dexie, { Table } from 'dexie';

import { Materia } from '../models/materia'; 

export class AppDB extends Dexie {
  // Declaramos la tabla. El primer parámetro es el modelo (Materia)
  // El segundo es el tipo de la clave primaria (string para tu 'm-102')
  materias!: Table<Materia, string>;

  constructor() {
    super('UnlamHelperDB');
    
    // Definimos el esquema de la base de datos.
    // SOLO indexamos lo que vamos a usar para buscar (id, nombre, codigo).
    // NO hace falta indexar el array de preguntas, Dexie lo guarda entero igual.
    this.version(1).stores({
      materias: 'id, nombre, codigo' 
    });
  }
}

// Exportamos una única instancia para usar en toda la app
export const db = new AppDB();