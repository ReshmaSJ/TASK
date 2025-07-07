const express = require('express');
const app = express();
const port = 3000;

#app.get('/', (req, res) => {
  #res.send('hello dev1321');});

#app.listen(port, () => {
  #console.log(`App is running at http://localhost:${port}`)
#});




const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.send('hello dev1242');
});

app.listen(3000, () => {
  console.log('App listening on port 3000');
});





