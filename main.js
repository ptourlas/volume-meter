/** Declare a context for AudioContext object */
let audioContext

let ledColor = Array(26).fill("#00FF00")

for (let i = 0; i < 5; i++) {
    ledColor[i] = '#FF0000'
}

for (let i = 21; i < 26; i++) {
    ledColor[i] = '#FF0000'
}


let isFirstClick = true
let _listening = false
let _current_message = null

function onMicrophoneDenied() {
    console.log('denied')
}

/**
 * Update leds on the screen
 * 
 * @param {Float} vol volume returned from AudioWorkletProcessor (in the unit interval)
 */
function leds(vol) {

    let leds = [...document.getElementsByClassName('select-led')]

    /*
        The number of leds in the current implementation is 26.
        A suitable abstraction would be leds.length while also
        unifying the array defined on top of the module with the
        selection returned at the start of the function.
    */
    const _map_vol_to_led_range = Math.round(vol*25)
    
    /* Reset all leds before updating them. */
    for (var i = 0; i < leds.length; i++) {
        leds[i].style.backgroundColor = '#313237'
    }

    for (var i = 0; i < _map_vol_to_led_range; i++) {
        leds[i].style.backgroundColor = `${ledColor[i]}`
    }
}

async function onMicrophoneGranted(stream) {
   
    if (isFirstClick) {

        audioContext = new AudioContext()

        // Add an AudioWorkletProcessor from another script with addModule method
        await audioContext.audioWorklet.addModule('volmeter-processor.js')

        // Create a MediaStreamSource object and send a MediaStream object granted by the user
        let microphone = audioContext.createMediaStreamSource(stream)

        // Create AudioWorkletNode sending context and name of processor registered in vumeter-processor.js
        const node = new AudioWorkletNode(audioContext, 'volume_meter')

        // Listing any message from AudioWorkletProcessor in its
        // process method here where you can know
        // the volume level
        node.port.onmessage = event => {

            let _volume = 0
            let _rms = 0
            let _dB = 0
            
            _current_message = event.data

            if (!_listening) console.log('latest readings:', event.data)

            if (event.data.volume) {
                _volume = event.data.volume
                _rms = event.data.rms
                _dB = event.data.dB
            }
            
            leds(_volume)

            document.getElementById('vol-output').innerHTML = _volume.toFixed(5)
            document.getElementById('rms-output').innerHTML = _rms.toFixed(5)
            document.getElementById('db-output').innerHTML  = _dB.toFixed(5)
        }

        /**
         * Connect the microphone to the AudioWorkletNode 
         * and output from audioContext. Note that the end
         * destination is the final node of the audio graph.
         */
        microphone.connect(node) 
        /*
            .connect(audioContext.destination) could follow
            the above expression (i.e. connect the speakers),
            but we only need the readings, not an output device
        */

        /*
            This block only has to be run once, initializing the
            media stream source, the worklet and the callback that
            handles the messages from the AudioWorkletProcessor.
            Then it's only a matter of suspending/resuming the
            audioContext.
        */
        isFirstClick = false 
    }

    if (_listening) {
        audioContext.suspend()
    } else {
        audioContext.resume()
    }

    _listening = !_listening
}

/**
 * Ask permission to use the microphone.
 */
function activeSound () {
    try {
        
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then( 
            stream => onMicrophoneGranted(stream)
        )
        .catch( onMicrophoneDenied )

    } catch(e) {
        alert(e)
    }
}

document.getElementById('audio').addEventListener('click', () => {
    activeSound()
})