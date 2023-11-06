<template>
  <div class="navigation">
    <div>
      <strong v-if="focused">{{ outputName }}</strong>

      <div :class="['dropdown', { disabled: isButtonDisabled }]">
        <button>new {{ isAddParentVisible ? "source" : "effect" }}</button>

        <ul v-if="isAddParentVisible" class="dropdown-content">
          <li
            v-for="source in sources"
            :key="source.name"
            :class="source.type"
            @click="addParent(source)"
          >
            {{ source.name }}
          </li>
        </ul>
        <ul v-else class="dropdown-content">
          <li
            v-for="functions in functionGroups"
            :key="functions.name"
            class="dropdown"
          >
            {{ functions.name }}
            <ul class="dropdown-content">
              <li
                v-for="fn in functions.fns"
                :key="fn.name"
                @click="addChild(fn)"
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
      <button class="settings" @click="openSettingsModal">
        synth settings
      </button>
      <button class="send" @click="send">send</button>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

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
} from "~/constants";

export default {
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

    isAddParentVisible() {
      return (
        this.focused?.type !== TYPE_SRC && this.focused?.type !== TYPE_SIMPLE
      );
    },

    isButtonDisabled() {
      return this.isAddParentVisible && this.focused?.blocks.length > 0;
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
    ...mapActions(["addParent", "addChild", "send"]),

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
  z-index: 1;
  top: 0;
  display: flex;
  width: calc(100% - 12px);
  align-items: center;
  justify-content: space-between;
  padding: 6px;
  backdrop-filter: blur(6px);
  background: #151515dd;

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
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      display: none;
      flex-direction: column;
      padding: 0;
      margin: 0 100% 0;
      background-color: #222;
      list-style: none;

      li {
        min-width: 160px;
        padding: 0.5rem 1rem;
        margin: 0;
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

    &:not(.disabled):hover > .dropdown-content {
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
      margin-top: -3px;
    }

    &.disabled {
      button {
        background: #999;
        cursor: not-allowed;
      }
    }
  }

  button {
    &.settings {
      margin-right: 2rem;
    }

    &.send {
      border: 3px solid #b62424;
    }
  }
}
</style>
