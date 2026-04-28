import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDigests } from "../services/api";
import type { DigestSummary } from "../types";

const DigestArchive = () => {
  const [digests, setDigests] = useState<DigestSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDigests()
      .then(setDigests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
        Past Digests
      </h1>
      <p className="text-text-secondary mb-8">
        Browse previous editions of The CLE Brief.
      </p>

      {loading ? (
        <p className="text-text-muted py-8 text-center">Loading...</p>
      ) : digests.length === 0 ? (
        <div className="bg-white border border-stone rounded-lg p-8 text-center">
          <p className="text-text-secondary">
            No digests sent yet. The first one is coming soon!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {digests.map((digest) => (
            <Link
              key={digest.id}
              to={`/digests/${digest.id}`}
              className="block bg-white border border-stone rounded-lg p-6 no-underline hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  {digest.subject}
                </h3>
                <span className="text-sm text-text-muted whitespace-nowrap ml-4">
                  {new Date(digest.sent_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2">
                {digest.intro_text}
              </p>
              <p className="text-xs text-text-muted mt-2">
                {digest.item_count} items
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DigestArchive;
