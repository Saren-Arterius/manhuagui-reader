import Vuex from 'vuex';

let sat = 100;
let blur = 0;
let alpha = 0;

const createStore = () => new Vuex.Store({
  state: {
    progressDialogMessage: null
  },
  mutations: {
    setProgressDialogMessage (state, msg) {
      state.progressDialogMessage = msg;
    }
  },
  actions: {
    async nuxtClientInit ({dispatch}) {
      window;
    },
    animateProgressDialogMessage ({state, commit}, msg) {
      if (msg === state.progressDialogMessage) {
        return null;
      }
      if (msg) {
        window.jQuery('#progress-dialog').css({
          display: 'flex'
        });
      }
      return new Promise((resolve) => {
        const anim = () => {
          const [fSat, fBlur, fAlpha] = [sat, blur, alpha];
          const [tSat, tBlur, tAlpha] = [msg ? 180 : 100, msg ? 20 : 0, msg ? 0.5 : 0];
          const [dSat, dBlur, dAlpha] = [tSat - fSat, tBlur - fBlur, tAlpha - fAlpha];
          window.jQuery('#progress-dialog').stop();
          window.jQuery('#progress-dialog').animate({
            opacity: 2
          }, {
            duration: msg ? 450 : 200,
            step: (now, fx) => {
              const step = now - 1;
              [sat, blur, alpha] = [fSat + (dSat * step), fBlur + (dBlur * step), fAlpha + (dAlpha * step)];
              window.jQuery(fx.elem).css({
                'backdrop-filter': `saturate(${sat}%) blur(${blur}px)`,
                'background-color': `rgba(0, 0, 0, ${alpha})`
              });
            },
            complete: () => {
              if (!msg) {
                window.jQuery('#progress-dialog').css({
                  display: 'none'
                });
              }
              resolve();
            }
          });
          commit('setProgressDialogMessage', msg);
        };
        if (msg) {
          anim();
        } else {
          setTimeout(anim, 200);
        }
      });
    }
  }
});

export default createStore;
