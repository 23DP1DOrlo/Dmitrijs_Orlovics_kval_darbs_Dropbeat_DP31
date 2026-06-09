export function ArtistIdentity({ artist, unknown = "Nezināms mākslinieks", withAt = false }) {
  const nickname = artist?.stage_name?.trim() || unknown;
  const fullName = artist?.user?.name?.trim() || "";
  const showFullName = Boolean(
    artist?.stage_name
    && fullName
    && fullName.toLowerCase() !== artist.stage_name.trim().toLowerCase()
  );

  return (
    <span className="artist-identity">
      <span className="artist-identity-nick">{withAt && artist?.stage_name ? "@" : ""}{nickname}</span>
      {showFullName && <small className="artist-identity-real-name">{fullName}</small>}
    </span>
  );
}
