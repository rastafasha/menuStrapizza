import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RecoveryComponent } from './auth/recovery/recovery.component';
import { RegisterComponent } from './auth/register/register.component';
import { CartCheckoutComponent } from './pages/myaccount/cart-checkout/cart-checkout.component';
import { MyaccountComponent } from './pages/myaccount/myaccount.component';
import { DetalleOrdenComponent } from './pages/myaccount/ordenes/detalle-orden/detalle-orden.component';
import { IndexOrdenesComponent } from './pages/myaccount/ordenes/index-ordenes/index-ordenes.component';
import { PerfilComponent } from './pages/myaccount/perfil/perfil.component';
import { ReviewOrderComponent } from './pages/review-order/review-order.component';
import { MispedidosComponent } from './pages/myaccount/mispedidos/mispedidos.component';
import { DireccionEditComponent } from './pages/myaccount/direcciones/direccion-edit/direccion-edit.component';
import { DireccionesComponent } from './pages/myaccount/direcciones/direcciones.component';
import { PayComponent } from './pages/pay/pay.component';
import { MisNotificacionesComponent } from './pages/mis-notificaciones/mis-notificaciones.component';
import { MisPagosComponent } from './pages/myaccount/mis-pagos/mis-pagos.component';
import { FavoritesComponent } from './pages/myaccount/favorites/favorites.component';
import { ReservacionesComponent } from './pages/myaccount/reserva/reservaciones/reservaciones.component';
import { TrackOrdenComponent } from './pages/myaccount/ordenes/track-orden/track-orden.component';
import { PresupuestoListComponent } from './pages/myaccount/presupuesto/presupuesto-list/presupuesto-list.component';
import { PresupuestoEditComponent } from './pages/myaccount/presupuesto/presupuesto-edit/presupuesto-edit.component';
import { ChatComponent } from './pages/myaccount/ordenes/chat/chat.component';
import { MapaComponent } from './pages/myaccount/ordenes/mapa/mapa.component';
// import { ReviewOrderComponent } from './pages/review-order/review-order.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path:'home',
        component: HomeComponent
    },
    {
        path:'review',
        component: ReviewOrderComponent
    },
    {
        path:'pay/:id',
        component: PayComponent
    },
    {
        path:'login',
        component: LoginComponent
    },
    {
        path:'registro',
        component: RegisterComponent
    },
    {path: 'recovery-password', component: RecoveryComponent },

    {path: 'chat/:id', component: ChatComponent },
    {path: 'mapa-page/:id', component: MapaComponent},
    
    {path: 'my-account', component: MyaccountComponent },
    {path: 'my-account/perfil/:id', component: PerfilComponent },
    {path: 'my-account/ordenes', component: IndexOrdenesComponent},
    {path: 'my-account/pedidos', component: MispedidosComponent},
    {path: 'my-account/ordenes/detalles/:id', component: DetalleOrdenComponent},
    {path: 'my-account/ordenes/tracking/:id', component: TrackOrdenComponent},
    {path: 'my-account/cart', component: CartCheckoutComponent },

    {path: 'my-account/direcciones', component: DireccionesComponent },
    {path: 'my-account/direccion/create', component: DireccionEditComponent },
    { path: 'my-account/direccion/edit/:id', component: DireccionEditComponent},

    { path: 'notificaciones', component: MisNotificacionesComponent},
    { path: 'mis-pagos', component: MisPagosComponent},
    { path: 'favoritos', component: FavoritesComponent},
    { path: 'reservaciones', component: ReservacionesComponent},
    { path: 'cotizar', component: PresupuestoEditComponent},
    { path: 'mis-cotizaciones', component: PresupuestoListComponent},
];

