import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAltaMateriaComponent } from '../modals/modal-alta-materia/modal-alta-materia';
import { MateriasService } from '../../services/materias';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private modalService = inject(NgbModal);
  private materiasService = inject(MateriasService);

  abrirModalAlta() {
    this.modalService.open(ModalAltaMateriaComponent, { centered: true, backdrop: 'static' });
  }

  async importarMateria() {
    try {
      // Esto abre el selector nativo del sistema operativo directamente
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'Archivos JSON de Materias',
          accept: { 'application/json': ['.json'] }
        }],
        multiple: false
      });

      const file = await fileHandle.getFile();
      const contenidoStr = await file.text();
      const contenido = JSON.parse(contenidoStr);

      if (contenido.nombre && Array.isArray(contenido.preguntas)) {
        this.materiasService.importarMateria(contenido);
        alert('¡Materia importada con éxito!');
      }
    } catch (err) {
      // Si el usuario cancela la selección, entra por acá
      console.log('Selección cancelada o error:', err);
    }
  }
}