import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../shared/database.service'
import { ItemSummary } from '../../shared/model'
@Component({
  selector: 'app-display-items',
  templateUrl: './display-items.component.html',
  styleUrls: ['./display-items.component.css']
})
export class DisplayItemsComponent implements OnInit {

  constructor(private databaseService: DatabaseService, private route:ActivatedRoute) { }
  marketplace:ItemSummary[] = []
  url:string = this.databaseService.url
  ngOnInit(): void {

    this.databaseService.getItemsSummary()
      .then(res=>{
        this.marketplace=res as ItemSummary[]
        console.log(this.marketplace)
      })



  }

}
