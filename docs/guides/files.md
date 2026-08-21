---
title: File upload and download
description: Upload bounded byte content, attach it to a turn, and download without forwarding account credentials.
---

## Upload bytes

```ts
import { readFile } from 'node:fs/promises'

const bytes = await readFile('./notes.md')
const attachment = await client.uploadFile({
  bytes,
  fileName: 'notes.md',
  contentType: 'text/markdown',
})

for await (const event of client.send({
  text: 'Summarize the attachment.',
  attachments: [attachment],
})) {
  if (event.type === 'delta') process.stdout.write(event.text)
}
```

Uploads reject payloads above `limits.uploadBytes`. The client requests an upload location from ChatGPT, then sends bytes to the external signed URL with `sendAuth: false`; bearer and account headers are not forwarded.

## Download bytes

```ts
import { writeFile } from 'node:fs/promises'

const { info, bytes: downloaded } = await client.downloadFile(fileId)
await writeFile('./download.bin', downloaded)
```

Downloads are bounded by `limits.downloadBytes`. The library returns bytes and metadata; callers choose a safe output path and overwrite policy. The CLI refuses to overwrite an existing output file.

Pass an `AbortSignal` to cancel upload processing or download operations. Treat signed URLs and downloaded account data as secrets.
