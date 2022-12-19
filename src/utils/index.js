export const shortenAddress = (address) => `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;

export const truncateText = (text, maxLength) => `${text.slice(0, maxLength)}…`;
  