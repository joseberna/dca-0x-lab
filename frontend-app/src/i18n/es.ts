export const es = {
    nav: {
        home: "Inicio"
    },
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
        interval: "Intervalo",
        approveButton: "🚀 Aprobar y crear plan",
        signing: "⏳ Firmando...",
        connectWallet: "Conecta tu wallet para iniciar.",
        warning: (budget: string, divisions: string, interval: string) =>
            `⚠️ Estás a punto de aprobar el uso de ${budget || "0"} USDC para realizar ${divisions} compras automáticas cada ${interval} ${interval === "1" ? "unidad" : "unidades"}.\n\n🔐 Este servicio no custodia tus fondos. Las operaciones se ejecutan mediante contratos inteligentes verificados en Blockchain. Al aprobar este plan, autorizas al contrato DCA a utilizar tu presupuesto exclusivamente para ejecutar las compras que definiste.`,
    },
    status: {
        checkingAllowance: "🔍 Verificando permisos...",
        waitingApproval: "Esperando firma de aprobación...",
        waitingConfirmation: "⏳ Esperando confirmación de aprobación...",
        approved: "Aprobado ✅, ahora firmar creación del plan...",
        creatingPlan: "🚀 Creando plan...",
        created: "🚀 Plan creado correctamente en blockchain",
        error: "❌ Error: ",
    },
    errors: {
        underpriced: "⚠️ Gas price muy bajo. Por favor, cancela las transacciones pendientes en Metamask e intenta de nuevo.",
        gasLimit: "⚠️ El contrato puede tener un error. Verifica que tengas fondos USDC suficientes y que el contrato esté correctamente desplegado.",
        insufficientFunds: "💰 Fondos insuficientes para gas. Necesitas más ETH en tu wallet.",
        userRejected: "❌ Transacción cancelada por el usuario.",
        nonce: "🔄 Error de sincronización en Metamask. Ve a: Configuración > Avanzado > Borrar datos de actividad (Clear activity tab data). Esto solucionará el error.",
        unknown: "Error desconocido"
    },
    pages: {
        myPlans: {
            title: "Mis Planes",
            budget: "Presupuesto Total",
            progress: "Progreso",
            status: "Estado",
            viewDetail: "Ver Detalle",
            noPlans: "No tienes planes activos. ¡Crea tu primer plan DCA!",
            createPlan: "Crear Plan"
        },
        planDetail: {
            title: "Detalle del Plan",
            id: "ID del Plan",
            token: "Token",
            budget: "Presupuesto",
            interval: "Intervalo",
            progress: "Progreso",
            status: "Estado",
            lastExec: "Última Ejecución",
            nextExec: "Próxima Ejecución",
            runNow: "Ejecutar Ahora",
            cancel: "Cancelar Plan",
            amountPerTick: "Monto por Compra",
            totalTicks: "Total Compras",
            created: "Creado el"
        }
    },
    toast: {
        planCreatedTitle: "🎉 ¡Plan Creado Exitosamente!",
        planCreatedMessage: (budget: string, token: string) => `Tu plan DCA de ${budget} USDC → ${token} ha sido creado y sincronizado.`,
        planCreatedPendingTitle: "Plan Creado (Sincronización Pendiente)",
        planCreatedPendingMessage: "Tu plan fue creado en blockchain pero puede tardar un momento en aparecer en el dashboard.",
        transactionFailed: "Transacción Fallida",
        transactionCancelled: "Transacción Cancelada"
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
