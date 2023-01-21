const express = require('express');
const app = express();
const port = 3010;
const path = require('path');
const functions = require('./functions');
const { workerPromise } = require('parallelizer-function');
app.use(express.static('static'));

app.get('/', async (req, res) => {
  return res.sendFile(path.resolve('./pages/index.html'));
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
    let data = await workerPromise(functions.getProductFromExternalApi, []);
    return res.status(200).json({ error: false, msg: 'OK', data: data });
  } catch (e) {
    return res.status(400).json({ error: true, msg: e.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
