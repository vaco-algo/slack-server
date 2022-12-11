function setSchedule(hour, minute) {
  const schedule = new Date();
  const today = schedule.getDay();
  schedule.setHours(hour - 9, minute, 0);

  if (today % 2 !== 0) {
    schedule.setDate(schedule.getDate() + 1);
  }

  if (today === 0 || today === 2 || today === 4) {
    schedule.setDate(schedule.getDate() + 2);
  }

  if (today === 6) {
    schedule.setDate(schedule.getDate() + 1);
  }

  return schedule.getTime() / 1000;
}

module.exports = setSchedule;
