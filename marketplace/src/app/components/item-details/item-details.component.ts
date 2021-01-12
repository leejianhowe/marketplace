import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from 'src/app/shared/database.service';
import { ItemDetails } from 'src/app/shared/model';
import {CartItemsDetail} from '../../shared/model'
import {CartService} from '../../shared/cart.service'
@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit {
  form:FormGroup
  itemDetails:any = {}
  displayImage:string
  images:string[] = []
  itemId:string
  message:string
  url:string ='https://marketplacesg.sfo2.digitaloceanspaces.com'
  constructor(private route:ActivatedRoute,private itemService:DatabaseService, private fb:FormBuilder, private cartService:CartService) { }

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id')
    this.itemService.getItem(this.itemId)
      .then(res=>{
        this.itemDetails = res as ItemDetails
        this.images = res['images']
        this.displayImage = res['images'][0]
      })
      .catch(err=>
        console.log(err)
      )
      this.form = this.fb.group({
        qty: this.fb.control('',[Validators.required])
      })
  }

  changeImage(index:string){
    this.displayImage = index

  }
  addItem(){
    const qty = this.form.get('qty').value
    const item = {
      itemId: this.itemDetails._id,
      title: this.itemDetails.title,
      price: this.itemDetails.price,
      qty:parseFloat(qty)
    } as CartItemsDetail
    console.log(item)
    this.cartService.addItem(item)
    this.message = 'Added to cart'
  }
  

}
