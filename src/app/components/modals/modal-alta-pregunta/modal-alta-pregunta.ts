import { Component, Input, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MateriasService } from '../../../services/materias';
import { Pregunta } from '../../../models/materia';

@Component({
  selector: 'app-modal-alta-pregunta',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modal-alta-pregunta.html',
  styleUrl: './modal-alta-pregunta.css'
})
export class ModalAltaPreguntaComponent implements OnInit {
  @Input() materiaId!: string;
  @Input() preguntaExistente?: Pregunta; // Si viene, estamos en modo EDICIÓN

  private fb = inject(FormBuilder);
  private materiasService = inject(MateriasService);
  activeModal = inject(NgbActiveModal);
  enviando = false;

  formPregunta: FormGroup;

  constructor() {
    this.formPregunta = this.fb.group({
      tema: ['', Validators.required],
      enunciado: ['', Validators.required],
      correctaId: [1],
      opciones: this.fb.array([
        this.crearOpcionForm(1)
      ])
    });
  }

  ngOnInit() {
    // Si detectamos que es una edición, parchamos el formulario
    if (this.preguntaExistente) {
      this.cargarDatosEdicion();
    }
  }

  get opcionesArray(): FormArray {
    return this.formPregunta.get('opciones') as FormArray;
  }

  private crearOpcionForm(id: number, texto: string = ''): FormGroup {
    return this.fb.group({
      id: [id],
      texto: [texto, Validators.required]
    });
  }

  private cargarDatosEdicion() {
    if (!this.preguntaExistente) return;

    // Seteamos los campos básicos
    this.formPregunta.patchValue({
      tema: this.preguntaExistente.tema,
      enunciado: this.preguntaExistente.enunciado,
      correctaId: this.preguntaExistente.correctaId
    });

    // Limpiamos el array por defecto y cargamos las opciones reales
    this.opcionesArray.clear();
    this.preguntaExistente.opciones.forEach(opc => {
      this.opcionesArray.push(this.crearOpcionForm(opc.id, opc.texto));
    });
  }

  agregarOpcion() {
    if (this.opcionesArray.length < 5) {
      const nuevoId = this.opcionesArray.length + 1;
      this.opcionesArray.push(this.crearOpcionForm(nuevoId));
    }
  }

  borrarOpcion(index: number) {
    const idABorrar = this.opcionesArray.at(index).get('id')?.value;
    const idCorrectoActual = this.formPregunta.get('correctaId')?.value;

    this.opcionesArray.removeAt(index);

    this.opcionesArray.controls.forEach((ctrl, i) => {
      ctrl.get('id')?.setValue(i + 1);
    });

    if (idABorrar === idCorrectoActual) {
      this.formPregunta.get('correctaId')?.setValue(1);
    } else if (idCorrectoActual > idABorrar) {
      this.formPregunta.get('correctaId')?.setValue(idCorrectoActual - 1);
    }
  }

  // MÉTODO NUEVO: Para eliminar la pregunta completa
  eliminar() {
    if (this.preguntaExistente && confirm('¿Estás seguro de que querés eliminar esta pregunta?')) {
      this.enviando = true;
      this.materiasService.eliminarPreguntaDeMateria(this.materiaId, this.preguntaExistente.id);
      this.activeModal.close('Pregunta eliminada');
    }
  }

  guardar() {
    if (this.formPregunta.valid && !this.enviando) {
      this.enviando = true;
      const formValue = this.formPregunta.value;

      const dataPregunta: Pregunta = {
        // Si editamos mantenemos el ID, si no creamos uno nuevo
        id: this.preguntaExistente ? this.preguntaExistente.id : 'p-' + Date.now(),
        tema: formValue.tema,
        enunciado: formValue.enunciado,
        correctaId: Number(formValue.correctaId),
        opciones: formValue.opciones
      };

      if (this.preguntaExistente) {
        // Lógica de Edición
        this.materiasService.actualizarPreguntaAMateria(this.materiaId, dataPregunta);
      } else {
        // Lógica de Alta
        this.materiasService.agregarPreguntaAMateria(this.materiaId, dataPregunta);
      }

      this.activeModal.close('Pregunta procesada correctamente');
    }
  }
}