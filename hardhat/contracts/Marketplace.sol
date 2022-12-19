// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard {

    using Counters for Counters.Counter;

    enum State {
        SALE,
        SOLD,
        CANCELED
    }

    struct Offer {
        uint256 offerId;
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        State state;
    }

    Counters.Counter public offerCount;
    mapping(uint256 => Offer) public offers;

    constructor() {}

    event OfferCreated(
        uint256 offerId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller
    );

    event OfferFulfilled(
        uint256 offerId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    event OfferCanceled(uint256 offerId, address indexed nft, uint256 tokenId, address indexed seller);

    function createOffer(IERC721 _nft, uint256 _tokenId, uint256 _price) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");

        _nft.transferFrom(msg.sender, address(this), _tokenId);
        offerCount.increment();
        uint256 offerId = offerCount.current();
        offers[offerId] = Offer(offerId, _nft, _tokenId, _price, payable(msg.sender), State.SALE);
        emit OfferCreated(offerId, address(_nft), _tokenId, _price, msg.sender);
    }

    function fulfillOffer(uint256 _offerId) external payable nonReentrant {
        require(_offerId > 0 && _offerId <= offerCount.current(), "Offer must exist");
        Offer storage offer = offers[_offerId];
        require(msg.value >= offer.price, "Not enough amount to cover price");
        require(msg.sender != offer.seller, "Seller cannot fulfill offer");
        require(offer.state == State.SALE, "Offer not for sale");
        
        offer.state = State.SOLD;
        offer.seller.transfer(msg.value);
        offer.nft.transferFrom(address(this), msg.sender, offer.tokenId);
        emit OfferFulfilled(_offerId, address(offer.nft), offer.tokenId, offer.price, offer.seller, msg.sender);
    }
    
    function cancelOffer(uint256 _offerId) external nonReentrant {
        require(_offerId > 0 && _offerId <= offerCount.current(), "Offer must exist");
        Offer storage offer = offers[_offerId];
        require(msg.sender == offer.seller, "Only seller can cancel offer");
        require(offer.state == State.SALE, "Offer not for sale");

        offer.state = State.CANCELED;
        offer.nft.transferFrom(address(this), msg.sender, offer.tokenId);
        emit OfferCanceled(_offerId, address(offer.nft), offer.tokenId, msg.sender);
    }
}