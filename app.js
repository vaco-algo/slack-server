const dotenv = require("dotenv");
dotenv.config();
const { App } = require("@slack/bolt");
const CronJob = require("cron").CronJob;
const SlackFunctions = require("./utils/slackFunctions");
const { connectDB } = require("./db/database");

connectDB();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  customRoutes: [
    {
      path: "/",
      method: ["GET"],
      handler: async (_, res) => {
        console.log("root");

        res.writeHead(200);
        return res.end("root");
      },
    },
    {
      path: "/wakeup",
      method: ["GET"],
      handler: async (_, res) => {
        console.log("wakeup");
        res.writeHead(200);
        return res.end("server wakeup");
      },
    },
  ],
  port: process.env.PORT || 3000,
});

let slackFuncs;

(async () => {
  try {
    await app.start();

    slackFuncs = new SlackFunctions(app);

    /**
     * setting cron
     */
    const timeZone = "Asia/Seoul";
    const botTest = new CronJob(
      "00 00 10 * * 1-7",
      async function () {
        console.log("test");
        await slackFuncs.testBot();
      },
      null,
      true,
      timeZone
    );

    const morningMessage = new CronJob(
      "0 0 9 * * 1,4",
      async function () {
        console.log("모닝 메시지 스타트");
        await slackFuncs.sendMorningMessage();
      },
      null,
      true,
      timeZone
    );

    const reviewMatch = new CronJob(
      "0 0 12 * * 1,4",
      async function () {
        console.log("리뷰어 매치 스타트");
        await slackFuncs.sendReviewer();
      },
      null,
      true,
      timeZone
    );

    const sendProblemUrl = new CronJob(
      "0 0 10 * * 1,4",
      async function () {
        console.log("문제 업로드 스타트");
        await slackFuncs.sendLeetcodeUrl();
      },
      null,
      true,
      "Asia/Seoul"
    );

    botTest.start();
    morningMessage.start();
    reviewMatch.start();
    sendProblemUrl.start();

    console.log("⚡️ Bolt app is running!");
  } catch (err) {
    console.log("app 실행 에러", err);
  }
})();

/**
 * command
 */
app.command("/픽봇가이드", async ({ command, ack }) => {
  await ack();

  const { channel_id: channelId, user_id: userId } = JSON.parse(
    JSON.stringify(command)
  );

  return await slackFuncs.pickBotGuide(channelId, userId);
});

app.command("/픽봇가이드-g", async ({ command, ack }) => {
  await ack();

  const { channel_id: channelId, user_id: userId } = JSON.parse(
    JSON.stringify(command)
  );

  return await slackFuncs.pickBotGuide(channelId, userId, "global");
});

app.command("/초기설정방법", async ({ command, ack }) => {
  await ack();

  const { channel_id: channelId, user_id: userId } = JSON.parse(
    JSON.stringify(command)
  );

  return await slackFuncs.initialSettingMethodMessage(channelId, userId);
});

app.command("/초기설정방법-g", async ({ command, ack }) => {
  await ack();

  const { channel_id: channelId, user_id: userId } = JSON.parse(
    JSON.stringify(command)
  );

  return await slackFuncs.initialSettingMethodMessage(
    channelId,
    userId,
    "global"
  );
});

app.command("/문제업데이트방법", async ({ command, ack }) => {
  await ack();

  const { channel_id: channelId, user_id: userId } = JSON.parse(
    JSON.stringify(command)
  );

  return await slackFuncs.fetchProblem(channelId, userId);
});

app.command("/문제업데이트방법-g", async ({ command, ack }) => {
  await ack();

  const { channel_id: channelId, user_id: userId } = JSON.parse(
    JSON.stringify(command)
  );

  return await slackFuncs.fetchProblem(channelId, userId, "global");
});

/**
 * action
 */
app.action("join_button_click", async ({ body, ack, say }) => {
  await slackFuncs.clickJoinButton({ body, ack, say });
});

app.action("cancel_button_click", async ({ body, ack, say }) => {
  await slackFuncs.clickCancelButton({ body, ack, say });
});

/**
 * message
 */
app.message("픽봇가이드", async ({ body }) => {
  await slackFuncs.pickBotGuide(body.event.channel);
});

app.message("초기설정방법", async ({ body }) => {
  await slackFuncs.initialSettingMethodMessage(body.event.channel);
});

app.message("문제업데이트방법", async ({ body }) => {
  await slackFuncs.fetchProblem(body.event.channel);
});

app.message("굿모닝", async ({ body }) => {
  await slackFuncs.sendMorningMessage(body.event.channel);
});

app.message("랜덤 리뷰어", async ({ message, body }) => {
  await slackFuncs.passiveRandomReviewer(message.text, body.event.channel);
});

app.error((err) => {
  console.error(err);
});
