export interface ItemSummary{
  _id:string,
  timestamp: Date,
  title: string,
  price: number,
  description: string,
  images: string
}

// export enum NewCategory{
//   electronics = 0,
//   fashion,
//   household,
//   accessories,
//   others,
// }

// export enum Category{
//   chocolates = 0,
//   sweets,
//   milk,
//   others,
// }

// export enum condition{
//   new = 0,
//   used
// }

// export enum dealMethod{
//   'meet up' = 0,
//   postage,
//   delivery
// }

// export enum paymentMethod{
//   cash = 0,
//   paynow,
//   paylah,
//   googlepay


// }

export interface ItemDetails{
  category: string,
  // condition: string,
  // dealMethod: string,
  description: string,
  images: string[],
  // paymentMethod: string,
  price: number
  timestamp: Date,
  title: string,
  _id: string
}

export interface CartItemsDetail{
  itemId: string,
  title:string,
  qty:number,
  price:number
}