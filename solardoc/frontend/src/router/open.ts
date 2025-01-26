import type {RouteLocationRaw, Router} from "vue-router";

/**
 * Opens a new window with the given route.
 * @param $router The router which stores the route that should be navigated to.
 * @param routeTo The location to navigate to.
 */
export function openInNewWindow(
  $router: Router,
  routeTo: RouteLocationRaw
) {
  const routeData = $router.resolve(routeTo);
  window.open(
    routeData.href,
    '_blank'
  );
}
