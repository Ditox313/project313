const bodyParser = require('body-parser');
const Car = require('../models/Car');
const errorHandler = require('../Utils/errorHendler');
const Booking = require('../models/Booking');





// Контроллер для create
module.exports.create = async function(req, res) {
    try {
        const car = await new Car({
            marka: req.body.marka,
            model: req.body.model,
            number: req.body.number,
            probeg: req.body.probeg,
            transmission: req.body.transmission,
            start_arenda: req.body.start_arenda,
            end_arenda: req.body.end_arenda,
            vladelec: req.body.vladelec,
            status: req.body.status,
            category: req.body.category,
            previewSrc: req.file ? req.file.path : '', //Если файл загружен то задаем путь до файла
            user: req.user._id,

            sts_seria: req.body.sts_seria,
            sts_number: req.body.sts_number,
            sts_date: req.body.sts_date,
            osago_seria: req.body.osago_seria,
            osago_number: req.body.osago_number,
            osago_date_finish: req.body.osago_date_finish,
            vin: req.body.vin,
            kuzov_number: req.body.kuzov_number,
            color: req.body.color,
            year_production: req.body.year_production,
            price_ocenka: req.body.price_ocenka,
            to_date: req.body.to_date,
            to_probeg_prev: req.body.to_probeg_prev,
            to_probeg_next: req.body.to_probeg_next,
            to_interval: req.body.to_interval,
            oil_name: req.body.oil_name,
            stoa_name: req.body.stoa_name,
            stoa_phone: req.body.stoa_phone,

            days_1_2: req.body.days_1_2,
            days_3_7: req.body.days_3_7,
            days_8_14: req.body.days_8_14,
            days_15_30: req.body.days_15_30,
            days_31_more: req.body.days_31_more,
            mezgorod: req.body.mezgorod,
            russia: req.body.russia,
            price_dop_hour: req.body.price_dop_hour,
            zalog: req.body.zalog,
            zalog_mej: req.body.zalog_mej,
            zalog_rus: req.body.zalog_rus,
            // status_booking: req.body.status_booking,
        }).save();


    



        // Возвращаем пользователю позицию которую создали 
        res.status(201).json(car);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для fetch
module.exports.fetch = async function(req, res) {
    try {
        // Ищем в таблице позиции по 2 параметрам( по дефолту 1 параметр)
        const cars = await Car.find({
                user: req.user.id //Эти данные берем из объекта user который добавил пасспорт в запрос !!!
            }).sort({ date: -1 })
            .skip(+req.query.offset) //Отступ для бесконечного скрола на фронтенде. Приводим к числу
            .limit(+req.query.limit); //Сколько выводить на фронтенде. Приводим к числу

        // Возвращаем пользователю позиции 
        res.status(200).json(cars);
    } catch (e) {
        errorHandler(res, e);
    }
};

// Контроллер для fetchNoParams
module.exports.fetchNoParams = async function (req, res) {
    try {
        // Ищем в таблице позиции по 2 параметрам( по дефолту 1 параметр)
        const cars = await Car.find({
        }).sort({ date: -1 })

        // Возвращаем пользователю позиции 
        res.status(200).json(cars);
    } catch (e) {
        errorHandler(res, e);
    }
};









// Контроллер для update
module.exports.update = async function(req, res) {
    try {

        const updated = req.body;


        // Если объект file есть,то заполняем параметр путем фала
        if (req.file) {
            updated.previewSrc = req.file.path;
        }





        // Находим и обновляем позицию. 
        const carUpdate = await Car.findOneAndUpdate({ _id: updated.carId }, //Ищем по id
            { $set: updated }, //Обновлять мы будем body запроса. В req.body находятся данные на которые будем менять старые
            { new: true } //обновит позицию и верет нам уже обновленную
        );

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(req.body);
    } catch (e) {
        errorHandler(res, e);
    }
};



// Добавляем бронь в массив броней в авто
module.exports.update_after_booking_create = async function (req, res) {
    try {

        const updated = req.body;


        const carUpdate = await Car.updateOne(
            { _id: updated.car._id },
            { $push: { bookings: updated }, $set: { status_booking: 'Бронь' } }
        )

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(carUpdate);
    } catch (e) {
        errorHandler(res, e);
    }
};




// При закрытии брони добаляем инфу в авто
module.exports.updateBookingInCar = async function (req, res) {
    try {

        const updated = req.body;



        const carUpdate = await Car.updateOne(
            { _id: req.params.id, "bookings._id": updated._id }, // выбираем объект и элемент массива по соответствующим ID
            { $set: { "bookings.$": updated } } 
        );

        

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json('test');
    } catch (e) {
        errorHandler(res, e);
    }
};






// Контроллер для закрытия брони
module.exports.close = async function (req, res) {
    try {

        const updated = req.body;

        const update = {
            $set: {
                probeg: updated.probeg,
            },
        }

        const carUpdate = await Car.findOneAndUpdate({ _id: req.params.id }, //Ищем по id
            update,
            { new: true }
        );

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(carUpdate);
    } catch (e) {
        errorHandler(res, e);
    }
};






// Контроллер для getById
module.exports.getById = async function(req, res) {
    try {
        const xscar = await Car.findById(req.params.id); //Ищем категорию по id из переданных параметров
        res.status(200).json(xscar);
    } catch (e) {
        errorHandler(res, e);
    }
};






// Контроллер для remove
module.exports.remove = async function(req, res) {
    try {
        await Car.remove({
            _id: req.params.id
        });


        // Возвращаем результат
        res.status(200).json({
            message: "Автомобиль удален"
        });
    } catch (e) {
        errorHandler(res, e);
    }
};