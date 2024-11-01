const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const connectionString = process.env.MONGODB_URI
const petRoutes = require('./routes/petRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 4000;  

const connectToDatabase = async () => {
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'PetDatabase'
        });
        console.log('MongoDB connected');
        return { status: 200, message: 'Pet App Backend' };
    } catch (err) {
        console.error('Error connecting to the database:', err);
        return { status: 500, message: 'Error connecting to the database', error: err.message };
    }
};

// Connect to MongoDB
const response = connectToDatabase();

// Simple route
app.get('/', async (req, res) => {
    // const response = await connectToDatabase();
    res.status(200).send("Pet App Backend");
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});