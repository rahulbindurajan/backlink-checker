import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Link2,Search, ShieldAlert } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavAdmin } from '@/components/nav-admin';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavTools } from '@/components/nav-tools';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Auth, NavItem } from '@/types';

/** Main platform navigation (top section of sidebar) */
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

/**
 * SEO Tools navigation items.
 * To add a new tool, append an entry here and create its route + controller.
 * The icon should be imported from lucide-react.
 */
const toolNavItems: NavItem[] = [
    {
        title: 'Backlink Checker',
        href: '/tools/backlink-checker',
        icon: Link2,
    },

     {
        title: 'Keyword Research Tool',
        href: '/tools/keyword-research',
        icon: Search,
    },
    // Future tools — uncomment and implement when ready:
    // { title: 'Keyword Research', href: '/tools/keyword-research', icon: Search },
    // { title: 'Site Audit',       href: '/tools/site-audit',       icon: Activity },
    // { title: 'Rank Tracker',     href: '/tools/rank-tracker',     icon: TrendingUp },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

/** Admin nav items — only rendered when is_admin === true */
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: ShieldAlert,
    },
    {
        title: 'API Settings',
        href: '/admin/api-settings',
        icon: ShieldAlert,
    },
];

export function AppSidebar() {
    // Read the logged-in user from Inertia's shared props (set in HandleInertiaRequests)
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth?.user?.is_admin === true;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* General platform links (Dashboard, etc.) */}
                <NavMain items={mainNavItems} />

                {/* SEO Tools section — new tools get added here */}
                <NavTools items={toolNavItems} />

                {/* Admin section — only visible to super admins */}
                {isAdmin && <NavAdmin items={adminNavItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
