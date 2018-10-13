<template lang="pug">
  #layout
    #progress-dialog.valign-wrapper
      transition(name="slide-fade")
        .center(style="margin-left: auto; margin-right: auto;" v-if="$store.state.progressDialogMessage")
          Spinner
          h3 {{ $store.state.progressDialogMessage }}
    #outer
      nuxt
</template>

<script>
import Spinner from '~/components/Spinner.vue';

export default {
  components: {
    Spinner
  }
};
</script>

<style>
@media only screen and (max-width: 639px) {
  .modal {
    width: 95%;
  }
}

#progress-dialog {
  position: fixed;
  z-index: 10000;
  width: 100%;
  height: 100%;
  display: none;
}

body {
  color: white;
  overflow-x: hidden;
}

@media only screen and (max-width: 992px) {
  #outer {
    padding-left: 0;
  }
}

html {
  background-color: #212121;
}

.picker--opened .picker__holder {
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

.modal-overlay {
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 1 !important;
}

.slide-fade-reduced-enter,
.slide-fade-reduced-leave-to,
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.slide-fade-reduced-item,
.slide-fade-reduced-move,
.slide-fade-reduced-enter-active,
.slide-fade-reduced-leave-active,
.slide-fade-item,
.slide-fade-move {
  transition: all 0.5s;
}

.slide-fade-reduced-leave-active {
  display: none;
}

.picker__wrap {
  filter: invert(85%) hue-rotate(210deg) saturate(180%);
}
.picker__date-display,
.picker__year-display {
  color: black;
}
.clockpicker-display-column {
  filter: invert(100%);
}
.dropdown-content {
  filter: invert(85%) hue-rotate(210deg) saturate(180%) brightness(150%);

  -webkit-box-shadow: initial;
  box-shadow: initial;
}
.select-wrapper > .caret {
  color: white !important;
}
.picker__box {
  border: initial;
  -webkit-box-shadow: initial;
  box-shadow: initial;
}
</style>
