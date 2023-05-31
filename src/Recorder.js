import WebAudioRecorder from "./recorderJS/WebAudioRecorder"

function start() {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioInputSelect.value;
    const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined }
    };
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

function gotStream(stream) {
    window.stream = stream; 
    return navigator.mediaDevices.enumerateDevices();
}

function changeAudioDestination() {
    const audioDestination = audioOutputSelect.value;
}

var formObj;
function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

const audioInputSelect = document.querySelector('select#settings-microphone');
const audioOutputSelect = document.querySelector('select#settings-playback');
const selectors = [audioInputSelect, audioOutputSelect];

function gotDevices(deviceInfos) {
    const values = selectors.map(select => select.value);
    selectors.forEach(select => {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
    });
    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
            audioInputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'audiooutput') {
            option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
            audioOutputSelect.appendChild(option);
        }
    }
    selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
            select.value = values[selectorIndex];
        }
    });
}

var dttm = null;
var x = null;
var audioBlob;
var audioUrl;
var distanceVal = 0;

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;

var gumStream;
var recorder;
var input;
var encodingType = "mp3";
var encodeAfterRecord = true;
var constraints = { audio: true, video: false };
var countMax = 120;

function startRecording() {
    $('#speak-now').removeClass('d-none')
    $('#timer').text('00:00')
    var d = new Date();
    var dttm = (d.setSeconds(d.getSeconds() + countMax));
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            audioContext = new AudioContext();
            gumStream = stream;
            input = audioContext.createMediaStreamSource(stream);
            recorder = new WebAudioRecorder(input, {
                workerDir: domain + "/js/",
                encoding: encodingType,
                numChannels: 2,
               
            });
            recorder.onComplete = function (recorder, blob) {
                createDownloadLink(blob, recorder);
            }
            recorder.onEncodingProgress = function (recorder, progress) {
            }
            recorder.setOptions({
                timeLimit: 120,
                encodeAfterRecord: encodeAfterRecord,
                ogg: { quality: 0.5 },
                mp3: { bitRate: 160 }
            });

            recorder.startRecording();
        });

    x = setInterval(function () {
        var now = new Date().getTime();
        var distance = dttm - now;

        var minutes = Math.floor((((countMax * 1000 - distance) % (1000 * 60 * 60))) / (1000 * 60));
        var seconds = Math.floor(((countMax * 1000 - distance) % (1000 * 60)) / 1000);
        if (seconds < 10) seconds = "0" + seconds;
        if (minutes < 10) minutes = "0" + minutes;
        distanceVal = countMax * 1000 - distance;

        $('#timer').text(minutes + ":" + seconds);
        if (distance < 0) {
            clearInterval(x);
            x = null;
            stopRecording();
        }
    }, 1000);
}

function stopRecording() {
    if (x !== null) { clearInterval(x); x = null; }
    $('#speak-now').addClass('d-none')

    gumStream.getAudioTracks()[0].stop();
    recorder.finishRecording();

    if ($('#review-recording').length > 0) { 
        $('#encoding').removeClass('d-none')
        $('#btn_review-recording-reset').addClass('d-none')
        $('#btn_review-recording-save').addClass('d-none')
        $('#review-recording').removeClass('d-none');
    }
    else $('#submit-request').removeClass('d-none');
}

function createDownloadLink(blob, record) {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    new Response(blob).arrayBuffer()
        .then(function (obj) {
            audioContext.decodeAudioData(obj, function (buffer) {
                var duration = buffer.duration;
                distanceVal = duration * 1000;

                var minutes = Math.floor((((distanceVal) % (1000 * 60 * 60))) / (1000 * 60));
                var seconds = Math.floor(((distanceVal) % (1000 * 60)) / 1000);
                if (seconds < 10) seconds = "0" + seconds;
                if (minutes < 10) minutes = "0" + minutes;

                $('#timer').text(minutes + ":" + seconds);

                $('#review-recording .progress-bar').attr('max', distanceVal / 1000)
                $('#review-recording .progress-bar').attr('value', 0)
                $('#review-recording .duration').text($('#timer').text())
                $('#review-recording .currentTime').text('00:00')
                $('#review-recording .progress-bar').attr('style', 'width:0%')
                $('#review-recording').find('.mp3:first').find('img:first').attr('src', '/img/icons/icon-play-2.svg')

                $('#submit-request .progress-bar').attr('max', distanceVal / 1000)
                $('#submit-request .progress-bar').attr('value', 0)
                $('#submit-request .duration').text($('#timer').text())
                $('#submit-request .currentTime').text('00:00')
                $('#submit-request .progress-bar').attr('style', 'width:0%')
                $('#submit-request').find('.mp3:first').find('img:first').attr('src', '/img/icons/icon-play-2.svg')

                $('#encoding').addClass('d-none')
                $('#btn_review-recording-reset').removeClass('d-none')
                $('#btn_review-recording-save').removeClass('d-none')
            });

        });

    audioBlob = blob;
    var audioUrl = URL.createObjectURL(blob);
    $('#review-recording .src').val(audioUrl);
    $('#submit-request .src').val(audioUrl);
}

function resetRecording() {
    if (x !== null) { clearInterval(x); x = null; }
    startRecording();
}

function saveRecording(email, name) {
    const formData = new FormData();
    if (audioBlob !== undefined) {
        let file = new File([audioBlob], 'recording.mp3');
        formData.append('file', file);
    }

    formData.append('widgetId', widgetId);
    formData.append('name', name);
    formData.append('fnl', fnl);
    formData.append('msg', msg);
    formData.append('email', email);
    formData.append('duration', Math.floor(distanceVal / 1000));

    $.ajax({
        url: domain + "/widget/inline/message",
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data) {
            if (x !== null) { clearInterval(x); x = null; }
            try {
                window.opener.postMessage(data.shortLink, "*");
            }
            catch { }
        }
    });
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
