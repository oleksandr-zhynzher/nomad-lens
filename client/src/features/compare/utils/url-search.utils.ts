export function setOptionalSearchParam(
  params: URLSearchParams,
  key: string,
  value: string | null | undefined,
) {
  if (value === null || value === undefined || value === "") {
    params.delete(key);
    return;
  }

  params.set(key, value);
}

export function cloneSearchParams(params: URLSearchParams): URLSearchParams {
  return new URLSearchParams(params);
}
