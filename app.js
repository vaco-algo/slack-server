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
        res.end("root");
      },
    },
    {
      path: "/wakeup",
      method: ["GET"],
      handler: async (_, res) => {
        console.log("wakeup");

        res.writeHead(200);
        res.end("server wakeup");
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

app.action("button_click", async ({ body, ack, say }) => {
  await slackFuncs.clickButton({ body, ack, say });
});

app.message("초기 설정 방법", async ({ body }) => {
  await slackFuncs.initialSettingMethodMessage({ body });
});

app.message("문제 업데이트 방법", async ({ body }) => {
  await slackFuncs.fethProblem({ body });
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

app.message("랜덤 리뷰어", async ({ message, say }) => {
  await slackFuncs.passiveRandomReviewer({ message, say });
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
