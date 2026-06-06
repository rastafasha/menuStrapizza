import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Reservacion } from '../../../../models/reservacion.model';
import { AuthService } from '../../../../services/auth.service';
import { ReservacionService } from '../../../../services/reservacion.service';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
declare var bootstrap: any;
@Component({
  selector: 'app-reserva-crear',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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

  info_crear_presupuesto = `
  <p>En esta sección :</p>
          <ul>
            <li>Podrás crear y editar el presupuesto para cada uno de tus pacientes</li>
            <li>Encuentra el paciente por número de cédula, si existe se llenarán los campos </li>
            <li>Con el botón Reset, puedes borrar la info que trae el botón de filtro y los campos y rehacer una busqueda</li>
            <li>Tienes el campo descripción o motivo del presupuesto</li>
            <li>El Diagnostico u observación </li>
            <li>En los campos: Item, Cantidad y Precio, podras colocar los costos de cada valor para sumarlos a la lista</li>
            <li>El sistema te mostrará una tabla con la información recibida costos y cantidades</li>
            <li>El sistema se encargará de hacer la suma total</li>
            <li>Al Pulsar Guardar se compartirá esta información en la App Versión Paciente, así tendran un archivo para poder consultarlo a futuro</li>
          </ul>`;

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
      this.pageTitle = 'Editando Reservacion';
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
      this.pageTitle = 'Editando Reservacion';
    } else {
      this.isEditing = false;
      this.pageTitle = 'Creando Reservacion';
    }
    this.isLoading = false;
  }


  onClose() {
    this.reservacionSeleccionado = null;
    this.reservaForm.reset();
    this.pageTitle = 'Creando Presupuesto';
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
