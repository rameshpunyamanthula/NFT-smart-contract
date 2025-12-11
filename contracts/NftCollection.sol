// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title NftCollection - ERC-721 compatible NFT collection with max supply, pausable minting, and per-token URIs
/// @notice Owner (deployer) can mint tokens up to maxSupply. Minting can be paused/unpaused by owner.
contract NftCollection is ERC721URIStorage, Pausable, Ownable {
    using Counters for Counters.Counter;

    /// @notice Immutable maximum supply of tokens
    uint256 public immutable maxSupply;

    /// @dev Internal counter for minted token IDs (starts at 0). Token IDs will start at 1.
    Counters.Counter private _mintCounter;

    /// @dev Tracks how many tokens have been burned (to compute totalSupply)
    uint256 private _burnedCount;

    /// @notice Emitted when a token is minted with tokenId and tokenURI
    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);

    /// @notice Emitted when a token is burned
    event Burned(address indexed operator, uint256 indexed tokenId);

    /// @param name_ The ERC721 name
    /// @param symbol_ The ERC721 symbol
    /// @param maxSupply_ Maximum number of tokens allowed in this collection
    constructor(string memory name_, string memory symbol_, uint256 maxSupply_) ERC721(name_, symbol_) {
        require(maxSupply_ > 0, "maxSupply must be > 0");
        maxSupply = maxSupply_;
    }

    /// @notice Returns number of tokens currently in circulation (minted - burned)
    function totalSupply() public view returns (uint256) {
        return _mintCounter.current() - _burnedCount;
    }

    /// @notice Returns total number of tokens ever minted (includes burned)
    function mintedCount() public view returns (uint256) {
        return _mintCounter.current();
    }

    /// @notice Owner-only safe mint to `to` with tokenURI; tokenId is auto-assigned (increments from 1).
    /// @dev Uses whenNotPaused so pausing only affects minting (transfers still allowed).
    /// @param to Recipient address
    /// @param uri Metadata URI for the token
    /// @return tokenId The newly minted token id
    function safeMint(address to, string calldata uri) external onlyOwner whenNotPaused returns (uint256) {
        require(to != address(0), "mint to zero address");

        uint256 nextId = _mintCounter.current() + 1;
        require(nextId <= maxSupply, "max supply reached");

        _mintCounter.increment();
        uint256 tokenId = _mintCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit Minted(to, tokenId, uri);
        return tokenId;
    }

    /// @notice Owner-only batch mint. Useful for initial drops. All tokens minted in the same tx.
    /// @param to Recipient address for all tokens
    /// @param uris Array of tokenURIs (length = number of tokens to mint)
    function safeMintBatch(address to, string[] calldata uris) external onlyOwner whenNotPaused {
        require(to != address(0), "mint to zero address");
        uint256 count = uris.length;
        require(count > 0, "empty uris");

        uint256 current = _mintCounter.current();
        require(current + count <= maxSupply, "exceeds max supply");

        for (uint256 i = 0; i < count; i++) {
            _mintCounter.increment();
            uint256 tokenId = _mintCounter.current();
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            emit Minted(to, tokenId, uris[i]);
        }
    }

    /// @notice Burn a token. Caller must be owner or approved.
    /// @param tokenId Token id to burn
    function burn(uint256 tokenId) external {
        require(_exists(tokenId), "nonexistent token");
        require(_isApprovedOrOwner(_msgSender(), tokenId), "not owner nor approved");

        _burn(tokenId);
        _burnedCount += 1;

        emit Burned(_msgSender(), tokenId);
    }

    /// @notice Pause minting (owner only). Transfers are not blocked by pause in this design.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause minting (owner only).
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @dev Override supportsInterface (inherited from ERC721)
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Note: tokenURI, approve, transferFrom, safeTransferFrom, setApprovalForAll, getApproved and isApprovedForAll
    // are provided by the ERC721 / ERC721URIStorage base contracts and need no overriding here.

    // No _beforeTokenTransfer pause check so transfers remain functional even when minting is paused.
    // If you prefer to pause transfers as well, we can add:
    // function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
    //     super._beforeTokenTransfer(from, to, tokenId);
    //     require(!paused(), "token transfer while paused");
    // }
}
