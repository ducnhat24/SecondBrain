"use client"

import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("max-w-none text-base leading-relaxed text-card-foreground/90", className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-7 mb-3 text-2xl font-semibold tracking-tight text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2.5 text-xl font-semibold text-foreground first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-5 mb-2 text-lg font-medium text-foreground first:mt-0">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="mt-4 mb-1.5 text-base font-medium text-foreground first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="mt-4 mb-1.5 text-sm font-medium uppercase tracking-wide text-muted-foreground first:mt-0">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-base leading-relaxed last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc space-y-1.5 text-base leading-relaxed [&>li]:pl-1.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal space-y-1.5 text-base leading-relaxed [&>li]:pl-1.5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-border pl-4 italic text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlock = codeClassName?.includes("language-")
            if (isBlock) {
              return (
                <code className={cn("text-sm font-mono", codeClassName)} {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className="rounded-md bg-secondary px-1.5 py-0.5 text-sm font-mono text-foreground">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-lg border border-border bg-secondary p-4 text-sm leading-relaxed">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-6 border-border" />,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border bg-secondary/50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border last:border-0">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-sm text-card-foreground/85">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
