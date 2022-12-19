const { expect } = require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("Marketplace contract", function () {
  let marketplaceContract, nftContract, marketplace, nft;
  let deployer, account1, account2, account3, accounts;
  let URI = "test URI";
  
  beforeEach(async function () {
    [deployer, account1, account2, account3, ...accounts] = await ethers.getSigners();
    marketplaceContract = await hre.ethers.getContractFactory("Marketplace");
    nftContract = await hre.ethers.getContractFactory("SimpleNFT");
    marketplace = await marketplaceContract.deploy();
    nft = await nftContract.deploy();
  });

  describe("Deployment", function () {
    it("Detect name and symbol of NFT collection", async function () {
      expect(await nft.name()).to.equal("SimpleNFT");
      expect(await nft.symbol()).to.equal("SNFT");
    });
  });

  describe("Minting NFTs", function () {
    it("Detect each minted NFT", async function () {
      await nft.connect(account1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(account1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);
      
      await nft.connect(account2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(account2.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  });

  describe("Creating marketplace offer", function () {
    beforeEach(async function () {
      await nft.connect(account1).mint(URI);
      await nft.connect(account1).setApprovalForAll(marketplace.address, true);
    });

    it("Create offer, transfer NFT from seller to marketplace and emit event", async function () {
      const price = 1;
      
      await expect(marketplace.connect(account1).createOffer(nft.address, 1 , toWei(price)))
        .to.emit(marketplace, "OfferCreated").withArgs(1, nft.address, 1, toWei(price), account1.address);
      
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
      expect(await marketplace.offerCount()).to.equal(1);

      const offer = await marketplace.offers(1);
      expect(offer.offerId).to.equal(1);
      expect(offer.nft).to.equal(nft.address);
      expect(offer.tokenId).to.equal(1);
      expect(offer.price).to.equal(toWei(price));
      expect(offer.seller).to.equal(account1.address);
      expect(offer.state).to.equal(0);
    });

    it("Fail if price is equal to zero", async function () {
      await expect(marketplace.connect(account1).createOffer(nft.address, 1, 0))
        .to.be.revertedWith("Price must be greater than zero");
    });
  });

  describe("Canceling marketplace offer", function () {
    const price = 1;

    beforeEach(async function () {
      await nft.connect(account1).mint(URI);
      await nft.connect(account1).setApprovalForAll(marketplace.address, true);
      await marketplace.connect(account1).createOffer(nft.address, 1 , toWei(price));
    });

    it("Cancel offer, transfer NFT back to seller and emit event", async function () {
      await expect(marketplace.connect(account1).cancelOffer(1))
        .to.emit(marketplace, "OfferCanceled").withArgs(1, nft.address, 1, account1.address);
      
      expect(await nft.ownerOf(1)).to.equal(account1.address);
      expect((await marketplace.offers(1)).state).to.equal(2);
    });

    it("Invalid offer id", async function () {
      await expect(marketplace.connect(account1).cancelOffer(0))
        .to.be.revertedWith("Offer must exist");
      await expect(marketplace.connect(account1).cancelOffer(2))
        .to.be.revertedWith("Offer must exist");
    });

    it("Not seller try to cancel offer", async function () {
      await expect(marketplace.connect(account2).cancelOffer(1))
        .to.be.revertedWith("Only seller can cancel offer");
    });

    it("Offer fulfilled", async function () {
      await marketplace.connect(account2).fulfillOffer(1, {value: toWei(price)});
      await expect(marketplace.connect(account1).cancelOffer(1))
        .to.be.revertedWith("Offer not for sale");
    });

    it("Offer already canceled", async function () {
      await marketplace.connect(account1).cancelOffer(1);
      await expect(marketplace.connect(account1).cancelOffer(1))
        .to.be.revertedWith("Offer not for sale");
    });
  });

  describe("Fulfilling marketplace offer", function () {
    const price = 1;

    beforeEach(async function () {
      await nft.connect(account1).mint(URI);
      await nft.connect(account1).setApprovalForAll(marketplace.address, true);
      await marketplace.connect(account1).createOffer(nft.address, 1 , toWei(price));
    });
    
    it("Update offer, pay seller, transfer NFT to buyer and emit event", async function () {
      const sellerStartBalance = await account1.getBalance();
      
      await expect(marketplace.connect(account2).fulfillOffer(1, {value: toWei(price)}))
        .to.emit(marketplace, "OfferFulfilled")
        .withArgs(1, nft.address, 1, toWei(price), account1.address, account2.address);
      
      const sellerFinalBalance = await account1.getBalance();
      
      expect((await marketplace.offers(1)).state).to.equal(1);
      expect(+fromWei(sellerFinalBalance)).to.equal(price + +fromWei(sellerStartBalance));
      expect(await nft.ownerOf(1)).to.equal(account2.address);
    })

    it("Invalid offer id", async function () {
      await expect(marketplace.connect(account2).fulfillOffer(0, {value: toWei(price)}))
        .to.be.revertedWith("Offer must exist");
      await expect(marketplace.connect(account2).fulfillOffer(2, {value: toWei(price)}))
        .to.be.revertedWith("Offer must exist");
    });

    it("Paid amount less than price", async function () {
      await expect(marketplace.connect(account2).fulfillOffer(1, {value: toWei(price - 0.1)}))
        .to.be.revertedWith("Not enough amount to cover price"); 
    });

    it("Seller try to fulfill own offer", async function () {
      await expect(marketplace.connect(account1).fulfillOffer(1, {value: toWei(price)}))
        .to.be.revertedWith("Seller cannot fulfill offer");
    });

    it("Offer already fulfilled", async function () {
      await marketplace.connect(account2).fulfillOffer(1, {value: toWei(price)});
      await expect(marketplace.connect(account3).fulfillOffer(1, {value: toWei(price)}))
        .to.be.revertedWith("Offer not for sale");
    });

    it("Offer canceled", async function () {
      await marketplace.connect(account1).cancelOffer(1);
      await expect(marketplace.connect(account2).fulfillOffer(1, {value: toWei(price)}))
        .to.be.revertedWith("Offer not for sale");
    });
  });
});
