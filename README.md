# hydra+

![GitHub package.json version](https://img.shields.io/github/package-json/v/dahegyi/hydra-plus)
[![Deploy to Firebase Hosting](https://github.com/dahegyi/hydra-plus/actions/workflows/firebase-deploy.yml/badge.svg)](https://github.com/dahegyi/hydra-plus/actions/workflows/firebase-deploy.yml)

hydra+ is a double-screen visual editing environment for [hydra synth](https://github.com/hydra-synth/hydra-synth), designed for ease of use and to project live visuals without revealing any code.

👉 **[Live demo available here](https://hydra-plus.web.app)**

**For now, the project is only tested on Chrome Desktop.**

If you have any questions, suggestions, or just want to report a bug, please use the **Issues** / **Discussions** tabs on Github.

## Usable key combos:

- update: `Enter` - _works only when focused in a text input_
- undo: `Ctrl/Cmd + Z`
- redo: `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z`
- toggle UI: `Escape`

## Known issues:

- initSreen() doesn't work properly in visualizer

## Planned features:

- UI for arrays
- hover info boxes for sources & effects
- transition on updates
- audio settings modal
- BPM tapper
- support for 3D scenes
- MIDI integration
- built-in extra shaders + option to add new ones from the GUI
- [1.0] import / export configs
- [1.0] customizable colors for GUI
- [1.0] backend server where files and configs can be saved

---

## Installation & Usage

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### Installation

1. Clone the repository: `git clone git@github.com:dahegyi/hydra-plus.git`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### Usage

- `npm run dev` - Runs the development server
- `npm run build` - Builds the production version
- `npm run preview` - Serves the production version locally
- `npm run prepare` - Installs the Git hooks (runs automatically on `npm install`)
- `npm run lint` - Runs ESLint and Stylelint
- `npm run lint:fix` - Runs ESLint and Stylelint and fixes the errors

## Deployment

The application is deployed automatically to Firebase Hosting on every push to the `main` branch.

### Deployment without Github Actions:

1. Build the production version: `npm run build`
2. Deploy the `dist` folder to Firebase Hosting: `firebase deploy`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
