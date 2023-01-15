const schedule = require("node-schedule");

class SetScheduler {
  constructor(slackFuncs) {
    this.slackFunctions = slackFuncs;
    this.sameRules = {
      dayOfWeek: [2, 4],
      tz: "Asia/Seoul",
    };
    this.obj = {
      wakeupServerObj: null,
      sendProblemUrlObj: null,
      morningSheduleObj: null,
      reviewerSheduleObj: null,
      timeOutMessageSheduleObj: null,
    };
    this.rules = {};
  }

  setScheduling() {
    console.log("스케줄 설정 완료!");

    this.rules.morningMessagehRule = new schedule.RecurrenceRule();
    this.rules.reviewerMatchRule = new schedule.RecurrenceRule();
    this.rules.sendProblemUrlRule = new schedule.RecurrenceRule();
    this.rules.timeOutMesssageRule = new schedule.RecurrenceRule();
    const wakeupRule = new schedule.RecurrenceRule();

    wakeupRule.minute = new schedule.Range(0, 59, 14);

    this.rules.morningMessageRule = {
      ...this.rules.morningMessagehRule,
      ...this.sameRules,
      hour: 9,
      minute: 30,
    };

    this.rules.reviewerMatchRule = {
      ...this.rules.reviewerMatchRule,
      ...this.sameRules,
      hour: 10,
      minute: 30,
    };

    this.rules.sendProblemUrlRule = {
      ...this.rules.sendProblemUrlRule,
      ...this.sameRules,
      hour: 10,
      minute: 59,
    };

    this.rules.timeOutMesssageRule = {
      ...this.rules.timeOutMesssageRule,
      ...this.sameRules,
      hour: 12,
      minute: 30,
    };

    const wakeupServerJob = schedule.scheduleJob(wakeupRule, () => {
      this.slackFunctions.wakeupServer();
    });

    const sendProblemUrlJob = schedule.scheduleJob(
      this.rules.sendProblemUrlRule,
      () => {
        console.log("문제 업로드 스타트");
        this.slackFunctions.sendLeetcodeUrl();
      }
    );

    const morningMessageJob = schedule.scheduleJob(
      this.rules.morningMessageRule,
      () => {
        console.log("모닝 메시지 스타트");
        this.slackFunctions.sendMorningMessage();
      }
    );

    const sendReviewerJob = schedule.scheduleJob(
      this.rules.reviewerMatchRule,
      () => {
        console.log("리뷰어 매치 스타트");
        this.slackFunctions.sendReviewer();
      }
    );

    const timeOutMesssageJob = schedule.scheduleJob(
      this.rules.timeOutMesssageRule,
      () => {
        console.log("타임아웃 메시지 스타트");
        this.slackFunctions.timeOutMessage();
      }
    );

    this.obj.wakeupServerObj = wakeupServerJob;
    this.obj.sendProblemUrlObj = sendProblemUrlJob;
    this.obj.morningMessageObj = morningMessageJob;
    this.obj.reviewerMessageObj = sendReviewerJob;
    this.obj.timeOutMessageObj = timeOutMesssageJob;
  }

  initializeJob() {
    console.log("스케줄 초기화 완료!");

    if (this.obj.wakeupServerObj) this.obj.wakeupServerObj.cancel();
    if (this.obj.sendProblemUrlObj) this.obj.sendProblemUrlObj.cancel();
    if (this.obj.morningMessageObj) this.obj.morningMessageObj.cancel();
    if (this.obj.reviewerMessageObj) this.obj.reviewerMessageObj.cancel();
    if (this.obj.timeOutMessageObj) this.obj.timeOutMessageObj.cancel();
  }
}

module.exports = SetScheduler;
