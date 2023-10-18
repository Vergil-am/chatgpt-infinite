const express = require("express"); //import express
const puppeteer = require("puppeteer-extra"); //import puppeteer
const StealthPlugin = require("puppeteer-extra-plugin-stealth"); //import stealth plugin
const { v4: uuidv4 } = require("uuid"); //import uuid
puppeteer.use(StealthPlugin()); //use the plugin
const app = express(); //create an express app
app.use(express.json()); //use the json parser
const port = process.env.PORT || 3000; //set the port
const http = require("http"); //import http
const server = http.createServer(app); //create a server
server.listen(port, () => console.log(`server running on ${port}`)); //listen to the port
let current_message_id; //current message id
let parent_message_id; //parent message id
let conversation_id; //conversation id
let howManyTimes = 0; //how many times the user call the api
let auth_token; //auth token
let browser; //browser
let pageMap = new Map(); //map to store the page
let checkForIfTheUserCallThisForSignUp = false; //check if the user call the api for the first time
let loadNewBrowser = async () => {
  //load a new browser
  if (!browser) {
    browser = await puppeteer.launch({
      //launch the browser
      headless: false, //change to false if you want to see the browser
      // executablePath: "path/to/Chrome", //change this to your chrome path ex: C:/Program Files/Google/Chrome/Application/chrome.exe or remove this line if you want to use the default chrome
    });
  }
  return browser; //return the browser
};
app.post("/get-chat", async (req, res) => {
  //api to get the chat
  const url = "https://chat.openai.com"; //url of the website
  let page; //page
  if (pageMap.has(url)) {
    //check if the page is already loaded
    page = pageMap.get(url); //get the page
    await page.setRequestInterception(true); //set the request interception to true
    try {
      page.on("request", async (request) => {
        //request interception
        try {
          let fetchUrl = request.url(); //fetch the url
          if (fetchUrl === "https://chat.openai.com/backend-api/conversation") {
            //check if the url is the conversation url
            if (request.method() === "POST") {
              //check if the method is post
              let payLoad = await request.postData(); //fetch the payload
              let parsedData = JSON.parse(payLoad); //parse the payload to json
              let headers = `${JSON.stringify(request.headers())}`; //fetch the headers
              let headerInJson = JSON.parse(headers); //parse the headers to json
              auth_token = headerInJson.authorization; //fetch the auth token
              parent_message_id = parsedData.messages[0].id; //fetch the parent message id
              current_message_id = uuidv4(); //generate a new message id in uuid format
            }
          }
          if (request.interceptResolutionState().action === "already-handled")
            //check if the request is already handled
            return; //then return
          request.continue(); //otherwise continue
        } catch (err) {
          console.log(err); //log the error
        }
      });
    } catch (err) {}
    howManyTimes++; //increment the how many times the user call the api
  } else {
    let browserInstance = await loadNewBrowser(); //load a new browser
    page = await browserInstance.newPage(); //create a new page
    await page.goto(url); //go to the url
    pageMap.set(url, page); //set the page to the map
    howManyTimes++; //increment the how many times the user call the api
  }

  if (!checkForIfTheUserCallThisForSignUp) {
    //check if the user call the api for the first time
    let enterLoginButton = await page.evaluate(() => {
      //click the login button
      let loginButton = document.querySelector(
        '[class="relative flex h-12 items-center justify-center rounded-md text-center text-base font-medium bg-[#3C46FF] text-[#fff] hover:bg-[#0000FF]"]'
      );
      loginButton.click();
    });
    //input the email
    await page.waitForNavigation(); //wait for the navigation to complete
    await page.$eval(
      //input the email
      "#username",
      (input, value) => {
        input.value = value;
      },
      req.body.email //email
    );
    //click the continue button
    let button = await page.waitForSelector("button._button-login-id");
    await button.click();
    //input the password and hit conitnue
    await page.waitForNavigation();
    let putPasswordAndContinue = await page.evaluate((password) => {
      document.querySelector("#password").value = password; //input the password
      setTimeout(() => {
        let login = document.querySelector("._button-login-password");
        login.click(); //click the login button
      }, 1000); //wait for 1 second
    }, req.body.password); //password
    checkForIfTheUserCallThisForSignUp = true; //set the checkForIfTheUserCallThisForSignUp to true to know that the user call the api for the first time and the user is logged in
    return res.status(200).json({
      //return the message
      message:
        "signup sucessfull, enjoy we are working on the chatbot, please wait for 10 seconds and then send the message again",
    });
  } else {
    if (howManyTimes <= 2) {
      //check if the user call the api for the second time
      //close the popup

      await page.waitForSelector('[class="btn relative btn-primary"]'); //wait for the selector to load
      await page.click('[class="btn relative btn-primary"]'); //click the button
      //send a test message to get the conversation id
      await page.waitForSelector("textarea#prompt-textarea"); //wait for the selector to load
      await page.type("textarea#prompt-textarea", "test message"); //type the message
      let clickTheSendButton = await page.evaluate(() => {
        //click the send button
        let btn = document.querySelector(
          '[class="absolute p-1 rounded-md md:bottom-3 gizmo:md:bottom-2.5 md:p-2 md:right-3 dark:hover:bg-gray-900 dark:disabled:hover:bg-transparent right-2 disabled:text-gray-400 enabled:bg-brand-purple gizmo:enabled:bg-transparent text-white gizmo:text-gray-500 gizmo:dark:text-gray-300 bottom-1.5 transition-colors disabled:opacity-40"]'
        );
        btn.click();
      });
      return res.status(200).json({
        //return the message
        message:
          "done, from now on you can send the message to the chatbot, enjoy",
      });
    }
    //send the message
    //feth the conversation id
    conversation_id = page.url().split("/")[4];
    //fetch the data
    let fetchMessage = await page.evaluate(
      ({
        auth_token,
        conversation_id,
        current_message_id,
        parent_message_id,
        message,
      }) => {
        return new Promise((resolve) => {
          //make a promise to fetch the message to our server
          fetch("https://chat.openai.com/backend-api/conversation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": "739",
              Accept: "text/event-stream",
              "Accept-Encoding": "gzip, deflate, br",
              "Accept-Language": "en-US",
              Authorization: auth_token,
            },
            body: JSON.stringify({
              action: "next",
              arkose_token: null,
              force_paragen: false,
              conversation_id: conversation_id,
              history_and_training_disabled: false,
              messages: [
                {
                  author: {
                    role: "user",
                  },
                  content: {
                    content_type: "text",
                    parts: [message],
                  },
                  id: current_message_id,
                },
              ],
              parent_message_id: parent_message_id,
              model: "text-davinci-002-render-sha",
              suggestions: [],
              timezone_offset_min: -345,
            }),
          })
            .then((res) => res.text())
            .then((data) => {
              console.log(data);
              //extract the message comed from chatbot
              let jsonData = `${data}`;
              let times = 0;
              let outputS = "";
              let isUnderArray = false;
              let reversedJson = Array.from(jsonData).reverse();
              let ifItIsThenDoNotRun = false;
              reversedJson.forEach((e) => {
                if (!ifItIsThenDoNotRun) {
                  if (e === "[") {
                    isUnderArray = false;
                    times++;
                    if (times >= 3) {
                      ifItIsThenDoNotRun = true;
                    }
                  }
                  if (isUnderArray) outputS += e;
                  if (e === "]") {
                    isUnderArray = true;
                  }
                }
              });
              let finalOutput = Array.from(outputS)
                .reverse()
                .join("")
                .slice(0, outputS.length - 11);
              console.log(finalOutput);
              //finally resolve the promise to return the message to our server
              resolve({
                message: finalOutput,
              });
            })
            .catch((err) => console.log(err));
        });
      },
      {
        auth_token,
        conversation_id,
        current_message_id,
        parent_message_id,
        message: req.body.message,
      }
    );
    //return the message
    return res.status(200).json({
      code: 200,
      message: fetchMessage.message,
      conversation_id: conversation_id,
    });
  }
});
