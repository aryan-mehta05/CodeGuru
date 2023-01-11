import bot from './assets/bot.svg'
import user from './assets/user.svg'
import {github, linkedin, instagram, email} from './about.js'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
}

const userQueryList = ["who created you?", "who created this bot?", "who made you?", "when were you made?", "when were you created?", "when is your birthday?", "how were you created?", "who is your creator?", "who coded you?", "what language were you written in?"];

const birthDate = "I was created by Aryan Mehta, on the 11th of January 2023.\nYou can check how he did that here: [" + github + "]";

const makerQueryList = ["who is aryan?", "who is aryan mehta?", "can you tell me more about him?", "can you tell me about him?", "aryan mehta"];

const makerInfo = "Aryan Mehta is a Web Developer and Machine Learning Engineer from Vellore Institute of Technology, Vellore.\nHe belonged to VIT's 2019 Computer Science and Engineering batch. \nTo know more about him, you can check his profiles here:\nGitHub: " + github + "\nLinkedIn: " + linkedin + "\nInstagram: " + instagram + "\nEmail: " + email + "\nHe created me, so do check him out!";

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  let userQuery = data.get('prompt');
  
  // User's Chat Stripe
  chatContainer.innerHTML += chatStripe(false, userQuery);

  form.reset();

  // Bot's Chat Stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // Fetch data from server ---> Bot's Response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: userQuery,
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    if (userQueryList.includes(userQuery.toLowerCase())) {
      typeText(messageDiv, birthDate);
    } else if (makerQueryList.includes(userQuery.toLowerCase())){
      typeText(messageDiv, makerInfo);
    } else {
      const data = await response.json();
      const parsedData = data.bot.trim();

      typeText(messageDiv, parsedData);
    }
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Hmm, looks like something went wrong!";
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') { // Enter key has keycode 13
    handleSubmit(e);
  }
});
