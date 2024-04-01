const { Worker } = require('worker_threads');
const numWorkers = 10;

const runTests = (workerIndex) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', {
      workerData: {
        port: 3000 + workerIndex
      }
    });

    worker.on('message', (message) => {
      console.log(message);
    });

    worker.on('error', (err) => {
      reject(err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
};


const serverProcess = require('child_process').spawn('node', ['startServer.js']);


Promise.all(Array.from({ length: numWorkers }, (_, i) => runTests(i)))
  .then(() => {
    console.log('Alle Tests abgeschlossen');
    serverProcess.kill();
  })
  .catch((err) => {
    console.error(err);
    serverProcess.kill();
    process.exit(1);
  });