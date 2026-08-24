---
editUrl: false
next: false
prev: false
title: "RouteArgumentsFor"
---

> **RouteArgumentsFor**\<`Name`\> = `Simplify`\<`RoutePathArguments`\<*typeof* [`ROUTES`](/api/variables/routes/)\[`Name`\]\> & `RouteQueryArguments`\<*typeof* [`ROUTES`](/api/variables/routes/)\[`Name`\]\> & `RouteBodyArguments`\<*typeof* [`ROUTES`](/api/variables/routes/)\[`Name`\]\>\>

Defined in: [src/routes.ts:316](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/routes.ts#L316)

Arguments inferred from a catalog entry. Path parameters are required; query/body fields are optional.

## Type Parameters

### Name

`Name` *extends* [`RouteName`](/api/type-aliases/routename/)
