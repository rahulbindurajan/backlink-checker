<?php

namespace App\Http\Controllers\Tools;

use App\Http\Controllers\Controller;
use App\Models\SearchHistory;
use App\Services\DataForSeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * BacklinkController
 *
 * Handles the Backlink Checker SEO tool.
 *
 * Routes (defined in routes/tools.php):
 *   GET  /tools/backlink-checker           → index()   – show the tool page
 *   POST /tools/backlink-checker/analyze   → analyze() – run a new search
 *   DELETE /tools/backlink-checker/history/{id} → destroyHistory() – delete one entry
 *
 * How it works with Inertia.js:
 *   1. User visits the page → index() renders the React component with empty results.
 *   2. User submits a domain → browser POSTs to analyze().
 *   3. analyze() calls DataForSeoService, saves the result to search_histories,
 *      stores the full result in the session, then redirects back to index().
 *   4. index() picks up the session data and passes it to the React page as props.
 *
 * This is the standard "Post/Redirect/Get" pattern, which works perfectly with
 * Inertia and prevents duplicate submissions on page refresh.
 */
class BacklinkController extends Controller
{
    public function __construct(
        private DataForSeoService $seoService
    ) {}

    // ─── index ────────────────────────────────────────────────────────────────

    /**
     * Show the Backlink Checker page.
     *
     * Props passed to the React component:
     *   - summary   : key metrics (total_count, referring_domains, rank, …)  or null
     *   - backlinks : array of individual backlink objects                    or []
     *   - domain    : the searched domain string                              or null
     *   - history   : last 20 searches by this user (newest first)
     *   - error     : error message string if something went wrong            or null
     */
    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Retrieve the last 20 searches this user made, newest first.
        // The `result_summary` JSON column is auto-decoded to an array by the model cast.
        $history = SearchHistory::where('user_id', $user->id)
            ->latest()
            ->take(20)
            ->get(['id', 'domain', 'result_summary', 'created_at'])
            ->toArray();

        return Inertia::render('tools/backlink-checker', [
            // Passed from analyze() via the session after a successful search
            'domain'      => session('backlink_domain'),
            'summary'     => session('backlink_summary'),
            'backlinks'   => session('backlink_items', []),
            'error'       => session('backlink_error'),
            'history'     => $history,
            // Tells the frontend to show the sandbox warning banner
            'sandboxMode' => $this->seoService->isSandbox(),
        ]);
    }

    // ─── analyze ─────────────────────────────────────────────────────────────

    /**
     * Run a backlink analysis for the submitted domain.
     *
     * Validates input, calls the DataForSEO API, saves a history record,
     * stores results in the session, then redirects back to index().
     */
    public function analyze(Request $request): RedirectResponse
    {
        // Validate the domain field — must look like a real domain
        $validated = $request->validate([
            'domain' => [
                'required',
                'string',
                'max:253',
                // Basic domain format check (allows sub-domains, no http://)
                'regex:/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/',
            ],
        ], [
            'domain.regex' => 'Please enter a valid domain name (e.g. example.com) without http:// or trailing slashes.',
        ]);

        $domain = strtolower(trim($validated['domain']));

        try {
            // ── 1. Fetch data from DataForSEO ──────────────────────────────
            $summary   = $this->seoService->getBacklinkSummary($domain);
            $backlinks = $this->seoService->getBacklinks($domain, limit: 100);

            // ── 2. Build a lightweight snapshot for the history sidebar ────
            // We only store key numbers; the full list is too large for a DB column.
            $resultSummary = [
                'total_count'       => $summary['total_count']       ?? 0,
                'referring_domains' => $summary['referring_domains'] ?? 0,
                'rank'              => $summary['rank']              ?? 0,
            ];

            // ── 3. Persist to search_histories ────────────────────────────
            /** @var \App\Models\User $user */
            $user = $request->user();

            SearchHistory::create([
                'user_id'        => $user->id,
                'domain'         => $domain,
                'result_summary' => $resultSummary,
            ]);

            // ── 4. Flash results to the session and redirect ───────────────
            // Using session flash so a browser refresh won't re-submit the form.
            session()->flash('backlink_domain',  $domain);
            session()->flash('backlink_summary', $summary);
            session()->flash('backlink_items',   $backlinks);

        } catch (Throwable $e) {
            // Report the error as a flashed session message instead of crashing
            session()->flash('backlink_domain', $domain);
            session()->flash('backlink_error', $e->getMessage());
        }

        return redirect()->route('tools.backlink-checker');
    }

    // ─── destroyHistory ───────────────────────────────────────────────────────

    /**
     * Delete one search history entry.
     * Only the owner is allowed to delete their own entries.
     */
    public function destroyHistory(Request $request, SearchHistory $searchHistory): RedirectResponse
    {
        // Authorization: make sure the logged-in user owns this record
        if ($searchHistory->user_id !== $request->user()->id) {
            abort(403, 'You are not allowed to delete this record.');
        }

        $searchHistory->delete();

        return redirect()->route('tools.backlink-checker');
    }
}
