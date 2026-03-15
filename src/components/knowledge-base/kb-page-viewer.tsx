"use client";

import { useMemo, useState } from "react";
import { List, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { KnowledgeBasePage, Profile } from "@/types/database";

// ─── Markdown to HTML (basique) ──────────────────────────────────
// Le contenu est edite exclusivement par le staff (admin/coach) via
// un textarea. Les balises HTML brutes sont echappees a l'entree
// (&lt; / &gt;) pour prevenir les injections XSS.

function parseMarkdown(md: string): string {
  let html = md;

  // Echapper les balises HTML en premier pour prevenir les injections
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (```)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_match, lang, code) =>
      `<pre class="kb-code-block"><code class="language-${lang}">${code.trim()}</code></pre>`,
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="kb-inline-code">$1</code>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="kb-h3" id="$1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="kb-h2" id="$1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="kb-h1" id="$1">$1</h1>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="kb-link" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Images ![alt](url)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="kb-image" />',
  );

  // Blockquotes
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="kb-quote">$1</blockquote>',
  );

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="kb-hr" />');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="kb-li">$1</li>');
  html = html.replace(
    /(<li class="kb-li">.*<\/li>\n?)+/g,
    (match) => `<ul class="kb-ul">${match}</ul>`,
  );

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="kb-oli">$1</li>');
  html = html.replace(
    /(<li class="kb-oli">.*<\/li>\n?)+/g,
    (match) => `<ol class="kb-ol">${match}</ol>`,
  );

  // Checkboxes
  html = html.replace(
    /\[x\]/g,
    '<input type="checkbox" checked disabled class="kb-checkbox" />',
  );
  html = html.replace(
    /\[ \]/g,
    '<input type="checkbox" disabled class="kb-checkbox" />',
  );

  // Paragraphs (lignes non-vides qui ne sont pas deja des elements)
  html = html.replace(/^(?!<[a-z]|<\/[a-z])(.+)$/gm, '<p class="kb-p">$1</p>');

  // Supprimer les paragraphes vides
  html = html.replace(/<p class="kb-p"><\/p>/g, "");

  return html;
}

// ─── Extraire les headings pour la TdM ──────────────────────────

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      headings.push({
        id: match[2],
        text: match[2],
        level: match[1].length,
      });
    }
  }

  return headings;
}

// ─── Table des matieres ──────────────────────────────────────────

function TableOfContents({ headings }: { headings: TocItem[] }) {
  const [collapsed, setCollapsed] = useState(false);

  if (headings.length === 0) return null;

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-full"
      >
        <List className="w-3.5 h-3.5" />
        Table des matieres
        {collapsed ? (
          <ChevronRight className="w-3 h-3 ml-auto" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-auto" />
        )}
      </button>

      {!collapsed && (
        <nav className="mt-3 space-y-1">
          {headings.map((heading, i) => (
            <a
              key={`${heading.id}-${i}`}
              href={`#${heading.id}`}
              className={cn(
                "block text-sm text-muted-foreground hover:text-foreground transition-colors",
                heading.level === 1 && "font-medium text-foreground",
                heading.level === 2 && "pl-4",
                heading.level === 3 && "pl-8 text-xs",
              )}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

// ─── CSS du contenu rendu ────────────────────────────────────────

const KB_CONTENT_STYLES = `
  .kb-content .kb-h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-foreground);
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    line-height: 1.2;
    scroll-margin-top: 80px;
  }
  .kb-content .kb-h2 {
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--color-foreground);
    margin-top: 1.75rem;
    margin-bottom: 0.5rem;
    line-height: 1.3;
    scroll-margin-top: 80px;
  }
  .kb-content .kb-h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-foreground);
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.4;
    scroll-margin-top: 80px;
  }
  .kb-content .kb-p {
    font-size: 0.875rem;
    color: var(--color-foreground);
    line-height: 1.75;
    margin-bottom: 0.5rem;
  }
  .kb-content strong {
    font-weight: 600;
  }
  .kb-content .kb-link {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .kb-content .kb-link:hover {
    opacity: 0.8;
  }
  .kb-content .kb-image {
    max-width: 100%;
    border-radius: 0.75rem;
    margin: 1rem 0;
  }
  .kb-content .kb-quote {
    border-left: 3px solid var(--color-primary);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    background: var(--color-muted);
    border-radius: 0 0.5rem 0.5rem 0;
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }
  .kb-content .kb-code-block {
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
    margin: 1rem 0;
    overflow-x: auto;
    font-size: 0.8rem;
    line-height: 1.6;
  }
  .kb-content .kb-code-block code {
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .kb-content .kb-inline-code {
    background: var(--color-muted);
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .kb-content .kb-ul, .kb-content .kb-ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }
  .kb-content .kb-ul {
    list-style-type: disc;
  }
  .kb-content .kb-ol {
    list-style-type: decimal;
  }
  .kb-content .kb-li, .kb-content .kb-oli {
    font-size: 0.875rem;
    line-height: 1.75;
    color: var(--color-foreground);
    margin-bottom: 0.25rem;
  }
  .kb-content .kb-hr {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 1.5rem 0;
  }
  .kb-content .kb-checkbox {
    margin-right: 0.5rem;
    vertical-align: middle;
  }
  .kb-content del {
    color: var(--color-muted-foreground);
  }
`;

// ─── Viewer principal ────────────────────────────────────────────

interface KBPageViewerProps {
  title: string;
  content: string;
  icon: string | null;
  category: string;
  updatedAt: string;
  creator?: Profile;
  onNavigate?: (pageId: string) => void;
  allPages?: KnowledgeBasePage[];
}

export function KBPageViewer({
  title,
  content,
  icon,
  category,
  updatedAt,
  creator,
}: KBPageViewerProps) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  // Contenu sanitize: les balises HTML brutes sont echappees dans parseMarkdown()
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        {icon && <div className="text-4xl mb-3">{icon}</div>}
        <h1 className="text-3xl font-bold text-foreground leading-tight mb-2">
          {title || "Sans titre"}
        </h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="capitalize px-2 py-0.5 rounded-md bg-muted font-medium">
            {category}
          </span>
          {creator && <span>Par {creator.full_name}</span>}
          <span>Mis a jour {formatDate(updatedAt, "relative")}</span>
        </div>
      </div>

      {/* Table of contents */}
      <TableOfContents headings={headings} />

      {/* Content — les balises HTML sont echappees dans parseMarkdown() */}
      {content.trim() ? (
        <div
          className="kb-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Cette page est vide.
        </p>
      )}

      <style>{KB_CONTENT_STYLES}</style>
    </div>
  );
}
