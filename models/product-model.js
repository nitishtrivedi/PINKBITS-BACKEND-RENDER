//--SCHEMAS--
//Create Products Schema. Refer Mongoose Documentation for more
//Call the Mongoose library for the Product Schema


const mongoose = require('mongoose');

//Define the schema
const productSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,

    },
    description:{
        type: String,
        require: true,
    },
    richDescription:{
        type: String,
        default:''
    },
    image: {
        type: String,
        default:''
    },
    images: [{
        type: String
    }],
    brand:{
        type: String,
        default:''
    },
    price:{
        type: Number,
        default: 0
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        require: true
    },
    countInStock:{
        type: Number,
        require: true,
        min: 0,
        max: 9999
    },
    numReviews:{
        type: Number,
        default: 0
    },
    isFeatured:{
        type: Boolean,
        default: false
    },
    dateCreated:{
        type: Date,
        default: Date.now,
    }
})

//Replace __id to id for better front end fetching data
productSchema.virtual('id').get(function() {
    return this._id.toHexString();
});
productSchema.set('toJSON', {
    virtuals: true
});

//Creating the model
exports.Product = mongoose.model('Product', productSchema);