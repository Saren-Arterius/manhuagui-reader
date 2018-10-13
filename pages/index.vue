<template lang="pug">
div
  transition(name="slide-fade" mode="out-in")
    .container(v-if="!currentChapter" key="a")
      .center
        h1 Manhuagui Reader
      form.col.s12(@submit.prevent='loadURL')
        .row
          .input-field.col.s12.m9
            input#url.validate(type='text' v-model='urlInput' required placeholder='https://www.manhuagui.com/comic/xxxxx/')
            label.active(for='url') URL
          .input-field.col.s12.m3
            button.waves-effect.waves-light.btn(:disabled="loading") Load
      transition(name="slide-fade-up" mode="out-in")
        .center(v-if="loading" key="c")
          Spinner
        div(v-if="manga" key=":manga.url")
          .row
            .col.s12.m4
              h3 {{ manga.title }}
              img.img-responsive(:src="manga.cover")
            .col.s12.m8
              div(v-for="s in manga.sections")
                p.flow-text {{ s.title }}
                table.highlight
                  thead
                    tr
                      th Chapter
                      th Pages
                  tbody
                    tr(v-for="c in s.chapters" @click="loadChapter(c)")
                      td {{ c.title }}
                      td {{ c.pages }}
    div(v-else key="b")
      .topbar
        .top-col
          a(href="#" @click="currentChapter = null")
            i#back.material-icons chevron_left
        .top-col
          p.top-text.top-title.truncate {{ manga.title }}
        .top-col
          p.top-text.top-chapter.truncate {{ currentChapter.title }}
      transition(name="slide-fade-up" mode="out-in")
        .manga-container.center(v-if="currentChapter.imageURLs" key="aa")
          .row(v-for="u in currentChapter.imageURLs")
            img.lazy.manga(v-lazy="proxy(u)")
        .valign-wrapper(v-else key="bb")
          .center(style="margin-left: auto; margin-right: auto; margin-top: 4em;")
            Spinner
</template>

<script>
import Vue from 'vue';
import VueLazyload from 'vue-lazyload';
import Spinner from '@/components/Spinner.vue';
import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

import cheerio from 'cheerio';
import {simplifiedToTraditional} from 'node-opencc';
import rp from 'request-promise';
import {setTimeout} from 'timers';

// or with options
Vue.use(VueLazyload, {
  preLoad: 3,
  error:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8V1BgAFBAHhFD2CqgAAAABJRU5ErkJggg==',
  attempt: 3
});

const sleep = ms => new Promise(rs => setTimeout(rs, ms));
export default {
  data: () => ({
    driver: null,
    urlInput: 'https://www.manhuagui.com/comic/17535/',
    currentURL: null,
    urlMangas: {},
    currentChapter: null
  }),
  computed: {
    manga () {
      return this.urlMangas[this.currentURL];
    },
    loading () {
      return this.currentURL && this.manga !== false && !this.manga;
    }
  },
  components: {
    Spinner
  },
  methods: {
    proxy (url) {
      return `${location.href}img?url=${encodeURIComponent(url)}`;
    },
    async loadChapter (c) {
      this.currentChapter = c;
      if (!this.driver) {
        const options = new chrome.Options().headless();
        this.driver = new webdriver.Builder()
          .forBrowser('chrome')
          .withCapabilities(
            webdriver.Capabilities.chrome().setPageLoadStrategy('none')
          )
          .setChromeOptions(options)
          .build();
      }

      await this.driver.get(`https://www.manhuagui.com${c.href}`);
      let payload;
      while (this.driver) {
        try {
          const html = await this.driver.getPageSource();
          const $ = cheerio.load(html);
          let src = $('body > script:nth-child(8)')
            .html()
            .replace('window["\\x65\\x76\\x61\\x6c"]', '');
          src = `String.prototype.splic = (function(f){return LZString.decompressFromBase64(this).split(f)}); return ${src}`;
          src = src.replace('&lt;', '<').replace('&gt;', '>');
          payload = await this.driver.executeScript(src);
          break;
        } catch (e) {
          await sleep(50);
        }
      }
      await this.driver.quit();
      this.driver = null;
      // SMH.imgData({"bid":17535,"bname":"七龙珠超","bpic":"17535_56.jpg","cid":382633,"cname":"第38回","files":["pic_001.jpg.webp","pic_002.jpg.webp","pic_003.jpg.webp","pic_004.jpg.webp","pic_005.jpg.webp","pic_006.jpg.webp","pic_007.jpg.webp","pic_008.jpg.webp","pic_009.jpg.webp","pic_010.jpg.webp","pic_011.jpg.webp","pic_012.jpg.webp","pic_013.jpg.webp","pic_014.jpg.webp","pic_015.jpg.webp","pic_016.jpg.webp","pic_017.jpg.webp","pic_018.jpg.webp","pic_019.jpg.webp","pic_020.jpg.webp","pic_021.jpg.webp","pic_022.jpg.webp","pic_023.jpg.webp","pic_024.jpg.webp","pic_025.jpg.webp","pic_026.jpg.webp","pic_027.jpg.webp","pic_028.jpg.webp","pic_029.jpg.webp","pic_030.jpg.webp","pic_031.jpg.webp","pic_032.jpg.webp","pic_033.jpg.webp","pic_034.jpg.webp","pic_035.jpg.webp","pic_036.jpg.webp","pic_037.jpg.webp","pic_038.jpg.webp","pic_039.jpg.webp","pic_040.jpg.webp","pic_041.jpg.webp","pic_042.jpg.webp","pic_043.jpg.webp","pic_044.jpg.webp","pic_045.jpg.webp"],"finished":false,"len":45,"path":"/ps4/l/lzc_nsm/第38回/","status":1,"block_cc":"","nextId":389685,"prevId":376569,"sl":{"md5":"xGl7Kq5tWwctUB5cypnOEg"}}).preInit();
      const data = JSON.parse(
        payload.replace('SMH.imgData(', '').replace(').preInit();', '')
      );
      const urls = data.files.map(
        f => `https://i.hamreus.com${data.path}${f}?cid=${data.cid}&md5=${
          data.sl.md5
        }`
      );
      this.$set(c, 'imageURLs', urls);
    },
    async loadURL () {
      this.currentURL = this.urlInput;
      if (this.urlMangas[this.currentURL]) {
        return;
      }
      try {
        const html = await rp(this.currentURL);
        const $ = cheerio.load(html);
        // await this.driver.executeScript('SMH.utils.goPage(2)');
        const manga = {
          title: simplifiedToTraditional($('.book-title > h1').text()),
          url: this.currentURL,
          cover: $('.hcover > img:nth-child(1)').attr('src'),
          sections: []
        };
        let currentSection;
        $('h4, .chapter-list').each(function () {
          if (!currentSection) {
            currentSection = {
              title: simplifiedToTraditional($(this).text()),
              chapters: []
            };
          } else {
            $(this)
              .find('.status0')
              .each(function () {
                currentSection.chapters.push({
                  title: simplifiedToTraditional($(this).attr('title')).trim(),
                  href: $(this).attr('href'),
                  pages: parseInt(
                    $(this)
                      .find('i')
                      .text(),
                    10
                  ),
                  imageURLs: null
                });
              });
            manga.sections.push(currentSection);
            currentSection = null;
          }
        });
        this.$set(this.urlMangas, this.currentURL, manga);
      } catch (e) {
        console.error(e);
        this.$set(this.urlMangas, this.currentURL, false);
      }
      console.log(JSON.stringify(this.manga));
    }
  },
  mounted () {
    console.log(location.host);
  }
};
</script>

<style scoped>
.btn {
  width: 100%;
}
td {
  padding: 10px 5px;
}
tr {
  cursor: pointer;
}
table.highlight > tbody > tr:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all 0.5s;
}

.slide-fade-leave-active {
  transition: all 0.2s;
}

.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(-10px);
  opacity: 0;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-up-enter-active {
  transition: all 0.5s;
}

.slide-fade-up-leave-active {
  transition: all 0.2s;
}

.slide-fade-up-enter, .slide-fade-up-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(10px);
  opacity: 0;
}

@keyframes fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

img[lazy="loaded"] {
  opacity: 0;
  animation-name: fadein;
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  animation-direction: normal;
  animation-timing-function: ease-out;
}

.manga {
  height: calc(100vh - 3em);
  max-width: 100vw;
}

.topbar {
  height: 3em;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  position: fixed;
  width: 100%;
  z-index: 999;
  display: flex;
}

.top-col {
  flex: 1;
}

.manga-container {
  padding-top: 3em;
}

.top-text {
  margin: 0;
  line-height: 3em;
}

.top-title {
  text-align: center;
  font-weight: 900;
  font-size: 1.5em;
  line-height: 2em;
}

.top-chapter {
  text-align: right;
  padding-right: 2em;
}

#back {
  color: white;
  font-size: 3em;
}
</style>
