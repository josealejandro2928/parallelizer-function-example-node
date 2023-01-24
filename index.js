const express = require('express');
const app = express();
const port = 3010;
const path = require('path');
const functions = require('./functions');
const { pool } = require('parallelizer-function');
app.use(express.static('static'));

pool.setMaxWorkers(4);

function mainHeavyTask(usingWorker = true) {
  console.log('usingWorker: ', usingWorker);
  if (usingWorker) {
    return Promise.all([
      pool.exec(functions.sumUpTo, [1_000_000_000]),
      pool.exec(functions.isPrimeThisNumber, [98764321261]),
      pool.exec(functions.sumUpTo, [2_999_000_000]),
      pool.exec(functions.tripleSum, [[11, 2, 3, 4, 5, 6, 7, 8, 9, 15], 32]),
    ]);
  } else {
    return Promise.all([
      Promise.resolve(functions.sumUpTo(1_000_000_000)),
      Promise.resolve(functions.isPrimeThisNumber(98764321261)),
      Promise.resolve(functions.sumUpTo(2_99_000_000)),
      Promise.resolve(
        functions.tripleSum([11, 2, 3, 4, 5, 6, 7, 8, 9, 15], 32)
      ),
    ]);
  }
}

app.get('/', async (req, res) => {
  let start = performance.now();
  let usingPool = !!req.query.usingPool;
  mainHeavyTask(usingPool)
    .then(([sumUpTo1, isPrime2, sumUpTo2, tripleSum2]) => {
      let delayMs = performance.now() - start;
      return res.send(`
      <link rel="stylesheet" href="./style.css">
      <style>
        body {
          font-family: monospace;
        }
        .table {
          border-collapse: collapse;
          width: 100%;
          max-width:800px;
        }
        .table th,
        .table td {
          padding: 5px;
          border: solid 1px #777;
        }
        .table th {
          background-color: lightblue;
        }      
      </style>
      <h1>Hello Express!</h1>
      <h2>We are using pool from the library parallelizer-function </h2>
      <h3>Insights</h3>
      <ul>
        <li><strong># of threads:</strong> ${pool.maxWorker}</li>
        <li><strong>delay in ms:</strong> ${delayMs.toFixed(2)}</li>
        <li><strong>is usingPool:</strong> ${usingPool}</li>
      </ul>

      <table class="table">
        <tr>
          <th>Method</th>
          <th>result</th>
        </tr>
      <tbody>
        <tr>
          <td>sum up to: ${1_000_000_000}</td>
          <td>${sumUpTo1}</td>
        </tr>
        <tr>
          <td>is Prime: ${98764321261}</td>
          <td>${isPrime2}</td>
        </tr>
        <tr>
        <td>sum up to: ${2_99_000_000}</td>
        <td>${sumUpTo2}</td>
      </tr>
        <tr>
        <td>tripleSum for: [${[
          11, 2, 3, 4, 5, 6, 7, 8, 9, 15,
        ]}] with target = ${32}</td>
        <td>${tripleSum2.map((el) => `[${el}]`)}</td>
      </tr>
      </tbody>
    </table>
      
    `);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get('/compute/:fn', async (req, res) => {
  try {
    let fn = req.params.fn;
    let constArgs = {
      isPrimeThisNumber: 98764321261,
      tripleSum: [-1, 0, 1, 2, -1, -4],
      simulateLongTask: 5,
    };
    if (!fn || !(fn in functions)) {
      return res.status(404).json({ msg: 'Not found the function' });
    }

    let data = await workerPromise(functions[fn], [constArgs[fn]]);
    // This will not block the main thread of JS, it will run
    return res.status(200).json({ error: false, msg: 'OK', data: data });
  } catch (e) {
    return res.status(400).json({ error: true, msg: e.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    let data = await pool.exec(functions.getProductFromExternalApi, []);
    return res.status(200).json({ error: false, msg: 'OK', data: data });
  } catch (e) {
    return res.status(400).json({ error: true, msg: e.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
