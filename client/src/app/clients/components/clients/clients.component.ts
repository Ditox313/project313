import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Client, Client_Law_Fase } from 'src/app/shared/types/interfaces';
import { ClientsService } from '../../services/clients.service';
import { Store, select } from '@ngrx/store';
import {
  clientsAddAction,
} from '../../store/actions/clients.action';


// Шаг пагинации
  const STEP = 15
  const STEP_LAWFASE = 15

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tabs') tabs!: ElementRef;
  Sub!: Subscription;
  Sub_clients_lawfase!: Subscription;
  subDeleteClient$: Subscription;
  subDeleteClientLawfase$: Subscription;
  xsclients: Client[] = []
  xsclients_lawfase: Client_Law_Fase[] = []
  offset: any = 0
  limit: any = STEP
  offset_lawfase: any = 0
  limit_lawfase: any = STEP
  loading = false;
  noMoreCars: Boolean = false
  noMoreCarsLawfase: Boolean = false
  constructor(private clients: ClientsService, private router: Router, private rote: ActivatedRoute, private store: Store) { }

  ngOnInit(): void {
    this.fetch() 
    this.fetch_lawfase()   
  }

  ngOnDestroy(): void {
    if (this.subDeleteClient$)
    {
      this.subDeleteClient$.unsubscribe();
    }
    if (this.subDeleteClientLawfase$)
    {
      this.subDeleteClientLawfase$.unsubscribe();
    }
    if (this.Sub_clients_lawfase)
    {
      this.Sub_clients_lawfase.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();

  }



  public fetch()
  {
    const params = {
      offset: this.offset,
      limit: this.limit
    }

    this.loading = true
    this.Sub = this.clients.fetch(params).subscribe((clients) =>{
      this.store.dispatch(clientsAddAction({ clients: clients }));

      if(clients.length < STEP)
      {
        this.noMoreCars = true
      }
        
      this.loading = false
      this.xsclients = this.xsclients.concat(clients)
    });    
  }


  public fetch_lawfase()
  {
    const params = {
      offset: this.offset_lawfase,
      limit: this.limit_lawfase
    }

    this.loading = true
    this.Sub_clients_lawfase = this.clients.fetch_lawfase(params).subscribe((clients) =>{

      
      if (clients.length < STEP_LAWFASE)
      {
        this.noMoreCarsLawfase = true
      }
        
      this.loading = false
      this.xsclients_lawfase = this.xsclients_lawfase.concat(clients)
    });     
  }



  loadmore()
  {
    this.loading = true
    this.offset += STEP
    this.fetch()
    this.loading = false
  }

  loadmore_lawfase()
  {
    this.loading = true
    this.offset_lawfase += STEP_LAWFASE
    this.fetch_lawfase()
    this.loading = false
  }



  
  onDeleteCar(event: Event, xsclient: Client): void
  {
    event.stopPropagation();


    const dicision = window.confirm(`Удалить клиента?`);

    if (dicision) {
      this.subDeleteClient$ = this.clients.delete(xsclient._id).subscribe(res => {
        const idxPos = this.xsclients.findIndex((p) => p._id === xsclient._id);
        this.xsclients.splice(idxPos, 1);
        MaterialService.toast(res.message)
        
      }, error => {
        MaterialService.toast(error.error.message);
      })
    }
  }



  onDeleteClientLawfase(event: Event, xsclient: Client_Law_Fase): void
  {
    event.stopPropagation();


    const dicision = window.confirm(`Удалить клиента?`);

    if (dicision) {
      this.clients.delete_lawfase(xsclient._id).subscribe(res => {
        const idxPos = this.xsclients_lawfase.findIndex((p) => p._id === xsclient._id);
        this.xsclients_lawfase.splice(idxPos, 1);
        // this.store.dispatch(clientsAddAction({ clients: this.xsclients_lawfase }));
        MaterialService.toast(res.message)
        
      }, error => {
        MaterialService.toast(error.error.message);
      })
    }
  }

}
