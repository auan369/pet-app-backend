const express = require('express');
const Pet = require('../models/Pet');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mongoose = require('mongoose');


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Create a new pet
router.post('/', async (req, res) => {
    const { petType, userId } = req.body;
    // const idObj = new mongoose.mongo.ObjectId(id);
    const newPet = new Pet({ petType:petType, userId: userId }); 
    await newPet.save();
    res.status(201).json(newPet);
});

// Get a pet by userId
router.get('/user/:userId', async (req, res) => {
    const pet = await Pet.find({ userId: req.params.userId });
    console.log(pet);
    res.status(200).json(pet);
});

// Get a pet by id
router.get('/:id', async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    res.status(200).json(pet);
}); 

// Update pet stats
router.put('/:id', authenticateToken, async (req, res) => {
    console.log(req.body);
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedPet);
});

module.exports = router;