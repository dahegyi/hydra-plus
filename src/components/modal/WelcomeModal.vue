<script setup>
// import { computed } from "vue";
// import { CURRENT_VERSION } from "@/constants";
// import { getSafeLocalStorage } from "@/utils";
import BaseModal from "./BaseModal";

// const showLatestUpdates = computed(
//   () => getSafeLocalStorage("welcomeModalLastUpdate") < CURRENT_VERSION,
// );
</script>

<template>
  <BaseModal modal-name="WelcomeModal"> content </BaseModal>
</template>

<style lang="scss" scoped>
h1 {
  margin: 1.2rem auto;
}

p {
  margin: 8px 0;
  text-align: left;
}

.feature {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px 14px;

  &:nth-child(2n) {
    background: #1a1a1a;
  }

  .description {
    flex-grow: 1;
    margin-top: 2px;
    text-align: left;
  }

  .key {
    padding: 6px 10px;
    border-radius: 5px;
    margin: 0 4px;
    background: #333;
    box-shadow: 0 2px 0 #777;
    font-size: 0.9rem;

    &[data-type="enter"] {
      padding: 6px 25px;
    }
  }

  .or-text {
    margin: 0 8px;
  }

  @media screen and (max-width: 500px) {
    > div {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .description {
      margin-bottom: 10px;
      font-weight: bold;
    }

    .key {
      margin: 0;
    }

    .or-text {
      display: none;
    }
  }
}

li {
  padding: 4px 0px 4px 20px;
  text-align: left;
}
</style>
