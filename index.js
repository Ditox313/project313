// Подключаем ядро приложееия
const app = require('./app.js');

// Задаем значение порта
const port = process.env.port || 5000;






// Запускаем сервер
app.listen(port, function() {
    console.log(`Сервер бэкэнда работает на порте ${port}`);
});