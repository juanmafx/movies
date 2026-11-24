type ShowPosterProps = {
  url: string | null;
  name: string;
  width: number;
  height: number;
};

export function ShowPoster({ url, name, width, height }: ShowPosterProps) {
  if (!url) {
    return (
      <div className="poster poster--empty" role="img" aria-label={`No poster for ${name}`}>
        No poster
      </div>
    );
  }
  return (
    <img
      className="poster"
      src={url}
      alt={`Poster for ${name}`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
