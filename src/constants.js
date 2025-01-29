export const WELCOME_MODAL_LAST_UPDATE = "0.8.0";

export const DEFAULT_POSITION = { x: 15, y: 65 };

export const INITIAL_BLOCKS = [
  {
    name: "osc",
    params: [10, 0.001, 2],
    type: "source",
    blocks: [
      {
        name: "posterize",
        params: [1, 0.00001],
        type: "simple",
      },
      {
        name: "modulateRotate",
        blocks: [
          {
            name: "osc",
            params: [8, 0.015, 0],
            type: "source",
            blocks: [
              {
                name: "mask",
                blocks: [
                  {
                    name: "shape",
                    params: [-2, 0.4, 0],
                    type: "source",
                    blocks: [],
                  },
                ],
                type: "complex",
              },
            ],
          },
        ],
        params: [8, 0],
        type: "complex",
      },
      {
        name: "colorama",
        params: [0.05],
        type: "simple",
      },
    ],
    position: DEFAULT_POSITION,
  },
];

export const MAX_NUMBER_OF_SOURCES = 8;
export const MAX_NUMBER_OF_EXTERNALS = 8;

export const TYPE_SRC = "source";
export const TYPE_EXTERNAL = "external";
export const TYPE_THREE = "three";
export const TYPE_SIMPLE = "simple";
export const TYPE_COMPLEX = "complex";

export const PARAM_MAPPINGS = {
  /* Sources */
  noise: ["scale", "offset"],
  voronoi: ["scale", "speed", "blending"],
  osc: ["frequency", "sync", "offset"],
  shape: ["sides", "radius", "smoothing"],
  gradient: ["speed"],
  src: ["tex"],
  solid: ["r", "g", "b", "a"],
  /* External */
  initCam: ["index"],
  initImage: ["url"],
  initVideo: ["url"],
  initScreen: [],
  "3D": ["scene"],
  /* Geometry */
  repeat: ["repeatX", "repeatY", "offsetX", "offsetY"],
  repeatX: ["reps", "offset"],
  repeatY: ["reps", "offset"],
  scroll: ["scrollX", "scrollY", "speedX", "speedY"],
  scrollX: ["scrollX", "speed"],
  scrollY: ["scrollY", "speed"],
  rotate: ["angle", "speed"],
  scale: ["amount", "xMult", "yMult", "offsetX", "offsetY"],
  pixelate: ["pixelX", "pixelY"],
  kaleid: ["nSides"],
  /* Color */
  r: ["scale", "offset"],
  g: ["scale", "offset"],
  b: ["scale", "offset"],
  color: ["r", "g", "b", "a"],
  saturate: ["amount"],
  hue: ["hue"],
  posterize: ["bins", "gamma"],
  shift: ["r", "g", "b", "a"],
  invert: ["amount"],
  contrast: ["amount"],
  brightness: ["amount"],
  luma: ["threshold", "tolerance"],
  thresh: ["threshold", "tolerance"],
  colorama: ["amount"],
  /* Modulate */
  modulateRepeat: ["repeatX", "repeatY", "offsetX", "offsetY"],
  modulateRepeatX: ["reps", "offset"],
  modulateRepeatY: ["reps", "offset"],
  modulateKaleid: ["nSides"],
  modulateScrollX: ["scrollX", "speed"],
  modulateScrollY: ["scrollY", "speed"],
  modulate: ["amount"],
  modulateScale: ["multiple", "offset"],
  modulatePixelate: ["multiple", "offset"],
  modulateRotate: ["multiple", "offset"],
  modulateHue: ["amount"],
  /* Blend */
  add: ["amount"],
  sub: ["amount"],
  layer: [],
  blend: ["amount"],
  mult: ["amount"],
  diff: [],
  mask: [],
};

export const FALLBACK_SOURCE = "";

export const SOURCE_FUNCTIONS = [
  {
    name: "noise",
    params: [10, 0.01],
  },
  {
    name: "voronoi",
    params: [5, 0.3, 0.3],
  },
  {
    name: "osc",
    params: [60, 0.1, 0],
  },
  {
    name: "shape",
    params: [3, 0.3, 0.01],
  },
  {
    name: "gradient",
    params: [1],
  },
  {
    name: "src",
    params: ["o0"],
  },
  {
    name: "solid",
    params: ["[1, 0, 0]", "[0, 1, 0]", "[0, 0, 1]", 1],
  },
];

export const EXTERNAL_SOURCE_FUNCTIONS = [
  {
    name: "initCam",
    params: [0],
  },
  {
    name: "initImage",
    params: [
      "https://upload.wikimedia.org/wikipedia/commons/2/25/Hydra-Foto.jpg",
    ],
  },
  {
    name: "initVideo",
    params: ["https://media.giphy.com/media/AS9LIFttYzkc0/giphy.mp4"],
  },
  // {
  //   name: "init",
  // },
  {
    name: "initScreen",
  },
];

export const THREE_FUNCTIONS = [
  {
    name: "3D",
    params: {
      name: "",
      threeJsContent: "",
    },
  },
];

export const GEOMETRY_FUNCTIONS = [
  {
    name: "repeat",
    params: [3, 3, 0.5, 0],
  },
  {
    name: "repeatX",
    params: [3, 0.5],
  },
  {
    name: "repeatY",
    params: [3, 0.5],
  },
  {
    name: "scroll",
    params: [0.5, 0.5, 0.5, 0],
  },
  {
    name: "scrollX",
    params: [0.5, 0.5],
  },
  {
    name: "scrollY",
    params: [0.5, 0.5],
  },
  {
    name: "rotate",
    params: [10, 1],
  },
  {
    name: "scale",
    params: [1.5, 1, 1, 0.5, 0.5],
  },
  {
    name: "pixelate",
    params: [20, 20],
  },
  {
    name: "kaleid",
    params: [4],
  },
];

export const COLOR_FUNCTIONS = [
  {
    name: "r",
    params: [1, 0],
  },
  {
    name: "g",
    params: [1, 0],
  },
  {
    name: "b",
    params: [1, 0],
  },
  {
    name: "color",
    params: [1, 0, 1, 1],
  },
  {
    name: "saturate",
    params: [2],
  },
  {
    name: "hue",
    params: [0.4],
  },
  {
    name: "posterize",
    params: [3, 0.6],
  },
  {
    name: "shift",
    params: [0.5, 0, 0, 1],
  },
  {
    name: "invert",
    params: [1],
  },
  {
    name: "contrast",
    params: [1.6],
  },
  {
    name: "brightness",
    params: [0.4],
  },
  {
    name: "luma",
    params: [0.5, 0.1],
  },
  {
    name: "thresh",
    params: [0.5, 0.4],
  },
  {
    name: "colorama",
    params: [0.005],
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
    params: [1],
  },
  {
    name: "modulateScale",
    blocks: [],
    params: [1, 1],
  },
  {
    name: "modulatePixelate",
    blocks: [],
    params: [10, 3],
  },
  {
    name: "modulateRotate",
    blocks: [],
    params: [1, 0],
  },
  {
    name: "modulateHue",
    blocks: [],
    params: [1],
  },
];

export const BLEND_FUNCTIONS = [
  {
    name: "add",
    blocks: [],
    params: [1],
  },
  {
    name: "sub",
    blocks: [],
    params: [1],
  },
  {
    name: "layer",
    blocks: [],
  },
  {
    name: "blend",
    blocks: [],
    params: [0.5],
  },
  {
    name: "mult",
    blocks: [],
    params: [1],
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
