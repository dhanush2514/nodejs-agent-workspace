# Request and data flow

```text
Client -> Nginx -> Express limits/request ID
       -> versioned endpoint registry
       -> identity -> permission -> Zod validation
       -> controller -> business service -> repository -> PostgreSQL
       <- response DTO mapping <- domain result
```

Resource/tenant policies belong in use cases when data is required for a decision.
Public health endpoints bypass user identity deliberately.
Unexpected failures reach the centralized sanitized Problem Details handler.
No controller directly imports Prisma. No external API receives a database model.

The Notes sample uses one insert or one bounded keyset read; no distributed
transaction, queue, cache, tenant policy or payment flow is implied.
