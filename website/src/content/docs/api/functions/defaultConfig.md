---
editUrl: false
next: false
prev: false
title: "defaultConfig"
---

> **defaultConfig**(`overrides?`): [`ClientConfig`](/api/interfaces/clientconfig/)

Defined in: [src/config.ts:66](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/config.ts#L66)

Resolves configuration with programmatic overrides taking precedence over environment variables.

## Parameters

### overrides?

`Partial`\<`Omit`\<[`ClientConfig`](/api/interfaces/clientconfig/), `"retry"` \| `"limits"`\>\> & `object` = `{}`

## Returns

[`ClientConfig`](/api/interfaces/clientconfig/)
