

// Интерфейсы


// Интерфейс для юзера
export interface User
{
    _id?: string
    email: string,
    password?: string
    name?: string
    secondName?: string
    thirdName?: string
    doverenost?: string
    doverenostDate?: string
}


// Интерфейс для юзера
export interface Settings {
  _id?: string
  share_avto?: {
    airport_price?: any
    railway_price?: any
    kristal_tc_price?: any
    sitymol_tc_price?: any
  },
  input_avto?: {
    airport_price_input?: any
    railway_price_input?: any
    kristal_tc_price_input?: any
    sitymol_tc_price_input?: any
  },
  washing_avto?: {
    komfort?: any
    business?: any
    premium?: any
  },
  additionally_avto?: {
    det_kreslo?: any
    buster?: any
    videoregister?: any
    battery_charger?: any
    antiradar?: any
  },
  userId?: any
}





// Интерфейс для материалайза
export interface MaterialInstance
{
    open?(): void
    close?(): void
    destroy?(): void
}




//Интерфейс для сообщения
export interface Message
{
    message: string
}




// Интерфейс для датепикера
export interface MaterialDatepicker extends MaterialInstance {
  date?: Date;
}




//Интерфейс для автомобиля
export interface Car {
  marka: string;
  model: string;
  probeg: string;
  transmission: string;
  start_arenda: any;
  end_arenda: any;
  vladelec: string;
  category: string;
  status: string;
  previewSrc?: any;
  number: any;
  _id?: any;
  imagePreview?: any;
  sts_seria?: any;
  sts_number?: any;
  sts_date?: any;
  osago_seria?: any;
  osago_number?: any;
  osago_date_finish?: any;
  vin?: any;
  kuzov_number?: any;
  color?: any;
  year_production?: any;
  price_ocenka?: any;
  to_date?: any;
  to_probeg_prev?: any;
  to_probeg_next?: any;
  to_interval?: any;
  oil_name?: any;
  stoa_name?: any;
  stoa_phone?: any;
  days_1_2?: any;
  days_3_7?: any;
  days_8_14?: any;
  days_15_30?: any;
  days_31_more?: any;
  mezgorod?: any;
  russia?: any;
  price_dop_hour?: any;
  zalog?: any;
  zalog_mej?: any;
  zalog_rus?: any;
  user?: any;
  // status_booking?: any
  bookings?: any
}


//Интерфейс для клиента физ/лицо
export interface Client
{
    type?: string,
    name: string
    surname: string
    lastname: string
    makedate: string
    passport_seria: string
    passport_number: string
    passport_date: string
    passport_who_take: string
    code_podrazdeleniya: string
    passport_register: string
    passport_address_fact?: string
    prava_seria: string
    prava_number: string
    prava_date: string
    phone_main: string
    phone_1_dop_name?: string
    phone_1_dop_number?: string
    phone_2_dop_name?: string
    phone_2_dop_number?: string
    phone_3_dop_name?: any
    phone_3_dop_number?: any
    phone_4_dop_name?: any
    phone_4_dop_number?: any
    passport_1_img?: any
    passport_2_img?: any
    prava_1_img?: any
    prava_2_img?: any
    _id?: any,
    date?: any,
    order?: any
    isNoResident?: any
}




//Интерфейс для клиента Юр/лицо
export interface Client_Law_Fase
{
    type?: string,
    name: string
    short_name: string
    inn: string
    kpp: string
    ogrn?: string
    ogrn_ip?: string
    svidetelstvo_ip?: string
    law_address: string
    fact_address: string
    mail_address: string
    boss_role: string
    boss_name?: string
    boss_surname?: string
    boss_lastname?: string
    osnovanie_boss_role: string
    number_1: string
    number_2: string
    email: string
    rc_number: string
    kor_rc_number: string
    bik_number: string
    name_bank: string
    doc_1_img?: any
    doc_2_img?: any
    doc_3_img?: any
    doc_4_img?: any
    _id?: any,
    date?: any,
    order?: any
}




//Интерфейс для партнера
export interface Partner
{
    name: string
    surname: string
    lastname: string
    passport_seria: string
    passport_number: string
    passport_date: string
    passport_who_take: string
    code_podrazdeleniya: string
    passport_register: string
    phone_main: string
    passport_1_img?: any
    passport_2_img?: any
    _id?: any
}





// Интерфейс для state auth
export interface AuthStateInterface {
  currentUser: User | null;
  isLoggedIn: boolean | null;
  token: string | null;
}


// Интерфейс для state cars
export interface CarsStateInterface {
  cars: Car[]
}

// Интерфейс для state clients
export interface ClientsStateInterface {
  clients: Client[];
}


// Интерфейс для state partners
export interface PartnersStateInterface {
  partners: Partner[];
}




// Интерфейс для глобального state
export interface AppStateInterface {
  auth: AuthStateInterface;
}



// Ответ с сервера для login
export interface LoginResponse {
  token: string,
  currentUser: User
}



// Запрос для fetch в cars
export interface CarsFetcRequest {
  offset: any;
  limit: any;
}



// Интерфейс для брони
export interface Booking {
  car: any;
  client: any;
  place_start: any;
  place_end: any;
  tariff: any;
  comment?: any;
  booking_start: any;
  booking_end: any;
  _id?: any;
  car_meta?: any;
  client_meta?: any;
  date?: any;
  booking_days?: any;
  summa?: any
  summaFull?: any
  order?: any
  status?: any
  dop_hours?: any
  paidCount?: any
  extend?: any
  sale?: any
  dop_info_open?: any
  dop_info_close?: any
  updates?: any
  booking_zalog?: any,
  dogovor_number__actual?: any
  user?: any;
  booking_life_cycle?: any
  smenaId?: any
}



// Интерфейс для суммы брони
export interface Summa {
  car: any;
  tariff: any;
  booking_start: any;
  booking_end: any;
  summa: any;
  booking_days: any;
  summaFull: any,
  dop_hours: any
  checkedTarif?: any
  paidCount?: any
  sale?: any,
  place_start_price?: any,
  place_end_price?: any,
  additional_services_price?: any
}


// Интерфейс для платежа
export interface Pay {
  _id?: any;
  userId?: any;
  date?: any;
  vidPay?: any;
  pricePay?: any;
  typePay?: any;
  bookingId?: any;
  order?: any;
  smenaId?: any;
}



// Интерфейс для отчета за смегну
export interface ReportSmena {
  _id?: any;
  userId?: any;
  content?: any;
  bookings?: any;
  cars?: any;
  money?: any;
  smena?: any;
}




// Интерфейс для договора
export interface Dogovor {
  _id?: any;
  date_start?: any;
  dogovor_number?: any;
  date_end?: any;
  client?: any;
  administrator?: any;
  content?: any;
  clientId?: any;
  state?: any;
  date?: any;
}






// Интерфейс для акта брони
export interface BookingAct {
  _id?: any;
  date?: any;
  act_number?: any;
  administrator?: any;
  content?: any;
  clientId?: any;
  booking?: any;
  bookingId?: any;
}




// Интерфейс для акта брони
export interface Smena {
  _id?: any;
  open_date: any;
  open_date_time: any;
  responsible: string,
  status: string,
  close_date: any
  close_date_time: any
  userId: any
  order?: Number
}













