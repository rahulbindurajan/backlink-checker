/**
 * pages/tools/backlink-checker.tsx
 *
 * The Backlink Checker SEO tool.
 *
 * Layout:
 *   ┌──────────────────────────────────────┬──────────────────┐
 *   │  Search form + results               │  Search history  │
 *   │  ┌────────────────────────────────┐  │  (last 20 searches)│
 *   │  │  Stats cards row               │  │                  │
 *   │  └────────────────────────────────┘  │                  │
 *   │  ┌────────────────────────────────┐  │                  │
 *   │  │  Backlinks table               │  │                  │
 *   │  └────────────────────────────────┘  │                  │
 *   └──────────────────────────────────────┴──────────────────┘
 *
 * Data flow:
 *   1. On load, Laravel passes `domain`, `summary`, `backlinks`, `history`, `error` as props.
 *   2. Submitting the form does a POST to /tools/backlink-checker/analyze (Inertia).
 *   3. The controller saves history, stores results in session, and redirects back here.
 *   4. The new props arrive automatically — no manual fetch needed.
 */

import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    Clock,
    ExternalLink,
    FlaskConical,
    Globe,
    Link2,
    Search,
    Server,
    Shield,
    Trash2,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { BacklinkTypes } from '@/types/tools';

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
// Shows "Dashboard > Backlink Checker" in the top navigation bar.

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Backlink Checker', href: '/tools/backlink-checker' },
];

// ─── Main page component ─────────────────────────────────────────────────────

export default function BacklinkChecker({
    domain,
    summary,
    backlinks,
    history,
    error,
    sandboxMode,
}: BacklinkTypes.PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Backlink Checker" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">

                {/* Page title */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Backlink Checker</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Analyse the full backlink profile of any domain using the DataForSEO API.
                    </p>
                </div>

                {/* Sandbox mode banner — only shown when DATAFORSEO_SANDBOX=true */}
                {sandboxMode && <SandboxBanner />}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

                    {/* ── Left: search + results (3/4 width on large screens) ── */}
                    <div className="space-y-6 lg:col-span-3">

                        {/* Search form */}
                        <SearchForm initialDomain={domain ?? ''} />

                        {/* Error alert */}
                        {error && <ErrorAlert message={error} />}

                        {/* Stats cards — only shown after a successful search */}
                        {summary && <StatsRow summary={summary} />}

                        {/* Backlinks table — only shown when there are results */}
                        {backlinks.length > 0 && (
                            <BacklinksTable
                                domain={domain!}
                                backlinks={backlinks}
                            />
                        )}

                        {/* Empty state — no search yet */}
                        {!summary && !error && <EmptyState />}
                    </div>

                    {/* ── Right: search history sidebar (1/4 width) ─────────── */}
                    <div className="lg:col-span-1">
                        <SearchHistoryPanel history={history} />
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

// ─── SearchForm ───────────────────────────────────────────────────────────────

/**
 * Domain input form.
 * Uses Inertia's `useForm` hook which:
 *   - tracks field values in `data`
 *   - tracks server-side validation errors in `errors`
 *   - sets `processing = true` while the request is in flight
 */
function SearchForm({ initialDomain }: { initialDomain: string }) {
    const { data, setData, post, processing, errors } = useForm({
        domain: initialDomain,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // POST to the named route — Laravel will validate, call the API, and redirect back
        post('/tools/backlink-checker/analyze');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Analyse a Domain
                </CardTitle>
                <CardDescription>
                    Enter any domain name (e.g. <code className="font-mono text-xs">example.com</code>).
                    Do not include <code className="font-mono text-xs">https://</code> or trailing slashes.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">

                    <div className="flex-1 space-y-1">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                            id="domain"
                            type="text"
                            placeholder="example.com"
                            value={data.domain}
                            onChange={(e) => setData('domain', e.target.value)}
                            disabled={processing}
                            className={errors.domain ? 'border-destructive' : ''}
                            autoComplete="off"
                            autoFocus
                        />
                        {/* Validation error from Laravel */}
                        {errors.domain && (
                            <p className="text-destructive text-xs">{errors.domain}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={processing} className="min-w-[140px]">
                        {processing ? (
                            <>
                                {/* Simple spinner using Tailwind animate-spin */}
                                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Analysing…
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Analyse
                            </>
                        )}
                    </Button>

                </form>
            </CardContent>
        </Card>
    );
}

// ─── StatsRow ─────────────────────────────────────────────────────────────────

/**
 * A row of four metric cards shown after a successful search.
 * Each card displays one key number with an icon and label.
 */
function StatsRow({ summary }: { summary: BacklinkTypes.Summary }) {
    const stats = [
        {
            label: 'Total Backlinks',
            value: summary.total_count.toLocaleString(),
            icon: Link2,
            description: 'All inbound links found',
        },
        {
            label: 'Referring Domains',
            value: summary.referring_domains.toLocaleString(),
            icon: Globe,
            description: 'Unique domains linking in',
        },
        {
            label: 'Referring IPs',
            value: summary.referring_ips.toLocaleString(),
            icon: Server,
            description: 'Unique IP addresses',
        },
        {
            label: 'Domain Rank',
            value: summary.rank.toString(),
            icon: ArrowUpRight,
            description: 'DataForSEO rank (0–100)',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, description }) => (
                <Card key={label}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {label}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ─── BacklinksTable ───────────────────────────────────────────────────────────

/**
 * Table showing individual backlinks.
 * Columns: Source URL | Anchor Text | DR | Follow | First Seen
 */
function BacklinksTable({
    domain,
    backlinks,
}: {
    domain: string;
    backlinks: BacklinkTypes.BacklinkItem[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Backlinks for <span className="font-mono text-sm">{domain}</span>
                </CardTitle>
                <CardDescription>
                    Showing {backlinks.length} backlink{backlinks.length !== 1 ? 's' : ''}.
                    Results are limited to 100 per search.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50 text-left">
                                <th className="px-4 py-3 font-medium">Source URL</th>
                                <th className="px-4 py-3 font-medium">Anchor Text</th>
                                <th className="px-4 py-3 font-medium text-center">DR</th>
                                <th className="px-4 py-3 font-medium text-center">Type</th>
                                <th className="px-4 py-3 font-medium">First Seen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backlinks.map((link, index) => (
                                <BacklinkRow key={index} link={link} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * A single row in the backlinks table.
 */
function BacklinkRow({ link }: { link: BacklinkTypes.BacklinkItem }) {
    // Format the date string from "2024-01-15 00:00:00 +00:00" → "Jan 15, 2024"
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">

            {/* Source URL — truncated with external link icon */}
            <td className="px-4 py-3 max-w-[300px]">
                <a
                    href={link.url_from}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline truncate"
                    title={link.url_from}
                >
                    <span className="truncate">{link.url_from}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                <span className="text-xs text-muted-foreground">{link.domain_from}</span>
            </td>

            {/* Anchor text */}
            <td className="px-4 py-3 max-w-[200px]">
                <span className="truncate block font-mono text-xs" title={link.anchor}>
                    {link.anchor || <span className="text-muted-foreground italic">no anchor</span>}
                </span>
            </td>

            {/* Domain Rank — colour-coded */}
            <td className="px-4 py-3 text-center">
                <DomainRankBadge rank={link.rank} />
            </td>

            {/* Follow type badge */}
            <td className="px-4 py-3 text-center">
                {link.dofollow ? (
                    <Badge variant="default" className="text-xs">dofollow</Badge>
                ) : (
                    <Badge variant="secondary" className="text-xs">nofollow</Badge>
                )}
            </td>

            {/* First seen date */}
            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {formatDate(link.first_seen)}
            </td>
        </tr>
    );
}

/**
 * Displays a domain rank number with a colour indicating quality:
 *   Green  (70+)  → high authority
 *   Yellow (40–69) → medium authority
 *   Red    (<40)  → low authority
 */
function DomainRankBadge({ rank }: { rank: number }) {
    const colour =
        rank >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
        rank >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                     'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

    return (
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${colour}`}>
            {rank}
        </span>
    );
}

// ─── SearchHistoryPanel ───────────────────────────────────────────────────────

/**
 * Sidebar panel showing the user's last 20 searches.
 * Each entry is clickable — clicking it re-runs the search for that domain.
 * The trash icon deletes the entry from the database.
 */
function SearchHistoryPanel({ history }: { history: BacklinkTypes.HistoryEntry[] }) {
    /**
     * Re-run a search by submitting the form programmatically via Inertia router.
     * This triggers the same POST → redirect → GET flow as the form.
     */
    function reRunSearch(domain: string) {
        router.post('/tools/backlink-checker/analyze', { domain });
    }

    /**
     * Delete a history entry.
     * Inertia's `router.delete()` sends a DELETE request; the controller
     * returns a redirect back to this page, which refreshes the history list.
     */
    function deleteEntry(id: number) {
        router.delete(`/tools/backlink-checker/history/${id}`, {
            // Ask for confirmation before deleting
            onBefore: () => window.confirm('Remove this entry from your history?'),
        });
    }

    return (
        <Card className="h-fit sticky top-4">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Search History
                </CardTitle>
                <CardDescription className="text-xs">
                    Your last {history.length} searches. Click to re-run.
                </CardDescription>
            </CardHeader>

            <CardContent className="px-3 pb-3">
                {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                        No searches yet. Enter a domain above to get started.
                    </p>
                ) : (
                    <ul className="space-y-1">
                        {history.map((entry) => (
                            <HistoryItem
                                key={entry.id}
                                entry={entry}
                                onReRun={() => reRunSearch(entry.domain)}
                                onDelete={() => deleteEntry(entry.id)}
                            />
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * One item in the history list.
 */
function HistoryItem({
    entry,
    onReRun,
    onDelete,
}: {
    entry: BacklinkTypes.HistoryEntry;
    onReRun: () => void;
    onDelete: () => void;
}) {
    return (
        <li className="group flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/50 transition-colors">

            {/* Clickable domain — triggers a re-search */}
            <button
                onClick={onReRun}
                className="flex-1 text-left min-w-0"
                title={`Re-run analysis for ${entry.domain}`}
            >
                <p className="truncate text-sm font-medium">{entry.domain}</p>

                {/* Show snapshot metrics if available */}
                {entry.result_summary && (
                    <p className="text-xs text-muted-foreground">
                        {entry.result_summary.total_count.toLocaleString()} links ·{' '}
                        {entry.result_summary.referring_domains.toLocaleString()} domains ·{' '}
                        DR {entry.result_summary.rank}
                    </p>
                )}
            </button>

            {/* Delete button — only visible on hover */}
            <button
                onClick={onDelete}
                className="ml-2 shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                title="Remove from history"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </li>
    );
}

// ─── SandboxBanner ───────────────────────────────────────────────────────────

/**
 * Shown at the top of the page when DATAFORSEO_SANDBOX=true in .env.
 * Reminds the user that the data is fake and no API credits are being used.
 * To disable: set DATAFORSEO_SANDBOX=false in your .env file.
 */
function SandboxBanner() {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
            <FlaskConical className="h-5 w-5 shrink-0" />
            <div>
                <span className="font-semibold">Sandbox Mode is ON</span>
                <span className="ml-2 text-sm">
                    Results are randomly generated fake data — no real API calls are made and no credits are used.
                    To use real data, set{' '}
                    <code className="rounded bg-yellow-200 px-1 font-mono text-xs dark:bg-yellow-800">
                        DATAFORSEO_SANDBOX=false
                    </code>{' '}
                    in your <code className="rounded bg-yellow-200 px-1 font-mono text-xs dark:bg-yellow-800">.env</code> file.
                </span>
            </div>
        </div>
    );
}

// ─── ErrorAlert ───────────────────────────────────────────────────────────────

function ErrorAlert({ message }: { message: string }) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

/**
 * Shown on the first visit before any search has been made.
 */
function EmptyState() {
    return (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
            <Shield className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">No analysis yet</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm">
                Enter a domain above and click <strong>Analyse</strong> to see its full
                backlink profile powered by the DataForSEO API.
            </p>
        </Card>
    );
}
