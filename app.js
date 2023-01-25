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
        console.log("wakeup");

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

app.command("/랜덤리뷰어", async ({ command, ack, message }) => {
  await ack();

  const { channel_id: channelId, text: names } = JSON.parse(
    JSON.stringify(command)
  );

  await slackFuncs.passiveRandomReviewer(names, channelId);
});

app.command("/초기설정방법", async ({ command, ack }) => {
  await ack();

  const { channel_id: channelId } = JSON.parse(JSON.stringify(command));

  return await slackFuncs.initialSettingMethodMessage(channelId);
});

app.command("/문제업데이트방법", async ({ command, ack }) => {
  await ack();

  const { channel_id: channelId } = JSON.parse(JSON.stringify(command));

  return await slackFuncs.fethProblem(channelId);
});

app.action("button_click", async ({ body, ack, say }) => {
  await slackFuncs.clickButton({ body, ack, say });
});

app.message("초기 설정 방법", async ({ body }) => {
  await slackFuncs.initialSettingMethodMessage(body.event.channel);
});

app.message("문제 업데이트 방법", async ({ body }) => {
  await slackFuncs.fethProblem(body.event.channel);
});

app.message("일어나", async () => {
  await slackFuncs.wakeupServer();
});

app.message("굿모닝", async () => {
  await slackFuncs.sendMorningMessage();
});

app.message("오늘의 리뷰어", async () => {
  await slackFuncs.sendReviewer();
});

app.message("타임아웃", async () => {
  await slackFuncs.timeOutMessage();
});

app.message("랜덤 리뷰어", async ({ message, body }) => {
  await slackFuncs.passiveRandomReviewer(message.text, body.event.channel);
});

app.message("hey", async ({ say }) => {
  await slackFuncs.pickBotGuide({ say });
});

app.message("문제테스트", async () => {
  await slackFuncs.sendLeetcodeUrl();
});

app.error((error) => {
  schedulerModule.initializeJob();
  console.log("스케줄 제거");
  console.error(error);
});
