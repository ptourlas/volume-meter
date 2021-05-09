const SMOOTHING_FACTOR = 0.8;
const MINIMUM_VALUE = 0.00001;

/*
  Register an AudioWorkletProcessor
  (declaring a name is necessary)
*/
registerProcessor('volume_meter', class extends AudioWorkletProcessor {

  _volume
  _updateIntervalInMS
  _nextUpdateFrame

  constructor () {
    super();
    this._volume = 0;
    this._updateIntervalInMS = 25;
    this._nextUpdateFrame = this._updateIntervalInMS;
    this.port.onmessage = event => {
      if (event.data.updateIntervalInMS)
        this._updateIntervalInMS = event.data.updateIntervalInMS;
    }
  }

  get intervalInFrames () {
    return this._updateIntervalInMS / 1000 * sampleRate;
  }

  process (inputs, outputs, parameters) {
    /*
      An array of inputs connected to the node. Εach input is an array of channels.
      Each channel is a Float32Array containing 128 samples.
      For example,
      inputs[n][m][i] 
             |  |  |
             |  |  i-th sample of that channel
             |  m-th channel of that input
             n-th input

      Each sample value is in range of [-1 .. 1].
    */
    const input = inputs[0];

    if (input.length > 0) {
      const samples = input[0];

      let square_sum = 0
      let rms = 0
      let dB  = 0

      for (let i = 0; i < samples.length; ++i)
        square_sum += samples[i] * samples[i];

      /** Get the root-mean square. */
      rms = Math.sqrt(square_sum / samples.length);
      
      dB = 20 * (Math.log10(rms))
      this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR);

      // Update and sync the volume property with the main thread.
      this._nextUpdateFrame -= samples.length;
      if (this._nextUpdateFrame < 0) {
        this._nextUpdateFrame += this.intervalInFrames;
        
        this.port.postMessage({
        
          samples: samples,
          volume: this._volume,
          rms: rms,
          dB: dB

        });
      }
    }
    
    return true;
  }
});
