import { Component, Input, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-modal-inicial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modal-inicial.component.html',
  styleUrl: './modal-inicial.component.scss'
})
export class ModalInicialComponent implements AfterViewInit {
  @Input() nombreSelected!:string;
  isLogued: boolean = false;

  private router = inject(Router);

  ngAfterViewInit() {
    const USER = localStorage.getItem("user");
    this.isLogued = USER ? true : false;
    // Check if dismissed
    if (localStorage.getItem('modalInicialDismissed')) {
      return;
    }
    // Auto open modal after DOM ready
    setTimeout(() => {
      const modalElement = document.getElementById('exampleModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 500);
  }

  onNoShowMore() {
    localStorage.setItem('modalInicialDismissed', 'true');
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
  onRegister() {
    // localStorage.setItem('modalInicialDismissed', 'true');
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.router.navigateByUrl('registro');
  }
}
