const { Pool } = require('pg');

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }

    async getSongsFromPlaylist(playlistId) {
        const playlistQuery = {
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            LEFT JOIN users ON users.id = playlists.owner
            WHERE playlists.id = $1`,
            values: [playlistId],
        };

        const playlistResult = await this._pool.query(playlistQuery);

        const query = {
            text: `SELECT songs.id, songs.title, songs.performer FROM songs
            LEFT JOIN playlistsongs ON songs.id = playlistsongs.song_id
            WHERE playlistsongs.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        const playlistName = playlistResult.rows[0].name;
        const songs = result.rows;

        return {
            playlist: {
                id: playlistId,
                name: playlistName,
                songs,
            }
        };
    }
}

module.exports = PlaylistsService;