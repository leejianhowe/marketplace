import { HttpClient } from '@angular/common/http';
import { Injectable,EventEmitter, Output} from '@angular/core';
import {
  SocialAuthService,
  GoogleLoginProvider,
  SocialUser,
} from 'angularx-social-login';

@Injectable()
export class AuthService {

  user: SocialUser;
  loggedIn: boolean;
  token:string = ''
  role:number = 0
  @Output() hasToken: EventEmitter<boolean> = new EventEmitter()
  @Output() hasRole: EventEmitter<number> = new EventEmitter()

  constructor(private authService: SocialAuthService, private http:HttpClient) {}

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
    return this.http.post('/api/signup/google',{idToken},{observe:'response'}).toPromise()

  }

  // signOut(): void {
  //   this.authService.signOut();
  // }

  signIn(data){
    return this.http.post('/api/login',data,{observe:'response'}).toPromise()
  }
  signUp(data){
    return this.http.post('/api/signup',data,{observe:'response'}).toPromise()
  }
  signOut(){
    this.token = ''
    this.loggedIn = false
    this.hasToken.emit(false)
  }
}
