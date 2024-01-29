import parser from "./modules/parser/march_2023.js";
import htmlCreator from "./modules/htmlCreator.js";
import JSZip from "./modules/jszip.js";

if (typeof browser === "undefined") {
  var browser = chrome;
}

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "htmlCreator") {
      (async function () {
      try {
        const result = await htmlCreator(parser, request.data);
        const fileName = "[GPTSaver]_"+result.data.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '_').replace(/[^a-z0-9-_]/g, '') + ".zip";
        const comment = `Thank you ${result.data.userName} for using GPTSaver. This app was create by Matsukky, please check https://matsukky.com.\nFor open you conversation, open index.html.`;
        const zip = new JSZip();
        zip.file('index.html', result.html);
        zip.file('data.json', JSON.stringify(result.data));
        zip.file('README', comment);
        const response = await fetch(browser.runtime.getURL('filesInfo.json'));
        const data = await response.json();
        for (const filename of data) {
          try {
            const response = await fetch(browser.runtime.getURL(filename));
            const fileData = await response.arrayBuffer();
            zip.file(filename, fileData);
          } catch (error) {
            console.error(error);
            sendResponse(error)
          }}
        const content = await zip.generateAsync({type:"base64", comment});
        sendResponse({content, fileName});
      } catch (error) { sendResponse(error) }})();
      return true;
    }})