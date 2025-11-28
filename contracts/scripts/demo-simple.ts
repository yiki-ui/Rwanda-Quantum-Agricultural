import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Agricultural Payment System - Demo\n");
    console.log("=".repeat(60));

    // Get signers
    const [admin, farmer1, farmer2, farmer3] = await ethers.getSigners();

    console.log("\n👥 Demo Accounts:");
    console.log("Admin:   ", admin.address);
    console.log("Farmer1: ", farmer1.address);
    console.log("Farmer2: ", farmer2.address);
    console.log("Farmer3: ", farmer3.address);

    // Deploy contract directly (non-upgradeable for demo)
    console.log("\n📦 Deploying AgriculturalPaymentSystem...");
    const AgriculturalPaymentSystem = await ethers.getContractFactory("AgriculturalPaymentSystem");

    // Initialize with admin address
    const contract = await AgriculturalPaymentSystem.deploy() as any;
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);

    // Initialize the contract
    await contract.initialize(admin.address);
    console.log("✅ Contract initialized");

    console.log("\n" + "=".repeat(60));
    console.log("📊 DEMO 1: Subscribe to Tiers");
    console.log("=".repeat(60));

    // Demo 1: Subscribe to Starter tier
    console.log("\n1️⃣  Farmer1 subscribes to STARTER tier ($15)...");
    const starterPrice = await contract.getTierPrice(0); // STARTER
    console.log("   Price:", ethers.formatEther(starterPrice), "ETH");

    let tx = await contract.connect(farmer1).subscribe(0, { value: starterPrice });
    await tx.wait();
    console.log("   ✅ Subscription successful!");

    let sub = await contract.getSubscription(farmer1.address);
    console.log("   Tier: STARTER");
    console.log("   Credits:", sub.creditsRemaining.toString());
    console.log("   Active:", sub.active);

    // Demo 2: Subscribe to Pro tier
    console.log("\n2️⃣  Farmer2 subscribes to PRO tier ($39)...");
    const proPrice = await contract.getTierPrice(1); // PRO
    console.log("   Price:", ethers.formatEther(proPrice), "ETH");

    tx = await contract.connect(farmer2).subscribe(1, { value: proPrice });
    await tx.wait();
    console.log("   ✅ Subscription successful!");

    sub = await contract.getSubscription(farmer2.address);
    console.log("   Tier: PRO");
    console.log("   Credits:", sub.creditsRemaining.toString());
    console.log("   Active:", sub.active);

    // Demo 3: Subscribe to Teams tier
    console.log("\n3️⃣  Farmer3 subscribes to TEAMS tier ($49)...");
    const teamsPrice = await contract.getTierPrice(2); // TEAMS
    console.log("   Price:", ethers.formatEther(teamsPrice), "ETH");

    tx = await contract.connect(farmer3).subscribe(2, { value: teamsPrice });
    await tx.wait();
    console.log("   ✅ Subscription successful!");

    sub = await contract.getSubscription(farmer3.address);
    console.log("   Tier: TEAMS");
    console.log("   Credits:", sub.creditsRemaining.toString());
    console.log("   Active:", sub.active);

    console.log("\n" + "=".repeat(60));
    console.log("💳 DEMO 2: Credit Consumption");
    console.log("=".repeat(60));

    // Demo 4: Consume credits
    console.log("\n1️⃣  Farmer1 uses 30 credits for soil analysis...");
    let balance = await contract.getCreditBalance(farmer1.address);
    console.log("   Before:", balance.toString(), "credits");

    tx = await contract.connect(farmer1).consumeCredits(30, "soil_analysis");
    await tx.wait();
    console.log("   ✅ Credits consumed!");

    balance = await contract.getCreditBalance(farmer1.address);
    console.log("   After:", balance.toString(), "credits");

    // Demo 5: Consume more credits
    console.log("\n2️⃣  Farmer2 uses 100 credits for pest detection...");
    balance = await contract.getCreditBalance(farmer2.address);
    console.log("   Before:", balance.toString(), "credits");

    tx = await contract.connect(farmer2).consumeCredits(100, "pest_detection");
    await tx.wait();
    console.log("   ✅ Credits consumed!");

    balance = await contract.getCreditBalance(farmer2.address);
    console.log("   After:", balance.toString(), "credits");

    // Demo 6: Consume more credits
    console.log("\n3️⃣  Farmer3 uses 50 credits for crop recommendation...");
    balance = await contract.getCreditBalance(farmer3.address);
    console.log("   Before:", balance.toString(), "credits");

    tx = await contract.connect(farmer3).consumeCredits(50, "crop_recommendation");
    await tx.wait();
    console.log("   ✅ Credits consumed!");

    balance = await contract.getCreditBalance(farmer3.address);
    console.log("   After:", balance.toString(), "credits");

    console.log("\n" + "=".repeat(60));
    console.log("🎁 DEMO 3: Admin Bonus Credits");
    console.log("=".repeat(60));

    console.log("\n1️⃣  Admin adds 50 bonus credits to Farmer1...");
    balance = await contract.getCreditBalance(farmer1.address);
    console.log("   Before:", balance.toString(), "credits");

    tx = await contract.addBonusCredits(farmer1.address, 50);
    await tx.wait();
    console.log("   ✅ Bonus credits added!");

    balance = await contract.getCreditBalance(farmer1.address);
    console.log("   After:", balance.toString(), "credits");

    console.log("\n" + "=".repeat(60));
    console.log("📈 DEMO 4: Subscription Status");
    console.log("=".repeat(60));

    console.log("\n1️⃣  Check subscription status...");

    let isActive = await contract.isSubscriptionActive(farmer1.address);
    console.log("   Farmer1 active:", isActive);

    let expiry = await contract.getSubscriptionExpiry(farmer1.address);
    const expiryDate = new Date(Number(expiry) * 1000);
    console.log("   Farmer1 expiry:", expiryDate.toLocaleString());

    isActive = await contract.isSubscriptionActive(farmer2.address);
    console.log("   Farmer2 active:", isActive);

    expiry = await contract.getSubscriptionExpiry(farmer2.address);
    const expiryDate2 = new Date(Number(expiry) * 1000);
    console.log("   Farmer2 expiry:", expiryDate2.toLocaleString());

    console.log("\n" + "=".repeat(60));
    console.log("💰 DEMO 5: Revenue Tracking");
    console.log("=".repeat(60));

    console.log("\n1️⃣  Check total revenue...");
    const totalRevenue = await contract.totalRevenue();
    console.log("   Total Revenue:", ethers.formatEther(totalRevenue), "ETH");

    const totalSubs = await contract.totalSubscriptions();
    console.log("   Total Subscriptions:", totalSubs.toString());

    const farmer1Spent = await contract.totalSpent(farmer1.address);
    console.log("   Farmer1 total spent:", ethers.formatEther(farmer1Spent), "ETH");

    const farmer2Spent = await contract.totalSpent(farmer2.address);
    console.log("   Farmer2 total spent:", ethers.formatEther(farmer2Spent), "ETH");

    const farmer3Spent = await contract.totalSpent(farmer3.address);
    console.log("   Farmer3 total spent:", ethers.formatEther(farmer3Spent), "ETH");

    console.log("\n" + "=".repeat(60));
    console.log("🔄 DEMO 6: Subscription Renewal");
    console.log("=".repeat(60));

    console.log("\n1️⃣  Farmer1 renews subscription...");
    balance = await contract.getCreditBalance(farmer1.address);
    console.log("   Credits before renewal:", balance.toString());

    tx = await contract.connect(farmer1).renewSubscription({ value: starterPrice });
    await tx.wait();
    console.log("   ✅ Subscription renewed!");

    balance = await contract.getCreditBalance(farmer1.address);
    console.log("   Credits after renewal:", balance.toString());

    sub = await contract.getSubscription(farmer1.address);
    const newExpiry = new Date(Number(sub.endDate) * 1000);
    console.log("   New expiry:", newExpiry.toLocaleString());

    console.log("\n" + "=".repeat(60));
    console.log("❌ DEMO 7: Cancel Subscription");
    console.log("=".repeat(60));

    console.log("\n1️⃣  Farmer3 cancels subscription...");
    isActive = await contract.isSubscriptionActive(farmer3.address);
    console.log("   Active before cancel:", isActive);

    tx = await contract.connect(farmer3).cancelSubscription();
    await tx.wait();
    console.log("   ✅ Subscription cancelled!");

    isActive = await contract.isSubscriptionActive(farmer3.address);
    console.log("   Active after cancel:", isActive);

    sub = await contract.getSubscription(farmer3.address);
    console.log("   Subscription active flag:", sub.active);

    console.log("\n" + "=".repeat(60));
    console.log("⚙️  DEMO 8: Admin Controls");
    console.log("=".repeat(60));

    console.log("\n1️⃣  Update Pro tier price to 50 ETH...");
    const oldPrice = await contract.getTierPrice(1);
    console.log("   Old price:", ethers.formatEther(oldPrice), "ETH");

    const newPrice = ethers.parseEther("50");
    tx = await contract.updateTierPrice(1, newPrice);
    await tx.wait();
    console.log("   ✅ Price updated!");

    const updatedPrice = await contract.getTierPrice(1);
    console.log("   New price:", ethers.formatEther(updatedPrice), "ETH");

    console.log("\n2️⃣  Update Pro tier credits to 1000...");
    const oldCredits = await contract.getTierCredits(1);
    console.log("   Old credits:", oldCredits.toString());

    tx = await contract.updateTierCredits(1, 1000);
    await tx.wait();
    console.log("   ✅ Credits updated!");

    const updatedCredits = await contract.getTierCredits(1);
    console.log("   New credits:", updatedCredits.toString());

    console.log("\n" + "=".repeat(60));
    console.log("✨ DEMO COMPLETE!");
    console.log("=".repeat(60));

    console.log("\n📊 Final Summary:");
    console.log("✅ Contract deployed and tested");
    console.log("✅ 3 farmers subscribed to different tiers");
    console.log("✅ Credits consumed and tracked");
    console.log("✅ Bonus credits added");
    console.log("✅ Revenue tracked");
    console.log("✅ Subscriptions renewed and cancelled");
    console.log("✅ Admin controls tested");

    console.log("\n💾 Contract Address:", contractAddress);
    console.log("🔗 Ready for testnet/mainnet deployment!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
