export const pt = {
    navbar: {
        title: "💸 DCA Dashboard",
        myPlans: "Meus Planos",
    },
    home: {
        title: "🪙 PoC DCA Frontend",
        subtitle:
            "Configure seu plano DCA em {network} e deixe as compras acontecerem automaticamente a cada período.",
    },
    form: {
        title: "💰 Criar Plano DCA",
        subtitle: "Configure seu plano e assine com sua carteira.",
        totalBudget: "Orçamento total (USDC)",
        targetToken: "Criptomoeda de destino",
        divisions: "Número de compras",
        interval: "Intervalo",
        approveButton: "🚀 Aprovar e criar plano",
        signing: "⏳ Assinando...",
        connectWallet: "Conecte sua carteira para começar.",
        warning: (budget: string, divisions: string, interval: string) =>
            `⚠️ Você está prestes a aprovar o uso de ${budget || "0"} USDC para realizar ${divisions} compras automáticas a cada ${interval} unidade(s).\n\n🔐 Este serviço não custodia seus fundos. As operações são executadas por contratos inteligentes verificados na Blockchain. Ao aprovar este plano, você autoriza o contrato DCA a usar seu orçamento exclusivamente para as compras que definiu.`,
    },
    status: {
        checkingAllowance: "🔍 Verificando autorização...",
        waitingApproval: "Aguardando assinatura de aprovação...",
        waitingConfirmation: "⏳ Aguardando confirmação da transação...",
        approved: "Aprovado ✅, agora assine a criação do plano...",
        creating: "🚀 Criando plano na blockchain...",
        created: "🚀 Plano criado com sucesso na blockchain",
        syncing: "🔄 Sincronizando com banco de dados...",
        synced: "✅ Plano sincronizado com sucesso",
        error: "❌ Erro: ",
    },
    errors: {
        publicClient: "Cliente público não inicializado",
        walletNotConnected: "Carteira não conectada",
        underpriced: "⚠️ Preço do gás muito baixo. Por favor, cancele as transações pendentes no Metamask e tente novamente.",
        gasLimit: "⚠️ O contrato pode ter um erro. Verifique se você tem fundos USDC suficientes.",
        insufficientFunds: "💰 Fundos insuficientes para gás. Você precisa de mais ETH na sua carteira.",
        userRejected: "❌ Transação rejeitada pelo usuário.",
        nonce: "🔄 Erro de sincronização no Metamask. Vá para: Configurações > Avançado > Limpar dados da guia de atividade.",
        unknown: "Erro desconhecido",
        syncFailed: "Falha ao sincronizar com o backend"
    },
    features: {
        nonCustodial: {
            title: "Non-Custodial",
            description: "Seus fundos sempre sob seu controle. Smart contracts verificados."
        },
        automated: {
            title: "Automatizado",
            description: "Compras automáticas de acordo com sua estratégia. Sem intervenção manual."
        },
        transparent: {
            title: "Transparente",
            description: "Histórico completo on-chain. Rastreabilidade total das operações."
        }
    }
};
