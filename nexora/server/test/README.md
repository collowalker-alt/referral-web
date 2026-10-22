# Backend tests

Run the security configuration unit tests with:

```sh
npm test --prefix nexora/server
```

These tests are intentionally independent of the production database. They do not replace integration tests for authentication, wallet operations, payments, withdrawals, referrals, or administrator actions. Add integration tests using a disposable test database before changing financial behavior.
