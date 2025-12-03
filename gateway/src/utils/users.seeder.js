const mongoose = require('mongoose');
const UserModel = require('../models/user.model');

const oid = (id) => new mongoose.Types.ObjectId(id);

const seedUsers = async () => {
    try {
        // Verify connection before starting
        if (mongoose.connection.readyState !== 1) return;

        console.log('Executing users sedeer...');

        await Promise.all([
            UserModel.deleteMany({})
        ]);
        
        console.log('Colection cleaned.');

    
        const users = [
            {
                //_id: oid("671fd9e2a3b12c7f9c1a1001"),
                id: "00000247527",
                password: "pass12345",
                name: "Jesus Gabriel Medina Leyva",
                rol: 'MANAGER'
            },
            {
                //_id: oid("671fd9e2a3b12c7f9c1a1002"),
                id: "00000240798",
                password: "pass12345",
                name: "Kevin Jared Sanchez Figueroa",
                rol: 'SENTINEL'
            },
            {
                //_id: oid("671fd9e2a3b12c7f9c1a1003"),
                id: "00000240474",
                password: "pass12345",
                name: "Dr. Gilberto Borrego Soto",
                rol: 'MANAGER'
            },
            {
                //_id: oid("671fd9e2a3b12c7f9c1a1004"),
                id: "00000250545",
                password: "pass12345",
                name: "Mtro. Jose Luis Robles Reyes",
                rol: 'SENTINEL'
            }
        ];
        await UserModel.insertMany(users);

        console.log('The users has benn populated correctly.');

    } catch (error) {
        console.error('An error ocurred while populating the users', error);
    }
};

module.exports = seedUsers;