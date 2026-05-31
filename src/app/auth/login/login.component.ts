import { Component, NgZone, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { TiendaService } from '../../services/tienda.service';
import { Tienda } from '../../models/tienda.model';
import { ImagenPipe } from '../../pipes/imagen-pipe.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ImagenPipe
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public formSumitted = false;
  public auth2: any;

  loginForm: FormGroup;
  tiendaSelected!: Tienda;

  // Modernización con 'inject' para mayor limpieza
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private tiendaService = inject(TiendaService);
  private ngZone = inject(NgZone);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  ngOnInit() {
    this.usuarioService.getLocalStorage();
    this.escucharTiendaActiva();
  }

  // 🌟 CORRECCIÓN SAAS MULTI-TENANT:
  // Escuchamos en vivo la tienda activa que resolvió la URL sin peticiones HTTP extras
  escucharTiendaActiva() {
    this.tiendaService.selectedTiendaObservable$.subscribe(tienda => {
      if (tienda) {
        this.tiendaSelected = tienda;
        console.log('LoginComponent sincronizado con la tienda:', this.tiendaSelected.nombre);
      }
    });
  }

  login() {
    this.formSumitted = true;
    if (this.loginForm.invalid) { return; }

    this.usuarioService.login(this.loginForm.value).subscribe({
      next: (resp) => {
        if (this.loginForm.get('remember')?.value) {
          localStorage.setItem('email', this.loginForm.get('email')?.value);
        } else {
          localStorage.removeItem('email');
        }
        this.usuarioService.getLocalStorage();
        
        if (localStorage.getItem('user') !== 'undefined') {
          setTimeout(() => {
            this.router.navigateByUrl('/my-account');
          }, 500);
        } else {
          this.router.navigateByUrl('/login');
        }
      },
      error: (err) => {
        Swal.fire('Error', err.error.msg, 'error');
      }
    });
  }

  async startApp() {
    this.usuarioService.googleInit();
    this.auth2 = this.usuarioService.auth2;
  }
}
