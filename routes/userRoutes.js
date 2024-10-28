const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pet = require('../models/Pet');
const router = express.Router();

const petTypes = ['pico','yuri','minnie']
// Register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username:username, password: hashedPassword});
    await newUser.save();
    //create a new pet for the user
    const newPet = new Pet({ petType: petTypes[Math.floor(Math.random() * petTypes.length)], userId: newUser._id });
    await newPet.save();
    res.status(201).json({ message: 'User registered' });
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username:username });
    console.log(user);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, id: user._id });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

//get user id by username
router.get('/user/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    res.status(200).json(user);
}); 

module.exports = router;
