const { workerData } = require('worker_threads');
const { startServer, closeServer } = require('./index');

const runTests = async () => {
  try {
    const { server, port } = await startServer(workerData.port);
    console.log(`Tests werden auf Port ${port} ausgeführt`);

  

    await closeServer(server);
    console.log('Tests abgeschlossen');
  } catch (err) {
    console.error('Fehler beim Ausführen der Tests:', err);
    process.exit(1);
  }
};

runTests();