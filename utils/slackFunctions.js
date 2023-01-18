const axios = require("axios");
const generateRandomReviewer = require("./generateRandomReviewer.js");
const member = require("../constants/member.js");

const joinedAlgoMembers = [];

const getLeetcodeUrl = async () => {
  const { data } = await axios.get("https://leetcoder-rc2k.onrender.com");

  return data;
};

class SlackFunctions {
  constructor(app) {
    this.app = app;
  }

  async sendLeetcodeUrl() {
    try {
      const data = await getLeetcodeUrl();
      console.log("sendLeetcodeUrl data", data);

      if (data.problem === "fail" || !data.problem) {
        return await this.app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: process.env.MESSAGE_CHANNEL,
          text: `문제 업로드 중입니다. 잠시만 기다려주세요!✨
          \nLeetcode 문제 주소: ${data.url}
          `,
        });
      }

      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.MESSAGE_CHANNEL,
        text: `문제 업로드 완료✨
        \n\nLeetcode 문제 이름: ${data.problem}
        \nLeetcode 문제 주소: ${data.url}
        \n⚠️git fetch algo *problems*
        \n⚠️git merge algo/problems`,
      });
    } catch (error) {
      console.log("문제 받는 거 에러", error);
    }
  }

  async wakeupServer() {
    try {
      await axios.get("https://vas-slack-server.onrender.com/wakeup");
    } catch (error) {
      console.error(error);
    }
  }

  async sendMorningMessage() {
    try {
      joinedAlgoMembers.length = 0;

      const result = await this.app.client.chat.postMessage({
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

  async timeOutMessage() {
    try {
      joinedAlgoMembers.length = 0;

      const result = await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.MESSAGE_CHANNEL,
        text: `✨우리가 우리 자신에게 실패를 허락 할 때, 우리는 동시에 우리 자신에게 탁월함을 허락한다. - Eloise Ristad \n 🌼 PR을 완료해주세요!`,
      });

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  async sendReviewer() {
    try {
      console.log(joinedAlgoMembers, "what");
      const reviewer = generateRandomReviewer(joinedAlgoMembers);

      if (!reviewer) return;

      const result = await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.MESSAGE_CHANNEL,
        text: `⭐️Today's Reviewer \n ${reviewer} \n(리뷰어 잘못 설정되어있을 시 "랜덤 리뷰어 [이름, 이름]" 형식으로 메시지를 보내주세요.)`,
      });

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  async clickButton({ body, ack, say }) {
    try {
      const clickedMember = member[body.user.id];
      console.log("join", member[body.user.id]);

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
  }

  async initialSettingMethodMessage(channelId) {
    try {
      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        text: "1. `https://github.com/vaco-algo/vaco-algo-study` fork \n2. `$ git clone fork한 레포` \n3. `$ git remote add algo https://github.com/vaco-algo/vaco-algo-study.git` 으로 본 레포를 remote에 추가한다. \n4. 문제 내려받기 \n⭐️1. `$ git fetch algo problems`⭐️ \n⭐️2. `$ git merge algo/problems`⭐️",
      });
    } catch (error) {
      console.log("초기 설정 방법 에러", error);
    }
  }

  async fethProblem(channelId) {
    try {
      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        text: "⭐️1. `$ git fetch algo problems`⭐️ \n⭐️2. `$ git merge algo problems`⭐️",
      });
    } catch (error) {
      console.log("문제 업데이트 방법 에러", error);
    }
  }

  async passiveRandomReviewer(names, channelId) {
    try {
      let peoples = names.match(/\[.*\]/gi);

      if (!peoples) return;

      peoples += "";

      const reviewer = generateRandomReviewer(peoples.slice(1, -1).split(","));

      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        text: `⭐️Today's Reviewer \n ${reviewer}`,
      });
    } catch (error) {
      console.log("문제 업데이트 방법 에러", error);
    }
  }

  async pickBotGuide({ say }) {
    try {
      await say(
        "🔹picker bot은 매주 화요일 목요일\n🔹9시 30분, 10시 30분, 11시에 메세지를 보냅니다.\n\n🔹picker bot의 명령어 \n1. `초기 설정 방법`\n2. `문제 업데이트 방법`\n3. `문제 업로드 완료`\n5.`굿모닝`(알고리즘 푸는 사람 모으기) \n6. `랜덤 리뷰어 [이름, 이름, 이름]`\n를 입력하면 어디든지 나타납니다.\n(다이렉트 메시지 제외, picker bot을 각 채널에 초대하여야 합니다.)"
      );
    } catch (error) {
      console.log("hey", error);
    }
  }
}

module.exports = SlackFunctions;
