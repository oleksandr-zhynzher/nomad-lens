export {
  filterRanked,
  findMatchingCodes,
  toggleSetItem,
} from "@features/tourism/utils/search.utils";

export function navButtonClass(hasMatches: boolean): string {
  return `flex h-6 w-6 items-center justify-center rounded-[3px] border-0 bg-[#2A2A2A] ${hasMatches ? "cursor-pointer text-muted" : "cursor-default text-dimmer"}`;
}
