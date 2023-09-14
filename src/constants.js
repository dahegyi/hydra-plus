export const INITIAL_BLOCKS =
  '[{"name":"osc","params":[{"name":"frequency","value":"15"},{"name":"sync","value":0.1},{"name":"offset","value":0}],"type":"source","blocks":[{"name":"blend","blocks":[{"name":"gradient","params":[{"name":"speed","value":"0.1"}],"type":"source","blocks":[{"name":"scrollX","params":[{"name":"scrollX","value":"0"},{"name":"speed","value":"0.1"}],"type":"simple"}],"position":{"x":20,"y":60}}],"params":[{"name":"amount","value":"3"}],"type":"complex"},{"name":"modulateRotate","blocks":[{"name":"noise","params":[{"name":"scale","value":"1"},{"name":"offset","value":"0.01"}],"type":"source","blocks":[{"name":"contrast","params":[{"name":"amount","value":"30"}],"type":"simple"}],"position":{"x":20,"y":60}}],"params":[{"name":"multiple","value":"1,5"},{"name":"offset","value":"0"}],"type":"complex"}],"position":{"x":20,"y":60}}]';

export const DEFAULT_POSITION = { x: 20, y: 60 };

export const TYPE_SRC = "source";
export const TYPE_EXTERNAL = "external";
export const TYPE_THREE = "three";
export const TYPE_SIMPLE = "simple";
export const TYPE_COMPLEX = "complex";

export const SOURCE_FUNCTIONS = [
  {
    name: "noise",
    params: [
      {
        name: "scale",
        value: 10,
      },
      {
        name: "offset",
        value: 0.1,
      },
    ],
  },
  {
    name: "voronoi",
    params: [
      {
        name: "scale",
        value: 5,
      },
      {
        name: "speed",
        value: 0.3,
      },
      {
        name: "blending",
        value: 0.3,
      },
    ],
  },
  {
    name: "osc",
    params: [
      {
        name: "frequency",
        value: 60,
      },
      {
        name: "sync",
        value: 0.1,
      },
      {
        name: "offset",
        value: 0,
      },
    ],
  },
  {
    name: "shape",
    params: [
      {
        name: "sides",
        value: 3,
      },
      {
        name: "radius",
        value: 0.3,
      },
      {
        name: "smoothing",
        value: 0.01,
      },
    ],
  },
  {
    name: "gradient",
    params: [
      {
        name: "speed",
        value: 1,
      },
    ],
  },
  {
    name: "src",
    params: [
      {
        name: "tex",
        value: "o0",
      },
    ],
  },
  {
    name: "solid",
    params: [
      {
        name: "r",
        value: "[1, 0, 0]",
      },
      {
        name: "g",
        value: "[0, 1, 0]",
      },
      {
        name: "b",
        value: "[0, 0, 1]",
      },
      {
        name: "a",
        value: 1,
      },
    ],
  },
];

export const EXTERNAL_SOURCE_FUNCTIONS = [
  {
    name: "initCam",
    params: [
      {
        name: "index",
        value: 0,
      },
    ],
  },
  {
    name: "initImage",
    params: [
      {
        name: "url",
        value:
          "https://upload.wikimedia.org/wikipedia/commons/2/25/Hydra-Foto.jpg",
      },
    ],
  },
  {
    name: "initVideo",
    params: [
      {
        name: "url",
        value: "https://media.giphy.com/media/AS9LIFttYzkc0/giphy.mp4",
      },
    ],
  },
  // {
  //   name: "init",
  //
  // },
  {
    name: "initScreen",
  },
];

export const THREE_FUNCTIONS = [
  {
    name: "3D",
    params: [
      {
        name: "scene",
        value: 0,
      },
    ],
  },
];

export const GEOMETRY_FUNCTIONS = [
  {
    name: "rotate",
    params: [
      {
        name: "angle",
        value: 10,
      },
      {
        name: "speed",
        value: 1,
      },
    ],
  },
  {
    name: "scale",
    params: [
      {
        name: "amount",
        value: 1.5,
      },
      {
        name: "xMult",
        value: 1,
      },
      {
        name: "yMult",
        value: 1,
      },
      {
        name: "offsetX",
        value: 0.5,
      },
      {
        name: "offsetY",
        value: 0.5,
      },
    ],
  },
  {
    name: "pixelate",
    params: [
      {
        name: "pixelX",
        value: 20,
      },
      {
        name: "pixelY",
        value: 20,
      },
    ],
  },
  {
    name: "repeat",
    params: [
      {
        name: "repeatX",
        value: 3,
      },
      {
        name: "repeatY",
        value: 3,
      },
      {
        name: "offsetX",
        value: 0.5,
      },
      {
        name: "offsetY",
        value: 0,
      },
    ],
  },
  {
    name: "repeatX",
    params: [
      {
        name: "reps",
        value: 3,
      },
      {
        name: "offset",
        value: 0.5,
      },
    ],
  },
  {
    name: "repeatY",
    params: [
      {
        name: "reps",
        value: 3,
      },
      {
        name: "offset",
        value: 0.5,
      },
    ],
  },
  {
    name: "kaleid",
    params: [
      {
        name: "nSides",
        value: 4,
      },
    ],
  },
  {
    name: "scroll",
    params: [
      {
        name: "scrollX",
        value: 0.5,
      },
      {
        name: "scrollY",
        value: 0.5,
      },
      {
        name: "speedX",
        value: 0.5,
      },
      {
        name: "speedY",
        value: 0,
      },
    ],
  },
  {
    name: "scrollX",
    params: [
      {
        name: "scrollX",
        value: 0.5,
      },
      {
        name: "speed",
        value: 0.5,
      },
    ],
  },
  {
    name: "scrollY",
    params: [
      {
        name: "scrollY",
        value: 0.5,
      },
      {
        name: "speed",
        value: 0.5,
      },
    ],
  },
];

export const COLOR_FUNCTIONS = [
  {
    name: "posterize",
    params: [
      {
        name: "bins",
        value: 3,
      },
      {
        name: "gamma",
        value: 0.6,
      },
    ],
  },
  {
    name: "shift",
    params: [
      {
        name: "r",
        value: 0.5,
      },
      {
        name: "g",
        value: 0,
      },
      {
        name: "b",
        value: 0,
      },
      {
        name: "a",
        value: 1,
      },
    ],
  },
  {
    name: "invert",
    params: [
      {
        name: "amount",
        value: 1,
      },
    ],
  },
  {
    name: "contrast",
    params: [
      {
        name: "amount",
        value: 1.6,
      },
    ],
  },
  {
    name: "brightness",
    params: [
      {
        name: "amount",
        value: 0.4,
      },
    ],
  },
  {
    name: "luma",
    params: [
      {
        name: "threshold",
        value: 0.5,
      },
      {
        name: "tolerance",
        value: 0.1,
      },
    ],
  },
  {
    name: "thresh",
    params: [
      {
        name: "threshold",
        value: 0.5,
      },
      {
        name: "tolerance",
        value: 0.04,
      },
    ],
  },
  {
    name: "color",
    params: [
      {
        name: "r",
        value: 1,
      },
      {
        name: "g",
        value: 0,
      },
      {
        name: "b",
        value: 1,
      },
      {
        name: "a",
        value: 1,
      },
    ],
  },
  {
    name: "saturate",
    params: [
      {
        name: "amount",
        value: 2,
      },
    ],
  },
  {
    name: "hue",
    params: [
      {
        name: "hue",
        value: 0.4,
      },
    ],
  },
  {
    name: "colorama",
    params: [
      {
        name: "amount",
        value: 0.005,
      },
    ],
  },
  {
    name: "r",
    params: [
      {
        name: "scale",
        value: 1,
      },
      {
        name: "offset",
        value: 0,
      },
    ],
  },
  {
    name: "g",
    params: [
      {
        name: "scale",
        value: 1,
      },
      {
        name: "offset",
        value: 0,
      },
    ],
  },
  {
    name: "b",
    params: [
      {
        name: "scale",
        value: 1,
      },
      {
        name: "offset",
        value: 0,
      },
    ],
  },
];

export const MODULATE_FUNCTIONS = [
  {
    name: "modulateRepeat",
    blocks: [],
    params: GEOMETRY_FUNCTIONS[3].params,
  },
  {
    name: "modulateRepeatX",
    blocks: [],
    params: GEOMETRY_FUNCTIONS[4].params,
  },
  {
    name: "modulateRepeatY",
    blocks: [],
    params: GEOMETRY_FUNCTIONS[5].params,
  },
  {
    name: "modulateKaleid",
    blocks: [],
    params: GEOMETRY_FUNCTIONS[6].params,
  },
  {
    name: "modulateScrollX",
    blocks: [],
    params: GEOMETRY_FUNCTIONS[7].params,
  },
  {
    name: "modulateScrollY",
    blocks: [],
    params: GEOMETRY_FUNCTIONS[8].params,
  },
  {
    name: "modulate",
    blocks: [],
    params: [
      {
        name: "amount",
        value: 0.1,
      },
    ],
  },
  {
    name: "modulateScale",
    blocks: [],
    params: [
      {
        name: "multiple",
        value: 1,
      },
      {
        name: "offset",
        value: 1,
      },
    ],
  },
  {
    name: "modulatePixelate",
    blocks: [],
    params: [
      {
        name: "multiple",
        value: 10,
      },
      {
        name: "offset",
        value: 3,
      },
    ],
  },
  {
    name: "modulateRotate",
    blocks: [],
    params: [
      {
        name: "multiple",
        value: 1,
      },
      {
        name: "offset",
        value: 0,
      },
    ],
  },
  {
    name: "modulateHue",
    blocks: [],
    params: [
      {
        name: "amount",
        value: 1,
      },
    ],
  },
];

export const BLEND_FUNCTIONS = [
  {
    name: "add",
    blocks: [],
    params: [
      {
        name: "amount",
        value: 1,
      },
    ],
  },
  {
    name: "sub",
    blocks: [],
    params: [
      {
        name: "amount",
        value: 1,
      },
    ],
  },
  {
    name: "layer",
    blocks: [],
  },
  {
    name: "blend",
    blocks: [],
    params: [
      {
        name: "amount",
        value: 0.5,
      },
    ],
  },
  {
    name: "mult",
    blocks: [],
    params: [
      {
        name: "amount",
        value: 1,
      },
    ],
  },
  {
    name: "diff",
    blocks: [],
  },
  {
    name: "mask",
    blocks: [],
  },
];

