import { Fragment, useEffect, useState } from "react";
import { useGlobalContext } from "../context";
import { shortenAddress, truncateText } from "../utils";
import { Card, Spinner, Button, Input } from "../components";

export default function App() {
  const { currentAccount, ethers, ipfs, nft, marketplace, approval, setApproval } = useGlobalContext();

  const [isLoading, setLoading] = useState(true);
  const [collection, setCollection] = useState([]);
  const [dialogHidden, setDialogHidden] = useState("hidden");
  const [itemId, setItemId] = useState(null);
  const [price, setPrice] = useState('');

  const loadCollection = async () => {
    const filterPurchased = marketplace.filters.OfferFulfilled(null, null, null, null, null, currentAccount);
    const filterCanceled = marketplace.filters.OfferCanceled(null, null, null, currentAccount);
    const queryResultPurchased = await marketplace.queryFilter(filterPurchased);
    const queryResultCanceled = await marketplace.queryFilter(filterCanceled);
    let queriesResult = [...queryResultPurchased, ...queryResultCanceled];

    queriesResult = queriesResult.map((item) => {return item.args});
    
    const result = queriesResult.filter((nft, index, self) =>
      index === self.findIndex((t) => (
        t.tokenId.eq(nft.tokenId)
      ))
    )

    const collection = await Promise.all(result.map(async (nftItem) => {
      const uri = await nft.tokenURI(nftItem.tokenId);
      const currentOwner = await nft.ownerOf(nftItem.tokenId);

      if (currentOwner.toLowerCase() === currentAccount) {
        const response = await ipfs.cat(uri);
        const decoder = new TextDecoder();
        let metadata = '';

        for await (const chunk of response) {
          metadata += decoder.decode(chunk, { response: true }) 
        }

        metadata = JSON.parse(metadata);

        return {
          tokenId: nftItem.tokenId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.imageUri
        };
      }
    }));

    setCollection(collection.filter(nft => nft !== undefined));
    setLoading(false);
  };

  useEffect(() => {
    if (nft, marketplace) {
      loadCollection();
    }
  }, [nft, marketplace]);

  const sell = async (tokenId, price) => {
    if (!price) return;

    if (!approval) {
      await(await nft.setApprovalForAll(marketplace.address, true)).wait();
      setApproval(true);
    }

    const bnPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.createOffer(nft.address, tokenId, bnPrice)).wait();

    setDialogHidden("hidden");
    setPrice('');
    loadCollection();
  };

  const openDialog = async (tokenId) => {
    setDialogHidden("");
    setItemId(tokenId);
  };

  const hideDialog = async () => {
    setDialogHidden("hidden");
    setPrice('');
  }

  return (
    <>
      {currentAccount ?
        <>
          {isLoading ?
            <Spinner />
          :
            <>
              {collection.length > 0 ?
                <ul className="p-1.5 flex flex-wrap">
                  {collection.map((nftItem, idx) => (
                    <Fragment key={idx}>
                      <Card
                        name={nftItem.name}
                        description={
                          nftItem.description.length > 32 ?
                          truncateText(nftItem.description, 32)
                          : nftItem.description
                        }
                        image={nftItem.image}
                        seller={shortenAddress(currentAccount)}
                        buttonText={"Sell"}
                        onClick={() => openDialog(nftItem.tokenId)}
                      />
                    </Fragment>
                  ))}
                </ul>
              :
                <div className="flex justify-center mt-10 text-xl">
                  You don't have any NFTs.
                </div>
              }
            </>
          }
        </>
      :
        <div className="flex justify-center mt-10 text-xl">
          Connect your wallet to see your NFT collection.
        </div>
      }

      <div
        tabIndex="-1"
        aria-hidden="true"
        className={`${dialogHidden} mx-auto sm:w-3/4 md:w-2/4 fixed inset-x-0 top-10
          inset-0 flex items-center`}
      >
        <div className="relative w-full max-w-2xl h-full md:h-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-neutral-800">
            <div className="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Offer creating
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900
                  rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600
                  dark:hover:text-white"
                onClick={hideDialog}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  >
                  </path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="flex justify-center">
              <Input
                type={"number"}
                id={"price"}
                placeholder={"ETH"}
                value={price}
                required={true}
                title={"Price"}
                min={0.1}
                step={0.1}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="flex justify-center pb-6">
              <Button
                className={"w-full sm:w-auto px-5 py-2.5"}
                text={"Sell"}
                type={"submit"}
                onClick={() => sell(itemId, price)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
