import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from 'src/app/shared/database.service';
import { ItemDetails } from 'src/app/shared/model';
import {CartItemsDetail} from '../../shared/model'
import {CartService} from '../../shared/cart.service'
import {AuthService} from '../../shared/auth.service'
@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css'],
})
export class ItemDetailsComponent implements OnInit {
  form: FormGroup;
  itemDetails: any = {};
  displayImage: string;
  images: string[] = [];
  itemId: string;
  message: string;
  url: string = 'https://marketplacesg.sfo2.digitaloceanspaces.com';
  role: number ;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private dataBaseService: DatabaseService,
    private fb: FormBuilder,
    private cartService: CartService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.role = this.authService.role
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.dataBaseService
      .getItem(this.itemId)
      .then((res) => {
        this.itemDetails = res as ItemDetails;
        this.images = res['images'];
        this.displayImage = res['images'][0];
      })
      .catch((err) => console.log(err));
    this.form = this.fb.group({
      qty: this.fb.control('', [Validators.required]),
    });
  }

  changeImage(index: string) {
    this.displayImage = index;
  }
  addItem() {
    const qty = this.form.get('qty').value;
    const item = {
      itemId: this.itemDetails._id,
      title: this.itemDetails.title,
      price: this.itemDetails.price,
      qty: parseFloat(qty),
    } as CartItemsDetail;
    console.log(item);
    this.cartService.addItem(item);
    this.message = 'Added to cart';
  }
  async deleteItem() {
    try {
      const result = await this.dataBaseService.deleteItem(this.itemId);
      console.log(result)
      alert(result['message'])
      if (result) this.router.navigate(['/main']);
    } catch (err) {
      console.log(err)
      alert(err['error'].message)
    }
  }
}
