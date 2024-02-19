const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }

  async postExportPlaylistHandler(request, h) {
    this.validator.validateExportPlaylistsPayload(request.payload);

    const { playlistId } = request.params;

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this.service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
