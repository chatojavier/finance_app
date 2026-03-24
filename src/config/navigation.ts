export const AUTH_LOGIN_PATH = "/auth/login";
export const AUTH_SIGNUP_PATH = "/auth/signup";
export const HOME_PATH = "/";

export const AUTH_PATHS = [AUTH_LOGIN_PATH, AUTH_SIGNUP_PATH] as const;

export type PrivateAppPath =
  | "/"
  | "/accounts"
  | "/transactions"
  | "/categories"
  | "/transfers"
  | "/credit-card"
  | "/fx"
  | "/reports";

export type MobileNavPlacement = "primary" | "overflow";

export type AppRouteConfig = {
  href: PrivateAppPath;
  title: string;
  navLabel: string;
  description: string;
  mobilePlacement: MobileNavPlacement;
};

export const PRIVATE_ROUTE_CONFIGS: AppRouteConfig[] = [
  {
    href: HOME_PATH,
    title: "Home",
    navLabel: "Home",
    description: "Panel privado inicial listo para conectar métricas y actividad reciente.",
    mobilePlacement: "primary",
  },
  {
    href: "/transactions",
    title: "Transactions",
    navLabel: "Transactions",
    description: "Flujo de movimientos financieros con impacto en saldos derivados.",
    mobilePlacement: "primary",
  },
  {
    href: "/accounts",
    title: "Accounts",
    navLabel: "Accounts",
    description: "CRUD de cuentas con moneda obligatoria, archivado y saldo derivado.",
    mobilePlacement: "primary",
  },
  {
    href: "/reports",
    title: "Reports",
    navLabel: "Reports",
    description: "Placeholder privado para resúmenes, breakdowns y hallazgos.",
    mobilePlacement: "primary",
  },
  {
    href: "/categories",
    title: "Categories",
    navLabel: "Categories",
    description: "CRUD mínimo de categorías por usuario para clasificar movimientos.",
    mobilePlacement: "overflow",
  },
  {
    href: "/transfers",
    title: "Transfers",
    navLabel: "Transfers",
    description: "Placeholder privado para transferencias entre cuentas.",
    mobilePlacement: "overflow",
  },
  {
    href: "/credit-card",
    title: "Credit Card",
    navLabel: "Credit Card",
    description: "Placeholder privado para la vista de tarjeta como pasivo.",
    mobilePlacement: "overflow",
  },
  {
    href: "/fx",
    title: "FX",
    navLabel: "FX",
    description: "Placeholder privado para tipos de cambio y conversiones.",
    mobilePlacement: "overflow",
  },
];

export const DESKTOP_NAV_ITEMS = PRIVATE_ROUTE_CONFIGS;
export const MOBILE_PRIMARY_NAV_ITEMS = PRIVATE_ROUTE_CONFIGS.filter(
  (route) => route.mobilePlacement === "primary"
);
export const MOBILE_OVERFLOW_NAV_ITEMS = PRIVATE_ROUTE_CONFIGS.filter(
  (route) => route.mobilePlacement === "overflow"
);

export function matchesAppPath(pathname: string, href: string): boolean {
  if (href === HOME_PATH) {
    return pathname === HOME_PATH;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getRouteConfig(pathname: string): AppRouteConfig | undefined {
  return PRIVATE_ROUTE_CONFIGS.find((route) => matchesAppPath(pathname, route.href));
}

export function getRequiredRouteConfig(href: PrivateAppPath): AppRouteConfig {
  const route = PRIVATE_ROUTE_CONFIGS.find((item) => item.href === href);

  if (!route) {
    throw new Error(`Missing route config for ${href}`);
  }

  return route;
}
