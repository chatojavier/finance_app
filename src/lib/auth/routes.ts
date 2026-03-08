import {
  AUTH_PATHS,
  type PrivateAppPath,
  PRIVATE_ROUTE_CONFIGS,
  matchesAppPath,
} from "@/config/navigation";

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((path) => matchesAppPath(pathname, path));
}

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_ROUTE_CONFIGS.some((route) => matchesAppPath(pathname, route.href));
}

export function isKnownAppPath(pathname: string): pathname is PrivateAppPath {
  return PRIVATE_ROUTE_CONFIGS.some((route) => route.href === pathname);
}
