```
space-invaders/
├── public/
│   └── models/                 # Publicly accessible models
│   └── images/                 # Static assets (textures, models, etc.)
├── src/
│   ├── main.ts                 # App entry point
│   ├── App.ts                  # Main app logic (scene setup)
│   ├── components/             # Reusable pieces like Camera, Controls, Lighting
│   │   ├── Camera.ts
│   │   ├── Renderer.ts
│   │   └── Controller.ts
│   ├── scenes/                 # Scene definitions
│   │   └── MainScene.ts
│   ├── objects/                # Custom meshes or grouped objects
│   │   ├── SpaceShips.ts
│   │   └── Cube.ts
│   ├── utils/                  # Helpers and loaders
│   │   ├── loaders.ts
│   │   └── math.ts
│   └── styles/                 # CSS/SCSS files
│       └── main.css
├── index.html                  # Entry HTML file
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── package.json                # Project metadata and scripts
└── README.md                   # Project overview
```