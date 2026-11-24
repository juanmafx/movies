import type { Plugin } from "vite";
import { IMAGE_ORIGIN } from "../src/shared/config/imageOrigin.ts";

export function buildContentSecurityPolicy(apiOrigin: string): string {
  return [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    `img-src 'self' ${IMAGE_ORIGIN}`,
    `connect-src ${apiOrigin}`,
    "base-uri 'none'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

export function contentSecurityPolicyPlugin(apiOrigin: string): Plugin {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: {
      order: "pre",
      handler: () => [
        {
          tag: "meta",
          attrs: {
            "http-equiv": "Content-Security-Policy",
            content: buildContentSecurityPolicy(apiOrigin),
          },
          injectTo: "head-prepend",
        },
      ],
    },
  };
}
