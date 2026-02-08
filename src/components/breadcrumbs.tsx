import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  // Generate JSON-LD BreadcrumbList schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `https://foragents.dev${item.href}` }),
    })),
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={`flex items-center gap-2 ${className}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <div key={index} className="flex items-center gap-2">
              {!isFirst && (
                <span className="text-muted-foreground" aria-hidden="true">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span className={`text-sm ${isFirst ? "text-lg font-bold aurora-text" : "text-foreground"}`}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`${
                    isFirst
                      ? "text-lg font-bold aurora-text hover:opacity-80 transition-opacity"
                      : "text-sm text-muted-foreground hover:text-foreground transition-colors"
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
