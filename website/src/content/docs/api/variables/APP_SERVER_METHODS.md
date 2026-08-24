---
editUrl: false
next: false
prev: false
title: "APP_SERVER_METHODS"
---

> `const` **APP\_SERVER\_METHODS**: `object`

Defined in: [src/appserver.ts:14](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/appserver.ts#L14)

## Type Declaration

### account

> `readonly` **account**: readonly \[`"account/read"`, `"account/login/start"`, `"account/login/completed"`, `"account/login/cancel"`, `"account/logout"`, `"account/chatgptAuthTokens"`, `"account/chatgptAuthTokens/refresh"`, `"account/rateLimits/read"`, `"account/rateLimitResetCredit/consume"`, `"account/usage/read"`, `"account/workspaceMessages/read"`, `"account/sendAddCreditsNudgeEmail"`\]

### app

> `readonly` **app**: readonly \[`"app/list"`, `"app/read"`, `"app/installed"`\]

### config

> `readonly` **config**: readonly \[`"config/read"`, `"config/value/write"`, `"config/batchWrite"`, `"config/mcpServer/reload"`\]

### misc

> `readonly` **misc**: readonly \[`"feedback/upload"`, `"fuzzyFileSearch"`, `"command/exec"`, `"command/exec/write"`, `"command/exec/terminate"`, `"command/exec/resize"`\]

### model

> `readonly` **model**: readonly \[`"model/list"`, `"model/verification"`\]

### thread

> `readonly` **thread**: readonly \[`"thread/start"`, `"thread/resume"`, `"thread/read"`, `"thread/list"`, `"thread/loaded/list"`, `"thread/items/list"`, `"thread/turns/list"`, `"thread/search"`, `"thread/searchOccurrences"`, `"thread/fork"`, `"thread/rollback"`, `"thread/archive"`, `"thread/unarchive"`, `"thread/delete"`, `"thread/unsubscribe"`, `"thread/name/set"`, `"thread/goal/set"`, `"thread/goal/get"`, `"thread/goal/clear"`, `"thread/metadata/update"`, `"thread/settings/update"`, `"thread/memoryMode/set"`, `"thread/compact/start"`, `"thread/shellCommand"`, `"thread/approveGuardianDeniedAction"`, `"thread/backgroundTerminals/list"`, `"thread/backgroundTerminals/clean"`, `"thread/backgroundTerminals/terminate"`, `"thread/realtime/start"`, `"thread/realtime/stop"`, `"thread/realtime/sdp"`, `"thread/realtime/appendText"`, `"thread/realtime/appendAudio"`, `"thread/realtime/appendSpeech"`, `"thread/realtime/listVoices"`\]

### turn

> `readonly` **turn**: readonly \[`"turn/start"`, `"turn/steer"`, `"turn/interrupt"`\]
