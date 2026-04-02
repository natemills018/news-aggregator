import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEvent } from "../services/api";
import type { Event } from "../types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getEvent(Number(id))
      .then(setEvent)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-gray-500 text-center py-12">Loading...</p>;
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Event not found.</p>
        <Link to="/" className="text-orange-600 hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  const dateRange = event.end_date
    ? `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
    : formatDate(event.start_date);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="text-orange-600 hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to events
      </Link>

      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <div className="flex items-center gap-3 mb-3">
        {event.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
            {event.category.name}
          </span>
        )}
        <span className="text-sm text-gray-500">{dateRange}</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

      {event.description && (
        <p className="text-gray-700 leading-relaxed mb-6">
          {event.description}
        </p>
      )}

      {event.venue && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-1">
            {event.venue.name}
          </h3>
          <p className="text-sm text-gray-600">{event.venue.address}</p>
          {event.venue.website && (
            <a
              href={event.venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:underline mt-1 inline-block"
            >
              Visit website
            </a>
          )}
        </div>
      )}

      {event.source_url && (
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors no-underline"
        >
          More Info
        </a>
      )}
    </div>
  );
};

export default EventDetail;
