MpkMini2 = function MpkMini2(host) {
    const CC_STATUS = 176;
    const CC_KNOB_OFFSET = 3;
    const CC_PAD_STATUS = 177;
    const CC_PAD_OFFSET = 30;
    const PROG_STATUS = 193;

    this.transport = null;
    this.userControls = null;
    this.editorDevice = null;
    this.knobActualValues = [];
    this.trackBank = null;
    this.sceneBank = null;
    
    this.init = function() {
        var midiIn = host.getMidiInPort(0);
        midiIn.createNoteInput("Keys", "80????","90????", "B001??", "B040??", "D0????", "E0????");
        midiIn.createNoteInput("Pads [Note mode]", "81????", "91????", "D1????", "E1????");

        this.transport = host.createTransport();
        this.transport.addIsPlayingObserver(function(isPlaying)   {      
            println(isPlaying ? "PLAY" : "STOP");   
        });

        this.trackBank = host.createTrackBank(4, 4, 4);
        this.sceneBank = this.trackBank.sceneBank();

        this.editorDevice = host.createEditorCursorDevice();
        this.remoteControlsPage = this.editorDevice.createCursorRemoteControlsPage(8);
//        this.remoteControlsPage.addCanSelectNextObserver((function(newVal) {
//            this.initCurrControlsPage();
//        }).bind(this));
        this.initCurrControlsPage();
        // deviceCount().addValueObserver(function() {
        //     this.initCurrControlsPage();
        // });
        for (var i=0; i<8; i++) {
            this.knobActualValues.push(-1);
        }
        println("INIT COMPLETE");
    }

    this.initCurrControlsPage = function() {
        for (var i=0; i<8; i++) {
            this.remoteControlsPage.getParameter(i).setIndication(true);
        }
    }
    
    this.handleMidi = function (status, data1, data2) {
//        println("midi event [s="+status+"][d1="+data1+"][d2="+data2+"]");
        if (status === PROG_STATUS) {
            this.handleProgPad(data1);
        } else if (status == CC_STATUS) {
            this.handleKnob(data1 - CC_KNOB_OFFSET, data2);
        } else if (status == CC_PAD_STATUS) {
            this.handleCCPad(data1 - CC_PAD_OFFSET, data2);
        } else {
            this.otherMidi(status, data1, data2);
        }
    }

    this.handleCCPad = function (padIndex, data2) {
        let on = data2 > 0;
        // let pad = padIndex % 10;
        // let row = (padIndex - pad) / 10;

        // println("cc pad [row="+row+"] [pad="+pad+"] ["+(on?"on":"off")+"]");

        //TODO: start/stop clips
        println("cc pad [pad="+padIndex+"] ["+(on?"on":"off")+"]");
        let scene = this.sceneBank.getScene(padIndex);
        if (on) {
            scene.launch();
        } else {
            this.sceneBank.stop();
        }
    }

    this.handleProgPad = function (action) {
        if (action === 4) {
            this.transport.restart();
        } else if (action === 5) {
            this.transport.play();
        } else if (action === 6) {
            this.remoteControlsPage.selectNextPage(true);
        } else if (action === 7) {
            this.remoteControlsPage.selectPreviousPage(true);
        } else {
            //TODO: other pad actions
            println("pad action [action="+action+"]");
        }
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
