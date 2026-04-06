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
    return <p className="text-text-muted text-center py-12">Loading...</p>;
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-text-muted mb-4">Event not found.</p>
        <Link to="/" className="text-coral hover:underline">
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
        className="text-coral hover:underline text-sm mb-4 inline-block"
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
          <span className="text-xs font-semibold uppercase tracking-wide text-coral bg-coral/10 px-2 py-0.5 rounded">
            {event.category.name}
          </span>
        )}
        <span className="text-sm text-text-muted">{dateRange}</span>
      </div>

      <h1 className="text-3xl font-bold text-navy mb-4 font-heading">{event.title}</h1>

      {event.description && (
        <p className="text-text-secondary leading-relaxed mb-6">
          {event.description}
        </p>
      )}

      {event.venue && (
        <div className="bg-warm-gray rounded-lg p-4 mb-6 border border-stone">
          <h3 className="font-semibold text-navy mb-1">
            {event.venue.name}
          </h3>
          <p className="text-sm text-text-secondary">{event.venue.address}</p>
          {event.venue.website && (
            <a
              href={event.venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-coral hover:underline mt-1 inline-block"
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
          className="inline-block bg-coral text-white px-5 py-2.5 rounded-lg font-medium hover:bg-coral-dark transition-colors no-underline"
        >
          More Info
        </a>
      )}
    </div>
  );
};

export default EventDetail;
