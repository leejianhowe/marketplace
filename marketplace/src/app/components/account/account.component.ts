import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/shared/database.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  orders:any[]
  constructor(private databaseService:DatabaseService) { }

  ngOnInit(): void {
    this.databaseService.getOrders().then(data=>{
      console.log(data['orders'])
      this.orders=data['orders']
    })
  }

}
