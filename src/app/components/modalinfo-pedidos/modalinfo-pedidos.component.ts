import { Component } from '@angular/core';

@Component({
  selector: 'app-modalinfo-pedidos',
  imports: [],
  templateUrl: './modalinfo-pedidos.component.html',
  styleUrl: './modalinfo-pedidos.component.scss'
})
export class ModalinfoPedidosComponent {

  ngAfterViewInit() {
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

}
