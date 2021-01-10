import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/shared/database.service';
import { AuthService } from '../../shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  user = null;
  form:FormGroup
  errorMessage:string=''
  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private router: Router,
    private fb:FormBuilder
  ) {
    this.form = this.fb.group({
      username: this.fb.control('',[Validators.required]),
      password: this.fb.control('',[Validators.required])
    })
  }

  ngOnInit() {}

  async loginGoogle() {
    // await this.authService.signInWithGoogle();
    await this.router.navigate(['/']);
  }

  login() {
    const data = this.form.value
    console.log(data)
    this.authService.signIn(data).then(res=>{
      console.log(res)
      if(res.status === 200)
      {
        this.authService.token = res.body['token']
        this.authService.hasToken.emit(true)
      }
      this.router.navigate(['/'])
    }).catch(err=>{
      console.log('error',err)
      if(err.status === 401){
        this.errorMessage = err.error.error
      }
    })
  }
}
