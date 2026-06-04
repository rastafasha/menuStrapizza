import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-instrucciones',
  imports: [CommonModule],
  templateUrl: './modal-instrucciones.component.html',
  styleUrl: './modal-instrucciones.component.scss'
})
export class ModalInstruccionesComponent {

  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Input() displaycomponent: string = 'block';
  @Input() info!: string;
  @Input() sectionId!: string; 
  isLogued: boolean = false;

  ngAfterViewInit() {
    const USER = localStorage.getItem("user");
    this.isLogued = !!USER;

    // USAMOS EL ID DE LA SECCIÓN PARA COMPROBAR
    if (localStorage.getItem(`modalDismissed_${this.sectionId}`)) {
      return;
    }

    setTimeout(() => {
      const modalElement = document.getElementById('infoModal') as HTMLElement;
      if (modalElement) {
        const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalElement) || 
                               new (window as any).bootstrap.Modal(modalElement);
        bootstrapModal.show();
      }
    }, 500);
  }

  onNoShowMore() {
    // GUARDAMOS CON EL ID ESPECÍFICO
    localStorage.setItem(`modalDismissed_${this.sectionId}`, 'true');
    this.closeAndCleanup();
  }

  onClose() {
    this.closeAndCleanup();
    this.closeModal.emit();
  }

  // Función auxiliar para no repetir el código de limpieza de Bootstrap
  private closeAndCleanup() {
    const modalElement = document.getElementById('infoModal') as HTMLElement;
    if (modalElement) {
      const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
      if (bootstrapModal) bootstrapModal.hide();
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowX = 'auto';
  }

  // Método público para abrir el modal manualmente (ignorando el bloqueo)
  public open() {
    setTimeout(() => {
      const modalElement = document.getElementById('infoModal') as HTMLElement;
      if (modalElement) {
        const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalElement) || 
                               new (window as any).bootstrap.Modal(modalElement);
        bootstrapModal.show();
      }
    }, 100);
  }

}
