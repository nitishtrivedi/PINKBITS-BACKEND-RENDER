//--SCHEMAS--
//Create Categories Schema. Refer Mongoose Documentation for more
//Call the Mongoose library for the Product Schema


const mongoose = require('mongoose');

//Define the schema
const categorySchema = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    icon:{
        type: String,
    },
    color:{
        type: String,
    }
    //Add image schema as well whenever needed
})

//Convert _id to id
categorySchema.virtual('id').get(function() {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true
});


//Exporting the model
exports.Category = mongoose.model('Category', categorySchema);