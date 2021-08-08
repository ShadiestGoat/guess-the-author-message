# Guess Who Sent That Message

A discord bot, which acts as a game. You can guess the author of a message :D
## Preparation

## Set Up

`git clone https://thisrepo.auiosjkmsajio dkask l,msdaodkls,a`
`cd guessthemessage`
`npm i`
`npm run build`

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
|  DW_TOKEN  | Your user token. This will be used to download messages, since discord no longer allows for bots to do that. It is only used in this script. |   \<none\>    |  :tick:  |
| DW_CHANNEL |                                                     Channel ID you want to download from                                                     |   \<none\>    |  :tick:  |
|  MSG_DATA  |                                         The name of the file that the messages will be downloaded to                                         |   msgs.json   |   :X:    |
|  DW_CONF   |                               The name/location of the file that has the config mentioned in the next section                                | dwConfig.json |   :X:    |

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

### Running

To run the download process it is pretty simple:

`npm run dw`

Once this is run, it should clear your console, and start displaying a pie chart of all the messages being downloaded. After 

##  Bot

This section is dedicated to the actual bot part of this project. The setup of this is quite easy

### ENV

Same as before, this can be used with .env file or command line

|     Variable     |                                                               Explanation                                                                |    Default    | Required |
|:----------------:|:----------------------------------------------------------------------------------------------------------------------------------------:|:-------------:|:--------:|
| COMMANDS_UPDATED | Weather or not the interaction commands have been updated. Recommended for use in cl only! It is important to run this on the first run! |     false     |   :X:    |
|    USER_DATA     |                                                    The location of the user data file                                                    | userData.json |   :X:    |
|  QUESTION_DATA   |                                                  The location of the question data file                                                  |  qData.json   |   :X:    |
|     MSG_DATA     |                       The location of the downloaded message data. It can be carried over from the download script                       |   msgs.json   |   :X:    |
|    DUEL_DATA     |                                                      The location of the duel data                                                       |  duels.json   |   :X:    |
|    PARENT_ID     |                    The ID of the parent channel (category) that the bot will work in. Also the location of the duels                     |   \<none\>    |  :tick:  |
|      TOKEN       |                                                         The token of the **bot**                                                         |   \<none\>    |  :tick:  |