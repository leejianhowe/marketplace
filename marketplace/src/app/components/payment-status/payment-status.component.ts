import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';
import { PaymentService } from 'src/app/shared/payment.service';
import {CartService} from '../../shared/cart.service'
@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.css']
})
export class PaymentStatusComponent implements OnInit {
  session_id:string
  status:string
  constructor(private cartService:CartService,private paymentService:PaymentService,private route:ActivatedRoute,private authService:AuthService) { }
  isSuccess:boolean=false
  ngOnInit(): void {
    this.session_id = this.route.snapshot.queryParamMap.get('session_id')
    this.status = this.route.snapshot.queryParamMap.get('status')
    if(this.status == 'success')
    {
      this.isSuccess = true
      this.cartService.cart = []
      this.paymentService.checkSession(this.session_id,this.status).then(res=>{
        console.log(res)
        this.authService.token = res['token']
        this.authService.hasToken.emit(true)
      })
    } else {
      this.paymentService.checkSession(this.session_id,this.status).then(res=>{
        console.log(res)
        this.authService.token = res['token']
        this.authService.hasToken.emit(true)
        this.cartService.cart = res['orderItems']
  
      })
    }
    console.log('sessiond_id',this.session_id)
    console.log('status',this.status)
    
  }

}
