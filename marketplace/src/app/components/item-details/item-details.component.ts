import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from 'src/app/shared/database.service';
import { dealMethod, paymentMethod, condition, Category, ItemDetails } from 'src/app/shared/model';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit {

  itemDetails:any = {}
  displayImage:string
  images:string[] = []

  url:string ='https://marketplacesg.sfo2.digitaloceanspaces.com'
  constructor(private route:ActivatedRoute,private itemService:DatabaseService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    this.itemService.getItem(id)
      .then(res=>{
        this.itemDetails = res as ItemDetails
        this.images = res['images']
        this.displayImage = res['images'][0]
      })
      .catch(err=>
        console.log(err)
      )
  }

  changeImage(index:string){
    this.displayImage = index

  }

}
