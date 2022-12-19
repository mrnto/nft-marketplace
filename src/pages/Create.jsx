import { useState } from "react";
import { useGlobalContext } from "../context";
import { Button, Input, Spinner } from "../components";

export default function Create() {
  const { currentAccount, ethers, ipfs, nft, marketplace, approval, setApproval } = useGlobalContext();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');

  const createNFT = async (event) => {
    event.preventDefault();

    if (!image || !price || !name || !description) return;

    try {
      const imageResult = await ipfs.add(image);
      const imageUri = `https://ipfs.io/ipfs/${imageResult.path}`;
      const nftResult = await ipfs.add(JSON.stringify({name, description, imageUri}));
      await(await nft.mint(nftResult.path)).wait();

      if (!approval) {
        await(await nft.setApprovalForAll(marketplace.address, true)).wait();
        setApproval(true);
      }

      const id = await nft.tokenCount();
      const bnPrice = ethers.utils.parseEther(price.toString());
      await(await marketplace.createOffer(nft.address, id, bnPrice)).wait();

      setName('');
      setDescription('');
      setImage('');
      setPrice('');
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {currentAccount ?
        <>
          {(!nft && !marketplace) ?
            <Spinner />
          :
            <div className="flex justify-center">
              <form className="w-2/5 mt-10 mb-10">
                <Input
                  type={"text"}
                  id={"title"}
                  placeholder={"Awesome NFT"}
                  value={name}
                  required={true}
                  onChange={(e) => setName(e.target.value)}
                  title={"Title"}
                />
                <Input
                  type={"text"}
                  id={"description"}
                  placeholder={"Awesome NFT description"}
                  value={description}
                  required={true}
                  onChange={(e) => setDescription(e.target.value)}
                  title={"Description"}
                />
                <Input
                  type={"number"}
                  id={"price"}
                  placeholder={"ETH"}
                  value={price}
                  required={true}
                  onChange={(e) => setPrice(e.target.value)}
                  title={"Price"}
                  min={0.1}
                  step={0.1}
                />
                <Input
                  type={"file"}
                  id={"image"}
                  required={true}
                  onChange={(e) => setImage(e.target.files[0])}
                  title={"Image"}
                  accept={"image/*"}
                  aria-describedby={"image_help"}
                  ariaDescribedbyText={".jpg, .jpeg, .gif, .png"}
                  inputClass={"cursor-pointer dark:text-gray-400 focus:outline-none p-0"}
                />
                <div className="flex justify-center">
                  <Button
                    className={"w-full sm:w-auto px-5 py-2.5"}
                    text={"Submit"}
                    onClick={createNFT}
                    type={"submit"}
                  />
                </div>
              </form>
            </div>
        }
        </>
      :
        <div className="flex justify-center mt-10 text-xl">
          Connect your wallet to create new NFT.
        </div>
      }
    </>
  )
}
