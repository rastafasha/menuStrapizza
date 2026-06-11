import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Reservacion } from '../../../../models/reservacion.model';
import { AuthService } from '../../../../services/auth.service';
import { ReservacionService } from '../../../../services/reservacion.service';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { TranslatePipe } from '@ngx-translate/core';
declare var bootstrap: any;
@Component({
  selector: 'app-reserva-crear',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './reserva-crear.component.html',
  styleUrl: './reserva-crear.component.scss'
})
export class ReservaCrearComponent {

  @Input() reservacionSeleccionado!: any;
  @Input() tiendaSelected!: any;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Output() refreshPostList: EventEmitter<void> = new EventEmitter<void>();

  public reservaForm!: FormGroup;
  public presupuesto!: Reservacion;
  pageTitle!: string;
  public medical: any = [];
  description: any;
  name_medical: any;
  precio!: number;
  cantidad!: number;
  amount = 0;
  user: any;
  presupuesto_id!: string;
  isLoading = false;
  isEditing = false;
  public clientes: any = [];
  usuarioSelected: any;
  cliente: any;
  mostrarComentario: boolean = false;



  constructor(
    public reservacionService: ReservacionService,
    public authService: AuthService,
    public router: Router,
    public toastr: ToastrService,
    public fb: FormBuilder,
  ) {
    this.user = this.authService.getLocalStorage();
  }

  ngOnInit() {
    this.validarFormulario();
    this.getClientesbyuser();
  }
  getClientesbyuser() {
    this.isLoading = true;

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = true;

    if (
      changes['reservacionSeleccionado'] &&
      changes['reservacionSeleccionado'].currentValue
    ) {
      this.pageTitle = 'Editando Reservación';
      const presupuesto = changes['reservacionSeleccionado'].currentValue;
      
      this.reservaForm.patchValue({
        id: presupuesto._id,
        fecha: presupuesto.fecha,
        personas: presupuesto.personas,
        listaespera: presupuesto.listaespera,
        first_name: presupuesto.first_name,
        last_name: presupuesto.last_name,
        email: presupuesto.email,
        telefono: presupuesto.telefono,
        comensal_alergia: presupuesto.comensal_alergia,
        comentarios_alergia: presupuesto.comentarios_alergia,
        comentarios: presupuesto.comentarios,
        observaciones: presupuesto.observaciones,
        status: presupuesto.status,
        local: presupuesto.local,
      });
      this.reservacionSeleccionado = presupuesto;
      this.isEditing = true;
      this.pageTitle = 'Editando Reservación';
    } else {
      this.isEditing = false;
      this.pageTitle = 'Creando Reservación';
    }
    this.isLoading = false;
  }


  onClose() {
    this.reservacionSeleccionado = null;
    this.reservaForm.reset();
    this.pageTitle = 'Creando Reservación';
    // Also reset default values if needed
    this.reservaForm.patchValue({
      id: null,
      fecha: null,
      personas: null,
      hora: null,
      listaespera: null,
      first_name: null,
      last_name: null,
      email: null,
      telefono: null,
      comensal_alergia: null,
      comentarios_alergia: null,
      comentarios: null,
      status: null,
    });
    // Emit event to parent to reset the projectSeleccionado variable

    this.closeModal.emit();
  }

  validarFormulario() {
    this.reservaForm = this.fb.group({
      fecha: [''],
      personas: [''],
      hora: [''],
      listaespera: [''],
      first_name: [''],
      last_name: [''],
      email: [''],
      telefono: [''],
      comensal_alergia: [''],
      comentarios_alergia: [''],
      comentarios: [''],
      status: ['Pendiente'],
      local: [''],
    })
  }


toggleComentario(event: Event): void {
    event.preventDefault();
    this.mostrarComentario = !this.mostrarComentario;
  }

  onSubmit() {
    if (!this.reservaForm.valid) {
      //mostramos las alertas de los campos requeridos
      this.reservaForm.markAllAsTouched(); // Esto activa las validaciones visuales
      return
    }
    const data = {
      ... this.reservaForm.value,
      local: this.tiendaSelected._id,
      status: 'Pendiente',
    }

    if (this.reservacionSeleccionado) {
      this.reservacionService.actualizarReservacion(data, this.reservacionSeleccionado._id).subscribe((resp: any) => {
        console.log(data);
        if (resp.message == 403) {
          this.toastr.error('Error Creando Reservación', 'Error');

        } else {
          this.toastr.success('Se guardó la informacion del Reservación', 'Éxito');
          // Close modal programmatically
          const modalElement = document.getElementById('add_reserva');
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();

          }
          // Emit event to refresh project list
          this.refreshPostList.emit();
          this.ngOnInit()
        }
      })
    } else {
      this.reservacionService.crearReservacion(data).subscribe((resp: any) => {
        if (resp.message == 403) {
          this.toastr.error('Error Creando Reservación', 'Error');

        } else {
          this.toastr.success('Se guardó la informacion del Reservación', 'Éxito');
          // Close modal programmatically
          const modalElement = document.getElementById('add_reserva');
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();

          }
          // Emit event to refresh project list
          this.refreshPostList.emit();
          this.onClose();
          this.router.navigateByUrl('/reservaciones')
        }
      })
    }
  }

}
