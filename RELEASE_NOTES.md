## 2.6.1
- Reverted leaderboard 4k fix to try different solution

## 2.6.0
- Merged in leaderboard fixes for 4K
- various fixes for bugs found during testing

## 2.5.0
- Merged in Sahil's latest PR
- Fixed bug where leaderboard data was incomplete
- Fixed a bug where the gameName was not being set correctly due to old code being reintroduced
- Merged in the latest changes from connex-leaderboard

## 2.4.0
- Fixed bug where a type mismatch in fetching data in the server would result in not finding the player record
- Create a new api for connex-app to user login due to the design change of using QR codes for all logins
- Set connex app to use new login api /login-app
- Fixed a bug in connex app where apiUrl was getting inserted twice into the POST action
- Fixed a bug in connex app where the wrong art was being used for LkyPlyr leader3Place
- Added new field curDay to /spinEvents api response to allow for easier testing and control of the G2E Day Badges
- Set analytics to false in connex app so cli would stop asking

## 2.3.0
- Fixed issues where bad data could be introduced into the db by the scanner
- Added safeguards to ensure db values are good and can be generated as needed
- Fixed issues with scanner validation
- Merged in Sahil's latest PR

## 2.2.0
- Fixed issues related to AWS deployment
- Fixed bugs related to scanner sending and registering users
- Fixed bug where a spin from an EGM where there was no player logged in would cause a crash
- Fixed several bugs where it was possible to get bad data and crash
- Merged in Sahil's latest PR
- Reverted some code that was compensating for info not being sent by the game as it's now being sent by the game
- Added a new env variable that must be defined in order for the server to work SERVER_ENABLED, 1 for enabled, 0 for disabled

.
.
.
.

## 0.0.1
- API Server runs properly
- User is now able to create a new account via 'register' route
- User can login and retrieve a JWT token
- User can use JWT token to access restricted content