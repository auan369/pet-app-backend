# Pet App Backend

This is the backend for the **Pet App**, where users can manage their virtual pets. The backend handles user authentication, pet lifecycle management, and stores data in a MongoDB database.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Register, login, and access a personal token for secure interactions.
- **Pet Management**: Users can create, update, and retrieve their pets' status.
- **JWT Authentication**: JSON Web Tokens (JWT) for user session management.
- **Time-Based Pet Lifecycle**: Pets’ states (like hunger and health) update based on the time passed since last interaction.
- **MongoDB**: Persistent data storage using MongoDB for users and pet states.

## Technologies

- **Node.js** and **Express.js** for backend server.
- **MongoDB** with **Mongoose** as an ORM.
- **JWT** for user authentication.
- **bcrypt** for password hashing.
- **node-cron** (optional) for time-based updates.
- **dotenv** for environment variables.

## Setup

### Prerequisites

- Node.js (v14 or above)
- MongoDB (Local or MongoDB Atlas)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/pet-app-backend.git
   cd pet-app-backend
   ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up the environment variables (see [Environment Variables](#environment-variables)).

4. Start the server:

    ```bash
    npm start
    ```

5. The server will be running on <http://localhost:4000>.

### Environment Variables

Create a .env file in the root directory and add the following environment variables:

```txt
PORT=3000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
```

- PORT: The port your backend will run on (default: 4000).
- MONGO_URI: The MongoDB connection string (for either a local instance or MongoDB Atlas).
- JWT_SECRET: The secret key for signing JWT tokens.

## API Endpoints

### User Authentication

#### Register a new user

- **POST** ```/api/users/register```
- Request body:

    ```bash
    {
    "username": "example",
    "password": "password123"
    }
    ```

- Response:

    ```bash
    User registered successfully
    ```

#### Login user

- **POST** ```/api/users/login```
- Request body:

    ```bash
    {
    "username": "example",
    "password": "password123"
    }
    ```

- Response:

    ```bash
    {
    "token": "your-jwt-token"
    }
    ```

### Pet Management

#### Get user’s pet by ID

- **GET** ```/api/pets/:id```
- Response:

    ```bash
    {
    "name": "Fluffy",
    "hunger": 30,
    "health": 80
    }
    ```

#### Get user’s pet by user ID

- **GET** ```/api/pets/user/:userId```
- Response:

    ```bash
    {
    "name": "Fluffy",
    "hunger": 30,
    "health": 80
    }
    ```

#### Update pet

- **PUT** ```/api/pets```
- Headers: ```Authorization: Bearer <token>```
- Request body:

- Response:

    ```bash
    {
    "name": "Fluffy",
    "hunger": 30,
    "health": 80
    }
    ```

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature-name)
3. Commit your changes (git commit -m 'Add feature')
4. Push to the branch (git push origin feature-name)
5. Create a new pull request

## License

This project is licensed under the MIT License.
