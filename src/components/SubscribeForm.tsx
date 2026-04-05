import { useState } from "react";
import { subscribe } from "../services/api";

interface SubscribeFormProps {
  compact?: boolean;
}

const SubscribeForm: React.FC<SubscribeFormProps> = ({ compact = false }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "duplicate"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await subscribe(email);
      setStatus("success");
      setEmail("");
    } catch (err) {
      if (err instanceof Error && err.message === "already_subscribed") {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    }
  };

  if (status === "success") {
    return (
      <div className={compact ? "" : "text-center py-4"}>
        <p className="text-success font-medium">You're in! Check your email.</p>
        <p className="text-sm text-text-secondary mt-1">
          We sent a confirmation link to finish signing up.
        </p>
      </div>
    );
  }

  return (
    <div id="subscribe">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2"
      >
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded-md border border-stone text-base font-body text-text-primary flex-1 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 placeholder:text-text-muted"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-3 bg-coral text-white font-semibold text-sm rounded-md hover:bg-coral-dark transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      <p className="text-xs text-text-muted mt-2">
        Free. Weekly. No spam.
      </p>
      {status === "duplicate" && (
        <p className="text-warning text-sm mt-2">You're already subscribed!</p>
      )}
      {status === "error" && (
        <p className="text-error text-sm mt-2">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
};

export default SubscribeForm;
