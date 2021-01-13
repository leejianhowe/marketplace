import { Injectable,Output,EventEmitter } from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http'
import { AuthService } from "./auth.service";

@Injectable()
export class DatabaseService{

  url:string ='https://marketplacesg.sfo2.digitaloceanspaces.com'

  constructor(private http:HttpClient,private authService: AuthService){}
  
  searchItem: EventEmitter<string> = new EventEmitter()

  postItem(data){
    return this.http.post('/api/item',data,{observe:"body"}).toPromise()
  }

  getItemsSummary() {

    return this.http.get('/api/items').toPromise()

  }

  getItem(id:string) {
    return this.http.get(`/api/items/${id}`).toPromise()
  }

  searchCategoryItems(query:string){
    return this.http.get(`/api/categories/${query}`).toPromise()
  }

  searchItems(query:string){
    const params = new HttpParams().set('search',query)
    return this.http.get('/api/search',{params}).toPromise()
  }

  getOrders():Promise<any[]>{
    return this.http.get<any[]>('/api/myorders').toPromise()
  }

}
