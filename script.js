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

  triggerBothEnvelopesButton.addEventListener('click', () => {
    initializeAudioContext();
    startBothEnvelopes();
  });

    
  // Ensure initializeAudioContext is called once when clicking on the body
  let isAudioContextInitialized = false; // Ensure it is called only once
  document.body.addEventListener('click', (event) => {
    if (isAudioContextInitialized) return;  // If already initialized, do nothing

    // Make sure the click is not on any of the buttons
    const excludedElements = [
      sawtoothButton,
      stopSawtoothButton,
      triggerAllEnvelopesButton,
      triggerDecreaseEnvelopesButton,
    ];

    // Check if the click is on any of the excluded buttons or their children
    const isClickOnExcludedElement = excludedElements.some((button) =>
      button.contains(event.target)
    );

    // If not on excluded elements, initialize AudioContext
    if (!isClickOnExcludedElement) {
      initializeAudioContext();
      isAudioContextInitialized = true;  // Mark as initialized, so it doesn't trigger again
    }
  });

  initializeAudioContext();
  
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

    // Add specific controls for Oscillator 4
    if (i === 3) {
      addOscillator4Controls(oscillatorsContainer, gainNode, amplitudeDisplay, slider);
    }

    // Add specific controls for Oscillator 5
    if (i === 4) {
      addOscillator5Controls(oscillatorsContainer, gainNode, amplitudeDisplay, slider);
    }
  }
}


function addOscillator4Controls(parentContainer, gainNode, amplitudeDisplay, slider) {
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'oscillator-4-controls';

  // Timer for sound duration
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'oscillator4Timer';
  timerDisplay.textContent = 'Beats of sound: 0';
  controlsContainer.appendChild(timerDisplay);

  // Timer for silence duration
  const silenceTimerDisplay = document.createElement('div');
  silenceTimerDisplay.id = 'oscillator4SilenceTimer';
  silenceTimerDisplay.textContent = 'Beats of silence: 0';
  controlsContainer.appendChild(silenceTimerDisplay);

  // Envelope button
  const envelopeButton = document.createElement('button');
  envelopeButton.textContent = 'Start Oscillator 4 Envelope';
  envelopeButton.addEventListener('click', () =>
    startOscillator4Envelope(gainNode, timerDisplay, silenceTimerDisplay, amplitudeDisplay, slider)
  );
  controlsContainer.appendChild(envelopeButton);

  parentContainer.appendChild(controlsContainer);
}



function addOscillator5Controls(parentContainer, gainNode, amplitudeDisplay, slider) {
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'oscillator-5-controls';

  // Timer for sound duration
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'oscillator5Timer';
  timerDisplay.textContent = 'Beats of sound: 0';
  controlsContainer.appendChild(timerDisplay);

  // Timer for silence duration
  const silenceTimerDisplay = document.createElement('div');
  silenceTimerDisplay.id = 'oscillator5SilenceTimer';
  silenceTimerDisplay.textContent = 'Beats of silence: 0';
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
    // Force initial value to 0 for both slider and gain node immediately
    gainNode.gain.value = 0; // Set gain to 0 directly

    // Force a repaint before setting the slider
    slider.offsetHeight; // This forces a reflow/repaint

    slider.value = 0;

    function update() {
        const currentGainValue = gainNode.gain.value;

        amplitudeDisplay.textContent = `Oscillator ${i + 1} Amplitude = ${currentGainValue.toFixed(3)}`;

        // Only update slider if it's not being changed by user input
        if (document.activeElement !== slider) {
            slider.value = currentGainValue.toFixed(3);
        }

        requestAnimationFrame(update); // Keep updating every frame
    }

    // Start the update loop
    update();
}


function startBothEnvelopes() {
  const gainNode4 = gainNodes[3];
  const gainNode5 = gainNodes[4];

  const timerDisplay4 = document.getElementById('oscillator4Timer');
  const silenceTimerDisplay4 = document.getElementById('oscillator4SilenceTimer');
  const amplitudeDisplay4 = document.getElementById('amplitudeDisplay4');
  const slider4 = document.querySelector('#oscillatorsContainer input:nth-child(8)');

  const timerDisplay5 = document.getElementById('oscillator5Timer');
  const silenceTimerDisplay5 = document.getElementById('oscillator5SilenceTimer');
  const amplitudeDisplay5 = document.getElementById('amplitudeDisplay5');
  const slider5 = document.querySelector('#oscillatorsContainer input:nth-child(9)');

  if (gainNode4 && gainNode5) {
    startOscillator4Envelope(gainNode4, timerDisplay4, silenceTimerDisplay4, amplitudeDisplay4, slider4);
    startOscillator5Envelope(gainNode5, timerDisplay5, silenceTimerDisplay5, amplitudeDisplay5, slider5);
  } else {
    console.error("Oscillators 4 or 5 are not properly initialized.");
  }
}



function startOscillator4Envelope(gainNode, timerDisplay, silenceTimerDisplay, amplitudeDisplay, slider) {
  const targetAmplitude = 0.25 / 4; // Adjusted for Oscillator 4

  let silenceElapsed = 0; // Silence timer starts from 0
  let silenceInterval;

  const triggerEnvelope = () => {
    const currentTime = audioContext.currentTime;

    // Reset and stop the silence timer
    clearInterval(silenceInterval);
    silenceElapsed = 0;
    silenceTimerDisplay.textContent = 'Beats of silence: 0';

    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(targetAmplitude, currentTime + 4);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 8);

    // Update Sound Timer
    let elapsed = 1; // Start with "Beats of sound: 1"
    timerDisplay.textContent = `Beats of sound: ${elapsed}`;
    const timerInterval = setInterval(() => {
      elapsed++;
      if (elapsed <= 8) {
        timerDisplay.textContent = `Beats of sound: ${elapsed}`;
      } else {
        clearInterval(timerInterval);
        timerDisplay.textContent = 'Beats of sound: 0';

        // Start the Silence Timer after sound ends
        silenceElapsed = 1; // Start silence timer from 1
        silenceTimerDisplay.textContent = `Beats of silence: ${silenceElapsed}`;
        silenceInterval = setInterval(() => {
          silenceElapsed++;
          silenceTimerDisplay.textContent = `Beats of silence: ${silenceElapsed}`;
        }, 1000);
      }
    }, 1000);

    // Sync Slider and Display
    const updateInterval = setInterval(() => {
      const currentGainValue = gainNode.gain.value;
      amplitudeDisplay.textContent = `Oscillator 4 Amplitude = ${currentGainValue.toFixed(3)}`;
      slider.value = currentGainValue.toFixed(3);
    }, 100);

    setTimeout(() => {
      clearInterval(updateInterval);
      scheduleNextTrigger();
    }, 8000);
  };

  const scheduleNextTrigger = () => {
    setTimeout(triggerEnvelope, (Math.floor(Math.random() * 8) + 1) * 1000);
  };

  triggerEnvelope();
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
    silenceTimerDisplay.textContent = 'Beats of silence: 0';

    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(targetAmplitude, currentTime + 4);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + 8);

    // Update Sound Timer
    let elapsed = 1; // Start with "Beats of sound: 1"
    timerDisplay.textContent = `Beats of sound: ${elapsed}`;
    console.log(`Timer Display Initialized: ${timerDisplay.textContent}`); // Debug message

    const timerInterval = setInterval(() => {
      elapsed++;
      if (elapsed <= 8) {
        timerDisplay.textContent = `Beats of sound: ${elapsed}`;
        console.log(`Updating Timer Display: ${timerDisplay.textContent}`); // Debug message
      } else {
        clearInterval(timerInterval);
        timerDisplay.textContent = 'Beats of sound: 0';
        console.log(`Sound Timer Complete: ${timerDisplay.textContent}`); // Debug message

        // Start the Silence Timer after sound ends
        silenceElapsed = 1; // Start silence timer from 1
        silenceTimerDisplay.textContent = `Beats of silence: ${silenceElapsed}`;
        silenceInterval = setInterval(() => {
          silenceElapsed++;
          silenceTimerDisplay.textContent = `Beats of silence: ${silenceElapsed}`;
          console.log(`Silence Timer Updating: ${silenceTimerDisplay.textContent}`); // Debug message
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
    setTimeout(triggerEnvelope, (Math.floor(Math.random() * 8) + 1) * 1000);
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
