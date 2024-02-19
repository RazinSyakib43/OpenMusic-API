const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, UploadsValidator, StorageService, validator) {
    this.service = service;
    this.UploadsValidator = UploadsValidator;
    this.StorageService = StorageService;
    this.validator = validator;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this.service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this.service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this.service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this.validator.validateAlbumPayload(request.payload);

    const { id } = request.params;

    await this.service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this.service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUploadAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    this.UploadsValidator.validateImageHeaders(cover.hapi.headers);

    const filename = await this.StorageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/pictures/${filename}`;

    await this.service.editAlbumCoverById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Gambar berhasil diunggah',
    });
    response.code(201);
  }
}

module.exports = AlbumsHandler;
