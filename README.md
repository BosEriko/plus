# BosEriko+

## Create the Environment variables
Copy the example to its own local file and update the variables.
```sh
cp .env.example .env.local
cp functions/.runtimeconfig.json.example functions/.runtimeconfig.json
```

## Install Firebase Tools
The project uses Firebase so install Firebase Tools on your local machine.
```sh
npm install -g firebase-tools
firebase login
```

## Set the Firebase Function Environment variables
Run the commands below to set them.
```sh
# https://discord.com/developers/applications
firebase functions:config:set discord.client_id="YOUR_DISCORD_CLIENT_ID"
firebase functions:config:set discord.client_secret="YOUR_DISCORD_CLIENT_SECRET"
firebase functions:config:set discord.redirect_uri="https://<region>-<project>.cloudfunctions.net/discordCallback"
# https://dev.twitch.tv/console/apps
firebase functions:config:set twitch.client_id="YOUR_TWITCH_CLIENT_ID"
firebase functions:config:set twitch.client_secret="YOUR_TWITCH_CLIENT_SECRET"
firebase functions:config:set twitch.redirect_uri="https://<region>-<project>.cloudfunctions.net/twitchCallback"
```

You can run the following command to check your config
```sh
firebase functions:config:get
```

## Deploy Firebase Functions
To deploy your Firebase functions you can run the following command.
```sh
firebase deploy --only functions
```

## Start Firebase Emulator
To start your Firebase Emulator you can run the following command.
```sh
firebase emulators:start --only functions
```