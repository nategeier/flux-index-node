const express = require("express");
const router = express.Router();

router.post("/get_trading_earnings", (req, res) => {
	const {pool, body} = req;
	const marketId = body.marketId;
	const accountId = body.accountId;

	const query = `
		SELECT 
			fills.outcome, 
			SUM(fills.amount / price * 100) 
		FROM fills 
		WHERE fills.owner = $1 AND fills.market_id = $2 
		GROUP BY fills.outcome;
	`;
	
	const values = [accountId, marketId]

	pool.query(query, values, (error, results) => {
    if (error) {
      console.error(error)
      res.status(404).json(error)
		}

    res.status(200).json(results.rows);
	})
});

module.exports = router;