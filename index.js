const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

// Cargos da equipe
const STAFF_ROLE_IDS = [
  "1538561286571434086",
  "1541124069422792925",
  "1541123399533731890",
  "1541109454341415102",
  "1538561390049239161"
];

// ==============================
// BOT ONLINE
// ==============================

client.once("ready", async () => {
  console.log(`Bot online como ${client.user.tag}`);

  const command = new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Envia o painel de atendimento da Medusa Store.");

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      {
        body: [command.toJSON()]
      }
    );

    console.log("Comando /ticket registrado!");
  } catch (error) {
    console.error("Erro ao registrar /ticket:", error);
  }
});

// ==============================
// INTERAÇÕES
// ==============================

client.on("interactionCreate", async (interaction) => {

  // ==============================
  // /TICKET
  // ==============================

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === "ticket"
  ) {

    const embed = new EmbedBuilder()
      .setTitle("🎫・CENTRAL DE ATENDIMENTO")
      .setDescription(
        "**MEDUSA STORE**\n\n" +

        "Seja bem-vindo à **Medusa Store**.\n\n" +

        "Nossa central de atendimento foi criada para oferecer " +
        "um suporte rápido, organizado e seguro.\n\n" +

        "**📌 COMO FUNCIONA?**\n" +
        "Selecione uma das opções abaixo e abra um atendimento " +
        "com nossa equipe. Após abrir o ticket, explique sua " +
        "situação com o máximo de detalhes possível e aguarde " +
        "um membro da equipe.\n\n" +

        "**🔒 PRIVACIDADE**\n" +
        "Todos os atendimentos são realizados em canais privados, " +
        "acessíveis apenas ao cliente e à equipe responsável.\n\n" +

        "**⚠️ ATENÇÃO**\n" +
        "Evite abrir tickets desnecessários ou duplicados. " +
        "Escolha a categoria correta para que possamos encaminhar " +
        "seu atendimento da melhor maneira.\n\n" +

        "━━━━━━━━━━━━━━━━━━━━\n\n" +

        "**➡️ Clique no botão abaixo para visualizar as opções " +
        "de atendimento.**"
      )
      .setFooter({
        text: "Medusa Store • Atendimento"
      });

    const button = new ButtonBuilder()
      .setCustomId("ticket_options")
      .setLabel("➡️ Clique aqui para ver as opções")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
      .addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });

    return;
  }

  // ==============================
  // MENU DE CATEGORIAS
  // ==============================

  if (
    interaction.isButton() &&
    interaction.customId === "ticket_options"
  ) {

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_category")
      .setPlaceholder("Selecione uma categoria")
      .addOptions(
        {
          label: "Middleman",
          description: "Solicitar um Middleman",
          emoji: "⚡",
          value: "middleman"
        },
        {
          label: "Suporte",
          description: "Precisa de ajuda?",
          emoji: "🛠️",
          value: "suporte"
        },
        {
          label: "Outros",
          description: "Outros assuntos",
          emoji: "📦",
          value: "outros"
        },
        {
          label: "Parcerias",
          description: "Solicitar parceria",
          emoji: "🤝",
          value: "parcerias"
        },
        {
          label: "Resgatar Recompensa",
          description: "Resgatar prêmio",
          emoji: "🎁",
          value: "recompensa"
        },
        {
          label: "Dúvidas",
          description: "Tirar dúvidas",
          emoji: "❓",
          value: "duvidas"
        },
        {
          label: "Seller",
          description: "Assuntos relacionados a vendas",
          emoji: "🛒",
          value: "seller"
        }
      );

    const row = new ActionRowBuilder()
      .addComponents(menu);

    await interaction.reply({
      content: "🎫 **Selecione o tipo de atendimento:**",
      components: [row],
      ephemeral: true
    });

    return;
  }

  // ==============================
  // CRIAR TICKET
  // ==============================

  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "ticket_category"
  ) {

    const category = interaction.values[0];

    const categoryNames = {
      middleman: "middleman",
      suporte: "suporte",
      outros: "outros",
      parcerias: "parcerias",
      recompensa: "recompensa",
      duvidas: "duvidas",
      seller: "seller"
    };

    const categoryDisplay = {
      middleman: "⚡ Middleman",
      suporte: "🛠️ Suporte",
      outros: "📦 Outros",
      parcerias: "🤝 Parcerias",
      recompensa: "🎁 Resgatar Recompensa",
      duvidas: "❓ Dúvidas",
      seller: "🛒 Seller"
    };

    const channelName =
      `${categoryNames[category]}-${interaction.user.username}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

    // Impede tickets duplicados
    const existingTicket = interaction.guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildText &&
        channel.topic &&
        channel.topic.includes(`USER:${interaction.user.id}`)
    );

    if (existingTicket) {

      await interaction.reply({
        content: `❌ Você já possui um ticket aberto: ${existingTicket}`,
        ephemeral: true
      });

      return;
    }

    // ==============================
    // PERMISSÕES
    // ==============================

    const permissionOverwrites = [
      {
        id: interaction.guild.id,
        deny: [
          PermissionFlagsBits.ViewChannel
        ]
      },

      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      },

      ...STAFF_ROLE_IDS.map(roleId => ({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages
        ]
      }))
    ];

    // ==============================
    // CRIAR CANAL
    // ==============================

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,

      topic:
        `USER:${interaction.user.id} | ` +
        `CATEGORY:${category} | ` +
        `CLAIMED:null`,

      permissionOverwrites
    });

    // ==============================
    // EMBED DO TICKET
    // ==============================

    const ticketEmbed = new EmbedBuilder()
      .setTitle("🎫・ATENDIMENTO | MEDUSA STORE")
      .setDescription(
        `Olá ${interaction.user}!\n\n` +

        `**📂 Categoria**\n` +
        `${categoryDisplay[category]}\n\n` +

        `**👤 Responsável**\n` +
        `Nenhum staff assumiu ainda.\n\n` +

        `**📌 Atendimento**\n` +
        `Explique sua situação com detalhes e aguarde ` +
        `um membro da equipe.\n\n` +

        `🔒 Este atendimento é privado.`
      )
      .setFooter({
        text: "Medusa Store • Sistema de Tickets"
      });

    // ==============================
    // BOTÕES
    // ==============================

    const claimButton = new ButtonBuilder()
      .setCustomId("claim_ticket")
      .setLabel("👤 Assumir Ticket")
      .setStyle(ButtonStyle.Success);

    const releaseButton = new ButtonBuilder()
      .setCustomId("release_ticket")
      .setLabel("🔓 Liberar Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 Fechar Ticket")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
      .addComponents(
        claimButton,
        releaseButton,
        closeButton
      );

    const staffMentions = STAFF_ROLE_IDS
      .map(id => `<@&${id}>`)
      .join(" ");

    await channel.send({
      content: `${interaction.user} ${staffMentions}`,

      embeds: [
        ticketEmbed
      ],

      components: [
        row
      ]
    });

    await interaction.reply({
      content: `✅ Seu ticket foi criado: ${channel}`,
      ephemeral: true
    });

    return;
  }

  // ==============================
  // ASSUMIR TICKET
  // ==============================

  if (
    interaction.isButton() &&
    interaction.customId === "claim_ticket"
  ) {

    const isStaff = STAFF_ROLE_IDS.some(roleId =>
      interaction.member.roles.cache.has(roleId)
    );

    if (!isStaff) {

      return interaction.reply({
        content: "❌ Apenas membros da equipe podem assumir tickets.",
        ephemeral: true
      });
    }

    const topic =
      interaction.channel.topic || "";

    const match =
      topic.match(/CLAIMED:([^ ]+)/);

    const currentClaim =
      match ? match[1] : "null";

    if (currentClaim !== "null") {

      return interaction.reply({
        content:
          `❌ Este ticket já foi assumido por <@${currentClaim}>.`,
        ephemeral: true
      });
    }

    // Salva o responsável
    await interaction.channel.setTopic(
      topic.replace(
        /CLAIMED:[^ ]+/,
        `CLAIMED:${interaction.user.id}`
      )
    );

    const messages =
      await interaction.channel.messages.fetch({
        limit: 20
      });

    const botMessage =
      messages.find(
        message =>
          message.author.id === client.user.id &&
          message.embeds.length > 0
      );

    if (botMessage) {

      const embed =
        EmbedBuilder.from(
          botMessage.embeds[0]
        );

      const description =
        botMessage.embeds[0].description || "";

      embed.setDescription(
        description.replace(
          "Nenhum staff assumiu ainda.",
          `${interaction.user}`
        )
      );

      const claimButton =
        new ButtonBuilder()
          .setCustomId("claim_ticket")
          .setLabel("👤 Ticket Assumido")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);

      const releaseButton =
        new ButtonBuilder()
          .setCustomId("release_ticket")
          .setLabel("🔓 Liberar Ticket")
          .setStyle(ButtonStyle.Secondary);

      const closeButton =
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("🔒 Fechar Ticket")
          .setStyle(ButtonStyle.Danger);

      const row =
        new ActionRowBuilder()
          .addComponents(
            claimButton,
            releaseButton,
            closeButton
          );

      await botMessage.edit({
        embeds: [embed],
        components: [row]
      });
    }

    await interaction.reply(
      `👤 ${interaction.user} **assumiu este ticket** e agora é o responsável pelo atendimento.`
    );

    return;
  }

  // ==============================
  // LIBERAR TICKET
  // ==============================

  if (
    interaction.isButton() &&
    interaction.customId === "release_ticket"
  ) {

    const isStaff =
      STAFF_ROLE_IDS.some(roleId =>
        interaction.member.roles.cache.has(roleId)
      );

    if (!isStaff) {

      return interaction.reply({
        content:
          "❌ Apenas membros da equipe podem liberar tickets.",
        ephemeral: true
      });
    }

    const topic =
      interaction.channel.topic || "";

    const match =
      topic.match(/CLAIMED:([^ ]+)/);

    const currentClaim =
      match ? match[1] : "null";

    if (currentClaim === "null") {

      return interaction.reply({
        content:
          "❌ Este ticket não está assumido.",
        ephemeral: true
      });
    }

    if (
      currentClaim !==
      interaction.user.id
    ) {

      return interaction.reply({
        content:
          "❌ Apenas o responsável atual pode liberar este ticket.",
        ephemeral: true
      });
    }

    await interaction.channel.setTopic(
      topic.replace(
        /CLAIMED:[^ ]+/,
        "CLAIMED:null"
      )
    );

    const messages =
      await interaction.channel.messages.fetch({
        limit: 20
      });

    const botMessage =
      messages.find(
        message =>
          message.author.id === client.user.id &&
          message.embeds.length > 0
      );

    if (botMessage) {

      const embed =
        EmbedBuilder.from(
          botMessage.embeds[0]
        );

      const description =
        botMessage.embeds[0].description || "";

      embed.setDescription(
        description.replace(
          /\*\*Responsável\*\*\n.+/,
          "**👤 Responsável**\nNenhum staff assumiu ainda."
        )
      );

      const claimButton =
        new ButtonBuilder()
          .setCustomId("claim_ticket")
          .setLabel("👤 Assumir Ticket")
          .setStyle(ButtonStyle.Success);

      const releaseButton =
        new ButtonBuilder()
          .setCustomId("release_ticket")
          .setLabel("🔓 Liberar Ticket")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true);

      const closeButton =
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("🔒 Fechar Ticket")
          .setStyle(ButtonStyle.Danger);

      const row =
        new ActionRowBuilder()
          .addComponents(
            claimButton,
            releaseButton,
            closeButton
          );

      await botMessage.edit({
        embeds: [embed],
        components: [row]
      });
    }

    await interaction.reply(
      `🔓 ${interaction.user} **liberou o ticket**. Outro membro da equipe pode assumi-lo.`
    );

    return;
  }

  // ==============================
  // FECHAR TICKET
  // ==============================

  if (
    interaction.isButton() &&
    interaction.customId === "close_ticket"
  ) {

    const isStaff =
      STAFF_ROLE_IDS.some(roleId =>
        interaction.member.roles.cache.has(roleId)
      );

    const topic =
      interaction.channel.topic || "";

    const match =
      topic.match(/USER:(\d+)/);

    const ticketOwner =
      match ? match[1] : null;

    const isOwner =
      ticketOwner === interaction.user.id;

    if (!isStaff && !isOwner) {

      return interaction.reply({
        content:
          "❌ Você não pode fechar este ticket.",
        ephemeral: true
      });
    }

    await interaction.reply(
      "🔒 Este ticket será fechado em **5 segundos**."
    );

    setTimeout(() => {

      interaction.channel
        .delete()
        .catch(() => {});

    }, 5000);

    return;
  }
});

// ==============================
// LOGIN
// ==============================

client.login(TOKEN);
