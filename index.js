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
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

// ========================================
// CARGOS DA STAFF
// ========================================

const STAFF_ROLE_IDS = [
  "1538561286571434086",
  "1541124069422792925",
  "1541123399533731890",
  "1541109454341415102",
  "1538561390049239161"
];

// ========================================
// VERIFICAR STAFF
// ========================================

function isStaff(interaction) {
  return STAFF_ROLE_IDS.some(roleId =>
    interaction.member.roles.cache.has(roleId)
  );
}

// ========================================
// BOT ONLINE
// ========================================

client.once("ready", async () => {
  console.log(`Bot online como ${client.user.tag}`);

  const command = new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Envia o painel de atendimento da Medusa Store.");

  const rest = new REST({
    version: "10"
  }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      {
        body: [command.toJSON()]
      }
    );

    console.log("Comando /ticket registrado!");
  } catch (error) {
    console.error("Erro ao registrar comando:", error);
  }
});

// ========================================
// INTERAÇÕES
// ========================================

client.on("interactionCreate", async interaction => {

  // ======================================
  // /TICKET
  // ======================================

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
        "Selecione uma das opções abaixo para iniciar seu atendimento. " +
        "Após abrir o ticket, explique sua situação e aguarde nossa equipe.\n\n" +

        "**🔒 PRIVACIDADE**\n" +
        "Todos os atendimentos são realizados em canais privados.\n\n" +

        "**⚠️ ATENÇÃO**\n" +
        "Evite abrir tickets duplicados ou desnecessários.\n\n" +

        "━━━━━━━━━━━━━━━━━━━━\n\n" +

        "**➡️ Clique abaixo para visualizar as opções de atendimento.**"
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

  // ======================================
  // ABRIR MENU
  // ======================================

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

    await interaction.reply({
      content: "🎫 **Selecione o tipo de atendimento:**",
      components: [
        new ActionRowBuilder().addComponents(menu)
      ],
      ephemeral: true
    });

    return;
  }

  // ======================================
  // CRIAR TICKET
  // ======================================

  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "ticket_category"
  ) {

    const category = interaction.values[0];

    const names = {
      middleman: "middleman",
      suporte: "suporte",
      outros: "outros",
      parcerias: "parcerias",
      recompensa: "recompensa",
      duvidas: "duvidas",
      seller: "seller"
    };

    const display = {
      middleman: "⚡ Middleman",
      suporte: "🛠️ Suporte",
      outros: "📦 Outros",
      parcerias: "🤝 Parcerias",
      recompensa: "🎁 Resgatar Recompensa",
      duvidas: "❓ Dúvidas",
      seller: "🛒 Seller"
    };

    // Impedir ticket duplicado

    const existingTicket =
      interaction.guild.channels.cache.find(
        channel =>
          channel.type === ChannelType.GuildText &&
          channel.topic &&
          channel.topic.includes(
            `USER:${interaction.user.id}`
          )
      );

    if (existingTicket) {

      return interaction.reply({
        content:
          `❌ Você já possui um ticket aberto: ${existingTicket}`,
        ephemeral: true
      });
    }

    // ====================================
    // PERMISSÕES
    // ====================================

    const permissions = [
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

    // ====================================
    // CRIAR CANAL
    // ====================================

    const channel =
      await interaction.guild.channels.create({

        name:
          `${names[category]}-${interaction.user.username}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, ""),

        type: ChannelType.GuildText,

        topic:
          `USER:${interaction.user.id} | ` +
          `CATEGORY:${category} | ` +
          `CLAIMED:null`,

        permissionOverwrites: permissions
      });

    // ====================================
    // EMBED DO TICKET
    // ====================================

    const ticketEmbed = new EmbedBuilder()
      .setTitle("🎫・ATENDIMENTO | MEDUSA STORE")
      .setDescription(

        `Olá ${interaction.user}!\n\n` +

        `**📂 Categoria**\n` +
        `${display[category]}\n\n` +

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

    // ====================================
    // BOTÕES
    // ====================================

    const row =
      new ActionRowBuilder()
        .addComponents(

          new ButtonBuilder()
            .setCustomId("claim_ticket")
            .setLabel("👤 Assumir")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("add_member")
            .setLabel("➕ Adicionar Membro")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("release_ticket")
            .setLabel("🔓 Liberar")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("🔒 Fechar")
            .setStyle(ButtonStyle.Danger)
        );

    const staffMentions =
      STAFF_ROLE_IDS
        .map(id => `<@&${id}>`)
        .join(" ");

    await channel.send({

      content:
        `${interaction.user} ${staffMentions}`,

      embeds: [
        ticketEmbed
      ],

      components: [
        row
      ]
    });

    await interaction.reply({

      content:
        `✅ Seu ticket foi criado: ${channel}`,

      ephemeral: true
    });

    return;
  }

  // ======================================
  // ASSUMIR TICKET
  // ======================================

  if (
    interaction.isButton() &&
    interaction.customId === "claim_ticket"
  ) {

    if (!isStaff(interaction)) {

      return interaction.reply({
        content:
          "❌ Apenas a equipe pode assumir tickets.",
        ephemeral: true
      });
    }

    const topic =
      interaction.channel.topic || "";

    const match =
      topic.match(/CLAIMED:([^ ]+)/);

    const claimed =
      match ? match[1] : "null";

    if (claimed !== "null") {

      return interaction.reply({
        content:
          `❌ Este ticket já foi assumido por <@${claimed}>.`,
        ephemeral: true
      });
    }

    // Salvar responsável

    const newTopic =
      topic.replace(
        /CLAIMED:[^ ]+/,
        `CLAIMED:${interaction.user.id}`
      );

    await interaction.channel.setTopic(newTopic);

    // Procurar mensagem principal

    const messages =
      await interaction.channel.messages.fetch({
        limit: 20
      });

    const ticketMessage =
      messages.find(
        message =>
          message.author.id === client.user.id &&
          message.embeds.length > 0
      );

    if (ticketMessage) {

      const oldEmbed =
        ticketMessage.embeds[0];

      const oldDescription =
        oldEmbed.description || "";

      // Atualizar responsável

      const newDescription =
        oldDescription.replace(
          /(\*\*👤 Responsável\*\*\n)(.*)/,
          `$1${interaction.user}`
        );

      const newEmbed =
        EmbedBuilder
          .from(oldEmbed)
          .setDescription(newDescription);

      // Novos botões

      const claimButton =
        new ButtonBuilder()
          .setCustomId("claim_ticket")
          .setLabel("👤 Assumido")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);

      const addButton =
        new ButtonBuilder()
          .setCustomId("add_member")
          .setLabel("➕ Adicionar Membro")
          .setStyle(ButtonStyle.Primary);

      const releaseButton =
        new ButtonBuilder()
          .setCustomId("release_ticket")
          .setLabel("🔓 Liberar")
          .setStyle(ButtonStyle.Secondary);

      const closeButton =
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("🔒 Fechar")
          .setStyle(ButtonStyle.Danger);

      const newRow =
        new ActionRowBuilder()
          .addComponents(
            claimButton,
            addButton,
            releaseButton,
            closeButton
          );

      await ticketMessage.edit({
        embeds: [newEmbed],
        components: [newRow]
      });
    }

    await interaction.reply(
      `👤 ${interaction.user} **assumiu este ticket** e agora é o responsável pelo atendimento.`
    );

    return;
  }

  // ======================================
  // ADICIONAR MEMBRO
  // ======================================

  if (
    interaction.isButton() &&
    interaction.customId === "add_member"
  ) {

    if (!isStaff(interaction)) {

      return interaction.reply({
        content:
          "❌ Apenas a equipe pode adicionar membros.",
        ephemeral: true
      });
    }

    const modal =
      new ModalBuilder()
        .setCustomId("add_member_modal")
        .setTitle("Adicionar Membro");

    const input =
      new TextInputBuilder()
        .setCustomId("user_id")
        .setLabel("ID do usuário")
        .setPlaceholder(
          "Ex: 123456789012345678"
        )
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(17)
        .setMaxLength(20);

    modal.addComponents(
      new ActionRowBuilder()
        .addComponents(input)
    );

    await interaction.showModal(modal);

    return;
  }

  // ======================================
  // MODAL ADICIONAR MEMBRO
  // ======================================

  if (
    interaction.isModalSubmit() &&
    interaction.customId === "add_member_modal"
  ) {

    if (!isStaff(interaction)) {

      return interaction.reply({
        content:
          "❌ Apenas a equipe pode adicionar membros.",
        ephemeral: true
      });
    }

    const userId =
      interaction.fields
        .getTextInputValue("user_id")
        .trim();

    try {

      const member =
        await interaction.guild.members.fetch(userId);

      await interaction.channel
        .permissionOverwrites.edit(
          member.id,
          {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
          }
        );

      await interaction.reply(
        `✅ ${member} foi adicionado ao ticket.`
      );

    } catch (error) {

      console.error(error);

      await interaction.reply({
        content:
          "❌ Não encontrei esse usuário neste servidor. Verifique o ID.",
        ephemeral: true
      });
    }

    return;
  }

  // ======================================
  // LIBERAR TICKET
  // ======================================

  if (
    interaction.isButton() &&
    interaction.customId === "release_ticket"
  ) {

    if (!isStaff(interaction)) {

      return interaction.reply({
        content:
          "❌ Apenas a equipe pode liberar tickets.",
        ephemeral: true
      });
    }

    const topic =
      interaction.channel.topic || "";

    const match =
      topic.match(/CLAIMED:([^ ]+)/);

    const claimed =
      match ? match[1] : "null";

    if (claimed === "null") {

      return interaction.reply({
        content:
          "❌ Este ticket não está assumido.",
        ephemeral: true
      });
    }

    // Somente quem assumiu pode liberar

    if (claimed !== interaction.user.id) {

      return interaction.reply({
        content:
          "❌ Apenas o staff responsável pode liberar este ticket.",
        ephemeral: true
      });
    }

    await interaction.channel.setTopic(
      topic.replace(
        /CLAIMED:[^ ]+/,
        "CLAIMED:null"
      )
    );

    // Procurar painel

    const messages =
      await interaction.channel.messages.fetch({
        limit: 20
      });

    const ticketMessage =
      messages.find(
        message =>
          message.author.id === client.user.id &&
          message.embeds.length > 0
      );

    if (ticketMessage) {

      const oldEmbed =
        ticketMessage.embeds[0];

      const oldDescription =
        oldEmbed.description || "";

      const newDescription =
        oldDescription.replace(
          /(\*\*👤 Responsável\*\*\n)(.*)/,
          "$1Nenhum staff assumiu ainda."
        );

      const newEmbed =
        EmbedBuilder
          .from(oldEmbed)
          .setDescription(newDescription);

      const claimButton =
        new ButtonBuilder()
          .setCustomId("claim_ticket")
          .setLabel("👤 Assumir")
          .setStyle(ButtonStyle.Success);

      const addButton =
        new ButtonBuilder()
          .setCustomId("add_member")
          .setLabel("➕ Adicionar Membro")
          .setStyle(ButtonStyle.Primary);

      const releaseButton =
        new ButtonBuilder()
          .setCustomId("release_ticket")
          .setLabel("🔓 Liberar")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true);

      const closeButton =
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("🔒 Fechar")
          .setStyle(ButtonStyle.Danger);

      const newRow =
        new ActionRowBuilder()
          .addComponents(
            claimButton,
            addButton,
            releaseButton,
            closeButton
          );

      await ticketMessage.edit({
        embeds: [newEmbed],
        components: [newRow]
      });
    }

    await interaction.reply(
      `🔓 ${interaction.user} **liberou o ticket**. Agora outro membro da equipe pode assumi-lo.`
    );

    return;
  }

  // ======================================
  // FECHAR TICKET
  // ======================================

  if (
    interaction.isButton() &&
    interaction.customId === "close_ticket"
  ) {

    const staff =
      isStaff(interaction);

    const topic =
      interaction.channel.topic || "";

    const match =
      topic.match(/USER:(\d+)/);

    const owner =
      match ? match[1] : null;

    if (
      !staff &&
      owner !== interaction.user.id
    ) {

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

// ========================================
// LOGIN
// ========================================

client.login(TOKEN);
