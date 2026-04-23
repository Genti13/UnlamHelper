import { Component, inject } from '@angular/core';
import { MateriasService } from '../../services/materias';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAltaPreguntaComponent } from '../modals/modal-alta-pregunta/modal-alta-pregunta';
import { ModalVerPreguntasComponent } from '../modals/modal-ver-preguntas/modal-ver-preguntas';
import { ModalAltaMateriaComponent } from '../modals/modal-alta-materia/modal-alta-materia';
import { Router } from '@angular/router';
import { Materia } from '../../models/materia';
import { ModalConfirmarEliminacionComponent } from '../modals/modal-eliminar-materia/modal-eliminar-materia';


@Component({
  selector: 'app-materias-list',
  standalone: true,
  templateUrl: 'materias-list.html',
  styleUrl: 'materias-list.css'
})
export class MateriasListComponent {
  private router = inject(Router);
  materiasService = inject(MateriasService);
  private modalService = inject(NgbModal);

  abrirModalEditar(materia: Materia) {
    // Abrimos el MISMO modal que usamos para el Alta
    const modalRef = this.modalService.open(ModalAltaMateriaComponent, { centered: true, backdrop: 'static' });

    // Le pasamos la materia actual a una variable del componente del modal
    modalRef.componentInstance.materiaAEditar = materia;
  }

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

  exportarMateria(materia: Materia) {
    this.materiasService.exportarMateria(materia);
  }

  eliminarMateria(materia: Materia) {
    // 1. Abrimos el modal personalizado
    const modalRef = this.modalService.open(ModalConfirmarEliminacionComponent, {
      centered: true,
      backdrop: 'static' // Evita que se cierre haciendo clic afuera por accidente
    });

    // 2. Le pasamos el nombre de la materia al modal
    modalRef.componentInstance.nombreElemento = materia.nombre;

    // 3. Esperamos la respuesta del usuario (Promesa)
    modalRef.result.then((resultado) => {
      // Si entra acá, es porque hizo clic en "Sí, eliminar" (activeModal.close(true))
      if (resultado === true) {
        this.materiasService.eliminarMateria(materia.id!)
          .then(() => {
            console.log('Materia eliminada exitosamente');
            // Acá a futuro podrías meter un Toastr de "Eliminado"
          })
          .catch(err => {
            console.error(err);
            alert('Hubo un error al intentar eliminar la materia.');
          });
      }

      // En eliminarMateria o importarMateria, después de la operación exitosa:
      this.materiasService.cargarMaterias();
    }).catch((razon) => {
      // Si entra acá, es porque hizo clic en "Cancelar", en la X, o apretó ESC.
      // No hacemos nada, simplemente el modal se cierra.
      console.log('Eliminación cancelada:', razon);
    });
  }

  onBuscarMateria(event: any) {
    const termino = event.target.value;
    // Llamamos a la función asíncrona del servicio
    this.materiasService.buscarMateriasPorTexto(termino);
  }


}