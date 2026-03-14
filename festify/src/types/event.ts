import type { Artist } from "./artist";

export interface Event {
  event_id: number;
  event_name: string;
  event_date: string;
  event_end_date: string | null;
  event_location: string;
  event_venue: string;
  edmtrain_link: string | null;
  festivalInd: boolean;
  livestreamInd: boolean;
  electronicGenreInd: boolean;
  img_url: string | null;
  alt_img: string | null;
  use_alt: boolean;
  artists?: Artist[];
}
