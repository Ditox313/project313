const bodyParser = require('body-parser');
const Smena = require('../models/Smena');
const errorHandler = require('../Utils/errorHendler');





module.exports.create = async function(req, res) {
    try {

        // Ищем номер последнего заказа глобального
        const lastOrder = await Smena.findOne({
            
        }).sort({ date: -1 });


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


