import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import {
  MARKETPLACE_ADDRESS,
  SIMPLE_NFT_ADDRESS,
  MARKETPLACE_ABI,
  SIMPLE_NFT_ABI,
  CHAIN_ID,
  CHAIN_PARAMS
} from "../contracts";

const ipfs = create({ host: "localhost", port: "5001", protocol: "http" });

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  
  const [currentAccount, setCurrentAccount] = useState(null);
  const [nft, setNft] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [approval, setApproval] = useState(false);
  
  const AddNetwork = async () => {
    await window.ethereum
      .request({
        method: 'wallet_addEthereumChain',
        params: [CHAIN_PARAMS],
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const SwitchNetwork = async () => {
    await window.ethereum
      .request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID }]
      })
      .catch((error) => {
        if (error.code === 4902) {
          AddNetwork();
        }
      });
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert('Please install MetaMask.');

      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== CHAIN_ID) SwitchNetwork();

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        window.location.reload();
      } else {
        console.log('No accounts found');
      }
    } catch (error) {
      console.log(error);
      throw new Error('No ethereum object');
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return alert('Please install MetaMask.');

      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== CHAIN_ID) SwitchNetwork();

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log('No accounts found');
      }
    } catch (error) {
      console.log(error);
      throw new Error('No ethereum object');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    
    window?.ethereum?.on('accountsChanged', () => window.location.reload());
    window?.ethereum?.on('chainChanged', () => window.location.reload());
    window?.ethereum?.on('disconnect', () => window.location.reload());
  }, []);

  useEffect(() => {
    const setContracts = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer;
      if (currentAccount) {
        signer = provider.getSigner(currentAccount);
      } else {
        signer = provider.getSigner("0x0000000000000000000000000000000000000000");
      }
      const nft = new ethers.Contract(SIMPLE_NFT_ADDRESS, SIMPLE_NFT_ABI, signer);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      
      if (currentAccount) {
        const approval = await nft.isApprovedForAll(currentAccount, marketplace.address);
        setApproval(approval);
      }

      setNft(nft);
      setMarketplace(marketplace);
    };

    setContracts();
  }, [currentAccount]);

  return (
    <GlobalContext.Provider
      value={{
        connectWallet,
        currentAccount,
        ethers,
        ipfs,
        nft,
        marketplace,
        approval,
        setApproval,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
