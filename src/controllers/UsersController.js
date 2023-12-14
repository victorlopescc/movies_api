const knex = require('../database/knex');
const { hash, compare } = require('bcryptjs');
const AppError = require('../utils/AppError');
const sqliteConnection = require('../database/sqlite');

class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body;

        const checkUserExists = await knex('users').where({ email }).first();

        if (checkUserExists) {
            throw new AppError('Email address already used.');
        }

        const hashedPassword = await hash(password, 8);

        await knex('users').insert({
            name,
            email,
            password: hashedPassword
        });

        return response.status(201).json();
    }

    async update(request, response) {

    }
}

module.exports = UsersController;