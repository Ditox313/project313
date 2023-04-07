import { AfterContentChecked, AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from 'src/app/shared/services/material.service';
import { Client, Client_Law_Fase, MaterialInstance } from 'src/app/shared/types/interfaces';
import { ClientsService } from '../../../../services/clients.service';
import { Store, select } from '@ngrx/store';
import { EventEmitter } from '@angular/core';


// Шаг пагинации
const STEP = 3
const STEP_LAWFASE = 3

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.css']
})
export class ClientsListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tabs') tabs!: ElementRef;
  @Input('clientType') clientType!: string;
  @Output() onAddClientForSearch = new EventEmitter<any>()


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

  // // Храним референцию модального окна
  @ViewChild('modal2') modalRef: ElementRef
  @ViewChild('modal3') modal3Ref: ElementRef


  // Храним модальное окно
  modal: MaterialInstance
  modal3: MaterialInstance


  // Храним временный id для передачи в модальное окно
  temporary_id: string = '';


  // Трегер для закрытия окна после закрытия окна редактирования.
  close_modals:boolean = false;

  
  constructor(private clients: ClientsService, private router: Router, private rote: ActivatedRoute,) { }

  ngOnInit(): void {
    this.fetch()
    this.fetch_lawfase()
  }

  ngOnDestroy(): void {
    if (this.subDeleteClient$) {
      this.subDeleteClient$.unsubscribe();
    }
    if (this.subDeleteClientLawfase$) {
      this.subDeleteClientLawfase$.unsubscribe();
    }
    if (this.Sub_clients_lawfase) {
      this.Sub_clients_lawfase.unsubscribe();
    }
    
    this.modal.destroy();
    this.modal3.destroy();

  }

  ngAfterViewInit(): void {
    MaterialService.initTabs(this.tabs.nativeElement);
    MaterialService.updateTextInputs();
    
    this.modal = MaterialService.initModalPosNotClickClose(this.modalRef,)    
    this.modal3 = MaterialService.initModalPosNotClickClose(this.modal3Ref,)    
  }

 



  public fetch() {
    const params = {
      offset: this.offset,
      limit: this.limit
    }

    this.loading = true
    this.Sub = this.clients.fetch(params).subscribe((clients) => {

      if (clients.length < STEP) {
        this.noMoreCars = true
      }

      this.loading = false
      this.xsclients = this.xsclients.concat(clients)
    });
  }


  public fetch_lawfase() {
    const params = {
      offset: this.offset_lawfase,
      limit: this.limit_lawfase
    }

    this.loading = true
    this.Sub_clients_lawfase = this.clients.fetch_lawfase(params).subscribe((clients) => {


      if (clients.length < STEP_LAWFASE) {
        this.noMoreCarsLawfase = true
      }

      this.loading = false
      this.xsclients_lawfase = this.xsclients_lawfase.concat(clients)
    });
  }



  loadmore() {
    this.loading = true
    this.offset += STEP
    this.fetch()
    this.loading = false
  }

  loadmore_lawfase() {
    this.loading = true
    this.offset_lawfase += STEP_LAWFASE
    this.fetch_lawfase()
    this.loading = false
  }






  onDeleteCar(event: Event, xsclient: Client): void {
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



  onDeleteClientLawfase(event: Event, xsclient: Client_Law_Fase): void {
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

  changeClient(data)
  {
    this.onAddClientForSearch.emit(data)
  }


  // При клике на кнопку выбора клиента в модальном окне
  changeClientModal() {
    this.modal.open();
  }


  // При клике на кнопку просмотра клиента в модальном окне
  viewClientModal(data: string) {
    this.close_modals = false;
    this.temporary_id = data
    this.modal3.open();
  }


  // Получаем результаты поиска физ лица
  takeDataSearchClient(e) {

    if (e !== null) {
      this.xsclients = e;

      this.noMoreCars = true

    }
    else {

      const params = {
        offset: 0,
        limit: 3
      }

      this.clients.fetch(params).subscribe((clients) => {
        this.xsclients = clients

        this.noMoreCars = false
      });
    }

  }



  // Получаем результаты поиска юр лица
  takeDataSearchClientLaw(e) {
    if (e !== null) {
      this.xsclients_lawfase = e;

      this.noMoreCarsLawfase = true

    }
    else {

      const params = {
        offset: this.offset_lawfase,
        limit: this.limit_lawfase
      }

      this.Sub_clients_lawfase = this.clients.fetch_lawfase(params).subscribe((clients) => {
        this.xsclients_lawfase = clients

        this.noMoreCarsLawfase = false
      });
    }

  }


  // Если произошло успешное добавление клиента в модальном окне
  addModalClient(client)
  {
    this.modal.close();
    this.xsclients.unshift(client)
    
    const params = {
      offset: this.offset,
      limit: this.limit
    }

    this.loading = true
    this.Sub = this.clients.fetch(params).subscribe((clients) => {

      if (clients.length < STEP) {
        this.noMoreCars = true
      }

      this.loading = false
      this.xsclients = clients
    });
  }


  // Закрываем окно после закрытия модального окна редактирования
  close_modal(e)
  {
    this.close_modals = true;
    this.modal3.close();
    this.modal.close();

  }

}
