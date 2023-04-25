
const Settings = require('../models/Settings.js');
const errorHandler = require('../Utils/errorHendler');


// Контроллер для createSettings
module.exports.createSettings = async function (req, res) {
    try {



        const settings = await new Settings({
            share_avto: req.body.share_avto,
            input_avto: req.body.input_avto,
            washing_avto: req.body.washing_avto,
            additionally_avto: req.body.additionally_avto,
            userId: req.body.userId
        }).save();

        // Возвращаем пользователю позицию которую создали 
        res.status(201).json(settings);
    } catch (e) {
        errorHandler(res, e);
    }
};



// Контроллер для updateSettings
module.exports.updateSettings = async function(req, res) {
    try {
        const updated = req.body;

        // Находим и обновляем позицию. 
        const settings = await Settings.findOneAndUpdate({ userId: req.user.id }, //Ищем по id
            { $set: updated }, //Обновлять мы будем body запроса. В req.body находятся данные на которые будем менять старые
            { new: true } //обновит позицию и верет нам уже обновленную
        );

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(settings);
    } catch (e) {
        errorHandler(res, e);
    }
};





// Контроллер для updateSettings
module.exports.getSettingsUser = async function (req, res) {
    try {
        // Находим и обновляем позицию. 
        const settings = await Settings.findOne({ userId: req.params.id });

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(settings);
    } catch (e) {
        errorHandler(res, e);
    }
};


