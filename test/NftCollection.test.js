const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftCollection (ERC-721) - Full test suite", function () {
  let Nft;
  let nft;
  let owner, alice, bob, carol, operator;
  let ownerAddr, aliceAddr, bobAddr, carolAddr, operatorAddr;

  const NAME = "TestNFT";
  const SYMBOL = "TNFT";
  const MAX_SUPPLY = 10;

  beforeEach(async () => {
    [owner, alice, bob, carol, operator] = await ethers.getSigners();

    ownerAddr = await owner.getAddress();
    aliceAddr = await alice.getAddress();
    bobAddr = await bob.getAddress();
    carolAddr = await carol.getAddress();
    operatorAddr = await operator.getAddress();

    Nft = await ethers.getContractFactory("NftCollection");
    nft = await Nft.deploy(NAME, SYMBOL, MAX_SUPPLY);
    await nft.waitForDeployment(); // ethers v6
  });

  // ---------------------------
  // Deployment
  // ---------------------------
  describe("Deployment & initial state", () => {
    it("sets name, symbol and maxSupply correctly", async () => {
      expect(await nft.name()).to.equal(NAME);
      expect(await nft.symbol()).to.equal(SYMBOL);
      expect(Number(await nft.maxSupply())).to.equal(MAX_SUPPLY);
      expect(Number(await nft.totalSupply())).to.equal(0);
      expect(Number(await nft.mintedCount())).to.equal(0);
    });

    it("owner is deployer", async () => {
      expect(await nft.owner()).to.equal(ownerAddr);
    });
  });

  // ---------------------------
  // Minting
  // ---------------------------
  describe("Minting", () => {
    it("owner can safeMint and emits events", async () => {
      await expect(nft.safeMint(aliceAddr, "ipfs://QmToken1"))
        .to.emit(nft, "Minted")
        .withArgs(aliceAddr, 1, "ipfs://QmToken1");

      expect(await nft.tokenURI(1)).to.equal("ipfs://QmToken1");
      expect(Number(await nft.balanceOf(aliceAddr))).to.equal(1);
      expect(Number(await nft.totalSupply())).to.equal(1);
    });

    it("safeMintBatch mints multiple tokens", async () => {
      await nft.safeMintBatch(carolAddr, ["a", "b", "c"]);
      expect(Number(await nft.totalSupply())).to.equal(3);
      expect(Number(await nft.mintedCount())).to.equal(3);
      expect(await nft.tokenURI(3)).to.equal("c");
    });

    it("non-owner cannot mint", async () => {
      await expect(nft.connect(alice).safeMint(aliceAddr, "x"))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("cannot mint to zero address", async () => {
      await expect(nft.safeMint(ethers.ZeroAddress, "z"))
        .to.be.revertedWith("mint to zero address");
    });

    it("cannot exceed max supply", async () => {
      for (let i = 0; i < MAX_SUPPLY; i++) {
        await nft.safeMint(ownerAddr, `t-${i}`);
      }
      await expect(nft.safeMint(ownerAddr, "overflow"))
        .to.be.revertedWith("max supply reached");
    });
  });

  // ---------------------------
  // Transfers & Approvals
  // ---------------------------
  describe("Transfers & approvals", () => {
    beforeEach(async () => {
      await nft.safeMint(aliceAddr, "t1");
      await nft.safeMint(aliceAddr, "t2");
    });

    it("owner can transfer token", async () => {
      await nft.connect(alice).transferFrom(aliceAddr, bobAddr, 1);

      expect(await nft.ownerOf(1)).to.equal(bobAddr);
      expect(Number(await nft.balanceOf(aliceAddr))).to.equal(1);
      expect(Number(await nft.balanceOf(bobAddr))).to.equal(1);
    });

    it("transfer reverts for unauthorized sender", async () => {
      await expect(
        nft.connect(bob).transferFrom(aliceAddr, bobAddr, 1)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });

    it("approve + transfer by approved address", async () => {
      await expect(nft.connect(alice).approve(bobAddr, 1))
        .to.emit(nft, "Approval")
        .withArgs(aliceAddr, bobAddr, 1);

      await nft.connect(bob).transferFrom(aliceAddr, bobAddr, 1);

      expect(await nft.ownerOf(1)).to.equal(bobAddr);
    });

    it("setApprovalForAll", async () => {
      await expect(nft.connect(alice).setApprovalForAll(operatorAddr, true))
        .to.emit(nft, "ApprovalForAll")
        .withArgs(aliceAddr, operatorAddr, true);

      await nft.connect(operator).transferFrom(aliceAddr, operatorAddr, 2);

      expect(await nft.ownerOf(2)).to.equal(operatorAddr);

      await expect(nft.connect(alice).setApprovalForAll(operatorAddr, false))
        .to.emit(nft, "ApprovalForAll")
        .withArgs(aliceAddr, operatorAddr, false);

      await expect(nft.connect(operator).transferFrom(aliceAddr, bobAddr, 1))
        .to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
  });

  // ---------------------------
  // Token URI
  // ---------------------------
  describe("Token metadata", () => {
    it("returns tokenURI and reverts for nonexistent id", async () => {
      await nft.safeMint(aliceAddr, "u1");
      expect(await nft.tokenURI(1)).to.equal("u1");
      await expect(nft.tokenURI(99)).to.be.reverted;
    });
  });

  // ---------------------------
  // Burning
  // ---------------------------
  describe("Burning tokens", () => {
    it("owner or approved can burn", async () => {
      await nft.safeMint(aliceAddr, "a");
      await nft.safeMint(aliceAddr, "b");

      await nft.connect(alice).burn(1);
      await expect(nft.ownerOf(1)).to.be.reverted;

      await nft.connect(alice).approve(bobAddr, 2);
      await nft.connect(bob).burn(2);

      expect(Number(await nft.totalSupply())).to.equal(0);
    });

    it("burn reverts for invalid calls", async () => {
      await nft.safeMint(aliceAddr, "x");
      await expect(nft.burn(99)).to.be.revertedWith("nonexistent token");
      await expect(nft.connect(bob).burn(1)).to.be.revertedWith("not owner nor approved");
    });
  });

  // ---------------------------
  // Pause
  // ---------------------------
  describe("Pause & Unpause", () => {
    it("owner can pause minting", async () => {
      await nft.pause();

      await expect(nft.safeMint(aliceAddr, "x"))
        .to.be.revertedWith("Pausable: paused");

      await nft.unpause();
      await nft.safeMint(aliceAddr, "x");
    });

    it("non-owner cannot pause", async () => {
      await expect(nft.connect(alice).pause())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // ---------------------------
  // Invalid Operations
  // ---------------------------
  describe("Invalid operations", () => {
    it("transfer of non-existent token reverts", async () => {
      await expect(nft.transferFrom(aliceAddr, bobAddr, 99)).to.be.reverted;
    });

    it("ownerOf nonexistent id reverts", async () => {
      await expect(nft.ownerOf(55)).to.be.reverted;
    });
  });

  // ---------------------------
  // Supply consistency
  // ---------------------------
  describe("Balance & supply consistency", () => {
    it("totalSupply matches burns/transfers", async () => {
      await nft.safeMint(aliceAddr, "A");
      await nft.safeMint(bobAddr, "B");

      await nft.connect(alice).transferFrom(aliceAddr, bobAddr, 1);

      await nft.connect(bob).burn(2);

      expect(Number(await nft.totalSupply())).to.equal(1);
    });
  });

  // ---------------------------
  // Gas bound test
  // ---------------------------
  describe("Gas sanity", () => {
    it("mint + transfer within bounds", async () => {
      const tx1 = await nft.safeMint(aliceAddr, "g");
      const r1 = await tx1.wait();
      const mintGas = Number(r1.gasUsed);

      const tx2 = await nft.connect(alice).transferFrom(aliceAddr, bobAddr, 1);
      const r2 = await tx2.wait();
      const transferGas = Number(r2.gasUsed);

      expect(mintGas).to.be.lessThan(400000);
      expect(transferGas).to.be.lessThan(200000);
    });
  });
});
