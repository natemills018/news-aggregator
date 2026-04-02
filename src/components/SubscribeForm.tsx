import { useState } from "react";
import { subscribe } from "../services/api";

const SubscribeForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await subscribe(email, name || undefined);
      setStatus("success");
      setEmail("");
      setName("");
    } catch (err) {
      if (err instanceof Error && err.message === "already_subscribed") {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        Get the Weekly CLE Digest
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        The best Cleveland events delivered to your inbox every week.
      </p>

      {status === "success" ? (
        <div className="text-center py-2">
          <p className="text-green-700 font-medium">Check your email!</p>
          <p className="text-sm text-gray-600 mt-1">
            We sent a confirmation link. Click it to complete your subscription.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm flex-shrink-0 sm:w-36"
          />
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm flex-1"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-5 py-2 bg-orange-600 text-white font-medium rounded-lg text-sm hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}

      {status === "duplicate" && (
        <p className="text-orange-700 text-sm mt-2">You're already subscribed!</p>
      )}
      {status === "error" && (
        <p className="text-red-600 text-sm mt-2">Something went wrong. Try again.</p>
      )}
    </div>
  );
};

export default SubscribeForm;
