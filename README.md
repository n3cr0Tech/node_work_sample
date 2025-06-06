## About
- This project is a realtime game event and player tracking Node Server
- It has the following features:
    - Register, Login auth (grants JWT tokens)
    - RabbitMQ handler for communicating with slot, mobile, and leaderboard clients
- Example scenario:
    - Player wins first 500 points of the day on a slot client, they are awarded a trophy on their mobile app
    - Player has the highest score of the current date, the leaderboard client subscribed to a RabbitMQ queue gets hit with a new message and updates the displayed rankings


## Project Components
- RabbitMQ message broker
- MongoDB

### Setting up the project:
- Make sure you created a '.env' file with the following entries:
    - MONGODB_URL = url-from-mongo-web-portal-to-connect-to-the-corresponding-db
    - AUTH_TOKEN_HEADER_NAME = string-that-you-want-the-server-to-refer-to-when-reading-an-auth-token-from-requests
    - DB_NAME = name-of-your-db
    - TOKEN_SECRET = some-random-string-kinda-like-a-password-for-generating-your-auth-token    
    - PORT_NUM = port-number-for-server
    - DEFAULT_PASSWORD = default-pwd-to-be-used-when-registering-user

    - RABBITMQ_USER = username-on-rabbitmq-broker
    - RABBITMQ_PWD = password-for-username
    - RABBITMQ_URL = localhost-or-ip-address-of-rabbitmq-broker
    - RABBITMQ_VHOST = vhost-name-on-rabbitmq-broker
    - RABBITMQ_QNAME = queue-name-for-server-to-consume-from
    - RABBITMQ_CLIENT_QPREFIX = queue-prefix-for-each-client-queue-for-consume-from
    
    - TEST_AUTH_TOKEN = token-used-by-jest-to-test-verification-module

    - SERVER_ENABLED = 1


## Types of Clients:
- Mobile
- EGM
- Leaderboard

## Run unit tests
- npm run test

## Run project
- npm run build
- npm start