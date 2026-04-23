import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header";
import { MateriasService } from './services/materias';
import { SendIntent } from 'send-intent';
import { Filesystem, Encoding } from '@capacitor/filesystem';
import { App as CapacitorApp } from '@capacitor/app'; // Importamos el plugin App de Capacitor

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private materiasService = inject(MateriasService);
  protected readonly title = signal('unlamHelper');

  ngOnInit() {
    // 1. Caso A: La app se abre "de cero" mediante un archivo (SendIntent)
    this.escucharArchivosExternos();

    // 2. Caso B: La app ya estaba abierta en segundo plano
    CapacitorApp.addListener('appUrlOpen', async (data: any) => {
      if (data.url) {
        await this.procesarArchivoExterno(data.url);
      }
    });
  }

  escucharArchivosExternos() {
    // Solo se ejecuta en Android/iOS
    SendIntent.checkSendIntentReceived().then((result: any) => {
      if (result && result.url) {
        this.procesarArchivoExterno(result.url);
      }
    });
  }

  async procesarArchivoExterno(rutaUrl: string) {
    try {
      // Usamos Capacitor Filesystem para leer el archivo desde esa URL nativa (content://)
      const contenido = await Filesystem.readFile({
        path: rutaUrl,
        encoding: Encoding.UTF8
      });

      const materiaJson = JSON.parse(contenido.data as string);
      await this.materiasService.importarMateria(materiaJson);
      
      alert(`¡Materia "${materiaJson.nombre}" importada exitosamente!`);

    } catch (error) {
      console.error('Error procesando el archivo externo:', error);
      alert('Hubo un error al intentar abrir este archivo.');
    }
  }
}