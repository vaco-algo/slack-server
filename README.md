# slack-server

<img align="center" width="671" alt="pickbot" src="https://github.com/vaco-algo/slack-server/assets/84281505/065db85e-cc9a-4f82-8a39-10d1b7b26685">

알고리즘 참가 신청을 받고, 랜덤 리뷰어를 배정하는 슬랙봇입니다.🥸

## Log

- 23.02.13
  - wake up 요청 에러 때문에 서버 재부팅 돼서 참가 인원 내역이 사라짐
  - DB를 추가해야 할듯.
- 23.02.15
  - DB 추가
  - 서버 wake up 슬랙 메시지로 변경 (wakeup 라우트 get error로 인해 서버 터짐)
- 23.06.13
  - cron 예약 버그로 EC2로 배포 방법 변경

## 서버 테스트하기

- `ngrok http 8080`

- [slash](https://api.slack.com/apps/A04EDP4MHT7/slash-commands?saved=1)
- [Interactivity](https://api.slack.com/apps/A04EDP4MHT7/interactive-messages?)
- [Events](https://api.slack.com/apps/A04EDP4MHT7/event-subscriptions?)
