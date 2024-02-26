<div align="center">

# Festify
[Getting started](#getting-started) •
[Screenshots](#screenshots) •
[Technical](#technical-information) 

Festify is a festival companion react app that allows users to view and save playlists which are generated based on each days festival events.

</div>

## Note
This is an rebuild/updgrade of a project started in my Web Dev bootcamp. That version can be viewed [here](https://github.com/yobazy/festify). Festify 2.0 has been rewritten and redesigned since that version.

## Getting Started
### Setup
Install dependencies with `npm install`

Create .env file in root folder, input information in such as how was done in .env example.

### Database Scripts
#### Required:
Run `npm run build-db` in client folder. This script will do the initial build of the database.

#### Maintenance:
Run `npm run update-db` in client folder. This script will update the database.
Run `npm run clear-db` in client folder. This script will clear the contents of the database.

### Running the App 
Run `npm start` in src folder.

### URLs
The app can be viewed at the following URL once setup:
http://localhost:3000/

## Screenshots
Home page:
![Home page](https://github.com/yobazy/festify-2.0/blob/master/screenshots/home.png?raw=true)

Events page:
![Events page](https://github.com/youthbazzy/festify-2.0/blob/master/screenshots/events.png?raw=true)

Event page:
![Event page 1](https://github.com/youthbazzy/festify-2.0/blob/master/screenshots/event-1.PNG?raw=true) 
![Event page 2](https://github.com/youthbazzy/festify-2.0/blob/master/screenshots/event-2.PNG?raw=true) 
![Event page 3](https://github.com/youthbazzy/festify-2.0/blob/master/screenshots/event-3.PNG?raw=true) 


## Technical Information
### Tech Stack 
- React
- Supabase 
- Tailwind CSS

<!-- ### Dependencies
To be added. 

### Dev Dependencies 
To be added.

-->
