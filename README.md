# Simple volume meter - Revisited

## A new implementation of Chris Wilson's volume meter.

Although still available for use in some browsers,
the ScriptProcessorNode API has been marked as deprecated.

Its main drawbacks have been:

* Lack of detailed specification. This leads to browsers having their own implementations with inconsistent results when used in different environments.

* Use of the main JS thread. When this thread is tasked with some intensive
UI-related task, things like stuttering or drop-outs may be noticed.
In general, using the main thread for both UI and DOM-related as well as audio
processing can make an app less responsive.

This implementation uses the AudioWorklet API which allows user-supplied
scripts for audio processing to run in the Web Audio API thread without
blocking the main (UI) thread.

A deep-down explanation of this concept is available 
[here](https://developers.google.com/web/updates/2017/12/audio-worklet).

## Show me the code!

* `main.js` :
get mic access through the getUserMedia API, receive messages
from the processor and visualize the info available

* `volmeter-processor.js` :
this is where the background magic happens

## Show me the demo!

I cheated a bit here, you'll need python 3. Just clone and run

`python3 -m http.server 3001`

then open `localhost:3001` and see the tool at work.