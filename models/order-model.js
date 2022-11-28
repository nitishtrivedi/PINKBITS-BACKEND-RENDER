//--SCHEMAS--
//Create Orders Schema. Refer Mongoose Documentation for more
//Call the Mongoose library for the Product Schema


const mongoose = require('mongoose');

//Define the schema
const orderSchema = mongoose.Schema({

    //relating to order Item. relating from orderItem schema
    orderItems:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        require: true
    }],
    shippingAddress1: {
        type: String,
        require: true
    },
    shippingAddress2: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    pin: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
})

//Convert _id to id
orderSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true
});

//Creating the model
exports.Order = mongoose.model('Order', orderSchema);