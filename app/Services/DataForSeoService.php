<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * DataForSeoService
 *
 * A thin wrapper around the DataForSEO REST API.
 * All API calls are centralised here so that:
 *   - controllers stay small and focused on HTTP/Inertia concerns
 *   - you can add caching, retry logic, or mocking in one place
 *   - future SEO tools (keyword research, SERP, etc.) add new methods here
 *
 * Authentication: HTTP Basic Auth using credentials from .env
 *   DATAFORSEO_LOGIN    = your DataForSEO account email
 *   DATAFORSEO_PASSWORD = your DataForSEO API password
 *   DATAFORSEO_SANDBOX  = true → returns fake data, no API calls made
 *
 * API docs: https://docs.dataforseo.com/v3/
 */
class DataForSeoService
{
    /** Base URL for every DataForSEO v3 endpoint */
    private const BASE_URL = 'https://api.dataforseo.com/v3';

    /** DataForSEO account email (set in .env as DATAFORSEO_LOGIN) */
    private string $login;

    /** DataForSEO API password (set in .env as DATAFORSEO_PASSWORD) */
    private string $password;

    /**
     * When true, all methods return realistic fake data.
     * No HTTP requests are made — useful for UI development and testing.
     * Controlled by DATAFORSEO_SANDBOX=true in .env
     */
    private bool $sandboxMode;

    public function __construct()
    {
        // ── Sandbox mode ───────────────────────────────────────────────────
        // Priority: DB setting → .env value → false (default off)
        $sandboxDb         = AppSetting::getValue('dataforseo_sandbox');
        $this->sandboxMode = $sandboxDb !== null
            ? filter_var($sandboxDb, FILTER_VALIDATE_BOOLEAN)
            : (bool) config('services.dataforseo.sandbox', false);

        if ($this->sandboxMode) {
            // Sandbox needs no real credentials
            $this->login    = 'sandbox';
            $this->password = 'sandbox';
            return;
        }

        // ── Live mode credentials ──────────────────────────────────────────
        // Priority: DB setting → .env value → throw if still missing

        $this->login = AppSetting::getValue('dataforseo_login')
            ?? config('services.dataforseo.login')
            ?? throw new RuntimeException(
                'DataForSEO login is not configured. Go to Settings → API Settings to add your credentials.'
            );

        $this->password = AppSetting::getValue('dataforseo_password')
            ?? config('services.dataforseo.password')
            ?? throw new RuntimeException(
                'DataForSEO password is not configured. Go to Settings → API Settings to add your credentials.'
            );
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    /**
     * Check whether sandbox mode is active.
     * The controller reads this to pass a flag to the frontend.
     */
    public function isSandbox(): bool
    {
        return $this->sandboxMode;
    }

    /**
     * Fetch high-level backlink metrics for a domain.
     *
     * Returns an array like:
     * [
     *   'total_count'         => 12345,
     *   'referring_domains'   => 678,
     *   'referring_ips'       => 450,
     *   'rank'                => 72,
     *   'backlinks_spam_score'=> 5,
     * ]
     *
     * @param  string $domain  e.g. "example.com"
     * @return array<string, mixed>
     */
    public function getBacklinkSummary(string $domain): array
    {
        if ($this->sandboxMode) {
            return $this->mockSummary($domain);
        }

        $response = $this->post('/backlinks/summary/live', [
            ['target' => $domain],
        ]);

        // DataForSEO wraps results in tasks[0].result[0]
        return $response['tasks'][0]['result'][0] ?? [];
    }

    /**
     * Fetch a paginated list of individual backlinks for a domain.
     *
     * @param  string $domain  e.g. "example.com"
     * @param  int    $limit   max backlinks to return (default 100, max 1000)
     * @param  int    $offset  pagination offset (default 0)
     * @return array<int, array<string, mixed>>
     */
    public function getBacklinks(string $domain, int $limit = 100, int $offset = 0): array
    {
        if ($this->sandboxMode) {
            return $this->mockBacklinks($domain, $limit);
        }

        $response = $this->post('/backlinks/backlinks/live', [
            [
                'target' => $domain,
                'limit'  => $limit,
                'offset' => $offset,
                'mode'   => 'as_is',
            ],
        ]);

        return $response['tasks'][0]['result'][0]['items'] ?? [];
    }

    // ─── Future SEO tool methods go here ─────────────────────────────────────
    //
    // public function getKeywordData(string $keyword): array { ... }
    // public function getSerpResults(string $keyword): array { ... }
    // public function getDomainRank(string $domain): array   { ... }

    // ─── Sandbox mock data ────────────────────────────────────────────────────

    /**
     * Returns a realistic fake summary for any domain.
     * The numbers are randomised slightly so each search looks different.
     */
    private function mockSummary(string $domain): array
    {
        // Use the domain name as a seed so the same domain always shows
        // the same numbers within a session (makes testing more predictable)
        $seed = crc32($domain);
        mt_srand($seed);

        return [
            'target'              => $domain,
            'total_count'         => mt_rand(1000, 50000),
            'referring_domains'   => mt_rand(50, 2000),
            'referring_ips'       => mt_rand(40, 1800),
            'rank'                => mt_rand(20, 90),
            'backlinks_spam_score'=> mt_rand(0, 15),
            'referring_links_types' => [
                'anchor' => mt_rand(500, 30000),
                'image'  => mt_rand(100, 5000),
                'meta'   => mt_rand(10, 500),
            ],
        ];
    }

    /**
     * Returns a list of realistic fake backlink items.
     * Uses well-known domains as sources to make the data look believable.
     */
    private function mockBacklinks(string $domain, int $limit): array
    {
        $sourceDomains = [
            'wikipedia.org', 'github.com', 'stackoverflow.com', 'reddit.com',
            'medium.com', 'dev.to', 'hackernews.com', 'producthunt.com',
            'techcrunch.com', 'wired.com', 'smashingmagazine.com', 'css-tricks.com',
            'digitalocean.com', 'netlify.com', 'vercel.com', 'cloudflare.com',
            'web.dev', 'moz.com', 'ahrefs.com', 'semrush.com',
        ];

        $anchors = [
            'click here', 'read more', 'visit site', 'learn more', 'source',
            'reference', $domain, 'official site', 'documentation', 'example',
            'check this out', 'great resource', 'full article', 'more info',
        ];

        $paths = [
            '/blog/seo-tips', '/resources', '/tools', '/article/123',
            '/news/tech', '/guide/beginners', '/review', '/top-10-tools',
            '/comparison', '/tutorial/advanced', '/', '/about', '/faq',
        ];

        $items = [];
        $count = min($limit, 20); // cap mock results at 20 rows

        // Seed by domain for consistency
        mt_srand(crc32($domain));

        for ($i = 0; $i < $count; $i++) {
            $source = $sourceDomains[$i % count($sourceDomains)];
            $path   = $paths[array_rand($paths)];

            $items[] = [
                'type'           => 'anchor',
                'domain_from'    => $source,
                'url_from'       => "https://{$source}{$path}",
                'domain_to'      => $domain,
                'url_to'         => "https://{$domain}",
                'anchor'         => $anchors[array_rand($anchors)],
                'rank'           => mt_rand(10, 90),
                'page_from_rank' => mt_rand(5, 85),
                'dofollow'       => (bool) mt_rand(0, 1),
                'first_seen'     => date('Y-m-d 00:00:00 +00:00', strtotime('-' . mt_rand(30, 730) . ' days')),
                'last_seen'      => date('Y-m-d 00:00:00 +00:00', strtotime('-' . mt_rand(0, 30) . ' days')),
            ];
        }

        return $items;
    }

    // ─── Shared HTTP helper ───────────────────────────────────────────────────

    /**
     * POST to a DataForSEO endpoint with Basic Auth.
     *
     * @param  string  $endpoint  e.g. "/backlinks/summary/live"
     * @param  array   $payload   Array of task objects to send
     * @return array              Decoded JSON response
     *
     * @throws \RuntimeException  on HTTP error or non-20000 API status
     */
    private function post(string $endpoint, array $payload): array
    {
        try {
            $response = Http::withBasicAuth($this->login, $this->password)
                ->timeout(30)
                ->acceptJson()
                ->post(self::BASE_URL . $endpoint, $payload);
        } catch (ConnectionException $e) {
            throw new RuntimeException('Could not reach DataForSEO API: ' . $e->getMessage());
        }

        if ($response->failed()) {
            throw new RuntimeException(
                'DataForSEO API HTTP error: ' . $response->status()
            );
        }

        $body = $response->json();

        // Top-level status 20000 means success; anything else is an error
        if (($body['status_code'] ?? 0) !== 20000) {
            throw new RuntimeException(
                'DataForSEO API error: ' . ($body['status_message'] ?? 'Unknown error')
            );
        }

        return $body;
    }
}
