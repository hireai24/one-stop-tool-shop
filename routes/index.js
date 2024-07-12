const express = require('express');
const router = express.Router();

// Welcome Page
router.get('/', (req, res) => res.render('index'));

// Other routes
router.get('/tool-hire', (req, res) => res.render('tool-hire'));
router.get('/tool-sale', (req, res) => res.render('tool-sale'));
router.get('/used-tools', (req, res) => res.render('used-tools'));

module.exports = router;
