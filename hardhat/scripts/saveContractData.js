const fs = require("fs");

function saveContractData(contract, name) {
  const destDir = __dirname + "/../../src/contracts";

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

  fs.writeFileSync(destDir + `/${name}-address.json`, JSON.stringify({ address: contract.address }, undefined, 2));
  fs.writeFileSync(destDir + `/${name}.json`, JSON.stringify(artifacts.readArtifactSync(name), null, 2));
}

module.exports = {
  saveContractData: saveContractData,
};