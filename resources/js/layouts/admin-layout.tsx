/**
 * layouts/admin-layout.tsx
 *
 * Wraps every admin page (/admin/*).
 * Uses the same AppLayout shell (sidebar, header, breadcrumbs) but adds
 * a red "Admin Panel" badge so it's visually clear you're in the admin area.
 *
 * Usage:
 *   import AdminLayout from '@/layouts/admin-layout';
 *   export default function MyAdminPage() {
 *     return <AdminLayout breadcrumbs={[...]}>{children}</AdminLayout>;
 *   }
 */

import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Props {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminLayout({ children, breadcrumbs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col">

                {/* Admin area banner — always visible at the top */}
                <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-900 dark:bg-red-950/40">
                    <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                        Super Admin Area
                    </span>
                </div>

                {/* Page content */}
                <div className="flex-1 overflow-x-auto p-4 md:p-6">
                    {children}
                </div>

            </div>
        </AppLayout>
    );
}
