export const BACKGROUND_CODES = [
  "osc(10, 0.1, 0.8).scale(0.7).brightness(0.4).contrast(1.8).posterize(5, 5).modulatePixelate(osc(30), 100).modulateScrollX(osc(80), 0.008).modulateScale(noise(10), 0.1).modulateScale(osc(10), 0.5).colorama(4).out();",
  "osc(190, 0.1).modulateRotate(osc(3, 0.4)).modulateScale(osc(5)).repeat(2, 2).add(shape(3).rotate(1).scale(0.3)).modulateRotate(osc(1,0.1)).brightness(-0.5).out()",
];

export const TYPE_SRC = "source";
export const TYPE_EFFECT = "effect";

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
        value: 0,
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
        value: 0,
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
        value: 0,
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
        value: 0,
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
        value: 0,
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
        value: 0,
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

export const MODULATE_FUNCTIONS = [];
