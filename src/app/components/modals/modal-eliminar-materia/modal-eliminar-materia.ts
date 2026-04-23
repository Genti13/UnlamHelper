import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-confirmar-eliminacion',
  standalone: true,
  templateUrl: 'modal-eliminar-materia.html'
})
export class ModalConfirmarEliminacionComponent {
  // Recibimos el nombre para personalizar el mensaje
  @Input() nombreElemento!: string;

  activeModal = inject(NgbActiveModal);

  confirmar() {
    // Si el usuario acepta, cerramos el modal y enviamos un "true" o un string de confirmación
    this.activeModal.close(true);
  }

  cancelar() {
    // Si cancela o toca la X, desestimamos el modal
    this.activeModal.dismiss('Cancelado');
  }
}