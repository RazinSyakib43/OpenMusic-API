const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }

  async postUserHandler(request, h) {
    this.validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this.service.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request) {
    const { id } = request.params;

    const user = await this.service.getUserById(id);

    return {
      status: 'success',
      data: {
        user,
      },
    };
  }
}

module.exports = UsersHandler;
