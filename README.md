# Chatterbox - Realtime Chat App

What can this app do:

 1. Sign up with phone number
 2. Send friend requests
 3. Chat in real time with your friends
 4. Create group chats
 5. Send images, files and voice messages
 6. Voice and video call

# Cloning and setting up

 1.  `git clone https://github.com/Coral-Reefs/chatterbox.git`
 2. go to client folder `cd client`
 3. install client packages `npm i`
 4. go to server folder `cd ../server`
 5. install server packages `npm i`

## Setting up client:

**server .env**
create an .env file in `/server`

| Variable name         | content                         |
|----------------|--------------------------------|
|`DB_URL`|Sign up at cloud.mongodb.com, create a cluster and get the database url|
|`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`|Sign up at clerk.com, create an app with phone number verification and get this at the "API Keys" section on the sidebar|
|`CLERK_SECRET_KEY`|**same as above*|
|`CLERK_JWT_KEY`|Click on `Show JWT Key` in the API Keys page and copy the `PEM Public Key`|
|`ORIGIN`|Your client URL e.g. `http://localhost:3000`|
|`ZEGO_APP_ID`|Sign up at zegocloud.com, create an a project and copy the `AppID` on the dashboard |
|`ZEGO_SERVER_ID`| Copy the `ServerSecret` on the dashboard|


**client .env**
create an .env.local file in `/client`
| Variable name         | content                         |
|----------------|--------------------------------|
|`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`|*same as server*|
|`CLERK_SECRET_KEY`|*same as server*|
|`NEXT_PUBLIC_SERVER_URL`|The URL your server is running on `http://localhost:5000`|
|`NEXT_PUBLIC_ZEGO_APP_ID`| *same as server* |
|`NEXT_PUBLIC_ZEGO_SERVER_ID`| *same as server* |


## Clerk webhooks

## Starting the server
Client: `npm run dev`
Server: `node index`

Happy coding!
