const knex = require('../database/knex');

class NotesController {
    async create(request, response) {
        const { title, description, rating, tags } = request.body;
        const { user_id } = request.params;

        const [note_id] = await knex('notes').insert({
            title,
            description,
            rating,
            user_id
        });

        const tagsInsert = tags.map(name => {
            return {
                note_id,
                user_id,
                name
            }
        });

        await knex('tags').insert(tagsInsert);

        response.json();
    }

    async show(request, response) { }

    async delete(request, response) { }

    async index(request, response) { }
}

module.exports = NotesController;