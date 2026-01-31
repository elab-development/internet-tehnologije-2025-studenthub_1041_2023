import React from 'react';

const TableToolbar = ({ search, onSearchChange, filtersConfig = [], filtersValues = {}, onFilterChange }) => {
  return (
    <div className="table-toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {/* Search input */}
      <input
        placeholder="Pretraga..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Dynamic filters */}
      {filtersConfig.map((filter) => {
        if (filter.type === 'select') {
          return (
            <select
              key={filter.key}
              value={filtersValues[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

        if (filter.type === 'text') {
          return (
            <input
              key={filter.key}
              type="text"
              placeholder={filter.label}
              value={filtersValues[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            />
          );
        }

        if (filter.type === 'number') {
          return (
            <input
              key={filter.key}
              type="number"
              placeholder={filter.label}
              value={filtersValues[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            />
          );
        }

        return null;
      })}
    </div>
  );
};

export default TableToolbar;
