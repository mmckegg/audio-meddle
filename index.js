var createAudioNode = require('custom-audio-node')

module.exports = function(audioContext){
  var input = audioContext.createGain()
  var output = audioContext.createGain()
  var node = createAudioNode(input, output)

  input.connect(output)

  node._meddlers = {}
  node.add = add
  node.remove = remove

  node._active = []
  node._input = input
  node._output = output
  node.start = start
  node.stop = stop

  return node

}

function add(name, node){
  this._meddlers[name] = node
}

function remove(name){
  this._meddlers[name] = null
}

function start(name, at){
  if (this._meddlers[name] && !checkRunning(this._active, name, at)){    

    var currentTime = this.context.currentTime

    var container = {
      name: name, startAt: at,
      input: this.context.createGain(),
      route: this.context.createGain(),
      bypass: this.context.createGain(),
      output: this.context.createGain(),
      meddler: this._meddlers[name],
    }

    container.input.connect(container.bypass)
    container.input.connect(container.route)
    container.bypass.connect(container.output)
    container.route.connect(container.meddler.input || container.meddler)
    container.meddler.connect(container.output)

    container.route.gain.value = 0

    if (at <= currentTime){
      container.route.gain.setValueAtTime(1, currentTime)
      container.bypass.gain.setValueAtTime(0, currentTime)
    } else {
      container.route.gain.setValueAtTime(0, currentTime)
      container.bypass.gain.setValueAtTime(1, currentTime)
      container.route.gain.setValueAtTime(1, at)
      container.bypass.gain.setValueAtTime(0, at)
    }

    this._active.push(container)
    refreshRouting(this)
  }

}

function stop(name, at){
  for (var i=0;i<this._active.length;i++){

    var container = this._active[i]
    if (container.name === name && at > container.startAt && !container.stopAt){
      //TODO: could probably soften this transition

      container.route.gain.setValueAtTime(0, at)
      container.bypass.gain.setValueAtTime(1, at)

      container.stopAt = at
      break
    }
  }
}

function refreshRouting(node){
  var currentTime = node.context.currentTime
  var lastNode = node._output

  for (var i=node._active.length-1;i>=0;i--){
    var container = node._active[i]
    if (container.stopAt && container.stopAt < currentTime){
      // clean up old routes
      container.input.disconnect()
      container.output.disconnect()
      node._active.splice(i, 1)
    } else {
      container.output.disconnect()
      container.output.connect(lastNode.input || lastNode)
      lastNode = container.input
    }
  }

  node._input.disconnect()
  node._input.connect(lastNode.input || lastNode)
}

function checkRunning(active, name, at){
  for (var i=0;i<active.length;i++){
    var container = active[i]
    if (container.name === name && at > container.startAt && (!container.stopAt || container.stopAt > at)){
      console.log(container)
      return true
    }
  }
}