env NEAR_ENV=local near --keyPath ~/.near/localnet/validator_key.json call $1.test.near place_order '{"market_id": "'$2'", "outcome": "0", "spend": "100000", "price": "25", "affiliate_account_id": ""}' --gas 300000000000000 --accountId test.near
env NEAR_ENV=local near --keyPath ~/.near/localnet/validator_key.json call $1.test.near place_order '{"market_id": "'$2'", "outcome": "1", "spend": "100000", "price": "25", "affiliate_account_id": ""}' --gas 300000000000000 --accountId test.near
env NEAR_ENV=local near --keyPath ~/.near/localnet/validator_key.json call $1.test.near place_order '{"market_id": "'$2'", "outcome": "2", "spend": "100000", "price": "25", "affiliate_account_id": ""}' --gas 300000000000000 --accountId test.near
env NEAR_ENV=local near --keyPath ~/.near/localnet/validator_key.json call $1.test.near place_order '{"market_id": "'$2'", "outcome": "3", "spend": "100000", "price": "24", "affiliate_account_id": ""}' --gas 300000000000000 --accountId test.near