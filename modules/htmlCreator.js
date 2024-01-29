import dayjs from "./day.js";
import MarkdownIt from "./markdown-it.js";

export default function(parser, conversation) {
    return new Promise((resolve, reject) => {
    parser(conversation).catch(function (error) {reject(error)})
    .then((data) => {
        if (!data) reject(new Error('The parser send nothing. Please retry with annother file.'))
        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="shortcut icon" type="image/png" href="assets/openai.webp"><link rel="stylesheet" href="assets/main.css"><script defer src="assets/main.js"></script><script src="assets/highlight.js"></script><script src="assets/splide.js"></script><style>.full{ background-color: #36393e;z-index:1000;height:100%;width:100%;font-weight:600;position:absolute;display:flex;align-items:center;justify-content:center} body{overflow: hidden; scroll-behavior: auto;}*{--bot-color-msg: ${data.color};}</style><title>${data.title} • GPTSaver</title></head><body><noscript><div class="full error"><p>JavaScript is not enabled !<br>Please enable it to access to your conversation.</p></div></noscript><div class="app" style="opacity: 0;"><header><h1>${data.title}</h1><h2>Conversation with ${data.botName} by ${data.userName}. Save on ${dayjs().format("MM-DD-YYYY")}</h2></header><div class='main lists'>`

        let nbMsgs = 1
        let nbCarrousel = 1

        function message(msg, num) {
            var md = new MarkdownIt();
            var text = md.render(msg.content);
            html += `<div class="message ${
                msg.isBot ? "bot" : "user"
            }" id="msg${num}">`
            if (! msg.isBot) 
                html += `<img src="${
                    msg.user.img
                }" alt="${
                    msg.user.name
                }" class="icon">`
             else 
                html += `<img src="assets/openai.webp" alt="ChatGPT" class="icon">`
             html += `<div class="bubble"><div class="head"><div class="username">${
                msg.isBot ? "ChatGPT" : msg.user.name
            }</div><div class="date">${
                msg.date.format("ddd D MMM YYYY  -  hh:mma")
            }</div></div><div class="content">${text}</div></div></div>`
        }
        
        function traitement(array) {
            array.forEach(msg => {
                if (Array.isArray(msg)) {
                    caroussel(msg, nbCarrousel++)
                } else {
                    if (!msg.visible) 
                        return
                    
                    message(msg, nbMsgs++)
                }
            });
        }
        function caroussel(treads, num) {

            html += `<div class="splide" id="splide${num}"><div class="splide__track"><ul class="splide__list">`

            treads.forEach(msgs => {
                html += `<li class="splide__slide"><div class="lists">`
                traitement(msgs)
                html += `</div></li>`
            });

            html += `</ul></div></div>`

        }

        traitement(data.messages)

        html += `</div><a class="backtop" href="#"><svg width="35" height="35" viewBox="0 0 24 24"><path fill="#ffffff"d="M8.12 14.71L12 10.83l3.88 3.88a.996.996 0 1 0 1.41-1.41L12.7 8.71a.996.996 0 0 0-1.41 0L6.7 13.3a.996.996 0 0 0 0 1.41c.39.38 1.03.39 1.42 0z" /></svg></a><footer id="last"><p>This was the last message!<br><br><br>This conversation was saved with GPTSaver on ${dayjs().format("ddd D MMM YYYY hh:mma")} by ${data.userName}.<br>GPTSaver is made with ❤️ by <a href="https://matsukky.com" target="_blank" rel="noopener noreferrer">Matsukky</a>. No link with OpenIA.</p></footer></div><div class="full wait" style="opacity: 1;"><p>Loading your conversation...<br>Please wait.</p></div></body></html>`


        resolve(Object({html,data}))
        
    })
})}
