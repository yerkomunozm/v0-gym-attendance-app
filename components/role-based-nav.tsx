'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Home,
    Users,
    GraduationCap,
    History,
    QrCode,
    Building2,
    CreditCard,
    LogOut,
    User,
    Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    roles: ('admin' | 'trainer' | 'student')[];
}

const navItems: NavItem[] = [
    {
        href: '/',
        label: 'Inicio',
        icon: <Home className="w-4 h-4" />,
        roles: ['admin', 'trainer', 'student'],
    },
    {
        href: '/branches',
        label: 'Sedes',
        icon: <Building2 className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        href: '/plans',
        label: 'Planes',
        icon: <CreditCard className="w-4 h-4" />,
        roles: ['admin'],
    },
    {
        href: '/trainers',
        label: 'Entrenadores',
        icon: <Users className="w-4 h-4" />,
        roles: ['admin', 'trainer'],
    },
    {
        href: '/students',
        label: 'Alumnos',
        icon: <GraduationCap className="w-4 h-4" />,
        roles: ['admin', 'trainer'],
    },
    {
        href: '/scan',
        label: 'Registrar Asistencia',
        icon: <QrCode className="w-4 h-4" />,
        roles: ['admin', 'trainer', 'student'],
    },
    {
        href: '/history',
        label: 'Historial',
        icon: <History className="w-4 h-4" />,
        roles: ['admin', 'trainer', 'student'],
    },
];

export function RoleBasedNav() {
    const { user, signOut, loading } = useAuth();
    const pathname = usePathname();

    if (loading || !user) {
        return null;
    }

    const allowedItems = navItems.filter(item => item.roles.includes(user.role));

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <QrCode className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-slate-900 hidden sm:block">
                                Control de Asistencias
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {allowedItems.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={pathname === item.href ? 'default' : 'ghost'}
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        {item.icon}
                                        <span className="hidden lg:inline">{item.label}</span>
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {/* Branch Info */}
                        {user.branches && (
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                                <Building2 className="w-4 h-4" />
                                <span>{user.branches.name}</span>
                            </div>
                        )}

                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">{user.full_name}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium">{user.full_name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                        <p className="text-xs font-medium text-blue-600 capitalize">
                                            {user.role === 'admin' && 'Administrador'}
                                            {user.role === 'trainer' && 'Entrenador'}
                                            {user.role === 'student' && 'Alumno'}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        void signOut();
                                    }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="md:hidden">
                                <Button variant="outline" size="sm">
                                    <Menu className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {allowedItems.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href} className="flex items-center gap-2">
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    );
}
