import { Fragment, useEffect, useState } from "react";
import { useGlobalContext } from "../context";
import { shortenAddress, truncateText } from "../utils";
import { Card, Spinner } from "../components";

export default function Listed() {
  const { currentAccount, ethers, ipfs, nft, marketplace } = useGlobalContext();

  const [isLoading, setLoading] = useState(true);
  const [listed, setListed] = useState([]);

  const loadListed = async () => {
    let listed = [];
    const offerCount = await marketplace.offerCount();

    for (let i = 1; i <= offerCount; i++) {
      const offer = await marketplace.offers(i);
      
      if(offer.seller.toLowerCase() === currentAccount && offer.state == 0) {
        const uri = await nft.tokenURI(offer.tokenId);

        let metadata = '';
        const decoder = new TextDecoder();
        const response = await ipfs.cat(uri);
        
        for await (const chunk of response) {
          metadata += decoder.decode(chunk, { response: true }) 
        }
        
        metadata = JSON.parse(metadata);
        
        listed.push({
          offerId: offer.offerId,
          price: offer.price,
          seller: offer.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.imageUri
        });
      }
    }

    setListed(listed);
    setLoading(false);
  };

  useEffect(() => {
    if(nft, marketplace) {
      loadListed();
    }
  }, [nft, marketplace]);

  const cancel = async (offerId) => {
    await (await marketplace.cancelOffer(offerId)).wait();
    loadListed();
  }
  
  return (
    <>
      {currentAccount ?
        <>
          {isLoading ?
            <Spinner />
          :
            <>
              {listed.length > 0 ?
                <ul className="p-1.5 flex flex-wrap">
                  {listed.map((offer, idx) => (
                    <Fragment key={idx}>
                      <Card
                        name={offer.name}
                        description={
                          offer.description.length > 32 ?
                          truncateText(offer.description, 32)
                          : offer.description
                        }
                        image={offer.image}
                        seller={shortenAddress(offer.seller)}
                        price={Number(ethers.utils.formatEther(offer.price)).toFixed(1)}
                        buttonText={"Cancel"}
                        onClick={() => cancel(offer.offerId)}
                      />
                    </Fragment>
                  ))}
                </ul>
              :
                <div className="flex justify-center mt-10 text-xl">
                  You don't have any listed NFTs.
                </div>
              }
            </>
          }
        </>
      :
        <div className="flex justify-center mt-10 text-xl">
          Connect your wallet to see listed NFTs.
        </div>
      }
    </>
  )
}
