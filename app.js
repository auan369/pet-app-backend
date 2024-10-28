const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();
const bodyParser = require('body-parser');

const connectionString = process.env.MONGODB_URI
const petRoutes = require('./routes/petRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded())
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);
const Pet = require('./models/Pet');


const PORT = process.env.PORT || 4000;  
const updatePeriod = 1; // Update every 1 minutes
const poopFreq = 3; // Poop every 3 updates
var poopFreqCount = 0;

// Connect to MongoDB
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'PetDatabase' })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('Conntected To Mongo Database');
});

// Simple route
app.get('/', async (req, res) => {
    if (db.readyState === 1) {
        console.log('Connected to the database');
        res.send('Pet App Backend');
    }
    else {
        console.log('Not connected to the database');
        res.send('Not connected to the database');
    }
    // const connection = mongoose.connection.readyState;
    //res send if connected to the database
    // console.log('Pet App Backend');
    // const products = await adminLogin.find();
    // console.log(products);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

//every 1 second, decrease the hunger and happiness of all pets
// setInterval(async () => {
//     const pets = await Pet.find();
//     pets.forEach(async pet => {
//         //minus one until zero
//         const updatedPet = await Pet.findByIdAndUpdate(pet._id, { hunger: Math.max(0, pet.hunger - 1), happiness: Math.max(0, pet.happiness - 1) }, { new: true });
//         //console.log(updatedPet);
//     });
//     console.log("Decreased hunger and happiness");
//     console.log(pets);
// }, 10000);


cron.schedule(`*/${updatePeriod} * * * *`, async () => {
    console.log('Updating pet states..., poopFreqCount:', poopFreqCount);
    try {
        // Fetch all pets from the database
        const pets = await Pet.find();
        pets.forEach(async (pet) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - new Date(pet.lastUpdated).getTime(); // Time difference in milliseconds
            const minutesPassed = Math.floor(timeDiff / (60 * 1000));

            // Increase hunger by 1 for every 5 minutes
            const hungerIncrease = Math.floor(minutesPassed / updatePeriod);
            const happinessDecrease = Math.floor(minutesPassed / updatePeriod);

            pet.hunger = Math.min(pet.hunger + hungerIncrease, 100);
            pet.happiness = Math.max(pet.happiness - happinessDecrease, 0);
            
            // Poop every 3 updates
            if (poopFreqCount===poopFreq-1) {
                pet.poopCount += 1;
                console.log('Poop count:', pet._id, pet.poopCount);
            }
            


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
        });

        // Update poop frequency count
        poopFreqCount = (poopFreqCount + 1) % poopFreq;

        console.log('Pet states updated!');
        // console.log(pets);
    } catch (error) {
        console.error('Error updating pet states:', error);
    }
});