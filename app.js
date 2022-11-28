//---------------------------------------------------------------------------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//
//----------------------------------------------       BACKEND MAIN FILE     ------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//---------------------------------------------------------------------------------------------------------------------------------------//
//------------------------------------------------------   IMPORTS   --------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//-------Call installed libraries in the project. Distinguished categorically-------

//Call ExpressJS. Use 'npm install express' to install the library
const express = require("express");
const app = express();

//Install Morgan using 'npm install morgan'. Morgan is used for logging API requests. Refer Morgan documentation for more details
const morgan = require ('morgan');

//Install MONGOOSE. Run 'npm install mongoose' in terminal. Used for DB interaction with MongoDB
const mongoose = require ('mongoose');

//Install CORS> Run 'npm install cors' in terminal. CORS is Cross Origin Resource Sharing
const cors = require ('cors')

//Require dotenv library created by 'npm install dotenv' for the ".env" file
require("dotenv/config");
//Call helpers/jwt.js for user authentication function
const authJwt = require ('./helpers/jwt');
//Call error-handler.js for token related error handling
const errorHandlers = require('./helpers/error-handler');




//Initialise and use CORS in the application BEFORE the application starts
app.use(cors());
app.options('*', cors())
//Call the API variable from .env file
const api = process.env.API_URL;




//---------------------------------------------------------------------------------------------------------------------------------------//
//---------------------------------------------------   MIDDLEWARE   --------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//-----MIDDLEWARE-----
//Used as a middleware function of ExpressJS
app.use(express.json()); //Call Express in Middleware
app.use(morgan('tiny')); //Call Morgan in middleware
app.use(authJwt()); //Call jwt.js in middleware. DISABLE THIS OPTION FOR GETTING THE USER TOKEN FOR TESTING
app.use('/public/uploads', express.static(__dirname + '/public/uploads')); //Static Folder logic
app.use(errorHandlers);




//---------------------------------------------------------------------------------------------------------------------------------------//
//---------------------------------------------------     ROUTES   ----------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//-----ROUTERS (aka Routes)-----

const productsRouter = require ('./routers/products-router');
const categoriesRouter = require ('./routers/categories-router');
const ordersRouter = require ('./routers/orders-router');
const usersRouter = require('./routers/users-router');
const appSendEmail = require ('./send-email');


app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/sendemail`, appSendEmail)


//---------------------------------------------------------------------------------------------------------------------------------------//
//-----------------------------------   DATABASE CONNECTIONS AND LOCALHOST CONFIG  ------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//




//Create connection between application and MongoDB using Mongoose.
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DATABASE_NAME
})
.then(() => {
    console.log('Database Connected. Connected Database details are as follows:', process.env.DATABASE_NAME);
    console.log({
        'Database Name': process.env.DATABASE_NAME,
        'Database User ID': process.env.DATABASE_USERID,
        'Database Password': process.env.DATABASE_PWD
    })
}).catch((err) => {
    console.log(err);
})


//FOR DEPLOYMENT PURPOSES. 24/9/22
const PORT = process.env.PORT || 3000;


//Server requires listening to a specific port. Configuration as below
app.listen(PORT, () => {
    console.log("The API version is ", api)
    console.log("The Server is now Running on http://localhost:3000");
});
