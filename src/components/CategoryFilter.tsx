import type { Category } from "../types";

interface CategoryFilterProps {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selected,
  onSelect,
}) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onSelect(null)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
        selected === null
          ? "bg-coral text-white"
          : "bg-stone text-text-secondary hover:bg-divider"
      }`}
    >
      All
    </button>
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
          selected === cat.id
            ? "bg-coral text-white"
            : "bg-stone text-text-secondary hover:bg-divider"
        }`}
      >
        {cat.name}
      </button>
    ))}
  </div>
);

export default CategoryFilter;
