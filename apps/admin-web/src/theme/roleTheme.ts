export interface RoleTheme {
  primary: string;
  lightText: string;
  gradient: string;
  hero: string;
  button: string;
  activeSidebarLight: string;
  activeSidebarDark: string;
  activeTextLight: string;
  activeTextDark: string;
  activeIconLight: string;
  activeIconDark: string;
  avatar: string;
  ring: string;
}

export type RoleThemeKey = keyof typeof roleTheme;

export const roleTheme: Record<string, RoleTheme> = {
  admin: {
    primary: "text-blue-500",
    lightText: "text-blue-300",
    gradient: "from-blue-500 to-indigo-600",
    hero: "from-blue-950 via-slate-900 to-indigo-950",
    button: "from-blue-600 to-indigo-600",
    activeSidebarLight: "bg-blue-50 border-l-4 border-blue-600",
    activeSidebarDark: "bg-gradient-to-r from-blue-500/20 to-indigo-500/20",
    activeTextLight: "text-blue-700 font-semibold",
    activeTextDark: "text-white font-semibold",
    activeIconLight: "text-blue-700",
    activeIconDark: "text-blue-300",
    avatar: "from-blue-500 to-indigo-600",
    ring: "ring-blue-500/40",
  },
  student: {
    primary: "text-emerald-500",
    lightText: "text-emerald-300",
    gradient: "from-emerald-500 to-teal-600",
    hero: "from-emerald-950 via-slate-900 to-teal-950",
    button: "from-emerald-600 to-teal-600",
    activeSidebarLight: "bg-emerald-50 border-l-4 border-emerald-600",
    activeSidebarDark: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20",
    activeTextLight: "text-emerald-700 font-semibold",
    activeTextDark: "text-white font-semibold",
    activeIconLight: "text-emerald-700",
    activeIconDark: "text-emerald-300",
    avatar: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-500/40",
  },
  warden: {
    primary: "text-violet-500",
    lightText: "text-violet-300",
    gradient: "from-violet-500 to-purple-600",
    hero: "from-violet-950 via-slate-900 to-purple-950",
    button: "from-violet-600 to-purple-600",
    activeSidebarLight: "bg-violet-50 border-l-4 border-violet-600",
    activeSidebarDark: "bg-gradient-to-r from-violet-500/20 to-purple-500/20",
    activeTextLight: "text-violet-700 font-semibold",
    activeTextDark: "text-white font-semibold",
    activeIconLight: "text-violet-700",
    activeIconDark: "text-violet-300",
    avatar: "from-violet-500 to-purple-600",
    ring: "ring-violet-500/40",
  },
  staff: {
    primary: "text-orange-500",
    lightText: "text-orange-300",
    gradient: "from-orange-500 to-amber-600",
    hero: "from-orange-950 via-slate-900 to-amber-950",
    button: "from-orange-600 to-amber-600",
    activeSidebarLight: "bg-orange-50 border-l-4 border-orange-600",
    activeSidebarDark: "bg-gradient-to-r from-orange-500/20 to-amber-500/20",
    activeTextLight: "text-orange-700 font-semibold",
    activeTextDark: "text-white font-semibold",
    activeIconLight: "text-orange-700",
    activeIconDark: "text-orange-300",
    avatar: "from-orange-500 to-amber-600",
    ring: "ring-orange-500/40",
  },
};
