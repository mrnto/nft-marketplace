const hre = require("hardhat");
const { saveContractData } = require("./saveContractData");

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();

  const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");
  const nft = await SimpleNFT.deploy();
  
  await marketplace.deployed();
  await nft.deployed();

  saveContractData(marketplace, "Marketplace");
  saveContractData(nft, "SimpleNFT");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });