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
        const { name, email, password, old_password } = request.body;
        const { id } = request.params;

        const user = await knex('users').where({ id }).first();

        if (!user) {
            throw new AppError('User not found.');
        }

        const userWithUpdatedEmail = await knex('users').where({ email }).first();

        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError('Email address already used.');
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if (password && !old_password) {
            const checkOldPassword = await compare(old_password, user.password);

            if (!checkOldPassword) {
                throw new AppError('Old password does not match.');
            }

            user.password = await hash(password, 8);
        }

        const database = await sqliteConnection();
        await database.run(`
            UPDATE users SET
            name = "${user.name}",
            email = "${user.email}",
            password = "${user.password}",
            updated_at = DATETIME('now')
            WHERE id = ${id}`,
        )

        return response.json(user);
    }
}

module.exports = UsersController;