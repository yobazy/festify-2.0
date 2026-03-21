alter table public.events
add column if not exists popularity_score numeric,
add column if not exists popularity_tier text;

create index if not exists events_popularity_score_idx
on public.events (popularity_score desc nulls last, event_date asc);

with ranked_artists as (
  select
    g.event_id,
    coalesce(a.popularity, 0) as popularity,
    row_number() over (
      partition by g.event_id
      order by coalesce(a.popularity, 0) desc, a.artist_id
    ) as rn,
    count(*) over (partition by g.event_id) as artist_count,
    count(*) filter (where coalesce(a.popularity, 0) > 0) over (
      partition by g.event_id
    ) as ranked_artist_count,
    count(*) filter (where coalesce(a.popularity, 0) >= 55) over (
      partition by g.event_id
    ) as notable_artist_count
  from public.gigs g
  join public.artists a on a.artist_id = g.artist_id
),
event_components as (
  select
    e.event_id,
    e.event_date,
    e.festivalind,
    max(case when ra.rn = 1 then ra.popularity end) as headliner_popularity,
    avg(case when ra.rn between 2 and 4 then ra.popularity end) as support_average,
    max(ra.artist_count) as artist_count,
    max(ra.ranked_artist_count) as ranked_artist_count,
    max(ra.notable_artist_count) as notable_artist_count
  from public.events e
  left join ranked_artists ra on ra.event_id = e.event_id
  group by e.event_id, e.event_date, e.festivalind
),
scored_events as (
  select
    event_id,
    round(
      least(
        100,
        coalesce(headliner_popularity, 0) * 0.6 +
        coalesce(support_average, 0) * 0.25 +
        least(
          coalesce(notable_artist_count, 0) * 4 + least(coalesce(ranked_artist_count, 0), 7),
          15
        ) +
        case when festivalind then 8 else 0 end +
        case
          when event_date < current_date then 0
          when event_date <= current_date + interval '14 days' then 7
          when event_date <= current_date + interval '30 days' then 5
          when event_date <= current_date + interval '60 days' then 3
          else 0
        end
      )
    ) as popularity_score
  from event_components
)
update public.events e
set
  popularity_score = s.popularity_score,
  popularity_tier = case
    when s.popularity_score >= 85 then 'Peak draw'
    when s.popularity_score >= 70 then 'Hot ticket'
    when s.popularity_score >= 55 then 'On the rise'
    else 'Discovery pick'
  end
from scored_events s
where e.event_id = s.event_id;
