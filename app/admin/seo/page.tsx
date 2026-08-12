import Link from "next/link";
import type { Route } from "next";

import { buildSeoReport } from "@/lib/admin/seo-report";
import { getSettings } from "@/lib/db/repositories";
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  TITLE_MAX,
  type SeoEntity,
  type SeoSubject,
} from "@/lib/seo/audit";
import { firstParam, matchesQuery, resultLabel } from "@/lib/admin/filters";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/admin/filter-bar";
import {
  Callout,
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  RowTitle,
  StatCard,
  StatGrid,
  Td,
  Th,
} from "@/components/admin/ui";

const entityLabels: Record<SeoEntity, string> = {
  tool: "Calculator",
  guide: "Guide",
  page: "Page",
  category: "Category",
};

/** Where to go to fix a finding. Every entity type has an edit screen. */
function editHref(entity: SeoEntity, slug: string): Route {
  const base = {
    tool: "/admin/tools",
    guide: "/admin/guides",
    page: "/admin/pages",
    category: "/admin/categories",
  }[entity];

  return `${base}/${slug}` as Route;
}

/** Character count with the limit it is being judged against. */
function LengthCell({ value, min, max }: { value: string; min: number; max: number }) {
  const length = value.trim().length;

  if (length === 0) return <Badge tone="critical">none</Badge>;

  return (
    <span
      className={
        length > max
          ? "tabular-nums text-critical"
          : length < min
            ? "tabular-nums text-caution"
            : "tabular-nums text-muted"
      }
    >
      {length}
    </span>
  );
}

export default async function AdminSeoPage({ searchParams }: PageProps<"/admin/seo">) {
  const params = await searchParams;
  const query = firstParam(params.q);
  const severity = firstParam(params.severity);
  const entity = firstParam(params.entity);

  const [report, settings] = await Promise.all([buildSeoReport(), getSettings()]);

  const issues = report.issues.filter((issue) => {
    if (severity && issue.severity !== severity) return false;
    if (entity && issue.entity !== entity) return false;
    return matchesQuery(query, issue.name, issue.slug, issue.problem);
  });

  const inventory = report.subjects
    .filter((subject) => (entity ? subject.entity === entity : true))
    .filter((subject) => matchesQuery(query, subject.name, subject.slug, subject.title))
    .sort(
      (a, b) => a.entity.localeCompare(b.entity) || a.name.localeCompare(b.name),
    ) as SeoSubject[];

  const defaultDescriptionLength = settings.defaultSeoDescription.trim().length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="SEO health"
        description="Every published URL, graded on the tags a search engine will actually receive — after each route's fallbacks are applied, not just the fields somebody filled in."
      />

      <StatGrid>
        <li>
          <StatCard
            label="Health score"
            value={`${report.summary.score}%`}
            tone={
              report.summary.critical > 0
                ? "critical"
                : report.summary.warning > 0
                  ? "caution"
                  : "positive"
            }
            hint={`${report.summary.clean} of ${report.summary.subjects} live URLs with no critical or warning finding`}
          />
        </li>
        <li>
          <StatCard
            label="Critical"
            value={report.summary.critical}
            tone={report.summary.critical > 0 ? "critical" : "neutral"}
            hint="A missing title or description. Fix these first."
          />
        </li>
        <li>
          <StatCard
            label="Warnings"
            value={report.summary.warning}
            tone={report.summary.warning > 0 ? "caution" : "neutral"}
            hint="Truncated in results, duplicated, or thin."
          />
        </li>
        <li>
          <StatCard
            label="Notices"
            value={report.summary.notice}
            hint="Worth a look, often deliberate."
          />
        </li>
      </StatGrid>

      <Panel
        title="Findings"
        description="Sorted by severity. Each one names the fix rather than the rule."
      >
        <FilterBar
          searchPlaceholder="Search findings…"
          resultLabel={resultLabel(issues.length, report.issues.length, "finding")}
          selects={[
            {
              name: "severity",
              label: "Severity",
              options: [
                { value: "critical", label: "Critical" },
                { value: "warning", label: "Warning" },
                { value: "notice", label: "Notice" },
              ],
            },
            {
              name: "entity",
              label: "Type",
              options: [
                { value: "tool", label: "Calculators" },
                { value: "guide", label: "Guides" },
                { value: "page", label: "Pages" },
                { value: "category", label: "Categories" },
              ],
            },
          ]}
        />

        {issues.length === 0 ? (
          <EmptyState
            title={report.issues.length === 0 ? "Nothing to fix" : "No findings match"}
            description={
              report.issues.length === 0
                ? "Every published URL has a title and a description inside the limits search results display."
                : "Nothing matches these filters. Clear them to see the whole report."
            }
          />
        ) : (
          <DataTable
            head={
              <>
                <Th>Severity</Th>
                <Th>Where</Th>
                <Th>Finding</Th>
                <Th align="right">Fix</Th>
              </>
            }
            minWidth="56rem"
          >
            {issues.map((issue) => (
              <tr key={issue.id}>
                <Td>
                  <Badge
                    tone={
                      issue.severity === "critical"
                        ? "critical"
                        : issue.severity === "warning"
                          ? "caution"
                          : "neutral"
                    }
                  >
                    {issue.severity}
                  </Badge>
                </Td>
                <Td>
                  <RowTitle
                    title={issue.name}
                    path={`${entityLabels[issue.entity]} · ${issue.slug}`}
                    href={editHref(issue.entity, issue.slug)}
                  />
                </Td>
                <Td>
                  <p className="text-ink">{issue.problem}</p>
                  <p className="mt-0.5 text-muted">{issue.fix}</p>
                </Td>
                <Td align="right">
                  <Link
                    href={editHref(issue.entity, issue.slug)}
                    className="text-sm font-medium text-brand hover:text-brand-hover"
                  >
                    Edit
                  </Link>
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <Panel
        title="URL inventory"
        description={`Title and description lengths as they will be served. Titles are judged against ${TITLE_MAX} characters, descriptions against ${DESCRIPTION_MIN}–${DESCRIPTION_MAX}.`}
      >
        <DataTable
          head={
            <>
              <Th>URL</Th>
              <Th>Type</Th>
              <Th align="right">Title</Th>
              <Th align="right">Description</Th>
              <Th>State</Th>
            </>
          }
          minWidth="48rem"
        >
          {inventory.map((subject) => (
            <tr key={`${subject.entity}:${subject.slug}`}>
              <Td>
                <RowTitle
                  title={subject.name}
                  path={subject.publicPath ?? "not published"}
                  href={editHref(subject.entity, subject.slug)}
                />
              </Td>
              <Td className="text-muted">{entityLabels[subject.entity]}</Td>
              <Td align="right">
                <LengthCell value={subject.title} min={1} max={TITLE_MAX} />
              </Td>
              <Td align="right">
                <LengthCell
                  value={subject.description}
                  min={DESCRIPTION_MIN}
                  max={DESCRIPTION_MAX}
                />
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  {subject.published ? (
                    <Badge tone="positive">Live</Badge>
                  ) : (
                    <Badge tone="neutral">Not published</Badge>
                  )}
                  {!subject.indexable ? <Badge tone="caution">noindex</Badge> : null}
                  {subject.words !== undefined ? (
                    <span className="text-xs tabular-nums text-muted">{subject.words}w</span>
                  ) : null}
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Site defaults" description="Used where a page has not set its own.">
          <div className="divide-y divide-rule text-sm">
            <div className="px-5 py-3">
              <p className="text-muted">Default SEO title</p>
              <p className="mt-1 text-ink">{settings.defaultSeoTitle}</p>
            </div>
            <div className="px-5 py-3">
              <p className="text-muted">
                Default meta description{" "}
                <span
                  className={
                    defaultDescriptionLength > DESCRIPTION_MAX
                      ? "tabular-nums text-critical"
                      : "tabular-nums text-muted"
                  }
                >
                  ({defaultDescriptionLength} characters)
                </span>
              </p>
              <p className="mt-1 text-ink">{settings.defaultSeoDescription}</p>
            </div>
          </div>
          <div className="border-t border-rule px-5 py-3">
            <Link
              href="/admin/settings"
              className="text-sm font-medium text-brand hover:text-brand-hover"
            >
              Edit in settings
            </Link>
          </div>
        </Panel>

        <Panel title="Crawling" description="What robots and the sitemap currently say.">
          <ul className="divide-y divide-rule text-sm">
            <li className="flex items-baseline justify-between gap-4 px-5 py-3">
              <span className="text-muted">Sitemap</span>
              <a
                href="/sitemap.xml"
                className="font-mono text-brand hover:text-brand-hover"
                target="_blank"
                rel="noreferrer"
              >
                /sitemap.xml
              </a>
            </li>
            <li className="flex items-baseline justify-between gap-4 px-5 py-3">
              <span className="text-muted">Robots</span>
              <a
                href="/robots.txt"
                className="font-mono text-brand hover:text-brand-hover"
                target="_blank"
                rel="noreferrer"
              >
                /robots.txt
              </a>
            </li>
            <li className="flex items-baseline justify-between gap-4 px-5 py-3">
              <span className="text-muted">URLs in the sitemap</span>
              <span className="tabular-nums text-ink">
                {report.subjects.filter((s) => s.published && s.indexable).length + 5}
              </span>
            </li>
          </ul>
        </Panel>
      </div>

      <Callout title="What this audit does not do">
        It grades what this site controls: titles, descriptions, indexing decisions and body
        length. It cannot tell you about backlinks, crawl errors or how any of these pages
        actually rank — that needs Search Console, which reads from the live site rather than
        from the store. A 100% score here means the tags are well-formed, not that the
        content is worth reading.
      </Callout>
    </div>
  );
}
