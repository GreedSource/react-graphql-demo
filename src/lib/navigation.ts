export const isRouteActive = (pathname: string, route: string): boolean => {
  if (route === '/') return pathname === '/';
  return pathname === route || pathname.startsWith(`${route}/`);
};

export const activeChildRoute = (pathname: string, routes: string[]): string | undefined =>
  routes.filter((route) => isRouteActive(pathname, route)).sort((left, right) => right.length - left.length)[0];
