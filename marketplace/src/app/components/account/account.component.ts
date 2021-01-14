import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/auth.service';
import { DatabaseService } from 'src/app/shared/database.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  orders: any[];
  formattedResult: any[] = [];
  role: number = 0;
  wallet: { available: number; pending: number } = { available: 0, pending: 0 };
  userDetails
  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.role;
    this.authService.getAccountDetails().then(res=>{
      this.userDetails = res
      console.log(this.userDetails)
    }).catch(err=>console.log(err))
    if (this.role == 1) {
      this.databaseService.getBalance().then((data) => {
        this.wallet = data;
      });
    } else {
      
      this.databaseService.getOrders().then((data) => {
        // console.log(data['orders'])
        this.orders = data['orders'];
        this.orders.forEach((ele) => {
          if (ele.order.length > 1) {
            for (let item of ele.order) {
              // console.log(item)
              const obj = {
                payment_status: ele.payment_status,
                title: item.title,
                qty: item.qty,
                price: item.price,
                timestamp: ele.timestamp,
              };
              this.formattedResult.push(obj);
            }
          } else {
            const obj = {
              payment_status: ele.payment_status,
              title: ele.order[0].title,
              qty: ele.order[0].qty,
              price: ele.order[0].price,
              timestamp: ele.timestamp,
            };
            this.formattedResult.push(obj);
          }
        });
        console.log(this.formattedResult);
      });
    }
  }
}
