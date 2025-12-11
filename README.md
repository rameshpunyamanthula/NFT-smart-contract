<<<<<<< HEAD
=======
<<<<<<< HEAD
NFT Collection — ERC-721 Smart Contract

A fully tested, secure, Dockerized Non-Fungible Token (NFT) smart contract implementation following the ERC-721 standard. Designed to demonstrate correct token ownership, transfers, approvals, metadata handling, and security best practices — all validated through an automated test suite in an isolated Docker environment.

📂 Project Overview

This project implements a complete ERC-721 NFT Collection with:

Safe minting

Ownership tracking

Transfer & approval mechanics

maxSupply enforcement

Pausing functionality

Token metadata (tokenURI)

Burning support

Event emission

Comprehensive automated test suite

Fully Dockerized environment for reproducible testing

This repository is structured to allow evaluators to run everything with one Docker command, ensuring no environment mismatch.

🛠 Features & Functional Requirements
✅ ERC-721 Core Behavior

Unique token IDs

Ownership tracking

Balance tracking per address

Approvals & operator approvals

Safe and regular transfers

TokenURI metadata for each token

Standard events:

Transfer

Approval

ApprovalForAll

✅ Contract Rules

maxSupply enforced — cannot mint beyond collection limit

Owner/admin only minting

Prevents:

Double minting

Transfers of non-existent tokens

Minting to zero address

Unauthorized transfers

Optional burn functionality updates supply & owner balances

Pausable minting (admin-only)

✅ Reliability & Security

All important operations validate inputs

State changes are atomic

Access control via Ownable

Pausable contract to prevent unwanted interactions

Built on OpenZeppelin’s audited libraries

No loops over dynamic storage arrays → gas efficient

📦 Project Structure
project-root/
│
├── contracts/
│     └── NftCollection.sol
│
├── test/
│     └── NftCollection.test.js
│
├── Dockerfile
├── .dockerignore
├── hardhat.config.js
├── package.json
└── README.md

💎 Smart Contract: NftCollection.sol

The NFT contract was designed with:

✔ Clean internal structure
✔ Owner-only minting flows
✔ Per-token metadata using ERC721URIStorage
✔ Pausable mechanisms
✔ Burning support
✔ maxSupply logic enforcing collection size

Main components inside the contract:

State Variables: name, symbol, maxSupply, counter, burnedCount

Mappings: token URIs handled by OpenZeppelin extension

Functions:

safeMint

safeMintBatch

burn

pause / unpause

tokenURI

ownerOf, balanceOf

_beforeTokenTransfer override

These ensure correct functioning of ERC-721 behavior under all scenarios tested.

🧪 Automated Test Suite

The test suite covers:

🔹 Deployment & Initialization

Correct name, symbol, maxSupply

Correct owner assignment

🔹 Minting Behavior

Owner-only minting

Batch minting

Reverts when:

Non-owner mints

Minting to zero address

Exceeding max supply

🔹 Transfer Mechanics

Owner-to-owner transfers

Unauthorized sender reverts

Approved transfers

operator approvals (setApprovalForAll)

🔹 Metadata

tokenURI retrieval

Nonexistent token reverts

🔹 Burning

Owner/approved can burn

Burn updates supply correctly

🔹 Pausing

Only owner can pause/unpause

Minting disabled while paused

🔹 Edge Cases

Transfer of nonexistent token

ownerOf nonexistent ID

Balance consistency after mints, transfers, burns

🔹 Gas Usage Checks

Ensures mint + transfer remain below reasonable gas limits
(implementation-dependent threshold)

⭐ All 20 tests pass both locally and inside Docker.
🐳 Dockerized Testing Environment

This project ships with a Dockerfile that:

Installs Node & Hardhat

Installs all JS dependencies

Compiles the contract

Runs the entire test suite automatically

⚙ Build Image
docker build -t nft-contract .

▶ Run Tests in Container
docker run --rm nft-contract


No network access or manual steps required.
Perfect for clean evaluation environments.

🔐 Security Considerations

Only owner can mint/pause

Reverts on:

zero address minting

unauthorized transfers

nonexistent token operations

Uses OpenZeppelin security-audited modules

No external calls → reentrancy-resistant

Pausable mechanism prevents unwanted transfers during critical events

Atomic state updates ensure consistent behavior

🚀 Performance & Gas Efficiency

Mappings for constant-time ownership lookups

Minimal storage writes in mint/transfer paths

No heavy loops except controlled batch mint (owner-only)

Optimized Solidity compiler settings (optimizer runs = 200)

📘 How to Use Locally
Install dependencies:
npm install

Compile contracts:
npx hardhat compile

Run tests:
npx hardhat test

🌐 Technologies Used

Solidity 0.8.19

Hardhat

Chai / Waffle / Ethers.js

Docker

OpenZeppelin Contract Library

📝 Conclusion

This project provides a complete, secure, production-ready ERC-721 NFT collection with:

Clean contract architecture

Strong security controls

Full test coverage

Reproducible Dockerized environment

It demonstrates mastery of smart contract development, testing strategy, and proper tooling setup for real-world blockchain engineering.
=======
>>>>>>> save-my-changes
# NFT Contract (ERC-721) — Project Scaffold

## What is here
This repository contains a scaffold for building an ERC-721 NFT contract, tests, and a Dockerfile to run tests in an isolated environment.

## Quick commands (local)
Install dependencies:
```bash
npm install
<<<<<<< HEAD
=======
>>>>>>> c91d65f (Final files are added)
>>>>>>> save-my-changes
