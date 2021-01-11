import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'
import { AuthService } from "./auth.service";

@Injectable()
export class PaymentService{
  constructor(private http:HttpClient,private authService: AuthService){}

  createCheckoutSession(priceId) {
    return this.http.post('/api/create-checkout-session',priceId).toPromise()
  };

  checkSession(sessiond_id,status){
    const params =  new HttpParams().set('session_id',sessiond_id).set('status',status)
    return this.http.get('/api/check-session',{params}).toPromise()
  }
}
