require("dotenv").config();
const schedule = require("node-schedule");
const generateRandomReviewer = require("./utils/generateRandomReviewer.js");

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 8000,
  deferInitialization: true,
});

app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error("error", error);
});

const joinedAlgoMembers = [];

const member = {
  U04F2A0HT0Q: "공재혁",
  U04EG0SPEBV: "임현정",
  U04F5QP3WE4: "길지문",
};

async function sendMorningMessage() {
  try {
    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: "C04FCUUUU7J",
      text: "Good Morning",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Good Morning Vas Members!🌼\n Are you ready to become a Algo King?🔥 \n Click the Join Button!`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Join",
            },
            action_id: "button_click",
          },
        },
      ],
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

app.action("button_click", async ({ body, ack, say }) => {
  joinedAlgoMembers.push(member[body.user.id]);
  const join = joinedAlgoMembers.join();

  await ack();
  await say(`<${join}> joined in today's Algo`);
});

async function sendReviewer() {
  try {
    const reviewer = generateRandomReviewer(joinedAlgoMembers);
    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: "C04FCUUUU7J",
      text: `⭐️Today's Reviewer \n ${reviewer}`,
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

let morningSheduleObj = null;
let reviewerSheduleObj = null;

const scheduleSet = () => {
  const morningMessageRule = new schedule.RecurrenceRule();
  const reviewerMatchRule = new schedule.RecurrenceRule();

  morningMessageRule.dayOfWeek = [0, 1, 2, 4, 6];
  morningMessageRule.hour = 00;
  morningMessageRule.minute = 05;
  morningMessageRule.tz = "Asia/Seoul";

  reviewerMatchRule.dayOfWeek = [0, 1, 2, 4, 6];
  reviewerMatchRule.hour = 00;
  reviewerMatchRule.minute = 06;
  reviewerMatchRule.tz = "Asia/Seoul";

  const firstJob = schedule.scheduleJob(morningMessageRule, () => {
    console.log("스케줄 스타트");
    sendMorningMessage();
  });

  const secondJob = schedule.scheduleJob(reviewerMatchRule, () => {
    console.log("스케줄 스타트");
    sendReviewer();
  });

  morningSheduleObj = firstJob;
  reviewerSheduleObj = secondJob;
};

const cancel = () => {
  if (morningSheduleObj !== null && reviewerSheduleObj !== null) {
    morningSheduleObj.cancel();
    reviewerSheduleObj.cancel();
  }
};

const setSchedueler = () => {
  cancel();
  scheduleSet();
};

setSchedueler();

app.message("문제 업로드 완료", async ({ message, say }) => {
  try {
    await say(
      `Today's algo upload complete.✨ \n\n Please follow the process below. \n 1. git fetch algo main \n2. git merge algo/main`
    );
  } catch (error) {
    console.log("문제 업로드 완료 에러", error);
  }
});

(async () => {
  try {
    // Must call init() before start() within an async function
    await app.init();
    // Now safe to call start()
    await app.start();
    console.log("⚡️ Bolt app is running!");
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
