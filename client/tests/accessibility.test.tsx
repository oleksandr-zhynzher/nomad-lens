// @vitest-environment jsdom

import "../src/core/i18n";
import "@testing-library/jest-dom/vitest";

import { SearchInput } from "@core/ui/forms/SearchInput";
import { MobileSheet } from "@core/ui/MobileSheet";
import { CountryPickerDropdown } from "@features/compare/ui/CountryPickerDropdown";
import { TourismCalendarPicker } from "@features/tourism/ui/TourismCalendarPicker";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

describe("accessibility primitives", () => {
  it("keeps the shared search input accessible", async () => {
    const { container } = render(
      <SearchInput
        name="country-search"
        value="por"
        onValueChange={vi.fn()}
        ariaLabel="Search countries"
        clearLabel="Clear country search"
      />,
    );

    expect(screen.getByRole("textbox", { name: "Search countries" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear country search" })).toBeInTheDocument();
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("keeps the country picker listbox accessible", async () => {
    const { container } = render(
      <CountryPickerDropdown
        open
        inputName="compare-country"
        searchPlaceholder="Search country"
        query=""
        onQueryChange={vi.fn()}
        onSelect={vi.fn()}
        emptyLabel="No countries found"
        countries={[
          {
            code: "PT",
            flagUrl: "https://flagcdn.com/pt.svg",
            name: "Portugal",
            regionLabel: "Europe",
          },
        ]}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Search country" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Search country" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /portugal/i })).toBeInTheDocument();
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("keeps the tourism calendar grid accessible", async () => {
    const { container } = render(
      <TourismCalendarPicker startDate="2000-06-10" endDate="2000-06-12" onChange={vi.fn()} />,
    );

    expect(screen.getByRole("grid", { name: "Travel date range calendar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "June 10, selected" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear dates" })).toBeInTheDocument();
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("keeps the mobile sheet dialog accessible", async () => {
    const { container } = render(
      <MobileSheet open title="Navigation" closeLabel="Close navigation menu" onClose={vi.fn()}>
        <button type="button">Explore rankings</button>
      </MobileSheet>,
    );

    expect(within(container).getByRole("dialog", { name: "Navigation" })).toBeInTheDocument();
    expect(
      within(container).getAllByRole("button", { name: "Close navigation menu" }),
    ).toHaveLength(2);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
