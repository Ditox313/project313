const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы cars

const carSchema = new Schema({

    // Марка
    marka: {
        type: String,
        default: '',
        required: true,
    },


    // Модель
    model: {
        type: String,
        default: '',
        required: true,
    },


    // Номер
    number: {
        type: String,
        default: '',
        required: true,
    },


    // VIN автомобиля
    vin: {
        type: String,
        default: '',
        required: false,
    },

    // Номер кузова
    kuzov_number: {
        type: String,
        default: '',
        required: false,
    },

    // Год выпуска
    year_production: {
        type: String,
        default: '',
        required: false,
    },

    // Пробег
    probeg: {
        type: String,
        default: '',
        required: false,
    },

    // Трансмиссия
    transmission: {
        type: String,
        default: '',
        required: false,
    },






    // Начало аренды
    start_arenda: {
        type: String,
        default: '',
        required: false,
    },


    // Конец аренды
    end_arenda: {
        type: String,
        default: '',
        required: false,
    },


    // Владелец
    vladelec: {
        type: String,
        default: '',
        required: false,
    },


    // Статус
    status: {
        type: String,
        default: '',
        required: false,
    },


    // Категория
    category: {
        type: String,
        default: '',
        required: false,
    },



    user: {
        ref: 'users',
        type: Schema.Types.ObjectId
    },




    // Создаем поле изображения юзера
    previewSrc: {
        type: String,
        default: '',
        required: false,
    },



    // Дата создания
    date: {
        type: Date,
        default: Date.now,
    },



    // Серия СТС
    sts_seria: {
        type: String,
        default: '',
        required: false,
    },

    // Номер СТС
    sts_number: {
        type: String,
        default: '',
        required: false,
    },

    // Дата выдачи СТС
    sts_date: {
        type: String,
        default: '',
        required: false,
    },


    // Серия ОСАГО
    osago_seria: {
        type: String,
        default: '',
        required: false,
    },

    // Номер ОСАГО
    osago_number: {
        type: String,
        default: '',
        required: false,
    },

    // Дата окончания полиса ОСАГО
    osago_date_finish: {
        type: String,
        default: '',
        required: false,
    },


    // Цвет
    color: {
        type: String,
        default: '',
        required: false,
    },


    // Оценочная стоимость
    price_ocenka: {
        type: String,
        default: '',
        required: false,
    },


    // Дата последнего ТО
    to_date: {
        type: String,
        default: '',
        required: false,
    },

    // Пробег на последнем ТО
    to_probeg_prev: {
        type: String,
        default: '',
        required: false,
    },


    // Пробег для следующего ТО
    to_probeg_next: {
        type: String,
        default: '',
        required: false,
    },

    // Интервал ТО
    to_interval: {
        type: String,
        default: '',
        required: false,
    },

    // Наименование моторного масла
    oil_name: {
        type: String,
        default: '',
        required: false,
    },

    // Назание СТОА
    stoa_name: {
        type: String,
        default: '',
        required: false,
    },

    // Телефон СТОА
    stoa_phone: {
        type: String,
        default: '',
        required: false,
    },

    // Тариф (1-2 дня)
    days_1_2: {
        type: String,
        default: '',
        required: false,
    },

    // Тариф (3-7 дня)
    days_3_7: {
        type: String,
        default: '',
        required: false,
    },

    // Тариф (8-14 дня)
    days_8_14: {
        type: String,
        default: '',
        required: false,
    },


    // Тариф (15-30 дня)
    days_15_30: {
        type: String,
        default: '',
        required: false,
    },

    // Тариф (31+)
    days_31_more: {
        type: String,
        default: '',
        required: false,
    },

    // Тариф (Межгород)
    mezgorod: {
        type: String,
        default: '',
        required: false,
    },

    // Тариф (Россия)
    russia: {
        type: String,
        default: '',
        required: false,
    },

    // Тариф (Доп час)
    price_dop_hour: {
        type: String,
        default: '',
        required: false,
    },

    // Тариф (Залог)
    zalog: {
        type: String,
        default: '',
        required: false,
    },

    zalog_mej: {
        type: String,
        default: '',
        required: false,
    },

    zalog_rus: {
        type: String,
        default: '',
        required: false,
    },


    status_booking: {
        type: String,
        default: '',
        required: false,
    },


    bookings: {
        type: Object,
        required: false,
    },



    // Пользователь который создал партнера
    user: {
        type: String,
        default: '',
        required: true,
    },
    
    

});


// Создаем таблицу cars
module.exports = mongoose.model('cars', carSchema);