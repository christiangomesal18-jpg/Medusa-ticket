const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

// ================================
// CONFIGURAÇÃO
// ================================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ================================
// CLIENT
// ================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// ================================
// TICKETS
// ================================

const tickets = new Map();

// ================================
// CATEGORIAS
// ================================

const categorias = {

  middleman: {
    nome: 'Middleman',
    emoji: '🔐'
  },

  suporte: {
    nome: 'Suporte',
    emoji: '🛠️'
  },

  outros: {
    nome: 'Outros',
    emoji: '📦'
  },

  parceria: {
    nome: 'Parceria',
    emoji: '🤝'
  },

  recompensa: {
    nome: 'Resgatar Recompensa',
    emoji: '🎁'
  },

  duvidas: {
    nome: 'Dúvidas',
    emoji: '❓'
  },

  seller: {
    nome: 'Seller',
    emoji: '🛒'
  }

};

// ================================
// COMANDO
// ================================

const commands = [

  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Envia o painel da Medusa Ticket.')
    .toJSON()

];

// ================================
// BOT ONLINE
// ================================

client.once('clientReady', async () => {

  console.log(`🪼 BOT ONLINE: ${client.user.tag}`);

  const rest = new REST({
    version: '10'
  }).setToken(TOKEN);

  try {

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: commands
      }
    );

    console.log('✅ COMANDO /TICKET REGISTRADO');

  } catch (error) {

    console.error(
      '❌ Erro ao registrar comando:',
      error
    );

  }

});

// ================================
// INTERAÇÕES
// ================================

client.on('interactionCreate', async interaction => {

  try {

    // ==========================================
    // /TICKET
    // ==========================================

    if (
      interaction.isChatInputCommand() &&
      interaction.commandName === 'ticket'
    ) {

      const embed = new EmbedBuilder()

        .setTitle('🪼 MEDUSA TICKET')

        .setDescription(

          '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n' +
          '│      🎫 **Central de Atendimento**\n' +
          '│\n' +
          '│ Precisa de ajuda? Abra um ticket\n' +
          '│ e escolha uma das opções abaixo.\n' +
          '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +

          '╭╌╌╌⪼ 📌 **ATENDIMENTO**\n' +
          '│\n' +
          '╰╌╌╌≫ Escolha uma categoria abaixo:\n\n' +

          '🔐 **Middleman**\n' +
          '> Trocas seguras e intermediadas.\n\n' +

          '🛠️ **Suporte**\n' +
          '> Problemas ou ajuda com a loja.\n\n' +

          '📦 **Outros**\n' +
          '> Assuntos gerais.\n\n' +

          '🤝 **Parceria**\n' +
          '> Solicitações de parceria.\n\n' +

          '🎁 **Resgatar Recompensa**\n' +
          '> Resgate de prêmios e recompensas.\n\n' +

          '❓ **Dúvidas**\n' +
          '> Tire suas dúvidas com nossa equipe.\n\n' +

          '🛒 **Seller**\n' +
          '> Assuntos relacionados a vendas.\n\n' +

          '━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +

          '🔒 **Atendimento privado e organizado**\n' +
          '⚡ **Equipe pronta para atender**\n' +
          '🪼 **Medusa Store**\n\n' +

          '👇 **Clique abaixo para ver as opções**'

        )

        .setFooter({
          text: 'Medusa Store • Sistema de Tickets'
        });

      const botao = new ActionRowBuilder()
        .addComponents(

          new ButtonBuilder()
            .setCustomId('abrir_opcoes_ticket')
            .setLabel('Clique aqui para ver as opções')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Primary)

        );

      return interaction.reply({

        embeds: [embed],

        components: [botao]

      });

    }

    // ==========================================
    // ABRIR MENU
    // ==========================================

    if (
      interaction.isButton() &&
      interaction.customId === 'abrir_opcoes_ticket'
    ) {

      const menu = new StringSelectMenuBuilder()

        .setCustomId('escolher_categoria_ticket')

        .setPlaceholder(
          '🎫 Selecione uma categoria'
        )

        .addOptions(

          {
            label: 'Middleman',
            description: 'Solicitar um Middleman',
            value: 'middleman',
            emoji: '🔐'
          },

          {
            label: 'Suporte',
            description: 'Precisa de ajuda?',
            value: 'suporte',
            emoji: '🛠️'
          },

          {
            label: 'Outros',
            description: 'Outros assuntos',
            value: 'outros',
            emoji: '📦'
          },

          {
            label: 'Parceria',
            description: 'Solicitar parceria',
            value: 'parceria',
            emoji: '🤝'
          },

          {
            label: 'Resgatar Recompensa',
            description: 'Resgatar seu prêmio',
            value: 'recompensa',
            emoji: '🎁'
          },

          {
            label: 'Dúvidas',
            description: 'Tirar dúvidas',
            value: 'duvidas',
            emoji: '❓'
          },

          {
            label: 'Seller',
            description: 'Assuntos relacionados a vendas',
            value: 'seller',
            emoji: '🛒'
          }

        );

      const row = new ActionRowBuilder()
        .addComponents(menu);

      return interaction.reply({

        content:
          '🎫 **Selecione o motivo do seu atendimento:**',

        components: [row],

        ephemeral: true

      });

    }

    // ==========================================
    // CRIAR TICKET
    // ==========================================

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === 'escolher_categoria_ticket'
    ) {

      const categoria =
        interaction.values[0];

      const dados =
        categorias[categoria];

      if (!dados) {

        return interaction.reply({

          content:
            '❌ Categoria inválida.',

          ephemeral: true

        });

      }

      // Verifica se já existe ticket
      const ticketExistente =
        tickets.get(interaction.user.id);

      if (ticketExistente) {

        const canal =
          interaction.guild.channels.cache.get(
            ticketExistente.channelId
          );

        if (canal) {

          return interaction.update({

            content:
              `❌ Você já possui um ticket aberto: ${canal}`,

            components: []

          });

        }

        tickets.delete(
          interaction.user.id
        );

      }

      // Nome do canal
      const nomeCanal =
        `${categoria}-${interaction.user.username}`
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, '')
          .slice(0, 90);

      // Criar canal
      const canal =
        await interaction.guild.channels.create({

          name: nomeCanal,

          type: ChannelType.GuildText,

          permissionOverwrites: [

            {
              id:
                interaction.guild.roles.everyone.id,

              deny: [
                PermissionFlagsBits.ViewChannel
              ]

            },

            {
              id:
                interaction.user.id,

              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles
              ]

            }

          ]

        });

      tickets.set(
        interaction.user.id,
        {
          channelId: canal.id,
          category: categoria,
          claimedBy: null
        }
      );

      // Embed do ticket
      const embed =
        new EmbedBuilder()

          .setTitle(
            `${dados.emoji} ${dados.nome.toUpperCase()}`
          )

          .setDescription(

            `Olá, ${interaction.user}!\n\n` +

            `Seu atendimento de **${dados.nome}** foi criado.\n\n` +

            '╭╌╌╌⪼ 📌 **INFORMAÇÕES**\n' +
            '│\n' +
            `╰╌╌╌≫ Categoria: **${dados.nome}**\n\n` +

            'Aguarde um membro da equipe responder.\n' +
            'Explique seu problema de forma clara para que possamos ajudar.\n\n' +

            '🔒 **Este canal é privado.**'

          )

          .setFooter({
            text: 'Medusa Store • Atendimento'
          });

      // Botões
      const botoes =
        new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId('assumir_ticket')
              .setLabel('Assumir')
              .setEmoji('🙋')
              .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
              .setCustomId('liberar_ticket')
              .setLabel('Liberar')
              .setEmoji('🔓')
              .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
              .setCustomId('adicionar_membro')
              .setLabel('Adicionar')
              .setEmoji('➕')
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId('fechar_ticket')
              .setLabel('Fechar')
              .setEmoji('🔒')
              .setStyle(ButtonStyle.Danger)

          );

      await canal.send({

        content:
          `${interaction.user}`,

        embeds: [embed],

        components: [botoes]

      });

      return interaction.update({

        content:
          `✅ Seu ticket foi criado: ${canal}`,

        components: []

      });

    }

    // ==========================================
    // ASSUMIR TICKET
    // ==========================================

    if (
      interaction.isButton() &&
      interaction.customId === 'assumir_ticket'
    ) {

      if (
        !interaction.memberPermissions?.has(
          PermissionFlagsBits.ManageChannels
        )
      ) {

        return interaction.reply({

          content:
            '❌ Você não possui permissão para assumir tickets.',

          ephemeral: true

        });

      }

      const ticket =
        [...tickets.entries()].find(
          ([, data]) =>
            data.channelId ===
            interaction.channel.id
        );

      if (!ticket) {

        return interaction.reply({

          content:
            '❌ Este ticket não foi encontrado.',

          ephemeral: true

        });

      }

      const [userId, dados] =
        ticket;

      dados.claimedBy =
        interaction.user.id;

      tickets.set(
        userId,
        dados
      );

      await interaction.channel.send({

        content:
          `🙋 **Ticket assumido por ${interaction.user}.**`

      });

      return interaction.reply({

        content:
          '✅ Você assumiu este ticket.',

        ephemeral: true

      });

    }

    // ==========================================
    // LIBERAR TICKET
    // ==========================================

    if (
      interaction.isButton() &&
      interaction.customId === 'liberar_ticket'
    ) {

      if (
        !interaction.memberPermissions?.has(
          PermissionFlagsBits.ManageChannels
        )
      ) {

        return interaction.reply({

          content:
            '❌ Você não possui permissão para liberar tickets.',

          ephemeral: true

        });

      }

      const ticket =
        [...tickets.entries()].find(
          ([, data]) =>
            data.channelId ===
            interaction.channel.id
        );

      if (!ticket) {

        return interaction.reply({

          content:
            '❌ Este ticket não foi encontrado.',

          ephemeral: true

        });

      }

      const [userId, dados] =
        ticket;

      dados.claimedBy = null;

      tickets.set(
        userId,
        dados
      );

      await interaction.channel.send({

        content:
          '🔓 **Ticket liberado. Outro membro da Staff pode assumir.**'

      });

      return interaction.reply({

        content:
          '✅ Ticket liberado.',

        ephemeral: true

      });

    }

    // ==========================================
    // ADICIONAR MEMBRO
    // ==========================================

    if (
      interaction.isButton() &&
      interaction.customId === 'adicionar_membro'
    ) {

      if (
        !interaction.memberPermissions?.has(
          PermissionFlagsBits.ManageChannels
        )
      ) {

        return interaction.reply({

          content:
            '❌ Apenas a Staff pode adicionar membros.',

          ephemeral: true

        });

      }

      return interaction.reply({

        content:
          '➕ **Mencione o membro que deseja adicionar ao ticket.**\n\n' +
          'Exemplo: `@Usuario`',

        ephemeral: true

      });

    }

    // ==========================================
    // FECHAR TICKET
    // ==========================================

    if (
      interaction.isButton() &&
      interaction.customId === 'fechar_ticket'
    ) {

      if (
        !interaction.memberPermissions?.has(
          PermissionFlagsBits.ManageChannels
        )
      ) {

        return interaction.reply({

          content:
            '❌ Apenas a Staff pode fechar tickets.',

          ephemeral: true

        });

      }

      const ticket =
        [...tickets.entries()].find(
          ([, data]) =>
            data.channelId ===
            interaction.channel.id
        );

      if (ticket) {

        tickets.delete(
          ticket[0]
        );

      }

      await interaction.reply(
        '🔒 **Fechando ticket...**'
      );

      setTimeout(() => {

        interaction.channel
          .delete()
          .catch(() => {});

      }, 1500);

    }

  } catch (error) {

    console.error(
      '❌ ERRO NA INTERAÇÃO:',
      error
    );

    // Evita "Interação falhou"
    try {

      if (interaction.replied) {

        await interaction.followUp({

          content:
            '❌ Ocorreu um erro ao executar esta ação.',

          ephemeral: true

        });

      } else if (interaction.deferred) {

        await interaction.editReply({

          content:
            '❌ Ocorreu um erro ao executar esta ação.'

        });

      } else {

        await interaction.reply({

          content:
            '❌ Ocorreu um erro ao executar esta ação.',

          ephemeral: true

        });

      }

    } catch (e) {

      console.error(e);

    }

  }

});

// ================================
// LOGIN
// ================================

if (!TOKEN) {

  console.error(
    '❌ A variável TOKEN não foi encontrada.'
  );

  process.exit(1);

}

if (!CLIENT_ID) {

  console.error(
    '❌ A variável CLIENT_ID não foi encontrada.'
  );

  process.exit(1);

}

client.login(TOKEN);
