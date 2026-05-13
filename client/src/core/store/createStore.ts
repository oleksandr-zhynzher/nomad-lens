import { create } from "zustand";
import type { StateCreator, StoreApi, UseBoundStore } from "zustand";

export type AppStore<TState> = UseBoundStore<StoreApi<TState>>;
export type AppStoreCreator<TState> = StateCreator<TState, [], [], TState>;

export function createAppStore<TState>(creator: AppStoreCreator<TState>): AppStore<TState> {
  return create<TState>()(creator);
}
