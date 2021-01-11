import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/shared/cart.service';
import { CartItemsDetail } from 'src/app/shared/model';
import { PaymentService } from 'src/app/shared/payment.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  total:number = 0
  cart:CartItemsDetail[]=[]
  constructor(private cartService:CartService,private paymentService:PaymentService) { }

  ngOnInit(): void {
    this.cart = this.cartService.cart
    console.log(this.cart)
    for(let item of this.cart){
      this.total = item.price * item.qty + this.total

    }

  }

  checkout(){
    this.paymentService.createCheckoutSession({cart:this.cart}).then(res=>{
      // Call Stripe.js method to redirect to the new Checkout page
      console.log(res)
      stripe
        .redirectToCheckout({
          sessionId: res['sessionId']
        })
        .then((res)=>{
          console.log(res)
          if (res.error) {
            alert(res.error.message)
          }
        }).catch((error) => {
          console.error("Error:", error)
        })
      
  })
  }

}
