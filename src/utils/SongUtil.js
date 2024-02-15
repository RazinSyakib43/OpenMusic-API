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

const mapDBToGetAllSongModel = ({
  id,
  title,
  performer,
  albumId,
}) => ({
  id,
  title,
  performer,
  albumId,
});

module.exports = { mapDBToSongModel, mapDBToGetAllSongModel };
