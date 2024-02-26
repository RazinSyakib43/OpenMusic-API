const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this.pool = new Pool();
    this.collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id 
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this.pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Playlist gagal dihapus. Id tidak ditemukan',
      );
    }
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const playlistSongId = `playlistsong-${nanoid(16)}`;
    const playlistSongActivityId = `playlistsongactivity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [playlistSongId, playlistId, songId],
    };

    const addPlaylistSongActivityQuery = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [playlistSongActivityId, playlistId, songId, userId, 'add', new Date()],
    };

    const result = await this.pool.query(query);
    const addPlaylistSongActivityResult = await this.pool.query(addPlaylistSongActivityQuery);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    if (!addPlaylistSongActivityResult.rowCount) {
      throw new InvariantError('Playlist song activity gagal ditambahkan');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this.pool.query(playlistQuery);

    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
        LEFT JOIN playlistsongs ON songs.id = playlistsongs.song_id
        WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (!result.rows.length) {
      throw new NotFoundError('Playlist ini tidak memiliki Lagu (Song)');
    }

    const playlistName = playlistResult.rows[0].name;
    const playlistOwner = playlistResult.rows[0].username;
    const songs = result.rows;

    return {
      id: playlistId,
      name: playlistName,
      username: playlistOwner,
      songs,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const playlistSongActivityId = `playlistsongactivity-${nanoid(16)}`;

    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const deletePlaylistSongActivityQuery = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [playlistSongActivityId, playlistId, songId, userId, 'delete', new Date()],
    };

    const result = await this.pool.query(query);
    const deletePlaylistSongActivityResult = await this.pool.query(deletePlaylistSongActivityQuery);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus');
    }

    if (!deletePlaylistSongActivityResult.rowCount) {
      throw new InvariantError('Playlist song activity gagal dihapus');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time 
      FROM playlist_song_activities
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1
      ORDER BY playlist_song_activities.time`,
      values: [playlistId],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    console.log(result.rows);
    return result.rows;
  }
}

module.exports = PlaylistsService;
