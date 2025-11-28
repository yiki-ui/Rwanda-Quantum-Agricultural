import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

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

    // Get tier prices and credits
    const starterPrice = await contract.getTierPrice(0);
    const proPrice = await contract.getTierPrice(1);
    const teamsPrice = await contract.getTierPrice(2);

    const starterCredits = await contract.getTierCredits(0);
    const proCredits = await contract.getTierCredits(1);
    const teamsCredits = await contract.getTierCredits(2);

    // Prepare deployment info
    const deploymentInfo = {
        network: process.env.HARDHAT_NETWORK || "localhost",
        contractAddress,
        adminAddress: deployer.address,
        tiers: {
            starter: {
                price: ethers.formatEther(starterPrice),
                credits: starterCredits.toString(),
                priceWei: starterPrice.toString()
            },
            pro: {
                price: ethers.formatEther(proPrice),
                credits: proCredits.toString(),
                priceWei: proPrice.toString()
            },
            teams: {
                price: ethers.formatEther(teamsPrice),
                credits: teamsCredits.toString(),
                priceWei: teamsPrice.toString()
            },
        },
        timestamp: new Date().toISOString(),
    };

    // Save deployment info to frontend
    const frontendDir = path.join(__dirname, "../../frontend/src/contracts");

    // Create directory if it doesn't exist
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }

    // Save deployment info
    const deploymentPath = path.join(frontendDir, "deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n✅ Deployment info saved to:", deploymentPath);

    // Copy ABI to frontend
    const artifactPath = path.join(__dirname, "../artifacts/src/AgriculturalPaymentSystem.sol/AgriculturalPaymentSystem.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const abiPath = path.join(frontendDir, "AgriculturalPaymentSystem.json");
    fs.writeFileSync(abiPath, JSON.stringify({ abi: artifact.abi }, null, 2));
    console.log("✅ Contract ABI saved to:", abiPath);

    console.log("\n📝 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    return contractAddress;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
