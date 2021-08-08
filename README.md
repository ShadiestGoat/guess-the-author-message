# Guess Who Sent That Message

A discord bot, which acts as a game. You can guess the author of a message :D

## Prerequisites

Before starting, you need the following:

1. A discord account, and a token to it \([before asking how to get it](https://www.just-fucking-google.it/?s=how%20to%20get%20discord%20user%20token&e=fingerxyz)\)

2. A discord bot token

3. A discord server that has the following properties:

| Property | Type |
|:--:|:--:|
| The downloaded channel has over 10 authors | Recommendation |
| The downloaded channel has over 1500 messages | Recommendation |
| You must have permission to read message history of the downloaded channel | Needed |
| The bot must have permission to read & send messages in the CATEGORY that will be specified with the PARENT_ID | Needed |

4. The permission of the other members of the server to play this game. 
    1. If some do not give permission, please add their user id to the REMOVE section of the download config.

## Set Up

1. `git clone https://thisrepo.auiosjkmsajio dkask l,msdaodkls,a`

2. `cd guessthemessage`

3. `npm i`

4. `npm run build`

Then you will need to download and parse messages to guess. 


## Downloader

|                                  :warning: WARNING                                   |
|:------------------------------------------------------------------------------------:|
| Using this script may cause your discord account to be banned, use at your own risk! | 

This script is for downloading messages from a channel, its part of preparing for this bot to work!

This needs a couple of env variables

### ENV

|  Variable  |                                                                 Explanation                                                                  |    Default    | Required |
|:----------:|:--------------------------------------------------------------------------------------------------------------------------------------------:|:-------------:|:--------:|
|  DW_TOKEN  | Your user token. This will be used to download messages, since discord no longer allows for bots to do that. It is only used in this script. |   \<none\>    |  :heavy_check_mark:  |
| DW_CHANNEL |                                                     Channel ID you want to download from                                                     |   \<none\>    |  :heavy_check_mark:  |
|  MSG_DATA  |                                         The name of the file that the messages will be downloaded to                                         |   msgs.json   |   :x:    |
|  DW_CONF   |                               The name/location of the file that has the config mentioned in the next section                                | dwConfig.json |   :x:    |

These variables can either be set through a .env file or as command variables:

.env file (recommended):

```
DW_TOKEN = mfa.*******(your USER token)******
DW_CHANNEL= 123456789123456789
...
```

command: `DW_TOKEN=mfa.********(your USER token)******** npm run dw`

### Config

The config file is mentioned in the env section.

| Property Name |                                                  Explanation                                                  |           Type           |
|:-------------:|:-------------------------------------------------------------------------------------------------------------:|:------------------------:|
|    REMOVE     |                               The IDs authors who's messages should be ignored                                |       String Array       |
|     ALIAS     | Alias the authors IDs. If an author id is in the keys of the object, the value of that key will be the new id | Object `old id`:`new id` |

Note, the script does not auto-ignore bots, or old users (who have left), so there may be automated messages and broken mentions. Please do not manually remove messages/authors from the downloaded file, please re-download the messages with added ids to the REMOVE/ALIAS sections. 

### Running

To run the download process it is pretty simple:

`npm run dw`

Once this is run, it should clear your console, and start displaying a pie chart of all the messages being downloaded. After 

##  Bot

This section is dedicated to the actual bot part of this project. The setup of this is quite easy

### ENV

Same as before, this can be used with .env file or command line

|     Variable     |                                                               Explanation                                                                |    Default    |      Required      |
|:----------------:|:----------------------------------------------------------------------------------------------------------------------------------------:|:-------------:|:------------------:|
| COMMANDS_UPDATED | Weather or not the interaction commands have been updated. Recommended for use in cl only! It is important to run this on the first run! |     false     |        :x:         |
|    USER_DATA     |                                                    The location of the user data file                                                    | userData.json |        :x:         |
|  QUESTION_DATA   |                                                  The location of the question data file                                                  |  qData.json   |        :x:         |
|     MSG_DATA     |                       The location of the downloaded message data. It can be carried over from the download script                       |   msgs.json   |        :x:         |
|    DUEL_DATA     |                                                      The location of the duel data                                                       |  duels.json   |        :x:         |
|    PARENT_ID     |                    The ID of the parent channel (category) that the bot will work in. Also the location of the duels                     |   \<none\>    | :heavy_check_mark: |
|      TOKEN       |                                                         The token of the **bot**                                                         |   \<none\>    | :heavy_check_mark: |

### Running

Once the env has been set up, all you do is just run it:

`npm run start`

## Roadmap/TODO

- [ ] make the strings more configurable! Eg. error messages, correct/wrong messages, etc