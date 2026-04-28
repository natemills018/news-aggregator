import { useEffect, useState } from "react";
import { SubscribeForm } from "../components";
import { getDigests } from "../services/api";
import type { DigestSummary } from "../types";
import { Link } from "react-router-dom";

const Home = () => {
  const [latestDigest, setLatestDigest] = useState<DigestSummary | null>(null);

  useEffect(() => {
    getDigests()
      .then((digests) => {
        if (digests.length > 0) setLatestDigest(digests[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Cleveland, curated.
          </h1>
          <p className="font-body text-lg text-white/70 mb-8 max-w-xl mx-auto">
            The best events and things to do in CLE, delivered to your inbox
            every week. Scannable in under 2 minutes.
          </p>
          <div className="max-w-md mx-auto">
            <SubscribeForm />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl mb-2">1</div>
              <h3 className="font-heading font-bold text-text-primary mb-1">
                We dig through the noise
              </h3>
              <p className="text-sm text-text-secondary">
                Dozens of event sites, calendars, and socials — so you don't
                have to.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">2</div>
              <h3 className="font-heading font-bold text-text-primary mb-1">
                Pick what's actually worth it
              </h3>
              <p className="text-sm text-text-secondary">
                Not everything makes the cut. We highlight what's genuinely
                worth your time.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">3</div>
              <h3 className="font-heading font-bold text-text-primary mb-1">
                Hit your inbox Wednesday
              </h3>
              <p className="text-sm text-text-secondary">
                One email. Quick scan. You're set for the weekend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest digest preview */}
      {latestDigest && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">
              Latest Digest
            </h2>
            <p className="text-text-secondary mb-4">{latestDigest.intro_text}</p>
            <p className="text-sm text-text-muted mb-4">
              {latestDigest.item_count} items &middot;{" "}
              {new Date(latestDigest.sent_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <Link
              to={`/digests/${latestDigest.id}`}
              className="inline-block font-body text-sm font-semibold text-coral hover:text-coral-dark transition-colors no-underline"
            >
              Read full digest →
            </Link>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">
            Stay in the loop
          </h2>
          <p className="text-text-secondary mb-6">
            Join Clevelanders who get the week's best events without the
            legwork.
          </p>
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
};

export default Home;
