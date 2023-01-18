const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Создаем схему для таблицы clients

const clientLawFaseSchema = new Schema({


    // Тип клиента
    type: {
        type: String,
        default: 'law',
        required: true,
    },

    // Имя
    name: {
        type: String,
        default: '',
        required: true,
    },

    // Сокращенное наименование
    short_name: {
        type: String,
        default: '',
        required: true,
    },

    // ИНН
    inn: {
        type: String,
        default: '',
        required: true,
    },

    // КПП
    kpp: {
        type: String,
        default: '',
        required: true,
    },


    // ОГРН
    ogrn: {
        type: String,
        default: '',
        required: false,
    },

    // ОГРН
    ogrn_ip: {
        type: String,
        default: '',
        required: false,
    },

    // Номер свидетельства
    svidetelstvo_ip: {
        type: String,
        default: '',
        required: false,
    },


    


    // Юридический адрес
    law_address: {
        type: String,
        default: '',
        required: true,
    },

    // Фактический адрес
    fact_address: {
        type: String,
        default: '',
        required: true,
    },


    // Почтовый адрес
    mail_address: {
        type: String,
        default: '',
        required: true,
    },


    // Должность рукводителя
    boss_role: {
        type: String,
        default: '',
        required: true,
    },


    // Имя руководителя
    boss_name: {
        type: String,
        default: '',
        required: true,
    },


    // Фамилия руководителя
    boss_surname: {
        type: String,
        default: '',
        required: true,
    },

    // Отчество руководителя
    boss_lastname: {
        type: String,
        default: '',
        required: true,
    },

    // Основание назвначиения руководителя
    osnovanie_boss_role: {
        type: String,
        default: '',
        required: true,
    },

    // Номер телефона №1
    number_1: {
        type: String,
        default: '',
        required: true,
    },

    // Номер телефона №2
    number_2: {
        type: String,
        default: '',
        required: true,
    },


    // Email
    email: {
        type: String,
        default: '',
        required: true,
    },


    // Рассчетный счет
    rc_number: {
        type: String,
        default: '',
        required: true,
    },


    // Корреспондентский счет
    kor_rc_number: {
        type: String,
        default: '',
        required: true,
    },


    // БИК Банка
    bik_number: {
        type: String,
        default: '',
        required: true,
    },


    // Наименование Банка
    name_bank: {
        type: String,
        default: '',
        required: true,
    },

    
    // Документ №1
    doc_1_img: {
        type: String,
        default: '',
        required: true,
    },

    /// Документ №2
    doc_2_img: {
        type: String,
        default: '',
        required: true,
    },

    order: {
        type: Number,
        default: 0,
        required: true,
    },


    // Документ №3
    doc_3_img: {
        type: String,
        default: '',
        required: false,
    },


    // Документ №4
    doc_4_img: {
        type: String,
        default: '',
        required: false,
    },

    

    // Пользователь который создал партнера
    user: {
        type: String,
        default: '',
        required: true,
    },

    // Дата создания
    date: {
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model('clients_Law_Fase', clientLawFaseSchema);