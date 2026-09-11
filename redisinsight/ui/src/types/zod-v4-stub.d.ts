/**
 * TODO: RI-0000 - remove this stub once RedisInsight upgrades TypeScript to
 * 5.x everywhere (root, redisinsight/api, redisinsight/desktop) and re-check
 * whether it's still needed. Re-evaluate then whether @rdi-ui/sdk's zod
 * version/usage still needs this workaround at all.
 *
 * Why this exists:
 * @rdi-ui/pipeline depends on @rdi-ui/sdk, which depends on zod
 * (^3.25.65 || ^4.0.0). Every zod version in that range ships internal
 * declaration files (zod/v4/core, zod/v4-mini, zod/v4/classic, ...) that use
 * TypeScript 5.0's `const` type-parameter syntax, e.g.:
 *
 *   function foo<const T extends SomeShape>(...): ...
 *
 * RedisInsight's TypeScript is pinned to ^4.0.5 (currently resolves to 4.9.5)
 * across three separate places (root, redisinsight/api, redisinsight/desktop).
 * TS 4.9's parser cannot parse `const` type parameters at all - this is a hard
 * parse failure, not a type-checking error, so `skipLibCheck: true` (already
 * set everywhere) does not help: parsing happens before the skip-check gate
 * is ever consulted.
 *
 * The fix: `@rdi-ui/sdk`'s own declaration files import the broken zod
 * modules through bare specifiers (`import * as z from "zod/v4-mini"` /
 * `"zod/v4/core"`). `paths` in tsconfig.json intercepts a bare specifier at
 * *resolution* time, before TypeScript opens the file it points to - so
 * redirecting those two specifiers here means the real zod files (and their
 * `const`-syntax internals, reached only via relative imports *inside* zod)
 * are never opened or parsed at all.
 *
 * This is intentionally loose (mostly `any`): these are `.d.ts`-only shapes
 * satisfying whatever @rdi-ui/sdk's *own* public declaration files reference,
 * not a faithful reproduction of zod's real API. RedisInsight does not import
 * zod or @rdi-ui/sdk directly - only @rdi-ui/pipeline's own prop types, which
 * are plain interfaces, not zod-derived. If a future @rdi-ui/sdk version
 * references a zod export not listed here, `tsc` will report a clear missing
 * export against this file (not a parse failure against a vendored one) -
 * add the missing name below.
 *
 * Scope/safety: only affects `tsc` type-checking for redisinsight/ui (this is
 * redisinsight/ui/tsconfig.json's `paths`, not a global config). Does not
 * affect `vite dev`/`vite build` (esbuild transpiles independently of the
 * `typescript` package and already understands `const` type parameters) or
 * `npm test` (Jest uses babel-jest, and @rdi-ui/pipeline is already mocked
 * wholesale for tests - see redisinsight/__mocks__/rdiUiPipelineMock.js).
 */
declare module 'zod/v4-mini' {
  export type ZodMiniType<Output = unknown, Input = unknown> = {
    _output: Output
    _input: Input
  }
  export type ZodMiniCustom<T = unknown> = ZodMiniType<T>
  export type ZodMiniEnum<T = unknown> = ZodMiniType<T>
  export type ZodMiniNull = ZodMiniType<null>
  export type ZodMiniObject<T = unknown> = ZodMiniType<T>
  export type ZodMiniOptional<T = unknown> = ZodMiniType<T>
  export type ZodMiniPipe<T = unknown> = ZodMiniType<T>
  export type ZodMiniString = ZodMiniType<string>
  export type ZodMiniTransform<T = unknown> = ZodMiniType<T>
  export type ZodMiniUndefined = ZodMiniType<undefined>
  export type ZodMiniUnion<T = unknown> = ZodMiniType<T>
  export const NEVER: never
  export function any(): ZodMiniType<any>
  export function array(...args: any[]): ZodMiniType<any>
  export function object(...args: any[]): ZodMiniType<any>
  export function string(...args: any[]): ZodMiniType<string>
  export function number(...args: any[]): ZodMiniType<number>
  export function boolean(): ZodMiniType<boolean>
  export function date(): ZodMiniType<Date>
  export function literal(...args: any[]): ZodMiniType<any>
  export function enum_(...args: any[]): ZodMiniType<any>
  export function nullable(...args: any[]): ZodMiniType<any>
  export function optional(...args: any[]): ZodMiniType<any>
  export function record(...args: any[]): ZodMiniType<any>
  export function union(...args: any[]): ZodMiniType<any>
  export function undefined(): ZodMiniType<undefined>
  export function null_(): ZodMiniType<null>
  export function unknown(): ZodMiniType<unknown>
  export function void_(): ZodMiniType<void>
  export function int(...args: any[]): ZodMiniType<number>
  export function custom(...args: any[]): ZodMiniType<any>
  export function pipe(...args: any[]): any
  export function transform(...args: any[]): any
  export function parse(...args: any[]): any
  export function _default(...args: any[]): any
  export function input<T extends ZodMiniType<any, any>>(schema: T): T['_input']
  export function output<T extends ZodMiniType<any, any>>(
    schema: T,
  ): T['_output']
  export const core: any
  export const $ZodError: any
  export function prettifyError(...args: any[]): string
}

declare module 'zod/v4/core' {
  export * from 'zod/v4-mini'
}
