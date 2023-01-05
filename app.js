const mqtt = require("mqtt");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const dbUrl = process.env.DB_URL;

// connect to mqtt server
const client = mqtt.connect("mqtt://broker.mqtt-dashboard.com");

//topic to subscribe
const messageTopic = "alarmbotultgberat";
const statusTopic = "alarmbotultgberatstatus/#";

// func to get data from db
async function getData() {
  const data = await fetch(dbUrl)
    .then((res) => res.json())
    .then((data) => data);
  return data;
}

// bot start command
bot.start((ctx) => {
  ctx.reply("Welcome");
  //console.log(ctx.message.chat);
});

// bot help command
bot.help((ctx) => ctx.reply("Send me a sticker"));

//bot infoindong command, to tell bot to chat if there is message comming
bot.command("infoindong", async (ctx) => {
  ctx.reply("Oke siap!, saya akan menginfokan ketika ada Alarm.");
  await fetch(dbUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(ctx.message.chat),
  });
});

//bot berhentiinfoin command, to tell bot to stop chat if there is message comming
bot.command("stopinfoin", async (ctx) => {
  ctx.reply("Oke siap!, saya akan berhenti menginfokan.");
  const deleteUrl = dbUrl + "/" + ctx.message.chat.id;
  await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });
});

// subscribe to topic
client.on("connect", function () {
  client.subscribe(messageTopic, function (err) {
    if (err) {
      console.log(err);
    }
  });
  client.subscribe(statusTopic, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

// callback when message arived
client.on("message", async function (topic, message) {
  // message is Buffer
  const context = message.toString();
  const first_topic = topic.split("/")[0];
  const second_topic = topic.split("/")[1];

  if (first_topic === messageTopic) {
    const ids = await getData();
    //console.log(ids[0].id);
    for (let i = 0; i < ids.length; i++) {
      bot.telegram.sendMessage(ids[i].id, context);
    }
  }

  if (first_topic === statusTopic.split("/")[0]) {
    console.log(second_topic);
    console.log(context);
  }
  //client.end();
});

bot.launch();
