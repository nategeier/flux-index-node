env NEAR_ENV=local near --keyPath ~/.near/localnet/validator_key.json call $1.test.near create_market '{"description": "test", "extra_info": "", "outcomes": "2", "outcome_tags": [], "categories": [], "end_time": "13781293712897", "creator_fee_percentage": "1", "affiliate_fee_percentage": "0", "api_source": ""}' --gas 300000000000000 --accountId test.near