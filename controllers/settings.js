
const Settings = require('../models/Settings.js');
const errorHandler = require('../Utils/errorHendler');



// Контроллер для updateSettings
module.exports.updateSettings = async function(req, res) {
    try {
        const updated = req.body;

        // Находим и обновляем позицию. 
        const settings = await Settings.findOneAndUpdate({ _id: req.user.id }, //Ищем по id
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
        const settings = await Settings.findOne({ _id: req.params.id });

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(settings);
    } catch (e) {
        errorHandler(res, e);
    }
};


