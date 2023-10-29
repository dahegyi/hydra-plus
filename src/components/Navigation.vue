<template>
  <div class="navigation">
    <div>
      <strong v-if="focused">{{ outputName }}</strong>

      <div class="dropdown">
        <button>new {{ isAddSourceVisible ? "source" : "effect" }}</button>
        <ul class="dropdown-content">
          <li
            v-if="isAddSourceVisible"
            v-for="source in sources"
            :class="source.type"
            @click="addSource(source)"
          >
            {{ source.name }}
          </li>

          <li
            v-else
            v-for="functions in functionGroups"
            :key="functions.name"
            class="dropdown"
          >
            {{ functions.name }}
            <ul class="dropdown-content">
              <li
                v-for="fn in functions.fns"
                :key="fn.name"
                @click="addEffect(fn)"
              >
                {{ fn.name }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <div>
      <button @click="openThreeModal">3D settings</button>
      <button @click="openSettingsModal" class="settings">
        synth settings
      </button>
      <button @click="update" class="update">update</button>
      <button @click="send" class="send">send</button>
    </div>
  </div>
</template>
<script>
import { useBroadcastChannel } from "@vueuse/core";
const { post } = useBroadcastChannel({ name: "hydra-plus-channel" });

import { mapActions, mapGetters } from "vuex";

import "toastify-js/src/toastify.css";

import {
  TYPE_SRC,
  TYPE_EXTERNAL,
  TYPE_THREE,
  TYPE_SIMPLE,
  TYPE_COMPLEX,
  SOURCE_FUNCTIONS,
  EXTERNAL_SOURCE_FUNCTIONS,
  THREE_FUNCTIONS,
  GEOMETRY_FUNCTIONS,
  COLOR_FUNCTIONS,
  BLEND_FUNCTIONS,
  MODULATE_FUNCTIONS,
} from "@/constants";

export default {
  name: "Navigation",

  emits: ["openThreeModal", "openSettingsModal"],

  computed: {
    ...mapGetters([
      "focused",
      "blocks",
      "externalSourceBlocks",
      "synthSettings",
    ]),

    outputName() {
      const blockIndex = this.blocks.findIndex(
        (block) => block === this.focused,
      );

      if (blockIndex >= 0) {
        return `o${blockIndex} - ${this.focused.name}`;
      }

      return this.focused.name;
    },

    isFocusNameVisible() {
      return this.outputName && this.focused?.name;
    },

    isAddSourceVisible() {
      return (
        this.focused?.type !== TYPE_SRC && this.focused?.type !== TYPE_SIMPLE
      );
    },

    sources() {
      return [
        ...SOURCE_FUNCTIONS.map((fn) => ({
          ...fn,
          type: TYPE_SRC,
          blocks: [],
        })),

        ...EXTERNAL_SOURCE_FUNCTIONS.map((fn) => ({
          ...fn,
          type: TYPE_EXTERNAL,
        })),

        ...THREE_FUNCTIONS.map((fn) => ({
          ...fn,
          type: TYPE_THREE,
        })),
      ];
    },

    functionGroups() {
      return [
        {
          name: "geometry",
          fns: GEOMETRY_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SIMPLE })),
        },
        {
          name: "color",
          fns: COLOR_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_SIMPLE })),
        },
        {
          name: "blend",
          fns: BLEND_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_COMPLEX })),
        },
        {
          name: "modulate",
          fns: MODULATE_FUNCTIONS.map((fn) => ({ ...fn, type: TYPE_COMPLEX })),
        },
      ];
    },
  },

  methods: {
    ...mapActions(["addSource", "addEffect", "update", "send"]),

    openThreeModal() {
      this.$emit("openThreeModal");
    },

    openSettingsModal() {
      this.$emit("openSettingsModal");
    },
  },
};
</script>

<style lang="scss" scoped>
.navigation {
  position: fixed;
  width: calc(100% - 12px);
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  background: #151515dd;
  backdrop-filter: blur(6px);
  z-index: 1;

  div {
    display: flex;
    align-items: center;

    * {
      margin-right: 0.5rem;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  @mixin dropdown {
    display: none;

    button {
      margin: 0;
      cursor: pointer;
    }

    > .dropdown-content {
      display: none;
      position: absolute;
      flex-direction: column;
      list-style: none;
      top: 0;
      left: 0;
      margin: 0 100% 0;
      padding: 0;
      background-color: #222;
      z-index: 1;

      li {
        margin: 0;
        padding: 0.5rem 1rem;
        min-width: 160px;
        cursor: pointer;

        &.external {
          background-color: #333;
        }

        &.three {
          background-color: #555;
        }

        &:hover {
          background-color: #111;
        }
      }
    }

    &:hover > .dropdown-content {
      display: block;
    }
  }

  .dropdown {
    @include dropdown;

    position: relative;
    display: flex;

    .dropdown-content {
      @include dropdown;
      border: 3px solid #111;
    }
  }

  button {
    &.settings {
      margin-right: 2rem;
    }

    &.update {
      border: 3px solid #bda22d;
    }

    &.send {
      border: 3px solid #b62424;
    }
  }
}
</style>
