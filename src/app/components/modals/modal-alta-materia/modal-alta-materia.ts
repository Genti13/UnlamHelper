import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MateriasService } from '../../../services/materias';
import { Materia } from '../../../models/materia';

@Component({
  selector: 'app-modal-alta-materia',
  standalone: true,
  imports: [ReactiveFormsModule], // <--- Clave para usar [formGroup] en el HTML
  templateUrl: './modal-alta-materia.html'
})
export class ModalAltaMateriaComponent {
  private fb = inject(FormBuilder);
  private materiasService = inject(MateriasService);
  activeModal = inject(NgbActiveModal);

  // Formulario reactivo
  formAlta = this.fb.group({
    nombre: ['', Validators.required],
    codigo: ['']
  });

  guardar() {
    if (this.formAlta.valid) {
      const nuevaMateria: Materia = {
        id: 'm-' + Date.now(),
        nombre: this.formAlta.value.nombre!,
        codigo: this.formAlta.value.codigo || '',
        preguntas: []
      };

      this.materiasService.agregarMateria(nuevaMateria);
      this.activeModal.close('Materia creada');
    } 
  }
}