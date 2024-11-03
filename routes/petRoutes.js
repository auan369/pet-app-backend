const express = require('express');
const Pet = require('../models/Pet');
const jwt = require('jsonwebtoken');
const router = express.Router();
const updatePeriod = 3; // Update every 3 minutes


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

const verifyResetApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.RESET_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
};

//Function to update pet states
const updatePetStates = async () => {
    console.log('Updating pet states...');
    try {
        // Fetch all pets from the database
        const pets = await Pet.find();
        for (const pet of pets) {
            const currentTime = Date.now();
            const timeDiff = currentTime - new Date(pet.lastUpdated).getTime(); // Time difference in milliseconds
            const minutesPassed = Math.floor(timeDiff / (60 * 1000));
            // only execute if time passed is more than 1 minute
            if (minutesPassed < updatePeriod) {
                return;
            }

            // Increase hunger by 3 for every 3 minutes
            const hungerIncrease = Math.floor(minutesPassed / updatePeriod) * 3;
            const happinessDecrease = Math.floor(minutesPassed / updatePeriod) * 3;
            const poopIecrease = Math.floor(minutesPassed / updatePeriod);

            pet.hunger = Math.min(pet.hunger + hungerIncrease, 100);
            pet.happiness = Math.max(pet.happiness - happinessDecrease, 0);
            
            // Poop 1 every 3 minuted
            pet.poopCount += poopIecrease;
            console.log('Poop count:', pet._id, pet.poopCount);

            if (pet.poopCount >= 3) {  // Customize frequency as needed
                pet.health = Math.max(pet.health - 1, 0);
            }

            // If hunger is too high or happiness too low, decrease health
            if (pet.hunger >= 90 || pet.happiness <= 10) {
                pet.health = Math.max(pet.health - 1, 0);
            }
            else if (pet.hunger <= 10 && pet.happiness >= 90) {
                pet.health = Math.min(pet.health + 1, 100);
            }
            if (pet.health === 0) {
                pet.isAlive = false; // Pet dies when health reaches 0
            }
            else {
                pet.isAlive = true;
            }

            pet.lastUpdated = currentTime; // Update the last updated timestamp

            // Save the updated pet state
            await pet.save();
        };

        // Update poop frequency count
        // poopFreqCount = (poopFreqCount + 1) % poopFreq;

        console.log('Pet states updated!');
        // console.log(pets);
    } catch (error) {
        console.error('Error updating pet states:', error);
    }
}

// Create a new pet
router.post('/', async (req, res) => {
    const { petType, userId } = req.body;
    // const idObj = new mongoose.mongo.ObjectId(id);
    const newPet = new Pet({ petType:petType, userId: userId }); 
    await newPet.save();
    res.status(201).json({ status: 'success', data: newPet });;
});

//Reset all pets but need authentication
router.post('/reset-pet-states/all', verifyResetApiKey, async (req, res) => {
    console.log('Resetting all pets...');
    try {
        await Pet.updateMany({}, { hunger: 0, health: 100, happiness: 100, poopCount: 0, isAlive:true, lastUpdated: Date.now() });
        console.log('All pet states have been reset.');
        res.status(200).json({ message: 'All pet states have been reset.' });
    } catch (error) {
        console.error('Error resetting pet states:', error);
        res.status(500).json({ error: 'Failed to reset pet states.' });
    }
});

// Reset a pet by id
router.post('/reset-pet-states/:id', verifyResetApiKey, async (req, res) => {
    console.log('Resetting pet state...');
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        pet.hunger = 0;
        pet.health = 100;
        pet.happiness = 100;
        pet.poopCount = 0;
        pet.isAlive = true;
        pet.lastUpdated = Date.now();
        await pet.save();
        console.log('Pet state has been reset.');
        res.status(200).json({ message: 'Pet state has been reset.' });
    } catch (error) {
        console.error('Error resetting pet state:', error);
        res.status(500).json({ error: 'Failed to reset pet state.' });
    }
});

// Get a pet by userId
router.get('/user/:userId', async (req, res) => {
    updatePetStates();
    const pet = await Pet.find({ userId: req.params.userId });
    console.log(pet);
    res.status(200).json(pet);
});

// Get a pet by id
router.get('/:id', async (req, res) => {
    updatePetStates();
    const pet = await Pet.findById(req.params.id);
    // res.status(200).json(pet);
    res.status(200).json({ status: 'success', data: pet });
}); 

// Update pet stats
router.put('/:id', authenticateToken, async (req, res) => {
    console.log(req.body);
    updatePetStates();
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // res.status(200).json(updatedPet);
    res.status(200).json({ status: 'success', data: updatedPet });
});

module.exports = router;