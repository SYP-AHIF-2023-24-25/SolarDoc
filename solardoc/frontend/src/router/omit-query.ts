import type {LocationQuery, Router} from "vue-router";

/**
 * Omits the specified query key from the current route.
 * @param $router The router to use to redirect to the editor.
 * @param options The options to use to omit the query key.
 */
export function omitQuery($router: Router, options: { queryKey: string | Array<string>}) {
  const newQuery: LocationQuery = {}
  const query = $router.currentRoute.value.query
  const queryKey = Array.isArray(options.queryKey) ? options.queryKey : [options.queryKey]
  for (const key in query) {
    if (!queryKey.includes(key)) {
      newQuery[key] = query[key]
    }
  }
  return $router.push({ query: newQuery })
}