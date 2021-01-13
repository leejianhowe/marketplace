import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms'
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/auth.service';
import { DatabaseService } from 'src/app/shared/database.service';
@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements OnInit, OnDestroy{
  form:FormGroup
  constructor(private fb:FormBuilder,private databaseService:DatabaseService, private router:Router,private authService:AuthService) { }
  hasToken:boolean=false
  role:number=0
  tokenSubscription:Subscription
  roleSubcription: Subscription
  ngOnInit(): void {
    this.form = this.fb.group({
      search: this.fb.control('')
    })
    
    this.tokenSubscription = this.authService.hasToken.subscribe((res)=>{
      console.log('hastoken',res)
      this.hasToken = res
    })
    this.roleSubcription = this.authService.hasRole.subscribe(res=>{
      console.log('role',res)
      this.role = res
    })
  }
  search(){
    const search = this.form.get('search').value
    this.databaseService.searchItem.emit(search)
    this.databaseService.searchItems(search)
      .then(res=>{
        console.log(res)

        this.router.navigate(['/search',search])
      })
      .catch(err=>{
        console.log(err)})
  }
  logout(){
    this.authService.signOut()
    this.router.navigate(['/'])
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.tokenSubscription.unsubscribe()
    this.roleSubcription.unsubscribe()
  }
}
