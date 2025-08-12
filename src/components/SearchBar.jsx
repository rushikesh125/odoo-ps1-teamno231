import { useState } from 'react';

const SearchBar = ({ placeholder, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
      />
      <button
        type="submit"
        className="px-4 py-3 bg-theme-purple text-white rounded-lg hover:bg-theme-purple transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;