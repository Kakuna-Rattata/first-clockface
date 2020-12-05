import clock from 'clock';
import document from 'document';
import { preferences } from 'user-settings';
import { me as appbit } from 'appbit';
import { display } from 'display';
import { today } from 'user-activity';
import { BodyPresenceSensor } from 'body-presence';
import { HeartRateSensor } from 'heart-rate';

import * as util from '../common/utils';

// TODO: add day and night mode variations and transition, add settings to set the transition time

// UI elements
const timeLabel = document.getElementById('time-text-tag');
const timeLabelShadow = document.getElementById('time-shadow-text-tag');
const bpmLabel = document.getElementById('bpm-text-tag');
const stepsLabel = document.getElementById('steps-text-tag');

bpmLabel.text = '--';
stepsLabel.text = '--';

// App state
const state = {
  onWrist: false,
  displayIsOn: (display && display.on) || true,
  bpmSensor: {}
};

const permissions = {
  heartRate: appbit && appbit.permissions.granted('access_heart_rate'),
  activity: appbit && appbit.permissions.granted('access_activity')
};

const updateSensor = (sensor, label = null) => {
  if (state.onWrist && state.displayIsOn) {
    sensor.start();
  } else {
    sensor.stop();

    if (label) {
      label.text = '--';
    }
  }
};

const updateStepsValue = () => {
  if (permissions.activity && state.displayIsOn) {
    console.log('Updating steps');

    // Display today's steps value
    if (today && today.adjusted && today.adjusted.steps && stepsLabel) {
      stepsLabel.text = `${util.formatNumericStrings(today.adjusted.steps)}`;
    }
  }
};

if (display) {
  updateStepsValue(); // set steps on app load

  display.addEventListener('change', () => {
    state.displayIsOn = display.on;

    console.log(`setting displayIsOn, updated state: ${JSON.stringify(state)}`);

    if (state.bpmSensor) {
      // Sense heart rate when screen is switched on
      updateSensor(state.bpmSensor, bpmLabel);
    }

    // Update steps when screen is switched on
    updateStepsValue();
  });
}

if (permissions.heartRate && HeartRateSensor) {
  const bpmSensor = new HeartRateSensor();
  state.bpmSensor = bpmSensor;

  if (bpmSensor) {
    // Listen for heart rate readings and update UI label
    bpmSensor.addEventListener('reading', () => {
      if (bpmLabel) {
        bpmLabel.text = `${bpmSensor.heartRate}`;
      }
    });
  }
}

if (permissions.activity) {
  const bpmSensor = state.bpmSensor;

  // Sense heart rate when watch is being worn
  if (bpmSensor && BodyPresenceSensor) {
    const bodySensor = new BodyPresenceSensor();

    if (bodySensor) {
      state.onWrist = bodySensor.present;

      bodySensor.addEventListener('reading', () => {
        state.onWrist = bodySensor.present;

        console.log(`setting onWrist, updated state: ${JSON.stringify(state)}`);

        updateSensor(bpmSensor, bpmLabel);
      });

      bodySensor.start();
    }
  }
}

if (clock) {
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
    if (timeLabel) {
      timeLabel.text = `${hours}:${mins}`;
    }

    if (timeLabelShadow) {
      timeLabelShadow.text = timeLabel.text;
    }
  };
}
