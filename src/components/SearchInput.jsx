import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = forwardRef(function SearchInput({ value, onChange, placeholder }, ref) {
  return (
    <label className="search">
      <Search size={17} className="search-icon" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.stopPropagation();
            onChange('');
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value ? (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <X size={15} />
        </button>
      ) : (
        <kbd className="search-kbd">/</kbd>
      )}
    </label>
  );
});

export default SearchInput;
