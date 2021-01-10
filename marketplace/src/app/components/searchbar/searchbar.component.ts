import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms'
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';
import { DatabaseService } from 'src/app/shared/database.service';
@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements OnInit {
  form:FormGroup
  constructor(private fb:FormBuilder,private databaseService:DatabaseService, private router:Router,private authService:AuthService) { }
  hasToken:boolean=false
  ngOnInit(): void {
    this.form = this.fb.group({
      search: this.fb.control('')
    })
    this.authService.hasToken.subscribe((res)=>{
      console.log('hastoken',res)
      this.hasToken = res
    })
  }
  search(){
    const search = this.form.get('search').value
    this.databaseService.searchItems(search)
      .then(res=>{
        console.log(res)
        this.router.navigate(['/search',search])
      })
      .catch(err=>{
        console.log(err)})
  }

}
