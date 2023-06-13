import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Smena } from 'src/app/shared/types/interfaces';
import { SmenaService } from '../../services/smena.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from 'src/app/shared/services/material.service';

@Component({
  selector: 'app-view-smena',
  templateUrl: './view-smena.component.html',
  styleUrls: ['./view-smena.component.css']
})
export class ViewSmenaComponent implements OnInit, OnDestroy {

  constructor(
    private smenaService: SmenaService,
    private rote: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
   
  }


  ngOnDestroy(): void {
   
  }

  
}
