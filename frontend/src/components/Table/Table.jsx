import React from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Loader from '../Loader/Loader';
import './Table.css';

const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  sortColumn,
  sortDirection = 'asc',
  onSort,
  className = '',
}) => {
  const handleHeaderClick = (col) => {
    if (col.sortable && onSort) {
      onSort(col.accessor);
    }
  };

  return (
    <div className={`table-container ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, index) => {
              const isSorted = sortColumn === col.accessor;
              return (
                <th
                  key={index}
                  style={col.width ? { width: col.width } : {}}
                  className={`${col.sortable ? 'is-sortable' : ''} ${isSorted ? 'is-active-sort' : ''}`}
                  onClick={() => handleHeaderClick(col)}
                >
                  <div className="th-content">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="sort-icons">
                        {isSorted && sortDirection === 'asc' ? (
                          <FiChevronUp className="sort-icon active" />
                        ) : isSorted && sortDirection === 'desc' ? (
                          <FiChevronDown className="sort-icon active" />
                        ) : (
                          <FiChevronUp className="sort-icon inactive" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="table-loading-cell">
                <Loader text="Loading records..." />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty-cell">
                <div className="empty-message-wrap">
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'clickable-row' : ''}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
