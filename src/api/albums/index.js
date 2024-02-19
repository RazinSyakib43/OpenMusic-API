const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    service, UploadsValidator, StorageService, validator,
  }) => {
    const albumsHandler = new AlbumsHandler(service, UploadsValidator, StorageService, validator);
    server.route(routes(albumsHandler));
  },
};
