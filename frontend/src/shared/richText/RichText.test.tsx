import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MAX_RICH_TEXT_DEPTH, MAX_RICH_TEXT_LENGTH, parseRichText } from "./parseRichText";
import { RichText } from "./RichText";

const renderMarkup = (markup: string | null) =>
  render(<RichText markup={markup} className="target" />).container.querySelector(".target");

describe("RichText", () => {
  it("keeps allowed formatting", () => {
    const element = renderMarkup("<p>One <b>two</b> <em>three</em><br>four</p>");
    expect(element?.querySelector("p b")).toHaveTextContent("two");
    expect(element?.querySelector("em")).toHaveTextContent("three");
    expect(element?.querySelector("br")).toBeInTheDocument();
  });

  it.each([
    "<script>window.compromised=1</script>",
    "<img src=x onerror=window.compromised=1>",
    "<svg onload=window.compromised=1></svg>",
    "<iframe src='javascript:window.compromised=1'></iframe>",
    "<math><mtext><style><img src=x onerror=window.compromised=1></style></mtext></math>",
    "<template><img src=x onerror=window.compromised=1></template>",
    "<object data='javascript:window.compromised=1'></object>",
  ])("neutralizes %s", (payload) => {
    const element = renderMarkup(`<p>Safe</p>${payload}`);
    expect(element?.querySelector("script,img,svg,iframe,math,style,template,object")).toBeNull();
    expect(element).toHaveTextContent("Safe");
    expect((window as unknown as { compromised?: number }).compromised).toBeUndefined();
  });

  it("strips every attribute from allowed tags", () => {
    const element = renderMarkup(
      "<p onclick='x()' style='color:red' id='a' class='b'><b onmouseover='y()'>text</b></p>",
    );
    for (const node of element?.querySelectorAll("*") ?? []) {
      expect(node.attributes).toHaveLength(0);
    }
  });

  it("unwraps links and keeps their text", () => {
    const element = renderMarkup("<a href='javascript:alert(1)'>label</a>");
    expect(element?.querySelector("a")).toBeNull();
    expect(element).toHaveTextContent("label");
  });

  it("renders escaped markup as text", () => {
    render(<RichText markup={"&lt;img src=x onerror=alert(1)&gt;"} />);
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
  });

  it("handles empty input", () => {
    expect(parseRichText(null)).toEqual([]);
    expect(parseRichText("")).toEqual([]);
  });

  it("flattens markup nested beyond the depth limit", () => {
    const depth = MAX_RICH_TEXT_DEPTH + 10;
    const nodes = parseRichText(`${"<b>".repeat(depth)}deep${"</b>".repeat(depth)}`);
    let levels = 0;
    let current = nodes[0];
    while (current?.type === "element") {
      levels += 1;
      current = current.children[0];
    }
    expect(levels).toBe(MAX_RICH_TEXT_DEPTH);
    expect(current).toEqual({ type: "text", text: "deep" });
  });

  it("keeps dropped content hidden below the depth limit", () => {
    const depth = MAX_RICH_TEXT_DEPTH + 10;
    const element = renderMarkup(
      `${"<div>".repeat(depth)}visible<script>hiddenScript()</script><style>.hidden{}</style>${"</div>".repeat(depth)}`,
    );
    expect(element?.textContent).toBe("visible");
  });

  it("truncates oversized input", () => {
    const [node] = parseRichText("a".repeat(MAX_RICH_TEXT_LENGTH + 500));
    expect(node).toEqual({ type: "text", text: "a".repeat(MAX_RICH_TEXT_LENGTH) });
  });
});
