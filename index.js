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

// Token será colocado no Railway como TOKEN
const TOKEN = process.env.TOKEN;

// 5 cargos que podem atender os tickets
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
      { body: [command.toJSON()] }
    );

    console.log("Comando /ticket registrado!");
  } catch (error) {
    console.error("Erro ao registrar /ticket:", error);
  }
});

client.on("interactionCreate", async (interaction) => {

  // =========================
  // /ticket
  // =========================

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

  // =========================
  // ABRIR MENU
  // =========================

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
