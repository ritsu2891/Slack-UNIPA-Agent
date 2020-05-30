var { DateTime, Duration, Interval } = require('luxon');
const { margeLuxonDateTimeObject } = require('./util');

function parseInputTime(text) {
  let startTimeWordIdx = null;
  let endTimeWordIdx = null;
  let dateDt = null;
  words = text.split(' ');

  switch (words.length) {
    case 3:
      startTimeWordIdx = 0;
      endTimeWordIdx = 1;
      dateDt = DateTime.local();
      building = words[2];
      break;
    case 4:
      startTimeWordIdx = 1;
      endTimeWordIdx = 2;
      try {
        const dateWord = words[0];
        if (/^\d+$/.test(dateWord)) {
          dateDt = DateTime.local().plus(Duration.fromObject({day: parseInt(words[0])}));
        } else {
          const dateWordElem = dateWord.split('/');
          if (dateWordElem.length < 2 || 3 < dateWordElem.length) {
            throw new Error();
          }
          dateDt = DateTime.fromObject({
            year: parseInt(dateWordElem[0]),
            month: parseInt(dateWordElem[1]),
            day: parseInt(dateWordElem[2]),
          });
        }
      } catch (e) {
        return {
          success: false,
          message: '> 日付指定が不正です📅'
        };
      }
      building = words[3];
      break;
    default:
      return {
        success: false,
        message: '> パラメータの数がおかしいようです🙄'
      };
  }

  try {
    let dtInvalid = [];
    const startTimeDt = DateTime.fromFormat(words[startTimeWordIdx], "H:mm");
    const endTimeDt = DateTime.fromFormat(words[endTimeWordIdx], "H:mm");
    
    if (startTimeDt.invalid) {
      dtInvalid.push("> 開始時刻が不正です🕒");
    }
    if (endTimeDt.invalid) {
      dtInvalid.push("> 終了時刻が不正です🕒");
    }
    if (dtInvalid.length > 0) {
      return {
        success: false,
        message: dtInvalid.join('\n')
      };
    }

    const startDt = margeLuxonDateTimeObject(dateDt, startTimeDt);
    const endDt = margeLuxonDateTimeObject(dateDt, endTimeDt);

    const requestItvl = Interval.fromDateTimes(startDt, endDt);

    if (requestItvl.invalid) {
      return {
        success: false,
        message: "> 開始時刻と終了時刻の順番がおかしいようです🧐"
      }
    }

    return {
      success: true,
      timeRange: requestItvl,
      building
    }
  } catch (e) {
    return {
      success: false,
      message: "> 不明なエラー"
    }
  }
}

module.exports = {parseInputTime}