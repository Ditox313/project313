import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingsService } from 'src/app/booking/services/bookings.service';

@Component({
  selector: 'app-search-client',
  templateUrl: './search-client.component.html',
  styleUrls: ['./search-client.component.css']
})
export class SearchClientComponent implements OnInit, OnDestroy {
  @Input('type') type!: string;
  
  @Output() onSharedResultSearch = new EventEmitter<any>()
  
  // Результат поиска
  searchResult: any[] = [];
  searchResultLawFase: any[] = [];

  // Проверяем есть ли введенный запрос
  hasQuery: Boolean = false;
  hasQueryLawFase: Boolean = false;

  // Храним результат поиска клиента
  searchResultClient$: Subscription;

  constructor(private bookings: BookingsService,) { }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.searchResultClient$) {
      this.searchResultClient$.unsubscribe();
    }
  }



  // Получаем данные для поиска физического лица
  searchData(e: any) {
    // Отчищаем запрос
    let query: string = e.target.value.trim()
    let xs_query = {
      query: query,
      type: 'fiz'
    }
    

    // Если запрос ничего не содержит или содержит только пробелы
    let matchSpaces = query.match(/\s*/);
    if (matchSpaces[0] === query) {
      this.onSharedResultSearch.emit(null)
      this.hasQuery = false;
      return;
    }


    this.searchResultClient$ = this.bookings.searchWidget(xs_query).subscribe(res => {
      this.hasQuery = true;

      this.onSharedResultSearch.emit(res)

    })

  }

  // Получаем данные для поиска юр лица
  searchDataLawFase(e: any) {
    // Отчищаем запрос
    let query: string = e.target.value.trim()
    let xs_query = {
      query: query,
      type: 'law'
    }

    // Если запрос ничего не содержит или содержит только пробелы
    let matchSpaces = query.match(/\s*/);
    if (matchSpaces[0] === query) {
      this.onSharedResultSearch.emit(null)
      this.hasQuery = false;
      return;
    }


    this.searchResultClient$ = this.bookings.searchWidget(xs_query).subscribe(res => {
      this.hasQuery = true;

      this.onSharedResultSearch.emit(res)

    })
  }
}
