import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisplayItemsComponent } from './components/display-items/display-items.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { LoginComponent } from './components/login/login.component';
import { PostItemComponent } from './components/post-item/post-item.component';
import { SearchItemsComponent } from './components/search-items/search-items.component';
import { SignupComponent } from './components/signup/signup.component';
import { LandingComponent } from './components/landing/landing.component';
import { CartComponent } from './components/cart/cart.component'
import { PaymentStatusComponent } from './components/payment-status/payment-status.component'
import { AccountComponent } from './components/account/account.component';
import { AuthService } from './shared/auth.service'

const routes: Routes = [
  {path:'',component:LandingComponent},
  {path:'main',component:DisplayItemsComponent,canActivate: [ AuthService ]},
  {path:'login',component:LoginComponent},
  {path:'signup',component:SignupComponent},
  {path:'cart',component:CartComponent,canActivate: [ AuthService ]},
  {path:'payment-status',component:PaymentStatusComponent,canActivate: [ AuthService ]},
  {path:'account',component:AccountComponent,canActivate: [ AuthService ]},
  {path:'sell',component:PostItemComponent,canActivate: [ AuthService ]},
  {path:'categories/:category',component:SearchItemsComponent,canActivate: [ AuthService ]},
  {path:'search/:search',component:SearchItemsComponent,canActivate: [ AuthService ]},
  {path:'item/:id',component:ItemDetailsComponent,canActivate: [ AuthService ]},
  {path:'**',redirectTo:'/',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
