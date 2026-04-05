import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDigest } from "../services/api";
import { SubscribeForm } from "../components";
import type { DigestDetail } from "../types";

const DigestView = () => {
  const { id } = useParams<{ id: string }>();
  const [digest, setDigest] = useState<DigestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDigest(Number(id))
      .then(setDigest)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-text-muted">Loading digest...</p>
      </div>
    );
  }

  if (error || !digest) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">Digest not found.</p>
        <Link
          to="/digests"
          className="text-coral hover:text-coral-dark text-sm mt-2 inline-block"
        >
          ← Back to all digests
        </Link>
      </div>
    );
  }

  const sentDate = new Date(digest.sent_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        to="/digests"
        className="text-sm text-text-secondary hover:text-text-primary no-underline mb-6 inline-block"
      >
        ← All digests
      </Link>

      <div className="bg-white border border-stone rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-navy text-white p-8">
          <h1 className="font-heading text-2xl font-bold mb-2">
            {digest.subject}
          </h1>
          <p className="text-white/60 text-sm">{sentDate}</p>
        </div>

        {/* Content */}
        <div
          className="p-8 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: digest.html_content }}
        />
      </div>

      {/* Subscribe CTA */}
      <div className="mt-10 text-center">
        <p className="text-text-secondary mb-4">
          Like what you see? Get this in your inbox every week.
        </p>
        <div className="max-w-md mx-auto">
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
};

export default DigestView;
