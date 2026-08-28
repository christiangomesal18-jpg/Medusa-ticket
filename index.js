const {
    Client,
    GatewayIntentBits,
    Partials,
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

// =====================================================
// VARIABLES
// =====================================================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// =====================================================
// CLIENT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// =====================================================
// VERIFICAR STAFF
// =====================================================

function isStaff(member) {
    return (
        member.permissions.has(PermissionFlagsBits.Administrator) ||
        member.permissions.has(PermissionFlagsBits.ManageChannels)
    );
}

// =====================================================
// READY
// =====================================================

client.once("ready", () => {
    console.log("=================================");
    console.log(`✅ Bot online: ${client.user.tag}`);
    console.log(`🆔 Client ID: ${CLIENT_ID}`);
    console.log("=================================");
});

// =====================================================
// PAINEL
// =====================================================

async function enviarPainel(channel) {

    const embed = new EmbedBuilder()
        .setTitle("🎫 CENTRAL DE ATENDIMENTO")
        .setDescription(
            "Bem-vindo ao atendimento da **Medusa Store**!\n\n" +

            "Selecione abaixo o assunto que deseja tratar.\n\n" +

            "╭━━━━━━━━━━━━━━━━━━━━━━╮\n" +
            "⚡ **Middleman**\n" +
            "Solicitar um Middleman.\n\n" +

            "🛠️ **Suporte**\n" +
            "Precisa de ajuda?\n\n" +

            "📦 **Outros**\n" +
            "Outros assuntos.\n\n" +

            "🤝 **Parcerias**\n" +
            "Solicitar parceria.\n\n" +

            "🎁 **Resgatar Recompensa**\n" +
            "Resgatar sua recompensa.\n\n" +

            "❓ **Dúvidas**\n" +
            "Tire suas dúvidas.\n\n" +

            "🛒 **Seller**\n" +
            "Assuntos relacionados a vendas.\n" +
            "╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n" +

            "🔒 **Atendimento seguro e organizado pela Staff.**"
        )
        .setColor("#6A0DAD")
        .setFooter({
            text: "Medusa Store • Atendimento"
        });

    const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_categoria")
        .setPlaceholder("🎫 Selecione uma categoria")
        .addOptions([
            {
                label: "Middleman",
                description: "Solicitar um Middleman",
                value: "middleman",
                emoji: "⚡"
            },
            {
                label: "Suporte",
                description: "Precisa de ajuda",
                value: "suporte",
                emoji: "🛠️"
            },
            {
                label: "Outros",
                description: "Outros assuntos",
                value: "outros",
                emoji: "📦"
            },
            {
                label: "Parcerias",
                description: "Solicitar parceria",
                value: "parcerias",
                emoji: "🤝"
            },
            {
                label: "Resgatar Recompensa",
                description: "Resgatar sua recompensa",
                value: "recompensa",
                emoji: "🎁"
            },
            {
                label: "Dúvidas",
                description: "Tirar dúvidas",
                value: "duvidas",
                emoji: "❓"
            },
            {
                label: "Seller",
                description: "Assuntos relacionados a vendas",
                value: "seller",
                emoji: "🛒"
            }
        ]);

    const row = new ActionRowBuilder()
        .addComponents(menu);

    await channel.send({
        embeds: [embed],
        components: [row]
    });
}

// =====================================================
// CRIAR TICKET
// =====================================================

async function criarTicket(interaction, categoria) {

    const guild = interaction.guild;

    // Verificar se já existe ticket
    const ticketExistente = guild.channels.cache.find(
        channel =>
            channel.type === ChannelType.GuildText &&
            channel.topic === `ticket-${interaction.user.id}`
    );

    if (ticketExistente) {

        return interaction.reply({
            content:
                `❌ Você já possui um ticket aberto: ${ticketExistente}`,
            ephemeral: true
        });
    }

    const nomes = {
        middleman: "middleman",
        suporte: "suporte",
        outros: "outros",
        parcerias: "parceria",
        recompensa: "recompensa",
        duvidas: "duvidas",
        seller: "seller"
    };

    const nome = nomes[categoria] || "ticket";

    // Criar ticket sem categoria
    const canal = await guild.channels.create({

        name: `${nome}-${interaction.user.username}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 90),

        type: ChannelType.GuildText,

        topic: `ticket-${interaction.user.id}`,

        permissionOverwrites: [

            // @everyone não vê
            {
                id: guild.roles.everyone.id,

                deny: [
                    PermissionFlagsBits.ViewChannel
                ]
            },

            // Usuário que abriu
            {
                id: interaction.user.id,

                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles
                ]
            }
        ]
    });

    const embed = new EmbedBuilder()
        .setTitle("🎫 TICKET ABERTO")
        .setDescription(
            `Olá ${interaction.user}!\n\n` +

            "Seu ticket foi criado com sucesso.\n\n" +

            `📌 **Categoria:** ${nome}\n` +
            `👤 **Usuário:** ${interaction.user}\n\n` +

            "Aguarde um membro da Staff para realizar seu atendimento.\n\n" +

            "╭━━━━━━━━━━━━━━━━━━━━━━╮\n" +
            "👑 **ASSUMIR**\n" +
            "Staff assume o atendimento.\n\n" +

            "🔓 **LIBERAR**\n" +
            "Libera o atendimento.\n\n" +

            "👤 **ADICIONAR**\n" +
            "Adiciona outro usuário pelo ID.\n\n" +

            "🔒 **FECHAR**\n" +
            "Fecha o ticket.\n" +
            "╰━━━━━━━━━━━━━━━━━━━━━━╯"
        )
        .setColor("#6A0DAD")
        .setFooter({
            text: "Medusa Store • Atendimento"
        });

    const botoes = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("assumir_ticket")
                .setLabel("Assumir")
                .setEmoji("👑")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("liberar_ticket")
                .setLabel("Liberar")
                .setEmoji("🔓")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("adicionar_membro")
                .setLabel("Adicionar")
                .setEmoji("👤")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("fechar_ticket")
                .setLabel("Fechar")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger)
        );

    await canal.send({
        content: `${interaction.user}`,
        embeds: [embed],
        components: [botoes]
    });

    await interaction.reply({
        content: `✅ Seu ticket foi criado: ${canal}`,
        ephemeral: true
    });
}

// =====================================================
// INTERAÇÕES
// =====================================================

client.on("interactionCreate", async interaction => {

    try {

        // =================================================
        // SELECT MENU
        // =================================================

        if (
            interaction.isStringSelectMenu() &&
            interaction.customId === "ticket_categoria"
        ) {

            const categoria = interaction.values[0];

            await criarTicket(
                interaction,
                categoria
            );

            return;
        }

        // =================================================
        // BOTÕES
        // =================================================

        if (interaction.isButton()) {

            // =============================================
            // ASSUMIR
            // =============================================

            if (interaction.customId === "assumir_ticket") {

                if (!isStaff(interaction.member)) {

                    return interaction.reply({
                        content:
                            "❌ Você precisa ser Staff para assumir este ticket.",
                        ephemeral: true
                    });
                }

                await interaction.channel.setTopic(
                    `${interaction.channel.topic}-assumido-${interaction.user.id}`
                ).catch(() => {});

                await interaction.reply({
                    content:
                        `👑 **${interaction.user} assumiu este ticket.**`
                });

                return;
            }

            // =============================================
            // LIBERAR
            // =============================================

            if (interaction.customId === "liberar_ticket") {

                if (!isStaff(interaction.member)) {

                    return interaction.reply({
                        content:
                            "❌ Você precisa ser Staff para liberar este ticket.",
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content:
                        "🔓 **Ticket liberado!** A Staff pode assumir novamente."
                });

                return;
            }

            // =============================================
            // ADICIONAR
            // =============================================

            if (interaction.customId === "adicionar_membro") {

                if (!isStaff(interaction.member)) {

                    return interaction.reply({
                        content:
                            "❌ Apenas a Staff pode adicionar membros.",
                        ephemeral: true
                    });
                }

                const modal = new ModalBuilder()
                    .setCustomId("modal_adicionar_membro")
                    .setTitle("👤 Adicionar membro");

                const input = new TextInputBuilder()
                    .setCustomId("usuario_id")
                    .setLabel("ID do usuário")
                    .setPlaceholder(
                        "Ex: 123456789012345678"
                    )
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(17)
                    .setMaxLength(20);

                const row = new ActionRowBuilder()
                    .addComponents(input);

                modal.addComponents(row);

                await interaction.showModal(modal);

                return;
            }

            // =============================================
            // FECHAR
            // =============================================

            if (interaction.customId === "fechar_ticket") {

                if (!isStaff(interaction.member)) {

                    return interaction.reply({
                        content:
                            "❌ Apenas a Staff pode fechar tickets.",
                        ephemeral: true
                    });
                }

                await interaction.reply({
                    content:
                        "🔒 **Ticket será fechado em 5 segundos...**"
                });

                setTimeout(async () => {

                    try {
                        await interaction.channel.delete();
                    } catch (error) {
                        console.error(
                            "Erro ao apagar ticket:",
                            error
                        );
                    }

                }, 5000);

                return;
            }
        }

        // =================================================
        // MODAL ADICIONAR MEMBRO
        // =================================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_adicionar_membro"
        ) {

            if (!isStaff(interaction.member)) {

                return interaction.reply({
                    content:
                        "❌ Apenas a Staff pode adicionar membros.",
                    ephemeral: true
                });
            }

            const userId = interaction.fields
                .getTextInputValue("usuario_id")
                .trim();

            // Verificar ID
            if (!/^\d{17,20}$/.test(userId)) {

                return interaction.reply({
                    content:
                        "❌ O ID informado é inválido.",
                    ephemeral: true
                });
            }

            let membro;

            try {

                membro =
                    await interaction.guild.members.fetch(
                        userId
                    );

            } catch (error) {

                return interaction.reply({
                    content:
                        "❌ Não encontrei esse usuário no servidor.\n\n" +
                        "Verifique se o ID está correto.",
                    ephemeral: true
                });
            }

            // Adicionar permissões
            await interaction.channel.permissionOverwrites.edit(
                membro.id,
                {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    AttachFiles: true
                }
            );

            await interaction.reply({
                content:
                    `✅ ${membro} foi adicionado ao ticket!`
            });

            await interaction.channel.send({
                content:
                    `👤 ${membro} foi adicionado ao ticket por ${interaction.user}.`
            });

            return;
        }

    } catch (error) {

        console.error(
            "❌ ERRO NA INTERAÇÃO:",
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({
                content:
                    "❌ Ocorreu um erro ao executar essa ação.",
                ephemeral: true
            }).catch(() => {});
        }
    }
});

// =====================================================
// COMANDO !painel
// =====================================================

client.on("messageCreate", async message => {

    if (message.author.bot) return;

    if (message.content !== "!painel") return;

    if (!isStaff(message.member)) {

        return message.reply(
            "❌ Você precisa ter permissão de Staff para usar esse comando."
        );
    }

    await enviarPainel(message.channel);

    await message.delete().catch(() => {});
});

// =====================================================
// LOGIN
// =====================================================

if (!TOKEN) {
    console.error(
        "❌ A variável TOKEN não foi encontrada!"
    );

    process.exit(1);
}

if (!CLIENT_ID) {
    console.error(
        "❌ A variável CLIENT_ID não foi encontrada!"
    );

    process.exit(1);
}

client.login(TOKEN);
