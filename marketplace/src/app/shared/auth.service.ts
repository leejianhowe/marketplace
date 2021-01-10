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

  @Output() hasToken: EventEmitter<boolean> = new EventEmitter()

  constructor(private authService: SocialAuthService, private http:HttpClient) {}

  ngOnInit() {
    // this.authService.authState.subscribe((user) => {
    //   this.user = user;
    //   this.loggedIn = user != null;
    //   console.log('user info', this.user);
    //   console.log('loggin', this.loggedIn);
    // });
  }

  // async signInWithGoogle(): Promise<void> {
  //   await this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  // }

  // signOut(): void {
  //   this.authService.signOut();
  // }

  signIn(data){
    return this.http.post('/api/login',data,{observe:'response'}).toPromise()
  }

}
