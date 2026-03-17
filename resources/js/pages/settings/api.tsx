/**
 * pages/settings/api.tsx
 *
 * API Settings page — lets the user configure DataForSEO credentials
 * and toggle sandbox mode, all from the browser.
 *
 * Accessible at: /settings/api
 * Appears in: Settings sidebar as "API Settings"
 *
 * How it works:
 *   1. The controller reads current values from the DB (or .env fallback)
 *      and passes them as props.
 *   2. The user edits the form and clicks Save.
 *   3. Inertia POSTs to /settings/api → controller saves to app_settings table.
 *   4. The page reloads with the saved values and a success message.
 *
 * Security note:
 *   - The actual password is NEVER sent to the frontend.
 *   - `hasPassword` (boolean) tells us whether one is already saved.
 *   - Leaving the password field blank on save keeps the existing password.
 */

import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, FlaskConical, Key, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'API Settings', href: '/settings/api' },
];

// ─── Props from the controller ────────────────────────────────────────────────

interface Props {
    dataforseoLogin: string;
    dataforseoSandbox: boolean;
    hasPassword: boolean;    // true if a password is already stored in DB
    status?: string;         // "api-settings-saved" after a successful save
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function ApiSettings({
    dataforseoLogin,
    dataforseoSandbox,
    hasPassword,
    status,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="API Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="API Settings"
                        description="Configure your DataForSEO API credentials and sandbox mode."
                    />

                    <ApiSettingsForm
                        dataforseoLogin={dataforseoLogin}
                        dataforseoSandbox={dataforseoSandbox}
                        hasPassword={hasPassword}
                        status={status}
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

// ─── Form component ───────────────────────────────────────────────────────────

function ApiSettingsForm({ dataforseoLogin, dataforseoSandbox, hasPassword, status }: Props) {
    // Show/hide the password characters
    const [showPassword, setShowPassword] = useState(false);

    /**
     * useForm tracks:
     *   data        → current field values
     *   setData     → update a field
     *   post        → submit the form via Inertia POST
     *   processing  → true while request is in-flight
     *   errors      → validation errors returned by Laravel
     *   recentlySuccessful → true for ~2 seconds after a successful save
     */
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        dataforseo_login:    dataforseoLogin,
        dataforseo_password: '',            // blank = keep existing password
        dataforseo_sandbox:  dataforseoSandbox,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/settings/api', { preserveScroll: true });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── DataForSEO Credentials section ───────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">DataForSEO Credentials</h3>
                </div>

                <p className="text-xs text-muted-foreground">
                    Find your API credentials in your{' '}
                    <a
                        href="https://app.dataforseo.com/api-dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                    >
                        DataForSEO dashboard
                    </a>
                    . These are stored encrypted in the database.
                </p>

                {/* Login (email) */}
                <div className="space-y-1">
                    <Label htmlFor="dataforseo_login">API Login (Email)</Label>
                    <Input
                        id="dataforseo_login"
                        type="email"
                        placeholder="your@email.com"
                        value={data.dataforseo_login}
                        onChange={(e) => setData('dataforseo_login', e.target.value)}
                        disabled={processing}
                        autoComplete="off"
                        className={errors.dataforseo_login ? 'border-destructive' : ''}
                    />
                    <InputError message={errors.dataforseo_login} />
                </div>

                {/* Password */}
                <div className="space-y-1">
                    <Label htmlFor="dataforseo_password">
                        API Password
                        {hasPassword && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                (leave blank to keep existing password)
                            </span>
                        )}
                    </Label>

                    {/* Password input with show/hide toggle */}
                    <div className="relative">
                        <Input
                            id="dataforseo_password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={hasPassword ? '••••••••' : 'Enter your API password'}
                            value={data.dataforseo_password}
                            onChange={(e) => setData('dataforseo_password', e.target.value)}
                            disabled={processing}
                            autoComplete="new-password"
                            className={errors.dataforseo_password ? 'border-destructive pr-10' : 'pr-10'}
                        />
                        {/* Eye icon toggles password visibility */}
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword
                                ? <EyeOff className="h-4 w-4" />
                                : <Eye className="h-4 w-4" />
                            }
                        </button>
                    </div>
                    <InputError message={errors.dataforseo_password} />
                </div>
            </section>

            {/* ── Sandbox Mode section ──────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Sandbox Mode</h3>
                </div>

                {/* Toggle card */}
                <label
                    htmlFor="dataforseo_sandbox"
                    className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                        data.dataforseo_sandbox
                            ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950'
                            : 'border-border hover:bg-muted/40'
                    }`}
                >
                    {/* Custom toggle switch */}
                    <div className="relative mt-0.5 shrink-0">
                        <input
                            id="dataforseo_sandbox"
                            type="checkbox"
                            checked={data.dataforseo_sandbox}
                            onChange={(e) => setData('dataforseo_sandbox', e.target.checked)}
                            disabled={processing}
                            className="peer sr-only"
                        />
                        {/* Track */}
                        <div className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-yellow-400 dark:peer-checked:bg-yellow-600" />
                        {/* Thumb */}
                        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                    </div>

                    <div>
                        <p className="text-sm font-medium leading-none">
                            {data.dataforseo_sandbox ? 'Sandbox is ON' : 'Sandbox is OFF'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {data.dataforseo_sandbox
                                ? 'The tool returns randomly generated fake data. No API calls are made and no credits are used. Perfect for testing the UI.'
                                : 'The tool makes real API calls to DataForSEO using your credentials above. API credits will be consumed.'
                            }
                        </p>
                    </div>
                </label>
            </section>

            {/* ── Save button + success message ─────────────────────────── */}
            <div className="flex items-center gap-4">
                <Button type="submit" disabled={processing}>
                    {processing ? (
                        <>
                            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Saving…
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Save API Settings
                        </>
                    )}
                </Button>

                {/* Fade-in success message — disappears after ~2 seconds */}
                <Transition
                    show={recentlySuccessful || status === 'api-settings-saved'}
                    enter="transition ease-in-out duration-300"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out duration-300"
                    leaveTo="opacity-0"
                >
                    <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                        <ShieldCheck className="h-4 w-4" />
                        Settings saved successfully.
                    </p>
                </Transition>
            </div>

        </form>
    );
}
