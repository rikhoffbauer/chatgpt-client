/**
 * Public package surface for the high-level client, authentication, local app-server,
 * advanced transport primitives, and unstable protocol compatibility helpers.
 *
 * Start with {@link ChatGPTClient}, {@link Auth}, or {@link AppServer}. Exports backed by
 * `src/protocol/` are lower-level compatibility surfaces and may change with the private protocol.
 *
 * @packageDocumentation
 */
export { deadlineSignal, sleep } from './abort.js'
export type { Deadline } from './abort.js'
export { AppServer, APP_SERVER_ARGS, APP_SERVER_METHODS, APP_SERVER_NOTIFICATIONS, DEFAULT_CODEX_BIN } from './appserver.js'
export type {
  AppServerOptions,
  ClientInfo,
  JsonRpcNotification,
  JsonRpcRequest,
  RequestOptions as AppServerRequestOptions,
  ServerRequestHandler,
} from './appserver.js'
export { Auth, OAUTH_CLIENT_ID, OAUTH_TOKEN_URL, accountIdFromToken, authClaims, decodeJwtPayload, deviceId } from './auth.js'
export type { AuthOptions, ChatGptAuthClaims, JwtPayload, LoadAuthOptions } from './auth.js'
export { ChatGPTClient, HttpError, ROUTES, SENTINEL_HEADERS, resolveApiBase } from './client.js'
export type {
  Attachment,
  ChatGPTClientOptions,
  Conversation,
  ConversationListResponse,
  ConversationMessage,
  ConversationNode,
  CreateClientOptions,
  MessageContent,
  ModelInfo,
  ModelsResponse,
  SendEvent,
  StartTurnOptions,
  TurnRequestInput,
  UploadFileOptions,
  UserMemoriesResponse,
  UserMemory,
  UserMemorySummaryFollowUp,
  UserMemorySummaryResponse,
  UserMemorySummarySection,
  UserMessageOptions,
} from './client.js'
export { defaultConfig, DEV_API_BASE, PROD_API_BASE } from './config.js'
export type { ClientConfig, RetryPolicy, RuntimeLimits } from './config.js'
export {
  AuthError,
  ClientError,
  ConfigurationError,
  HttpError as TransportHttpError,
  ProcessExitedError,
  ProtocolError,
  QueueOverflowError,
  TimeoutError,
  redactUrl,
  serializeError,
} from './errors.js'
export type { SerializedError } from './errors.js'
export { CHROME_UA, CHROME_VERSION, DESKTOP_UA, Http, buildQuery, expandPath, readResponseBytes, readResponseText } from './http.js'
export type { HttpOptions, Query, QueryValue, RequestOptions, ResponseReadOptions, StreamOptions } from './http.js'
export { ConsoleLogger, noopLogger } from './logger.js'
export type { Logger, LogLevel } from './logger.js'
export { createWindow, USER_AGENT } from './protocol/browser-env.js'
export { closeChrome, solveInChrome } from './protocol/chrome-solver.js'
export {
  fingerprint,
  powHash,
  prepareIntegrity,
  requirementsKey,
  solveProofOfWork,
  solveTurnstile,
} from './protocol/sentinel.js'
export type {
  ChatRequirements,
  IntegrityResult,
  PrepareIntegrityOptions,
  PrepareRequirements,
  ProofOfWorkRequirement,
  TurnstileRequirement,
} from './protocol/sentinel.js'
export { createTurnstileSolver } from './protocol/turnstile.js'
export type { TurnstileSolver, TurnstileSolverOptions } from './protocol/turnstile.js'
export { openConversationSocket, openDictationStream, DICTATION_SESSION_CONFIG } from './realtime.js'
export type { ConversationSocket, ConversationSocketOptions, DictationOptions, DictationStream } from './realtime.js'
export { createRouteApi } from './route-api.js'
export type { RouteApi, RouteArguments, RouteCallOptions, RouteMethod, RouteResult } from './route-api.js'
export { ROUTE_NAMES, routePathParams } from './routes.js'
export type {
  Route,
  RouteArgumentsFor,
  RouteDefinition,
  RouteName,
  RoutePathParameter,
  RouteRequiresArguments,
} from './routes.js'
export { AsyncQueue } from './streaming/async-queue.js'
export { ndjson } from './streaming/ndjson.js'
export type { NdjsonOptions, NdjsonRecord } from './streaming/ndjson.js'
export { readLines } from './streaming/lines.js'
export type { LineReaderOptions } from './streaming/lines.js'
export { sseEvents } from './streaming/sse.js'
export type { SseEvent, SseOptions } from './streaming/sse.js'
export type {
  Disposable,
  Fetch,
  HeaderInput,
  HeaderValue,
  HttpMethod,
  IntegritySolver,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  Persona,
  StreamFormat,
  UnknownRecord,
} from './types.js'
