import clock from 'clock';
import document from 'document';
import { preferences } from 'user-settings';
import * as util from '../common/utils';

// Update the clock every minute
clock.granularity = 'minutes';

const timeLabel = document.getElementById('time-text-tag');
const timeLabelShadow = document.getElementById('time-shadow-text-tag');

// Update the <text> element every tick with the current time
clock.ontick = evt => {
  let today = evt.date;
  let hours = today.getHours();

  if (preferences.clockDisplay === '12h') {
    hours = hours % 12 || 12; // 12h format
  } else {
    hours = util.zeroPad(hours); // 24h format
  }

  let mins = util.zeroPad(today.getMinutes());
  timeLabel.text = `${hours}:${mins}`;
  timeLabelShadow.text = `${hours}:${mins}`;
};
