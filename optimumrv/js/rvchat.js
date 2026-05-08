(() => {
  //const haveOChat = new URLSearchParams(location.search).has('OChat') || sessionStorage.getItem('OChat') === '1';
  //if (!haveOChat) return;

  sessionStorage.setItem('OChat', '1');

if (document.getElementById('rv-chat-toggle')) return;

if (!document.querySelector('meta[name="viewport"]')) {
  const v = document.createElement('meta');
  v.name    = 'viewport';
  v.content = 'width=device-width, initial-scale=1.0';
  document.head.appendChild(v);
}

  const URL_BASE = 'https://optimumrv.com';
  const URL_API_BASE = 'https://api.optimumrv.com';
  //const URL_API_BASE = 'https://localhost:7165';


  const css = `
html {
-webkit-text-size-adjust: 100%;
}

html,
body {
overscroll-behavior: none;
touch-action: manipulation;
}

html.rv-chat-open,
body.rv-chat-open {
height: 100%;
left: 0;
overflow: hidden;
position: fixed;
top: 0;
width: 100%;
}

#rv-chat-toggle{
  align-items: center;
  background: var(--color_red);
  border: none;
  bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  clip-path: polygon(calc(100% - 8px) 100%, 100% calc(100% - 8px), 100% 8px, calc(100% - 8px) 0%, 8px 0%, 0% 8px, 0% calc(100% - 8px), 8px 100%);
  color: #fff;
  cursor: pointer;
  display: flex;
  font-weight: bold;
  gap: 8px;
  padding: 9px 15px 4px 15px;
  position: fixed;
  right: 20px;
  z-index: 1000;
}

#rv-chat-toggle:hover{
opacity: 0.9;
}

#rv-chat-window{
background: #fff;
inset: 0;
display: none;
flex-direction: column;
height: 100%;
position: fixed;
width: 100%;
z-index: 1000;
}

#rv-chat-window .chat-header{
align-items: center;
background-color: #231f20;
background-image: url(/images/stripes.svg), linear-gradient(to left top, #ffffff, #ffffff), linear-gradient(to left top, #231f20, #231f20), linear-gradient(to left top, var(--color_red), var(--color_red));
background-repeat: no-repeat, no-repeat, no-repeat, repeat-x;
background-position: 135px center, 180px center, 0px center, 0 center;
background-size: 233px 104px, 70px 104px, 180px 104px, 1012px 104px;
color: #fff;
display: flex;
justify-content: space-between;
padding: 10px;
}

#rv-chat-window .chat-header button{
background: transparent;
border: none;
border-radius: 50%;
color: #ffffff;
cursor: pointer;
font-size: 18px;
}

#rv-chat-content{
background: var(--color_light-grey);
flex: 1;
font-size: 0.9125rem;
overflow-y: auto;
padding: 12px;
align-content: flex-end;
}

#rv-chat-input-area{
background: #f1f1f1;
border-bottom-left-radius: 8px;
border-bottom-right-radius: 8px;
display: flex;
flex-direction: column;
gap: 2px;
padding: 16px 12px 4px;
}

#rv-chat-input-area .rv-field{
display: flex;
width:100%;
}

#rv-chat-input-area input{
border-radius: 0;
border-color: transparent;
clip-path: polygon(calc(100% - 8px) 100%, 100% calc(100% - 8px), 100% 8px, calc(100% - 8px) 0%, 8px 0%, 0% 8px, 0% calc(100% - 8px), 8px 100%);
flex: 1;
font-size: 1rem;
outline: none;
padding: 8px;
}

#rv-chat-input-area button{
background: var(--color_red);
border-radius: 0;
border: none;
color: #fff;
clip-path: polygon(calc(100% - 8px) 100%, 100% calc(100% - 8px), 100% 8px, calc(100% - 8px) 0%, 8px 0%, 0% 8px, 0% calc(100% - 8px), 8px 100%);
cursor: pointer;
font-weight: bold;
margin-left: 12px;
padding: 8px 14px;
}

#rv-chat-input-area button:hover{
opacity: 0.9;
}

.rv-chat-msg{
margin: 12px 0;
}

.rv-chat-msg.user{
text-align: right;
}

.rv-chat-msg.bot{
text-align: left;
}

.rv-chat-bubble{
clip-path: polygon(calc(100% - 8px) 100%, 100% calc(100% - 8px), 100% 8px, calc(100% - 8px) 0%, 8px 0%, 0% 8px, 0% 100%);
display: inline-block;
max-width: 80%;
padding: 8px 12px;
word-wrap: break-word;
}

.rv-chat-msg.user .rv-chat-bubble{
background: var(--color_red);
border-bottom-right-radius: 0;
clip-path: polygon(100% 100%, 100% 8px, calc(100% - 8px) 0%, 8px 0%, 0% 8px, 0% calc(100% - 8px), 8px 100%);
color: #fff;
}

.rv-chat-msg.bot .rv-chat-bubble{
background: #e5e5e5;
border-bottom-left-radius: 0;
color: var(--color_black);
}

.rv-chat-bubble ul {
font-size: 0.9125rem;
list-style: none;
padding: 0;
}

.rv-chat-bubble ul li {
display: inline-flex;
gap: 0.5rem;
list-style: none;
margin-bottom: 4px;
width: 100%;
}

.rv-chat-bubble ul li::before {
content: "\\2022";
display: inline-block;
}

.rv-card{
background: #cccccc;
clip-path: polygon(calc(100% - 14px) 100%, 100% calc(100% - 14px), 100% 14px, calc(100% - 14px) 0%, 14px 0%, 0% 14px, 0% 100%);
margin: 12px 0;
padding: 1px;
}

.rv-card .rv-inner{
background-color: #ffffff;
clip-path: polygon(calc(100% - 13px) 100%, 100% calc(100% - 13px), 100% 13px, calc(100% - 13px) 0%, 13px 0%, 0% 13px, 0% 100%);
padding: 8px 13px 13px 13px;
}

.rv-card img{
clip-path: polygon(100% 100%, 100% 11px, calc(100% - 11px) 0%, 11px 0%, 0% 11px, 0% 100%);
margin-bottom: 6px;
object-fit: cover;
width: 100%;
}

.rv-card a{
color: var(--color_red);
display: block;
margin-top: 6px;
}

@keyframes rv-blink{
0%,80%,100%{ opacity: 0.2; }
40%{ opacity: 1; }
}

.rv-typing span{
animation: rv-blink 1.4s infinite both;
background: #999;
border-radius: 50%;
display: inline-block;
height: 4px;
margin-right: 2px;
width: 4px;
}

.rv-contact-form{
margin-top: 12px;
}

.rv-contact-form input{
border-radius: 4px;
border: 1px solid #ccc;
display: block;
margin: 4px 0;
padding: 6px;
width: 100%;
}

.rv-contact-form button{
background: var(--color_red);
border-radius: 4px;
border: none;
color: #fff;
cursor: pointer;
margin-top: 6px;
padding: 8px 14px;
}

.rv-contact-form button:hover{
opacity: 0.9;
}

ul.rv-disclaimer-links{
display: flex;
flex-wrap: wrap;
justify-content: center;
}

ul.rv-disclaimer-links li:not(:first-child):before{
content: "|";
margin-left:8px;
margin-right:4px;
opacity: 0.3;
}

ul.rv-disclaimer-links a{
color: #999;
font-size: 0.65rem;
text-transform: uppercase;
}

@supports (height: 100svh) {
#rv-chat-window {
height: 100svh;
}
}

@media only screen and (min-width: 680px){

html.rv-chat-open,
body.rv-chat-open {
overflow: auto;
position: static;
}

#rv-chat-window{
background-color: #dddddd;
border: 1px solid #ddd;
clip-path: polygon(calc(100% - 14px) 100%, 100% calc(100% - 14px), 100% 14px, calc(100% - 14px) 0%, 14px 0%, 0% 14px, 0% calc(100% - 14px), 14px 100%);
inset: auto 20px 20px auto;
max-height: 93vh;
max-width: 420px;
}

#rv-chat-window .chat-header{
        clip-path: polygon(calc(100% - 13px) 100%, 100% 100%, 100% 13px, calc(100% - 13px) 0%, 13px 0%, 0% 13px, 0% 100%, 13px 100%);
}

#rv-chat-input-area{
clip-path: polygon(calc(100% - 14px) 100%, 100% calc(100% - 14px), 100% 0%, 0% 0%, 0% calc(100% - 14px), 14px 100%);
}

}
  `;
  const style = document.createElement('style');
  style.id = 'rv-chat-style';
  style.textContent = css;
  document.head.appendChild(style);

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'rv-chat-toggle';
  //toggleBtn.textContent = 'Optimum RV Advisor';
  toggleBtn.innerHTML = 'CHAT <svg viewBox="0 0 1074.26 954.51" xmlns="http://www.w3.org/2000/svg" width="30" height="26"><path d="m241.73 1.14c-6.6 2.9-9.3 5.8-18.8 20.3-25.2 38.1-51.7 78.1-60.9 92.2-5.6 8.5-25.9 39.3-45.1 68.5-19.3 29.1-52.5 79.4-73.8 111.7-21.3 32.4-39.5 60.7-40.6 63-2.7 6.3-3.2 11.6-1.7 17.3 1.3 5.1 5 10.8 41.5 64.6 9.2 13.5 30.7 45.1 47.7 70.2 17.1 25.2 34.8 51.4 39.5 58.2s17.4 25.6 28.3 41.7 28 41.2 37.9 55.8 18.4 27.2 18.8 28.1c.7 1.2-5.7 12.2-25.3 44-14.5 23.3-34.8 56.1-45.2 72.9-10.3 16.8-29.8 48.3-43.3 70-13.4 21.7-25.1 41.2-25.8 43.4-4.4 12.4 3 27.4 15.1 30.7 2.2.6 7.2.9 11.1.7 6.9-.5 8.1-1 52-23.3 24.7-12.5 53.9-27.4 64.9-33s38-19.4 60-30.5 50.4-25.5 63-32c12.7-6.5 39.7-20.2 60-30.5 20.4-10.3 46.5-23.6 58-29.5 11.6-5.9 39.3-20.1 61.8-31.4l40.7-20.7 32.8.6c48.3.8 171.3 2.5 204.7 2.7 32.1.2 34.8-.2 41.3-5.7 2-1.8 8.7-10.4 14.8-19.1 28.2-40.4 212.4-305.4 214.7-309 1.5-2.2 3.2-6.5 3.9-9.5 1.7-8.6-.2-13.7-13.4-35.4-6.3-10.5-36.6-60.4-67.3-111s-71.6-118.1-91-150c-19.3-31.9-36.8-60.8-38.9-64.2-4.1-6.9-8.2-10.8-14.1-13.4-5-2.1-20.9-2.6-135.5-3.9-123.8-1.5-232.3-2.9-311.5-4-154.9-2.1-156.7-2.1-160.3-.5zm103.5 48.3c2.3.7 2.3.8-1.6 7.2-2.1 3.6-10.7 18.2-19.1 32.5-18.2 30.8-29.2 48.5-58.7 94-12.1 18.7-36.1 55.8-53.3 82.5s-38.6 59.7-47.5 73.5c-8.9 13.7-26.9 41.6-39.9 61.8-13.1 20.2-24.2 36.7-24.7 36.5-.4-.2-11.4-16-24.4-35.1l-23.7-34.9 4.8-7.1c2.6-4 34-51.5 69.7-105.7 35.8-54.2 73.3-111.1 83.5-126.5 10.1-15.4 26.1-39.6 35.4-53.8l17-25.7 40.2.1c22 .1 41.1.4 42.3.7zm124.1 1.7c.1.1-5.5 9.9-12.6 21.6-7.1 11.8-25.3 41.9-40.4 66.9s-30 49.5-33 54.5c-3 4.9-16.2 26.5-29.3 48-18.6 30.5-116.9 190.7-174.9 285.2-4.4 7.3-8.4 13.2-8.8 13-.4-.1-9.3-12.8-19.7-28.1-14.7-21.6-18.8-28.3-18.1-29.6 8.4-15.6 31.4-52.8 63.8-103 34.6-53.5 116.8-180.7 136.7-211.5 8.9-13.8 25.3-39.2 36.5-56.5s23.2-36 26.8-41.5 7.5-12.3 8.7-15l2.3-5.1 30.8.4c17 .2 31 .5 31.2.7zm171.3 2.1 30.6.7 1.2 48.6c.6 26.7 1.6 64.3 2.1 83.6.5 19.2 1.4 55.2 2 80 .5 24.7 1.2 49.8 1.5 55.7.2 6 .1 10.8-.3 10.8-.8 0-3.2-4.4-25.2-47-17.9-34.6-40.6-78.5-49.5-95.5-3.4-6.6-10.4-20.1-15.5-30s-10.7-20.7-12.5-24c-4.1-7.7-42.9-82.6-43.4-83.8-.3-.9 31.5-.6 109 .9zm157.5 2 6.2.5.6 16.2c.3 8.9.8 44.1 1.1 78.2s1 96.4 1.5 138.5c2.5 201.9 3.2 270.8 2.8 285.2l-.3 15.7-26-50.2c-14.3-27.6-32.6-62.9-40.6-78.5l-14.6-28.3-.7-31.7c-.4-17.4-1.1-48.6-1.6-69.2s-1.7-65-2.5-98.5c-.8-33.6-2.2-87.3-3-119.4s-1.3-58.6-1.1-59c.5-.7 69.5-.4 78.2.5zm-296.4 43.7c.2.7 8.5 17.2 18.6 36.6s18.1 36 17.8 36.8-11.9 19.7-25.8 42.1c-13.8 22.4-65 105-113.6 183.7-48.7 78.6-103.1 166.6-121 195.5-17.8 28.9-32.9 53-33.5 53.7-.9.9-6.2-6.2-22.2-29.8-11.5-17.1-21.1-31.4-21.3-31.8-.1-.5 14.2-24.4 31.9-53.2s35.2-57.4 38.9-63.4c3.7-6.1 27.5-45 53-86.5 49.1-80 54.3-88.5 127-207 25.4-41.5 46.7-76.1 47.3-76.8 1.2-1.6 2.5-1.5 2.9.1zm376.7 42.3 23.1 38 .6 185 .7 184.9-20.2 29c-11.1 15.9-20.8 29.6-21.5 30.3-1.5 1.5-1.7-9-3.6-180.3-1.4-125.5-2.9-242.7-3.6-288-.4-26-.2-38.7.4-38 .6.5 11.4 18.1 24.1 39.1zm-280.2 144.4c17.8 34.4 37.2 71.7 43 83s16.7 32.2 24.1 46.5 22.9 44.2 34.4 66.5c11.6 22.3 24.5 47.2 28.8 55.5 41.4 79.5 72.9 140.9 72.6 141.2-1 1.1-105.7-1-107-2.1-.7-.6-8.1-12.1-16.3-25.6-14.9-24.2-28.2-45.7-107.8-174.5-41.6-67.2-61.4-99.2-73.6-119.1-3.8-6.1-6.9-11.8-6.9-12.5 0-.8 7.5-13.6 16.8-28.5 9.2-14.9 25.9-42 37.2-60.2 11.3-18.3 20.9-33.1 21.4-32.9.4.2 15.4 28.4 33.3 62.7zm375.4 12.5c11.6 19.2 27.1 44.7 34.3 56.5 7.1 11.8 13 22.2 13 23 0 1.2-66 97.4-69.6 101.4-.4.6-.8-48.2-.8-108.4 0-65.7.4-109 .9-108.5.5.6 10.5 16.7 22.2 36zm-503.4 108.2c4.9 8.2 28.5 46.3 52.3 84.8s49 79.2 56 90.5c6.9 11.3 22.9 37.1 35.4 57.3 12.5 20.3 22.5 37.1 22.3 37.4-.3.2-15 .1-32.7-.4l-32.2-.8-61.4-104c-33.8-57.2-65.3-110.4-69.9-118.3-4.7-7.8-8.5-14.7-8.5-15.2 0-.8 9.8-16.9 25.7-42.3 1.3-2 2.7-3.7 3.1-3.7s4.9 6.6 9.9 14.7zm-16.7 164.3c27.1 45.9 52 88 55.2 93.5l5.9 10-2.8.4c-2.8.3-121.4-1.3-189.5-2.5-19.9-.4-34.8-1.1-34.8-1.6s25.7-42.5 57.2-93.4c44.9-72.5 57.5-92.1 58.4-91.2.6.7 23.4 38.9 50.4 84.8zm-6 151.9 8.5.6-29.5 14.9c-16.2 8.2-34 17.2-39.5 20.1s-32.5 16.6-60 30.5-57.2 29-66 33.5c-50.8 26.2-97.5 49.5-97.5 48.7s16-26.9 59-96.2c6.9-11.3 17.3-28.1 23.1-37.4l10.4-16.9 91.5.8c50.3.4 95.3 1 100 1.4z" fill="#ffffff"></path></svg>';
  document.body.appendChild(toggleBtn);

  const chatWin = document.createElement('div');
  chatWin.id = 'rv-chat-window';
  chatWin.innerHTML = `
    <div class="chat-header"><span>Optimum RV Advisor</span>
      <button id="rv-chat-close">&times;</button>
    </div>
    <div id="rv-chat-content"></div>
<div id="rv-chat-input-area">
    <div class="rv-field">
      <input id="rv-chat-input" type="text" placeholder="Type a message…">
      <button id="rv-chat-send">Send</button>
    </div>
    <ul class="rv-disclaimer-links">
            <li>
                <a href="https://max-martech.com/#legal" target="_blank">Terms of use</a>
            </li><li>
                <a href="https://max-martech.com/#privacy" target="_blank">Privacy Policy</a>
            </li>
        </ul></div>`;
  document.body.appendChild(chatWin);

  let pendingAnchors = [];
  let conversation = JSON.parse(sessionStorage.getItem('rv-convo') || '[]');
  let rehydrating = false;
  let firstOpen = true;
  let typingMsg = null;
  const $close   = chatWin.querySelector('#rv-chat-close');
  const $content = chatWin.querySelector('#rv-chat-content');
  const $input   = chatWin.querySelector('#rv-chat-input');
  const $send    = chatWin.querySelector('#rv-chat-send');

  let isOpen = sessionStorage.getItem('rv-chat-open') === 'true';

  let savedY = 0;                    // <-- new
  if (isOpen && window.innerWidth >= 680) {
    chatWin.style.display   = 'flex';
    document.documentElement.style.top = `-${savedY}px`;       // NEW
    document.body.classList.add('rv-chat-open');
    document.documentElement.classList.add('rv-chat-open');
  } else {
    chatWin.style.display   = 'none';
    document.body.classList.remove('rv-chat-open');
    document.documentElement.classList.remove('rv-chat-open');
    window.scrollTo(0, savedY);                                // NEW    
  }
  
  if (isOpen) firstOpen = false;

  function scrollBottom() {
    $content.scrollTop = $content.scrollHeight;
  }

  function fmtMoney(v) {
    return v == null ? null :
      '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  function fmtInt(v) {
    return v == null ? null :
      Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  function fmtLength(v) {
    if (v == null) return null;
    const totalInches = Math.round(Number(v) * 12);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;

    const feetPart = feet > 0 ? fmtInt(feet) + ' ft' : '';
    const inchesPart = inches > 0 ? inches + ' in' : '';

    if (feetPart && inchesPart) {
      return feetPart + ' ' + inchesPart;
    }
    return feetPart || inchesPart || '0 ft';
  }

  if (conversation.length) {
    rehydrating = true;

    conversation.forEach(t => {
      if (Array.isArray(t.results)) {
        addMessage('bot', t.results, t.text);
      } else {
        addMessage(t.role, t.text);
      }
    });

    rehydrating = false;
    firstOpen = false;
  }

  toggleBtn.onclick = () => {
	chatWin.style.display = 'flex';
	toggleBtn.style.display = 'none';
	sessionStorage.setItem('rv-chat-open', 'true');
	document.body.classList.add('rv-chat-open');
	//document.documentElement.style.top = `-${savedY}px`;       // NEW
	document.documentElement.classList.add('rv-chat-open');

  if (window.innerWidth >= 680) {
	  $input.focus();
  }

  if (!firstOpen) scrollBottom();

	if (firstOpen) {
		typingMsg = document.createElement('div');
		typingMsg.className = 'rv-chat-msg bot';
		const bub = document.createElement('div');
		bub.className = 'rv-chat-bubble';
		bub.innerHTML = '<div class="rv-typing"><span></span><span></span><span></span></div>';
		typingMsg.appendChild(bub);
	$content.appendChild(typingMsg);
	scrollBottom();

	setTimeout(() => {
		if (typingMsg) { typingMsg.remove(); typingMsg = null; }
		addMessage('bot', `As an RV Advisor, I'm here to help you find your perfect RV. You can ask me anything. For example:
    <ul>
    <li><em><a href="#" onclick="document.getElementById('rv-chat-input').value = 'Used Travel Trailers that are less than 3 years old and under $300/mo'; document.getElementById('rv-chat-input').focus(); return false;">Used Travel Trailers that are less than 3 years old and under $300/mo</a></em>
    <li><em><a href="#" onclick="document.getElementById('rv-chat-input').value = 'Fifth Wheels that have bunk beds and an outside kitchen'; document.getElementById('rv-chat-input').focus(); return false;">Fifth Wheels that have bunk beds and an outside kitchen</a></em>
    <li><em><a href="#" onclick="document.getElementById('rv-chat-input').value = 'Travel Trailers that an SUV can tow with a 500 lb tongue weight'; document.getElementById('rv-chat-input').focus(); return false;">Travel Trailers that an SUV can tow with a 500 lb tongue weight</a></em>
    <li><em><a href="#" onclick="document.getElementById('rv-chat-input').value = 'Motorhomes that sleep at least 6 and under $75k'; document.getElementById('rv-chat-input').focus(); return false;">Motorhomes that sleep at least 6 and under $75k</a></em>
    <li><em><a href="#" onclick="document.getElementById('rv-chat-input').value = 'Toy Haulers that have at least 75 gallons of fresh water and gray water of at least 50'; document.getElementById('rv-chat-input').focus(); return false;">Toy Haulers that have at least 75 gallons of fresh water and gray water of at least 50</a></em>
    </ul>`);
	}, 500);

	firstOpen = false;
	}
  };

  $close.onclick = () => { 
    chatWin.style.display='none'; 
    toggleBtn.style.display='flex';
    sessionStorage.setItem('rv-chat-open', 'false');
    document.body.classList.remove('rv-chat-open');
    document.documentElement.classList.remove('rv-chat-open');

   };

  $send.onclick = sendMessage;
  $input.addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();sendMessage();}});

  function sendMessage(){
    if (typingMsg) { typingMsg.remove(); typingMsg = null; }	
    const text = $input.value.trim();
    if(!text) return;
    addMessage('user',text);

    const anchor = $content.querySelector('.rv-chat-msg.user:last-child');
	pendingAnchors.push(anchor);

    typingMsg = document.createElement('div');
    typingMsg.className = 'rv-chat-msg bot';
    const bub = document.createElement('div');
    bub.className = 'rv-chat-bubble';
    bub.innerHTML = '<div class="rv-typing"><span></span><span></span><span></span></div>';
    typingMsg.appendChild(bub);
    $content.appendChild(typingMsg);
    scrollBottom();

    $input.value='';

	const chatguid = sessionStorage.getItem('chatguid');
	const primaryguid = localStorage.getItem('primaryguid');
    const payload={
      conversation:[...conversation],
      locationlist: localStorage.getItem('locationlist') ?? '278,819,468,924,1587,862,1523,1522,1097,1388,1657,1809',
	  currenturl:   window.location.href,
	  browserTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
	if (chatguid) payload.chatguid = chatguid;
	if (primaryguid) payload.primaryguid = primaryguid;

	const allResults = conversation
      .filter(t => Array.isArray(t.results))
      .flatMap(t => t.results);
	if (allResults.length) payload.results = allResults;

    fetch(`${URL_API_BASE}/Optimum/Ask?passcode=hGxD4_M5e^`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    })
    .then(r=>{
      if(!r.ok) throw new Error(r.status);
      return r.headers.get('content-type')?.includes('application/json')?r.json():r.text();
    })
    .then(handleResponse)
	.catch(err => {
		console.error('Chat API error:', err);
		if (typingMsg) { typingMsg.remove(); typingMsg = null; }
		addMessage('bot', 'We are experiencing an issue right now. Please try again in a moment.');
	});
  }

  function handleResponse(data){
	if (typingMsg) { typingMsg.remove(); typingMsg = null; }
	const anchor = pendingAnchors.shift() || null;

	if (data && typeof data === 'object' && data.chatguid) {
		sessionStorage.setItem('chatguid', data.chatguid);
	}

	if (data && typeof data === 'object' && data.primaryguid) {
		localStorage.setItem('primaryguid', data.primaryguid);
	}

  	const rvQuery = data && typeof data === 'object' ? data.rvquery ?? null : null;

	if (typeof data === 'string') {
  		addMessage('bot', data, null, anchor, rvQuery);
		return;
	}	

    const plain = data.text || data.answer || null;
    const rvList = Array.isArray(data) ? data : (data.rvs || data.matches) || [];

	if (rvList.length) {
		addMessage('bot', rvList, plain, anchor, rvQuery);

		if (!rehydrating) {
			conversation.push({
				role:    'bot',
				text:    plain ?? `Returned ${rvList.length} RV match(es).`,
				results: rvList,
				...(rvQuery && { rvquery: rvQuery }) 
			});
			sessionStorage.setItem('rv-convo', JSON.stringify(conversation));
		}
	} else {
		addMessage('bot', plain ?? JSON.stringify(data), null, anchor, rvQuery);
	}

  /* --- MINIMAL ADD: Auto-fill & submit when contact_info_complete === true --- */
  if (data && data.contactinfocomplete === true) {
    const form = document.createElement('form');
    form.className = 'rv-contact-form';
    form.style.display = 'none'; // keep it hidden during auto-submit
    form.innerHTML = `
        <input name="name"  placeholder="Name" required>
        <input name="email" type="email" placeholder="Email">
        <input name="cell"  placeholder="Cell Phone">
        <button type="submit">Submit</button>`;

    const lastBot = $content.querySelector('.rv-chat-msg.bot:last-child');
    const bubble  = lastBot && lastBot.querySelector('.rv-chat-bubble');
    (bubble || lastBot || $content).appendChild(form);

    // Attach the SAME submit handler logic
    form.addEventListener('submit', e => {
      e.preventDefault();
      const j = {
        leadTypeCode:   'CHT',
        name:           form.elements.name.value,
        cellPhoneNumber:form.elements.cell.value,
        emailAddress:   form.elements.email.value,
        referringURLs:  localStorage.getItem('referringURLs'),
        landingPages:   localStorage.getItem('landingPages'),
        userActivity:   localStorage.getItem('activity'),
        UserFavorites:  localStorage.getItem('Favorites'),
        locations:      localStorage.getItem('locationlist'),
        guid:           localStorage.getItem('primaryguid'),
        chatGUID:       sessionStorage.getItem('chatguid'),
        message: conversation
                  .map(c => `${c.role.toUpperCase()}: ${c.text}`)
                  .join('\n')
      };
      fetch(`${URL_API_BASE}/Optimum/Lead`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(j)
      })
      .then(r=>{
        if (r.ok) {
          // If hidden (auto), show a visible thank-you
          if (form.style.display === 'none') {
            //addMessage('bot', '<strong>Thank you! We’ll be in touch soon.</strong>');
            form.remove();
          } else {
            const thanks = document.createElement('div');
            thanks.innerHTML = '.';
            thanks.style.marginTop = '8px';
            form.replaceWith(thanks);
          }
        } else {
          if (form.style.display === 'none') {
            addMessage('bot', 'Submission failed');
          } else {
            alert('Submission failed');
          }
        }
      })
      .catch(()=>{
        if (form.style.display === 'none') {
          addMessage('bot', 'Submission failed');
        } else {
          alert('Submission failed');
        }
      });
    });

    // Fill values and submit
    const fullName = `${data.firstname ?? ''} ${data.lastname ?? ''}`.trim();
    form.elements.name.value  = fullName;
    form.elements.email.value = data.email ?? '';
    form.elements.cell.value  = data.phonenumber ?? '';
    // Trigger submit programmatically
    if (form.requestSubmit) form.requestSubmit();
    else form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
    return; // prevent also rendering the visible form below
  }
  /* --- END MINIMAL ADD --- */

if (data && data.showcontactform) {
  const form = document.createElement('form');
  form.className = 'rv-contact-form';
  form.innerHTML = `
      <input name="name"  placeholder="Name"        required>
      <input name="email" type="email" placeholder="Email" required>
      <input name="cell"  placeholder="Cell Phone">
      <button type="submit">Submit</button>`;
  
  const lastBot = $content.querySelector('.rv-chat-msg.bot:last-child');
  const bubble  = lastBot && lastBot.querySelector('.rv-chat-bubble');
  (bubble || lastBot).appendChild(form);
  scrollBottom();
  
  form.addEventListener('submit', e => {
    e.preventDefault();
    const j = {
      leadTypeCode:   'CHT',
      name:           form.elements.name.value,
      cellPhoneNumber:form.elements.cell.value,
      emailAddress:   form.elements.email.value,
      referringURLs:  localStorage.getItem('referringURLs'),
      landingPages:   localStorage.getItem('landingPages'),
      userActivity:   localStorage.getItem('activity'),
      UserFavorites:  localStorage.getItem('Favorites'),
      locations:      localStorage.getItem('locationlist'),
      guid:           localStorage.getItem('primaryguid'),
      chatGUID:       sessionStorage.getItem('chatguid'),

      message: conversation
                .map(c => `${c.role.toUpperCase()}: ${c.text}`)
                .join('\n')
  };
	fetch(`${URL_API_BASE}/Optimum/Lead`, {
		method:'POST',
		headers:{'Content-Type':'application/json'},
		body: JSON.stringify(j)
		})
		.then(r=>{
		if (r.ok) {
			const thanks = document.createElement('div');
			thanks.innerHTML = '<strong>Thank you! We’ll be in touch soon.</strong>';
			thanks.style.marginTop = '8px';
			form.replaceWith(thanks);
		} else {
			alert('Submission failed');
		}
		})
		.catch(()=>alert('Submission failed'));
		});
	}
  }

  function linkify(text) {
    const urlRE = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRE, raw => {
      const clean = raw.replace(/[.,;:!?)\]]+$/, '');
      const trail = raw.slice(clean.length);
      return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${trail}`;
    });
  }

function extractQueryKeys(raw) {
  if (!raw) return [];
  let obj = null;

  if (typeof raw === 'object') {
    obj = raw;
  } else if (typeof raw === 'string') {
    const jsonStart = raw.indexOf('{');
    if (jsonStart !== -1) {
      try { obj = JSON.parse(raw.slice(jsonStart)); } catch { /* ignore */ }
    }
  }
  const rvq = obj?.rv_query ?? obj;
  return rvq && typeof rvq === 'object'
    ? Object.keys(rvq).map(k => k.replace(/^(min|max)/i, '').toLowerCase())
    : [];
}


function addMessage(role, content, summaryOverride = null, afterEl = null, rvQueryOverride = null) {
  const msg = document.createElement('div');
  msg.className = `rv-chat-msg ${role}`;
  
  if (role === 'user') {
    const b = document.createElement('div');
    b.className = 'rv-chat-bubble';
    b.textContent = content;
    msg.appendChild(b);
    $content.appendChild(msg);
    if (!rehydrating) {
      conversation.push({ role: 'user', text: content });
      sessionStorage.setItem('rv-convo', JSON.stringify(conversation));
    }
    scrollBottom();
    return;
  }

  if (typeof content === 'string') {
    const b = document.createElement('div');
    b.className = 'rv-chat-bubble';
    //b.innerHTML = linkify(content);
    //b.innerHTML  = linkify(content).replace(/\n/g,'<br>'); //Taken out since AI was instructed to output basic HTML
    b.innerHTML  = content;
    msg.appendChild(b);
    $content.appendChild(msg);
    if (!rehydrating) {
      conversation.push({ role: 'bot', text: content });
      sessionStorage.setItem('rv-convo', JSON.stringify(conversation));
    }
    scrollBottom();
    return;
  }

  if (summaryOverride) {
    const intro = document.createElement('div');
    intro.className = 'rv-chat-bubble';
    intro.textContent = summaryOverride;
    msg.appendChild(intro);
  }

const wanted = rvQueryOverride
  ? extractQueryKeys(rvQueryOverride)
  : extractQueryKeys(
      (conversation.slice().reverse()
        .find(t => t.rvquery) || {}).rvquery
    );
const showIfWanted = key => wanted.includes(key.toLowerCase());

  content.forEach(rv => {
    const card = document.createElement('div');
    card.className = 'rv-card';

    const cardinner = document.createElement('div');
    cardinner.className = 'rv-inner';

    card.appendChild(cardinner);

    if (rv.photo) {
      const img = document.createElement('img');
      img.src = rv.photo;
      img.alt = rv.title || rv.model || 'RV';
      if (rv.url) {
        const a = document.createElement('a');
        a.href = rv.url;
        a.appendChild(img);
        cardinner.appendChild(a);
      } else {
        cardinner.appendChild(img);
      }
    }

    const addRow = (lbl, val) => {
      if (val !== undefined && val !== null && val !== '') {
        const d = document.createElement('div');
        d.innerHTML = `<strong>${lbl}:</strong> ${val}`;
        cardinner.appendChild(d);
      }
    };

    const title = rv.title ||
      `${rv.year || ''} ${rv.make || ''} ${rv.model || ''} ${rv.floorplan || ''}`.trim();
    addRow(rv.index ? `#${rv.index}` : 'Title', title);
    addRow('Stock #', rv.stockNumber);
    addRow('Condition', rv.condition);
    addRow('Class', rv.classType);
    addRow('Location', rv.location);
    addRow('MSRP', fmtMoney(rv.msrp));
    addRow('Sale Price', fmtMoney(rv.salesPrice));
    addRow('Monthly Pay', fmtMoney(rv.monthlyPayment));
    addRow('Sleeps', rv.sleeps);
    addRow('Length (ft)', fmtLength(rv.length));
    addRow('Slides', rv.slides);
    addRow('Fuel', rv.fuelType && rv.fuelType.toUpperCase() !== 'N/A' ? rv.fuelType : null);
    addRow('Weight (lb)', fmtInt(rv.weight));
    addRow('Features', rv.features);

    if (showIfWanted('locationPhoneNumber')) addRow('Location Phone', rv.locationPhoneNumber);
    if (showIfWanted('savings'))             addRow('Savings', fmtMoney(rv.savings));
    if (showIfWanted('sourceDetails'))       addRow('Source', rv.sourceDetails);
    if (showIfWanted('engineModel'))         addRow('Engine', rv.engineModel);
    if (showIfWanted('mileage'))             addRow('Mileage', fmtInt(rv.mileage));
    if (showIfWanted('vin'))                 addRow('VIN', rv.vin);
    if (showIfWanted('horsepower'))          addRow('Horsepower', rv.horsepower);
    if (showIfWanted('torque'))              addRow('Torque', fmtInt(rv.torque));
    if (showIfWanted('chassis'))             addRow('Chassis', rv.chassis);
    if (showIfWanted('numberOfAwnings'))     addRow('Awnings', rv.numberOfAwnings);
    if (showIfWanted('generator'))           addRow('Generator', rv.generator);
    if (showIfWanted('availableBeds'))       addRow('Beds', rv.availableBeds);
    if (showIfWanted('exteriorHeight'))      addRow('Ext Height', rv.exteriorHeight);
    if (showIfWanted('interiorHeight'))      addRow('Int Height', rv.interiorHeight);
    if (showIfWanted('grossWeight'))         addRow('Gross Weight', fmtInt(rv.grossWeight));
    if (showIfWanted('dryWeight'))           addRow('Dry Weight', fmtInt(rv.dryWeight));
    if (showIfWanted('cargoWeight'))         addRow('Cargo Weight', fmtInt(rv.cargoWeight));
    if (showIfWanted('hitchWeight'))         addRow('Hitch Weight', fmtInt(rv.hitchWeight));
    if (showIfWanted('axleCount'))           addRow('Axles', fmtInt(rv.axleCount));
    if (showIfWanted('exteriorWidth'))       addRow('Ext Width', rv.exteriorWidth);
    if (showIfWanted('wheelbase'))           addRow('Wheelbase', rv.wheelbase);
    if (showIfWanted('freshWaterCapacity'))  addRow('Fresh Water', rv.freshWaterCapacity);
    if (showIfWanted('greyWaterCapacity'))   addRow('Grey Water', rv.greyWaterCapacity);
    if (showIfWanted('blackWaterCapacity'))  addRow('Black Water', rv.blackWaterCapacity);
    if (showIfWanted('fuelCapacity'))        addRow('Fuel Cap', rv.fuelCapacity);
    if (showIfWanted('electricalService'))   addRow('Elec Service', rv.electricalService);
    if (showIfWanted('tireSize'))            addRow('Tire Size', rv.tireSize);
    if (showIfWanted('garageSize'))          addRow('Garage', rv.garageSize);
    if (showIfWanted('furnaceBtu'))          addRow('Furnace BTU', rv.furnaceBtu);
    if (showIfWanted('refrigeratorType'))    addRow('Fridge Type', rv.refrigeratorType);
    if (showIfWanted('refrigeratorSize'))    addRow('Fridge Size', rv.refrigeratorSize);
    if (showIfWanted('convectionCooking'))   addRow('Convection', rv.convectionCooking);
    if (showIfWanted('cooktopBurners'))      addRow('Burners', rv.cooktopBurners);
    if (showIfWanted('showerSize'))          addRow('Shower Size', rv.showerSize);
    if (showIfWanted('showerType'))          addRow('Shower Type', rv.showerType);
    if (showIfWanted('washerDryerAvailable'))addRow('Washer/Dryer', rv.washerDryerAvailable);
    if (showIfWanted('tvInfo'))              addRow('TV Info', rv.tvInfo);
    if (showIfWanted('numberOfPhotos'))      addRow('# Photos', rv.numberOfPhotos);
    if (showIfWanted('locationId'))          addRow('Location ID', rv.locationId);

    if (rv.url) {
      const link = document.createElement('a');
      link.href = rv.url;
      link.textContent = 'View Details';
      cardinner.appendChild(link);
    }
    msg.appendChild(card);
  });

  if (afterEl && afterEl.parentNode === $content) {
    $content.insertBefore(msg, afterEl.nextSibling);
  } else {
    $content.appendChild(msg);
  }

  const prev = msg.previousElementSibling;
  if (prev) {
    if (content.length === 1) {
      const maxScroll = $content.scrollHeight - $content.clientHeight;
      const keepQuestion = prev.offsetTop - 6;
      $content.scrollTop = Math.min(keepQuestion, maxScroll);
    } else {
      prev.scrollIntoView({ block: 'start' });
      $content.scrollTop -= 6;
    }
  } else {
    msg.scrollIntoView({ block: 'start' });
  }
}



})();
