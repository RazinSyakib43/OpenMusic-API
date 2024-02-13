const mapDBToSongModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

module.exports = { mapDBToSongModel };
