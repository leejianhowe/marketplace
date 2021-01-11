import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';
import { PaymentService } from 'src/app/shared/payment.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  session_id:string
  status:string
  constructor(private paymentService:PaymentService,private route:ActivatedRoute,private authService:AuthService) { }

  ngOnInit(): void {
    this.session_id = this.route.snapshot.queryParamMap.get('session_id')
    this.status = this.route.snapshot.queryParamMap.get('status')
    console.log('sessiond_id',this.session_id)
    console.log('status',this.status)
    this.paymentService.checkSession(this.session_id,this.status).then(res=>{
      console.log(res)
      this.authService.token = res['token']
      this.authService.hasToken.emit(true)

    })
  }

}
