import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { // <-- Revisa que diga 'AppComponent' aquí
  isLoggedIn: boolean = false; 
  userRole: string = 'guest';

  logout(): void {
    this.isLoggedIn = false;
    this.userRole = 'guest';
  }
}