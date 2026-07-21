# API Guidelines

- Prefix `api/v1`; JSON via TransformInterceptor
- Document new routes in `docs/api-contract.md`
- Do not break existing response envelopes
- Swagger annotations where existing controllers use them
- Streaming: Range on `/videos/:id/stream`; AI stream on `/ai/discover/stream`
