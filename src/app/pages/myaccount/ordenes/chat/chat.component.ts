import { CommonModule, ViewportScroller } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewChecked, Component, DestroyRef, ElementRef,
  inject, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../../services/ticket.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../../../environments/environment';
import { Mensaje, Ticket } from '../../../../models/ticket.model';
import { Usuario } from '../../../../models/usuario.model';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { map, switchMap, tap } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { Asignacion } from '../../../../models/asignaciondelivery.model';
import { AsignardeliveryService } from '../../../../services/asignardelivery.service';
import { BackComponent } from '../../../../shared/back/back.component';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BackComponent,
    LoadingComponent
],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('scrollMe') myScrollContainer!: ElementRef;

  urlSocket = environment.soketServer;
  public identity!: Usuario;
  public usuario!: any;
  public url!: string;
  public id!: string;
  public messageError = false;
  public mensajes: Mensaje[] = [];
  public msn!: string;
  msm_error!: string;
  public poster_admin!: string;
  public ticket!: Ticket;
  public asignacion!: Asignacion;
  public socket!: Socket;
  public close_ticket = false;
  public isLoading = false;
  public estado_ticket!: string;

  user: any
  identityId!: string;
  driverId!: string;

 

  private audioNotify = new Audio('./assets/audio/universfield-new-notification-057-494255.mp3');

  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private viewportScroller = inject(ViewportScroller);

  private usuarioService = inject(UsuarioService);
  private _router = inject(Router);
  private http = inject(HttpClient);
  private _ticketService = inject(TicketService);
  private asignacionServices = inject(AsignardeliveryService);
  private toastr = inject(ToastrService);

  constructor() {
    // Esto "desbloquea" el audio en navegadores modernos tras el primer clic
    window.addEventListener('click', () => {
      this.audioNotify.load();
    }, { once: true });
  }

  ngOnInit() {
    // 1. Cargar usuario de sesión
    const userData = localStorage.getItem("usuario");
    if (!userData) return;
    this.user = JSON.parse(userData);
    this.identityId = this.user.uid;

    // 2. Flujo reactivo basado en la URL
    this.activatedRoute.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      // Extraemos el ID de la URL
      map(params => params.get('id') || ''),
      // Encadenamos con la carga del Delivery
      switchMap(id => {
        this.id = id; // Guardamos el ordenId (o deliveryId)
        this.isLoading = true;
        return this.asignacionServices.getById(this.id);
      })
    ).subscribe({
      next: (asignacion: Asignacion) => {
        this.asignacion = asignacion;

        if (this.user.role === 'USER') {
          // Si el driver es la palabra "undefined" o está vacío
          if (!asignacion.driver ) {
            this.usuario = null;
            this.toastr.warning('Esperando que un repartidor acepte tu pedido...', 'Chat pausado');
          } else {
            this.usuario = asignacion.driver;
          }
        } else {
          // Si soy chofer, el destino es el campo 'user'
          this.usuario = asignacion.pedido.user;
        }

        console.log("Destinatario final:", this.usuario);
        this.inicializarChat();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar delivery:', err);
        this.isLoading = false;
      }
    });
  }



  inicializarChat() {
    if (!this.socket) {
      this.socket = io(environment.soketServer);

      // 1. Escuchar conexión exitosa
      this.socket.on('connect', () => {
        console.log('✅ Conectado al servidor de sockets');
      });

      // 2. Escuchar NUEVOS MENSAJES (Aquí ocurre la magia)
      this.socket.on('new-mensaje', (data: any) => {
        console.log("📩 ¡LLEGÓ UN MENSAJE POR SOCKET!", data); // ESTE LOG ES CLAVE

        // ACTUALIZACIÓN AUTOMÁTICA (Quita la necesidad de refrescar)
        this.listar_msms();

        // NOTIFICACIONES (Solo para el receptor)
        if (data && data.de !== this.user.uid) {
          // Sonido
          this.playNotification();

          // Toast (Angular 19)
          this.toastr.info(data.msm || 'Nuevo mensaje', 'Chat Delivery', {
            timeOut: 4000,
            closeButton: true,
            progressBar: true
          });
        }
      });

      // 3. Escuchar cambios de estado (si cierras el ticket)
      this.socket.on('new-formmsm', (data: any) => {
        if (data.data) this.recargarDatosDelivery();
      });
    }

    this.listar_msms();
    this.cargarPerfil();
  }

  playNotification() {
    this.audioNotify.pause(); // Reiniciar si ya estaba sonando
    this.audioNotify.currentTime = 0;
    this.audioNotify.play().catch(err => console.log('Esperando interacción del usuario para sonar...'));
  }

  // Para cuando el socket avisa que cambió el estado de la orden (ej: se cerró)
  recargarDatosDelivery() {
    this.asignacionServices.getById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((asignacion: Asignacion) => {
        this.asignacion = asignacion;
        // Actualizamos el destinatario por si acaso hubo cambios
        this.usuario = (this.user.role === 'USER') ? asignacion.driver : asignacion.pedido.user;
        console.log("Datos de la orden actualizados por socket");
      });
  }

  sendMessage(msmForm: NgForm) {
    if (msmForm.invalid) return;

    // Si el destinatario no se cargó, no dejamos enviar
    if (!this.usuario) {
      this.toastr.error('No se pudo identificar al destinatario. Recarga la página.');
      return;
    }

    const data = {
      de: this.user.uid,
      para: this.usuario, // El ID del otro participante que calculamos en el subscribe
      msm: msmForm.value.msm,
      delivery: this.id, // Cambiado de 'ticket' a 'delivery' según tu flujo
      status: this.close_ticket ? 0 : 1
    };

    this._ticketService.send(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.msn = ''; // Limpiar input
        msmForm.controls['msm'].reset(); // Limpiamos input

        // Avisamos al servidor que enviamos algo
        this.socket.emit('save-mensaje', {
          new: true,
          de: this.user.uid,
          deliveryId: this.id,
          msm: data.msm
        });

        // OJO: Como tú mismo disparaste el evento, el socket te responderá 
        // con 'new-mensaje' y eso ejecutará listar_msms() y el scroll.
      }
    );
  }



  listar_msms() {
    this._ticketService.get_ticketMensajes(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response: Mensaje[]) => {
        this.mensajes = response;

        // EJECUTAR SCROLL AQUÍ CON UN PEQUEÑO DELAY
        setTimeout(() => {
          this.scrollToBottom();
        }, 100); // 100ms es suficiente para que Angular renderice el HTML
      });
  }

  cargarPerfil() {
    // Usamos el identityId que ya definimos en el ngOnInit
    this.usuarioService.get_user(this.identityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.poster_admin = response.user?.perfil || 'default-avatar.png';
        },
        error: (error: any) => {
          console.error('Error cargando perfil:', error);
        }
      });
  }


  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTo({
        top: this.myScrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth' // Esto hace que se vea mucho más profesional
      });
    } catch (err) { }
  }



  ngOnDestroy(): void {
    this.socket?.disconnect();
  }



}
