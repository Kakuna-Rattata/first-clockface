import clock from 'clock';
import document from 'document';
import { preferences } from 'user-settings';
import { me as appbit } from 'appbit';
import { display } from 'display';
import { BodyPresenceSensor } from 'body-presence';
import { HeartRateSensor } from 'heart-rate';
import * as util from '../common/utils';

// UI elements
const timeLabel = document.getElementById('time-text-tag');
const timeLabelShadow = document.getElementById('time-shadow-text-tag');
const bpmLabel = document.getElementById('bpm-text-tag');
const stepsLabel = document.getElementById('steps-text-tag');

bpmLabel.text = '--';
stepsLabel.text = '--';

// TODO: get steps value

// App state
const state = {
  onWrist: false,
  displayIsOn: (display && display.on) || true
};

const updateSensor = (sensor, label = null) => {
  if (state.onWrist && state.displayIsOn) {
    sensor.start();
  } else {
    sensor.stop();

    if (label && label.text) {
      label.text = '--';
    }
  }
};

if (
  appbit &&
  appbit.permissions.granted('access_heart_rate') &&
  HeartRateSensor
) {
  const bpmSensor = new HeartRateSensor();

  bpmSensor.addEventListener('reading', () => {
    console.log(`Current heart rate: ${bpmSensor.heartRate}`);
    bpmLabel.text = `${bpmSensor.heartRate}`;
  });

  display &&
    display.addEventListener('change', () => {
      state.displayIsOn = display.on;
      console.log(
        `setting displayIsOn, updated state: ${JSON.stringify(state)}`
      );

      updateSensor(bpmSensor, bpmLabel);
    });

  if (appbit.permissions.granted('access_activity') && BodyPresenceSensor) {
    const bodySensor = new BodyPresenceSensor();

    state.onWrist = bodySensor && bodySensor.present;

    bodySensor &&
      bodySensor.addEventListener('reading', () => {
        state.onWrist = bodySensor.present;
        console.log(`setting onWrist, updated state: ${JSON.stringify(state)}`);

        updateSensor(bpmSensor, bpmLabel);
      });

    bodySensor.start();
  }
}

// Update the clock every minute
clock.granularity = 'minutes';

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

// TODO: add day and night mode variations and transition, add settings to set the transition time
