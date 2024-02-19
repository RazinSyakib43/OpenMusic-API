const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToAlbumModel } = require('../../utils/AlbumUtil');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this.pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToAlbumModel);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
      values: [id],
    };

    const songQuery = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songsResult = await this.pool.query(songQuery);

    return {
      ...result.rows.map(mapDBToAlbumModel)[0],
      songs: songsResult.rows,
    };

    // const result = await this.pool.query(query);
    // console.log(result.rows.map(mapDBToAlbumModel));

    // if (!result.rows.length) {
    //   throw new NotFoundError('Album tidak ditemukan');
    // }

    // const songsResult = await this.pool.query(songQuery);

    // const albumId = result.rows[0].id;
    // const { name, year, cover } = result.rows[0];

    // return {
    //   id: albumId,
    //   name,
    //   year,
    //   coverUrl: cover,
    //   songs: songsResult.rows,
    // };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async editAlbumCoverById(id, filename) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [filename, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
    }
  }

  async addUserAlbumLike(albumId, userId) {
    const id = `user-album-like-${nanoid(16)}`;

    const checkAlbumLikeQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const checkAlbumLikeResult = await this.pool.query(checkAlbumLikeQuery);

    if (checkAlbumLikeResult.rows.length) {
      throw new InvariantError('Gagal menambahkan like album. User telah memberikan like pada album');
    }

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this.pool.query(query);

    if (!result) {
      throw new InvariantError('Gagal menambahkan like album');
    }

    await this.cacheService.delete(`albums:${albumId}`);
  }

  async getUserAlbumLikeCount(albumId) {
    try {
      const result = await this.cacheService.get(`albums:${albumId}`);
      return JSON.parse(result);
    } catch {
      const query = {
        text: 'SELECT COUNT(user_id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this.pool.query(query);

      if (!result) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      await this.cacheService.set(`albums:${albumId}`, JSON.stringify(result.rows[0].count));

      if (!result.rows.length) {
        throw new InvariantError('Gagal mengambil like album');
      }

      return Number(result.rows[0].count);
    }
  }

  async deleteUserAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menghapus like album. Id tidak ditemukan');
    }

    await this.cacheService.delete(`albums:${albumId}`);
  }
}

module.exports = AlbumsService;
