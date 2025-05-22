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
let isRunning = false;

//Resize Canavs
function resizeCanvas() {
    if (!canvas || offscreen) return;  // offscreen이 이미 전송된 경우 리사이즈 하지 않음
    isResize = true;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);


// background.js로 부터 메세지 수신.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // 메시지에서 isShowing 상태 추출
    if (message.isShowing !== undefined) {
        isShowing = message.isShowing;
    }

    // isRunning 상태 업데이트
    if (message.isRunning !== undefined) {
        isRunning = message.isRunning;
    }

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
        console.log('현재 러닝중?:', message.isRunning);
        console.log('현재 showing? : ', isShowing);

        inputMin = message.inputMinuteValue;
        isRunning = true;  // 타이머 시작 시 isRunning을 true로 설정

        // 백그라운드에서 전송된 진행률 저장
        const elapsedRatio = message.elapsedRatio || 0;

        // 진행률 정보와 함께 타이머 시작
        startTimer(elapsedRatio);
    }
    if (message.action === 'stopTimer') {
        // 타이머 정지 버튼 클릭 시
        isRunning = false;  // 타이머 정지 시 isRunning을 false로 설정
        remainTime = null;
        stopTimer();
    }
    if (message.action === 'completeTimer') {
        isRunning = false;  // 타이머 완료 시 isRunning을 false로 설정
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
                    // 기존 canvas가 있다면 제거
                    if (canvas) {
                        document.body.removeChild(canvas);
                        canvas = null;
                    }

                    canvas = document.createElement('canvas');
                    canvas.style.backgroundColor = 'white';
                    canvas.style.position = 'fixed';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.zIndex = '9999';
                    canvas.className = 'canvas'

                    // 초기 크기 설정
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    console.log('default in content default isshowing:', isShowing)

                    // 타이머가 실행 중이면 항상 캔버스를 보이게 함
                    if (isRunning) {
                        canvas.style.display = 'block';
                    } else {
                        canvasDisplayOnOff(isShowing);
                    }

                    document.body.appendChild(canvas);

                    // canvas 가운데 자르기
                    canvas.style.clipPath = `polygon(0% 0%, 0% 100%, 10px 100%, 10px 10px, calc(100% - 10px) 10px, calc(100% - 10px) calc(100% - 10px), 10px calc(100% - 10px), 10px 100%, 100% 100%, 100% 0%)`

                    offscreen = canvas.transferControlToOffscreen();
                    // Worker 스크립트 다운로드 완료 후 스크립트 실행
                    worker = new Worker(URL.createObjectURL(new Blob([script])));
                    worker.postMessage({
                        workerAction: 'default',
                        canvas: offscreen,
                        width: canvas.width,
                        height: canvas.height,
                        isRunning: isRunning  // isRunning 상태 전달
                    }, [offscreen]);

                    resolve();
                });
        } else {
            resolve();
        }
    })
}

//기존
// async function startTimer() {
//     await defaultTimer();
//     worker.postMessage({ workerAction: 'start', width: canvas.width, height: canvas.height, time: inputMin });
// }

async function startTimer(elapsedRatio) {
    await defaultTimer();
    // 타이머가 실행 중일 때는 항상 캔버스를 보이게 함
    if (isRunning) {
        canvasDisplayOnOff(true);
        // 진행률 정보를 워커에 전달
        worker.postMessage({
            workerAction: 'start',
            width: canvas.width,
            height: canvas.height,
            time: inputMin,
            elapsedRatio: elapsedRatio,  // 진행률 정보 추가
            isRunning: true  // isRunning 상태 전달
        });
    }
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




