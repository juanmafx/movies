export type RichTextTag = "p" | "b" | "i" | "em" | "strong" | "br" | "ul" | "ol" | "li";

export type RichTextNode =
  | { type: "text"; text: string }
  | { type: "element"; tag: RichTextTag; children: RichTextNode[] };

export const MAX_RICH_TEXT_LENGTH = 20_000;
export const MAX_RICH_TEXT_DEPTH = 16;

const ALLOWED_TAGS = new Set<string>(["p", "b", "i", "em", "strong", "br", "ul", "ol", "li"]);
const DROPPED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "template",
  "noscript",
  "svg",
  "math",
  "head",
  "title",
  "textarea",
  "select",
]);

export function parseRichText(markup: string | null | undefined): RichTextNode[] {
  if (!markup) {
    return [];
  }
  const document = new DOMParser().parseFromString(
    markup.slice(0, MAX_RICH_TEXT_LENGTH),
    "text/html",
  );
  return convertChildren(document.body, 0);
}

function convertChildren(parent: Node, depth: number): RichTextNode[] {
  return Array.from(parent.childNodes).flatMap((child) => convertNode(child, depth));
}

function convertNode(node: Node, depth: number): RichTextNode[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ? [{ type: "text", text: node.textContent }] : [];
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const tag = (node as Element).localName;
  if (DROPPED_TAGS.has(tag)) {
    return [];
  }
  if (depth >= MAX_RICH_TEXT_DEPTH) {
    return node.textContent ? [{ type: "text", text: node.textContent }] : [];
  }

  const children = convertChildren(node, depth + 1);
  return ALLOWED_TAGS.has(tag)
    ? [{ type: "element", tag: tag as RichTextTag, children: tag === "br" ? [] : children }]
    : children;
}
