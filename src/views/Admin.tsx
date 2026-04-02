import { useState } from "react";
import { getSubscribers, getDigestPreview, sendDigest } from "../services/api";

const Admin = () => {
  const [apiKey, setApiKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [sendResult, setSendResult] = useState<{
    sent: number;
    total_subscribers: number;
    events_included: number;
    errors: { email: string; error: string }[];
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    try {
      const subs = await getSubscribers(apiKey);
      setSubscriberCount(subs.length);
      setAuthenticated(true);
      // Load preview
      const html = await getDigestPreview(apiKey);
      setPreviewHtml(html);
    } catch {
      setAuthError(true);
    }
  };

  const handleSend = async () => {
    if (!confirm("Send the weekly digest to all subscribers?")) return;
    setSending(true);
    setSendResult(null);
    try {
      const result = await sendDigest(apiKey);
      setSendResult(result);
    } catch {
      setSendResult({ sent: 0, total_subscribers: 0, events_included: 0, errors: [{ email: "", error: "Failed to send" }] });
    } finally {
      setSending(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const subs = await getSubscribers(apiKey);
      setSubscriberCount(subs.length);
      const html = await getDigestPreview(apiKey);
      setPreviewHtml(html);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin</h2>
        <p className="text-gray-500 mb-6">Enter your admin key to continue.</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Admin API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg text-sm hover:bg-orange-700 transition-colors cursor-pointer"
          >
            Log In
          </button>
          {authError && (
            <p className="text-red-600 text-sm">Invalid admin key.</p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <button
          onClick={refreshData}
          disabled={loading}
          className="px-4 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Verified Subscribers</p>
          <p className="text-3xl font-bold text-gray-900">
            {subscriberCount ?? "—"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500 mb-1">Send Digest</p>
          <button
            onClick={handleSend}
            disabled={sending}
            className="mt-1 px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg text-sm hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Weekly Digest Now"}
          </button>
        </div>
      </div>

      {/* Send result */}
      {sendResult && (
        <div className={`rounded-lg p-4 mb-8 ${sendResult.errors.length > 0 && sendResult.sent === 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
          <p className="font-medium text-gray-900">
            Sent to {sendResult.sent} of {sendResult.total_subscribers} subscribers
            ({sendResult.events_included} events included)
          </p>
          {sendResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-red-600 font-medium">Errors:</p>
              {sendResult.errors.map((err, i) => (
                <p key={i} className="text-sm text-red-600">
                  {err.email}: {err.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Digest preview */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Digest Preview
        </h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <iframe
            srcDoc={previewHtml}
            title="Digest Preview"
            className="w-full border-0"
            style={{ minHeight: "500px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;
