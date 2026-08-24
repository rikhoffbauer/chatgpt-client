---
editUrl: false
next: false
prev: false
title: "openDictationStream"
---

> **openDictationStream**(`client`, `options?`): `Promise`\<[`DictationStream`](/api/interfaces/dictationstream/)\>

Defined in: [src/realtime.ts:147](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L147)

Opens a dictation WebSocket, validates sample rate, and applies a finite handshake deadline.

## Parameters

### client

[`ChatGPTClient`](/api/classes/chatgptclient/)

### options?

[`DictationOptions`](/api/interfaces/dictationoptions/) = `{}`

## Returns

`Promise`\<[`DictationStream`](/api/interfaces/dictationstream/)\>
