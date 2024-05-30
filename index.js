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

const startOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Фото", callback_data: "photo" }],
      [{ text: "Пост", callback_data: "post" }],
      [{ text: "Мой профиль", callback_data: "profile" }],
      [{ text: "Задать вопрос", callback_data: "question" }],
      [{ text: "Очистить список вопросов", callback_data: "clear" }],
      [{ text: "FAQ", callback_data: "faq" }],
      [{ text: "Оставить отзыв", callback_data: "feedback" }],
    ],
  }),
};

const faqOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Вопрос 1", callback_data: "Вопрос 1" }],
      [{ text: "Вопрос 2", callback_data: "Вопрос 2" }],
      [{ text: "Вопрос 3", callback_data: "Вопрос 3" }],
      [{ text: "Вопрос 4", callback_data: "Вопрос 4" }],
      [{ text: "Вопрос 5", callback_data: "Вопрос 5" }],
    ],
  }),
};

const faq = async (message) => {
  const chatId = message.chat.id;
  await bot.sendMessage(chatId, "Ответы на вопросы", faqOptions);
};

bot.on("message", async (message) => {
  const text = message.text;
  const chatId = message.chat.id;
  const firstName = message.chat.first_name || "";

  if (text === "/start") {
    await bot.sendMessage(chatId, `Привет, ${firstName}!`);
    await bot.sendMessage(
      chatId,
      "Выберите интересующее вас действие или задайте вопрос:",
      startOptions
    );
    return;
  }
});

bot.on("callback_query", async (query) => {
  const callbackData = query.data;
  const chatId = query.message.chat.id;
  const firstName = query.message.chat.first_name || "";
  const userName = query.message.chat.username || "";

  switch (callbackData) {
    case "profile":
      await bot.sendMessage(chatId, "Информация о пользователе:");
      await bot.sendMessage(chatId, `Имя: ${firstName}`);
      await bot.sendMessage(chatId, `Никнейм: @${userName}`);
    case "faq":
      faq(query.message);
      break;
    default:
      break;
  }
});
