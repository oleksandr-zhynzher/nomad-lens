import { afterEach, describe, expect, it, vi } from "vitest";

import { type ApiHttpError, getJson, getUserFacingErrorMessage } from "../src/core/api";

describe("getJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retries transient HTTP failures for JSON GET requests", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("", { status: 503, statusText: "Service Unavailable" }))
      .mockResolvedValueOnce(
        Response.json(
          { ok: true },
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getJson<{ ok: boolean }>("/api/example", {
        retries: 1,
        validate: (value): value is { ok: boolean } =>
          typeof value === "object" && value !== null && "ok" in value,
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("surfaces typed HTTP errors after retries are exhausted", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("", { status: 500, statusText: "Internal Server Error" })),
    );

    await expect(getJson<unknown>("/api/example", { retries: 0 })).rejects.toMatchObject({
      name: "ApiHttpError",
      status: 500,
    } satisfies Partial<ApiHttpError>);
  });

  it("maps API failures to safe user-facing messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("", { status: 429, statusText: "Too Many Requests" })),
    );

    await expect(getJson<unknown>("/api/example", { retries: 0 })).rejects.toSatisfy(
      (error: unknown) =>
        getUserFacingErrorMessage(error) ===
        "Too many requests. Please wait a moment and try again.",
    );
  });
});
