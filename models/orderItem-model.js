//--SCHEMAS--
//Create Orders Schema. Refer Mongoose Documentation for more
//Call the Mongoose library for the Product Schema


const mongoose = require('mongoose');

//Define the schema
const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

//Creating the model
exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);