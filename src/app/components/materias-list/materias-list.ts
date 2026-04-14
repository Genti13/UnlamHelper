import { Component, inject } from '@angular/core';
import { MateriasService } from '../../services/materias';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAltaPreguntaComponent } from '../modals/modal-alta-pregunta/modal-alta-pregunta';
import { ModalVerPreguntasComponent } from '../modals/modal-ver-preguntas/modal-ver-preguntas';
import { Router } from '@angular/router';

@Component({
  selector: 'app-materias-list',
  standalone: true,
  templateUrl: './materias-list.html',
  styleUrl: './materias-list.css'
})
export class MateriasListComponent {
  private router = inject(Router);
  materiasService = inject(MateriasService);
  private modalService = inject(NgbModal);

  abrirModalAltaPregunta(materiaId: string) {
    const modalRef = this.modalService.open(ModalAltaPreguntaComponent, { size: 'lg', backdrop: 'static' });
    // Le pasamos el ID al modal antes de que se dibuje
    modalRef.componentInstance.materiaId = materiaId;
  }

  abrirModalVerPreguntas(materiaId: string) {
    const modalRef = this.modalService.open(ModalVerPreguntasComponent, { size: 'lg', scrollable: true });
    // Le pasamos el ID al modal antes de que se dibuje
    modalRef.componentInstance.materiaId = materiaId;
  }
  
  irASimulacion(materiaId: string) {
    this.router.navigate(['/simular-examen', materiaId]);
  }
}