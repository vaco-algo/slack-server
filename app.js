const dotenv = require("dotenv");
dotenv.config();
const { App } = require("@slack/bolt");
const SetScheduler = require("./utils/setSchedule");
const SlackFunctions = require("./utils/slackFunctions");

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
        res.writeHead(200);
        return res.end("server wakeup");
      },
    },
  ],
  port: process.env.PORT || 3000,
});

let slackFuncs;
let schedulerModule;

(async () => {
  try {
    await app.start();

    slackFuncs = new SlackFunctions(app);
    schedulerModule = new SetScheduler(slackFuncs);

    schedulerModule.initializeJob();
    schedulerModule.setScheduling();

    console.log("⚡️ Bolt app is running!");
  } catch (err) {
    console.log("app 실행 에러", err);
  }
})();

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

app.action("join_button_click", async ({ body, ack, say }) => {
  await slackFuncs.clickJoinButton({ body, ack, say });
});

app.action("cancel_button_click", async ({ body, ack, say }) => {
  await slackFuncs.clickCancelButton({ body, ack, say });
});

app.message("픽봇가이드", async ({ body }) => {
  await slackFuncs.pickBotGuide(body.event.channel);
});

app.message("초기설정방법", async ({ body }) => {
  console.log("hihi");
  await slackFuncs.initialSettingMethodMessage(body.event.channel);
});

app.message("문제업데이트방법", async ({ body }) => {
  await slackFuncs.fetchProblem(body.event.channel);
});

app.message("굿모닝", async () => {
  await slackFuncs.sendMorningMessage();
});

app.message("랜덤 리뷰어", async ({ message, body }) => {
  await slackFuncs.passiveRandomReviewer(message.text, body.event.channel);
});

app.error((err) => {
  schedulerModule.initializeJob();
  console.log("스케줄 제거");
  console.error(err);
});
