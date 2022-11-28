//---------------------------------------------------------------------------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//
//--------------------------------------       BACKEND CATEGORIES API CONFIG FILE     ---------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//---------------------------------------------------------------------------------------------------------------------------------------//
//------------------------------------------------------   IMPORTS   --------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//

//Import Category Model from models
const {Category} = require ('../models/category-model.js');
//Require the ExpressJS library in the category Route
const express = require ('express');
//Initialize the route
const router = express.Router();



//---------------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------    APIs     -------------------------------------------------------------------//
//---------------------------------------------------------------------------------------------------------------------------------------//


//------------------------------------        GET API - GET CATEGORIES DETAILS      -----------------------------------------------------//


//Creating routes. Default API route is http://localhost:300/api/v1/
router.get(`/`, async (req, res) => {
    const categoriesList = await Category.find();

    if(!categoriesList) {
        res.status(500).json({success: false})
    }
  res.status(200).send(categoriesList);
});



//------------------------------------        GET API - GET INDIVIDUAL CATEGORIES DETAILS      ------------------------------------------//


//by id
router.get('/:id', async(req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(404).send('The requested Category was not found. Kindly check ID and error logs.')
    }
    res.status(200).send(category);
})


//------------------------------------        POST API - ADD/ CREATE A NEW CATEGORY      ------------------------------------------------//

router.post(`/`, async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    category = await category.save();

    if (!category) {
        return res.status(404).send('The Category cannot be created')
    }
    res.send(category);
});


//---------------------------------------        DELETE API - DELETE A CATEGORY      ----------------------------------------------------//

router.delete('/:id', async (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'The Category is Deleted.'})
        } else {
            return res.status(404).json({success: false, message: 'The Category was not found. Check ID and logs for details'})
        }
    }).catch (err => {
        return res.status(400).json({ success: false, error: err})
    })
})




//------------------------------------        PUT API - UPDATE CATEGORY DETAILS      ----------------------------------------------------//



router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    }, {
        new: true
    })

    if (!category) {
        return res.status(400).send('The category cannot be created')
    }
    res.send(category)
})




//---------------------        EXPORT THE PRODUCTS ROUTER/ API MAIN FILE TO app.js CONTROLLER FILE      ---------------------------------//

//Export the router to the app.js file
module.exports = router;