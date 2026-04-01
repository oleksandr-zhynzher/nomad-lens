import type { CountryData } from "../utils/types";

declare global {
  interface Window {
    __NOMAD_LENS_DATA__?: CountryData[];
  }
}
