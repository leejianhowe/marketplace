import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { DisplayItemsComponent } from './components/display-items/display-items.component';
import { ItemDetailsComponent } from './components/item-details/item-details.component';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { PostItemComponent } from './components/post-item/post-item.component';
import { SearchItemsComponent } from './components/search-items/search-items.component';
import { LoginComponent } from './components/login/login.component'

import { DatabaseService } from './shared/database.service';
import { AuthService } from './shared/auth.service'
import { AuthInterceptor } from './shared/auth-interceptor'
import {PaymentService} from './shared/payment.service'
import { CartService} from './shared/cart.service'
import { SocialLoginModule } from 'angularx-social-login';
import { SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { SubscribeComponent } from './components/subscribe/subscribe.component';
import { SignupComponent } from './components/signup/signup.component';
import { CartComponent } from './components/cart/cart.component';
import { SuccessComponent } from './components/success/success.component';
import { FailureComponent } from './components/failure/failure.component';


@NgModule({
  declarations: [
    AppComponent,
    DisplayItemsComponent,
    ItemDetailsComponent,
    SearchbarComponent,
    PostItemComponent,
    SearchItemsComponent,
    LoginComponent,
    SubscribeComponent,
    SignupComponent,
    CartComponent,
    SuccessComponent,
    FailureComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    
  ],
  providers: [DatabaseService,{
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider('941734609681-gmarrg95ou5ni4bsh3d9gjme1nr79tqh.apps.googleusercontent.com'),
        },
      ],
    } as SocialAuthServiceConfig,
  },AuthService,
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },PaymentService,CartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
