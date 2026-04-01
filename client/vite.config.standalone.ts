import { defineConfig, type Plugin } from "vite";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// ── Plugin: inject pre-baked country data as window global ────────────────────
function injectCountryData(): Plugin {
  const dataPath = resolve(__dirname, "src/data/countries.json");
  return {
    name: "inject-country-data",
    transformIndexHtml(html) {
      if (!existsSync(dataPath)) {
        throw new Error(
          `countries.json not found at ${dataPath}. Run "npm run generate-data" first.`,
        );
      }
      const json = readFileSync(dataPath, "utf-8");
      const script = `<script>window.__NOMAD_LENS_DATA__=${json};</script>`;
      return html.replace("</head>", `${script}\n</head>`);
    },
  };
}

// ── Plugin: inline Google Fonts as base64 @font-face ──────────────────────────
function inlineGoogleFonts(): Plugin {
  const FONT_CSS_URL =
    "https://fonts.googleapis.com/css2?family=Anton&family=Geist:wght@100..900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap";

  return {
    name: "inline-google-fonts",
    async transformIndexHtml(html) {
      try {
        // Fetch the CSS (use woff2 user-agent to get woff2 format)
        const cssRes = await fetch(FONT_CSS_URL, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          },
        });
        if (!cssRes.ok) throw new Error(`Font CSS fetch failed: ${cssRes.status}`);
        let css = await cssRes.text();

        // Find all url() references and inline them as base64
        const urlPattern = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
        const urls = new Set<string>();
        for (const match of css.matchAll(urlPattern)) {
          urls.add(match[1]);
        }

        for (const fontUrl of urls) {
          const fontRes = await fetch(fontUrl);
          if (!fontRes.ok) continue;
          const buffer = await fontRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const mime = fontUrl.endsWith(".woff2")
            ? "font/woff2"
            : "font/woff";
          css = css.replaceAll(
            `url(${fontUrl})`,
            `url(data:${mime};base64,${base64})`,
          );
        }

        const style = `<style>${css}</style>`;
        return html.replace("</head>", `${style}\n</head>`);
      } catch (err) {
        console.warn("⚠  Failed to inline Google Fonts:", err);
        // Fallback: inject the original link tag
        const link = `<link href="${FONT_CSS_URL}" rel="stylesheet" />`;
        return html.replace("</head>", `${link}\n</head>`);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    injectCountryData(),
    inlineGoogleFonts(),
    viteSingleFile(),
  ],
  build: {
    outDir: "dist-standalone",
    emptyOutDir: true,
    // Inline all assets up to 100MB to ensure everything is in one file
    assetsInlineLimit: 100_000_000,
    rollupOptions: {
      input: resolve(__dirname, "index.standalone.html"),
    },
  },
  root: __dirname,
  publicDir: "public",
});
