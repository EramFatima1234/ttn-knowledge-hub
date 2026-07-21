"use client";

interface MarkdownBodyProps {
  content: string;
  className?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );
  html = html.replace(
    /@([\w.-]+)/g,
    '<span class="kh-markdown__mention">@$1</span>',
  );
  return html;
}

function renderMarkdown(content: string): string {
  const blocks: string[] = [];
  const parts = content.split(/```/);

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (i % 2 === 1) {
      const lines = part.split("\n");
      const language = lines[0]?.trim() ?? "";
      const code = lines.slice(language ? 1 : 0).join("\n");
      blocks.push(
        `<pre class="kh-markdown__code"><code data-lang="${escapeHtml(language)}">${escapeHtml(code.trim())}</code></pre>`,
      );
    } else {
      const paragraphs = part
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map(
          (p) =>
            `<p>${renderInline(p).replace(/\n/g, "<br />")}</p>`,
        );
      blocks.push(paragraphs.join(""));
    }
  }

  return blocks.join("");
}

export default function MarkdownBody({ content, className }: MarkdownBodyProps) {
  return (
    <div
      className={className ? `kh-markdown ${className}` : "kh-markdown"}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
