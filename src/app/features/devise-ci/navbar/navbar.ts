import { CommonModule  } from '@angular/common';
import { Component,Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  @Input() currentPage = 'converter';

  // dark mode reçu du parent
  @Input() darkMode = false;

  // événements émis vers le parent
  @Output() pageChange = new EventEmitter<string>();
  @Output() darkModeToggle = new EventEmitter<void>();

  isMenuOpen = false;
  navItems = [
    { key: 'converter', label: 'Convertir' },
    { key: 'rates', label: 'Taux en direct' },
    { key: 'history', label: 'Historique' },
    { key: 'about', label: 'A propos' },
  ];

  navigate(page: string): void {
    this.pageChange.emit(page);
  }

  toggleDark(): void {
    this.darkModeToggle.emit();
  }



toggleMenu(): void {
  this.isMenuOpen = !this.isMenuOpen;
}

}
