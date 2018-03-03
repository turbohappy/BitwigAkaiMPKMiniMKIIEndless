loadAPI(2.3);
load("MPKmini2.js");

host.defineController("Akai", "MPKmini mk2", "1.0", "011f6c74-a954-497e-89a8-e2f9d0f5b9a0");
// "F0 7E 00 06 02 47 72 00 19 00 01 00 03 00 7F 7F 7F 7F 00 4B 01 00 09 00 09 00 02 03 09 00 08 09 07 02 F7";

// host.defineSysexIdentityReply("F0 7E 00 06 02 47 7C 00 19 00 ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? F7");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["MPK mini mkII"], ["MPK mini mkII"]);
host.addDeviceNameBasedDiscoveryPair(["MPKmini2"], ["MPKmini2"]);


String.prototype.getBytes = function () {
  var bytes = [];
  for (var i = 0; i < this.length; ++i) {
    bytes.push(this.charCodeAt(i));
  }

  return bytes;
};


function init() {
  host.getMidiInPort(0).setMidiCallback(onMidi);
  mpkMini2 = new MpkMini2(host);
  mpkMini2.init();
}

function getObserverIndexFunc(index, f) {
    return function(value)
    {
        f(index, value);
    };
}

function exit() {
}

function onMidi(status, data1, data2) {
  mpkMini2.handleMidi(status, data1, data2);
}
