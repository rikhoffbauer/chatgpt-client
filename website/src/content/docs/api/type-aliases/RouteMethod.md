---
editUrl: false
next: false
prev: false
title: "RouteMethod"
---

> **RouteMethod**\<`Name`\> = [`RouteRequiresArguments`](/api/type-aliases/routerequiresarguments/)\<`Name`\> *extends* `true` ? (`args`, `options?`) => `Promise`\<[`RouteResult`](/api/type-aliases/routeresult/)\<`Name`\>\> : (`args?`, `options?`) => `Promise`\<[`RouteResult`](/api/type-aliases/routeresult/)\<`Name`\>\>

Defined in: [src/route-api.ts:15](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/route-api.ts#L15)

## Type Parameters

### Name

`Name` *extends* [`RouteName`](/api/type-aliases/routename/)
