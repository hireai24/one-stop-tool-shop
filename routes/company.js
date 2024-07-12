const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const Company = require('../models/company');
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

// Company Profile Page
router.get('/profile', ensureAuthenticated, (req, res) => {
    Company.findOne({ user: req.user.id })
        .then(company => {
            if (!company) {
                company = {};
            }
            res.render('company-profile', { company });
        })
        .catch(err => console.log(err));
});

// Update Company Profile
router.post('/profile', ensureAuthenticated, (req, res) => {
    const { name, description, location, subscription } = req.body;
    let errors = [];

    if (!name || !description || !location || !subscription) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (errors.length > 0) {
        res.render('company-profile', {
            errors,
            company: {
                name,
                description,
                location,
                subscription
            }
        });
    } else {
        Company.findOne({ user: req.user.id })
            .then(company => {
                if (company) {
                    // Update company
                    company.name = name;
                    company.description = description;
                    company.location = location;
                    company.subscription = subscription;

                    company.save()
                        .then(company => {
                            req.flash('success_msg', 'Company profile updated successfully');
                            res.redirect('/company/profile');
                        })
                        .catch(err => console.log(err));
                } else {
                    // Create new company
                    const newCompany = new Company({
                        name,
                        description,
                        location,
                        subscription,
                        user: req.user.id
                    });

                    newCompany.save()
                        .then(company => {
                            req.flash('success_msg', 'Company profile created successfully');
                            res.redirect('/company/profile');
                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    }
});

// List Tool for Company
router.post('/list-tool', ensureAuthenticated, upload, (req, res) => {
    const { name, description, price, location, availability } = req.body;
    let errors = [];

    if (!name || !description || !price || !location || !availability || !req.file) {
        errors.push({ msg: 'Please enter all fields and upload an image' });
    }

    if (errors.length > 0) {
        res.render('company-profile', {
            errors,
            company: {
                name,
                description,
                location,
                subscription: req.body.subscription
            }
        });
    } else {
        const newTool = new Tool({
            name,
            description,
            price,
            location,
            availability,
            image: `/uploads/${req.file.filename}`,
            user: req.user.id,
            company: req.user.id // Assuming company is linked to user
        });

        newTool.save()
            .then(tool => {
                req.flash('success_msg', 'Tool listed successfully');
                res.redirect('/company/profile');
            })
            .catch(err => console.log(err));
    }
});

module.exports = router;
