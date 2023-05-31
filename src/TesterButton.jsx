import React, { Component } from "react";
// import * as Tone from "tone";

class TesterButton extends Component {

    constructor() {
        super();
    };

    coreAppStates = {
        isRecording: false,
    }

    testButtonHandler = () => {
        console.log("test button called");
    };

    recordingStateStr = () => {
        return this.coreAppStates.isRecording ? "RECORDING" : "not recording";
    };

    // The "danger" and "secondary" refer to bootstrap colors: danger means red, secondary means black.
    recordingColorStr = () => {
        return this.coreAppStates.isRecording ? "danger" : "secondary";
    }

    render() {
        return (
            <React.Fragment>
                <button
                    type="button" 
                    className="btn btn-secondary"
                    id="testButton" 
                    onClick={this.testButtonHandler}>StartStopRecording
                 </button>

                <div className={`badge bg-${this.recordingColorStr()}`}>
                    {this.recordingStateStr()}
                </div>

            </React.Fragment>
        )
    }
}

export default TesterButton