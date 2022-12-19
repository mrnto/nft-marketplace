import { Fragment, useEffect, useState } from "react";
import { useGlobalContext } from "../context";
import { shortenAddress, truncateText } from "../utils";
import { Card, Spinner } from "../components";

export default function Home() {
  const { currentAccount, ethers, ipfs, nft, marketplace } = useGlobalContext();

  const [isLoading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  
  const loadOffers = async () => {
    let offers = [];
    const offerCount = await marketplace.offerCount();

    for (let i = 1; i <= offerCount; i++) {
      const offer = await marketplace.offers(i);
      
      if (offer.state == 0) {
        const uri = await nft.tokenURI(offer.tokenId);

        let metadata = '';
        const decoder = new TextDecoder();
        const response = await ipfs.cat(uri);
        
        for await (const chunk of response) {
          metadata += decoder.decode(chunk, { response: true }) 
        }
        
        metadata = JSON.parse(metadata);
        
        offers.push({
          offerId: offer.offerId,
          price: offer.price,
          seller: offer.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.imageUri
        });
      }
    }

    setOffers(offers);
    setLoading(false);
  };

  useEffect(() => {
    if(nft, marketplace) {
      loadOffers();
    }
  }, [nft, marketplace]);

  const buy = async (offerId, price) => {
    await (await marketplace.fulfillOffer(offerId, { value: price })).wait();
    loadOffers();
  }

  return (
    <>
      {isLoading ?
        <Spinner />
      :
        <>
          {offers.length > 0 ?
            <ul className="p-1.5 flex flex-wrap">
              {offers.map((offer, idx) => (
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
                    buttonText={"Buy"}
                    onClick={() => buy(offer.offerId, offer.price)}
                    disabled={
                      (currentAccount === null || currentAccount === offer.seller.toLowerCase()) ?
                      true : false
                    }
                  />
                </Fragment>
              ))}
            </ul>
          :
            <div className="flex justify-center mt-10 text-xl">
              There are no offers on the market.
            </div>
          }
        </>
      }
    </>
  )
}
