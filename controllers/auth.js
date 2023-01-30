const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
const Settings = require('../models/Settings.js');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const errorHandler = require('../Utils/errorHendler');



// Контроллер для Login
module.exports.login = async function(req, res) {

    const candidate = await User.findOne({
        email: req.body.email
    });


    if (candidate) {
        // Проверяем на соответствие пароля
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);

        if (passwordResult) {
            // Генерация токена(Генереруем объект с данными о пользователе и его кодируем)
            const token = jwt.sign({
                    email: candidate.email,
                    userId: candidate._id
                },
                keys.jwt, { expiresIn: (60 * 60) * 24 }
            );


            const user = await User.findOne({
                _id: candidate._id
            })


            const userResponse = {
                email: user.email,
                _id: user._id
            }



            // Отправляем ответ
            res.status(200).json({
                token: `Bearer ${token}`,
                currentUser: userResponse
            });
        } else {
            res.status(401).json({
                message: "Ошибка. Пароли не совпадают. Попробуйте еще раз!"
            });
        }
    } else {
        res.status(404).json({
            message: "Пользователя с таким E-mail не найдено!"
        });
    }
};





// Контроллер для register 
module.exports.register = async function(req, res) {

    // Делаем проверку на наличие пользователя в БД
    const canditate = await User.findOne({
        email: req.body.email
    });

    if (canditate) {
        res.status(409).json({
            message: "Такой Email уже существует в системе. Проверьте правильность введенных данных!"
        });
    } else {
        // Шифрование пароля пользователя
        const salt = bcrypt.genSaltSync(10);
        const password = req.body.password;


        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        });

        const settings = new Settings({
            share_avto: {
                airport_price: '0',
                railway_price: '0',
                kristal_tc_price: '0',
                sitymol_tc_price: '0',
            },
            washing_avto: {
                komfort: '0',
                business: '0',
                premium: '0'
            },
            additionally_avto: {
                det_kreslo: '0',
                buster: '0',
                videoregister: '0',
                battery_charger: '0',
            }
        });


        const userResponse = {
            email: user.email,
            _id: user._id
        }

        try {
            await settings.save();
            await user.save();
            res.status(201).json(userResponse);
        } catch (error) {
            errorHandler(res, error);
        }
    }

};






// Контроллер для get_user
module.exports.get_user = async function (req, res) {
    // Делаем проверку на наличие пользователя в БД
    const user = await User.findOne({
        _id: req.user._id,
    });


    if (!user) {
        res.status(409).json({
            message: "Нет такого пользователя"
        });
    } else {
        try {
            res.status(200).json(user);
        } catch (error) {
            errorHandler(res, error);
        }
    }
}



// Контроллер для update
module.exports.update = async function (req, res) {
    try {

        // Шифрование пароля пользователя
        const salt = bcrypt.genSaltSync(10);


        const updated = req.body;
        if (req.body.password === null || req.body.password === '')
        {
            delete updated.password;
        }
        else
        {
            updated.password = bcrypt.hashSync(req.body.password, salt);
        }
        

    
        // Находим и обновляем позицию. 
        const UserUpdate = await User.findOneAndUpdate({ _id: req.user._id, }, //Ищем по id
            { $set: updated }, //Обновлять мы будем body запроса. В req.body находятся данные на которые будем менять старые
            { new: true } //обновит позицию и верет нам уже обновленную
        );

        // Возвращаем пользователю обновленную позицию 
        res.status(200).json(UserUpdate);
    } catch (e) {
        errorHandler(res, e);
    }
};