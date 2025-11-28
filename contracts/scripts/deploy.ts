import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", await deployer.getAddress());

  const ReceiptLedger = await ethers.getContractFactory("ReceiptLedger");
  const receiptLedger = await ReceiptLedger.deploy();
  await receiptLedger.waitForDeployment();
  console.log("ReceiptLedger:", await receiptLedger.getAddress());

  const MicroLoan = await ethers.getContractFactory("MicroLoan");
  const usdc = process.env.USDC_ADDRESS || "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
  const microLoan = await MicroLoan.deploy(usdc, await deployer.getAddress());
  await microLoan.waitForDeployment();
  console.log("MicroLoan:", await microLoan.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
