import { useState, useEffect } from "react";
import {
  getSubscribers,
  getDigestPreview,
  sendDigest,
  fetchExternalEvents,
  getDraftEvents,
  getAdminEvents,
  updateEvent,
  createAdminEvent,
  deleteEvent,
  getAdminCategories,
} from "../services/api";
import type { Event, Category } from "../types";

type Tab = "curate" | "approved" | "digest" | "create";

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

  const [tab, setTab] = useState<Tab>("curate");
  const [drafts, setDrafts] = useState<Event[]>([]);
  const [approved, setApproved] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<{
    ticketmaster: { fetched: number; duplicates: number; error?: string };
    eventbrite: { fetched: number; duplicates: number; error?: string };
  } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Event>>({});

  // Create event form
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    short_description: "",
    source_url: "",
    image_url: "",
    start_date: "",
    end_date: "",
    category_id: "",
    status: "approved",
  });
  const [creating, setCreating] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    try {
      const subs = await getSubscribers(apiKey);
      setSubscriberCount(subs.length);
      setAuthenticated(true);
      loadData();
    } catch {
      setAuthError(true);
    }
  };

  const loadData = async () => {
    try {
      const [d, a, cats, html] = await Promise.all([
        getDraftEvents(apiKey),
        getAdminEvents(apiKey, "approved"),
        getAdminCategories(apiKey),
        getDigestPreview(apiKey),
      ]);
      setDrafts(d);
      setApproved(a);
      setCategories(cats);
      setPreviewHtml(html);
    } catch {}
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const handleFetch = async () => {
    setFetching(true);
    setFetchResult(null);
    try {
      const result = await fetchExternalEvents(apiKey);
      setFetchResult(result);
      const d = await getDraftEvents(apiKey);
      setDrafts(d);
    } catch {}
    setFetching(false);
  };

  const handleApprove = async (id: number) => {
    await updateEvent(apiKey, id, { status: "approved" } as Partial<Event>);
    loadData();
  };

  const handleSkip = async (id: number) => {
    await updateEvent(apiKey, id, { status: "skipped" } as Partial<Event>);
    loadData();
  };

  const handleFeature = async (id: number, featured: boolean) => {
    await updateEvent(apiKey, id, { is_featured: featured } as Partial<Event>);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event permanently?")) return;
    await deleteEvent(apiKey, id);
    loadData();
  };

  const startEdit = (event: Event) => {
    setEditingId(event.id);
    setEditForm({
      title: event.title,
      short_description: event.short_description || "",
      description: event.description || "",
      source_url: event.source_url || "",
      category_id: event.category?.id ?? null,
    } as Partial<Event>);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateEvent(apiKey, editingId, editForm);
    setEditingId(null);
    loadData();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createAdminEvent(apiKey, {
        title: createForm.title,
        description: createForm.description || undefined,
        short_description: createForm.short_description || undefined,
        source_url: createForm.source_url || undefined,
        image_url: createForm.image_url || undefined,
        start_date: new Date(createForm.start_date).toISOString(),
        end_date: createForm.end_date ? new Date(createForm.end_date).toISOString() : undefined,
        category_id: createForm.category_id ? Number(createForm.category_id) : undefined,
        status: createForm.status,
      });
      setCreateForm({ title: "", description: "", short_description: "", source_url: "", image_url: "", start_date: "", end_date: "", category_id: "", status: "approved" });
      loadData();
      setTab("approved");
    } catch {}
    setCreating(false);
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
    }
    setSending(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Login screen
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
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy font-heading">Admin Dashboard</h2>
        <p className="text-sm text-text-muted">{subscriberCount ?? "—"} subscribers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-stone">
        {([
          ["curate", `Drafts (${drafts.length})`],
          ["approved", `Approved (${approved.length})`],
          ["create", "Create Event"],
          ["digest", "Digest"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              tab === key
                ? "text-navy border-b-2 border-coral -mb-px"
                : "text-text-muted hover:text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* CURATE TAB */}
      {tab === "curate" && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleFetch}
              disabled={fetching}
              className="px-5 py-2.5 bg-navy text-white font-medium rounded-lg text-sm hover:bg-navy-light transition-colors cursor-pointer disabled:opacity-50"
            >
              {fetching ? "Fetching..." : "Fetch Events"}
            </button>
            <span className="text-sm text-text-muted">Pull from Ticketmaster & Eventbrite</span>
          </div>

          {fetchResult && (
            <div className="bg-white rounded-lg border border-stone p-4 mb-4 text-sm">
              <p>
                <strong>Ticketmaster:</strong>{" "}
                {fetchResult.ticketmaster.error
                  ? <span className="text-error">{fetchResult.ticketmaster.error}</span>
                  : `${fetchResult.ticketmaster.fetched} new, ${fetchResult.ticketmaster.duplicates} duplicates`}
              </p>
              <p>
                <strong>Eventbrite:</strong>{" "}
                {fetchResult.eventbrite.error
                  ? <span className="text-error">{fetchResult.eventbrite.error}</span>
                  : `${fetchResult.eventbrite.fetched} new, ${fetchResult.eventbrite.duplicates} duplicates`}
              </p>
            </div>
          )}

          {drafts.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">
              No draft events. Click "Fetch Events" to pull from APIs.
            </p>
          ) : (
            <div className="space-y-3">
              {drafts.map((event) => (
                <div key={event.id} className="bg-white rounded-lg border border-stone p-4">
                  {editingId === event.id ? (
                    /* Edit mode */
                    <div className="space-y-3">
                      <input
                        value={editForm.title || ""}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-stone rounded text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
                        placeholder="Event title"
                      />
                      <textarea
                        value={(editForm.short_description as string) || ""}
                        onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })}
                        className="w-full px-3 py-2 border border-stone rounded text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
                        placeholder="Why care? (one punchy sentence)"
                        rows={2}
                      />
                      <select
                        value={(editForm as Record<string, unknown>).category_id as string || ""}
                        onChange={(e) => setEditForm({ ...editForm, category_id: Number(e.target.value) || null } as Partial<Event>)}
                        className="px-3 py-2 border border-stone rounded text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
                      >
                        <option value="">No category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-4 py-1.5 bg-coral text-white text-sm rounded hover:bg-coral-dark cursor-pointer">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-1.5 text-text-muted text-sm rounded hover:bg-warm-gray cursor-pointer">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {event.category && (
                              <span className="text-xs font-semibold uppercase tracking-wide text-coral bg-coral/10 px-2 py-0.5 rounded">
                                {event.category.name}
                              </span>
                            )}
                            <span className="text-xs text-text-muted">{formatDate(event.start_date)}</span>
                            <span className="text-xs text-text-muted capitalize bg-warm-gray px-2 py-0.5 rounded">{event.source}</span>
                          </div>
                          <h4 className="font-bold text-navy text-sm">{event.title}</h4>
                          {event.venue && <p className="text-xs text-text-secondary">{event.venue.name}</p>}
                          {event.short_description && <p className="text-xs text-text-muted mt-1">{event.short_description}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => handleApprove(event.id)} className="px-3 py-1.5 bg-success/10 text-success text-xs font-medium rounded hover:bg-success/20 cursor-pointer" title="Approve">Approve</button>
                          <button onClick={() => startEdit(event)} className="px-3 py-1.5 bg-warm-gray text-text-secondary text-xs font-medium rounded hover:bg-stone cursor-pointer" title="Edit">Edit</button>
                          <button onClick={() => handleSkip(event.id)} className="px-3 py-1.5 bg-warm-gray text-text-muted text-xs font-medium rounded hover:bg-stone cursor-pointer" title="Skip">Skip</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPROVED TAB */}
      {tab === "approved" && (
        <div>
          {approved.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">No approved events yet.</p>
          ) : (
            <div className="space-y-3">
              {approved.map((event) => (
                <div key={event.id} className={`bg-white rounded-lg border p-4 ${event.is_featured ? "border-coral border-2" : "border-stone"}`}>
                  {editingId === event.id ? (
                    <div className="space-y-3">
                      <input
                        value={editForm.title || ""}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-stone rounded text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
                      />
                      <textarea
                        value={(editForm.short_description as string) || ""}
                        onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })}
                        className="w-full px-3 py-2 border border-stone rounded text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
                        placeholder="Why care?"
                        rows={2}
                      />
                      <select
                        value={(editForm as Record<string, unknown>).category_id as string || ""}
                        onChange={(e) => setEditForm({ ...editForm, category_id: Number(e.target.value) || null } as Partial<Event>)}
                        className="px-3 py-2 border border-stone rounded text-sm"
                      >
                        <option value="">No category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-4 py-1.5 bg-coral text-white text-sm rounded hover:bg-coral-dark cursor-pointer">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-1.5 text-text-muted text-sm rounded hover:bg-warm-gray cursor-pointer">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {event.is_featured && (
                            <span className="text-xs font-bold text-coral">★ FEATURED</span>
                          )}
                          {event.category && (
                            <span className="text-xs font-semibold uppercase tracking-wide text-coral bg-coral/10 px-2 py-0.5 rounded">
                              {event.category.name}
                            </span>
                          )}
                          <span className="text-xs text-text-muted">{formatDate(event.start_date)}</span>
                        </div>
                        <h4 className="font-bold text-navy text-sm">{event.title}</h4>
                        {event.venue && <p className="text-xs text-text-secondary">{event.venue.name}</p>}
                        {event.short_description && <p className="text-xs text-text-muted mt-1 italic">"{event.short_description}"</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleFeature(event.id, !event.is_featured)}
                          className={`px-3 py-1.5 text-xs font-medium rounded cursor-pointer ${
                            event.is_featured
                              ? "bg-coral text-white"
                              : "bg-warm-gray text-text-secondary hover:bg-stone"
                          }`}
                        >
                          {event.is_featured ? "★ Featured" : "☆ Feature"}
                        </button>
                        <button onClick={() => startEdit(event)} className="px-3 py-1.5 bg-warm-gray text-text-secondary text-xs font-medium rounded hover:bg-stone cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(event.id)} className="px-3 py-1.5 bg-warm-gray text-error text-xs font-medium rounded hover:bg-red-50 cursor-pointer">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE TAB */}
      {tab === "create" && (
        <form onSubmit={handleCreate} className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Title *</label>
            <input
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              placeholder="Guardians Home Opener"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Why care? (short description)</label>
            <textarea
              value={createForm.short_description}
              onChange={(e) => setCreateForm({ ...createForm, short_description: e.target.value })}
              className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              placeholder="First home game of the season. The atmosphere is unbeatable."
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Full description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Start date *</label>
              <input
                required
                type="datetime-local"
                value={createForm.start_date}
                onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">End date</label>
              <input
                type="datetime-local"
                value={createForm.end_date}
                onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Category</label>
              <select
                value={createForm.category_id}
                onChange={(e) => setCreateForm({ ...createForm, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              >
                <option value="approved">Approved</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Source URL</label>
            <input
              value={createForm.source_url}
              onChange={(e) => setCreateForm({ ...createForm, source_url: e.target.value })}
              className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Image URL</label>
            <input
              value={createForm.image_url}
              onChange={(e) => setCreateForm({ ...createForm, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 bg-coral text-white font-medium rounded-lg text-sm hover:bg-coral-dark transition-colors cursor-pointer disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Event"}
          </button>
        </form>
      )}

      {/* DIGEST TAB */}
      {tab === "digest" && (
        <div>
          {/* Stats row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white rounded-lg border border-stone p-4 flex-1">
              <p className="text-xs text-text-muted mb-1">Subscribers</p>
              <p className="text-2xl font-bold text-navy">{subscriberCount ?? "—"}</p>
            </div>
            <div className="bg-white rounded-lg border border-stone p-4 flex-1">
              <p className="text-xs text-text-muted mb-1">Approved Events</p>
              <p className="text-2xl font-bold text-navy">{approved.length}</p>
            </div>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-6 py-4 bg-coral text-white font-semibold rounded-lg hover:bg-coral-dark transition-colors cursor-pointer disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Digest"}
            </button>
          </div>

          {sendResult && (
            <div className={`rounded-lg p-4 mb-6 ${sendResult.errors.length > 0 && sendResult.sent === 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
              <p className="font-medium text-navy text-sm">
                Sent to {sendResult.sent} of {sendResult.total_subscribers} subscribers
                ({sendResult.events_included} events)
              </p>
              {sendResult.errors.length > 0 && (
                <div className="mt-2">
                  {sendResult.errors.map((err, i) => (
                    <p key={i} className="text-sm text-error">{err.email}: {err.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3 className="text-lg font-bold text-navy mb-3 font-heading">Digest Preview</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <iframe
              srcDoc={previewHtml}
              title="Digest Preview"
              className="w-full border-0"
              style={{ minHeight: "600px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
