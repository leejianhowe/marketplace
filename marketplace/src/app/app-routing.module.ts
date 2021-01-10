import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DisplayItemsComponent } from './components/display-items/display-items.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { LoginComponent } from './components/login/login.component';
import { PostItemComponent } from './components/post-item/post-item.component';
import {SearchItemsComponent} from './components/search-items/search-items.component';
import { SubscribeComponent } from './components/subscribe/subscribe.component';

const routes: Routes = [
  {path:'',component:DisplayItemsComponent},
  {path:'login',component:LoginComponent},
  {path:'sell',component:PostItemComponent},
  {path:'subscribe',component:SubscribeComponent},
  {path:'categories/:category',component:SearchItemsComponent},
  {path:'search/:search',component:SearchItemsComponent},
  {path:'item/:id',component:ItemDetailsComponent},
  {path:'**',redirectTo:'/',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{onSameUrlNavigation:'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
