//Content.js 로 부터 메세지 받기
let offscreenCanvas = null;
// let saveTime;
self.onmessage = event => {
    const { workerAction, canvas, width, height, time } = event.data;

    //workerAction message from content.js
    if (workerAction === 'default') {
    }

    if (!offscreenCanvas) {
        offscreenCanvas = canvas;
    }
    const ctx = offscreenCanvas.getContext("2d");

    if (workerAction === 'start') {
        drawSetTime(ctx, width, height, time);
        console.log('receive time', time)
    }
    // if (workerAction === 'pause') {
    //     clearTimeout(intervalDrawing);
    // }
    if (workerAction === 'stop') {
    }
};

// time에 따라 빨간색 원 그리기
let elapsedSec = 0;
function drawSetTime(ctx, width, height, time) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw clock circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 1100;

    // let setMinutesToSec = time;
    const startAngle = (Math.PI * 3) / 2;
    const endAngle = (Math.PI * 2 / 60) * (time / 60) + startAngle;
    // saveTime = endAngle - elapsedSec
    // Filling a portion of a clock
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle - elapsedSec, false);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fill();

    //Angle value to decrease per minute
    elapsedSec += 6 * (Math.PI / 180) * (1 / 3600);

    if (startAngle >= endAngle - elapsedSec) {
        clearTimeout(intervalDrawing);
        return;
    }

    //For smooth movement
    intervalDrawing = setTimeout(() => drawSetTime(ctx, width, height, time), 1000 / 60);
}

function deleteCanvas(ctx, width, height) {
    time = 0;
    clearTimeout(intervalDrawing);
    ctx.clearRect(0, 0, width, height);
}