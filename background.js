let timerInterval;
let setMintoSecTime = 0;
let remainingTime = null;
let isRunning, isShowing = false;
let endAngle;
let givenNum;

// FROM POPUP.JS 에서 받은 메세지
chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onConnect.addListener(function (port) {
        if (port.name === 'popup') {
            port.onMessage.addListener(function (message) {
                if (message.action === 'showCanvas') {
                    // ON/OFF 버튼 클릭 시
                    isShowing = (isShowing === false) ? true : false;
                    console.log('from bg is showing? : ', isShowing)
                    sendToContent('showCanvas', isShowing);
                }
                if (message.action === 'sendNumber') {
                    // 타이머 시작 클릭 시 + 세팅 시간(분)
                    const minutes = message.number;
                    startTimer(minutes);
                    givenNum = message.number;
                    // calculateAngle();
                    sendToContent('startTimer', minutes * 60);
                    // drawStart();
                }
                if (message.action === 'stopTimer') {
                    // 타이머 정지 클릭 시 
                    console.log('Stop received!');
                    sendToContent('stopTimer');
                    stopTimer();
                }
                // if (message.action === 'pauseTimer') {
                //     //타이머 일시정지 클릭 시 + 남은시간 전달(초?)
                //     console.log('Pause received!');
                //     pauseTimer();
                //     sendToContent('pauseTimer', remainingTime);
                // }
                else {
                    console.log("dont know message from popupJS!");
                    return;
                }
            });

            // 연결 종료 이벤트 리스너 / popup이 닫히면 찍힘
            port.onDisconnect.addListener(function () {
                console.log('Disconnected from popup or content script!');
            });
        }
    });
});


// 새 탭 열면 Canvas 그리기 & Reload 시 Canvas 유지
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('reload!');
    if (changeInfo.status === 'complete' && tab.active) {
        console.log('tab changed');
        if (isRunning) {
            // 현재 타이머가 작동 중이라면
            console.log('LEFT TIME : ', remainingTime);
            sendToContent('startTimer', remainingTime, isRunning);
        }
        // 현재 타이머가 작동 중이지 않으면
        console.log('default comming from bg')
        sendToContent('default', isShowing, isRunning);
    }
});

// content.js 불러오기, 메세지 보내기
function sendToContent(action, inputMinuteValue, isRunning) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length > 0 && tabs[0].id) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            }, function () {
                // content.js에 "action" 메시지 전달
                chrome.tabs.sendMessage(tabs[0].id, { action: action, inputMinuteValue: inputMinuteValue, isRunning: isRunning });
            });


        } else {
            console.error('Unable to execute content script. Invalid tab information.');
        }
    });

}

/* 타이머 컨트롤 */

// 타이머 시작 클릭 시 실행 함수
function startTimer(minutes) {
    isRunning = true;
    clearInterval(timerInterval);
    if (remainingTime) {
        setMintoSecTime = remainingTime
    } else {
        setMintoSecTime = minutes * 60; // 분을 초로 변환하여 남은 시간으로 설정
    }

    timerInterval = setInterval(function () {
        const minutesLeft = Math.floor(setMintoSecTime / 60);
        const secondsLeft = setMintoSecTime % 60;

        // popup.js로 분과 초 전송
        chrome.runtime.sendMessage({ minutes: minutesLeft, seconds: secondsLeft });
        if (setMintoSecTime <= 0) {
            remainingTime = null;
            stopTimer();
            sendToContent('completeTimer');
        } else {
            remainingTime = setMintoSecTime;
            setMintoSecTime--;
        }
    }, 1000);
}


// 타이머 정지 클릭 시 실행 함수
function stopTimer() {
    isRunning = false;
    setMintoSecTime = 0;
    remainingTime = null;
    clearInterval(timerInterval);
}

// 타이머 일시정지 클릭 시 실행 함수
// function pauseTimer() {
//     clearInterval(timerInterval);
// }