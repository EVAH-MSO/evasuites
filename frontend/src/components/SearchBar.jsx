export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <input
        type="text"
        className="border border-slate-300 pl-9 pr-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
    </div>
  );
}
