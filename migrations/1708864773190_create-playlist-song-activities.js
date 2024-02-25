/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    time: {
      type: 'TIMESTAMP',
      notNull: true,
    },
  });

  /*
    Menambahkan constraint UNIQUE, kombinasi dari kolom playlist_id, song_id, dan user_id.
    Guna menghindari duplikasi data antara nilai keduanya.
  */
  pgm.addConstraint('playlist_song_activities', 'unique_playlist_id_song_id_user_id', 'UNIQUE(playlist_id, song_id, user_id)');

  // memberikan constraint foreign key pada kolom playlist_id terhadap playlists.id
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');

  // memberikan constraint foreign key pada kolom song_id terhadap songs.id
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');

  // memberikan constraint foreign key pada kolom user_id terhadap users.id
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities');
};
