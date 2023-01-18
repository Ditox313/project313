const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const bookingActSchema = new Schema({


    user: {
        ref: 'users',
        type: Schema.Types.ObjectId
    },

    // Дата создания
    date: {
        type: String,
        required: true,
    },


    // Номер договора
    act_number: {
        type: String,
        required: true,
    },


    // Администратор
    administrator: {
        type: Object,
        required: true,
    },


    //Контент
    content: {
        type: String,
        required: true,
    },


    //Id клиента
    clientId: {
        type: String,
        required: true,
    },


    //Бронь
    booking: {
        type: Object,
        required: true,
    },


    //Id брони
    bookingId: {
        type: String,
        required: true,
    },
    

    

});



module.exports = mongoose.model('booking_acts', bookingActSchema);