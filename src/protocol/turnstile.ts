import { ProtocolError, errorMessage } from '../errors.js'
import type { UnknownRecord } from '../types.js'

const OP = {
  RECURSE: 0,
  XOR: 1,
  SET: 2,
  RESOLVE: 3,
  REJECT: 4,
  ADD: 5,
  GET: 6,
  CALL: 7,
  COPY: 8,
  QUEUE: 9,
  GLOBAL: 10,
  SCRIPT_MATCH: 11,
  SELF: 12,
  TRY: 13,
  JSON_PARSE: 14,
  JSON_STRINGIFY: 15,
  KEY: 16,
  TRY_CAPTURE: 17,
  ATOB: 18,
  BTOA: 19,
  IF_EQ: 20,
  IF_DIFF_GT: 21,
  SUBPROGRAM: 22,
  IF_DEFINED: 23,
  BIND: 24,
  NOP_A: 25,
  NOP_B: 26,
  SUB: 27,
  NOP_C: 28,
  LT: 29,
  DEFINE: 30,
  MUL: 33,
  AWAIT: 34,
  DIV: 35,
} as const

type Instruction = [number, ...unknown[]]
type VmFunction = (...args: unknown[]) => unknown
type RegisterFile = Map<number, unknown>

export interface TurnstileSolverOptions {
  window: UnknownRecord
  timeoutMs?: number
  maxInstructions?: number
  maxPayloadBytes?: number
}

export type TurnstileSolver = (dx: string, key: string) => Promise<string>

function xorCrypt(text: string, key: string): string {
  if (key.length === 0) throw new ProtocolError('Turnstile key cannot be empty', { code: 'INVALID_TURNSTILE_KEY' })
  let output = ''
  for (let index = 0; index < text.length; index += 1) {
    output += String.fromCharCode(text.charCodeAt(index) ^ key.charCodeAt(index % key.length))
  }
  return output
}

const decodeBase64 = (value: string): string => Buffer.from(value, 'base64').toString('binary')
const encodeBase64 = (value: string): string => Buffer.from(value, 'binary').toString('base64')

export function createTurnstileSolver(options: TurnstileSolverOptions): TurnstileSolver {
  const timeoutMs = options.timeoutMs ?? 500
  const maxInstructions = options.maxInstructions ?? 100_000
  const maxPayloadBytes = options.maxPayloadBytes ?? 2 * 1024 * 1024
  const registers: RegisterFile = new Map()
  let steps = 0

  const queue = (): Instruction[] => {
    const value = registers.get(OP.QUEUE)
    if (!Array.isArray(value)) throw new ProtocolError('Turnstile VM queue is not an array', { code: 'INVALID_TURNSTILE_QUEUE' })
    return value as Instruction[]
  }

  const registerFunction = (slot: number): VmFunction => {
    const value = registers.get(slot)
    if (typeof value !== 'function') throw new ProtocolError(`Turnstile register ${slot} is not callable`, { code: 'INVALID_TURNSTILE_CALL' })
    return value as VmFunction
  }

  async function drain(): Promise<void> {
    while (queue().length > 0) {
      if (steps >= maxInstructions) {
        throw new ProtocolError(`Turnstile VM exceeded ${maxInstructions} instructions`, {
          code: 'TURNSTILE_INSTRUCTION_LIMIT',
          details: { maxInstructions },
        })
      }
      const instruction = queue().shift()
      if (instruction === undefined || !Array.isArray(instruction) || typeof instruction[0] !== 'number') {
        throw new ProtocolError('Turnstile VM encountered an invalid instruction', { code: 'INVALID_TURNSTILE_INSTRUCTION' })
      }
      const [opcode, ...args] = instruction
      const fn = registers.get(opcode)
      const result = typeof fn === 'function' ? (fn as VmFunction)(...args) : undefined
      if (isThenable(result)) await result
      steps += 1
    }
  }

  const setQueue = (value: unknown): void => {
    if (!Array.isArray(value)) throw new ProtocolError('Turnstile program must be an instruction array', { code: 'INVALID_TURNSTILE_PROGRAM' })
    registers.set(OP.QUEUE, value as Instruction[])
  }

  function reset(solve: TurnstileSolver): void {
    registers.clear()
    registers.set(OP.RECURSE, (dx: unknown) => solve(String(dx), String(registers.get(OP.KEY))))
    registers.set(OP.XOR, (target: unknown, source: unknown) => {
      const targetSlot = toSlot(target)
      registers.set(targetSlot, xorCrypt(String(registers.get(targetSlot)), String(registers.get(toSlot(source)))))
    })
    registers.set(OP.SET, (slot: unknown, value: unknown) => registers.set(toSlot(slot), value))
    registers.set(OP.ADD, (target: unknown, source: unknown) => {
      const targetSlot = toSlot(target)
      const current = registers.get(targetSlot)
      const value = registers.get(toSlot(source))
      if (Array.isArray(current)) {
        current.push(value)
        return
      }
      registers.set(targetSlot, typeof current === 'number' && typeof value === 'number' ? current + value : String(current ?? '') + String(value ?? ''))
    })
    registers.set(OP.SUB, (target: unknown, source: unknown) => {
      const targetSlot = toSlot(target)
      const current = registers.get(targetSlot)
      const value = registers.get(toSlot(source))
      if (Array.isArray(current)) {
        const index = current.indexOf(value)
        if (index >= 0) current.splice(index, 1)
        return
      }
      registers.set(targetSlot, Number(current) - Number(value))
    })
    registers.set(OP.LT, (target: unknown, left: unknown, right: unknown) => {
      registers.set(toSlot(target), Number(registers.get(toSlot(left))) < Number(registers.get(toSlot(right))))
    })
    registers.set(OP.MUL, (target: unknown, left: unknown, right: unknown) => {
      registers.set(toSlot(target), Number(registers.get(toSlot(left))) * Number(registers.get(toSlot(right))))
    })
    registers.set(OP.DIV, (target: unknown, left: unknown, right: unknown) => {
      const divisor = Number(registers.get(toSlot(right)))
      registers.set(toSlot(target), divisor === 0 ? 0 : Number(registers.get(toSlot(left))) / divisor)
    })
    registers.set(OP.GET, (target: unknown, objectSlot: unknown, keySlot: unknown) => {
      registers.set(toSlot(target), getProperty(registers.get(toSlot(objectSlot)), String(registers.get(toSlot(keySlot)))))
    })
    registers.set(OP.CALL, (functionSlot: unknown, ...argumentSlots: unknown[]) => {
      return registerFunction(toSlot(functionSlot))(...argumentSlots.map((slot) => registers.get(toSlot(slot))))
    })
    registers.set(OP.TRY_CAPTURE, (target: unknown, functionSlot: unknown, ...argumentSlots: unknown[]) => {
      const targetSlot = toSlot(target)
      try {
        const result = registerFunction(toSlot(functionSlot))(...argumentSlots.map((slot) => registers.get(toSlot(slot))))
        if (isThenable(result)) {
          return Promise.resolve(result).then((value) => registers.set(targetSlot, value)).catch((error: unknown) => registers.set(targetSlot, errorMessage(error)))
        }
        registers.set(targetSlot, result)
      } catch (error) {
        registers.set(targetSlot, errorMessage(error))
      }
      return undefined
    })
    registers.set(OP.TRY, (target: unknown, functionSlot: unknown, ...args: unknown[]) => {
      try {
        registerFunction(toSlot(functionSlot))(...args)
      } catch (error) {
        registers.set(toSlot(target), errorMessage(error))
      }
    })
    registers.set(OP.COPY, (target: unknown, source: unknown) => registers.set(toSlot(target), registers.get(toSlot(source))))
    registers.set(OP.GLOBAL, options.window)
    registers.set(OP.SCRIPT_MATCH, (target: unknown, patternSlot: unknown) => {
      const document = getProperty(options.window, 'document')
      const scripts = getProperty(document, 'scripts')
      const pattern = String(registers.get(toSlot(patternSlot)))
      let match: string | null = null
      if (Array.isArray(scripts)) {
        for (const script of scripts) {
          const source = getProperty(script, 'src')
          if (typeof source !== 'string') continue
          const result = source.match(pattern)
          if (result?.[0] !== undefined) {
            match = result[0]
            break
          }
        }
      }
      registers.set(toSlot(target), match)
    })
    registers.set(OP.SELF, (target: unknown) => registers.set(toSlot(target), registers))
    registers.set(OP.JSON_PARSE, (target: unknown, source: unknown) => registers.set(toSlot(target), JSON.parse(String(registers.get(toSlot(source)))) as unknown))
    registers.set(OP.JSON_STRINGIFY, (target: unknown, source: unknown) => registers.set(toSlot(target), JSON.stringify(registers.get(toSlot(source)))))
    registers.set(OP.ATOB, (target: unknown) => {
      const slot = toSlot(target)
      registers.set(slot, decodeBase64(String(registers.get(slot))))
    })
    registers.set(OP.BTOA, (target: unknown) => {
      const slot = toSlot(target)
      registers.set(slot, encodeBase64(String(registers.get(slot))))
    })
    registers.set(OP.IF_EQ, (left: unknown, right: unknown, functionSlot: unknown, ...args: unknown[]) => {
      return registers.get(toSlot(left)) === registers.get(toSlot(right)) ? registerFunction(toSlot(functionSlot))(...args) : null
    })
    registers.set(OP.IF_DIFF_GT, (left: unknown, right: unknown, threshold: unknown, functionSlot: unknown, ...args: unknown[]) => {
      return Math.abs(Number(registers.get(toSlot(left))) - Number(registers.get(toSlot(right)))) > Number(registers.get(toSlot(threshold)))
        ? registerFunction(toSlot(functionSlot))(...args)
        : null
    })
    registers.set(OP.IF_DEFINED, (valueSlot: unknown, functionSlot: unknown, ...args: unknown[]) => {
      return registers.get(toSlot(valueSlot)) === undefined ? null : registerFunction(toSlot(functionSlot))(...args)
    })
    registers.set(OP.BIND, (target: unknown, objectSlot: unknown, keySlot: unknown) => {
      const object = registers.get(toSlot(objectSlot))
      const value = getProperty(object, String(registers.get(toSlot(keySlot))))
      if (typeof value !== 'function') throw new ProtocolError('Turnstile bind target is not callable', { code: 'INVALID_TURNSTILE_BIND' })
      registers.set(toSlot(target), value.bind(object))
    })
    registers.set(OP.AWAIT, (target: unknown, source: unknown) => Promise.resolve(registers.get(toSlot(source))).then((value) => registers.set(toSlot(target), value)))
    registers.set(OP.SUBPROGRAM, async (target: unknown, program: unknown) => {
      const saved = [...queue()]
      try {
        setQueue(program)
        await drain()
      } catch (error) {
        registers.set(toSlot(target), errorMessage(error))
      } finally {
        registers.set(OP.QUEUE, saved)
      }
    })
    registers.set(OP.NOP_A, () => undefined)
    registers.set(OP.NOP_B, () => undefined)
    registers.set(OP.NOP_C, () => undefined)
  }

  const solve: TurnstileSolver = async (dx, key) => {
    if (Buffer.byteLength(dx, 'utf8') > maxPayloadBytes) {
      throw new ProtocolError(`Turnstile payload exceeded ${maxPayloadBytes} bytes`, {
        code: 'TURNSTILE_PAYLOAD_TOO_LARGE',
        details: { maxPayloadBytes },
      })
    }

    return new Promise<string>((resolve, reject) => {
      reset(solve)
      steps = 0
      registers.set(OP.KEY, key)
      let settled = false
      const finish = (handler: (value: string) => void, value: string): void => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        handler(value)
      }
      const timer = setTimeout(() => finish(resolve, String(steps)), timeoutMs)

      registers.set(OP.RESOLVE, (value: unknown) => finish(resolve, encodeBase64(String(value))))
      registers.set(OP.REJECT, (value: unknown) => finish(reject, encodeBase64(String(value))))
      registers.set(OP.DEFINE, (slot: unknown, resultRegister: unknown, argumentRegisters: unknown, program: unknown) => {
        const hasArguments = Array.isArray(program)
        const parameters = hasArguments && Array.isArray(argumentRegisters) ? argumentRegisters : []
        const body = hasArguments ? program : argumentRegisters
        if (!Array.isArray(body)) throw new ProtocolError('Turnstile function body is not an array', { code: 'INVALID_TURNSTILE_FUNCTION' })
        registers.set(toSlot(slot), (...callArgs: unknown[]) => {
          if (settled) return undefined
          const saved = [...queue()]
          if (hasArguments) {
            for (let index = 0; index < parameters.length; index += 1) registers.set(toSlot(parameters[index]), callArgs[index])
          }
          setQueue([...body])
          return drain()
            .then(() => registers.get(toSlot(resultRegister)))
            .catch((error: unknown) => errorMessage(error))
            .finally(() => registers.set(OP.QUEUE, saved))
        })
      })

      try {
        const decrypted = xorCrypt(decodeBase64(dx), key)
        const parsed: unknown = JSON.parse(decrypted)
        setQueue(parsed)
        void drain().catch((error: unknown) => finish(resolve, encodeBase64(`${steps}: ${errorMessage(error)}`)))
      } catch (error) {
        finish(resolve, encodeBase64(`${steps}: ${errorMessage(error)}`))
      }
    })
  }

  return solve
}

function toSlot(value: unknown): number {
  const slot = Number(value)
  if (!Number.isSafeInteger(slot)) throw new ProtocolError(`Invalid Turnstile register: ${String(value)}`, { code: 'INVALID_TURNSTILE_REGISTER' })
  return slot
}

function getProperty(target: unknown, key: string): unknown {
  if ((typeof target !== 'object' || target === null) && typeof target !== 'function') return undefined
  return Reflect.get(target, key)
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (typeof value === 'object' && value !== null || typeof value === 'function') && typeof getProperty(value, 'then') === 'function'
}
