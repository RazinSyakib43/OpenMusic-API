const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
  coverUrl: Joi.string(),
});

module.exports = { AlbumPayloadSchema };
