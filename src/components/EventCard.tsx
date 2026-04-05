import type { Event } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  music: "bg-cat-music/12 text-cat-music",
  "food & drink": "bg-cat-food/12 text-cat-food-text",
  family: "bg-cat-family/12 text-cat-family",
  "arts & culture": "bg-cat-arts/12 text-cat-arts",
  sports: "bg-cat-sports/12 text-cat-sports",
  outdoors: "bg-cat-outdoors/12 text-cat-outdoors",
  festivals: "bg-cat-festivals/12 text-cat-festivals",
  nightlife: "bg-cat-nightlife/12 text-cat-nightlife",
};

function getCategoryClasses(categoryName: string): string {
  return (
    CATEGORY_COLORS[categoryName.toLowerCase()] ||
    "bg-text-muted/12 text-text-secondary"
  );
}

function formatCasualDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.round(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

  if (diffDays >= 2 && diffDays <= 6) return `This ${dayOfWeek}`;
  if (diffDays >= 7 && diffDays <= 13) return `Next ${dayOfWeek}`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const casualDate = formatCasualDate(event.start_date);
  const whyCare = event.short_description || event.description;

  return (
    <a
      href={event.source_url || `#`}
      target={event.source_url ? "_blank" : undefined}
      rel={event.source_url ? "noopener noreferrer" : undefined}
      className="block bg-white border border-stone rounded-lg p-6 no-underline text-inherit hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {featured && event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-48 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
          style={{ width: "calc(100% + 3rem)" }}
        />
      )}
      <div className="flex items-center justify-between mb-2">
        {event.category && (
          <span
            className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${getCategoryClasses(event.category.name)}`}
          >
            {event.category.name}
          </span>
        )}
        <span className="text-sm text-text-secondary">{casualDate}</span>
      </div>
      <h3 className="font-heading text-lg font-bold text-text-primary mb-1 hover:text-coral transition-colors">
        {event.title}
      </h3>
      {event.venue && (
        <p className="text-sm text-text-secondary mb-2">
          {event.venue.name}
        </p>
      )}
      {whyCare && (
        <p className="text-sm text-text-secondary line-clamp-2">{whyCare}</p>
      )}
      {event.source_url && (
        <span className="inline-block mt-3 text-sm font-medium text-coral">
          Learn more →
        </span>
      )}
    </a>
  );
};

export default EventCard;
