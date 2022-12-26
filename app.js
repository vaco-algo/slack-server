const { App } = require("@slack/bolt");
const schedule = require("node-schedule");
const generateRandomReviewer = require("./utils/generateRandomReviewer.js");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: process.env.PORT || 3000,
});

const joinedAlgoMembers = [];

const member = {
  U04F2A0HT0Q: "공재혁",
  U04F5QP3WE4: "길지문",
  U04EQSZ4MSS: "사공은혜",
  U04EXF5FSTC: "안형우",
  U04EGULQY5V: "이세영",
  U04EQSZ6GHL: "이정진",
  U04EG0SPEBV: "임현정",
  U04EGUM5ZFH: "최송이",
  U04FM6DECP2: "한아름",
};

async function wakeUp() {
  try {
    joinedAlgoMembers.length = 0;

    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: 'C04F3TS3C73',
      text: "Good Morning",
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function sendMorningMessage() {
  try {
    joinedAlgoMembers.length = 0;

    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.MESSAGE_CHANNEL,
      text: "Good Morning",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Good Morning Vas Members!🌼\n Are you ready to become a Algo King? \n(Join 클릭 후 메시지 안뜨면 체크 이모지 추가해주세요!)`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Click the *Join* Button!🔥",
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Join",
            },
            value: "click_me_123",
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

async function timeOutMessage() {
  try {
    joinedAlgoMembers.length = 0;

    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.MESSAGE_CHANNEL,
      text: `✨우리가 우리 자신에게 실패를 허락 할 때, 우리는 동시에 우리 자신에게 탁월함을 허락한다. - Eloise Ristad \n 🌼 PR을 완료해주세요!`,
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function sendReviewer() {
  try {
    console.log(joinedAlgoMembers, "what");
    const reviewer = generateRandomReviewer(joinedAlgoMembers);

    if (!reviewer) return;

    const result = await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.MESSAGE_CHANNEL,
      text: `⭐️Today's Reviewer \n ${reviewer}`,
    });

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

let morningSheduleObj = null;
let reviewerSheduleObj = null;
let timeOutMessageSheduleObj = null;

const scheduleSet = () => {
  // const morningMessageRule = new schedule.RecurrenceRule();
  const reviewerMatchRule = new schedule.RecurrenceRule();
  const timeOutMesssageRule = new schedule.RecurrenceRule();

  // morningMessageRule.dayOfWeek = [2, 4];
  // morningMessageRule.hour = 09;
  // morningMessageRule.minute = 30;
  // morningMessageRule.tz = "Asia/Seoul";

  reviewerMatchRule.dayOfWeek = [2, 4];
  reviewerMatchRule.hour = 10;
  reviewerMatchRule.minute = 30;
  reviewerMatchRule.tz = "Asia/Seoul";

  timeOutMesssageRule.dayOfWeek = [2, 4];
  timeOutMesssageRule.hour = 12;
  timeOutMesssageRule.minute = 30;
  timeOutMesssageRule.tz = "Asia/Seoul";

  // const firstJob = schedule.scheduleJob(morningMessageRule, () => {
  //   console.log("스케줄 스타트");
  //   sendMorningMessage();
  // });

  const secondJob = schedule.scheduleJob(reviewerMatchRule, () => {
    console.log("스케줄 스타트");
    sendReviewer();
  });

  const thirdJob = schedule.scheduleJob(timeOutMesssageRule, () => {
    console.log("타임아웃 메시지 스타트");
    timeOutMessage();
  });

  morningSheduleObj = firstJob;
  reviewerSheduleObj = secondJob;
  timeOutMessageSheduleObj = thirdJob;
};

const cancel = () => {
  if (
    morningSheduleObj !== null &&
    reviewerSheduleObj !== null &&
    timeOutMessageSheduleObj !== null
  ) {
    morningSheduleObj.cancel();
    reviewerSheduleObj.cancel();
    timeOutMessageSheduleObj.cancel();
  }
};

const setSchedueler = () => {
  cancel();
  scheduleSet();
};

setSchedueler();

app.action("button_click", async ({ body, ack, say }) => {
  try {
    const clickedMember = member[body.user.id];

    if (
      joinedAlgoMembers.find((joinedMember) => joinedMember === clickedMember)
    ) {
      await ack();
      return;
    } else {
      joinedAlgoMembers.push(clickedMember);

      await ack();
      await say(`<${joinedAlgoMembers.join()}> joined in today's Algo`);
    }
  } catch (err) {
    console.log(err);
  }
});

app.message("픽봇 일어나", async ({ message, say }) => {
  try {
    await say("Good morning~");
  } catch (error) {
    console.log("문제 업로드 완료 에러", error);
  }
});

app.message("문제 업로드 완료", async ({ message, say }) => {
  try {
    await say(
      `Today's algo upload complete.✨
      \n\nPlease follow the process below.
      \n⚠️git fetch algo *problems*
      \n⚠️git merge algo/problems`
    );
  } catch (error) {
    console.log("문제 업로드 완료 에러", error);
  }
});

app.message("초기 설정 방법", async ({ message, say }) => {
  try {
    console.log(message);
    await say(
      "1. `https://github.com/vaco-algo/vaco-algo-study` fork \n2. `$ git clone fork한 레포` \n3. `$ git remote add algo https://github.com/vaco-algo/vaco-algo-study.git` 으로 본 레포를 remote에 추가한다. \n4. 문제 내려받기 \n⭐️1. `$ git fetch algo problems`⭐️ \n⭐️2. `$ git merge algo problems`⭐️"
    );
  } catch (error) {
    console.log("초기 설정 방법 에러", error);
  }
});

app.message("문제 업데이트 방법", async ({ message, say }) => {
  try {
    console.log(message);
    await say(
      "⭐️1. `$ git fetch algo problems`⭐️ \n⭐️2. `$ git merge algo problems`⭐️"
    );
  } catch (error) {
    console.log("문제 에러", error);
  }
});

app.message("일어나", async ({ message, say }) => {
  await wakeUp();
});

app.message("굿모닝", async ({ message, say }) => {
  await sendMorningMessage();
});

app.message("랜덤 리뷰어", async ({ message, say }) => {
  let peoples = message.text.match(/\[.*\]/gi);

  if (!peoples) return;

  peoples += "";

  const reviewer = generateRandomReviewer(peoples.slice(1, -1).split(","));

  await say(`⭐️Today's Reviewer \n ${reviewer}`);
});

app.message("hey", async ({ message, say }) => {
  try {
    await say(
      "🔹picker bot은 매주 일, 화, 목, 토\n9시 30분, 10시 30분에 메세지를 보냅니다.\n🔹picker bot의 명령어 \n1. `초기 설정 방법`\n2. `문제 업데이트 방법`\n3. `문제 업로드 완료 \n4. 픽봇 일어나(잠든 픽봇 깨우기) \n5.굿모닝(알고리즘 푸는 사람 모으기) \n6. 랜덤 리뷰어`\n를 입력하면 어디든지 나타납니다.\n(다이렉트 메시지 제외, picker bot을 각 채널에 초대하여야 합니다.)"
    );
  } catch (error) {
    console.log("hey", error);
  }
});

app.error((error) => {
  console.error(error);
});

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
