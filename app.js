require("dotenv").config();

const schedule = require("node-schedule");
const generateRandomReviewer = require("./utils/generateRandomReviewer.js");

const { App } = require("@slack/bolt");

const app = new App({
  signingSecret: process.env.SLACK_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
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
      channel: "C04ED5A3XHT",
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
      channel: "C04ED5A3XHT",
      text: `⭐️Today's Reviewer \n ${reviewer}`,
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

// 스케줄링 설정
const morningMessageRule = new schedule.RecurrenceRule();
const reviewerMatchRule = new schedule.RecurrenceRule();

morningMessageRule.dayOfWeek = [0, 2, 4, 6];
morningMessageRule.hour = 09;
morningMessageRule.minute = 30;
morningMessageRule.tz = "Asia/Seoul";

reviewerMatchRule.dayOfWeek = [0, 2, 4, 6];
reviewerMatchRule.hour = 10;
reviewerMatchRule.minute = 30;
reviewerMatchRule.tz = "Asia/Seoul";

schedule.scheduleJob(morningMessageRule, () => {
  sendMorningMessage();
});

schedule.scheduleJob(reviewerMatchRule, async () => {
  sendReviewer();
});

app.message("문제 업로드 완료", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Today's algo upload complete.✨ \n\n Please follow the process below. \n 1. git fetch algo main \n2. git merge algo/main`);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
