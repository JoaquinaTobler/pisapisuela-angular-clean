import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-home',
  standalone: false,
  templateUrl: './order-home.component.html',
  styleUrl: './order-home.component.css'
})
export class OrderHomeComponent {

  constructor(private router: Router) {}

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
