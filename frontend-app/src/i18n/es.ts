export const es = {
    navbar: {
        title: "💸 DCA Dashboard",
        myPlans: "Mis Planes",
    },
    home: {
        title: "🪙 PoC DCA Frontend",
        subtitle:
            "Configura tu plan DCA en {network} y deja que las compras se ejecuten automáticamente cada período.",
    },
    form: {
        title: "💰 Crear Plan DCA",
        subtitle: "Configura tu plan y firma desde tu wallet.",
        totalBudget: "Presupuesto total (USDC)",
        targetToken: "Criptomoneda destino",
        divisions: "Número de compras",
        interval: "Intervalo (días)",
        approveButton: "🚀 Aprobar y crear plan",
        signing: "⏳ Firmando...",
        connectWallet: "Conecta tu wallet para iniciar.",
        warning: (budget: string, divisions: string, interval: string) =>
            `⚠️ Estás a punto de aprobar el uso de ${budget || "0"} USDC para realizar ${divisions} compras automáticas cada ${interval} día(s).\n\n🔐 Este servicio no custodia tus fondos. Las operaciones se ejecutan mediante contratos inteligentes verificados en Blockchain. Al aprobar este plan, autorizas al contrato DCA a utilizar tu presupuesto exclusivamente para ejecutar las compras que definiste.`,
    },
    status: {
        waitingApproval: "Esperando firma de aprobación...",
        approved: "Aprobado ✅, ahora firmar creación del plan...",
        created: "🚀 Plan creado correctamente en blockchain",
        error: "❌ Error: ",
    },
    features: {
        nonCustodial: {
            title: "Non-Custodial",
            description: "Tus fondos siempre bajo tu control. Smart contracts verificados."
        },
        automated: {
            title: "Automatizado",
            description: "Compras automáticas según tu estrategia. Sin intervención manual."
        },
        transparent: {
            title: "Transparente",
            description: "Historial completo on-chain. Trazabilidad total de operaciones."
        }
    }
};
