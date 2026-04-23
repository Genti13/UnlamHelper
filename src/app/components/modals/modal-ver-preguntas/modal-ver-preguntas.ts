import { Component, Input, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <--- CLAVE PARA EL BUSCADOR
import { MateriasService } from '../../../services/materias';
import { NgbActiveModal, NgbModal, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap'; // <--- Agregá NgbModal
import { ModalAltaPreguntaComponent } from '../modal-alta-pregunta/modal-alta-pregunta';
import { Pregunta } from '../../../models/materia';

@Component({
  selector: 'app-modal-ver-preguntas',
  standalone: true,
  imports: [FormsModule, NgbAccordionModule],
  templateUrl: 'modal-ver-preguntas.html',
  styleUrl: 'modal-ver-preguntas.css'
})
export class ModalVerPreguntasComponent {
  // Recibe el ID de la materia desde el MateriasListComponent
  @Input() materiaId!: string;

  activeModal = inject(NgbActiveModal);
  materiasService = inject(MateriasService);
  modalService = inject(NgbModal);

  // Signal que guarda lo que el usuario tipea
  filtroBusqueda = signal('');

  // Computado que busca la materia actual en la base de datos
  materiaActiva = computed(() => {
    return this.materiasService.obtenerMateriaPorId(this.materiaId);
  });

  // Computado que filtra las preguntas automáticamente cuando el usuario escribe
  preguntasFiltradas = computed(() => {
    const materia = this.materiaActiva();
    if (!materia) return [];

    const termino = this.filtroBusqueda().toLowerCase();

    // Si el buscador está vacío, devolvemos todas las preguntas
    if (!termino) return materia.preguntas;

    // Si hay texto, filtramos por tema o enunciado
    return materia.preguntas.filter(p =>
      p.tema.toLowerCase().includes(termino) ||
      p.enunciado.toLowerCase().includes(termino)
    );
  });

  // Borrar pregunta
  eliminarPregunta(preguntaId: string) {
    this.materiasService.eliminarPreguntaDeMateria(this.materiaId, preguntaId);
  }

  editarPregunta(pregunta: Pregunta) {
    const modalRef = this.modalService.open(ModalAltaPreguntaComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    // Pasamos el ID de la materia Y la pregunta a editar
    modalRef.componentInstance.materiaId = this.materiaId;
    modalRef.componentInstance.preguntaExistente = pregunta;
  }
}