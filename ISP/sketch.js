// Global variables
let canvas;
let recorder;
let soundFile;
let mySound;

let passfilters;
let waveshaperdistortion;
let Reverb;
let mastervolume;
let buttonsReferences;
let reverbEffect;
let filterEffect;
let waveshaperDistortionEffect;

let inputFft;
let outputFft;


function preload() {
    mySound = loadSound('/sounds/DSCW1Sound.wav');
    mySound.disconnect();
}


function setup() {
    // Initialising all effects
    Reverb = new reverb();
    passfilters = new lowpassfilters();
    waveshaperdistortion = new waveshaper();
    mastervolume = new masterVolume();

    // Button references
    const buttonsReferences = {
        pause: select('#pausebutton'),
        play: select('#playbutton'),
        stop: select('#stopbutton'),
        skipToStart: select('#skiptostartbutton'),
        skipToEnd: select('#skiptoendbutton'),
        loop: select('#loopbutton'),
        record: select('#recordbutton'),
    };

// Function to handle button clicks
const handleButtonClick = (action) => {
    return (e) => {
        switch (action) {
            case 'play':
                if (mySound.isLoaded() && !mySound.isPlaying())
                    mySound.play();
                break;

            case 'stop':
                mySound.stop();
                break;

            case 'pause':
                mySound.pause();
                break;

            case 'loop':
                if (mySound.isLooping()) {
                    mySound.noLoop();
                } else {
                    mySound.loop();
                }
                break;

            case 'record':
                let isRecBtnPressed = buttonsReferences.record.elt.ariaPressed === 'true';
                if (isRecBtnPressed) {
                    if (mySound.enabled) {
                        recorder.record(soundFile);
                    } else {
                        buttonsReferences.record.elt.ariaPressed = 'false';
                    }
                } else {
                    recorder.stop();
                    save(soundFile, 'audiofile.wav');
                }
                break;

            case 'skipToEnd':
                mySound.jump(mySound.duration() - 1);
                break;

            case 'skipToStart':
                mySound.jump(0);
                break;

            default:
                break;
        }
    };
};

    // Event listeners to correspoding buttons
    buttonsReferences.play.mouseClicked(handleButtonClick('play'));
    buttonsReferences.stop.mouseClicked(handleButtonClick('stop'));
    buttonsReferences.pause.mouseClicked(handleButtonClick('pause'));
    buttonsReferences.loop.mouseClicked(handleButtonClick('loop'));
    buttonsReferences.record.mouseClicked(handleButtonClick('record'));
    buttonsReferences.skipToEnd.mouseClicked(handleButtonClick('skipToEnd'));
    buttonsReferences.skipToStart.mouseClicked(handleButtonClick('skipToStart'));


    // Low, band and high pass filters event listeners
    passfilters.LowPass.mouseClicked((e) => {
        filterEffect.setType(passfilters.LowPass.value());
    });
    passfilters.BandPass.mouseClicked((e) => {
        filterEffect.setType(passfilters.BandPass.value());
    });
    passfilters.HighPass.mouseClicked((e) => {
        filterEffect.setType(passfilters.HighPass.value());
    });
    passfilters.cutoffFreq.mouseClicked((e) => {
        filterEffect.set(passfilters.cutoffFreq.value(), passfilters.resonance.value());
    });
    passfilters.resonance.mouseClicked((e) => {
        filterEffect.set(passfilters.cutoffFrequency.value(), passfilters.resonance.value());
    });
    passfilters.dryWet.mouseClicked((e) => {
        filterEffect.drywet(passfilters.dryWet.value());
    });
    passfilters.outputLevel.mouseClicked((e) => {
        filterEffect.amp(passfilters.outputLevel.value());
    });

    // Reverb controls event listeners
    Reverb.duration.mouseClicked((e) => {
        reverbEffect.set(Reverb.duration.value(), Reverb.decayRate.value(), Reverb.reverse.value());
    });
    Reverb.decayRate.mouseClicked((e) => {
        reverbEffect.set(Reverb.duration.value(), Reverb.decayRate.value(), Reverb.reverse.value());
    });
    Reverb.reverse.mouseClicked((e) => {
        reverbEffect.set(Reverb.duration.value(), Reverb.decayRate.value(), Reverb.reverse.value());
    });
    Reverb.dryWet.mouseClicked(() => {
        let dryWet = Reverb.dryWet.value();
        reverbEffect.drywet(dryWet);
    });
    Reverb.outputLevel.mouseClicked((e) => {
        let volume = Reverb.outputLevel.value();
        reverbEffect.amp(volume);
    });

    // Volume controls event listeners
    mastervolume.volume.mouseClicked((e) => {
        masterVolumeEffect.amp(mastervolume.volume.value());
    });

    // SoundRecorder initialisation
    recorder = new p5.SoundRecorder();
    soundFile = new p5.SoundFile();

    // LowPass Filter initialisation
    filterEffect = new p5.Filter();
    filterEffect.process(
        mySound,
        passfilters.cutoffFreq.value(),
        passfilters.resonance.value()
    );
    filterEffect.drywet(passfilters.dryWet.value());
    filterEffect.amp(passfilters.outputLevel.value());

    // Setting up WaveShaper Distortion
    waveshaperDistortionEffect = new p5.Distortion();
    waveshaperDistortionEffect.process(
        filterEffect,
        waveshaperdistortion.distortionAmount.value(),
        waveshaperdistortion.oversample.value() == 0
            ? 'none'
            : waveshaperdistortion.oversample.value() == 1
                ? '2x'
                : '4x'
    );
    waveshaperDistortionEffect.drywet(waveshaperdistortion.dryWet.value());
    waveshaperDistortionEffect.amp(waveshaperdistortion.outputLevel.value());


    // Reverb initialisation
    reverbEffect = new p5.Reverb();
    reverbEffect.process(
        waveshaperDistortionEffect,
        Reverb.duration.value(),
        Reverb.decayRate.value(),
        Reverb.reverse.value()
    );
    reverbEffect.drywet(Reverb.dryWet.value());
    reverbEffect.amp(Reverb.outputLevel.value());

    //Master Volume initialisation
    masterVolumeEffect = new p5.Gain();
    masterVolumeEffect.amp(mastervolume.volume.value());

    // All effects disconnecting
    waveshaperDistortionEffect.disconnect();
    filterEffect.disconnect();
    reverbEffect.disconnect();
    mySound.disconnect();

    //Connecting chain
    mySound.connect(filterEffect);
    filterEffect.connect(waveshaperDistortionEffect);
    waveshaperDistortionEffect.connect(reverbEffect);
    reverbEffect.connect(masterVolumeEffect);
    masterVolumeEffect.connect();

    // Setting up FFTs for Spectrum display
  inputFft = new p5.FFT();
    inputFft.setInput(mySound);
    outputFft = new p5.FFT()

    // Canvas for spectrum initialisation
    let canvasContainer = select('#spectrum');
    canvas = createCanvas(canvasContainer.width, canvasContainer.width / 4);
    canvas.background(200);
    canvas.parent('spectrum');
}

function draw() {
    background(255);
    const midPoint = canvas.width / 2;
    drawSpectrum(inputFft.analyze(), midPoint / 2, midPoint);
    drawSpectrum(outputFft.analyze(), midPoint, canvas.width - midPoint / 2);
}

function drawSpectrum(spectrum, startX, endX) {
    beginShape();
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 50, spectrum.length, startX, endX);
        let y = map(spectrum[i], 50, 255, canvas.height * 0.8, 1);
        vertex(x, y);
    }
    endShape();
}


function setupWaveshaperDistortionEvents(effect, settings) {
    settings.distortionAmount.mouseClicked(() => {
        const oversample = settings.oversample.value() === 0 ? 'none' : settings.oversample.value() === 1 ? '2x' : '4x';
        effect.set(settings.distortionAmount.value(), oversample);
    });

    settings.oversample.mouseClicked(() => {
        const oversample = settings.oversample.value() === 0 ? 'none' : settings.oversample.value() === 1 ? '2x' : '4x';
        effect.set(settings.distortionAmount.value(), oversample);
    });

    settings.dryWet.mouseClicked(() => {
        const dryWet = settings.dryWet.value();
        effect.drywet(dryWet);
    });

    settings.outputLevel.mouseClicked(() => {
        const volume = settings.outputLevel.value();
        effect.amp(volume);
    });
}

setupWaveshaperDistortionEvents(waveshaperDistortionEffect, waveshaperdistortion);
