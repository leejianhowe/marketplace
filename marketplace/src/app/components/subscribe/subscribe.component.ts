import { Component, OnInit } from '@angular/core';
import {PaymentService} from '../../shared/payment.service'
@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css']
})
export class SubscribeComponent implements OnInit {
  constructor(private paymentService:PaymentService) { }

  ngOnInit(): void {

  }
  subscribe(){
    const priceId = 'price_1I84WoCe6jNzcQRajSwlPm6r'
    this.paymentService.createCheckoutSession({priceId:priceId}).then(res=>{
      // Call Stripe.js method to redirect to the new Checkout page
      console.log(res)
      stripe
        .redirectToCheckout({
          sessionId: res['sessionId']
        })
        .then((res)=>{
          console.log(res)
        });
    })

  }

}
