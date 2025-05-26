//Content.js 로 부터 메세지 받기
let offscreenCanvas = null;
let elapsedRatio = 0;
let isRunning = false;
let intervalDrawing = null;

self.onmessage = event => {
    const { workerAction, canvas, width, height, time, elapsedRatio: newElapsedRatio, isRunning: newIsRunning } = event.data;

    console.log('Worker received:', { workerAction, time, newElapsedRatio, newIsRunning });

    if (!offscreenCanvas) {
        offscreenCanvas = canvas;
    }
    const ctx = offscreenCanvas.getContext("2d");

    // 이전 타이머 정리
    if (intervalDrawing) {
        clearTimeout(intervalDrawing);
        intervalDrawing = null;
    }

    // 상태 업데이트
    if (newIsRunning !== undefined) {
        isRunning = newIsRunning;
    }
    if (newElapsedRatio !== undefined) {
        elapsedRatio = newElapsedRatio;
        console.log('Received elapsedRatio:', elapsedRatio);
    }

    // 타이머 시작 또는 상태 업데이트
    if (workerAction === 'start' || (workerAction === 'default' && isRunning)) {
        drawSetTime(ctx, width, height, time);
    }
    // 타이머 정지
    else if (workerAction === 'stop') {
        console.log('Worker received stop action');
        isRunning = false;
        elapsedRatio = 0;
        if (intervalDrawing) {
            clearTimeout(intervalDrawing);
            intervalDrawing = null;
        }
        // 캔버스 완전히 지우기
        ctx.clearRect(0, 0, width, height);
    }
};

// time에 따라 빨간색 원 그리기
function drawSetTime(ctx, width, height, time) {
    if (!ctx || !isRunning) {
        console.log('Not drawing: ctx=', !!ctx, 'isRunning=', isRunning);
        return;
    }

    console.log('Drawing with elapsedRatio:', elapsedRatio);
    ctx.clearRect(0, 0, width, height);

    // Draw clock circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 1100;

    const startAngle = (Math.PI * 3) / 2;
    const totalAngle = (Math.PI * 2 / 60) * (time / 60);
    const currentAngle = totalAngle * (1 - elapsedRatio);
    const endAngle = startAngle + currentAngle;

    // Filling a portion of a clock
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fill();

    // 다음 프레임 예약
    if (elapsedRatio < 1) {
        intervalDrawing = setTimeout(() => drawSetTime(ctx, width, height, time), 1000 / 60);
    }
}