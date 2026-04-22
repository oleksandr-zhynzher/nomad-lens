import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronUp,
  ChevronDown,
  Filter,
  List,
  GitCompare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/Layout";
import { TourismWeightPanel } from "../components/TourismWeightPanel";
import { TourismCountryCard } from "../components/TourismCountryCard";
import { Tooltip } from "../components/Tooltip";
import { useCountries } from "../hooks/useCountries";
import { useLangPrefix } from "../hooks/useLangPrefix";
import { useTourismWeightState } from "../hooks/useTourismWeightState";
import { ALL_TOURISM_TAGS } from "../hooks/useTourismWeightState";
import { useTourismScoring } from "../hooks/useTourismScoring";
import { localizeCountry } from "../utils/localize";
import { TOURISM_CATEGORY_KEYS } from "../utils/types";

export function TourismPage() {
  const { t, i18n } = useTranslation();
  const langPrefix = useLangPrefix();
  const navigate = useNavigate();
  const { countries, loading } = useCountries();

  const ws = useTourismWeightState();
  const ranked = useTourismScoring(
    countries,
    ws.weights,
    ws.selectedRegions,
    ws.toggles,
    ws.budgetState,
    ws.travelDates,
  );

  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<"filter" | "highlight">(
    "filter",
  );
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [matchCursor, setMatchCursor] = useState(0);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [mobileParamsOpen, setMobileParamsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const mobileSheetCloseButtonRef = useRef<HTMLButtonElement>(null);

  // Mobile focus trap
  useEffect(() => {
    if (!mobileParamsOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";
    mobileSheetCloseButtonRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileParamsOpen(false);
        return;
      }

      if (e.key !== "Tab") return;

      const sheet = mobileSheetRef.current;
      if (!sheet) return;

      const focusable = sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
      previousFocusedElement?.focus();
    };
  }, [mobileParamsOpen]);

  // Search — matching codes for highlight mode
  const matchingCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || searchMode !== "highlight") return [];
    return ranked
      .filter((r) =>
        localizeCountry(r.country, i18n.language)
          .name.toLowerCase()
          .includes(q),
      )
      .map((r) => r.country.code);
  }, [search, searchMode, ranked, i18n.language]);

  useEffect(() => {
    // Use a microtask to avoid synchronous setState inside effect (react-hooks/set-state-in-effect)
    const id = setTimeout(() => {
      if (searchMode === "highlight" && matchingCodes.length > 0) {
        setHighlightedCode(matchingCodes[matchCursor % matchingCodes.length]);
      } else {
        setHighlightedCode(null);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [matchingCodes, matchCursor, searchMode]);

  // Scroll to highlighted country
  useEffect(() => {
    if (!highlightedCode) return;
    const el = document.querySelector(
      `[data-country-code="${highlightedCode}"]`,
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedCode]);

  const goNext = useCallback(
    () =>
      setMatchCursor((c) =>
        matchingCodes.length ? (c + 1) % matchingCodes.length : 0,
      ),
    [matchingCodes.length],
  );
  const goPrev = useCallback(
    () =>
      setMatchCursor((c) =>
        matchingCodes.length
          ? (c - 1 + matchingCodes.length) % matchingCodes.length
          : 0,
      ),
    [matchingCodes.length],
  );

  // Filtered/displayed list
  const displayedRanked = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || searchMode === "highlight") return ranked;
    return ranked.filter((r) =>
      localizeCountry(r.country, i18n.language).name.toLowerCase().includes(q),
    );
  }, [ranked, search, searchMode, i18n.language]);

  const activeHighlight =
    searchMode === "highlight" ? highlightedCode : undefined;

  const toggleSelect = useCallback((code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setSelectedCodes(new Set());
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedCodes.size < 2) return;
    navigate(
      `${langPrefix}/compare?m=tourism&c=${Array.from(selectedCodes).join(",")}`,
    );
  }, [selectedCodes, navigate, langPrefix]);

  return (
    <Layout>
      <div className="flex">
        {/* Left sidebar - Tourism Weight Panel (hidden on mobile) */}
        <aside
          className="hidden md:block sticky top-14 self-start"
          style={{ width: "340px", height: "calc(100vh - 56px)" }}
        >
          <TourismWeightPanel
            weights={ws.weights}
            onChange={ws.handleWeightChange}
            onReset={ws.handleReset}
            weightsAreDefault={ws.weightsAreDefault}
            budgetState={ws.budgetState}
            onBudgetChange={ws.setBudgetField}
            toggles={ws.toggles}
            onToggleFieldChange={ws.setToggleField}
            travelDates={ws.travelDates}
            onTravelDatesChange={ws.setTravelDates}
          />
        </aside>

        {/* Mobile parameters bottom sheet */}
        {mobileParamsOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
            aria-label={t("mobileSheet.weightsAndPreferences")}
            onClick={() => setMobileParamsOpen(false)}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(6px)",
              }}
            />
            <div
              ref={mobileSheetRef}
              data-mobile-sheet
              tabIndex={-1}
              className="relative mt-auto flex w-full flex-col overflow-hidden"
              style={{
                minHeight: "70vh",
                maxHeight: "calc(100dvh - 16px)",
                backgroundColor: "#1A1A1A",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                borderTop: "1px solid #2A2A2A",
                boxShadow: "0 -18px 42px rgba(0,0,0,0.45)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div
                  style={{
                    width: "36px",
                    height: "4px",
                    borderRadius: "2px",
                    backgroundColor: "#444444",
                  }}
                />
              </div>
              {/* Close button */}
              <div className="flex items-center justify-between px-4 pb-2 shrink-0">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#9E9E9E",
                  }}
                >
                  {t("tourismWeights.title", "Tourism Weights")}
                </span>
                <button
                  ref={mobileSheetCloseButtonRef}
                  onClick={() => setMobileParamsOpen(false)}
                  className="flex items-center justify-center"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    backgroundColor: "#333333",
                    color: "#9E9E9E",
                  }}
                  aria-label={t(
                    "tourism.a11y.closeParameters",
                    "Close parameters",
                  )}
                >
                  <X size={18} />
                </button>
              </div>
              <TourismWeightPanel
                weights={ws.weights}
                onChange={ws.handleWeightChange}
                onReset={ws.handleReset}
                weightsAreDefault={ws.weightsAreDefault}
                budgetState={ws.budgetState}
                onBudgetChange={ws.setBudgetField}
                toggles={ws.toggles}
                onToggleFieldChange={ws.setToggleField}
                travelDates={ws.travelDates}
                onTravelDatesChange={ws.setTravelDates}
                mobile
              />
            </div>
          </div>
        )}

        {/* Mobile FAB - Parameters button */}
        <button
          className="md:hidden fixed z-40 flex items-center gap-2 shadow-lg"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
            right: "16px",
            height: "48px",
            paddingLeft: "16px",
            paddingRight: "18px",
            borderRadius: "24px",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
          }}
          onClick={() => setMobileParamsOpen(true)}
          aria-label={t("tourism.a11y.openParameters", "Open parameters")}
        >
          <SlidersHorizontal size={18} />
          {t("mobileSheet.parameters", "Parameters")}
        </button>

        {/* Right content area */}
        <main
          className="flex-1 min-w-0 pb-28 md:pb-0"
          style={{ backgroundColor: "#000000" }}
        >
          <div className="px-4 md:px-6">
            {/* Hero section */}
            <div
              className="relative -mx-4 mb-6 overflow-hidden md:mx-0 md:mb-6 md:rounded-lg"
              style={{
                background: "#000000",
                backgroundImage: `url('/hero-map.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.85) 100%)",
                }}
              />

              <div
                className="relative flex flex-col justify-end px-4 py-4 md:px-12 md:py-12"
                style={{ minHeight: "160px" }}
              >
                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-accent-dim)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: "2.5px",
                        textTransform: "uppercase",
                        color: "var(--color-accent-dim)",
                        lineHeight: 1,
                      }}
                    >
                      {t("tourism.eyebrow", "EXPLORE")}
                    </span>
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-accent-dim)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: "2.5px",
                        textTransform: "uppercase",
                        color: "var(--color-accent-dim)",
                        lineHeight: 1,
                      }}
                    >
                      {t("nav.tourism", "TOURISM")}
                    </span>
                  </span>
                </div>

                {/* H1 */}
                <h1
                  className="text-3xl md:text-6xl"
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 700,
                    lineHeight: "0.95",
                    color: "#FFFFFF",
                    marginBottom: "8px",
                  }}
                >
                  {t("tourism.title", "TOURISM EXPLORER")}
                </h1>

                {/* Tagline */}
                <p
                  className="hidden md:block"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    color: "#8A8A8A",
                    maxWidth: "580px",
                    marginBottom: "20px",
                  }}
                >
                  {t("tourism.subtitle")}
                </p>

                {/* Copper rule */}
                <div
                  className="hidden md:block"
                  style={{
                    width: "128px",
                    height: "2px",
                    backgroundColor: "var(--color-accent)",
                    marginBottom: "16px",
                  }}
                />

                {/* Stats row */}
                <div className="hero-stats-row hero-banner-stats">
                  <div className="min-w-0">
                    <div
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--color-accent-dim)",
                        lineHeight: "1",
                      }}
                    >
                      {ranked.length}
                    </div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#757575",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginTop: "4px",
                      }}
                    >
                      {t("hero.stats.countries", {
                        count: ranked.length,
                      })}
                    </div>
                  </div>
                  <div className="hero-stat-divider" />
                  <div className="min-w-0">
                    <div
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--color-accent-dim)",
                        lineHeight: "1",
                      }}
                    >
                      {TOURISM_CATEGORY_KEYS.length}
                    </div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        color: "#757575",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginTop: "4px",
                      }}
                    >
                      {t("tourismWeights.metricsLabel", "Tourism Metrics")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentinel for sticky detection */}
            <div ref={sentinelRef} style={{ height: "1px" }} />

            {/* Sticky search bar */}
            <div
              className="sticky z-20"
              style={{
                top: "56px",
                backgroundColor: "#000000",
                paddingTop: "8px",
                paddingBottom: "12px",
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <div
                    className="flex flex-1 items-center"
                    style={{
                      backgroundColor: "#1A1A1C",
                      border: "1px solid #333333",
                      borderRadius: "6px",
                      height: "40px",
                      padding: "0 12px",
                      gap: "8px",
                    }}
                  >
                    <Search size={16} color="#757575" />
                    <input
                      ref={searchInputRef}
                      name="tourism-search"
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setMatchCursor(0);
                      }}
                      placeholder={t(
                        "tourism.searchPlaceholder",
                        "Search countries…",
                      )}
                      style={{
                        flex: 1,
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#E8E9EB",
                      }}
                    />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setHighlightedCode(null);
                          setMatchCursor(0);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#757575",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Search mode controls */}
                  {search.trim() && (
                    <div
                      className="flex items-center"
                      style={{ gap: "4px", flexShrink: 0 }}
                    >
                      {searchMode === "highlight" &&
                        matchingCodes.length > 0 && (
                          <>
                            <span
                              style={{
                                fontFamily: "IBM Plex Mono, monospace",
                                fontSize: "11px",
                                color: "#8A8A8A",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {matchCursor + 1}/{matchingCodes.length}
                            </span>
                            <button
                              onClick={goPrev}
                              disabled={matchingCodes.length === 0}
                              className="flex items-center justify-center"
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "3px",
                                border: "none",
                                cursor: matchingCodes.length
                                  ? "pointer"
                                  : "default",
                                backgroundColor: "#2A2A2A",
                                color: matchingCodes.length
                                  ? "#CCCCCC"
                                  : "#757575",
                              }}
                              aria-label={t(
                                "tourism.a11y.previousMatch",
                                "Previous match",
                              )}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={goNext}
                              disabled={matchingCodes.length === 0}
                              className="flex items-center justify-center"
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "3px",
                                border: "none",
                                cursor: matchingCodes.length
                                  ? "pointer"
                                  : "default",
                                backgroundColor: "#2A2A2A",
                                color: matchingCodes.length
                                  ? "#CCCCCC"
                                  : "#757575",
                              }}
                              aria-label={t(
                                "tourism.a11y.nextMatch",
                                "Next match",
                              )}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </>
                        )}
                      <Tooltip
                        side="bottom"
                        content={
                          searchMode === "filter" ? (
                            <span>
                              {t(
                                "tourism.searchModeScrollTooltip",
                                "Switch to scroll mode - shows all countries and scrolls to each match.",
                              )}
                            </span>
                          ) : (
                            <span>
                              {t(
                                "tourism.searchModeFilterTooltip",
                                "Switch to filter mode - hides non-matching countries.",
                              )}
                            </span>
                          )
                        }
                      >
                        <button
                          onClick={() => {
                            setSearchMode((m) =>
                              m === "filter" ? "highlight" : "filter",
                            );
                            setMatchCursor(0);
                          }}
                          className="flex items-center justify-center"
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "3px",
                            border: "none",
                            cursor: "pointer",
                            backgroundColor: "#2A2A2A",
                            color: "#9E9E9E",
                          }}
                          aria-label={
                            searchMode === "filter"
                              ? t(
                                  "tourism.a11y.switchToScrollMode",
                                  "Switch to scroll mode",
                                )
                              : t(
                                  "tourism.a11y.switchToFilterMode",
                                  "Switch to filter mode",
                                )
                          }
                        >
                          {searchMode === "filter" ? (
                            <List size={13} />
                          ) : (
                            <Filter size={13} />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>

                <div className="flex w-full items-center justify-end gap-2 shrink-0 sm:w-auto">
                  {compareMode ? (
                    <>
                      <button
                        onClick={handleCompare}
                        className="flex-1 justify-center sm:flex-none"
                        disabled={selectedCodes.size < 2}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          height: "40px",
                          paddingLeft: "14px",
                          paddingRight: "14px",
                          borderRadius: "6px",
                          border:
                            selectedCodes.size < 2
                              ? "1px solid var(--color-accent-dim)"
                              : "none",
                          cursor:
                            selectedCodes.size < 2 ? "default" : "pointer",
                          backgroundColor:
                            selectedCodes.size < 2
                              ? "#161616"
                              : "var(--color-accent)",
                          color:
                            selectedCodes.size < 2
                              ? "var(--color-accent-dim)"
                              : "#FFFFFF",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          transition: "all 0.15s ease",
                          flexShrink: 0,
                        }}
                      >
                        <GitCompare size={15} />
                        {t("compare.compareSelected", "Compare")}
                        {selectedCodes.size > 0 && (
                          <span
                            style={{
                              backgroundColor:
                                selectedCodes.size < 2
                                  ? "rgba(143,90,60,0.2)"
                                  : "rgba(255,255,255,0.25)",
                              borderRadius: "10px",
                              padding: "1px 7px",
                              fontSize: "12px",
                            }}
                          >
                            {selectedCodes.size}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={exitCompareMode}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "40px",
                          height: "40px",
                          borderRadius: "6px",
                          border: "1px solid #2A2A2A",
                          cursor: "pointer",
                          backgroundColor: "#161616",
                          color: "#8A8A8A",
                          flexShrink: 0,
                        }}
                        aria-label={t(
                          "tourism.a11y.exitCompareMode",
                          "Exit compare mode",
                        )}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCompareMode(true)}
                      className="w-full justify-center sm:w-auto"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        height: "40px",
                        paddingLeft: "14px",
                        paddingRight: "14px",
                        borderRadius: "6px",
                        border: "1px solid #2A2A2A",
                        cursor: "pointer",
                        backgroundColor: "#161616",
                        color: "#9E9E9E",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      <GitCompare size={15} />
                      {t("compare.compareMode", "Compare")}
                    </button>
                  )}
                </div>
              </div>

              {compareMode && (
                <p
                  style={{
                    marginTop: "8px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    color: "#8A8A8A",
                    paddingLeft: "2px",
                  }}
                >
                  {t(
                    "compare.helperText",
                    "Choose countries using the checkboxes in the list, then click Compare to open the comparison view.",
                  )}
                </p>
              )}
            </div>

            {/* Activity tag chips */}
            <div className="mb-0">
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#9E9E9E",
                  marginBottom: "12px",
                }}
              >
                {t("tourismFilters.activityTags", "Activities")}
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_TOURISM_TAGS.map((tag) => {
                  const active = ws.toggles.requiredTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => ws.handleToggleTag(tag)}
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        padding: "8px 18px",
                        borderRadius: "3px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: active ? "#8F5A3C" : "#2A2A2A",
                        color: active ? "#FFFFFF" : "#9E9E9E",
                      }}
                    >
                      {t(`tourismTags.${tag}`, tag)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Country list */}
          <div className="px-4 md:px-6">
            <div
              className="flex items-center justify-between px-1 my-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#9E9E9E" }}>
                {compareMode
                  ? t(
                      "compare.tourismSelectionSubtitle",
                      "Select countries to compare tourism appeal side by side",
                    )
                  : t(
                      "countryList.clickHint",
                      "Click on a country to view details",
                    )}
              </span>
              <span style={{ color: "#8A8A8A" }}>
                {t("countryList.count", { count: displayedRanked.length })}
              </span>
            </div>

            <div className="flex flex-col">
              {loading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse"
                      style={{
                        backgroundColor: "#1A1A1A",
                        borderTop: "1px solid #333333",
                      }}
                    />
                  ))}
                </div>
              ) : displayedRanked.length === 0 ? (
                <p
                  className="text-center py-20"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    color: "#8A8A8A",
                  }}
                >
                  {t("tourism.noResults", "No countries match your filters.")}
                </p>
              ) : (
                displayedRanked.map((r, i) => (
                  <TourismCountryCard
                    key={r.country.code}
                    ranked={r}
                    index={i}
                    highlighted={r.country.code === activeHighlight}
                    expanded={
                      compareMode ? false : expandedCode === r.country.code
                    }
                    onToggle={
                      compareMode
                        ? undefined
                        : () =>
                            setExpandedCode((c) =>
                              c === r.country.code ? null : r.country.code,
                            )
                    }
                    compareMode={compareMode}
                    isSelected={selectedCodes.has(r.country.code)}
                    onSelect={() => toggleSelect(r.country.code)}
                    selectedTags={ws.toggles.requiredTags}
                    travelDates={ws.travelDates}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
