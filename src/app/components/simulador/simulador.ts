import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MateriasService } from '../../services/materias';
import { Pregunta } from '../../models/materia';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-simular-examen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simulador.html',
  styleUrl: './simulador.css'
})
export class SimuladorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private materiasService = inject(MateriasService);

  materiaNombre = signal('');
  preguntasExamen = signal<Pregunta[]>([]);
  respuestasUsuario: { [preguntaId: string]: number } = {}; // Guardamos ID de pregunta -> ID de opción elegida
  
  resultado = signal<{ correcta: number, total: number } | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const materia = this.materiasService.obtenerMateriaPorId(id);
      if (materia) {
        this.materiaNombre.set(materia.nombre);
        // Lógica de 15 preguntas: Mezclamos y tomamos 15
        const seleccionadas = [...materia.preguntas]
          .sort(() => Math.random() - 0.5)
          .slice(0, 15);
        this.preguntasExamen.set(seleccionadas);
      }
    }
  }

  finalizarExamen() {
    let correctas = 0;
    const preguntas = this.preguntasExamen();

    preguntas.forEach(p => {
      if (this.respuestasUsuario[p.id] === p.correctaId) {
        correctas++;
      }
    });

    this.resultado.set({
      correcta: correctas,
      total: preguntas.length
    });

    // Hacemos scroll arriba para ver el resultado
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  volver() {
    this.router.navigate(['/materias']);
  }
}