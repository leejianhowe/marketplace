import { Injectable,Output,EventEmitter } from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http'
import { AuthService } from "./auth.service";

@Injectable()
export class DatabaseService{

  // url:string ='https://spacemandeveloper-team-bucket.storage.fleek.co'
  url:string ='https://storageapi.fleek.co/spacemandeveloper-team-bucket/images'

  constructor(private http:HttpClient,private authService: AuthService){}
  
  searchItem: EventEmitter<string> = new EventEmitter()

  postItem(data){
    return this.http.post('/item',data,{observe:"body"}).toPromise()
  }

  getItemsSummary() {

    return this.http.get('/items').toPromise()

  }

  getItem(id:string) {
    return this.http.get(`/items/${id}`).toPromise()
  }

  searchCategoryItems(query:string){
    return this.http.get(`/categories/${query}`).toPromise()
  }

  searchItems(query:string){
    const params = new HttpParams().set('search',query)
    return this.http.get('/search',{params}).toPromise()
  }

  getOrders():Promise<any[]>{
    return this.http.get<any[]>('/myorders').toPromise()
  }

  getWeather(){
    return this.http.get('/weather').toPromise()
  }

  deleteItem(id:string){
    return this.http.delete(`/items/${id}`).toPromise()
  }

  getBalance(){
    return this.http.get<{available:number,pending:number}>('/stripe/get-balance').toPromise()
  }
}
