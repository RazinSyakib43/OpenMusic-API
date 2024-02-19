const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }

  async postSongHandler(request, h) {
    this.validator.validateSongPayload(request.payload);

    const songId = await this.service.addSong(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Lagu (Song) berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler() {
    const songs = await this.service.getSongs();
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this.service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this.validator.validateSongPayload(request.payload);

    const {
      title, year, genre, performer, duration = null,
    } = request.payload;
    const { id } = request.params;

    await this.service.editSongById(id, {
      title, year, genre, performer, duration,
    });

    return {
      status: 'success',
      message: 'Lagu (Song) berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this.service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Lagu (Song) berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
