import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAltaMateriaComponent } from '../modals/modal-alta-materia/modal-alta-materia';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private modalService = inject(NgbModal);

  abrirModalAlta() {
    this.modalService.open(ModalAltaMateriaComponent, { centered: true, backdrop: 'static' });
  }
}