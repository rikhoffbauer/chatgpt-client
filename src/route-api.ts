import { ProtocolError } from './errors.js'
import { ROUTES, type RouteArgumentsFor, type RouteName, type RouteRequiresArguments } from './routes.js'
import type { HeaderInput, UnknownRecord } from './types.js'

/** Per-route headers, cancellation signal, and finite request timeout. */
export interface RouteCallOptions {
  headers?: HeaderInput
  signal?: AbortSignal
  timeoutMs?: number
}

export type RouteArguments = UnknownRecord
export type RouteResult<Name extends RouteName> = (typeof ROUTES)[Name] extends { stream: string } ? Response : unknown

export type RouteMethod<Name extends RouteName> = RouteRequiresArguments<Name> extends true
  ? (args: RouteArgumentsFor<Name>, options?: RouteCallOptions) => Promise<RouteResult<Name>>
  : (args?: RouteArgumentsFor<Name>, options?: RouteCallOptions) => Promise<RouteResult<Name>>

/** Typed methods generated from the private route catalog. Response values remain unknown unless explicitly modeled. */
export type RouteApi = {
  [Name in RouteName]: RouteMethod<Name>
}

export type RouteInvoker = <Name extends RouteName>(
  name: Name,
  args?: RouteArguments,
  options?: RouteCallOptions,
) => Promise<RouteResult<Name>>

/** Creates a lazily cached proxy over the catalog and rejects unknown route properties. */
export function createRouteApi(invoke: RouteInvoker): RouteApi {
  const cache = new Map<RouteName, RouteApi[RouteName]>()
  return new Proxy(Object.create(null) as RouteApi, {
    get(_target, property): unknown {
      if (typeof property !== 'string') return undefined
      if (!(property in ROUTES)) throw new ProtocolError(`Unknown route: ${property}`, { code: 'UNKNOWN_ROUTE' })
      const name = property as RouteName
      const cached = cache.get(name)
      if (cached !== undefined) return cached
      const method = ((args?: RouteArguments, options?: RouteCallOptions) => invoke(name, args, options)) as RouteApi[RouteName]
      cache.set(name, method)
      return method
    },
    has(_target, property): boolean {
      return typeof property === 'string' && property in ROUTES
    },
    ownKeys(): ArrayLike<string | symbol> {
      return Reflect.ownKeys(ROUTES)
    },
    getOwnPropertyDescriptor(_target, property): PropertyDescriptor | undefined {
      if (typeof property !== 'string' || !(property in ROUTES)) return undefined
      return { enumerable: true, configurable: true }
    },
  })
}
