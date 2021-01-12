import { Injectable, OnInit } from "@angular/core";
import {CartItemsDetail} from  './model'

@Injectable()
export class CartService {
    cart:CartItemsDetail[] = []
    constructor(){

    }
    

    addItem(item){
        this.cart.push(item)

    }

}