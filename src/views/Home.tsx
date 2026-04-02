import { useEffect, useState } from "react";
import { EventCard, CategoryFilter, SubscribeForm } from "../components";
import { getEvents, getCategories } from "../services/api";
import type { Event, Category } from "../types";

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = selectedCategory ? { category_id: selectedCategory } : {};
    getEvents(params)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          What's Happening in Cleveland
        </h2>
        <p className="text-gray-500 mb-4">
          Events, attractions, and things to do around CLE
        </p>
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
