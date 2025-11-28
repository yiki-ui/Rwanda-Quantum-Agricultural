// Web3 Utilities for Blockchain Payment Integration
// Rwanda Quantum Agricultural Intelligence Platform

import { ethers } from 'ethers';

let provider = null;
let signer = null;
let contract = null;
let contractAddress = null;
let contractABI = null;

// Load contract deployment info
export const loadContractInfo = async () => {
    try {
        const deploymentResponse = await fetch('/src/contracts/deployment.json');
        const deployment = await deploymentResponse.json();
        contractAddress = deployment.contractAddress;

        const abiResponse = await fetch('/src/contracts/AgriculturalPaymentSystem.json');
        const abiData = await abiResponse.json();
        contractABI = abiData.abi;

        return { contractAddress, contractABI };
    } catch (error) {
        console.error('Error loading contract info:', error);
        return null;
    }
};

// Connect to MetaMask
export const connectWallet = async () => {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask not installed. Please install MetaMask to use payment features.');
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Create provider and signer
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);

        return {
            address,
            balance: ethers.formatEther(balance),
            connected: true
        };
    } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
    }
};

// Get contract instance
export const getContract = async () => {
    if (!contract) {
        if (!contractAddress || !contractABI) {
            await loadContractInfo();
        }

        if (!signer) {
            await connectWallet();
        }

        contract = new ethers.Contract(contractAddress, contractABI, signer);
    }

    return contract;
};

// Subscription Tiers
export const SubscriptionTier = {
    STARTER: 0,
    PRO: 1,
    TEAMS: 2,
    ENTERPRISE: 3
};

// Get subscription details
export const getSubscription = async (address) => {
    try {
        const contract = await getContract();
        const subscription = await contract.getSubscription(address);

        return {
            tier: Number(subscription.tier),
            startDate: Number(subscription.startDate),
            endDate: Number(subscription.endDate),
            creditsRemaining: Number(subscription.creditsRemaining),
            active: subscription.active
        };
    } catch (error) {
        console.error('Error getting subscription:', error);
        return null;
    }
};

// Get credit balance
export const getCreditBalance = async (address) => {
    try {
        const contract = await getContract();
        const balance = await contract.getCreditBalance(address);
        return Number(balance);
    } catch (error) {
        console.error('Error getting credit balance:', error);
        return 0;
    }
};

// Check if subscription is active
export const isSubscriptionActive = async (address) => {
    try {
        const contract = await getContract();
        return await contract.isSubscriptionActive(address);
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
};

// Subscribe to a tier
export const subscribe = async (tier) => {
    try {
        const contract = await getContract();
        const price = await contract.getTierPrice(tier);

        const tx = await contract.subscribe(tier, { value: price });
        console.log('Transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        return {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Error subscribing:', error);
        throw error;
    }
};

// Renew subscription
export const renewSubscription = async () => {
    try {
        const contract = await getContract();
        const signerAddress = await signer.getAddress();
        const subscription = await getSubscription(signerAddress);

        let price;
        if (subscription.tier === SubscriptionTier.ENTERPRISE) {
            // For enterprise, we need to get custom pricing
            price = await contract.enterprisePricing(signerAddress);
        } else {
            price = await contract.getTierPrice(subscription.tier);
        }

        const tx = await contract.renewSubscription({ value: price });
        const receipt = await tx.wait();

        return {
            success: true,
            transactionHash: receipt.hash
        };
    } catch (error) {
        console.error('Error renewing subscription:', error);
        throw error;
    }
};

// Cancel subscription
export const cancelSubscription = async () => {
    try {
        const contract = await getContract();
        const tx = await contract.cancelSubscription();
        const receipt = await tx.wait();

        return {
            success: true,
            transactionHash: receipt.hash
        };
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
};

// Consume credits
export const consumeCredits = async (amount, purpose) => {
    try {
        const contract = await getContract();
        const tx = await contract.consumeCredits(amount, purpose);
        const receipt = await tx.wait();

        return {
            success: true,
            transactionHash: receipt.hash
        };
    } catch (error) {
        console.error('Error consuming credits:', error);
        throw error;
    }
};

// Get tier information
export const getTierInfo = async (tier) => {
    try {
        const contract = await getContract();
        const price = await contract.getTierPrice(tier);
        const credits = await contract.getTierCredits(tier);

        return {
            price: ethers.formatEther(price),
            priceWei: price.toString(),
            credits: Number(credits)
        };
    } catch (error) {
        console.error('Error getting tier info:', error);
        return null;
    }
};

// Listen for account changes
export const onAccountsChanged = (callback) => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', callback);
    }
};

// Listen for chain changes
export const onChainChanged = (callback) => {
    if (window.ethereum) {
        window.ethereum.on('chainChanged', callback);
    }
};

// Add local Hardhat network to MetaMask
export const addHardhatNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x7A69', // 31337 in hex
                chainName: 'Hardhat Local',
                nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: null
            }]
        });
        return true;
    } catch (error) {
        console.error('Error adding Hardhat network:', error);
        return false;
    }
};

// Switch to Hardhat network
export const switchToHardhatNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }] // 31337 in hex
        });
        return true;
    } catch (error) {
        // If network doesn't exist, add it
        if (error.code === 4902) {
            return await addHardhatNetwork();
        }
        console.error('Error switching network:', error);
        return false;
    }
};
