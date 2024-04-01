const app = require('./index');
const findFreePort = require('./findFreePort');

const startServer = async () => {
  const PORT = await findFreePort();
  const server = app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
};

startServer();