# Messenger App 💬

Welcome to the Messenger App, a real-time chat application built with Nest.js! This project features JWT authentication using access and refresh tokens, caching with Redis, and WebSocket connections via Socket.io.

### The project is currently under development and not all features are available

## Features

- User registration and login with JWT authentication and Google OAuth
- Access and refresh token management for secure authentication
- Real-time messaging using WebSockets (Socket.io)
- Caching for improved performance (Redis)

## Installation

1. Clone the repository:

```
git clone https://github.com/SergeyBogomolovv/messenger.git
```

2. Navigate to the project directory:

```
cd messenger
```

3. Install the dependencies:

```
npm install
```

4. Set up environment variables:
   Create a `.env` file in the root directory and add the required variables:

```
  DATABASE_URL
  REDIS_HOST
  REDIS_PORT
  PORT
  CLIENT_URL
  SERVER_URL
  MAIL_TRANSPORT
  MAIL_HOST
  MAIL_USER
  MAIL_PASS
  YANDEX_ACCES
  YANDEX_SECRET
  YANDEX_BUCKET
  JWT_EXP
  JWT_SECRET
  EMAIL_VERIFY_REDIRECT_URL
  GOOGLE_CLIENT
  GOOGLE_SECRET
  GOOGLE_CALLBACK
  GOOGLE_LOGIN_REDIRECT
```

5. Start the application:

```
npm run start:dev
```

## Usage

After starting the server, you can use the Messenger App by accessing the API endpoints or using a suitable client application. Documentation for the API endpoints can be found in the [API Documentation](#api/docs) section.

## Technologies

- Nest.js: A progressive Node.js framework for building efficient, scalable, and enterprise-grade server-side applications.
- JWT: JSON Web Tokens for secure user authentication and authorization.
- Redis: An in-memory data structure store used for caching to improve performance.
- Socket.io: A real-time communication library for implementing WebSocket connections.
