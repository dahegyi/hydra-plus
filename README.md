# hydra+

hydra+ is a double-screen visual editing environment for [hydra synth](https://github.com/hydra-synth/hydra-synth), designed for ease of use and to project live visuals without revealing any code.

### 👉 [Live demo available here](https://hydra-plus.web.app)

**For now, the project is only tested on Chrome on desktop.**

If you have any questions, suggestions, or just want to report a bug, please use the **Issues** / **Discussions** tabs here on Github.

---

### usable key combos:

- hide/show GUI: `Escape`
- undo: `Ctrl/Cmd + Z`
- redo: `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z`

### known issues:

- initSreen() doesn't work properly in visualizer

### planned features:

- audio settings modal
- transition on updates
- hover info boxes for sources & effects
- UI for arrays
- MIDI integration
- import / export configs
- built-in extra shaders + option to add new ones from the GUI
- [1.0] customizable colors for GUI
- [1.0] implementation of backend server where files and configs can be saved

---

The project uses Vue 3 with Vuex and Vite. Commands to run and build the program are left the way they are by default (`npm i`, `npm run dev`, `npm run build`).
