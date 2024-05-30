require("dotenv").config();
const TelegramApi = require("node-telegram-bot-api");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramApi(TOKEN, { polling: true });

bot.setMyCommands([
  {
    command: "/start",
    description: "Запуск бота",
  },
]);

bot.on("message", async (message) => {
  const text = message.text;
  const chatId = message.chat.id;
  const firstName = message.chat.first_name || "";

  if (text === "/start") {
    await bot.sendMessage(chatId, `Привет, ${firstName}!`);
    await bot.sendMessage(
      chatId,
      "Выберите интересующее вас действие или задайте вопрос:"
    );
    return;
  }
});
