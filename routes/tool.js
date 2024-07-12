const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Tool = require('../models/tool');
const multer = require('multer');
const path = require('path');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// List Tool Page
router.get('/list-tool', ensureAuthenticated, (req, res) => res.render('list-tool'));

// List Tool
router.post('/list-tool', ensureAuthenticated, upload, (req, res) => {
    const { name, description, price, location, availability } = req.body;
    let errors = [];

    if (!name || !description || !price || !location || !availability || !req.file) {
        errors.push({ msg: 'Please enter all fields and upload an image' });
    }

    if (errors.length > 0) {
        res.render('list-tool', {
            errors,
            name,
            description,
            price,
            location,
            availability
        });
    } else {
        const newTool = new Tool({
            name,
            description,
            price,
            location,
            availability,
            image: `/uploads/${req.file.filename}`,
            user: req.user.id
        });

        newTool.save()
            .then(tool => {
                req.flash('success_msg', 'Tool listed successfully');
                res.redirect('/tools/list-tool');
            })
            .catch(err => console.log(err));
    }
});

// Search Tool
router.get('/search', (req, res) => {
    const { location, name } = req.query;
    let query = {};

    if (location) {
        query.location = new RegExp(location, 'i');
    }

    if (name) {
        query.name = new RegExp(name, 'i');
    }

    Tool.find(query)
        .then(tools => res.render('search-tool', { tools }))
        .catch(err => console.log(err));
});

module.exports = router;
