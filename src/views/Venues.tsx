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
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Venues</h2>
      <p className="text-gray-500 mb-6">
        Places to visit around Cleveland
      </p>

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading venues...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {venue.venue_type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {venue.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{venue.address}</p>
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 hover:underline"
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
