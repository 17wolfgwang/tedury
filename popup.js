let leftMinText, leftSecText, onOffBtn, startBtn, setTime, stopBtn, pauseBtn, darkModeBtn;
// message 소통을 위한 port define
const port = chrome.runtime.connect({ name: 'popup' });

document.addEventListener('DOMContentLoaded', function () {
    // DOM tag 선택
    defineTags();
    checkInput();
    stopBtn.disabled = true;
    // Browser 테두리 ON/OFF -> message to background
    onOffBtn.addEventListener('click', function () {
        port.postMessage({ action: 'showCanvas' });
    })
    // 시간 입력 후, 타이머 시작 -> message to background
    startBtn.addEventListener('click', function () {
        // Left Time div display "ON"
        let number = parseInt(setTime.value);
        // background.js로 세팅 시간 보내기 및 타이머 START
        sendNumberToBackground(number);
        setTime.value = '';
    });
    // 타이머 정지(리셋) -> message to background
    stopBtn.addEventListener('click', function () {
        leftMinText.textContent = 0;
        leftSecText.textContent = 0;
        setTime.value = '';
        inputDuration.disabled = false;
        inputDuration.placeholder = 'Enter duration(1 ~ 60)';
        startBtn.disabled = false;
        port.postMessage({ action: 'stopTimer' });
    });
    // 타이머 일시정지 -> message to background
    // pauseBtn.addEventListener('click', function () {
    //     startBtn.disabled = false;
    //     port.postMessage({ action: 'pauseTimer' });
    // });
});

// DOM tag 선택 함수
function defineTags() {
    setTimerSection = document.querySelector(".setTimerSection");
    leftTimerSection = document.querySelector(".leftTimerSection");
    inputDuration = document.querySelector(".inputDuration");
    leftMinText = document.getElementById("leftMin");
    leftSecText = document.getElementById("leftSec");
    onOffBtn = document.getElementById('on-off-btn');
    startBtn = document.getElementById('start-btn');
    setTime = document.getElementById('set-minutes');
    stopBtn = document.getElementById('reset-timer-btn');
    // pauseBtn = document.getElementById('pause-timer-btn');
    // darkModeBtn = document.getElementById('dark-mode-btn');
}

function checkInput() {
    // 입력값 체크
    inputDuration.addEventListener('blur', function () {
        const inputValue = parseInt(inputDuration.value);
        if (isNaN(inputValue) || inputValue < 1 || inputValue > 60) {
            alert('Please enter a number between 1 and 60.');
            inputDuration.value = '';
            return;
        }
    })
}

// 입력된 숫자를 가져오고, sendNumberToBackground 함수를 호출하여 숫자를 background.js로 보냅니다.
function sendNumberToBackground(number) {
    port.postMessage({ action: 'sendNumber', number: number });
}

// 현재 분, 초 받기 fr background.js -> popup.html 남은 시간 입력;
function UpdateMinSec() {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.minutes !== undefined && request.seconds !== undefined) {
            inputDuration.disabled = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            inputDuration.placeholder = 'Timer is running';
            leftMinText.textContent = request.minutes;
            leftSecText.textContent = request.seconds;
        }
    });
}

UpdateMinSec();




