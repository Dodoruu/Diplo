const detectPort = require('detect-port');

const findFreePort = async () => {
  const port = await detectPort(3000);
  return port;
};

module.exports = findFreePort;