env NEAR_ENV=local near --keyPath ~/.near/localnet/validator_key.json call $1.test.near claim_earnings '{"market_id": "'$2'", "account_id": "test.near"}' --gas 300000000000000 --accountId test.near