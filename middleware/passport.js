// Подключаем модуль стратегии авторизации
const JwtStrategy = require('passport-jwt').Strategy;

// Подключаем mongoose
const mongoose = require('mongoose');

// Подключаем модель User
const User = require('../models/User');

// Извлекаем токен их Header
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Подключаем config.keys
const keys = require('../config/keys');






// Генерируем объет опций , который мы будем использовать с данной стратегией (Некие настройки токена, с которым будем работать). Получаем токен из хедера
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.jwt
};




// Экспортируем функцию
module.exports = function(passport){
    passport.use(
        new JwtStrategy(options, async function (payload, done) {
            try
            {   
                const user = await User.findById(payload.userId).select('email id'); //Ищем пользователя по данным из Токена.

                if (user) {
                    done(null, user);
                } else {
                    done(null, false);
                }
            }
            catch(e)
            {
                console.log('Ошибка');
            }
            
        })
    );
};