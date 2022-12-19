import MarketplaceAbi from "./Marketplace.json";
import SimpleNftAbi from "./SimpleNFT.json";
import MarketplaceAddress from "./Marketplace-address.json";
import SimpleNftAddress from "./SimpleNFT-address.json";

export const { abi: MARKETPLACE_ABI } = MarketplaceAbi;
export const { abi: SIMPLE_NFT_ABI } = SimpleNftAbi;
export const { address: MARKETPLACE_ADDRESS } = MarketplaceAddress;
export const { address: SIMPLE_NFT_ADDRESS } = SimpleNftAddress;
export const CHAIN_ID = '0x539';
export const CHAIN_PARAMS = {
    chainId: '0x539',
    chainName: 'Localhost 8545',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['http://localhost:8545'],
};
