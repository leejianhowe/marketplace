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
    const results = await this.authService.signInWithGoogle();
    console.log(results)
    const idToken = results['idToken']
    await this.authService.getToken(idToken)
    // await this.router.navigate(['/']);
  }

  login() {
    const data = this.form.value
    console.log(data)
    this.authService.signIn(data).then(res=>{
      console.log(res)
      if(res.status === 200)
      {
        this.authService.token = res.body['token']
        this.authService.role = res.body['role']
        console.log(this.authService)
        this.authService.hasToken.emit(true)
        this.authService.hasRole.emit(this.authService.role)
      }
      this.router.navigate(['/main'])
    }).catch(err=>{
      console.log('error',err)
      if(err.status === 401){
        this.errorMessage = err.error.error
      }
    })
  }
}
