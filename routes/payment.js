const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { ensureAuthenticated } = require('../config/auth');
const Subscription = require('../models/subscription');

// Checkout Page
router.get('/checkout', ensureAuthenticated, (req, res) => {
    res.render('checkout', {
        user: req.user,
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    });
});

// Charge Route
router.post('/charge', ensureAuthenticated, async (req, res) => {
    try {
        const { amount, description } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method: req.body.stripeToken,
            confirm: true,
            description
        });

        const newSubscription = new Subscription({
            user: req.user.id,
            amount,
            description,
            date: new Date()
        });

        await newSubscription.save();

        req.flash('success_msg', 'Payment Successful');
        res.redirect('/company/profile');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Payment Failed');
        res.redirect('/payment/checkout');
    }
});

module.exports = router;
