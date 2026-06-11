import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Direccion } from '../../../models/direccion.model';
import { DireccionService } from '../../../services/direccion.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Pais } from '../../../models/pais.model';
import { LoadingComponent } from "../../../shared/loading/loading.component";
import { AvisoComponent } from "../../../shared/aviso/aviso.component";
import { HeaderComponent } from "../../../shared/header/header.component";
import { AsideCuentaComponent } from "../aside-cuenta/aside-cuenta.component";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  imports: [
    LoadingComponent,
    CommonModule, 
    RouterModule,
    AvisoComponent, 
    HeaderComponent, 
    AsideCuentaComponent,
    TranslatePipe
  ],
    styleUrls: ['./direcciones.component.scss']
})
export class DireccionesComponent implements OnInit {

public url:any;
  public paises!:Pais;
  public data_paises : any = [];
  public direccion!: Direccion;
  public msm_error = false;
  public msm_success = false;
  public direcciones! : Direccion[];
  public direccion_data : any = {};
  public msm_success_dos = false;
  public isLoading = false;

  public direccionForm!: FormGroup;
  pageTitle!:string;
  usuarioId!:any;
  identity!:any;

  public modalAbierto: string | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private _direccionService: DireccionService,
    private _router : Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    let USER = localStorage.getItem('user');
    if(USER){
      this.identity = JSON.parse(USER);
      this.direccion_data = {};
      this.usuarioId = this.identity.uid;
      this.url = environment.baseUrl;

      // this.http.get('https://restcountries.com/v2/all').subscribe(
      //   data => {

      //     this.paises = data;
      //     this.paises.forEach(element => {
      //         this.data_paises.push(element.nativeName);

      //     });

      //   }
      // );
      setTimeout(()=>{
        this.listar();
      }, 1000);

    }else{
      this._router.navigate(['/']);
    }

  }

  listar(){
    this.isLoading = true
    this._direccionService.listarUsuario(this.usuarioId).subscribe(
      response =>{
        this.direcciones = response.direcciones;
        this.isLoading = false
      },
      error=>{

      }
    );
  }



  close_alert(){
    this.msm_error = false;
    this.msm_success = false;
    this.msm_success_dos = false;
  }






   // Modal control methods - Angular way (no jQuery needed)
  abrirModal(id: string): void {
    this.modalAbierto = id;
  }

  cerrarModal(): void {
    this.modalAbierto = null;
  }

  eliminar(id:any){
    this._direccionService.eliminar(id).subscribe(
      response=>{
        this.cerrarModal();
        this.listar();
      },
      error=>{
        this.cerrarModal();
      }
    );
  }

  

}
