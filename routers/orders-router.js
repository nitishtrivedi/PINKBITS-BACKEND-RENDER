//-------ROUTES------

//Import order Model from models
const { Order } = require('../models/order-model.js');
//Require the ExpressJS library in the order Route
const express = require('express');
//Import orderItem schema from orderItems-model.js
const { OrderItem } = require('../models/orderItem-model');
//Import Product Model
const { Product } = require('../models/product-model');
//Import MONGOOSE. Run 'npm install mongoose' in terminal. Used for DB interaction with MongoDB
const mongoose = require('mongoose');
//Initialize the route
const router = express.Router();
//Import STRIPE For payments //Lec215 22/9/22
const stripe = require('stripe')(
  'sk_test_51LkYoBSBgojFKKnRW4S8XCSgr8YwwND7ZMjIvdo3XgOYMmFKHAXEbaaGIQOS6lofjMEJvggshR2Jr4eIutj5ArlS00sdTRRHqK'
);

//Creating routes. Default API route is http://localhost:300/api/v1/
router.get(`/`, async (req, res) => {
  //Get request finds order, populates user details, and sorts orders from newest to oldest
  const ordersList = await Order.find()
    .populate('user', 'name email')
    .sort({ dateOrdered: -1 });

  if (!ordersList) {
    res.status(500).json({ success: false });
  }
  res.send(ordersList);
});

//GET orders by ID
router.get(`/:id`, async (req, res) => {
  //Get request finds order by ID and populates user details who created the order
  const orders = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        populate: 'category',
      },
    });

  if (!orders) {
    res.status(500).json({ success: false });
  }
  res.send(orders);
});

//Create a POST Request

router.post('/', async (req, res) => {
  //Reference for orderItems, by importing orderItem-schema from models.
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem.id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'product',
        'price'
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved, //Here wrong code is mentioned in lecture. orderItemsIds is mentioned instead of orderItemsIdsResolved
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    pin: req.body.pin,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(400).send('the order cannot be created!');

  res.send(order);
});

/////////// CHECKOUT API FOR PAYMENTS. Created on 22/9/22 Lecture Number 215. ////////////////

router.post('/create-checkout-session', async (req, res) => {
  const orderItems = req.body;

  if (!orderItems) {
    return res
      .status(400)
      .send('CheckOut Session cannot be created. Check Order Items orderItems');
  }

  const lineItems = await Promise.all(
    orderItems.map(async (orderItem) => {
      const product = await Product.findById(orderItem.product);
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price + '00', //Used the '00' for getting the right price while on payment screen.
        },
        quantity: orderItem.quantity,
      };
    })
  );

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: 'https://pinkbits.herokuapp.com/thank-you', //Change this to http://localhost:1000/thank-you when running on localhost
    cancel_url: 'https://pinkbits.herokuapp.com/failure', //Change this to http://localhost:1000/failure when running on localhost
  });
  res.json({ id: session.id });
});

//Update an Order
router.put('/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );

  if (!order) {
    return res
      .status(500)
      .send('The order cannot be updated. Please check ID and try again');
  }

  res.status(200).send(order);
});

//Delete an order and underlying orderItem
router.delete('/:id', async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id)
    .then(async (order) => {
      if (order) {
        //Delete orderItems after deleting the order
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .send(
            'The order was successfully deleted. Order Items in the deleted order has been deleted as well'
          );
      } else {
        return res.status(404).json({
          success: false,
          message: 'The order was not found. Check Order ID',
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

//GET total sales data for the ADMIN
router.get('/get/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }, // Use $totalPrice instead of totalPrice
  ]);

  if (!totalSales) {
    return res.status(400).send('The sales cannot be generated');
  }
  res.send({
    message: 'The total sales are as shown below',
    totalSales: totalSales.pop().totalSales,
  });
});

//GET the count of total orders in the order bucket
router.get('/get/count', async (req, res) => {
  const orderCount = await Order.countDocuments(); // Remove (count) => count from Order.countDocuments()

  if (!orderCount) {
    res.status(500).json({ success: false });
  }

  res.send({
    orderCount: orderCount,
  });
});

//GET orders based on the users who placed the orders. Get order history for a specific user
router.get('/get/userorders/:userid', async (req, res) => {
  //GET userTotalOrders
  const userTotalOrders = await Order.countDocuments();
  if (!userTotalOrders) {
    return res
      .send(500)
      .json({ success: false, message: 'This user has no orders placed' });
  }

  //Get userOrderList
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        populate: 'category',
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    return res.status(500).json({ success: false });
  }

  //Send User Order Count
  res.send({
    userTotalOrders: userTotalOrders,
    userOrderList: userOrderList,
  });

  //Send user order details
  //res.send(userOrderList);
});

//Export the router to the app.js file
module.exports = router;
