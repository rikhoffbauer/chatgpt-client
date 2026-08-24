---
editUrl: false
next: false
prev: false
title: "RoutePathParameter"
---

> **RoutePathParameter**\<`Path`\> = `Path` *extends* `` `${string}{${infer Parameter}}${infer Rest}` `` ? `Parameter` \| `RoutePathParameter`\<`Rest`\> : `never`

Defined in: [src/routes.ts:297](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/routes.ts#L297)

## Type Parameters

### Path

`Path` *extends* `string`
