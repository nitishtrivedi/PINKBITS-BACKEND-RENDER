//---------------------------------------------------------------------------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//
//--------------------------------------       BACKEND PRODUCTS API CONFIG FILE     -----------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//---------------------------------------------------------------------------------------------------------------------------------------//
//------------------------------------------------------   IMPORTS   --------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//

//Import Product Model from models
const {Product} = require ('../models/product-model.js');
//Require the ExpressJS library in the Products Route
const express = require ('express');
const { Category } = require('../models/category-model.js');
//Initialize the route
const router = express.Router();
//Require Mongoose for updating the category
const mongoose = require ('mongoose');
//Require the MULTER Library for file upload. Run 'npm install multer' in CMD
const multer = require ('multer');


//Delcare file extension mechanism. MIME type used. Google for more details
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
}



//---------------------------------------------------------------------------------------------------------------------------------------//
//--------------------------------------------------   FILE STORAGE MECHANISM   ---------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//SETUP File upload mechanism using MULTER library. The below code is found in Multer documentation
const storage = multer.diskStorage({

    //Destination Controller
    destination: function(req, file, cb) {

        //Check if file type is valid
        const isValidFile = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid Image Type');
        if (isValidFile) {
            uploadError = null;
        }

        //Callback
        cb(uploadError, 'public/uploads')
    },

    //Upload Controller
    filename: function(req, file, cb) {

        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) //Original method from docs


        //Our method
        const fileName = file.originalname.split(' ').join('-');

        //For setting extensions of image upload and restirctions on image formats
        const extension = FILE_TYPE_MAP[file.mimetype];

        //cb(null, file.fieldname + '-' + uniqueSuffix) //OLD Method
        
        //Our method
        cb(null, `${fileName}-${Date.now()}.${extension}` )
    }
})

const uploadOptions = multer ({ storage: storage })





//---------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------    APIs     -------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//------------------------------------        GET API - GET PRODUCTS DETAILS      -------------------------------------------------------//

//Creating routes. Default API route is http://localhost:300/api/v1/
router.get(`/`, async (req, res) => {

    //Used for filtering and getting products by category
    let filter = {};
    if(req.query.categories) {
        filter = {category : req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    }
  res.send(productList);
});






//------------------------------------        GET API - GET INDIVIDUAL PRODUCTS DETAILS      --------------------------------------------//
//GET individual product
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category'); // Use .select() method to get custom metadata output

    if (!product) {
        res.status(500).json({ success: false, message: 'The product was not found. Please check product ID' })
    }

    res.send(product)
})



//------------------------------------        POST API - ADD A NEW PRODUCT      ---------------------------------------------------------//


//Add new product. UploadOptions is a Multer method used for image uploads
router.post(`/`, uploadOptions.single('image'), async (req, res) => {

    //For category selection
    const category = await Category.findById(req.body.category);

    if(!category) {
        return res.status(400).send('The Category ID sent was incorrect. Please check category ID and try again')
    }

    //Check if an image is uploaded or not
    const file = req.file;
    if(!file) {
        return res.status(400).send('Image was not uploaded. Image upload is required. Please upload a valid image')
    }

    //Multer method to pass images with API
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    //POST API
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save();

    if(!product) {
        return res.status(500).send('The product was not found');
    }

    res.send(product);
});





//------------------------------------        PUT API - EDIT/ MODIFY PRODUCTS DETAILS      ----------------------------------------------//

//Update Product details. PUT API CALL

router.put('/:id', uploadOptions.single('image'), async(req, res) => {
    //check for ID using mongoose
    if(!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product ID');
    }
    
    //check category
    const category = await Category.findById(req.body.category);
    
    if(!category) {
        return res.status(400).send('Invalid Category');
    }

    //Find product to update
    const product = await Product.findById(req.params.id);
    if(!product) {
        return res.status(400).send('Product cound not be updated. Invalid Product ID')
    }

    const file = req.file;
    let imagePath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = product.image;
    }
    


    //update product
    let updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        }, 
        {
            new: true
        }
    )

    if(!updatedProduct) {
        return res.status(400).send('The product cannot be updated. Please check product ID/ Category ID and try again')
    }
    res.send(updatedProduct);
    

});





//------------------------------------        DELETE API - DELETE PRODUCTS DETAILS      -------------------------------------------------//

//DELETE a product. DELETE API CALL

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product){
            return res.status(200).json({ success: true, message: 'The product is deleted'})
        } else {
            return res.status(404).json({ success: false, message: 'The product could not be deleted. Please check the product ID and try again'})
        }
        
    }). catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})






//------------------------        GET COUNT API - GET TOTAL NUMBER OF PRODUCTS IN THE DATABASE      -------------------------------------//

//Call the count of products API
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments() //removed countDocuments((count) => count) as per stack overflow to eliminate error

    if (!productCount) {
        res.status(500).json({ success: false })
    }

    res.send({
        productCount: productCount
    })
})




//---------------------        GET FEATURED COUNT API - GET COUNT OF isFeatured = true PRODUCTS      ------------------------------------//

//GET Featured products ONLY. GET Request for Featured products
router.get(`/get/featured/:count`, async (req, res) => {

    //GET Featured products count. Needed to display limited future products
    const count = req.params.count ? req.params.count : 0 //Like IF statement. If count exsist ? return count else : return 0

    const products = await Product.find({
        isFeatured: true
    }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false })
    }

    res.send(products)
})

//Upload Images Gallery
// router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
//     if(!mongoose.isValidObjectId(req.params.id)) {
//         return res.status(400).send('Invalid Product ID')
//     }

//     const files = req.files;
//     let imagesPaths = [];
//     const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
//     if(files) {
//         files.map((files) => {
//             imagesPaths.push(`${basePath}${files.fileName}`)
//         })
//     }
    

//     const product = await Product.findByIdAndUpdate(
//         req.params.id, 
//         {
//             images: imagesPaths
//         }, 
//         { new: true }
//     )

//     if(!product) {
//         return res.status(500).send('The Product Cannot be Updated')
//     }
//     res.send(product);

// });





//------------        UPLOAD ARRAY OF IMAGES / MULTI IMAGE UPLOAD API - API TO UPLOAD MULTIPLE IMAGES IN A PRODUCT      -----------------//

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});



//---------------------        EXPORT THE PRODUCTS ROUTER/ API MAIN FILE TO app.js CONTROLLER FILE      ---------------------------------//

//Export the router to the app.js file
module.exports = router;