const express = require("express");
const router = express.Router();
const moment = require("moment");

router.post("/get", (req, res) => {
	const {pool, body} = req;
	
	const query = `
		SELECT 
			SUM(orders.filled) as filled,
			markets.*,
			extract(epoch from markets.creation_date) as creation_timestamp,
			extract(epoch from markets.end_date_time) as end_timestamp
		FROM markets
		LEFT JOIN orders
		ON markets.id = orders.market_id
		WHERE markets.id = $1
		GROUP BY markets.id
		ORDER BY filled
		LIMIT 1;
	`;

	const values = [body.marketId];
	
  pool.query(query, values, (error, results) => {
    if (error) {
      console.error(error)
      res.status(404).json(error)
		}
    res.status(200).json(results.rows)
	})
});


router.post("/market_prices", (req, res) => {
	const {pool, body} = req;

	const query = `
		SELECT 
			outcome,
			SUM(shares - shares_filled) as amount,
			MAX(price) best_price
		FROM orders
		WHERE closed = false AND market_id = $1
		GROUP BY outcome
		ORDER BY outcome
	`;

	console.log(query)
	const values = [body.marketId];
	
  pool.query(query, values, (error, results) => {
    if (error) {
      console.error(error)
      res.status(404).json(error)
		}

		const marketPricePerOutcome = {}

		const rows = results.rows;

		for (let i = 0; i < rows.length; i++) {
			for (let x = 0; x < rows.length; x++) {
				let outcomeX = rows[x].outcome;
				if (x === i) continue;
				if(!marketPricePerOutcome[outcomeX]) marketPricePerOutcome[outcomeX] = 100;
				marketPricePerOutcome[outcomeX] -= rows[i].best_price;
			}
		}
    res.status(200).json(marketPricePerOutcome)
	})
});

router.post("/last_filled_prices", (req, res) => {
	const {pool, body} = req;

	const query = `
		SELECT 
			f1.outcome, 
			f1.market_id,
			f1.price
		FROM fills f1
		JOIN (
			SELECT 
				fills.market_id,
				fills.outcome,
				MAX(fills.fill_time) as fill_time
			FROM fills
			JOIN (
				SELECT * FROM markets
				WHERE markets.id = $1
			) markets
			ON fills.market_id = markets.id
			WHERE fills.fill_time < to_timestamp(${new Date().getTime()} / 1000)
			GROUP BY fills.market_id, fills.outcome
		) f2 ON f1.market_id = f2.market_id
			AND f1.outcome = f2.outcome
			AND f1.fill_time = f2.fill_time
		;
	`;

	const values = [body.marketId];
	
  pool.query(query, values, (error, results) => {
    if (error) {
      console.error(error)
      res.status(404).json(error)
		}

		const rows = results.rows;
		const lastFillPricePerOutcome = {}
		rows.forEach(lastFill => {
			lastFillPricePerOutcome[lastFill.outcome] = lastFill.price;
		});
    res.status(200).json(lastFillPricePerOutcome)
	})
});


router.post("/get_open_orders_for_user", (req, res) => {
	const {pool, body} = req;

	const query = `
		SELECT
			id,
			price,
			shares,
			shares_filled,
			outcome
		FROM orders
		WHERE orders.creator = $1 AND closed = false AND market_id = $2;	
	`;

	const values = [body.accountId, body.marketId]
	
  pool.query(query, values, (error, results) => {
    if (error) {
      console.error(error)
      res.status(404).json(error)
		}

    res.status(200).json(results.rows);
	})
});

router.post("/get_share_balances_for_user", (req, res) => {
	const {pool, body} = req;

	const query = `
		SELECT
			price,
			SUM(shares_filled) owned_shares,
			outcome
		FROM orders
		WHERE orders.creator = $1 AND market_id = $2 AND shares_filled > 0
		GROUP BY price, outcome;
	`;

	const values = [body.accountId, body.marketId]
	
  pool.query(query, values, (error, results) => {
    if (error) {
      console.error(error)
      res.status(404).json(error)
		}

    res.status(200).json(results.rows);
	})
});


router.post("/get_avg_prices_for_date", (req, res) => {
	const {pool, body} = req;

	const startDate = moment(body.date);
	const endDate = moment(body.date).add(1, "day");

	const query = `
		SELECT outcome, SUM(price * amount) / SUM(amount) avg_price
		FROM fills
		WHERE (fill_time BETWEEN TO_TIMESTAMP($1) AND TO_TIMESTAMP($2)) AND market_id = $3
		GROUP BY outcome;
	`;

	const values = [startDate.unix(), endDate.unix(), body.marketId]

	pool.query(query, values, (error, results) => {
    if (error) {
      console.error(error)
      res.status(404).json(error)
		}

    res.status(200).json(results.rows);
	})
});


module.exports = router;