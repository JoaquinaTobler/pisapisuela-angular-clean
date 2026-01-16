import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-home',
  standalone: false,
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.css'
})
export class ClientHomeComponent {

  constructor(private router: Router) {}

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
