const bodyParser = require('body-parser');
const Dogovor = require('../models/Dogovor');
const BookingAct = require('../models/BookingAct');
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










// Контроллер для update
// module.exports.update = async function(req, res) {
//     try {

//         const updated = req.body;


//         // Находим и обновляем позицию. 
//         const bookingUpdate = await Booking.findOneAndUpdate({ _id: updated._id }, //Ищем по id
//             { $set: updated }, //Обновлять мы будем body запроса. В req.body находятся данные на которые будем менять старые
//             { new: true } //обновит позицию и верет нам уже обновленную
//         );

//         // Возвращаем пользователю обновленную позицию 
//         res.status(200).json(bookingUpdate);
//     } catch (e) {
//         errorHandler(res, e);
//     }
// };




// Контроллер для getById
// module.exports.getById = async function(req, res) {
//     try {
//         const xsbooking = await Booking.findById(req.params.id); //Ищем категорию по id из переданных параметров
//         res.status(200).json(xsbooking);
//     } catch (e) {
//         errorHandler(res, e);
//     }
// };











