load("Mappings.js");

MpkMini2 = function MpkMini2(host) {
    var self = this;
    this.mappings = new MkIIMappings(null);
    this.transport = null;
    this.userControls = null;
    this.editorDevice = null;
    this.knobActualValues = [];
    
    this.init = function() {
        var midiIn = host.getMidiInPort(0);

        println("INIT");
        for(var i=0; i<self.mappings.noteInputs.length; i++) {
            if ("Keys" === self.mappings.noteInputs[i][1]) {
                midiIn.createNoteInput(self.mappings.noteInputs[i][1], self.mappings.noteInputs[i][2], self.mappings.noteInputs[i][3], self.mappings.noteInputs[i][4],
                    self.mappings.noteInputs[i][5], self.mappings.noteInputs[i][6], self.mappings.noteInputs[i][7]);
            }
            println(self.mappings.noteInputs[i]);
        }

        this.transport = host.createTransport();
        this.transport.addIsPlayingObserver(function(isPlaying)   {      
            println(isPlaying ? "PLAY" : "STOP");   
        });

        this.editorDevice = host.createEditorCursorDevice();
        this.remoteControlsPage = this.editorDevice.createCursorRemoteControlsPage(8);
        this.remoteControlsPage.addCanSelectNextObserver((function(newVal) {
            for (var i=0; i<8; i++) {
                this.remoteControlsPage.getParameter(i).setIndication(true);
            }
        }).bind(this));
        for (var i=0; i<8; i++) {
            this.knobActualValues.push(-1);
        }
    }
    
    this.handleMidi = function (status, data1, data2) {
        if (status === 145 || status == 129) {
            this.handlePad(status === 145, data1, data2);
        } else if (status == 176) {
            this.handleKnob(data1-2, data2);
        } else {
            this.otherMidi(status, data1, data2);
        }
    }

    this.handlePad = function (on, data1, data2) {
        if (on && data1 === 36) {
            this.transport.play();
        }
        //TODO: other pad actions
    }

    this.handleKnob = function (knob, data2) {
        if (this.knobActualValues[knob] === -1) {
            // we haven't had any input yet so we can't do relative just punt til next
        } else {
            this.remoteControlsPage.getParameter(knob).
                inc(data2 - this.knobActualValues[knob], 128);
        }
        this.knobActualValues[knob] = data2;
    }

    this.otherMidi = function (status, data1, data2) {
        println("midi event [s="+status+"][d1="+data1+"][d2="+data2+"]");
    }
}
