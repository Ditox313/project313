const bodyParser = require('body-parser');
const Dogovor = require('../models/Dogovor');
const BookingAct = require('../models/BookingAct');
const ReportSmena = require('../models/ReportsSmena');
const errorHandler = require('../Utils/errorHendler');





// Контроллер для create
module.exports.create_dogovor = async function(req, res) {
    try {

        const updated = req.body;

        const dogovorsUpdateState = await Dogovor.updateMany(
            { clientId: updated.clientId },
            { state: 'no_active' }
        );


        const dogovor = await new Dogovor({
            date_start: req.body.date_start ,
            dogovor_number: req.body.dogovor_number,
            date_end: req.body.date_end,
            client: req.body.client,
            administrator: req.body.administrator,
            content: req.body.content,
            clientId: req.body.clientId,
            state: req.body.state,
        }).save();


        res.status(201).json(dogovor);
    } catch (e) {
        errorHandler(res, e);
    }
};


// Контроллер для create report smena
module.exports.create_report_smena = async function (req, res) {
    try {

        const report = await new ReportSmena({
            smena: req.body.smena,
            user: req.body.user,
            content: req.body.content,
            bookings: req.body.bookings,
            cars: req.body.cars,
            money: req.body.money,
        }).save();


        res.status(201).json(report);
    } catch (e) {
        errorHandler(res, e);
    }
};




// Контроллер для create_booking_act
module.exports.create_booking_act = async function (req, res) {
    try {

        const act = await new BookingAct({
            date: req.body.date,
            act_number: req.body.act_number,
            administrator: req.body.administrator,
            content: req.body.content,
            clientId: req.body.clientId,
            booking: req.body.booking,
            bookingId: req.body.bookingId,
        }).save();


        res.status(201).json(act);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Получаем список договоров для клиента
module.exports.getDogovorsById = async function(req, res) {
    try {

        const dogovors = await Dogovor.find({
            clientId: req.params.id
        }).sort({ date: -1 })
            

        res.status(200).json(dogovors);
    } catch (e) {
        errorHandler(res, e);
    }
};




// Получаем акт по id
module.exports.getActById = async function (req, res) {
    try {

        const act = await BookingAct.findOne({
            _id: req.params.id
        }).sort({ date: -1 })


        res.status(200).json(act);
    } catch (e) {
        errorHandler(res, e);
    }
};




// Получаем Отчет за смену по id
module.exports.getReportSmenaById = async function (req, res) {
    try {

        const report = await ReportSmena.findOne({
            'smena._id': req.params.id
        }).sort({ date: -1 });


        res.status(200).json(report);
    } catch (e) {
        errorHandler(res, e);
    }
};




// Получаем список актов для брони по id брони
module.exports.getActsByIdBooking = async function (req, res) {
    try {

        const acts = await BookingAct.find({
            bookingId: req.params.id
        })


        res.status(200).json(acts);
    } catch (e) {
        errorHandler(res, e);
    }
};




// Получаем активный договор для клиента
module.exports.getDogovorActive = async function (req, res) {
    try {

        const dogovor_active = await Dogovor.find({
            clientId: req.params.id,
            state: 'active'
        })


        res.status(200).json(dogovor_active);
    } catch (e) {
        errorHandler(res, e);
    }
};




// Получаем договор по id
module.exports.getDogovorById = async function (req, res) {
    try {

        const dogovor = await Dogovor.findOne({
            _id: req.params.id
        })


        res.status(200).json(dogovor);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для изменения state для всех договоров клиента при создании нового
module.exports.update_state = async function(req, res) {
    try {

        const updated = req.body;

        const dogovorsUpdateState = await Dogovor.updateMany(
            { clientId: updated.clientId },
            { state: 'no_active' }
        );


        res.status(200).json(dogovorsUpdateState);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для remove
module.exports.remove_dogovor = async function(req, res) {
    try {
        await Dogovor.remove({
            _id: req.params.id
        });

        // Возвращаем результат
        res.status(200).json({
            message: "Договор удален"
        });
    } catch (e) {
        errorHandler(res, e);
    }
};



// Контроллер для remove act
module.exports.remove_act = async function (req, res) {
    try {
        await BookingAct.remove({
            _id: req.params.id
        });

        // Возвращаем результат
        res.status(200).json({
            message: "Акт удален"
        });
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для fetch
module.exports.fetch = async function(req, res) {
    try {
        const dogovors = await Dogovor.find({
                clientId: req.query.clientId 
            }).sort({ date: -1 })
            .skip(+req.query.offset) 
            .limit(+req.query.limit); 

        // Возвращаем пользователю позиции 
        res.status(200).json(dogovors);
    } catch (e) {
        errorHandler(res, e);
    }
};







// Контроллер для fetch_acts
module.exports.fetch_acts = async function (req, res) {
    try {
        const acts = await BookingAct.find({
            clientId: req.query.clientId
        }).sort({ date: -1 })
            .skip(+req.query.offset)
            .limit(+req.query.limit);

        // Возвращаем пользователю позиции 
        res.status(200).json(acts);
    } catch (e) {
        errorHandler(res, e);
    }
};

















