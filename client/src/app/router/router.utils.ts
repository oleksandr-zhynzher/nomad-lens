import type { ComponentType } from "react";

export function routeModule<TModule>(key: keyof TModule) {
  return (module: TModule) => ({ default: module[key] as ComponentType });
}
