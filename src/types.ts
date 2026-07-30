export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type JsonObject = { [key: string]: JsonValue }
export type UnknownRecord = Record<string, unknown>

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'
export type Persona = 'browser' | 'desktop'
export type IntegritySolver = 'node' | 'chrome'
export type StreamFormat = 'sse' | 'ndjson'

export type HeaderValue = string | undefined
export type HeaderInput = Record<string, HeaderValue>

export type Fetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

export interface Disposable {
  close(): void | Promise<void>
}
