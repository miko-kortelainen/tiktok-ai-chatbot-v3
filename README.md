# TikTok AI Chatbot V3

<img align="center" src="header.png" alt="Header Image" width="600" />

A React application that integrates with TikTok live sessions, allowing viewers to interact with an AI chatbot during the live stream. The chatbot responds to comments using OpenAI's ChatGPT and Text-to-Speech API.

## Features

- Real-time interaction with an AI chatbot during a TikTok live session.
- Text-to-Speech capability for audible responses.
- Comment queue system that allows deleting of queued comments. (route: `/moderation`)

## Usage with Docker

#### Development (hot-reloading)
```bash
docker compose -f docker-compose.dev.yml up --build
```  
This starts both the front- and backend with hot-reloading, so any changes to code triggers a reload. 

#### Production (not yet implemented)
```bash
docker compose -f docker-compose.yml up --build
```
This builds both ends and makes the backend serve the static files of the frontend build.

## Configuration
1. Rename `.env.template` to `.env` in the `/server` directory.
2. Set up the required environment variables in the `.env` file.  

* `OPENROUTER_API_KEY` - your API key from openRouter
* `TIKTOK_SESSION_ID` - your TikTok account session token
* `TIKTOK_TARGET_IDC` - your TikTok account datacenter region  

For more info on where to find the TikTok cookies, see the [tiktok-live-connector documentation](https://github.com/zerodytrash/TikTok-Live-Connector#authenticated-connection).


