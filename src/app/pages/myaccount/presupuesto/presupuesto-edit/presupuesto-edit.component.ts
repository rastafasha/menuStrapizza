import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Presupuesto } from '../../../../models/presupuesto';
import { AuthService } from '../../../../services/auth.service';
import { PresupuestoService } from '../../../../services/presupuesto.service';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from '../../../../shared/header/header.component';
import { ListaCastingComponent } from '../components/lista-casting/lista-casting.component';
import { Producto } from '../../../../models/producto.model';
declare var bootstrap: any;

@Component({
  selector: 'app-presupuesto-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoadingComponent,
    TranslatePipe,
    ListaCastingComponent,
    HeaderComponent
  ],
  templateUrl: './presupuesto-edit.component.html',
  styleUrl: './presupuesto-edit.component.scss'
})
export class PresupuestoEditComponent implements OnInit, OnChanges {
  @Input() presupuestoSeleccionado!: any;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Output() refreshPostList: EventEmitter<void> = new EventEmitter<void>();
  @Output() refreshCasProducts: EventEmitter<void> = new EventEmitter<void>();

  activeCategory!: string;

  public presupuestoForm!: FormGroup;
  public presupuesto!: Presupuesto;
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
  public data_detalle: Array<any> = [];
  bandejaList: Producto[] = [];
  isbandejaList = false;
  subtotal = 0;
  public expressForm!: FormGroup;

  constructor(
    public presupuestoService: PresupuestoService,
    public authService: AuthService,
    public router: Router,
    public toastr: ToastrService,
    public fb: FormBuilder,
  ) {
    this.user = this.authService.getLocalStorage();
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.validarFormulario();
    this.loadBandejaListFromLocalStorage();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = true;

    if (
      changes['presupuestoSeleccionado'] &&
      changes['presupuestoSeleccionado'].currentValue
    ) {
      this.pageTitle = 'Editando Presupuesto';
      const presupuesto = changes['presupuestoSeleccionado'].currentValue;
      this.cliente = presupuesto.cliente?.uid || presupuesto.cliente || '';
      this.amount = presupuesto.amount || presupuesto.amount || '';
      this.medical = presupuesto.listItems || presupuesto.listItems || '';

      this.presupuestoForm.patchValue({
        id: presupuesto._id,
        title: presupuesto.title,
        description: presupuesto.description,
        amount: this.amount,
        status: presupuesto.status,
        cliente: this.cliente,
        medical: this.medical,
        usuario: this.user.uid,
      });
      this.presupuestoSeleccionado = presupuesto;
      this.isEditing = true;
      this.pageTitle = 'Editando Presupuesto';
    } else {
      this.isEditing = false;
      this.pageTitle = 'Creando Presupuesto';
    }
    this.isLoading = false;
  }


  onClose() {
    this.presupuestoSeleccionado = null;
    this.presupuestoForm.reset();
    this.pageTitle = 'Creando Presupuesto';
    // Also reset default values if needed
    this.presupuestoForm.patchValue({
      id: null,
      title: null,
      description: null,
      amount: null,
      status: null,
      fechaEvento: null,
      cantidadPersonas: null,
      listItems: [],
    });
    // Emit event to parent to reset the projectSeleccionado variable

    this.closeModal.emit();
  }

  validarFormulario() {
    this.presupuestoForm = this.fb.group({
      title: [''],
      surname: [''],
      status: [''],
      fechaEvento: [''],
      cantidadPersonas: [''],
      description: [''],
    })
  }


  clienteSelected(documentId: any) {
    this.usuarioSelected = documentId;
  }

 
  loadBandejaListFromLocalStorage() {
    const storedItems = localStorage.getItem('castingItems');
    if (storedItems) {
      this.bandejaList = JSON.parse(storedItems);

    }
    if (this.bandejaList.length > 0) {
      this.isbandejaList = true;
    }

    this.bandejaList;
    this.subtotal = 0;
    this.bandejaList.forEach(element => {
      this.subtotal = Math.round(this.subtotal + (element.precio_ahora * element.cantidad));
      this.data_detalle.push({
        producto: element,
        cantidad: element.cantidad,
        precio: Math.round(element.precio_ahora),
        color: '#fff',
        selector: 'unico'
      })
      // console.log(this.bandejaList);

    });
  }



  save() {
    if (!this.presupuestoForm.valid) {
      //mostramos las alertas de los campos requeridos
      this.presupuestoForm.markAllAsTouched(); // Esto activa las validaciones visuales
      return
    }
    const data = {
      title: this.presupuestoForm.value.title,
      description: this.presupuestoForm.value.description,
      cliente: this.usuarioSelected,
      usuario: this.user.uid,
      pedidoList: this.bandejaList,
      amount: this.amount,
      status: 'PENDING',
    }

    if (this.presupuestoSeleccionado) {
      this.presupuestoService.editPresupuesto(data, this.presupuestoSeleccionado._id).subscribe((resp: any) => {
        console.log(data);
        if (resp.message == 403) {
          this.toastr.error('Error Creando Presupuesto', 'Error');

        } else {
          this.toastr.success('Se guardó la informacion del Presupuesto', 'Éxito');
          // Close modal programmatically
          const modalElement = document.getElementById('add_presupuesto');
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
      this.presupuestoService.createPresupuesto(data).subscribe((resp: any) => {
        if (resp.message == 403) {
          this.toastr.error('Error Creando Presupuesto', 'Error');

        } else {
          this.toastr.success('Se guardó la informacion del Presupuesto', 'Éxito');
          // Close modal programmatically
          const modalElement = document.getElementById('add_presupuesto');
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();

          }
          // Emit event to refresh project list
          this.refreshPostList.emit();
          this.onClose()
        }
      })
    }
  }

  

}
