let canvas, ctx, inputMin, setMinutesToSec, remainArea = null, remainSec = null;
let elapsedSec = 0, intervalDrawing;
let endAngle;
let isShowing;
let targetAngle;
let workerAction = 'test';
let isResize;
let offscreen;
let worker;
let remainTime;
// let isRunning = false;

//Resize Canavs
function resizeCanvas() {
    isResize = true;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);


// background.js로 부터 메세지 수신.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'default') {
        // 확장 프로그램 시작 시 Canvas 그리고 default로 숨기기
        if (!message.isRunning) {
            isShowing = message.inputMinuteValue;

            defaultTimer();
        } else {
            return;
        }
    }
    if (message.action === 'showCanvas') {
        // ON/OFF 버튼 클릭 시 Canvas display show
        isShowing = message.inputMinuteValue;
        console.log('content에서 받은 isshowing?:', isShowing)
        canvasDisplayOnOff(isShowing);
    }
    if (message.action === 'startTimer') {
        console.log('현재 러닝중?:', message.isRunning)
        console.log('현재 showing? : ', isShowing);
        // 타이머 시작 버튼 클릭 시, inputMin = 입력한 시간 값 , 일시정지 후 inputMin -> remainingTime
        // if (remainTime) {
        //     console.log('pause 시간 저장되있음.');
        //     inputMin = remainTime;
        // } else {
        //     console.log('pause시간 없음');
        //     inputMin = message.inputMinuteValue;
        // }
        inputMin = message.inputMinuteValue;

        startTimer();

    }
    // if (message.action === 'pauseTimer') {
    //     remainTime = message.inputMinuteValue;
    //     pauseTimer();
    // }
    if (message.action === 'stopTimer') {
        // 타이머 정지 버튼 클릭 시
        remainTime = null;
        stopTimer();
    }
    if (message.action === 'completeTimer') {
        remainTime = null;
        alert('Timer is over!');
        stopTimer();
    }
    else {
        console.log("dont know message from background.js!");
        return;
    }
});

/* Canvas Showing or Not toggle */
function canvasDisplayOnOff(isShowing) {
    console.log('canvas display? : ', canvas, isShowing)
    if (!canvas) {
        return;
    }
    if (isShowing && canvas) {
        canvas.style.display = 'block'
    } else {
        canvas.style.display = 'none'
    }
}

/* 타이머 컨트롤 */
function defaultTimer() {
    return new Promise((resolve, reject) => {
        if (!worker) {
            fetch(chrome.runtime.getURL("worker.js"))
                .then((response) => response.text())
                .then((script) => {
                    canvas = document.createElement('canvas');
                    canvas.style.backgroundColor = 'white';
                    canvas.style.position = 'fixed';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.zIndex = '9999';
                    // canvas.style.display = 'none';
                    canvas.className = 'canvas'
                    console.log('default in content default isshowing:', isShowing)
                    canvasDisplayOnOff(isShowing);
                    document.body.appendChild(canvas);
                    if (!offscreen) {
                        resizeCanvas();
                    }

                    // canvas 가운데 자르기
                    canvas.style.clipPath = `polygon(0% 0%, 0% 100%, 10px 100%, 10px 10px, calc(100% - 10px) 10px, calc(100% - 10px) calc(100% - 10px), 10px calc(100% - 10px), 10px 100%, 100% 100%, 100% 0%)`


                    offscreen = canvas.transferControlToOffscreen();
                    // Worker 스크립트 다운로드 완료 후 스크립트 실행
                    worker = new Worker(URL.createObjectURL(new Blob([script])));
                    worker.postMessage({ workerAction: 'default', canvas: offscreen, width: canvas.width, height: canvas.height }, [offscreen]);

                    resolve();
                });
        } else {
            resolve();
        }
    })
}

async function startTimer() {
    await defaultTimer();
    worker.postMessage({ workerAction: 'start', width: canvas.width, height: canvas.height, time: inputMin });
}
// function pauseTimer() {
//     worker.postMessage({ workerAction: 'pause', time: inputMin });
// }
function stopTimer() {
    clearInterval(intervalDrawing);
    if (worker && typeof worker.terminate === 'function') {
        worker.terminate();
        worker = null;

    }
    if (offscreen) {
        offscreen = undefined;
    }
    defaultTimer();
}




