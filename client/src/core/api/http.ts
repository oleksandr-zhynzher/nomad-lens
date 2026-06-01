interface GetJsonOptions<TResponse> {
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly validate?: (value: unknown) => value is TResponse;
  readonly label?: string;
  readonly retries?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 1;
const JSON_CONTENT_TYPE = "application/json";

export type ApiHttpError = Error & {
  readonly name: "ApiHttpError";
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
};

export type ApiContentTypeError = Error & {
  readonly name: "ApiContentTypeError";
  readonly contentType: string;
  readonly url: string;
};

export type ApiValidationError = Error & {
  readonly name: "ApiValidationError";
  readonly url: string;
};

export type ApiNetworkError = Error & {
  readonly name: "ApiNetworkError";
  readonly url: string;
  readonly cause: unknown;
};

export type ApiError = ApiHttpError | ApiContentTypeError | ApiValidationError | ApiNetworkError;

function createApiHttpError(
  message: string,
  status: number,
  statusText: string,
  url: string,
): ApiHttpError {
  return Object.assign(new Error(message), {
    name: "ApiHttpError" as const,
    status,
    statusText,
    url,
  });
}

function createApiContentTypeError(
  message: string,
  contentType: string,
  url: string,
): ApiContentTypeError {
  return Object.assign(new Error(message), {
    name: "ApiContentTypeError" as const,
    contentType,
    url,
  });
}

function createApiValidationError(message: string, url: string): ApiValidationError {
  return Object.assign(new Error(message), {
    name: "ApiValidationError" as const,
    url,
  });
}

function createApiNetworkError(message: string, url: string, cause: unknown): ApiNetworkError {
  return Object.assign(new Error(message), {
    name: "ApiNetworkError" as const,
    url,
    cause,
  });
}

function isRetryableHttpStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function isAbortLikeError(error: unknown): boolean {
  return (
    error instanceof DOMException && (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

function isApiHttpError(error: unknown): error is ApiHttpError {
  return error instanceof Error && error.name === "ApiHttpError" && "status" in error;
}

function isApiContentTypeError(error: unknown): error is ApiContentTypeError {
  return error instanceof Error && error.name === "ApiContentTypeError";
}

function isApiValidationError(error: unknown): error is ApiValidationError {
  return error instanceof Error && error.name === "ApiValidationError";
}

function isApiNetworkError(error: unknown): error is ApiNetworkError {
  return error instanceof Error && error.name === "ApiNetworkError";
}

export function getUserFacingErrorMessage(error: unknown): string {
  if (isApiHttpError(error)) {
    if (error.status === 404) return "The requested data was not found.";
    if (error.status === 408) return "The request timed out. Please try again.";
    if (error.status === 429) return "Too many requests. Please wait a moment and try again.";
    if (error.status >= 500) return "The service is temporarily unavailable. Please try again.";
    return "The request could not be completed.";
  }

  if (isApiContentTypeError(error) || isApiValidationError(error)) {
    return "The service returned an invalid response. Please try again later.";
  }

  if (isApiNetworkError(error) || error instanceof TypeError) {
    return "Network request failed. Check your connection and try again.";
  }

  if (isAbortLikeError(error)) {
    return "The request was cancelled.";
  }

  return "An unexpected error occurred. Please try again.";
}

function shouldRetry(error: unknown): boolean {
  if (isAbortLikeError(error)) return false;
  if (isApiHttpError(error)) return isRetryableHttpStatus(error.status);
  return error instanceof TypeError || isApiNetworkError(error);
}

async function waitForRetry(attempt: number): Promise<void> {
  await new Promise((resolve) => {
    globalThis.setTimeout(resolve, 150 * 2 ** attempt);
  });
}

export async function getJson<TResponse>(
  url: string,
  options: GetJsonOptions<TResponse> = {},
): Promise<TResponse> {
  const maxAttempts = Math.max(1, (options.retries ?? DEFAULT_RETRIES) + 1);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fetchJsonOnce(url, options);
    } catch (error) {
      if (attempt >= maxAttempts - 1 || options.signal?.aborted || !shouldRetry(error)) {
        throw error;
      }
      await waitForRetry(attempt);
    }
  }

  throw createApiNetworkError(`Request failed before completion: ${url}`, url, null);
}

async function fetchJsonOnce<TResponse>(
  url: string,
  options: GetJsonOptions<TResponse>,
): Promise<TResponse> {
  const timeoutSignal = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const signal =
    options.signal === undefined ? timeoutSignal : AbortSignal.any([options.signal, timeoutSignal]);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: JSON_CONTENT_TYPE },
      signal,
    });
  } catch (error) {
    if (isAbortLikeError(error)) throw error;
    throw createApiNetworkError(`Network request failed for ${url}`, url, error);
  }

  if (!response.ok) {
    throw createApiHttpError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText,
      url,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes(JSON_CONTENT_TYPE)) {
    throw createApiContentTypeError(
      `Expected JSON from ${url}, received ${contentType !== "" ? contentType : "unknown content type"}`,
      contentType,
      url,
    );
  }

  const data: unknown = await response.json();
  if (options.validate !== undefined && !options.validate(data)) {
    throw createApiValidationError(`Invalid ${options.label ?? "API"} response from ${url}`, url);
  }

  return data as TResponse;
}
