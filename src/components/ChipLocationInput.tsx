import React, { useState, useRef, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CityApi } from "../findjobnu-api/";
import type { CityResponse as City } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";

export interface LocationChip {
  id: string;
  label: string;
  value: string;
  city?: City;
}

interface Props {
  chips: LocationChip[];
  onChipsChange: (chips: LocationChip[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  inputId?: string;
  ariaLabel?: string;
  /** Called when input value changes */
  onInputChange?: (value: string) => void;
  /** Current input value (controlled) */
  inputValue?: string;
}

const MAX_SUGGESTIONS = 8;

const ChipLocationInput: React.FC<Props> = ({
  chips,
  onChipsChange,
  placeholder = "Skriv lokation...",
  className = "",
  disabled = false,
  inputId,
  ariaLabel,
  onInputChange,
  inputValue: controlledInputValue,
}) => {
  const [internalInputValue, setInternalInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const citiesApi = createApiClient(CityApi);

  const inputValue = controlledInputValue ?? internalInputValue;
  const setInputValue = useCallback((value: string) => {
    setInternalInputValue(value);
    onInputChange?.(value);
  }, [onInputChange]);

  const fetchSuggestions = async (query: string) => {
    try {
      if (query.length > 0) {
        const results = await citiesApi.getCitiesByQuery({ query });
        setSuggestions((results ?? []).slice(0, MAX_SUGGESTIONS));
      } else {
        const results = await citiesApi.getAllCities();
        setSuggestions((results ?? []).slice(0, MAX_SUGGESTIONS));
      }
    } catch {
      setSuggestions([]);
    }
  };

  // Filter out already-selected cities from suggestions
  const filteredSuggestions = suggestions.filter(
    (s) => !chips.some((c) => c.value.toLowerCase() === (s.name ?? "").toLowerCase())
  );

  const addChip = useCallback(
    async (city: City) => {
      const name = city.name ?? "";
      if (chips.some((c) => c.value.toLowerCase() === name.toLowerCase())) return;
      onChipsChange([
        ...chips,
        {
          id: `city-${city.id ?? name}`,
          label: name,
          value: name,
          city,
        },
      ]);
      setInputValue("");
      setActiveIndex(-1);
      // Keep suggestions open and refetch to allow adding more locations
      try {
        const results = await citiesApi.getAllCities();
        setSuggestions((results ?? []).slice(0, MAX_SUGGESTIONS));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    },
    [chips, onChipsChange, citiesApi, setInputValue]
  );

  const addFreeTextChip = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0) return;
      if (chips.some((c) => c.value.toLowerCase() === trimmed.toLowerCase())) return;
      onChipsChange([
        ...chips,
        {
          id: `freetext-${trimmed.toLowerCase()}`,
          label: trimmed,
          value: trimmed,
        },
      ]);
      setInputValue("");
      setShowSuggestions(false);
      setActiveIndex(-1);
    },
    [chips, onChipsChange, setInputValue]
  );

  const removeChip = useCallback(
    (id: string) => {
      onChipsChange(chips.filter((c) => c.id !== id));
    },
    [chips, onChipsChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check for comma to create chip
    if (value.endsWith(",")) {
      const trimmed = value.slice(0, -1).trim();
      if (trimmed.length > 0) {
        addFreeTextChip(trimmed);
        return;
      }
    }

    setInputValue(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value.trim());
      setShowSuggestions(true);
      setActiveIndex(-1);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && chips.length > 0) {
      removeChip(chips[chips.length - 1].id);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
        addChip(filteredSuggestions[activeIndex]);
      } else if (inputValue.trim().length > 0) {
        addFreeTextChip(inputValue);
      }
      return;
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    }
  };

  const handleFocus = async () => {
    await fetchSuggestions(inputValue.trim());
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }, 150);
  };

  const handleSuggestionClick = (city: City) => {
    addChip(city);
    inputRef.current?.focus();
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const lower = text.toLowerCase();
    const q = query.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/30 px-0 py-0 rounded-none">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`flex flex-wrap items-center gap-1.5 min-h-[2.5rem] px-3 py-2 border border-base-300 rounded-btn bg-base-100 cursor-text transition-colors hover:border-base-content/40 focus-within:border-base-content focus-within:outline-2 focus-within:outline-offset-2 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleContainerClick}
      >
        {chips.map((chip) => (
          <span
            key={chip.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-sm bg-primary/15 text-primary-content border border-primary/30 rounded-full"
          >
            <span className="text-base-content">{chip.label}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeChip(chip.id);
                }}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                aria-label={`Fjern ${chip.label}`}
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-base-content/50"
          placeholder={chips.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-label={ariaLabel}
          autoComplete="off"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-20 bg-base-100 border border-base-300 w-full max-h-48 overflow-y-auto shadow-lg rounded-box mt-1 p-0">
          {filteredSuggestions.map((city, idx) => (
            <li key={city.id ?? city.name}>
              <button
                type="button"
                aria-label={`Vælg ${city.name}`}
                className={`w-full text-left px-3 py-2 text-sm ${
                  idx === activeIndex
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(city);
                }}
              >
                {highlightText(city.name ?? "", inputValue)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChipLocationInput;
