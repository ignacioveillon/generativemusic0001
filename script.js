let audioContext = null; // Initialize to null
let finalGainNode = null;
let oscillators = [];
let gainNodes = [];
let sawtoothOscillator = null;
const fundamentalFrequency = 32.703 * 2;
const numberOfWaves = 128;

function initializeAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    finalGainNode = audioContext.createGain();
    finalGainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    finalGainNode.connect(audioContext.destination);

    startOscillators();
  }

  // Resume the AudioContext if it is suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function setup() {
  const sawtoothButton = document.getElementById('sawtoothButton');
  const stopSawtoothButton = document.getElementById('stopSawtoothButton');
  const triggerAllEnvelopesButton = document.getElementById('triggerAllEnvelopesButton');
  const triggerDecreaseEnvelopesButton = document.getElementById('triggerDecreaseEnvelopesButton');

  // Attach event listeners
  sawtoothButton.addEventListener('click', () => {
    initializeAudioContext();
    startSawtoothOscillator();
  });

  stopSawtoothButton.addEventListener('click', stopSawtoothOscillator);
  triggerAllEnvelopesButton.addEventListener('click', () => {
    initializeAudioContext();
    triggerAllEnvelopes();
  });
  triggerDecreaseEnvelopesButton.addEventListener('click', () => {
    initializeAudioContext();
    triggerDecreaseEnvelopes();
  });

  // Start the oscillators on user interaction
  const oscillatorsContainer = document.getElementById('oscillatorsContainer');
  oscillatorsContainer.addEventListener('click', initializeAudioContext);
}

function startOscillators() {
  oscillators = [];
  gainNodes = [];

  const oscillatorsContainer = document.getElementById('oscillatorsContainer');
  oscillatorsContainer.innerHTML = '';

  const startTime = audioContext.currentTime + 0.1;

  for (let i = 0; i < numberOfWaves; i++) {
    const oscillatorFrequency = fundamentalFrequency * (i + 1);
    const oscillatorAmplitude = 0;

    const oscillator = audioContext.createOscillator();
    oscillator.frequency.setValueAtTime(oscillatorFrequency, startTime);
    oscillator.type = 'sine';

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(oscillatorAmplitude, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(finalGainNode);

    const oscillatorContainer = document.createElement('div');
    oscillatorContainer.className = 'oscillator-container';

    const amplitudeDisplay = document.createElement('div');
    amplitudeDisplay.className = 'amplitude-display';
    amplitudeDisplay.id = `amplitudeDisplay${i + 1}`;
    amplitudeDisplay.textContent = `Oscillator ${i + 1} Amplitude = ${oscillatorAmplitude.toFixed(3)}`;
    oscillatorContainer.appendChild(amplitudeDisplay);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '0.25';
    slider.step = '0.001';
    slider.value = oscillatorAmplitude;
    slider.className = 'amplitude-slider';
    oscillatorContainer.appendChild(slider);

    slider.addEventListener('input', () => {
      const newAmplitude = parseFloat(slider.value);
      gainNode.gain.setValueAtTime(newAmplitude, audioContext.currentTime);
    });

    oscillatorsContainer.appendChild(oscillatorContainer);

    oscillator.start(startTime);

    oscillators.push(oscillator);
    gainNodes.push(gainNode);

    updateAmplitudeDisplay(gainNode, amplitudeDisplay, slider, i);

    // Add specific controls for Oscillator 5
    if (i === 4) {
      addOscillator5Controls(oscillatorsContainer, gainNode, amplitudeDisplay, slider);
    }
  }
}

function addOscillator5Controls(parentContainer, gainNode, amplitudeDisplay, slider) {
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'oscillator-5-controls';

  // Timer for sound duration
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'oscillator5Timer';
  timerDisplay.textContent = 'Sound in seconds: 0';
  controlsContainer.appendChild(timerDisplay);

  // Timer for silence duration
  const silenceTimerDisplay = document.createElement('div');
  silenceTimerDisplay.id = 'oscillator5SilenceTimer';
  silenceTimerDisplay.textContent = 'Silence in seconds: 0';
  controlsContainer.appendChild(silenceTimerDisplay);

  // Envelope button
  const envelopeButton = document.createElement('button');
  envelopeButton.textContent = 'Start Oscillator 5 Envelope';
  envelopeButton.addEventListener('click', () =>
    startOscillator5Envelope(gainNode, timerDisplay, silenceTimerDisplay, amplitudeDisplay, slider)
  );
  controlsContainer.appendChild(envelopeButton);

  parentContainer.appendChild(controlsContainer);
}

function updateAmplitudeDisplay(gainNode, amplitudeDisplay, slider, i) {
  function update() {
    const currentGainValue = gainNode.gain.value;
    amplitudeDisplay.textContent = `Oscillator ${i + 1} Amplitude = ${currentGainValue.toFixed(3)}`;
    slider.value = currentGainValue.toFixed(3);
    requestAnimationFrame(update);
  }
  update();
}

function startOscillator5Envelope(gainNode, timerDisplay, silenceTimerDisplay, amplitudeDisplay, slider) {
  const targetAmplitude = 0.25 / 5;

  let silenceElapsed = 0; // Silence timer starts from 0
  let silenceInterval;

  const triggerEnvelope = () => {
    const currentTime = audioContext.currentTime;

    // Reset and stop the silence timer
    clearInterval(silenceInterval);
    silenceElapsed = 0;
    silenceTimerDisplay.textContent = 'Silence in seconds: 0';

    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(targetAmplitude, currentTime + 4);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 8);

    // Update Sound Timer
    let elapsed = 1; // Start with "Sound in seconds: 1"
    timerDisplay.textContent = `Sound in seconds: ${elapsed}`;
    const timerInterval = setInterval(() => {
      elapsed++;
      if (elapsed <= 8) {
        timerDisplay.textContent = `Sound in seconds: ${elapsed}`;
      } else {
        clearInterval(timerInterval);
        timerDisplay.textContent = 'Sound in seconds: 0';

        // Start the Silence Timer after sound ends
        silenceElapsed = 1; // Start silence timer from 1
        silenceTimerDisplay.textContent = `Silence in seconds: ${silenceElapsed}`;
        silenceInterval = setInterval(() => {
          silenceElapsed++;
          silenceTimerDisplay.textContent = `Silence in seconds: ${silenceElapsed}`;
        }, 1000);
      }
    }, 1000);

    // Sync Slider and Display
    const updateInterval = setInterval(() => {
      const currentGainValue = gainNode.gain.value;
      amplitudeDisplay.textContent = `Oscillator 5 Amplitude = ${currentGainValue.toFixed(3)}`;
      slider.value = currentGainValue.toFixed(3);
    }, 100);

    setTimeout(() => {
      clearInterval(updateInterval);
      scheduleNextTrigger();
    }, 8000);
  };

  const scheduleNextTrigger = () => {
    setTimeout(triggerEnvelope, Math.random() * 8000);
  };

  triggerEnvelope();
}

function startSawtoothOscillator() {
  if (sawtoothOscillator) {
    console.warn("Sawtooth oscillator is already running.");
    return;
  }

  const startTime = audioContext.currentTime + 0.1;
  sawtoothOscillator = audioContext.createOscillator();
  const sawtoothGain = audioContext.createGain();

  sawtoothOscillator.type = 'sawtooth';
  sawtoothOscillator.frequency.setValueAtTime(fundamentalFrequency, startTime);

  sawtoothGain.gain.setValueAtTime(0.5, audioContext.currentTime);

  sawtoothOscillator.connect(sawtoothGain);
  sawtoothGain.connect(finalGainNode);

  sawtoothOscillator.start(startTime);
}

function stopSawtoothOscillator() {
  if (sawtoothOscillator) {
    sawtoothOscillator.stop();
    sawtoothOscillator.disconnect();
    sawtoothOscillator = null;
  } else {
    console.warn("Sawtooth oscillator is not running.");
  }
}

function triggerAllEnvelopes() {
  const currentTime = audioContext.currentTime;

  gainNodes.forEach((gainNode, index) => {
    const targetAmplitude = 0.25 / (index + 1);

    gainNode.gain.cancelScheduledValues(currentTime);

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(targetAmplitude, currentTime + 4);
    gainNode.gain.setValueAtTime(targetAmplitude, currentTime + 4);
  });
}

function triggerDecreaseEnvelopes() {
  const currentTime = audioContext.currentTime;

  gainNodes.forEach((gainNode, index) => {
    const initialAmplitude = 0.25 / (index + 1);
    const finalAmplitude = 0;

    gainNode.gain.cancelScheduledValues(currentTime);

    gainNode.gain.setValueAtTime(initialAmplitude, currentTime);
    gainNode.gain.linearRampToValueAtTime(finalAmplitude, currentTime + 4);
    gainNode.gain.setValueAtTime(finalAmplitude, currentTime + 4);
  });
}

window.onload = setup;