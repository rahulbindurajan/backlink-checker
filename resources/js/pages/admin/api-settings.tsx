/**
 * pages/admin/api-settings.tsx
 *
 * Admin page for managing all third-party API credentials.
 * Route: GET/POST /admin/api-settings
 *
 * Each API provider has its own collapsible section.
 * To add a new provider, add a new <ApiProviderSection> below.
 */

import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Eye, EyeOff, FlaskConical, Key, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'API Settings', href: '/admin/api-settings' },
];

// ─── Props from the controller ────────────────────────────────────────────────

interface DataForSeoConfig {
    login: string;
    sandbox: boolean;
    hasPassword: boolean;
}

interface Props {
    status?: string;
    apis: {
        dataforseo: DataForSeoConfig;
        // Future: semrush, ahrefs, etc.
    };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminApiSettings({ apis, status }: Props) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin — API Settings" />

            <div className="max-w-2xl space-y-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">API Settings</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage third-party API credentials used by all SEO tools.
                        Credentials are stored encrypted in the database.
                    </p>
                </div>

                {/* Success flash */}
                <Transition
                    show={status === 'api-settings-saved'}
                    enter="transition ease-in-out duration-300"
                    enterFrom="opacity-0 -translate-y-1"
                    leave="transition ease-in-out duration-300"
                    leaveTo="opacity-0"
                >
                    <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">API settings saved successfully.</span>
                    </div>
                </Transition>

                {/* ── DataForSEO ─────────────────────────────────────────── */}
                <DataForSeoSection config={apis.dataforseo} />

                {/* ── Future API sections go here ────────────────────────── */}
                {/* <SemRushSection config={apis.semrush} /> */}

            </div>
        </AdminLayout>
    );
}

// ─── DataForSEO section ───────────────────────────────────────────────────────

/**
 * Self-contained form section for DataForSEO credentials.
 * Has its own useForm state so each provider is independent.
 */
function DataForSeoSection({ config }: { config: DataForSeoConfig }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        dataforseo_login:    config.login,
        dataforseo_password: '',
        dataforseo_sandbox:  config.sandbox,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/api-settings', { preserveScroll: true });
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* DataForSEO logo placeholder */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                            DF
                        </div>
                        <div>
                            <CardTitle className="text-base">DataForSEO</CardTitle>
                            <CardDescription className="text-xs">
                                Powers Backlink Checker and future SEO tools
                            </CardDescription>
                        </div>
                    </div>

                    {/* Status badge */}
                    {config.hasPassword && config.login ? (
                        <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Configured
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Not configured
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Login */}
                    <div className="space-y-1">
                        <Label htmlFor="dataforseo_login">API Login (Email)</Label>
                        <Input
                            id="dataforseo_login"
                            type="email"
                            placeholder="your@dataforseo.com"
                            value={data.dataforseo_login}
                            onChange={(e) => setData('dataforseo_login', e.target.value)}
                            disabled={processing}
                            autoComplete="off"
                        />
                        <InputError message={errors.dataforseo_login} />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <Label htmlFor="dataforseo_password">
                            API Password
                            {config.hasPassword && (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    (leave blank to keep existing)
                                </span>
                            )}
                        </Label>
                        <div className="relative">
                            <Input
                                id="dataforseo_password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={config.hasPassword ? '••••••••' : 'Enter API password'}
                                value={data.dataforseo_password}
                                onChange={(e) => setData('dataforseo_password', e.target.value)}
                                disabled={processing}
                                autoComplete="new-password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.dataforseo_password} />
                        <p className="text-xs text-muted-foreground">
                            Stored encrypted (AES-256). Never exposed in the UI or logs.
                        </p>
                    </div>

                    {/* Sandbox toggle */}
                    <div className="space-y-2">
                        <Label>Sandbox Mode</Label>
                        <label
                            htmlFor="dataforseo_sandbox"
                            className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                                data.dataforseo_sandbox
                                    ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950'
                                    : 'border-border hover:bg-muted/40'
                            }`}
                        >
                            {/* Toggle switch */}
                            <div className="relative mt-0.5 shrink-0">
                                <input
                                    id="dataforseo_sandbox"
                                    type="checkbox"
                                    checked={data.dataforseo_sandbox}
                                    onChange={(e) => setData('dataforseo_sandbox', e.target.checked)}
                                    disabled={processing}
                                    className="peer sr-only"
                                />
                                <div className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-yellow-400 dark:peer-checked:bg-yellow-600" />
                                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <FlaskConical className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    <p className="text-sm font-medium">
                                        {data.dataforseo_sandbox ? 'Sandbox ON' : 'Sandbox OFF'}
                                    </p>
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {data.dataforseo_sandbox
                                        ? 'Returns fake mock data. No credits used. All users see sandbox results.'
                                        : 'Makes real API calls. Credits are consumed per search.'
                                    }
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Save button */}
                    <div className="flex items-center gap-4 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Key className="mr-2 h-4 w-4" />
                                    Save DataForSEO Settings
                                </>
                            )}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                <ShieldCheck className="h-4 w-4" />
                                Saved
                            </p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
