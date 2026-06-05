import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../../../models/usuario.model';
import { ComentarioService } from '../../../../services/comentario.service';
import { TiendaService } from '../../../../services/tienda.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { Tienda } from '../../../../models/tienda.model';
import { ToastrService } from 'ngx-toastr';
declare var $: any;
declare var bootstrap: any;
@Component({
  selector: 'app-modalComentarios',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './modalComentarios.component.html',
  styleUrls: ['./modalComentarios.component.css']
})
export class ModalComentariosComponent implements OnInit {
  @ViewChild('modalContenedor', { static: false }) modalContenedor!: ElementRef;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Input() item: any;
  @Input() local: any;

  msm_error_review: string = '';
  msm_error_cancelar: string = '';
  public id_review_producto!: string;
  public review_comentario = '';
  public review_pros = '';
  public review_cons = '';
  public review_estrellas = '';
  public select_detalle = '';
  private bModal: any;
  identity!: any;
  public reviewForm!: FormGroup;

  constructor(
    public fb: FormBuilder,
    private _comentarioService: ComentarioService,
    public toastr: ToastrService
  ) {
    let USER = localStorage.getItem('user');
    if (USER) {
      this.identity = JSON.parse(USER);
    }
  }

  ngOnInit() {
    this.validarFormulario();
  }

  validarFormulario() {
    this.reviewForm = this.fb.group({

      comentario: [''],
      estrellas: [''],
      pros: [''],
      cons: [''],
      producto: [''],
      user: [''],
      local: [''],
    })
  }

  saveComent() {

     if (!this.reviewForm.valid) {
      //mostramos las alertas de los campos requeridos
      this.reviewForm.markAllAsTouched(); // Esto activa las validaciones visuales
      return
    }
   const data = {
        ... this.reviewForm.value,
        local: this.local,
        user: this.identity.uid,
        producto: this.item.producto._id
      }

      this._comentarioService.registro(data).subscribe(
        (resp: any) => {
          this.toastr.success('Gracias por tus Comentarios!');
          this.onClose();
        },
        error => {
          this.msm_error_review = error.error.message;
        }
      );
  }

  close_alert() {
    this.msm_error_review = '';
    this.msm_error_cancelar = '';
  }


  onClose() {
    this.closeAndCleanup();
    this.closeModal.emit();
  }

  // Función auxiliar para no repetir el código de limpieza de Bootstrap
  private closeAndCleanup() {
    const modalElement = document.getElementById('editCommentModal') as HTMLElement;
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

}