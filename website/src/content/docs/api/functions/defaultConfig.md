---
editUrl: false
next: false
prev: false
title: "defaultConfig"
---

> **defaultConfig**(`overrides?`): [`ClientConfig`](/api/interfaces/clientconfig/)

Defined in: [src/config.ts:66](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/config.ts#L66)

Resolves configuration with programmatic overrides taking precedence over environment variables.

## Parameters

### overrides?

`Partial`\<`Omit`\<[`ClientConfig`](/api/interfaces/clientconfig/), `"retry"` \| `"limits"`\>\> & `object` = `{}`

## Returns

[`ClientConfig`](/api/interfaces/clientconfig/)
