import { cn } from "@/lib/utils";

/**
 * Renders the small markdown subset used by Moon News article bodies:
 * paragraphs, `## / ###` headings, `>` blockquotes, and `- ` / `1.` lists.
 * Swapping this for a full markdown/HTML renderer is a one-file change once
 * the backend supplies rich content.
 */
export function ArticleBody({ content, className }: { content: string; className?: string }) {
  const blocks = content.split(/\n{2,}/);
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const Tag = listBuffer.ordered ? "ol" : "ul";
    nodes.push(
      <Tag key={`l${key++}`}>
        {listBuffer.items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </Tag>
    );
    listBuffer = null;
  };

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    const listMatch = block.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[2]);
      const text = listMatch[3];
      if (listBuffer && listBuffer.ordered === ordered) listBuffer.items.push(text);
      else {
        flushList();
        listBuffer = { ordered, items: [text] };
      }
      continue;
    }
    flushList();

    if (block.startsWith("### ")) {
      nodes.push(<h3 key={`h${key++}`}>{inline(block.slice(4))}</h3>);
    } else if (block.startsWith("## ")) {
      nodes.push(<h2 key={`h${key++}`}>{inline(block.slice(3))}</h2>);
    } else if (block.startsWith("> ")) {
      nodes.push(<blockquote key={`q${key++}`}>{inline(block.slice(2))}</blockquote>);
    } else {
      nodes.push(<p key={`p${key++}`}>{inline(block.replace(/\n/g, " "))}</p>);
    }
  }
  flushList();

  return <div className={cn("prose-article", className)}>{nodes}</div>;
}

/** Handles inline **bold** markup. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default ArticleBody;
