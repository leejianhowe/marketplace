import { HttpClient } from '@angular/common/http';
import { Injectable,EventEmitter, Output} from '@angular/core';
import {
  SocialAuthService,
  GoogleLoginProvider,
  SocialUser,
} from 'angularx-social-login';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import {CartService} from './cart.service'
@Injectable()
export class AuthService implements CanActivate{

  user: SocialUser;
  loggedIn: boolean;
  token:string = ''
  role:number = 0
  @Output() hasToken: EventEmitter<boolean> = new EventEmitter()
  @Output() hasRole: EventEmitter<number> = new EventEmitter()

  constructor(private cartService: CartService,private authService: SocialAuthService, private http:HttpClient, private router:Router) {}

  ngOnInit() {
    // this.authService.authState.subscribe((user) => {
    //   this.user = user;
    //   this.loggedIn = user != null;
    //   console.log('user info', this.user);
    //   console.log('loggin', this.loggedIn);
    // });
  }

  signInWithGoogle() {
    return this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    
  }
  signupGoogle(idToken){
    return this.http.post('/signup/google',{idToken},{observe:'response'}).toPromise()

  }

  signinGoogle(idToken){
    return this.http.post('/login/google',{idToken},{observe:'response'}).toPromise()
  }

  // signOut(): void {
  //   this.authService.signOut();
  // }

  signIn(data){
    return this.http.post('/login',data,{observe:'response'}).toPromise()
  }
  signUp(data){
    return this.http.post('/signup',data,{observe:'response'}).toPromise()
  }
  signOut(){
    this.token = ''
    this.loggedIn = false
    this.cartService.cart = []
    this.hasToken.emit(false)
    this.hasRole.emit(0)
    
  }

  isLogin() {
    return this.token != ''
  }

  getAccountDetails(){
    return this.http.get('/account/details').toPromise()
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    
    const path = route.routeConfig.path
    if(path == 'payment-status' && route.queryParamMap.get('status') && route.queryParamMap.get('session_id'))
    {
      return true
    }
    if(this.isLogin())
      return true
    return this.router.parseUrl('/')
  }
}
