---
editUrl: false
next: false
prev: false
title: "RouteArgumentsFor"
---

> **RouteArgumentsFor**\<`Name`\> = `Simplify`\<`RoutePathArguments`\<*typeof* [`ROUTES`](/api/variables/routes/)\[`Name`\]\> & `RouteQueryArguments`\<*typeof* [`ROUTES`](/api/variables/routes/)\[`Name`\]\> & `RouteBodyArguments`\<*typeof* [`ROUTES`](/api/variables/routes/)\[`Name`\]\>\>

Defined in: [src/routes.ts:316](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/routes.ts#L316)

Arguments inferred from a catalog entry. Path parameters are required; query/body fields are optional.

## Type Parameters

### Name

`Name` *extends* [`RouteName`](/api/type-aliases/routename/)
