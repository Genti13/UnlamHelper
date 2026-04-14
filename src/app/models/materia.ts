export interface Opcion {
  id: number;
  texto: string;
}

export interface Pregunta {
  id: string;
  tema: string;
  enunciado: string;
  opciones: Opcion[];
  correctaId: number;
}

export interface Materia {
  id: string;
  nombre: string;
  codigo: string;
  preguntas: Pregunta[];
}