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

const STAFF_ROLE_IDS = [
  "1538561286571434086",
  "1541124069422792925",
  "1541123399533731890",
  "1541109454341415102",
  "1538561390049239161"
];

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

client.on("interactionCreate", async (interaction) => {

  // /ticket
  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === "ticket"
  ) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Atendimento | Medusa Store")
      .setDescription(
        "➤ Após abrir um atendimento, aguarde a resposta de um membro da equipe.\n\n" +
        "➤ Os atendimentos são realizados de forma privada, mas podem ser visualizados pela equipe quando necessário.\n\n" +
        "➤ Nossa equipe fará o possível para atender você o mais rápido possível.\n\n" +
        "**Clique no botão abaixo para continuar:**"
      );

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

  // Abrir menu
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
      content: "Selecione o tipo de atendimento:",
      components: [row],
      ephemeral: true
    });

    return;
  }

  // Criar ticket
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
      middleman: "Middleman",
      suporte: "Suporte",
      outros: "Outros",
      parcerias: "Parcerias",
      recompensa: "Resgatar Recompensa",
      duvidas: "Dúvidas",
      seller: "Seller"
    };

    const channelName =
      `${categoryNames[category]}-${interaction.user.username}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

    const existingTicket = interaction.guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildText &&
        channel.topic &&
        channel.topic.includes(`USER:${interaction.user.id}`)
    );

    if (existingTicket) {
      await interaction.reply({
        content: `Você já possui um ticket aberto: ${existingTicket}`,
        ephemeral: true
      });

      return;
    }

    const permissionOverwrites = [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
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

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      topic: `USER:${interaction.user.id} | CATEGORY:${category} | CLAIMED:null`,
      permissionOverwrites
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle("🎫 Ticket | Medusa Store")
      .setDescription(
        `Olá ${interaction.user}!\n\n` +
        `**Categoria:** ${categoryDisplay[category]}\n` +
        `**Responsável:** Nenhum staff assumiu ainda.\n\n` +
        "Aguarde um membro da equipe atender você."
      );

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
      embeds: [ticketEmbed],
      components: [row]
    });

    await interaction.reply({
      content: `Seu ticket foi criado: ${channel}`,
      ephemeral: true
    });

    return;
  }

  // Assumir ticket
  if (
    interaction.isButton() &&
    interaction.customId === "claim_ticket"
  ) {
    const isStaff = STAFF_ROLE_IDS.some(roleId =>
      interaction.member.roles.cache.has(roleId)
    );

    if (!isStaff) {
      return interaction.reply({
        content: "❌ Apenas a equipe pode assumir tickets.",
        ephemeral: true
      });
    }

    const topic = interaction.channel.topic || "";
    const match = topic.match(/CLAIMED:([^ ]+)/);
    const currentClaim = match ? match[1] : "null";

    if (currentClaim !== "null") {
      return interaction.reply({
        content: `❌ Este ticket já foi assumido por <@${currentClaim}>.`,
        ephemeral: true
      });
    }

    await interaction.channel.setTopic(
      topic.replace(
        /CLAIMED:[^ ]+/,
        `CLAIMED:${interaction.user.id}`
      )
    );

    const messages = await interaction.channel.messages.fetch({
      limit: 20
    });

    const botMessage = messages.find(
      message =>
        message.author.id === client.user.id &&
        message.embeds.length > 0
    );

    if (botMessage) {
      const embed = EmbedBuilder.from(botMessage.embeds[0]);

      const description =
        botMessage.embeds[0].description || "";

      embed.setDescription(
        description.replace(
          "**Responsável:** Nenhum staff assumiu ainda.",
          `**Responsável:** ${interaction.user}`
        )
      );

      const claimButton = new ButtonBuilder()
        .setCustomId("claim_ticket")
        .setLabel("👤 Assumido")
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

      const releaseButton = new ButtonBuilder()
        .setCustomId("release_ticket")
        .setLabel("🔓 Liberar Ticket")
        .setStyle(ButtonStyle.Secondary);

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

      await botMessage.edit({
        embeds: [embed],
        components: [row]
      });
    }

    await interaction.reply(
      `👤 ${interaction.user} assumiu este ticket e agora é o responsável.`
    );

    return;
  }

  // Liberar ticket
  if (
    interaction.isButton() &&
    interaction.customId === "release_ticket"
  ) {
    const isStaff = STAFF_ROLE_IDS.some(roleId =>
      interaction.member.roles.cache.has(roleId)
    );

    if (!isStaff) {
      return interaction.reply({
        content: "❌ Apenas a equipe pode liberar tickets.",
        ephemeral: true
      });
    }

    const topic = interaction.channel.topic || "";
    const match = topic.match(/CLAIMED:([^ ]+)/);
    const currentClaim = match ? match[1] : "null";

    if (currentClaim === "null") {
      return interaction.reply({
        content: "❌ Este ticket não está assumido.",
        ephemeral: true
      });
    }

    if (currentClaim !== interaction.user.id) {
      return interaction.reply({
        content: "❌ Apenas o responsável pode liberar o ticket.",
        ephemeral: true
      });
    }

    await interaction.channel.setTopic(
      topic.replace(
        /CLAIMED:[^ ]+/,
        "CLAIMED:null"
      )
    );

    const messages = await interaction.channel.messages.fetch({
      limit: 20
    });

    const botMessage = messages.find(
      message =>
        message.author.id === client.user.id &&
        message.embeds.length > 0
    );

    if (botMessage) {
      const embed = EmbedBuilder.from(botMessage.embeds[0]);

      const description =
        botMessage.embeds[0].description || "";

      embed.setDescription(
        description.replace(
          /\*\*Responsável:\*\* .+/,
          "**Responsável:** Nenhum staff assumiu ainda."
        )
      );

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

      await botMessage.edit({
        embeds: [embed],
        components: [row]
      });
    }

    await interaction.reply(
      `🔓 ${interaction.user} liberou o ticket.`
    );

    return;
  }

  // Fechar ticket
  if (
    interaction.isButton() &&
    interaction.customId === "close_ticket"
  ) {
    const isStaff = STAFF_ROLE_IDS.some(roleId =>
      interaction.member.roles.cache.has(roleId)
    );

    const topic = interaction.channel.topic || "";
    const match = topic.match(/USER:(\d+)/);
    const ticketOwner = match ? match[1] : null;

    if (!isStaff && ticketOwner !== interaction.user.id) {
      return interaction.reply({
        content: "❌ Você não pode fechar este ticket.",
        ephemeral: true
      });
    }

    await interaction.reply(
      "🔒 Este ticket será fechado em **5 segundos**."
    );

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);

    return;
  }
});

client.login(TOKEN);
