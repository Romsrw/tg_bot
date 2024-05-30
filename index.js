require("dotenv").config();
const TelegramApi = require("node-telegram-bot-api");
const { default: axios } = require("axios");

const bot = new TelegramApi(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

var reviews = [];

const questions = [];

const startOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "Посмотреть фото", callback_data: "photo" }],
      [{ text: "Прочитать пост", callback_data: "post" }],
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

bot.setMyCommands([
  {
    command: "/start",
    description: "Запуск бота",
  },
]);

const faq = async (message) => {
  const chatId = message.chat.id;
  await bot.sendMessage(chatId, "Ответы на вопросы", faqOptions);
};

const getRandomNumber = () => Math.floor(Math.random() * 10) + 1;

const getData = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

const listeners = () => {
  bot.on("callback_query", async (query) => {
    const callbackData = query.data;
    const chatId = query.message.chat.id;
    const firstName = query.message.chat.first_name || "";
    const userName = query.message.chat.username || "";
    let responseText = "";

    switch (callbackData) {
      case "Вопрос 1":
        responseText = "Ответ на вопрос 1";
        break;
      case "Вопрос 2":
        responseText = "Ответ на вопрос 2";
        break;
      case "Вопрос 3":
        responseText = "Ответ на вопрос 3";
        break;
      case "Вопрос 4":
        responseText = "Ответ на вопрос 4";
        break;
      case "Вопрос 5":
        responseText = "Ответ на вопрос 5";
        break;
      case "photo":
        const photo = await getData(
          `https://jsonplaceholder.typicode.com/photos/${getRandomNumber()}`
        );
        bot.sendPhoto(chatId, photo.url);
        break;
      case "post":
        const post = await getData(
          `https://jsonplaceholder.typicode.com/posts/${getRandomNumber()}`
        );
        bot.sendMessage(chatId, post.body);
        break;
      case "profile":
        await bot.sendMessage(chatId, "Информация о пользователе:");
        await bot.sendMessage(chatId, `Имя: ${firstName}`);
        await bot.sendMessage(chatId, `Никнейм: @${userName}`);

        break;
      case "question":
        if (questions.length < 5) {
          await bot.sendMessage(
            chatId,
            `Задайте свой ${questions.length + 1} вопрос:`
          );
        } else {
          await bot.sendMessage(
            chatId,
            "Вы задали максимальное количество вопросов (5)!"
          );
        }
        break;
      case "clear":
        questions.length = 0;
        await bot.sendMessage(chatId, "Список вопросов очищен!");
        break;
      case "feedback":
        await bot.sendMessage(chatId, "Напишите ваш отзыв администратору:");
        const reviewIndex = reviews.findIndex(
          (item) => item.userName === userName
        );
        if (reviewIndex === -1) {
          reviews.push({
            userName,
            status: "wait",
            text: "",
          });
        } else {
          reviews[reviewIndex] = {
            userName,
            status: "wait",
            text: "",
          };
        }
        break;
      case "faq":
        faq(query.message);
        break;
      default:
        responseText = "-";
        break;
    }

    if (query.message.text === "Ответы на вопросы") {
      bot.sendMessage(query.message.chat.id, responseText);
    }
  });
};

bot.on("message", async (message) => {
  const text = message.text;
  const chatId = message.chat.id;
  const firstName = message.chat.first_name || "";
  const userName = message.chat.username || "";

  if (text === "/start") {
    bot.off("callback_query");
    listeners();
    await bot.sendMessage(chatId, `Привет, ${firstName}!`);
    await bot.sendMessage(
      chatId,
      "Выберите интересующее вас действие или задайте вопрос:",
      startOptions
    );
    return;
  }

  const review = reviews.find(
    (item) => item.userName === userName && item.status === "wait"
  );

  if (review) {
    const indexReview = reviews.findIndex(
      (item) => item.userName === userName && item.status === "wait"
    );
    reviews[indexReview] = { userName, status: "done", text };
    await bot.sendMessage(chatId, "Спасибо за ваш отзыв!");
    return;
  }

  if (text.includes("?") && !review) {
    if (questions.length < 5) {
      questions.push(text);
      await bot.sendMessage(chatId, `Вопрос ${questions.length} '${text}'`);
      await bot.sendMessage(chatId, `Ответ ${questions.length}`);
    } else {
      await bot.sendMessage(
        chatId,
        "Вы задали максимальное количетсво вопросов (5)"
      );
    }
    return;
  }

  await bot.sendMessage(
    chatId,
    "Задайте вопрос, или перезапустите бота через меню"
  );
});
