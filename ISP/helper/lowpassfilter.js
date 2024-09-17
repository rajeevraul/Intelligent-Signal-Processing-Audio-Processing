class lowpassfilters {
    constructor() {
        this.LowPass = select('#LowPass');
        this.BandPass = select('#BandPass');
        this.HighPass = select('#HighPass');
        this.cutoffFreq = select('#CutoffFreq');
        this.resonance = select('#ResFreq');
        this.dryWet = select('#DryWet');
        this.outputLevel = select('#Output');
    }
}
