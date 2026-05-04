import { useEffect, useState } from "react";
import {
  deleteRecipe,
  fetchRecipes,
  getRecipeDrafts,
  getRecipes,
  getRegions,
  getSubscribers,
  updateRecipe,
} from "../services/api";
import type { FetchResult, Recipe, RecipeRegion } from "../types";

type Tab = "fetch" | "drafts" | "approved";

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

  return <Dashboard apiKey={apiKey} subscriberCount={subscriberCount} />;
};

const Dashboard = ({
  apiKey,
  subscriberCount,
}: {
  apiKey: string;
  subscriberCount: number | null;
}) => {
  const [tab, setTab] = useState<Tab>("fetch");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-navy mb-2 font-heading">Admin Dashboard</h2>
      <p className="text-sm text-text-muted mb-6">
        {subscriberCount ?? "—"} subscribers
      </p>

      <div className="flex gap-1 border-b border-stone mb-6">
        <TabButton active={tab === "fetch"} onClick={() => setTab("fetch")}>
          Fetch recipes
        </TabButton>
        <TabButton active={tab === "drafts"} onClick={() => setTab("drafts")}>
          Drafts
        </TabButton>
        <TabButton active={tab === "approved"} onClick={() => setTab("approved")}>
          Approved
        </TabButton>
      </div>

      {tab === "fetch" && <FetchPanel apiKey={apiKey} />}
      {tab === "drafts" && <DraftsPanel apiKey={apiKey} />}
      {tab === "approved" && <ApprovedPanel apiKey={apiKey} />}
    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
      active
        ? "border-coral text-navy"
        : "border-transparent text-text-muted hover:text-text-secondary"
    }`}
  >
    {children}
  </button>
);

const FetchPanel = ({ apiKey }: { apiKey: string }) => {
  const [regions, setRegions] = useState<RecipeRegion[]>([]);
  const [region, setRegion] = useState("");
  const [count, setCount] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRegions(apiKey)
      .then((r) => {
        setRegions(r);
        if (r.length && !region) setRegion(r[0].name);
      })
      .catch(() => setError("Failed to load regions"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const handleFetch = async () => {
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const r = await fetchRecipes(apiKey, region, count);
      setResult(r);
    } catch {
      setError("Fetch failed. Check the API key and Spoonacular configuration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stone p-6">
      <h3 className="font-heading text-lg font-bold text-navy mb-4">
        Pull recipes from Spoonacular
      </h3>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <label className="flex flex-col flex-1">
          <span className="text-xs text-text-muted mb-1">Region</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
          >
            {regions.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} ({r.cuisines.join(", ")})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col w-28">
          <span className="text-xs text-text-muted mb-1">Count</span>
          <input
            type="number"
            min={1}
            max={25}
            value={count}
            onChange={(e) => setCount(Math.min(25, Math.max(1, Number(e.target.value))))}
            className="px-3 py-2 rounded-lg border border-stone text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
          />
        </label>
        <button
          onClick={handleFetch}
          disabled={submitting || !region}
          className="px-5 py-2 bg-coral text-white font-medium rounded-lg text-sm hover:bg-coral-dark transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Fetching…" : "Fetch"}
        </button>
      </div>

      {error && <p className="text-error text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-5 p-4 rounded-lg bg-stone/40 text-sm">
          <p className="text-text-primary">
            Done. Fetched <strong>{result.fetched}</strong> new draft
            {result.fetched === 1 ? "" : "s"} for {result.region}.{" "}
            {result.duplicates
              ? `Skipped ${result.duplicates} duplicate${result.duplicates === 1 ? "" : "s"}.`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
};

const DraftsPanel = ({ apiKey }: { apiKey: string }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRecipeDrafts(apiKey);
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const handleApprove = async (id: number) => {
    setBusy(id);
    try {
      await updateRecipe(apiKey, id, { status: "approved" });
      setRecipes((rs) => rs.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  };

  const handleSkip = async (id: number) => {
    setBusy(id);
    try {
      await updateRecipe(apiKey, id, { status: "skipped" });
      setRecipes((rs) => rs.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this recipe permanently?")) return;
    setBusy(id);
    try {
      await deleteRecipe(apiKey, id);
      setRecipes((rs) => rs.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <p className="text-text-muted py-8 text-center">Loading drafts…</p>;
  if (recipes.length === 0)
    return (
      <div className="bg-white rounded-lg border border-stone p-6 text-center">
        <p className="text-text-secondary">
          No drafts yet. Pull some from the Fetch tab.
        </p>
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-text-muted">{recipes.length} draft(s)</p>
        <button
          onClick={load}
          className="text-sm text-text-secondary hover:text-navy cursor-pointer"
        >
          Refresh
        </button>
      </div>
      {recipes.map((r) => (
        <RecipeRow
          key={r.id}
          recipe={r}
          busy={busy === r.id}
          actions={
            <>
              <button
                onClick={() => handleApprove(r.id)}
                disabled={busy === r.id}
                className="px-3 py-1.5 bg-coral text-white rounded-md text-xs font-medium hover:bg-coral-dark transition-colors cursor-pointer disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => handleSkip(r.id)}
                disabled={busy === r.id}
                className="px-3 py-1.5 bg-stone text-text-primary rounded-md text-xs font-medium hover:bg-stone-dark transition-colors cursor-pointer disabled:opacity-60"
              >
                Skip
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={busy === r.id}
                className="px-3 py-1.5 text-error text-xs font-medium hover:underline cursor-pointer disabled:opacity-60"
              >
                Delete
              </button>
            </>
          }
        />
      ))}
    </div>
  );
};

const ApprovedPanel = ({ apiKey }: { apiKey: string }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRecipes(apiKey, "approved");
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const toggleFeatured = async (r: Recipe) => {
    setBusy(r.id);
    try {
      await updateRecipe(apiKey, r.id, { is_featured: !r.is_featured });
      // Backend clears other featured flags — reload for accurate state.
      await load();
    } finally {
      setBusy(null);
    }
  };

  const handleUnapprove = async (id: number) => {
    setBusy(id);
    try {
      await updateRecipe(apiKey, id, { status: "draft" });
      setRecipes((rs) => rs.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <p className="text-text-muted py-8 text-center">Loading…</p>;
  if (recipes.length === 0)
    return (
      <div className="bg-white rounded-lg border border-stone p-6 text-center">
        <p className="text-text-secondary">No approved recipes yet.</p>
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-text-muted">{recipes.length} approved</p>
        <button
          onClick={load}
          className="text-sm text-text-secondary hover:text-navy cursor-pointer"
        >
          Refresh
        </button>
      </div>
      {recipes.map((r) => (
        <RecipeRow
          key={r.id}
          recipe={r}
          busy={busy === r.id}
          actions={
            <>
              <button
                onClick={() => toggleFeatured(r)}
                disabled={busy === r.id}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 ${
                  r.is_featured
                    ? "bg-coral text-white hover:bg-coral-dark"
                    : "bg-stone text-text-primary hover:bg-stone-dark"
                }`}
              >
                {r.is_featured ? "★ Standout" : "Mark standout"}
              </button>
              <button
                onClick={() => handleUnapprove(r.id)}
                disabled={busy === r.id}
                className="px-3 py-1.5 text-text-secondary text-xs font-medium hover:underline cursor-pointer disabled:opacity-60"
              >
                Unapprove
              </button>
            </>
          }
        />
      ))}
    </div>
  );
};

const RecipeRow = ({
  recipe,
  actions,
  busy,
}: {
  recipe: Recipe;
  actions: React.ReactNode;
  busy: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasDetails =
    !!recipe.summary || (recipe.ingredients && recipe.ingredients.length > 0);

  return (
    <div
      className={`bg-white border border-stone rounded-lg p-4 ${
        busy ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-4">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt=""
            className="w-24 h-24 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-md bg-stone flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1 flex-wrap">
            <h4 className="font-heading font-bold text-navy text-base">
              {recipe.title}
            </h4>
            {recipe.is_featured && (
              <span className="text-xs bg-coral text-white px-1.5 py-0.5 rounded">
                Standout
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mb-1">
            {recipe.region && <span>{recipe.region}</span>}
            {recipe.cuisine && <span> · {recipe.cuisine}</span>}
            {recipe.cook_time_minutes && (
              <span> · {recipe.cook_time_minutes} min</span>
            )}
            {recipe.rating != null && <span> · ★ {recipe.rating.toFixed(1)}</span>}
            {recipe.source_attribution && (
              <span> · via {recipe.source_attribution}</span>
            )}
          </p>
          {recipe.short_description && !expanded && (
            <p className="text-xs text-text-secondary line-clamp-2 mb-2">
              {recipe.short_description}
            </p>
          )}
          <div className="flex gap-3 text-xs items-center">
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral hover:underline"
            >
              View source →
            </a>
            {hasDetails && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-text-secondary hover:text-navy cursor-pointer"
              >
                {expanded ? "Hide details" : "Show details"}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end justify-center flex-shrink-0">
          {actions}
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="mt-4 pt-4 border-t border-stone grid gap-4 md:grid-cols-2">
          {recipe.summary && (
            <div>
              <h5 className="font-heading text-xs font-bold text-navy uppercase tracking-wide mb-2">
                Summary
              </h5>
              <p className="text-sm text-text-secondary leading-relaxed">
                {recipe.summary}
              </p>
            </div>
          )}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div>
              <h5 className="font-heading text-xs font-bold text-navy uppercase tracking-wide mb-2">
                Ingredients ({recipe.ingredients.length})
              </h5>
              <ul className="text-sm text-text-secondary leading-relaxed list-disc list-inside space-y-0.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
