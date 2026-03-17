/**
 * pages/admin/dashboard.tsx
 *
 * Super Admin Dashboard — overview of the application.
 * Route: GET /admin
 *
 * Shows:
 *   - Stats cards: users, searches, API status
 *   - Recently registered users table
 */

import { Head } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    FlaskConical,
    Key,
    Search,
    ShieldAlert,
    Users,
    XCircle,
} from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Dashboard', href: '/admin' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    total_users: number;
    admin_users: number;
    total_searches: number;
    searches_today: number;
    api_configured: boolean;
    sandbox_mode: boolean;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    created_at: string;
}

interface Props {
    stats: Stats;
    recent_users: RecentUser[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ stats, recent_users }: Props) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Application overview and quick status.
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard
                        label="Total Users"
                        value={stats.total_users}
                        icon={Users}
                        description={`${stats.admin_users} admin${stats.admin_users !== 1 ? 's' : ''}`}
                    />
                    <StatCard
                        label="Total Searches"
                        value={stats.total_searches}
                        icon={Search}
                        description="All time backlink lookups"
                    />
                    <StatCard
                        label="Searches Today"
                        value={stats.searches_today}
                        icon={Activity}
                        description="Since midnight"
                    />

                    {/* API status card — shows configured / sandbox state */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                DataForSEO API
                            </CardTitle>
                            <Key className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {stats.api_configured ? (
                                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="text-sm font-semibold">Configured</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                    <XCircle className="h-5 w-5" />
                                    <span className="text-sm font-semibold">Not configured</span>
                                </div>
                            )}
                            {stats.sandbox_mode && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                    <FlaskConical className="h-3 w-3" />
                                    Sandbox mode ON
                                </p>
                            )}
                            <a
                                href="/admin/api-settings"
                                className="mt-2 block text-xs text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Manage API settings →
                            </a>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent users table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Recent Users
                        </CardTitle>
                        <CardDescription>Last 5 registered accounts</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium">Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_users.map((user) => (
                                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{user.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                        <td className="px-4 py-3">
                                            {user.is_admin ? (
                                                <Badge variant="destructive" className="text-xs gap-1">
                                                    <ShieldAlert className="h-3 w-3" />
                                                    Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">User</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

            </div>
        </AdminLayout>
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    description,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}
