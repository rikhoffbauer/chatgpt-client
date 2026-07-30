// @ts-nocheck
// Port of the ChatGPT "Turnstile (dx)" challenge VM found in
// webview/assets/app-initial-*.js (functions gva / hva / vva / _va).
//
// The challenge arrives as a base64 blob, XOR-encrypted with the same
// `requirementsKey` the client sent to /sentinel/chat-requirements/prepare.
// Decrypted it is a JSON array of [opcode, ...operands] instructions for a tiny
// register machine whose registers are a Map. Register 10 holds the global
// object, so the program is free to walk the DOM; the answer is delivered by
// invoking register 3 (resolve) or 4 (reject). If nothing resolves within 500 ms
// the client answers with the instruction counter instead.
//
// Everything below mirrors the original 1:1 except that `window` is the shim in
// browser-env.js rather than a real browser global.

// opcode table (names kept from the minified identifiers for traceability)
const OP = {
  RECURSE: 0, // yva  reg[e] = run(nested dx)
  XOR: 1, // bva  reg[e] = xor(reg[e], reg[t])
  SET: 2, // xva  reg[e] = literal t
  RESOLVE: 3, // Sva  resolve(btoa(String(v)))
  REJECT: 4, // Cva  reject(btoa(String(v)))
  ADD: 5, // wva  concat / push / numeric add
  GET: 6, // Tva  reg[e] = reg[t][reg[n]]
  CALL: 7, // Eva  reg[e](...args)
  COPY: 8, // Dva  reg[e] = reg[t]
  QUEUE: 9, // AH   instruction queue
  GLOBAL: 10, // Ova  the global object
  SCRIPT_MATCH: 11, // kva  first document.scripts src matching a regex
  SELF: 12, // Ava  reg[e] = the register file itself
  TRY: 13, // jva  call, swallow errors into reg[e]
  JSON_PARSE: 14, // Mva
  JSON_STRINGIFY: 15, // Nva
  KEY: 16, // Pva  the requirementsKey
  TRY_CAPTURE: 17, // Fva  call, capture result or error (awaits thenables)
  ATOB: 18, // Iva
  BTOA: 19, // Lva
  IF_EQ: 20, // Rva  if reg[e] === reg[t] then call reg[n]
  IF_DIFF_GT: 21, // zva  if |reg[e]-reg[t]| > reg[n] then call reg[r]
  SUBPROGRAM: 22, // Bva  run a nested instruction list
  IF_DEFINED: 23, // Vva  if reg[e] !== undefined then call reg[t]
  BIND: 24, // Hva  reg[e] = reg[t][reg[n]].bind(reg[t])
  NOP_A: 25, // Uva
  NOP_B: 26, // Wva
  SUB: 27, // Gva  numeric subtract / array splice
  NOP_C: 28, // Kva
  LT: 29, // qva
  DEFINE: 30, // Jva  define a callable that runs a sub-program
  MUL: 33, // Yva
  AWAIT: 34, // Xva
  DIV: 35, // Zva
}

// _va(): repeating-key XOR
function xorCrypt(text, key) {
  let out = ''
  for (let i = 0; i < text.length; i++) out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  return out
}

const atob_ = (s) => Buffer.from(s, 'base64').toString('binary')
const btoa_ = (s) => Buffer.from(s, 'binary').toString('base64')

export function createTurnstileSolver({ window: win, timeoutMs = 500 }) {
  const regs = new Map()
  let steps = 0

  // hva(): drain the instruction queue
  async function drain() {
    while ((regs.get(OP.QUEUE) ?? []).length > 0) {
      const [op, ...args] = regs.get(OP.QUEUE).shift() ?? []
      const fn = regs.get(op)
      const result = typeof fn === 'function' ? fn(...args) : undefined
      if (result && typeof result.then === 'function') await Promise.resolve(result)
      steps++
    }
  }

  // vva(): install the opcode implementations
  function reset() {
    regs.clear()
    regs.set(OP.RECURSE, (e) => solve(e, String(regs.get(OP.KEY))))
    regs.set(OP.XOR, (e, t) => regs.set(e, xorCrypt(String(regs.get(e)), String(regs.get(t)))))
    regs.set(OP.SET, (e, t) => regs.set(e, t))
    regs.set(OP.ADD, (e, t) => {
      const cur = regs.get(e)
      if (Array.isArray(cur)) return void cur.push(regs.get(t))
      regs.set(e, cur + regs.get(t))
    })
    regs.set(OP.SUB, (e, t) => {
      const cur = regs.get(e)
      if (Array.isArray(cur)) return void cur.splice(cur.indexOf(regs.get(t)), 1)
      regs.set(e, cur - regs.get(t))
    })
    regs.set(OP.LT, (e, t, n) => regs.set(e, Number(regs.get(t)) < Number(regs.get(n))))
    regs.set(OP.MUL, (e, t, n) => regs.set(e, Number(regs.get(t)) * Number(regs.get(n))))
    regs.set(OP.DIV, (e, t, n) => {
      const d = Number(regs.get(n))
      regs.set(e, d === 0 ? 0 : Number(regs.get(t)) / d)
    })
    regs.set(OP.GET, (e, t, n) => {
      const target = regs.get(t)
      regs.set(e, target[String(regs.get(n))])
    })
    regs.set(OP.CALL, (e, ...t) => regs.get(e)(...t.map((r) => regs.get(r))))
    regs.set(OP.TRY_CAPTURE, (e, t, ...n) => {
      try {
        const r = regs.get(t)(...n.map((x) => regs.get(x)))
        if (r && typeof r.then === 'function')
          return r.then((v) => void regs.set(e, v)).catch((err) => void regs.set(e, String(err)))
        regs.set(e, r)
      } catch (err) {
        regs.set(e, String(err))
      }
    })
    regs.set(OP.TRY, (e, t, ...n) => {
      try {
        regs.get(t)(...n)
      } catch (err) {
        regs.set(e, String(err))
      }
    })
    regs.set(OP.COPY, (e, t) => regs.set(e, regs.get(t)))
    regs.set(OP.GLOBAL, win)
    regs.set(OP.SCRIPT_MATCH, (e, t) =>
      regs.set(
        e,
        (Array.from(win.document.scripts || [])
          .map((s) => s?.src?.match(String(regs.get(t))))
          .filter((m) => m?.length)[0] ?? [])[0] ?? null,
      ),
    )
    regs.set(OP.SELF, (e) => regs.set(e, regs))
    regs.set(OP.JSON_PARSE, (e, t) => regs.set(e, JSON.parse(String(regs.get(t)))))
    regs.set(OP.JSON_STRINGIFY, (e, t) => regs.set(e, JSON.stringify(regs.get(t))))
    regs.set(OP.ATOB, (e) => regs.set(e, atob_(String(regs.get(e)))))
    regs.set(OP.BTOA, (e) => regs.set(e, btoa_(String(regs.get(e)))))
    regs.set(OP.IF_EQ, (e, t, n, ...r) => (regs.get(e) === regs.get(t) ? regs.get(n)(...r) : null))
    regs.set(OP.IF_DIFF_GT, (e, t, n, r, ...i) =>
      Math.abs(Number(regs.get(e)) - Number(regs.get(t))) > Number(regs.get(n)) ? regs.get(r)(...i) : null,
    )
    regs.set(OP.IF_DEFINED, (e, t, ...n) => (regs.get(e) === undefined ? null : regs.get(t)(...n)))
    regs.set(OP.BIND, (e, t, n) => {
      const target = regs.get(t)
      regs.set(e, target[String(regs.get(n))].bind(target))
    })
    regs.set(OP.AWAIT, (e, t) => Promise.resolve(regs.get(t)).then((v) => void regs.set(e, v)))
    regs.set(OP.SUBPROGRAM, (e, t) => {
      const saved = [...regs.get(OP.QUEUE)]
      regs.set(OP.QUEUE, [...t])
      return drain()
        .catch((err) => void regs.set(e, String(err)))
        .finally(() => regs.set(OP.QUEUE, saved))
    })
    regs.set(OP.NOP_A, () => undefined)
    regs.set(OP.NOP_B, () => undefined)
    regs.set(OP.NOP_C, () => undefined)
  }

  // gva(): decrypt, load and run a dx payload
  function solve(dx, key) {
    return new Promise((resolve, reject) => {
      reset()
      steps = 0
      regs.set(OP.KEY, key)
      let settled = false

      setTimeout(() => {
        if (settled) return
        settled = true
        resolve(String(steps)) // the client's own fallback answer
      }, timeoutMs)

      regs.set(OP.RESOLVE, (v) => {
        if (settled) return
        settled = true
        resolve(btoa_(String(v)))
      })
      regs.set(OP.REJECT, (v) => {
        if (settled) return
        settled = true
        reject(btoa_(String(v)))
      })

      // DEFINE: build a callable that runs a captured sub-program with its own arg binding
      regs.set(OP.DEFINE, (slot, resultReg, argRegs, program) => {
        const hasArgs = Array.isArray(program)
        const params = hasArgs ? argRegs : []
        const body = (hasArgs ? program : argRegs) ?? []
        regs.set(slot, (...callArgs) => {
          if (settled) return
          const saved = [...regs.get(OP.QUEUE)]
          if (hasArgs) for (let i = 0; i < params.length; i++) regs.set(params[i], callArgs[i])
          regs.set(OP.QUEUE, [...body])
          return drain()
            .then(() => regs.get(resultReg))
            .catch((err) => String(err))
            .finally(() => regs.set(OP.QUEUE, saved))
        })
      })

      try {
        regs.set(OP.QUEUE, JSON.parse(xorCrypt(atob_(dx), String(regs.get(OP.KEY)))))
        drain().catch((err) => {
          if (!settled) {
            settled = true
            resolve(btoa_(`${steps}: ${String(err)}`))
          }
        })
      } catch (err) {
        if (!settled) {
          settled = true
          resolve(btoa_(`${steps}: ${String(err)}`))
        }
      }
    })
  }

  return solve
}
