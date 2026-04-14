import { Routes } from '@angular/router';
import { MateriasListComponent } from './components/materias-list/materias-list';
import { SimuladorComponent } from './components/simulador/simulador';

export const routes: Routes = [
  // Si no hay nada en la URL, redirigimos a 'materias'
  { path: '', redirectTo: 'materias', pathMatch: 'full' },
  
  { path: 'materias', component: MateriasListComponent },
  { path: 'simular-examen/:id', component: SimuladorComponent }
];