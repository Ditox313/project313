// Подключаем пакет для работы с загрузкой файлов
const multer = require('multer');

// Пакет для удобной работы с данными в js
const moment = require('moment');








// Создаем переменную storage. Она описывает как будут хранится и где будут хранится загруженный файлы. 
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/docs');
    },
    filename(req, file, cb) {
        const date = moment().format('DDMMYYYY-HHmmss_SS');
        cb(null, `${date}-${file.originalname}`);
    }
});



// Валидатор
const fileFilter = function(req, file, cb) {
    // if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    //     cb(null, true);
    // } else {
    //     cb(null, false);
    // }

    cb(null, true);
};






// Лимитирование размера
const limits = {
    fileSize: 1024 * 1024 * 5
};





module.exports = multer({
    storage: storage,
    limits: limits,
    fileFilter: fileFilter
})