audio-meddle
===

Route Web Audio API audio nodes through schedulable chains of processor nodes.

## Install

```bash
$ npm install audio-meddle
```

## API

```js
var createMeddler = require('audio-meddle')
```

### createMeddler(audioContext)

Create a [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) instance.

### node.add(id, processorNode)

Add a node to be used for meddling the input audio.

### node.remove(id)

Remove a node from meddlation.

### node.start(id, when)

Start routing audio through the processor node adding using `node.add()` with `id` specified. This can be called multiple times with difference ids and the processors will be chained in the order called.

### node.stop(id, when)

Stop routing audio through the processor node specified by id at the given time.

### node.connect()

Connect the [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) to a destination.

### node.disconnect()

Disconnect from all destination nodes.