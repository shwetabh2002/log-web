'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

export type PlaceValue = {
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  details?: string;
};

export function PlaceAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  label: string;
  placeholder: string;
  value: PlaceValue;
  onChange: (next: PlaceValue) => void;
  required?: boolean;
}) {
  const [query, setQuery] = useState(value.address);
  const [suggestions, setSuggestions] = useState<
    { placeId: string; description: string; mainText: string; secondaryText?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const sessionToken = useRef(`${Date.now()}-${Math.random()}`);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value.address);
  }, [value.address]);

  function scheduleSearch(text: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (text.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const results = await api.placesAutocomplete(text, sessionToken.current);
        setSuggestions(results);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  async function selectSuggestion(item: {
    placeId: string;
    description: string;
  }) {
    setQuery(item.description);
    setOpen(false);
    setSuggestions([]);
    try {
      const details = await api.placeDetails(item.placeId, sessionToken.current);
      sessionToken.current = `${Date.now()}-${Math.random()}`;
      onChange({
        address: details.address,
        lat: details.lat,
        lng: details.lng,
        placeId: details.placeId,
        details: value.details,
      });
    } catch {
      onChange({ address: item.description, placeId: item.placeId, details: value.details });
    }
  }

  const hasCoords = typeof value.lat === 'number' && typeof value.lng === 'number';
  const needsSelection = required && value.address.trim().length > 0 && !hasCoords;

  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-2 flex items-center justify-between">
        <span>{label}</span>
        {hasCoords ? <span className="text-xs font-semibold text-emerald-400">Located</span> : null}
      </span>
      <div className="relative">
        <input
          className={`input-field ${needsSelection ? 'border-red-400/60' : ''}`}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            const text = e.target.value;
            setQuery(text);
            onChange({ address: text, lat: undefined, lng: undefined, placeId: undefined, details: value.details });
            scheduleSearch(text);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          required={required}
        />
        {loading ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sky-400">
            ...
          </span>
        ) : null}
        {open && suggestions.length > 0 ? (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-white/10 bg-[#0C1222] shadow-lg">
            {suggestions.map((item) => (
              <button
                key={item.placeId}
                type="button"
                className="block w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-sky-500/10"
                onClick={() => selectSuggestion(item)}
              >
                <div className="font-medium text-white">{item.mainText}</div>
                {item.secondaryText ? (
                  <div className="text-xs text-slate-400">{item.secondaryText}</div>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {needsSelection ? (
        <p className="mt-1 text-xs text-red-400">
          Select an address from the list to save coordinates.
        </p>
      ) : null}
    </label>
  );
}
