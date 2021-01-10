import { Component, OnChanges, OnInit ,SimpleChanges} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from 'src/app/shared/database.service';
import { ItemSummary } from 'src/app/shared/model';

@Component({
  selector: 'app-search-items',
  templateUrl: './search-items.component.html',
  styleUrls: ['./search-items.component.css']
})
export class SearchItemsComponent implements OnInit {
  results:ItemSummary[] = []
  category:string = ''
  search:string = ''
  url:string= this.databaseService.url
  constructor(private route:ActivatedRoute,private databaseService:DatabaseService) { }

  ngOnInit(): void {

    this.category = this.route.snapshot.paramMap.get('category')
    this.search = this.route.snapshot.paramMap.get('search')
    if(this.category){
      console.log(this.category)
      this.databaseService.searchCategoryItems(this.category)
        .then(res=>{
          this.results=res as ItemSummary[]
          console.log(this.results)
        }).catch(err=>console.log(err))
    }else{
      console.log(this.search)
      this.databaseService.searchItems(this.search)
        .then(res=>{
          this.results=res as ItemSummary[]
          console.log(this.results)
        })
        .catch(err=>console.log(err))
    }
  }

}
