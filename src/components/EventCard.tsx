import { Link } from "react-router-dom";
import type { Event } from "../types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const dateRange = event.end_date
    ? `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
    : formatDate(event.start_date);

  return (
    <Link
      to={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden no-underline text-inherit"
    >
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {event.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              {event.category.name}
            </span>
          )}
          <span className="text-xs text-gray-500">{dateRange}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}
        {event.venue && (
          <p className="text-xs text-gray-400 mt-2">{event.venue.name}</p>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
