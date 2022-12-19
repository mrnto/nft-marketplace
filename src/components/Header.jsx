import { useGlobalContext } from "../context";
import { shortenAddress } from "../utils";
import Button from "./Button";

export default function Header() {
  const { currentAccount, connectWallet } = useGlobalContext();

  return (
    <div className="flex flex-wrap p-3 items-center sticky top-0 bg-zinc-900 h-fit md:h-16 z-30">
      <div className="flex items-center grow md:grow-0 w-fit md:w-48">
        <div className="w-10 h-10 bg-gradient-to-tr from-fuchsia-600 to-violet-600
          grid place-items-center rounded-full font-bold text-white text-2xl"
        >
          M
        </div>
        <div className="ml-2 font-bold text-xl">
          Marketplace
        </div>
      </div>
      <div className="flex mt-4 md:mt-0 order-3 md:order-2 w-full grow md:w-fit" />
      <div className="flex items-center order-2 md:order-3 pl-0 md:pl-3">
      {currentAccount ? (
        <p className="font-bold">
          {shortenAddress(currentAccount)}
        </p>
      ) : (
        <Button
          className="px-6 h-10"
          text={"Connect"}
          onClick={connectWallet}
        />
      )}
      </div>
    </div>
  )
}
