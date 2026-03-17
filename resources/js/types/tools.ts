/**
 * types/tools.ts
 *
 * Shared TypeScript types for all SEO tool pages.
 * Each tool section has its own namespace to keep things organised as the
 * number of tools grows.
 *
 * Usage in a page component:
 *   import type { BacklinkTypes } from '@/types/tools';
 */

// ─── Backlink Checker ─────────────────────────────────────────────────────────

export namespace BacklinkTypes {
    /**
     * High-level metrics returned by DataForSEO's /backlinks/summary/live endpoint.
     * All counts are integers. Rank is 0–100 (higher = more authoritative).
     */
    export interface Summary {
        target: string;
        total_count: number;
        referring_domains: number;
        referring_ips: number;
        rank: number;
        backlinks_spam_score: number;
        /** Breakdown: how many backlinks use images, text, etc. */
        referring_links_types?: Record<string, number>;
        /** Breakdown: dofollow vs nofollow counts */
        referring_links_attributes?: Record<string, number>;
    }

    /**
     * A single backlink item from /backlinks/backlinks/live.
     * Dates come as ISO-like strings: "2024-01-15 00:00:00 +00:00"
     */
    export interface BacklinkItem {
        type: string;
        domain_from: string;
        url_from: string;
        domain_to: string;
        url_to: string;
        anchor: string;
        /** DataForSEO domain rank of the linking domain (0–100) */
        rank: number;
        /** DataForSEO rank of the specific linking page (0–100) */
        page_from_rank: number;
        dofollow: boolean;
        first_seen: string;
        last_seen: string;
    }

    /**
     * One entry in the user's search history (from the search_histories DB table).
     * The result_summary only has a lightweight snapshot of key metrics.
     */
    export interface HistoryEntry {
        id: number;
        domain: string;
        result_summary: {
            total_count: number;
            referring_domains: number;
            rank: number;
        } | null;
        created_at: string;
    }

    /**
     * All props that Laravel's BacklinkController passes to the React page.
     * These are populated via Inertia's session flash after a successful search.
     */
    export interface PageProps {
        domain: string | null;
        summary: Summary | null;
        backlinks: BacklinkItem[];
        history: HistoryEntry[];
        /** Non-null only when the API call failed */
        error: string | null;
        /** True when DATAFORSEO_SANDBOX=true in .env — data is fake */
        sandboxMode: boolean;
    }
}

// ─── Future tools ─────────────────────────────────────────────────────────────
// export namespace KeywordTypes  { ... }
// export namespace SiteAuditTypes { ... }
// export namespace RankTrackerTypes { ... }
