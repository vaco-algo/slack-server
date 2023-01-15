const { App } = require("@slack/bolt");
const SetScheduler = require("./utils/setSchedule");
const SlackFunctions = require("./utils/slackFunctions");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000,
});

const slackFuncs = new SlackFunctions(app);
const schedulerModule = new SetScheduler(slackFuncs);

(function () {
  schedulerModule.initializeJob();

  setTimeout(() => {
    schedulerModule.setScheduling();
  }, 50000);
})();

app.action("button_click", async ({ body, ack, say }) => {
  await slackFuncs.clickButton({ body, ack, say });
});

app.message("초기 설정 방법", async ({ message, say }) => {
  await slackFuncs.initialSettingMethodMessage({ message, say });
});

app.message("문제 업데이트 방법", async ({ message, say }) => {
  await slackFuncs.fethProblem({ message, say });
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
  console.error(error);
});

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
