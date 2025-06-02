# Rocket Game
This is a simple rocket game where you control a rocket to avoid obstacles. The game is built using Three.js following, more or less, the tutorial from [Log Rocket](https://blog.logrocket.com/creating-game-three-js/).

## Install Dependencies
Make sure you have Node.js installed, then run:
``` bash
npm install
```

## How to run the game
This will run the game in development mode, reloading on changes.
``` bash
npm run dev
```

## How to build the game
This will build the game for production, optimizing the assets and code.
``` bash
npm run build
```

Then you can serve the `dist` folder using a static server, for example:
``` bash
cd dist
python -m http.server
```