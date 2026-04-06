import { useEffect, useState } from "react";
import { getVenues } from "../services/api";
import type { Venue } from "../types";

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenues()
      .then(setVenues)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-navy mb-1 font-heading">Venues</h2>
      <p className="text-text-secondary mb-6">
        Places to visit around Cleveland
      </p>

      {loading ? (
        <p className="text-text-muted text-center py-12">Loading venues...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-coral bg-coral/10 px-2 py-0.5 rounded">
                  {venue.venue_type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-navy mb-1">
                {venue.name}
              </h3>
              <p className="text-sm text-text-secondary mb-3">{venue.address}</p>
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-coral hover:underline"
                >
                  Visit website
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Venues;
