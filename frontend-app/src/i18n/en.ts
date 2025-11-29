export const en = {
    navbar: {
        title: "💸 DCA Dashboard",
        myPlans: "My Plans",
    },
    home: {
        title: "🪙 PoC DCA Frontend",
        subtitle:
            "Set up your DCA plan on {network} and let purchases execute automatically each period.",
    },
    form: {
        title: "💰 Create DCA Plan",
        subtitle: "Set up your plan and sign from your wallet.",
        totalBudget: "Total budget (USDC)",
        targetToken: "Target cryptocurrency",
        divisions: "Number of purchases",
        interval: "Interval",
        approveButton: "🚀 Approve and create plan",
        signing: "⏳ Signing...",
        connectWallet: "Connect your wallet to get started.",
        warning: (budget: string, divisions: string, interval: string) =>
            `⚠️ You are about to approve ${budget || "0"} USDC to execute ${divisions} automated purchases every ${interval} unit(s).\n\n🔐 This service does not custody your funds. Operations are executed via verified smart contracts on Blockchain. By approving this plan, you authorize the DCA contract to use your budget exclusively for the purchases you defined.`,
    },
    status: {
        checkingAllowance: "🔍 Checking allowance...",
        waitingApproval: "Waiting for approval signature...",
        waitingConfirmation: "⏳ Waiting for approval confirmation...",
        approved: "Approved ✅, now sign plan creation...",
        creatingPlan: "🚀 Creating plan...",
        created: "🚀 Plan created successfully on blockchain",
        error: "❌ Error: ",
    },
    errors: {
        underpriced: "⚠️ Gas price too low. Please cancel pending transactions in Metamask and try again.",
        gasLimit: "⚠️ Contract may have an error. Verify you have sufficient USDC funds and the contract is correctly deployed.",
        insufficientFunds: "💰 Insufficient funds for gas. You need more ETH in your wallet.",
        userRejected: "❌ Transaction cancelled by user.",
        nonce: "🔄 Metamask synchronization error. Go to: Settings > Advanced > Clear activity tab data. This will fix the error.",
        unknown: "Unknown error"
    },
    features: {
        nonCustodial: {
            title: "Non-Custodial",
            description: "Your funds always under your control. Verified smart contracts."
        },
        automated: {
            title: "Automated",
            description: "Automatic purchases according to your strategy. No manual intervention."
        },
        transparent: {
            title: "Transparent",
            description: "Complete on-chain history. Full traceability of operations."
        }
    }
};
