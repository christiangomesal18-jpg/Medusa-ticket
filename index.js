const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

// ===============================
// PAINEL
// ===============================

function painel() {
  const embed = new EmbedBuilder()
    .setTitle("🎫 CENTRAL DE ATENDIMENTO")
    .setDescription(
      "Bem-vindo ao atendimento da **Medusa Store**!\n\n" +
      "Selecione uma opção abaixo para abrir seu ticket."
    )
    .setColor(0x6a0dad);

  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket_menu")
    .setPlaceholder("🎫 Selecione uma categoria")
    .addOptions(
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
    );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(menu)
    ]
  };
}

// ===============================
// CRIAR TICKET
// ===============================

async function criarTicket(interaction, categoria) {
  const guild = interaction.guild;

  const existente = guild.channels.cache.find(
    c => c.topic === `ticket-${interaction.user.id}`
  );

  if (existente) {
    return interaction.reply({
      content: `❌ Você já possui um ticket aberto: ${existente}`,
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

  const canal = await guild.channels.create({
    name: `${nome}-${interaction.user.username}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 90),

    type: ChannelType.GuildText,

    topic: `ticket-${interaction.user.id}`,

    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
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
      "Seu ticket foi criado.\n\n" +
      `📌 **Categoria:** ${nome}\n` +
      `👤 **Usuário:** ${interaction.user}\n\n` +
      "Aguarde a Staff para ser atendido."
    )
    .setColor(0x6a0dad);

  const botoes = new ActionRowBuilder().addComponents(
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
    content: `✅ Ticket criado: ${canal}`,
    ephemeral: true
  });
}

// ===============================
// INTERAÇÕES
// ===============================

client.on("interactionCreate", async interaction => {
  try {

    // MENU
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "ticket_menu"
    ) {
      await criarTicket(
        interaction,
        interaction.values[0]
      );

      return;
    }

    // BOTÕES
    if (interaction.isButton()) {

      // ASSUMIR
      if (interaction.customId === "assumir_ticket") {
        await interaction.reply({
          content: `👑 ${interaction.user} assumiu este ticket.`
        });
        return;
      }

      // LIBERAR
      if (interaction.customId === "liberar_ticket") {
        await interaction.reply({
          content: "🔓 Ticket liberado."
        });
        return;
      }

      // ADICIONAR
      if (interaction.customId === "adicionar_membro") {

        const modal = new ModalBuilder()
          .setCustomId("adicionar_modal")
          .setTitle("👤 Adicionar membro");

        const input = new TextInputBuilder()
          .setCustomId("usuario_id")
          .setLabel("ID do usuário")
          .setPlaceholder("Digite o ID do usuário")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(input)
        );

        await interaction.showModal(modal);
        return;
      }

      // FECHAR
      if (interaction.customId === "fechar_ticket") {

        await interaction.reply({
          content: "🔒 Ticket será fechado em 5 segundos."
        });

        setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 5000);

        return;
      }
    }

    // MODAL
    if (
      interaction.isModalSubmit() &&
      interaction.customId === "adicionar_modal"
    ) {

      const userId =
        interaction.fields.getTextInputValue("usuario_id").trim();

      if (!/^\d{17,20}$/.test(userId)) {
        return interaction.reply({
          content: "❌ ID inválido.",
          ephemeral: true
        });
      }

      let membro;

      try {
        membro = await interaction.guild.members.fetch(userId);
      } catch {
        return interaction.reply({
          content:
            "❌ Não encontrei esse usuário no servidor.",
          ephemeral: true
        });
      }

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
        content: `✅ ${membro} foi adicionado ao ticket!`
      });

      await interaction.channel.send({
        content:
          `👤 ${membro} foi adicionado por ${interaction.user}.`
      });
    }

  } catch (error) {
    console.error("ERRO:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Ocorreu um erro.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

// ===============================
// COMANDO !PAINEL
// ===============================

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (message.content.toLowerCase() === "!painel") {
    await message.channel.send(painel());
  }

});

// ===============================
// LOGIN
// ===============================

if (!TOKEN) {
  console.log("❌ TOKEN não encontrado.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.log("❌ CLIENT_ID não encontrado.");
  process.exit(1);
}

client.login(TOKEN);
