DEPLOYED HERE: https://chrome.google.com/webstore/detail/time-timer-mod-for-chrome/gnoeliollaloofmielaedbhclopijlpe?hl=ko&authuser=0

# Time timer mod (Chrome extension)
Time timer mod는 chrome 브라우저를 사용하는 유저들을 위한 타이머 익스텐션입니다. 일반적인 타이머 익스텐션과는 다르게 브라우저를 이용하며 시각적으로 타이머의 시간 흐름을 알 수 있습니다. 이 웹사이트는 JavaScript, Chrome API, offscreenCanvas를 사용하였습니다. 해당 익스텐션은 크롬 익스텐션 웹 스토어에 배포되어 있습니다.

## Features
- Chrome API : chrome 브라우저의 현재 탭 정보, 그리고 해당 브라우저의 DOM에 접근할 권한을 부여합니다.

- offscreenCanvas: 타이머가 content 로딩에 영향을 받지 않기 위해서 메인 스레드 외부에서 타이머가 실행될 수 있도록 offscreenCanvas를 활용하여 worker를 생성하고 활용하였습니다. <br>

- Contact form: 고객은 메세지나 요구사항 등을 contact을 통해 관리자의 이메일로 전송할 수 있습니다.<br>

## What I've learn & complementary point
- Chrome API를 통한 유저 브라우저 이용 정보 접근
내가 이용한 탭 정보 이외에도 현재 링크와 관련된 정보, 사이트 접속 기록 등에 접근할 수 있었다. 이를 통해 내가 원하는 기능을 가진 다양한 익스텐션을 또 제작해 볼 수 있을 것이라 생각한다. 어떤 프로그램을 이용할 때 항상 해당 데이터나 기능을 가져오거나 조작할 수 있는 API와 관련된 사항을 필히 살펴보아야겠다.

- offscreenCanavs
타이머가 흐르는 시간과 browser에 canvas로 그려지는 타이머가 차이가 발생했다. 원인은 content가 로딩되면서 시간이 delay가 발생하는 것이었고, 해당 gap을 최소화 하기위해 메인스레드가 아닌 외부에서 canvas를 그리는 offscreenCanvas를 활용하였다.

- 이후 계획...
아직도 조금의 delay가 발생하여 해당 부분의 조정이 필요하다. 또 canvas를 on/off할 수 있는 기능을 넣었으나 에러로 인해 오작동 하는 경우가 발생했다.. 일시정지 기능 또한 구현해 놓았으나, 다른 탭으로 이동하거나 새 탭을 열었을 때에 오류가 발생하여 beta version에서는 기능을 막아놓았다. 수정 후에 정식 배포를 진행할 예정이다.


## Installation and Setup
Clone the repository: git clone https://github.com/17wolfgwang/timer_mod_extension
Install dependencies: npm install
Set up Firebase project:

Contributing
Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

Fork the repository.
Create a new branch for your feature or bug fix: git checkout -b feature/your-feature. <br>
Make the necessary changes and commit them. <br>
Push your changes to your forked repository: git push origin feature/your-feature. <br>
Open a pull request in the main repository.<br>

License
This project is licensed under the MIT License.

Contact
If you have any questions or suggestions regarding the dynamic e-commerce website, please feel free to contact us at dkzks44@gmail.com.

I hope you and your furry friends enjoy the shopping experience on Dynamic.
