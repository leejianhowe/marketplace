import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisplayItemsComponent } from './components/display-items/display-items.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { LoginComponent } from './components/login/login.component';
import { PostItemComponent } from './components/post-item/post-item.component';
import {SearchItemsComponent} from './components/search-items/search-items.component';
import { SignupComponent } from './components/signup/signup.component';
import { SubscribeComponent } from './components/subscribe/subscribe.component';
import {CartComponent} from './components/cart/cart.component'
import {SuccessComponent} from './components/success/success.component'
import {FailureComponent} from './components/failure/failure.component'

const routes: Routes = [
  {path:'',component:SubscribeComponent},
  {path:'main',component:DisplayItemsComponent},
  {path:'login',component:LoginComponent},
  {path:'signup',component:SignupComponent},
  {path:'cart',component:CartComponent},
  {path:'success',component:SuccessComponent},
  {path:'failure',component:FailureComponent},
  {path:'sell',component:PostItemComponent},
  {path:'subscribe',component:SubscribeComponent},
  {path:'categories/:category',component:SearchItemsComponent},
  {path:'search/:search',component:SearchItemsComponent},
  {path:'item/:id',component:ItemDetailsComponent},
  {path:'**',redirectTo:'/',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
