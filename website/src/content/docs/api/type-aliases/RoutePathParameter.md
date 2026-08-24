---
editUrl: false
next: false
prev: false
title: "RoutePathParameter"
---

> **RoutePathParameter**\<`Path`\> = `Path` *extends* `` `${string}{${infer Parameter}}${infer Rest}` `` ? `Parameter` \| `RoutePathParameter`\<`Rest`\> : `never`

Defined in: [src/routes.ts:297](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/routes.ts#L297)

## Type Parameters

### Path

`Path` *extends* `string`
