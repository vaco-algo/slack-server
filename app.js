require("dotenv").config();

const generateRandomReviewer = require("./utils/generateRandomReviewer.js");
const setSchedule = require("./utils/setSchedule.js");

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

const today = new Date();

async function sendMorningMessage() {
  try {
    const result = await app.client.chat.scheduleMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: "C04FCUUUU7J",
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
      post_at:
        process.env.NODE_ENV === test
          ? setSchedule(today.getHours() + 9, today.getMinutes() + 5)
          : setSchedule(9, 30),
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
    const result = await app.client.chat.scheduleMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: "C04FCUUUU7J",
      text: `⭐️Today's Reviewer \n ${reviewer}`,
      post_at:
        process.env.NODE_ENV === test
          ? setSchedule(today.getHours() + 9, today.getMinutes() + 10)
          : setSchedule(10, 30),
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

app.message("실행", async () => {
  await sendMorningMessage();
  await sendReviewer();
});

app.message("문제 업로드 완료", async ({ message, say }) => {
  await say(
    `Today's algo upload complete.✨ \n\n Please follow the process below. \n 1. git fetch algo main \n2. git merge algo/main`
  );
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
