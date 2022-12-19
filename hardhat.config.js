require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    }
  },
  solidity: {
    version: "0.8.16"
  },
  paths: {
    sources: "./hardhat/contracts",
    tests: "./hardhat/test",
    cache: "./hardhat/cache",
    artifacts: "./hardhat/artifacts"
  }
};
