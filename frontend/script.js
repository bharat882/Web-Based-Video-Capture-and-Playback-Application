const constraints = {
    video: {
        width: {exact: 1280},
        height: {exact: 720},
        frameRate: {exact: 30},
    },
    audio:true
};
var date = new Date();
var time;
const recordButton = document.getElementById('record');
const stopButton = document.getElementById('stop');
const video = document.getElementById('video');
const pauseButton = document.getElementById('pause');
const resumeButton = document.getElementById('play');
let mediaRecorder;
let segment = [];
let allChunks=[];
let sequenceNumber = 1;
let intervalId;

const sendSegment = () => {
    const formData = new FormData();
    const blob = new Blob(segment, { type: 'video/mp4' });
    segment = [];

    const now = new Date();
    const timeStamp = now.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g,'');

    let segmentName = `segment${sequenceNumber}_${timeStamp}.mp4`;
    sequenceNumber++;
    formData.append('filename', segmentName)
    formData.append('video', blob);
    formData.append('videoId', "test");
    console.log(segmentName);



    // Uploading the files to the server


    // Set the request headers
 //   xhr.setRequestHeader('Content-Type', 'application/octet-stream');
   // xhr.setRequestHeader('Content-Disposition', 'attachment; filename="' + segmentName + '"');


    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/uploadVideo', true);
    xhr.send(formData);



};

pauseButton.onclick = () => {
    if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        sendSegment()
        pauseButton.disabled = true;
        resumeButton.disabled = false;
    }
};

resumeButton.onclick = () => {
    if (mediaRecorder.state === "inactive") {
        mediaRecorder.start();
        pauseButton.disabled = false;
        resumeButton.disabled = true;
    }
};

function segmentation(event){
    segment.push(event.data);
    allChunks.push(event.data);
    if (segment.length >= 90) {
        sendSegment();
    }
}
recordButton.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        // mediaRecorder = new MediaRecorder(stream, {
        //     mimeType: 'video/mp4;codecs=avc1.640028',
        //     videoBitsPerSecond: 5000000  // 5 Mbps
        // });

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=avc1.640028', videoBitsPerSecond: 5000000 });



        mediaRecorder.start();


        mediaRecorder.ondataavailable = segmentation;

        stopButton.onclick = () => {

            clearInterval(intervalId);

            // STopping the recorder
            mediaRecorder.stop();


            if (segment.length > 0) {
                sendSegment();
            }

            // Downloading the recorded video
            const blob = new Blob(allChunks, { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recorded-video.mp4';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100)


            recordButton.disabled = false;
            stopButton.disabled = true;
            pauseButton.disabled= true;
            video.pause();
            video.srcObject = null;

            // Disabling the camera

            tracks = stream.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
        };

        setTimeout(() => {
            if (mediaRecorder.state === "recording") {
                intervalId = setInterval(() => {
                    if (mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                        sendSegment();
                        mediaRecorder.start();
                    }
                }, 3000);
            }
        }, 3000);

        recordButton.disabled = true;
        stopButton.disabled = false;
        pauseButton.disabled=false;
    } catch (err) {
        console.error(err);
    }
};