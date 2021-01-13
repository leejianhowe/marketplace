import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormGroup,FormBuilder, Validators} from '@angular/forms'
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/shared/database.service';
@Component({
  selector: 'app-post-item',
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.css'],
})
export class PostItemComponent implements OnInit {

  form: FormGroup;

  @ViewChild('images') images: ElementRef<HTMLInputElement>;

  chosenImages = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      category: this.fb.control('',[Validators.required]),
      price: this.fb.control('',[Validators.required]),
      // condition: this.fb.control('',[Validators.required]),
      description: this.fb.control(''),
      // dealMethod: this.fb.control('',[Validators.required]),
      // paymentMethod: this.fb.control('',[Validators.required]),
      images: this.fb.control('',[Validators.required]),
    });
  }

  postItem() {
    let data = new FormData();
    const number = this.images.nativeElement.files.length
    console.log(number);
    if (number > 5) {
      this.errorMessage = 'please upload less than 5 files. each less than 5mb';
    } else {
      for (let i = 0; i < number; i++) {
        data.append('images', this.images.nativeElement.files[i]);

      }
      data.append('title', this.form.value.title);
      data.append('category', this.form.value.category);
      data.append('price', this.form.value.price);
      // data.append('condition', this.form.value.condition);
      data.append('description', this.form.value.description);
      // data.append('dealMethod', this.form.value.dealMethod);
      // data.append('paymentMethod', this.form.value.paymentMethod);
      const results = this.databaseService.postItem(data);
      results.then(
        (res) => {
          console.log(res);
          this.form.reset()
          console.log(this.images.nativeElement.value)
          this.router.navigate(['/']);
        }).catch(
        (err) => {
          console.log(err);
          if ((err.status = 500)) this.errorMessage = err.error.message;
        }
      )
    }
  }

  showImage() {
    const number = this.images.nativeElement.files.length;
    this.chosenImages = []
    for (let i = 0; i < number; i++) {
      // File Preview
      const reader = new FileReader();
      reader.onload = (_event) => {
        const result = reader.result;
        this.chosenImages.push(result);
        console.log(this.chosenImages);
      };
      reader.readAsDataURL(this.images.nativeElement.files[i]);
    }
  }
}
