import { Link } from "react-router";
import { RichText } from "../../../shared/richText/RichText";
import type { Show } from "../domain/show";
import { ShowPoster } from "./ShowPoster";

type ShowCardProps = {
  show: Show;
  detailSearch: string;
};

export function ShowCard({ show, detailSearch }: ShowCardProps) {
  return (
    <article className="show-card">
      <Link to={{ pathname: `/shows/${show.id}`, search: detailSearch }} className="show-card__link">
        <ShowPoster url={show.imageMediumUrl} name={show.name} width={210} height={295} />
        <h2 className="show-card__title">{show.name}</h2>
      </Link>
      <RichText markup={show.summaryHtml} className="show-card__summary" />
    </article>
  );
}
