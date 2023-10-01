const express = require('express');
const app = express();
app.use(express.json());
const { body, validationResult } = require('express-validator');

const PORT = 8000;

let userPoints = 0;
// userData stores an array of every stransaction. This array is sorted whenever a user spends points to get the oldest time stamp
let userData = [];
let payerData = {};

app.post(
  '/add',
  [
    // validate & sanitize body of request
    body('payer').isString().toUpperCase(),
    body('points').isInt().toInt(),
    body('timestamp').isISO8601(),
    body()
      .custom((body) => {
        const keys = ['payer', 'points', 'timestamp'];
        return Object.keys(body).every((key) => keys.includes(key));
        // error message if extra parameters are sent in body of request
      })
      .withMessage(
        'Extra parameters were sent. Params restricted to: payer:<str>, points:<int>, timestamp:<ISO8601>'
      ),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    // return error if body of request does not pass validation constraints
    if (!errors.isEmpty())
      return res.status(422).send(errors.array({ onlyFirstError: true }));
    next();
  },
  (req, res) => {
    const points = req.body.points;
    const payer = req.body.payer;
    const timestamp = req.body.timestamp;
    if (points == 0) {
      return res.status(422).json({
        error: 'Unable to add transaction',
        reason: 'Points must be a positive or negative integer',
      });
    }

    if (userPoints + points < 0) {
      return res.status(200).json({
        error: 'Unable to add transaction',
        reason: `User balance can't go negative.`,
      });
    }

    if (
      (!payerData.hasOwnProperty(payer) && points < 0) ||
      (payerData.hasOwnProperty(payer) && payerData[payer] + points < 0)
    ) {
      return res.status(422).json({
        error: 'Unable to add transaction',
        reason: `Payer balance can't go negative. ${payer} has ${
          !payerData[payer] ? 0 : payerData[payer]
        } points in account`,
      });
    } else if (payerData.hasOwnProperty(payer)) {
      payerData[payer] += points;
    } else {
      payerData[payer] = points;
    }
    userPoints += points;
    userData.push({
      payer,
      points,
      timestamp,
    });

    res.sendStatus(200);
  }
);

app.get('/balance', (req, res) => {
  const jsonContent = JSON.stringify(payerData);
  res.end(jsonContent);
});

app.post(
  '/spend',
  [
    // validate & sanitize body of request
    body('points').isInt().toInt(),
    body()
      .custom((body) => {
        const keys = ['points'];
        return Object.keys(body).every((key) => keys.includes(key));
        // error message if extra parameters are sent in body of request
      })
      .withMessage(
        'Extra parameters were sent. Params restricted to: points:<int>'
      ),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    // return error if body of request does not pass validation constraints
    if (!errors.isEmpty())
      return res.status(422).send(errors.array({ onlyFirstError: true }));
    next();
  },
  (req, res) => {
    let pointsToSpend = req.body.points;
    if (pointsToSpend > userPoints) {
      return res.status(422).json({
        error: `Unable to spend ${pointsToSpend} points`,
        reason: `User only has ${userPoints} left`,
      });
    }
    userData.sort((a, b) => {
      return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0;
    });

    spendData = {};
    while (true) {
      let oldestTransaction = userData.pop();
      if (oldestTransaction.points >= pointsToSpend) {
        oldestTransaction.points -= pointsToSpend;
        if (spendData.hasOwnProperty(oldestTransaction.payer)) {
          spendData[oldestTransaction.payer] -= pointsToSpend;
        } else {
          spendData[oldestTransaction.payer] = -pointsToSpend;
        }
        userPoints -= pointsToSpend;
        userData.push(oldestTransaction);
        break;
      } else {
        pointsToSpend -= oldestTransaction.points;
        userPoints -= oldestTransaction.points;
        if (spendData.hasOwnProperty(oldestTransaction.payer)) {
          spendData[oldestTransaction.payer] -= oldestTransaction.points;
        } else {
          spendData[oldestTransaction.payer] = -oldestTransaction.points;
        }
      }
    }

    // spendData has negative points. Update the payerData once we finisih selecting all the payers we deduct points from
    for (const [payer, points] of Object.entries(spendData)) {
      payerData[payer] += points;
    }
    const jsonContent = JSON.stringify(spendData);
    return res.status(200).send(jsonContent);
  }
);

app.get('/', (req, res) => res.send('Welcome'));

app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`)
);
