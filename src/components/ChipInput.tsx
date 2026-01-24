import React, { useState, useRef, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface ChipItem {
  id: string | number;
  label: string;
  value: string;
}

interface Props {
  chips: ChipItem[];
  onChipsChange: (chips: ChipItem[]) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  /** If true, allows free-text chips (created on comma or enter). If false, only suggestions can be added. */
  allowFreeText?: boolean;
  /** Suggestions to show in dropdown */
  suggestions?: ChipItem[];
  /** Called when input value changes (for filtering suggestions) */
  onInputChange?: (value: string) => void;
  /** Called when input is focused */
  onFocus?: () => void;
  /** Called when input is blurred */
  onBlur?: () => void;
  /** Current input value (controlled) */
  inputValue?: string;
  /** Minimum characters before showing suggestions */
  minCharsForSuggestions?: number;
  /** Show suggestions on focus even with empty input */
  showSuggestionsOnFocus?: boolean;
  /** Highlight matching text in suggestions */
  highlightMatch?: boolean;
  /** Input id for accessibility */
  inputId?: string;
  /** Aria label */
  ariaLabel?: string;
}

const ChipInput: React.FC<Props> = ({
  chips,
  onChipsChange,
  placeholder = "Type and press comma or enter...",
  className = "",
  inputClassName = "",
  disabled = false,
  allowFreeText = true,
  suggestions = [],
  onInputChange,
  onFocus,
  onBlur,
  inputValue: controlledInputValue,
  minCharsForSuggestions = 0,
  showSuggestionsOnFocus = true,
  highlightMatch = true,
  inputId,
  ariaLabel,
}) => {
  const [internalInputValue, setInternalInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputValue = controlledInputValue ?? internalInputValue;
  const setInputValue = (value: string) => {
    setInternalInputValue(value);
    onInputChange?.(value);
  };

  // Filter out already-selected chips from suggestions
  const filteredSuggestions = suggestions.filter(
    (s) => !chips.some((c) => c.id === s.id)
  );

  const shouldShowSuggestions =
    showSuggestions &&
    filteredSuggestions.length > 0 &&
    (inputValue.length >= minCharsForSuggestions || showSuggestionsOnFocus);

  const addChip = useCallback(
    (item: ChipItem) => {
      if (chips.some((c) => c.id === item.id)) return;
      onChipsChange([...chips, item]);
      setInputValue("");
      // Keep suggestions open to allow adding more items
      setShowSuggestions(true);
      setActiveIndex(-1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chips, onChipsChange]
  );

  const removeChip = useCallback(
    (id: string | number) => {
      onChipsChange(chips.filter((c) => c.id !== id));
    },
    [chips, onChipsChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check for comma to create chip
    if (allowFreeText && value.endsWith(",")) {
      const trimmed = value.slice(0, -1).trim();
      if (trimmed.length > 0) {
        addChip({
          id: `freetext-${trimmed.toLowerCase()}`,
          label: trimmed,
          value: trimmed,
        });
        return;
      }
    }
    
    setInputValue(value);
    setShowSuggestions(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && chips.length > 0) {
      // Remove last chip
      removeChip(chips[chips.length - 1].id);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
        // Select from suggestions
        addChip(filteredSuggestions[activeIndex]);
      } else if (allowFreeText && inputValue.trim().length > 0) {
        // Add as free text
        addChip({
          id: `freetext-${inputValue.trim().toLowerCase()}`,
          label: inputValue.trim(),
          value: inputValue.trim(),
        });
      }
      return;
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    if (!shouldShowSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    }
  };

  const handleFocus = () => {
    if (showSuggestionsOnFocus) {
      setShowSuggestions(true);
    }
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }, 150);
    onBlur?.();
  };

  const handleSuggestionClick = (item: ChipItem) => {
    addChip(item);
    inputRef.current?.focus();
  };

  const highlightText = (text: string, query: string) => {
    if (!highlightMatch || !query || !text) return text || "";
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

  // Click on container focuses input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-2 border border-base-300 rounded-btn bg-base-100 cursor-text transition-colors hover:border-base-content/40 focus-within:border-base-content focus-within:outline-2 focus-within:outline-offset-2 ${
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
          className={`flex-1 min-w-30 bg-transparent border-none outline-none text-sm placeholder:text-base-content/50 ${inputClassName}`}
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

      {shouldShowSuggestions && (
        <ul className="absolute left-0 top-full z-20 bg-base-100 border border-base-300 w-full max-h-48 overflow-y-auto shadow-lg rounded-box mt-1 p-0">
          {filteredSuggestions.map((item, idx) => (
            <li key={item.id}>
              <button
                type="button"
                aria-label={`Vælg kategori ${item.label}`}
                className={`w-full text-left px-3 py-2 text-sm ${
                  idx === activeIndex
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(item);
                }}
              >
                {highlightText(item.label, inputValue)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChipInput;
