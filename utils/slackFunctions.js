const axios = require("axios");
const generateRandomReviewer = require("./generateRandomReviewer.js");
const member = require("../constants/member.js");
const Participant = require("../model/Participant");

const initializeJoinedMemberData = async () => {
  await Participant.findOneAndUpdate(
    { _id: process.env.DB_ID },
    { peoples: {} }
  );
};

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
    } catch (err) {
      console.log("문제 받는 거 에러", err);
    }
  }

  async wakeupServer() {
    try {
      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: "C04F3TS3C73",
        text: "wakeup",
      });
    } catch (err) {
      console.log("wakeup에러");
    }
  }

  async sendMorningMessage(channel) {
    try {
      await initializeJoinedMemberData();

      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channel || process.env.MESSAGE_CHANNEL,
        text: "Good Morning",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `Good Morning Vas Members!🌼`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Are you ready to be an Algo King? \n(Join 클릭 후 메시지 안뜨면 체크 이모지 추가해주세요!)!`,
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
              style: "primary",
              value: "click_me_123",
              action_id: "join_button_click",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Want to cancel?",
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Cancel",
              },
              style: "danger",
              value: "cancel_button",
              action_id: "cancel_button_click",
            },
          },
        ],
      });

      console.log("morning~");
    } catch (err) {
      console.log("morning", err);
    }
  }

  async timeOutMessage() {
    try {
      await initializeJoinedMemberData();

      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.MESSAGE_CHANNEL,
        text: `✨오늘은 pr과 리뷰를 마무리하는 날입니다.\n리뷰어의 리뷰를 기다리고 있을 분들을 위해 짧게라도 리뷰를 달아주세요!😆 \n남은 오늘도 화이팅💪`,
      });

      console.log("timeout 실행");
    } catch (err) {
      console.log("timeout", err);
    }
  }

  async sendReviewer() {
    try {
      const participants = await Participant.find();
      const participantsIdArr = Object.keys(participants[0].peoples);

      const reviewer = Object.keys(participants[0].peoples).length
        ? generateRandomReviewer(participantsIdArr)
        : "No reviewers😱";

      initializeJoinedMemberData();

      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.MESSAGE_CHANNEL,
        text: `⭐️Today's Reviewer: \n ${reviewer} \n\n(리뷰어 잘못 설정되어있을 시 "랜덤 리뷰어 [이름, 이름]" 형식으로 메시지를 보내주세요.)`,
      });

      console.log("리뷰어 전송");
    } catch (err) {
      console.log("리뷰어 전송", err);
    }
  }

  async clickJoinButton({ body, ack, say }) {
    try {
      const clickedMember = process.env[body.user.id];
      console.log("joined member: ", clickedMember);

      const participants = await Participant.find();

      if (participants[0].peoples[body.user.id]) {
        await ack();
        return;
      }

      participants[0].peoples = {
        ...participants[0].peoples,
        [body.user.id]: clickedMember,
      };

      await participants[0].save();

      const participantsNames = Object.values(participants[0].peoples);

      await ack();
      await say(`<${participantsNames.join()}> joined in today's Algo`);
    } catch (err) {
      console.log("join click", err);
    }
  }

  async clickCancelButton({ body, ack, say }) {
    try {
      const clickedMember = member[body.user.id];
      console.log("canceld member: ", clickedMember);

      const participants = await Participant.find();

      if (!participants[0].peoples[body.user.id]) {
        await ack();
        return;
      }

      const copyObj = { ...participants[0].peoples };
      delete copyObj[body.user.id];

      participants[0].peoples = {
        ...copyObj,
      };

      await participants[0].save();

      const participantsNames = Object.values(participants[0].peoples);

      await ack();
      await say(
        `Bye ${clickedMember}👋\n Current participants: <${participantsNames.join()}>
          `
      );
    } catch (err) {
      console.log("cancel click", err);
    }
  }

  async initialSettingMethodMessage(channelId, userId, global) {
    try {
      console.log("초기 설정 방법");

      const text =
        "🔹초기 설정 방법\n1. `https://github.com/vaco-algo/vaco-algo-study` fork \n2. `$ git clone fork한 레포` \n3. `$ git remote add algo https://github.com/vaco-algo/vaco-algo-study.git` 으로 본 레포를 remote에 추가한다. \n4. 문제 내려받기 \n⭐️1. `$ git fetch algo problems`⭐️ \n⭐️2. `$ git merge algo/problems`⭐️";

      if (global) {
        return await this.app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          text,
        });
      } else {
        return await this.app.client.chat.postEphemeral({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          text,
          user: userId,
        });
      }
    } catch (err) {
      console.log("초기 설정 방법", err);
    }
  }

  async fetchProblem(channelId, userId, global) {
    try {
      if (global) {
        await this.app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          text: "⭐️1. `$ git fetch algo problems`⭐️ \n⭐️2. `$ git merge algo/problems`⭐️",
        });
      } else {
        await this.app.client.chat.postEphemeral({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          text: "⭐️1. `$ git fetch algo problems`⭐️ \n⭐️2. `$ git merge algo/problems`⭐️",
          user: userId,
        });
      }
      console.log("문제 업데이트 방법");
    } catch (err) {
      console.log("문제 업데이트 방법", err);
    }
  }

  async passiveRandomReviewer(names, channelId) {
    try {
      let peoples = names.match(/\[.*\]/gi);

      if (!peoples) return;

      peoples += "";

      const reviewer = generateRandomReviewer(peoples.slice(1, -1).split(","));

      await initializeJoinedMemberData();

      await this.app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        text: `⭐️Today's Reviewer \n ${reviewer}`,
      });
      console.log("수동 랜덤 리뷰어");
    } catch (err) {
      console.log("수동 랜덤 리뷰어", err);
    }
  }

  async pickBotGuide(channelId, userId, global) {
    try {
      const text =
        "🚀picker bot은 매주 월요일 목요일\n9시 30분에 참가 신청을 받는 메세지를 보냅니다.\n\n문제 업로드 시간\n👉오전 11시 05분\n리뷰어 배정 시간\n👉월, 목 저녁 8시\n알고리즘 푸는 시간\n👉월요일 시작 ~ 수요일까지 pr, 리뷰\n👉목요일 시작 ~ 토요일까지 pr, 리뷰\n\n🔹picker bot의 슬래시(/) 명령어\n(-g가 붙어있지 않으면 본인에게만 메시지가 보입니다.)\n1. `/픽봇가이드`\n2. `/픽봇가이드-g`\n3. `/초기설정방법`\n4. `/초기설정방법-g`\n5. `/문제업데이트방법`\n6. `/문제업데이트방법-g`\n\n명령어를 입력하면 어디든지 나타납니다.\n(다이렉트 메시지 제외, picker bot을 각 채널에 초대하여야 합니다.)";

      if (global) {
        await this.app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          text,
        });
      } else {
        await this.app.client.chat.postEphemeral({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelId,
          text,
          user: userId,
        });
      }
      console.log("픽봇 가이드");
    } catch (err) {
      console.log("픽봇 가이드", err);
    }
  }
}

module.exports = SlackFunctions;
