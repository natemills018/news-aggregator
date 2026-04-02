import { useEffect, useState } from "react";
import { EventCard, CategoryFilter, SubscribeForm } from "../components";
import { getEvents, getCategories } from "../services/api";
import type { Event, Category } from "../types";

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = {};
    if (selectedCategory) params.category_id = selectedCategory;
    if (search.trim()) params.search = search.trim();
    getEvents(params)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          What's Happening in Cleveland
        </h2>
        <p className="text-gray-500 mb-4">
          Events, attractions, and things to do around CLE
        </p>

        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />

        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <SubscribeForm />
      </div>
    </div>
  );
};

export default Home;
