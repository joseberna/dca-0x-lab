export const pt = {
    nav: {
        home: "Início"
    },
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
        checkingAllowance: "🔍 Verificando permissões...",
        waitingApproval: "Aguardando assinatura de aprovação...",
        waitingConfirmation: "⏳ Aguardando confirmação de aprovação...",
        approved: "Aprovado ✅, agora assinar criação do plano...",
        creatingPlan: "🚀 Criando plano...",
        created: "🚀 Plano criado com sucesso na blockchain",
        error: "❌ Erro: ",
    },
    errors: {
        underpriced: "⚠️ Preço de gas muito baixo. Por favor, cancele as transações pendentes no Metamask e tente novamente.",
        gasLimit: "⚠️ O contrato pode ter um erro. Verifique se você tem fundos USDC suficientes e se o contrato está corretamente implantado.",
        insufficientFunds: "💰 Fundos insuficientes para gas. Você precisa de mais ETH em sua carteira.",
        userRejected: "❌ Transação cancelada pelo usuário.",
        nonce: "🔄 Erro de sincronização no Metamask. Vá para: Configurações > Avançado > Limpar dados de atividade (Clear activity tab data). Isso resolverá o erro.",
        unknown: "Erro desconhecido"
    },
    pages: {
        myPlans: {
            title: "Meus Planos",
            budget: "Orçamento Total",
            progress: "Progresso",
            status: "Status",
            viewDetail: "Ver Detalhe",
            noPlans: "Nenhum plano encontrado. Crie seu primeiro plano DCA!",
            createPlan: "Criar Plano"
        },
        planDetail: {
            title: "Detalhe do Plano",
            id: "ID do Plano",
            token: "Token",
            budget: "Orçamento",
            interval: "Intervalo",
            progress: "Progresso",
            status: "Status",
            lastExec: "Última Execução",
            nextExec: "Próxima Execução",
            runNow: "Executar Agora",
            cancel: "Cancelar Plano",
            amountPerTick: "Valor por Compra",
            totalTicks: "Total de Compras",
            created: "Criado em"
        }
    },
    toast: {
        planCreatedTitle: "🎉 Plano Criado com Sucesso!",
        planCreatedMessage: (budget: string, token: string) => `Seu plano DCA de ${budget} USDC → ${token} foi criado e sincronizado.`,
        planCreatedPendingTitle: "Plano Criado (Sincronização Pendente)",
        planCreatedPendingMessage: "Seu plano foi criado na blockchain mas pode levar um momento para aparecer no dashboard.",
        transactionFailed: "Transação Falhou",
        transactionCancelled: "Transação Cancelada"
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
