import { Component, Input, OnInit, inject } from '@angular/core';
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
export class ModalAltaMateriaComponent implements OnInit {
  // 1. EL ATAJADOR: Recibe los datos cuando hacemos clic en "Editar"
  @Input() materiaAEditar?: Materia;

  private fb = inject(FormBuilder);
  private materiasService = inject(MateriasService);
  activeModal = inject(NgbActiveModal);

  // Formulario reactivo (agregué 'comision' para que quede completo)
  formAlta = this.fb.group({
    nombre: ['', Validators.required],
    codigo: [''],
    comision: ['']
  });

  // 2. EL RELLENO: Se ejecuta justo al abrirse el modal
  ngOnInit() {
    if (this.materiaAEditar) {
      this.formAlta.patchValue({
        nombre: this.materiaAEditar.nombre,
        codigo: this.materiaAEditar.codigo,
      });
    }
  }

  // 3. LA BIFURCACIÓN: Decide si hace un INSERT o un UPDATE
  guardar() {
    if (this.formAlta.valid) {
      const valores = this.formAlta.value;

      if (this.materiaAEditar) {
        // === MODO EDICIÓN ===
        const materiaEditada: Materia = {
          ...this.materiaAEditar, // Conserva el ID original y las preguntas que ya tenía
          nombre: valores.nombre!,
          codigo: valores.codigo || '',
          
        };

        this.materiasService.editarMateria(materiaEditada).then(() => {
          this.activeModal.close('Materia editada');
        });

      } else {
        // === MODO ALTA (Tu código original) ===
        const nuevaMateria: Materia = {
          id: 'mat-' + Date.now(),
          nombre: valores.nombre!,
          codigo: valores.codigo || '',
    
          preguntas: []
        };

        this.materiasService.agregarMateria(nuevaMateria).then(() => {
          this.activeModal.close('Materia creada');
        });
      }
    }
  }
}