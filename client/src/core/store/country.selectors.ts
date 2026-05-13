import type { CountryStoreState } from "./country.store";

export const selectCountries = (state: CountryStoreState) => state.countries;
export const selectCountryStatus = (state: CountryStoreState) => state.status;
export const selectCountryError = (state: CountryStoreState) => state.error;
export const selectLoadCountries = (state: CountryStoreState) => state.loadCountries;
export const selectRefreshCountries = (state: CountryStoreState) => state.refreshCountries;
