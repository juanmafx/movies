import { createElement, useMemo, type ReactNode } from "react";
import { parseRichText, type RichTextNode } from "./parseRichText";

type RichTextProps = {
  markup: string | null;
  className?: string;
};

export function RichText({ markup, className }: RichTextProps) {
  const nodes = useMemo(() => parseRichText(markup), [markup]);
  return <div className={className}>{nodes.map(renderNode)}</div>;
}

function renderNode(node: RichTextNode, index: number): ReactNode {
  if (node.type === "text") {
    return node.text;
  }
  return node.tag === "br"
    ? createElement("br", { key: index })
    : createElement(node.tag, { key: index }, node.children.map(renderNode));
}
