import React, { Component } from "react";
// import WebAudioRecorder from "web-audio-recorder-js";
// import * as Tone from "tone";

class TesterButton extends Component {

    constructor() {
        super();
    };

    state = {
        isRecording: false,
    };

    testButtonHandler = () => {
        console.log("test button called");
        this.setState({isRecording: !this.state.isRecording});
    };

    recordingStateStr = () => {
        return this.state.isRecording ? "RECORDING" : "not recording";
    };

    // The "danger" and "secondary" refer to bootstrap colors: danger means red, secondary means black.
    recordingColorStr = () => {
        return this.state.isRecording ? "danger" : "secondary";
    };

    render() {
        return (
            <React.Fragment>
                <button
                    type="button" 
                    className="btn btn-secondary"
                    id="testButton" 
                    onClick={this.testButtonHandler}>StartStopRecording
                 </button>

                <div className={`badge badge-${this.recordingColorStr()}`}>
                    {this.recordingStateStr()}
                </div>
            </React.Fragment>
        )
    }
};

export default TesterButton;