# hydra+

![GitHub package.json version](https://img.shields.io/github/package-json/v/dahegyi/hydra-plus)

hydra+ is a double-screen visual editing environment based on the [hydra synth](https://github.com/hydra-synth/hydra-synth), designed for ease of use and to project live visuals without revealing any code.

_The application is tested only on Chrome and Arc, so it may not work properly on other browsers._

If you have any questions, suggestions, or just want to report a bug, please use the **Issues** / **Discussions** tabs on [Github](https://github.com/dahegyi/hydra-plus).

## Available keyboard shortcuts:

- update: `Enter`
- copy: `Ctrl/Cmd + C`
- cut: `Ctrl/Cmd + X`
- paste: `Ctrl/Cmd + V`
- undo: `Ctrl/Cmd + Z`
- redo: `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z`
- toggle full-screen: `Escape`

## Known issues:

- initScreen doesn't work properly in visualizer
- initScreen doesn't initialize working after refreshing the page

## Local development

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
