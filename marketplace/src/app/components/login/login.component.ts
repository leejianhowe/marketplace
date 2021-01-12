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
      username: this.fb.control('',[Validators.required,Validators.email]),
      password: this.fb.control('',[Validators.required])
    })
  }

  ngOnInit() {}

  async loginGoogle() {
    try{
      const results = await this.authService.signInWithGoogle();
      console.log(results)
      const idToken = results['idToken']
      const result = await this.authService.signinGoogle(idToken)
      console.log(result)
      if(result.status == 200) {
        this.makeToken(result.body)
        this.router.navigate(['/main']);
      }
    } catch (err) {
      console.log(err)
      this.errorMessage = err.error.error.message
    }
  }

  login() {
    const data = this.form.value
    console.log(data)
    this.authService.signIn(data).then(res=>{
      console.log(res)
      if(res.status === 200)
      {
        this.makeToken(res.body)
        this.router.navigate(['/main'])
      }
    }).catch(err=>{
      console.log('error',err)
      if(err.status === 401){
        this.errorMessage = err.error.error
      }
    })
  }

  makeToken(data){
    this.authService.token = data['token']
    this.authService.role = data['role']
    this.authService.hasToken.emit(true)
    this.authService.hasRole.emit(this.authService.role)

  }
}
