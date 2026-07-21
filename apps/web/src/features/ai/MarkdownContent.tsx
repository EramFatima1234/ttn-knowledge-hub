"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo } from "react";

function inlineFormat(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        nodes.push(
          <Link key={key++} href={linkMatch[2]}>
            {linkMatch[1]}
          </Link>,
        );
      }
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function MarkdownContent({ content }: { content: string }) {
  const blocks = useMemo(() => content.split(/\n{2,}/).filter(Boolean), [content]);

  return (
    <div className="kh-ai-markdown">
      {blocks.map((block, index) => {
        if (block.trim().startsWith("```")) {
          const code = block.replace(/^```[\w]*\n?/, "").replace(/```$/, "").trim();
          return (
            <pre key={index} className="kh-ai-markdown__code">
              <code>{code}</code>
            </pre>
          );
        }
        const lines = block.split("\n");
        if (lines.every((line) => line.trim().startsWith("- "))) {
          return (
            <ul key={index}>
              {lines.map((line, i) => (
                <li key={i}>{inlineFormat(line.replace(/^\s*-\s*/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{inlineFormat(block.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}
