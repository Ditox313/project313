import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { LoaderModule } from './shared/loader/loader.module';
import { ClientsModule } from './clients/clients.module';
import { PartnersModule } from './partners/partners.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TokenInterceptor } from './shared/other/token.interceptor';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { BookingModule } from './booking/booking.module';
import '@angular/common/locales/global/ru'
import { PaysModule } from './pays/pays.module';
import { AccountModule } from './account/account.module';
import { DocumentsModule } from './documents/documents.module';
import { GoBackModule } from './shared/modules/ga-back/go-back.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxMaskModule } from 'ngx-mask'





@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AuthModule,
    CarsModule,
    LoaderModule,
    ClientsModule,
    BookingModule,
    PartnersModule,
    DashboardModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    PaysModule,
    AccountModule,
    DocumentsModule,
    GoBackModule,
    PdfViewerModule,
    NgxMaskModule.forRoot(),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: TokenInterceptor,
    },
    { provide: LOCALE_ID, useValue: 'ru' },
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
