
# USE-CHATGPT-API-FOR-0$


Using web scraping techniques and harnessing the full power of HTTP, this method is well-suited because it can remember prior interactions. You can incorporate this feature into your project to utilize ChatGPT without incurring any costs for API calls. Here's how the app's API operates:

To get started, you'll need OpenAI email and password credentials.

Begin by making an API call with your login details and the message you want to send.
The application will open a browser within a Puppeteer environment and configure your account for a Bearer Token.
Once the signup process is successful, it will make subsequent API calls when you send messages to ChatGPT. These calls should include your Bearer Token, conversation ID, message ID, and parent ID.
You won't encounter any CORS errors because you're making direct API calls from the same origin.
You'll receive a response containing ChatGPT's reply and a URL like "chat.openai.com/c/{your_conversation_id)" so you can view your messages directly in your own browser.
The response time varies depending on OpenAI's server load. It typically takes less than 2 seconds for short answers and 3-4 seconds for longer responses.
You can effortlessly integrate this solution into your own project, enabling you to use ChatGPT for free and without limitations. Only about 200 lines of code are required to implement this, making it a straightforward and efficient solution.
## Run Locally

Clone the project

```bash
  git clone https://github.com/arbind-mahato/chatgpt-infinite.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```


## Features

- Remember Previous Chats
- Completely Free
- No Limitations
- Utilizes HTTP Method (Different from Classical Web Scraping)

## Request Body

| Key             | Value                                                                |
| ----------------- | ------------------------------------------------------------------ |
| message* | The text you wish to send to ChatGPT.|
| email* | openai account email |
| Password* | openai account password |
| chatgpt-version| coming soon|


## Support

For support: https://www.buymeacoffee.com/mynameisarbind

