import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RecoveryComponent } from './auth/recovery/recovery.component';
import { RegisterComponent } from './auth/register/register.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CartCheckoutComponent } from './pages/myaccount/cart-checkout/cart-checkout.component';
import { MyaccountComponent } from './pages/myaccount/myaccount.component';
import { DetalleOrdenComponent } from './pages/myaccount/ordenes/detalle-orden/detalle-orden.component';
import { IndexOrdenesComponent } from './pages/myaccount/ordenes/index-ordenes/index-ordenes.component';
import { PerfilComponent } from './pages/myaccount/perfil/perfil.component';
import { ReviewOrderComponent } from './pages/review-order/review-order.component';
// import { ReviewOrderComponent } from './pages/review-order/review-order.component';

export const routes: Routes = [
    {
        path:'',
        component: HomeComponent
    },
    {
        path:'review',
        component: ReviewOrderComponent
    },
    {
        path:'checkout',
        component: CheckoutComponent
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
    {path: 'my-account', component: MyaccountComponent },
    {path: 'my-account/perfil/:id', component: PerfilComponent },
    { path: 'my-account/ordenes', component: IndexOrdenesComponent},
    { path: 'my-account/ordenes/detalles/:id', component: DetalleOrdenComponent},
    {path: 'my-account/cart', component: CartCheckoutComponent },
];

