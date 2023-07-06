const bodyParser = require('body-parser');
const Client = require('../models/Clients/Client');
const Client_Law_Face = require('../models/Clients/Client_Law_Fase');
const errorHandler = require('../Utils/errorHendler');





// Контроллер для create физ/лица
module.exports.create = async function(req, res) {
    try {

        // Ищем номер последнего заказа глобального
        const lastOrder = await Client.findOne({
            user: req.user.id
        }).sort({ date: -1 });


        // Если мы нашли предполагаемы последнйи заказ, то устанвливает поле order
        const maxOrder = lastOrder ? lastOrder.order : 0;

        const partner = await new Client({
            name: req.body.name,
            surname: req.body.surname,
            lastname: req.body.lastname,
            makedate: req.body.makedate,
            passport_seria: req.body.passport_seria,
            passport_number: req.body.passport_number,
            passport_date: req.body.passport_date,
            passport_who_take: req.body.passport_who_take,
            code_podrazdeleniya: req.body.code_podrazdeleniya,
            passport_register: req.body.passport_register,
            passport_address_fact: req.body.passport_address_fact,
            prava_seria: req.body.prava_seria,
            prava_number: req.body.prava_number,
            prava_date: req.body.prava_date,
            phone_main: req.body.phone_main,
            phone_1_dop_name: req.body.phone_1_dop_name,
            phone_1_dop_number: req.body.phone_1_dop_number,
            phone_2_dop_name: req.body.phone_2_dop_name,
            phone_2_dop_number: req.body.phone_2_dop_number,
            phone_3_dop_name: req.body.phone_3_dop_name,
            phone_3_dop_number: req.body.phone_3_dop_number,
            phone_4_dop_name: req.body.phone_4_dop_name,
            phone_4_dop_number: req.body.phone_4_dop_number,
            user: req.user._id,
            isNoResident: req.body.isNoResident,
            passport_1_img: req.files.passport_1_img[0].path, //Если файл загружен то задаем путь до файла
            passport_2_img: req.files.passport_2_img[0].path, 
            prava_1_img: req.files.prava_1_img[0].path, 
            prava_2_img: req.files.prava_2_img[0].path,
            order: maxOrder + 1
            
        }).save();

        // Возвращаем пользователю позицию которую создали 
        res.status(201).json(partner);
    } catch (e) {
        errorHandler(res, e);
    }
};

// Контроллер для create юр/лица
module.exports.create_law_fase = async function (req, res) {
    try {

        // Ищем номер последнего заказа глобального
        const lastOrder = await Client_Law_Face.findOne({
            user: req.user.id
        }).sort({ date: -1 });


        // Если мы нашли предполагаемы последнйи заказ, то устанвливает поле order
        const maxOrder = lastOrder ? lastOrder.order : 0;


        const client = await new Client_Law_Face({
            name: req.body.name,
            short_name: req.body.short_name,
            inn: req.body.inn,
            kpp: req.body.kpp,
            ogrn: req.body.ogrn,
            ogrn_ip: req.body.ogrn_ip,
            svidetelstvo_ip: req.body.svidetelstvo_ip,
            law_address: req.body.law_address,
            fact_address: req.body.fact_address,
            mail_address: req.body.mail_address,
            boss_role: req.body.boss_role,
            boss_name: req.body.boss_name,
            boss_surname: req.body.boss_surname,
            boss_lastname: req.body.boss_lastname,
            osnovanie_boss_role: req.body.osnovanie_boss_role,
            number_1: req.body.number_1,
            number_2: req.body.number_2,
            email: req.body.email,
            rc_number: req.body.rc_number,
            kor_rc_number: req.body.kor_rc_number,
            bik_number: req.body.bik_number,
            name_bank: req.body.name_bank,
            user: req.user._id,
            doc_1_img: req.files.doc_1_img[0].path ? req.files.doc_1_img[0].path : '', 
            doc_2_img: req.files.doc_2_img[0].path ? req.files.doc_2_img[0].path : '',
            doc_3_img: req.files.doc_3_img[0].path ? req.files.doc_3_img[0].path : '',
            doc_4_img: req.files.doc_4_img[0].path ? req.files.doc_4_img[0].path : '',
            order: maxOrder + 1

        }).save();

        // Возвращаем пользователю позицию которую создали 
        res.status(201).json(client);
    } catch (e) {
        errorHandler(res, e);
    }
};






// Контроллер для fetch физ/лица
module.exports.fetch = async function(req, res) {
    try {
        // Ищем в таблице позиции по 2 параметрам( по дефолту 1 параметр)
        const clients = await Client.find({
                // user: req.user.id 
            }).sort({ date: -1 })
            .skip(+req.query.offset) //Отступ для бесконечного скрола на фронтенде. Приводим к числу
            .limit(+req.query.limit); //Сколько выводить на фронтенде. Приводим к числу

        // Возвращаем пользователю позиции 
        res.status(200).json(clients);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для fetch юр/лица
module.exports.fetch_lawfase = async function (req, res) {
    try {
        // Ищем в таблице позиции по 2 параметрам( по дефолту 1 параметр)
        const clients = await Client_Law_Face.find({
            // user: req.user.id 
        }).sort({ date: -1 })
            .skip(+req.query.offset) //Отступ для бесконечного скрола на фронтенде. Приводим к числу
            .limit(+req.query.limit); //Сколько выводить на фронтенде. Приводим к числу

        // Возвращаем пользователю позиции 
        res.status(200).json(clients);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для get_all
module.exports.get_all = async function(req, res) {
    try {
            // Ищем в таблице позиции по 2 параметрам( по дефолту 1 параметр)
            const clients = await Client.find({
                // user: req.user.id 
            })

        // Возвращаем пользователю позиции 
        res.status(200).json(clients);
    } catch (e) {
        errorHandler(res, e);
    }
};



// Контроллер для get_all
module.exports.get_all_law_face = async function (req, res) {
    try {
        // Ищем в таблице позиции по 2 параметрам( по дефолту 1 параметр)
        const clients = await Client_Law_Face.find({
            // user: req.user.id 
        })

        // Возвращаем пользователю позиции 
        res.status(200).json(clients);
    } catch (e) {
        errorHandler(res, e);
    }
};










// Контроллер для update для физ/лиц
module.exports.update = async function(req, res) {
    try {

        const updated = req.body;

        // // Если объект file есть,то заполняем параметр путем фала
        if (req.files.passport_1_img) {
            updated.passport_1_img = req.files.passport_1_img[0].path;
        }

        if (req.files.passport_2_img) {
            updated.passport_2_img = req.files.passport_2_img[0].path;
        }


        if (req.files.prava_1_img) {
            updated.prava_1_img = req.files.prava_1_img[0].path;
        }

        if (req.files.prava_2_img) {
            updated.prava_2_img = req.files.prava_2_img[0].path;
        }





        // Находим и обновляем позицию. 
        const clientUpdate = await Client.findOneAndUpdate({ _id: updated.clientId }, //Ищем по id
            { $set: updated }, //Обновлять мы будем body запроса. В req.body находятся данные на которые будем менять старые
            { new: true } //обновит позицию и верет нам уже обновленную
        );

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(clientUpdate);
    } catch (e) {
        errorHandler(res, e);
    }
};







// Контроллер для update для юр/лиц
module.exports.update_lawfase = async function (req, res) {
    try {

        const updated = req.body;

        // // Если объект file есть,то заполняем параметр путем фала
        if (req.files.doc_1_img) {
            updated.doc_1_img = req.files.doc_1_img[0].path;
        }

        if (req.files.doc_2_img) {
            updated.doc_2_img = req.files.doc_2_img[0].path;
        }

        if (req.files.doc_3_img) {
            updated.doc_3_img = req.files.doc_3_img[0].path;
        }

        if (req.files.doc_4_img) {
            updated.doc_4_img = req.files.doc_4_img[0].path;
        }





        // Находим и обновляем позицию. 
        const clientUpdate = await Client_Law_Face.findOneAndUpdate({ _id: updated.clientId }, //Ищем по id
            { $set: updated }, //Обновлять мы будем body запроса. В req.body находятся данные на которые будем менять старые
            { new: true } //обновит позицию и верет нам уже обновленную
        );

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(clientUpdate);
    } catch (e) {
        errorHandler(res, e);
    }
};






// Контроллер для getById для Физ/лиц
module.exports.getById = async function(req, res) {
    try {
        const xsclient = await Client.findById(req.params.id); //Ищем категорию по id из переданных параметров
        res.status(200).json(xsclient);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для getById для Юр/лиц
module.exports.getById_lawfase = async function (req, res) {
    try {
        const xsclient = await Client_Law_Face.findById(req.params.id); //Ищем категорию по id из переданных параметров
        res.status(200).json(xsclient);
    } catch (e) {
        errorHandler(res, e);
    }
};






// Контроллер для remove для физ/лиц
module.exports.remove = async function(req, res) {
    try {
        await Client.remove({
            _id: req.params.id
        });


        // Возвращаем результат
        res.status(200).json({
            message: "Клиент удален"
        });
    } catch (e) {
        errorHandler(res, e);
    }
};




// Контроллер для remove для юр/лиц
module.exports.remove_lawwfase = async function (req, res) {
    try {
        await Client_Law_Face.remove({
            _id: req.params.id
        });


        // Возвращаем результат
        res.status(200).json({
            message: "Клиент удален"
        });
    } catch (e) {
        errorHandler(res, e);
    }
};