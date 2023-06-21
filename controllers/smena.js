const bodyParser = require('body-parser');
const Smena = require('../models/Smena');
const errorHandler = require('../Utils/errorHendler');
const ReportSmena = require('../models/ReportsSmena');





module.exports.create = async function(req, res) {
    try {

        // Ищем номер последнего заказа глобального
        const lastOrder = await Smena.findOne({}).sort({ date: -1 });


        // Если мы нашли предполагаемы последнйи заказ, то устанвливает поле order
        const maxOrder = lastOrder ? lastOrder.order : 0;



        const smena = await new Smena({
            open_date: req.body.open_date,
            open_date_time: req.body.open_date_time,
            responsible: req.body.responsible,
            status: req.body.status,
            close_date: req.body.close_date,
            close_date_time: req.body.close_date_time,
            userId: req.body.userId,
            order: maxOrder + 1
        }).save();
        

        res.status(201).json(smena);
    } catch (e) {
        errorHandler(res, e);
    }
};






// Контроллер для fetch
module.exports.fetch = async function (req, res) {
    try {

        const smenas = await Smena.find({}).sort({ date: -1 })
            .skip(+req.query.offset) //Отступ для бесконечного скрола на фронтенде. Приводим к числу
            .limit(+req.query.limit); //Сколько выводить на фронтенде. Приводим к числу

        // Возвращаем пользователю позиции 
        res.status(200).json(smenas);
    } catch (e) {
        errorHandler(res, e);
    }
};








// Контроллер для remove
module.exports.remove = async function (req, res) {
    try {
        await Smena.remove({
            _id: req.params.id
        });

        await ReportSmena.remove({
            'smena._id': req.params.id
        });
        



        // Возвращаем результат
        res.status(200).json({
            message: "Смена удалена"
        });
    } catch (e) {
        errorHandler(res, e);
    }
};



// Контроллер для getSmena
module.exports.getSmena = async function (req, res) {
    try {
        const smena = await Smena.findOne({ status: 'open' }, (err, doc) => {
            if (err) {
                // обработка ошибок
            } else {
                console.log(doc); // выводим найденный документ
            }
        });


        // Возвращаем результат
        res.status(200).json(smena);
    } catch (e) {
        errorHandler(res, e);
    }
};



// Контроллер для getById
module.exports.getById = async function (req, res) {
    try {
        const smena = await Smena.findById(req.params.id); //Ищем категорию по id из переданных параметров
        res.status(200).json(smena);
    } catch (e) {
        errorHandler(res, e);
    }
};






// Контроллер для close
module.exports.close = async function (req, res) {
    try {

        const smena = await Smena.updateMany(
            { _id: req.params.id }, // выбираем объект и элемент массива по соответствующим ID
            // { $set: { "status": 'close' }, { "close_date": req.body.close_date} }
            { $set: { "status": 'close', "close_date": req.body.close_date, "close_date_time": req.body.close_date_time, } }
        );

        const smena_for_responce = await Smena.findOne(
            { _id: req.params.id }, // выбираем объект и элемент массива по соответствующим ID
        );


        // Возвращаем результат
        res.status(200).json(smena_for_responce);
    } catch (e) {
        errorHandler(res, e);
    }
};