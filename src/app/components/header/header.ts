import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAltaMateriaComponent } from '../modals/modal-alta-materia/modal-alta-materia';
import { MateriasService } from '../../services/materias';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

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
 
  async iniciarImportacion() {
    if (Capacitor.getPlatform() !== 'web') {
      // ======== MODO CELULAR (NATIVO) ========
      try {
        // 1. Abrimos el selector de archivos nativo
        const result = await FilePicker.pickFiles({
          // En Android, a veces 'types' con extensiones custom requiere poner el nombre del archivo
          // o usar un wildcard si el plugin no reconoce el mime.
          types: ['application/json']
        });

        const archivo = result.files[0];
        if (!archivo || !archivo.path) return;

        // 2. Leemos el archivo usando Filesystem de Capacitor
        const contenido = await Filesystem.readFile({
          path: archivo.path,
          encoding: Encoding.UTF8
        });

        // 3. Parseamos y guardamos
        const materiaJson = JSON.parse(contenido.data as string);

        await this.materiasService.importarMateria(materiaJson);
        alert('¡Materia importada con éxito!');

      } catch (error) {
        console.error('Error al importar en Android:', error);
        // El usuario pudo haber cancelado la selección, no siempre es un error crítico
      }

    } else {
      // ======== MODO WEB (NAVEGADOR) ========
      const input = document.createElement('input');
      input.type = 'file';

      // CAMBIO AQUÍ: Ahora solo aceptamos archivos .unlam
      input.accept = '.unlam';

      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        // Opcional: Una validación extra por si el usuario fuerza un archivo distinto
        if (!file.name.endsWith('.unlam')) {
          alert('Por favor, selecciona un archivo con extensión .unlam');
          return;
        }

        const reader = new FileReader();
        reader.onload = async (event: any) => {
          try {
            const materiaJson = JSON.parse(event.target.result);
            await this.materiasService.importarMateria(materiaJson);
            alert('¡Materia importada con éxito!');
          } catch (err) {
            alert('Error al procesar el archivo .unlam. Asegúrate de que el formato sea correcto.');
          }
        };
        reader.readAsText(file);
      };

      input.click();
    }
    // En eliminarMateria o importarMateria, después de la operación exitosa:
    this.materiasService.cargarMaterias();
  }
}