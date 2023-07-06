const bodyParser = require('body-parser');
const Partner = require('../models/Partner');
const errorHandler = require('../Utils/errorHendler');





// Контроллер для create
module.exports.create = async function(req, res) {
    try {
        const partner = await new Partner({
            name: req.body.name,
            surname: req.body.surname,
            lastname: req.body.lastname,
            passport_seria: req.body.passport_seria,
            passport_number: req.body.passport_number,
            passport_date: req.body.passport_date,
            passport_who_take: req.body.passport_who_take,
            code_podrazdeleniya: req.body.code_podrazdeleniya,
            passport_register: req.body.passport_register,
            phone_main: req.body.phone_main,
            phone_1_dop_name: req.body.phone_1_dop_name,
            phone_1_dop_number: req.body.phone_1_dop_number,
            phone_2_dop_name: req.body.phone_2_dop_name,
            phone_2_dop_number: req.body.phone_2_dop_number,
            user: req.user._id,
            passport_1_img: req.files.passport_1_img[0].path, //Если файл загружен то задаем путь до файла
            passport_2_img: req.files.passport_2_img[0].path, 
        }).save();

        // Возвращаем пользователю позицию которую создали 
        res.status(201).json(partner);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для fetch
module.exports.fetch = async function(req, res) {
    try {
        // Ищем в таблице позиции по 2 параметрам( по дефолту 1 параметр)
        const partners = await Partner.find({
                // user: req.user.id 
            }).sort({ date: -1 })
            .skip(+req.query.offset) //Отступ для бесконечного скрола на фронтенде. Приводим к числу
            .limit(+req.query.limit); //Сколько выводить на фронтенде. Приводим к числу

        // Возвращаем пользователю позиции 
        res.status(200).json(partners);
    } catch (e) {
        errorHandler(res, e);
    }
};



// Контроллер для update
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



        // Находим и обновляем позицию. 
        const partnerUpdate = await Partner.findOneAndUpdate({ _id: updated.partnerId }, //Ищем по id
            { $set: updated }, //Обновлять мы будем body запроса. В req.body находятся данные на которые будем менять старые
            { new: true } //обновит позицию и верет нам уже обновленную
        );

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(partnerUpdate);
    } catch (e) {
        errorHandler(res, e);
    }
};



// Контроллер для getById
module.exports.getById = async function(req, res) {
    try {
        const xspartner = await Partner.findById(req.params.id); //Ищем категорию по id из переданных параметров
        res.status(200).json(xspartner);
    } catch (e) {
        errorHandler(res, e);
    }
};








// Контроллер для remove
module.exports.remove = async function(req, res) {
    try {
        await Partner.remove({
            _id: req.params.id
        });


        // Возвращаем результат
        res.status(200).json({
            message: "Партнер удален"
        });
    } catch (e) {
        errorHandler(res, e);
    }
};




// Контроллер для get_all
module.exports.get_all = async function(req, res) {
    try {
            // Ищем в таблице позиции по 2 параметрам( по дефолту 1 параметр)
            const partners = await Partner.find({
                // user: req.user.id 
            })

        // Возвращаем пользователю позиции 
        res.status(200).json(partners);
    } catch (e) {
        errorHandler(res, e);
    }
};


















