import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaSearch, FaCheckCircle, FaSpinner } from "react-icons/fa";

/**
 * A reusable, paginated, searchable dropdown for selecting employees.
 * Supports infinite scrolling, debounced search, and displays the correct name 
 * even if the selected employee is filtered out of the current list.
 */
const InfiniteScrollEmployeeDropdown = ({
  employees = [],
  value,
  onChange,
  onLoadMore,
  hasMore,
  isLoading,
  onSearch,
  placeholder = 'Select Employee',
  selectedName = '',
  allowAll = false,
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const searchTimeout = useRef(null);

  // Get display name for selected value
  const getDisplayName = () => {
    if (!value || value === 'all') return allowAll ? placeholder : '';
    const emp = employees.find(e => String(e.employee_id || e.id) === String(value));
    if (emp) {
      return emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
    }
    return selectedName || placeholder;
  };

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      onSearch(val);
    }, 400);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen && searchTerm) {
      setSearchTerm('');
      onSearch('');
    }
  }, [isOpen]);

  const selectedDisplay = getDisplayName();

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full border border-gray-300 px-3 py-2 rounded-lg text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between transition-all ${!value || value === 'all' ? 'text-gray-500' : 'text-gray-900 border-blue-200'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'hover:border-gray-400'}`}
      >
        <span className="truncate">{selectedDisplay || placeholder}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value || ''}
          required
          onChange={() => { }}
          style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
          tabIndex={-1}
        />
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search name or ID..."
                className="w-full border border-gray-200 pl-8 pr-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* List items */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-60 overflow-y-auto"
          >
            {allowAll && (
              <div
                onClick={() => { onChange('all'); setIsOpen(false); }}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${value === 'all' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                  }`}
              >
                {placeholder}
              </div>
            )}

            {employees.length > 0 ? (
              employees.map((emp) => {
                const empId = String(emp.employee_id || emp.id);
                const empName = emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                const empCode = emp.employee_code || emp.employee_id_number || '';
                const deptName = emp.department?.name || emp.department_name || '';
                const roleName = emp.designation?.title || emp.role_name || '';

                const isSelected = String(value) === empId;

                return (
                  <div
                    key={empId}
                    onClick={() => { onChange(empId); setIsOpen(false); }}
                    className={`px-3 py-2.5 cursor-pointer text-sm hover:bg-blue-50 transition-all flex items-center justify-between border-b border-gray-50 last:border-0 ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{empName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {empCode && (
                          <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1 rounded">
                            {empCode}
                          </span>
                        )}
                        {(deptName || roleName) && (
                          <span className="text-[10px] text-gray-500 truncate">
                            {deptName}{deptName && roleName ? ' • ' : ''}{roleName}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <FaCheckCircle className="text-blue-600 text-xs flex-shrink-0 ml-2" />}
                  </div>
                );
              })
            ) : !isLoading && (
              <div className="px-3 py-6 text-center text-sm text-gray-400">
                No employees found
              </div>
            )}

            {isLoading && (
              <div className="px-3 py-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin text-blue-600" />
                <span>Loading...</span>
              </div>
            )}

            {!isLoading && !hasMore && employees.length > 0 && (
              <div className="px-3 py-2 text-center text-[10px] text-gray-400 bg-gray-50 border-t border-gray-100 uppercase tracking-wider font-medium">
                End of list ({employees.length} employees)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollEmployeeDropdown;
