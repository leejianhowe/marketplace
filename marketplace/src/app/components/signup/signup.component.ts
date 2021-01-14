import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/shared/database.service';
import { AuthService } from '../../shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  user = null;
  form: FormGroup;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      username: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required]),
      password1: this.fb.control('', [Validators.required]),
      name: this.fb.control('', [Validators.required]),
    });
  }

  ngOnInit() {}

  async signupGoogle() {
    try{
    const results = await this.authService.signInWithGoogle();
    console.log(results)
    const idToken = results['idToken']
    const result = await this.authService.signupGoogle(idToken)
    console.log(result)
    this.makeToken(result.body)
    this.router.navigate(['/main']);
    }catch(err){
      console.log(err)
      this.errorMessage = err.error.error.message
    }
}

  signUp() {
    const data = this.form.value;
    const password = this.form.get('password').value
    const password1 = this.form.get('password1').value
    console.log(password)
    console.log(password1)
    if (password == password1) {
      console.log(data);
      this.authService
        .signUp(data)
        .then((res) => {
          console.log(res);
          if (res.status === 201) {
            alert(res['body']['message'])
            this.makeToken(res.body)
          }
          this.router.navigate(['/main']);
        })
        .catch((err) => {
          console.log('error', err);
          if (err.status === 400) {
            this.errorMessage = err.error.message;
          }
        });
    }else{
      this.errorMessage = 'password dont match'
    }
  }
  makeToken(data){
    this.authService.token = data['token']
    this.authService.role = data['role']
    this.authService.hasToken.emit(true)
    this.authService.hasRole.emit(this.authService.role)

  }
}
