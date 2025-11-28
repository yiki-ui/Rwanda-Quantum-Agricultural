import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Agricultural Payment System...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy contract
  const AgriculturalPaymentSystem = await ethers.getContractFactory("AgriculturalPaymentSystem");

  console.log("Deploying contract...");
  const contract = await AgriculturalPaymentSystem.deploy() as any;

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("✅ AgriculturalPaymentSystem deployed to:", contractAddress);

  // Initialize contract
  await contract.initialize(deployer.address);
  console.log("✅ Contract initialized");

  // Get role constants
  const ADMIN_ROLE = await contract.ADMIN_ROLE();
  const PLATFORM_ROLE = await contract.PLATFORM_ROLE();
  const FARMER_ROLE = await contract.FARMER_ROLE();

  console.log("\n📋 Role Constants:");
  console.log("ADMIN_ROLE:", ADMIN_ROLE);
  console.log("PLATFORM_ROLE:", PLATFORM_ROLE);
  console.log("FARMER_ROLE:", FARMER_ROLE);

  // Get tier prices
  console.log("\n💰 Subscription Tiers:");
  const starterPrice = await contract.getTierPrice(0); // STARTER
  const proPrice = await contract.getTierPrice(1);     // PRO
  const teamsPrice = await contract.getTierPrice(2);   // TEAMS

  console.log("Starter: $" + ethers.formatEther(starterPrice));
  console.log("Pro: $" + ethers.formatEther(proPrice));
  console.log("Teams: $" + ethers.formatEther(teamsPrice));

  // Get tier credits
  console.log("\n📊 Credits per Tier:");
  const starterCredits = await contract.getTierCredits(0);
  const proCredits = await contract.getTierCredits(1);
  const teamsCredits = await contract.getTierCredits(2);

  console.log("Starter: " + starterCredits.toString() + " credits");
  console.log("Pro: " + proCredits.toString() + " credits");
  console.log("Teams: " + teamsCredits.toString() + " credits");

  console.log("\n✨ Deployment Summary:");
  console.log("Contract Address:", contractAddress);
  console.log("Admin Address:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    network: process.env.HARDHAT_NETWORK || "localhost",
    contractAddress,
    adminAddress: deployer.address,
    tiers: {
      starter: { price: ethers.formatEther(starterPrice), credits: starterCredits.toString() },
      pro: { price: ethers.formatEther(proPrice), credits: proCredits.toString() },
      teams: { price: ethers.formatEther(teamsPrice), credits: teamsCredits.toString() },
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
