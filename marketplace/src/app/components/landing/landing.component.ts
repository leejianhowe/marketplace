import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/shared/database.service';
@Component({
  selector: 'app-subscribe',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  url:string="http://openweathermap.org/img/wn/"
  weather
  constructor(private databaseService:DatabaseService){

  }
  ngOnInit(): void {
    this.databaseService.getWeather().then(res=>{
      this.weather = res
      // console.log(res)
    })
  }

}
