const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const repostSmenaSchema = new Schema({



    smena: {
        type: Object,
        required: true,
    },



    user: {
        type: Object,
        required: true,
    },


    content: {
        type: String,
        required: true,
    },



    bookings: {
        type: Array,
        required: true,
    },



    cars: {
        type: Array,
        required: true,
    },



    money: {
        type: Object,
        required: true,
    },



    date: {
        type: Date,
        default: Date.now,
        required: false,
    },

    

});



module.exports = mongoose.model('reports_smena', repostSmenaSchema);