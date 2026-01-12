// src/components/blog/EditorRenderer.tsx
import DOMPurify from "dompurify";
import type { OutputData, OutputBlockData } from "@editorjs/editorjs";

interface EditorRendererProps {
  data: OutputData;
  className?: string;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "span",
      "code",
      "mark",
      "sub",
      "sup",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
};

/**
 * Renders Editor.js output data into React components
 * Follows best practices for security, performance, and maintainability
 */
export function EditorRenderer({ data, className = "" }: EditorRendererProps) {
  if (!data?.blocks || !Array.isArray(data.blocks)) {
    console.warn("EditorRenderer: Invalid data structure", data);
    return null;
  }

  return (
    <div className={`editor-content ${className}`.trim()}>
      {data.blocks.map((block, index) => (
        <BlockRenderer key={`${block.id || index}`} block={block} />
      ))}
    </div>
  );
}

/**
 * Renders individual Editor.js blocks
 */
function BlockRenderer({ block }: { block: OutputBlockData }) {
  try {
    switch (block.type) {
      case "header":
        return <HeaderBlock data={block.data} />;

      case "paragraph":
        return <ParagraphBlock data={block.data} />;

      case "list":
        return <ListBlock data={block.data} />;

      case "image":
        return <ImageBlock data={block.data} />;

      case "quote":
        return <QuoteBlock data={block.data} />;

      case "code":
        return <CodeBlock data={block.data} />;

      case "delimiter":
        return <DelimiterBlock />;

      case "table":
        return <TableBlock data={block.data} />;

      case "checklist":
        return <ChecklistBlock data={block.data} />;

      case "embed":
        return <EmbedBlock data={block.data} />;

      case "warning":
        return <WarningBlock data={block.data} />;

      case "raw":
        return <RawBlock data={block.data} />;

      default:
        console.warn(`Unknown block type: ${block.type}`, block);
        return null;
    }
  } catch (error) {
    console.error(`Error rendering block type: ${block.type}`, error);
    return null;
  }
}

// ============================================================================
// Block Components
// ============================================================================

function HeaderBlock({ data }: { data: any }) {
  const level = Math.max(1, Math.min(6, data.level || 2)); // Clamp between 1-6
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const sanitizedText = sanitizeHTML(data.text || "");

  if (!sanitizedText) return null;

  return <Tag dangerouslySetInnerHTML={{ __html: sanitizedText }} />;
}

function ParagraphBlock({ data }: { data: any }) {
  const sanitizedText = sanitizeHTML(data.text || "");

  if (!sanitizedText) return null;

  return <p dangerouslySetInnerHTML={{ __html: sanitizedText }} />;
}

function ListBlock({ data }: { data: any }) {
  const Tag = data.style === "ordered" ? "ol" : "ul";
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0) return null;

  return (
    <Tag>
      {items.map((item: string, index: number) => (
        <li
          key={index}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(item) }}
        />
      ))}
    </Tag>
  );
}

function ImageBlock({ data }: { data: any }) {
  const url = data.file?.url || data.url;

  if (!url) return null;

  return (
    <figure className="my-8">
      <img
        src={url}
        alt={data.caption || ""}
        className="w-full rounded-lg shadow-md"
        loading="lazy"
      />
      {data.caption && (
        <figcaption className="mt-2 text-center text-sm">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}

function QuoteBlock({ data }: { data: any }) {
  const sanitizedText = sanitizeHTML(data.text || "");

  if (!sanitizedText) return null;

  return (
    <blockquote>
      <p dangerouslySetInnerHTML={{ __html: sanitizedText }} />
      {data.caption && <cite className="text-sm">— {data.caption}</cite>}
    </blockquote>
  );
}

function CodeBlock({ data }: { data: any }) {
  const code = data.code || "";

  if (!code) return null;

  return (
    <pre>
      <code>{code}</code>
    </pre>
  );
}

function DelimiterBlock() {
  return <hr className="my-8 border-gray-300" />;
}

function TableBlock({ data }: { data: any }) {
  const content = Array.isArray(data.content) ? data.content : [];

  if (content.length === 0) return null;

  return (
    <div className="my-6 overflow-x-auto">
      <table>
        <tbody>
          {content.map((row: string[], rowIndex: number) => (
            <tr key={rowIndex}>
              {Array.isArray(row) &&
                row.map((cell: string, cellIndex: number) => (
                  <td
                    key={cellIndex}
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(cell) }}
                  />
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChecklistBlock({ data }: { data: any }) {
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0) return null;

  return (
    <ul className="list-none space-y-2">
      {items.map((item: any, index: number) => (
        <li key={index} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={!!item.checked}
            readOnly
            className="mt-1 cursor-default"
          />
          <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(item.text) }} />
        </li>
      ))}
    </ul>
  );
}

function EmbedBlock({ data }: { data: any }) {
  const embedUrl = data.embed || data.source;

  if (!embedUrl) return null;

  return (
    <div className="my-8">
      <iframe
        src={embedUrl}
        width={data.width || "100%"}
        height={data.height || 400}
        className="w-full rounded-lg"
        title={data.caption || "Embedded content"}
        allowFullScreen
        loading="lazy"
      />
      {data.caption && (
        <p className="mt-2 text-center text-sm">{data.caption}</p>
      )}
    </div>
  );
}

function WarningBlock({ data }: { data: any }) {
  const sanitizedMessage = sanitizeHTML(data.message || "");

  if (!sanitizedMessage) return null;

  return (
    <div className="my-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          {data.title && (
            <h3 className="text-sm font-medium text-yellow-800">
              {data.title}
            </h3>
          )}
          <div className="mt-2 text-sm text-yellow-700">
            <p dangerouslySetInnerHTML={{ __html: sanitizedMessage }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RawBlock({ data }: { data: any }) {
  // WARNING: Raw HTML blocks are dangerous
  // Only use if you trust the content source
  const html = data.html || "";

  if (!html) return null;

  // Still sanitize even raw HTML - allow more tags for raw blocks
  const sanitized = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe", "embed", "video", "audio", "source"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "src",
      "width",
      "height",
    ],
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
