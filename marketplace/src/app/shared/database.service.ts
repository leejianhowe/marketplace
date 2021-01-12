import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'
import { AuthService } from "./auth.service";

@Injectable()
export class DatabaseService{

  url:string ='https://marketplacesg.sfo2.digitaloceanspaces.com'

  constructor(private http:HttpClient,private authService: AuthService){}



  postItem(data){
    return this.http.post('/api/item',data,{observe:"body"})
  }

  async getItemsSummary() {
    // const headers = new HttpHeaders({'x-token':this.authService.user.idToken})
    // console.log(headers)
    return await this.http.get('/api/items').toPromise()

  }

  async getItem(id:string) {
    return await this.http.get(`/api/items/${id}`).toPromise()
  }

  async searchCategoryItems(query:string){
    return await this.http.get(`/api/categories/${query}`).toPromise()
  }

  async searchItems(query:string){
    const params = new HttpParams().set('search',query)
    return await this.http.get('/api/search',{params}).toPromise()
  }

  async getOrders():Promise<any[]>{
    return await this.http.get<any[]>('/api/myorders').toPromise()
  }

}
