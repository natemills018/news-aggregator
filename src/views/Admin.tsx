import { useState } from "react";
import { getSubscribers } from "../services/api";

const Admin = () => {
  const [apiKey, setApiKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    try {
      const subs = await getSubscribers(apiKey);
      setSubscriberCount(subs.length);
      setAuthenticated(true);
    } catch {
      setAuthError(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-navy mb-2 font-heading">Admin</h2>
        <p className="text-text-muted mb-6">Enter your admin key to continue.</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Admin API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-stone text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-coral text-white font-medium rounded-lg text-sm hover:bg-coral-dark transition-colors cursor-pointer"
          >
            Log In
          </button>
          {authError && <p className="text-error text-sm">Invalid admin key.</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-navy mb-2 font-heading">Admin Dashboard</h2>
      <p className="text-sm text-text-muted mb-6">{subscriberCount ?? "—"} subscribers</p>

      <div className="bg-white rounded-lg border border-stone p-6">
        <h3 className="font-heading text-lg font-bold text-navy mb-2">
          Recipe curation coming soon
        </h3>
        <p className="text-sm text-text-secondary">
          The CLE Brief is pivoting to a weekly recipe newsletter. Recipe drafts,
          curation, and digest tools will reappear here once the new pipeline is wired up.
        </p>
      </div>
    </div>
  );
};

export default Admin;
