
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { Client, Client_Law_Fase } from 'src/app/shared/types/interfaces';



@Injectable({
  providedIn: 'root', 
})
export class ClientsService {
  constructor(private http: HttpClient) {}


  // Создаем нового физ/лица
  create(client: Client, passport__1?: File,passport__2?: File,prava__1?: File, prava__2?: File): Observable<Client> {
    const fd = new FormData(); 
      fd.append('name', client.name);
      fd.append('surname', client.surname);
      fd.append('lastname', client.lastname);
      fd.append('makedate', client.makedate);
      fd.append('passport_seria', client.passport_seria);
      fd.append('passport_number', client.passport_number);
      fd.append('passport_date', client.passport_date);
      fd.append('passport_who_take', client.passport_who_take);
      fd.append('code_podrazdeleniya', client.code_podrazdeleniya);
      fd.append('passport_register', client.passport_register);
      fd.append('passport_address_fact', client.passport_address_fact);
      fd.append('prava_seria', client.prava_seria);
      fd.append('prava_number', client.prava_number);
      fd.append('prava_date', client.prava_date);
      fd.append('phone_main', client.phone_main);
      fd.append('phone_1_dop_name', client.phone_1_dop_name);
      fd.append('phone_1_dop_number', client.phone_1_dop_number);
      fd.append('phone_2_dop_name', client.phone_2_dop_name);
      fd.append('phone_2_dop_number', client.phone_2_dop_number);
      fd.append('phone_3_dop_name', client.phone_3_dop_name);
      fd.append('phone_3_dop_number', client.phone_3_dop_number);
      fd.append('phone_4_dop_name', client.phone_4_dop_name);
      fd.append('phone_4_dop_number', client.phone_4_dop_number);

      if(passport__1)
      {
         fd.append('passport_1_img', passport__1, passport__1.name);
      }


      if(passport__2)
      {
         fd.append('passport_2_img', passport__2, passport__2.name);
      }

      if(prava__1)
      {
         fd.append('prava_1_img', prava__1, prava__1.name);
      }

      if(prava__2)
      {
         fd.append('prava_2_img', prava__2, prava__2.name);
      }
      

    return this.http.post<Client>(`/api/clients`, fd);
  }

  // Создаем нового юр/лица
   create_lawfase(client: Client_Law_Fase, doc_1_img?: File, doc_2_img?: File, doc_3_img?: File, doc_4_img?: File): Observable<Client_Law_Fase> {
    const fd = new FormData(); 
      fd.append('name', client.name);
      fd.append('short_name', client.short_name);
      fd.append('inn', client.inn);
      fd.append('kpp', client.kpp);
      fd.append('ogrn', client.ogrn);
      fd.append('ogrn_ip', client.ogrn_ip);
      fd.append('svidetelstvo_ip', client.svidetelstvo_ip);
      fd.append('law_address', client.law_address);
      fd.append('fact_address', client.fact_address);
      fd.append('mail_address', client.mail_address);
      fd.append('boss_role', client.boss_role);
      fd.append('boss_name', client.boss_name);
      fd.append('boss_surname', client.boss_surname);
      fd.append('boss_lastname', client.boss_lastname);
      fd.append('osnovanie_boss_role', client.osnovanie_boss_role);
      fd.append('number_1', client.number_1);
      fd.append('number_2', client.number_2);
      fd.append('email', client.email);
      fd.append('rc_number', client.rc_number);
      fd.append('kor_rc_number', client.kor_rc_number);
      fd.append('bik_number', client.bik_number);
      fd.append('name_bank', client.name_bank);


      if (doc_1_img)
      {
         fd.append('doc_1_img', doc_1_img, doc_1_img.name);
      }


      if (doc_2_img)
      {
         fd.append('doc_2_img', doc_2_img, doc_2_img.name);
      }

      if (doc_3_img)
      {
         fd.append('doc_3_img', doc_3_img, doc_3_img.name);
      }

      if (doc_4_img)
      {
         fd.append('doc_4_img', doc_4_img, doc_4_img.name);
      }
      

      return this.http.post<Client_Law_Fase>(`/api/clients/create_law_fase`, fd);
  }

  // Получаем физ/лиц
  fetch(params: any = {}): Observable<Client[]> {
    return this.http.get<Client[]>('/api/clients', {
       params: new HttpParams({
          fromObject: params
       })
    });
  }

  // Получаем юр/лиц
   fetch_lawfase(params: any = {}): Observable<Client_Law_Fase[]> {
      return this.http.get<Client_Law_Fase[]>('/api/clients/law_fase_clients', {
       params: new HttpParams({
          fromObject: params
       })
    });
  }

  get_all(): Observable<Client[]>
  {
      return this.http.get<Client[]>('/api/clients/all');
  }


   // Удаление для физ/лиц
   delete(id: any): Observable<any>
   {
      return this.http.delete<any>(`/api/clients/${id}`);
   }


   // Удаление для физ/лиц
   delete_lawfase(id: any): Observable<any> {
      return this.http.delete<any>(`/api/clients/delete_lawfase/${id}`);
   }


   // Обновление для физ/лиц
   update(id:string, xsclient: Client,  passport__1?: File,passport__2?: File,prava__1?: File, prava__2?: File): Observable<Client> {
      const fd = new FormData(); 
      fd.append('name', xsclient.name);
      fd.append('surname', xsclient.surname);
      fd.append('lastname', xsclient.lastname);
      fd.append('makedate', xsclient.makedate);
      fd.append('passport_seria', xsclient.passport_seria);
      fd.append('passport_number', xsclient.passport_number);
      fd.append('passport_date', xsclient.passport_date);
      fd.append('passport_who_take', xsclient.passport_who_take);
      fd.append('code_podrazdeleniya', xsclient.code_podrazdeleniya);
      fd.append('passport_register', xsclient.passport_register);
      fd.append('passport_address_fact', xsclient.passport_address_fact);
      fd.append('prava_seria', xsclient.prava_seria);
      fd.append('prava_number', xsclient.prava_number);
      fd.append('prava_date', xsclient.prava_date);
      fd.append('phone_main', xsclient.phone_main);
      fd.append('phone_1_dop_name', xsclient.phone_1_dop_name);
      fd.append('phone_1_dop_number', xsclient.phone_1_dop_number);
      fd.append('phone_2_dop_name', xsclient.phone_2_dop_name);
      fd.append('phone_2_dop_number', xsclient.phone_2_dop_number);
      fd.append('phone_3_dop_name', xsclient.phone_3_dop_name);
      fd.append('phone_3_dop_number', xsclient.phone_3_dop_number);
      fd.append('phone_4_dop_name', xsclient.phone_4_dop_name);
      fd.append('phone_4_dop_number', xsclient.phone_4_dop_number);
      fd.append('clientId', id);

      if(passport__1)
      {
         fd.append('passport_1_img', passport__1, passport__1.name);
      }


      if(passport__2)
      {
         fd.append('passport_2_img', passport__2, passport__2.name);
      }

      if(prava__1)
      {
         fd.append('prava_1_img', prava__1, prava__1.name);
      }

      if(prava__2)
      {
         fd.append('prava_2_img', prava__2, prava__2.name);
      }

      return this.http.patch<Client>(`/api/clients/update/${id}`, fd);
   }




   // Обновление для юр/лиц
   update_lawfase(id: string, xsclient: Client_Law_Fase, doc_1_img?: File, doc_2_img?: File, doc_3_img?: File, doc_4_img?: File): Observable<Client_Law_Fase> {
      const fd = new FormData(); 
      fd.append('name', xsclient.name);
      fd.append('short_name', xsclient.short_name);
      fd.append('inn', xsclient.inn);
      fd.append('kpp', xsclient.kpp);
      fd.append('ogrn', xsclient.ogrn);
      fd.append('ogrn_ip', xsclient.ogrn_ip);
      fd.append('svidetelstvo_ip', xsclient.svidetelstvo_ip);
      fd.append('law_address', xsclient.law_address);
      fd.append('fact_address', xsclient.fact_address);
      fd.append('mail_address', xsclient.mail_address);
      fd.append('boss_role', xsclient.boss_role);
      fd.append('boss_name', xsclient.boss_name);
      fd.append('boss_surname', xsclient.boss_surname);
      fd.append('boss_lastname', xsclient.boss_lastname);
      fd.append('osnovanie_boss_role', xsclient.osnovanie_boss_role);
      fd.append('number_1', xsclient.number_1);
      fd.append('number_2', xsclient.number_2);
      fd.append('email', xsclient.email);
      fd.append('rc_number', xsclient.rc_number);
      fd.append('kor_rc_number', xsclient.kor_rc_number);
      fd.append('bik_number', xsclient.bik_number);
      fd.append('name_bank', xsclient.name_bank);
      fd.append('clientId', id);

      if (doc_1_img)
      {
         fd.append('doc_1_img', doc_1_img, doc_1_img.name);
      }


      if (doc_2_img)
      {
         fd.append('doc_2_img', doc_2_img, doc_2_img.name);
      }

      if (doc_3_img)
      {
         fd.append('doc_3_img', doc_3_img, doc_3_img.name);
      }

      if (doc_4_img)
      {
         fd.append('doc_4_img', doc_4_img, doc_4_img.name);
      }

      return this.http.patch<Client_Law_Fase>(`/api/clients/update_lawfase/${id}`, fd);
   }


   // Получаем позицию по id для физ/лиц
   getById(id: string): Observable<Client>
   {
      return this.http.get<Client>(`/api/clients/${id}`);
   }

   // Получаем позицию по id для Юр/лиц
   getByIdLawfase(id: string): Observable<Client_Law_Fase>
   {
      return this.http.get<Client_Law_Fase>(`/api/clients/lawfase_by_id/${id}`);
   }


}