// 타이머 상태를 중앙에서 관리
const timerState = {
    isRunning: false,
    isShowing: false,
    startTime: null,
    duration: null,
    remainingTime: null,
    elapsedRatio: 0
};

let timerInterval;

// FROM POPUP.JS 에서 받은 메세지
chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onConnect.addListener(function (port) {
        if (port.name === 'popup') {
            port.onMessage.addListener(function (message) {
                console.log('Received message from popup:', message);
                if (message.action === 'showCanvas') {
                    timerState.isShowing = !timerState.isShowing;
                    console.log('Canvas visibility changed:', timerState.isShowing);
                    broadcastState();
                }
                if (message.action === 'sendNumber') {
                    const minutes = message.number;
                    startTimer(minutes);
                }
                if (message.action === 'stopTimer') {
                    console.log('Stop button clicked!');
                    // 타이머 상태 초기화
                    timerState.isRunning = false;
                    timerState.startTime = null;
                    timerState.duration = null;
                    timerState.remainingTime = null;
                    timerState.elapsedRatio = 0;

                    // 인터벌 정리
                    if (timerInterval) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                    }

                    // 모든 활성 탭에 stop 액션 브로드캐스트
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        if (tabs && tabs.length > 0 && tabs[0].id) {
                            chrome.scripting.executeScript({
                                target: { tabId: tabs[0].id },
                                files: ['content.js']
                            }, function () {
                                const message = {
                                    action: 'stop',
                                    isRunning: false,
                                    isShowing: timerState.isShowing,
                                    elapsedRatio: 0
                                };
                                console.log('Sending stop message to content:', message);
                                chrome.tabs.sendMessage(tabs[0].id, message);
                            });
                        }
                    });
                }
            });

            port.onDisconnect.addListener(function () {
                console.log('Disconnected from popup or content script!');
            });
        }
    });
});

// 새 탭 열면 Canvas 그리기 & Reload 시 Canvas 유지
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        console.log('Tab updated, broadcasting state');
        broadcastState();
    }
});

// 탭이 활성화될 때
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Tab activated:', activeInfo.tabId);

    // content.js를 먼저 로드
    chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ['content.js']
    }, function () {
        // 타이머가 실행 중이면
        if (timerState.isRunning) {
            chrome.tabs.sendMessage(activeInfo.tabId, {
                action: 'startTimer',
                inputMinuteValue: timerState.duration / 60,
                isRunning: true,
                elapsedRatio: timerState.elapsedRatio,
                isShowing: timerState.isShowing
            });
        } else {
            // 타이머가 멈춰있으면 stop 액션 전송
            chrome.tabs.sendMessage(activeInfo.tabId, {
                action: 'stop',
                isRunning: false,
                isShowing: timerState.isShowing  // isShowing 상태 유지
            });
        }
    });
});

// 진행률 계산 함수
function calculateElapsedRatio() {
    if (!timerState.isRunning) return 0;

    if (timerState.startTime) {
        const elapsedTime = Date.now() - timerState.startTime;
        return Math.min(elapsedTime / (timerState.duration * 1000), 1.0);
    } else if (timerState.remainingTime !== null) {
        return 1 - (timerState.remainingTime / timerState.duration);
    }
    return 0;
}

// 모든 활성 탭에 상태 브로드캐스트
function broadcastState() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length > 0 && tabs[0].id) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            }, function () {
                // 현재 진행률 계산
                timerState.elapsedRatio = calculateElapsedRatio();
                console.log('Broadcasting elapsedRatio:', timerState.elapsedRatio);

                const message = {
                    action: timerState.isRunning ? 'startTimer' : 'default',
                    inputMinuteValue: timerState.remainingTime,
                    isRunning: timerState.isRunning,
                    isShowing: timerState.isShowing,
                    elapsedRatio: timerState.elapsedRatio
                };

                console.log('Broadcasting state:', message);
                chrome.tabs.sendMessage(tabs[0].id, message);
            });
        }
    });
}

// 타이머 시작
function startTimer(minutes) {
    timerState.isRunning = true;
    timerState.isShowing = true;  // 타이머 시작 시 기본적으로 보이게 설정
    timerState.startTime = Date.now();
    timerState.duration = minutes * 60;
    timerState.remainingTime = minutes * 60;
    timerState.elapsedRatio = 0;

    clearInterval(timerInterval);

    timerInterval = setInterval(function () {
        const elapsedTime = Date.now() - timerState.startTime;
        timerState.remainingTime = Math.max(0, timerState.duration - Math.floor(elapsedTime / 1000));
        timerState.elapsedRatio = calculateElapsedRatio();

        const minutesLeft = Math.floor(timerState.remainingTime / 60);
        const secondsLeft = timerState.remainingTime % 60;

        chrome.runtime.sendMessage({ minutes: minutesLeft, seconds: secondsLeft });

        if (timerState.remainingTime <= 0) {
            // 타이머 완료 시 알림음 재생
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs && tabs.length > 0 && tabs[0].id) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: () => {
                            const audio = new Audio(chrome.runtime.getURL('alert.mp3'));
                            audio.play();
                            alert('타이머가 완료되었습니다!');
                        }
                    });
                }
            });
            stopTimer();
        } else {
            broadcastState();
        }
    }, 1000);

    broadcastState();
}

// 탭이 업데이트될 때
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        console.log('Tab updated:', tabId, tab.url);

        // content.js를 먼저 로드
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }, function () {
            // 타이머가 실행 중이면
            if (timerState.isRunning) {
                chrome.tabs.sendMessage(tabId, {
                    action: 'startTimer',
                    inputMinuteValue: timerState.duration / 60,
                    isRunning: true,
                    elapsedRatio: timerState.elapsedRatio,
                    isShowing: timerState.isShowing
                });
            } else {
                // 타이머가 멈춰있으면 stop 액션 전송
                chrome.tabs.sendMessage(tabId, {
                    action: 'stop',
                    isRunning: false,
                    isShowing: timerState.isShowing  // isShowing 상태 유지
                });
            }
        });
    }
});

// 타이머 정지
function stopTimer() {
    console.log('Stop button clicked');
    timerState.isRunning = false;
    timerState.startTime = null;
    timerState.duration = null;
    timerState.remainingTime = null;
    timerState.elapsedRatio = 0;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // 모든 탭에 stop 액션 브로드캐스트
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            // 각 탭에 대해 content.js를 로드하고 stop 메시지 전송
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, function () {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'stop',
                    isRunning: false,
                    isShowing: timerState.isShowing  // isShowing 상태 유지
                });
            });
        });
    });
}