/*
 * @Author: chengshanshan 
 * @Date: 2018-09-29 13:56:05 
 * @Last Modified by: chengshanshan
 * @Last Modified time: 2018-11-30 13:52:48
 * @instraction:阿里云视频点播 禁止支持flash播放
 */

<template >
  <div class="prism-player" :id="playerId"></div>
</template>
<script>
export default {
  props: {
    playStyle: {
      type: String,
      default: ""
    },
    aliplayerSdkPath: {
      // Aliplayer 代码的路径
      type: String,
      default: "https://g.alicdn.com/de/prismplayer/2.7.2/aliplayer-min.js"
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    isLive: {
      //播放内容是否为直播，直播时会禁止用户拖动进度条
      type: Boolean,
      default: false
    },
    playsinline: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "400px"
    },
    controlBarVisibility: {
      type: String,
      default: "always"
    },
    useH5Prism: {
      //指定使用H5播放器
      type: Boolean,
      default: false
    },
    useFlashPrism: {
      //指定使用Flash播放器
      type: Boolean,
      default: true
    },
    vid: {
      type: String,
      default: ""
    },
    playauth: {
      type: String,
      default: ""
    },
    source: {
      type: String,
      default: ""
    },
    cover: {
      type: String,
      default: ""
    },
    format: {
      type: String,
      default: "m3u8"
    },
    x5_video_position: {
      type: String,
      default: "top"
    },
    x5_type: {
      type: String,
      default: "h5"
    },
    x5_fullscreen: {
      type: Boolean,
      default: false
    },
    x5_orientation: {
      type: Number,
      default: 2
    },
    autoPlayDelay: {
      //播放器是否自动播放，在移动端autoplay属性会失效
      type: Number,
      default: 0
    },
    autoPlayDelayDisplayText: {
      type: String
    }
  },
  data() {
    return {
      playerId:
        "aliplayer_" +
        Math.random()
          .toString(36)
          .substr(2),
      scriptTagStatus: 0,
      isReload: false,
      instance: null
    };
  },
  methods: {
    insertScriptTag() {
      const _this = this;
      let playerScriptTag = document.getElementById("playerScriptTag");
      // 如果这个tag不存在，则生成相关代码tag以加载代码
      if (playerScriptTag === null) {
        playerScriptTag = document.createElement("script");
        playerScriptTag.type = "text/javascript";
        playerScriptTag.src = this.aliplayerSdkPath;
        playerScriptTag.id = "playerScriptTag";
        let s = document.getElementsByTagName("head")[0];
        s.appendChild(playerScriptTag);
      }
      if (playerScriptTag.loaded) {
        _this.scriptTagStatus++;
      } else {
        playerScriptTag.addEventListener("load", () => {
          _this.scriptTagStatus++;
          playerScriptTag.loaded = true;
          _this.initAliplayer();
        });
      }
      _this.initAliplayer();
    },
    initAliplayer() {
      const _this = this;
      // scriptTagStatus 为 2 的时候，说明两个必需引入的 js 文件都已经被引入，且加载完成
      if (
        _this.scriptTagStatus === 2 &&
        (_this.instance === null || _this.reloadPlayer)
      ) {
        // _this.instance && _this.instance.dispose();
         if (_this.instance) {
            _this.instance = null;
          }
        document.querySelector("#" + _this.playerId).innerHTML = "";
        // Vue 异步执行 DOM 更新，这样一来代码执行到这里的时候可能 template 里面的 script 标签还没真正创建
        // 所以，我们只能在 nextTick 里面初始化 Aliplayer
        _this.$nextTick(() => {   
          _this.instance = window.Aliplayer({
            id: _this.playerId,
            vid: _this.vid,
            playauth: _this.playauth,
            source: _this.source,
            cover: _this.cover,
            autoplay: _this.autoplay,
            isLive: _this.isLive,
            playsinline: _this.playsinline,
            format: _this.format,
            width: _this.width,
            height: _this.height,
            controlBarVisibility: _this.controlBarVisibility,
            useH5Prism: _this.useH5Prism,
            useFlashPrism: _this.useFlashPrism,
            x5_video_position: _this.x5_video_position,
            x5_type: _this.x5_type,
            x5_fullscreen: _this.x5_fullscreen,
            x5_orientation: _this.x5_orientation,
            autoPlayDelay: _this.autoPlayDelay,
            autoPlayDelayDisplayText: _this.autoPlayDelayDisplayText
          });

          // 绑定事件，当 AliPlayer 初始化完成后，将编辑器实例通过自定义的 ready 事件交出去
          _this.instance.on("ready", () => {
            this.$emit("ready", _this.instance);
          });

          _this.instance.on("play", () => {
            this.$emit("play", _this.instance);
          });

          _this.instance.on("pause", () => {
            this.$emit("pause", _this.instance);
          });

          _this.instance.on("ended", () => {
            this.$emit("ended", _this.instance);
          });

          _this.instance.on("liveStreamStop", () => {
            this.$emit("liveStreamStop", _this.instance);
          });

          _this.instance.on("m3u8Retry", () => {
            this.$emit("m3u8Retry", _this.instance);
          });

          _this.instance.on("hideBar", () => {
            this.$emit("hideBar", _this.instance);
          });

          _this.instance.on("waiting", () => {
            this.$emit("waiting", _this.instance);
          });

          _this.instance.on("snapshoted", () => {
            this.$emit("snapshoted", _this.instance);
          });
        });
      }
    },
    /**
     * 播放视频
     */
    play: function() {
      this.instance.play();
    },
    /**
     * 暂停视频
     */
    pause: function() {
      this.instance.pause();
    },
    /**
     * 重播视频
     */
    replay: function() {
      this.instance.replay();
    },
    /**
     * 跳转到某个时刻进行播放
     * @argument time 的单位为秒
     */
    seek: function(time) {
      this.instance.seek(time);
    },
    ended: function() {},
    reloadPlayer: function() {
      this.initAliplayer();
    }
  },
  created() {
    if (window.Aliplayer !== undefined) {
      // 如果全局对象存在，说明编辑器代码已经初始化完成，直接加载编辑器
      this.scriptTagStatus = 2;
      this.initAliplayer();
    } else {
      // 如果全局对象不存在，说明编辑器代码还没有加载完成，需要加载编辑器代码
      this.insertScriptTag();
    }
  },
  mounted() {
    if (window.Aliplayer !== undefined) {
      // 如果全局对象存在，说明编辑器代码已经初始化完成，直接加载编辑器
      this.scriptTagStatus = 2;
      this.initAliplayer();
    } else {
      // 如果全局对象不存在，说明编辑器代码还没有加载完成，需要加载编辑器代码
      this.insertScriptTag();
    }
  }
};
</script>
<style lang="scss">
@import url(https://g.alicdn.com/de/prismplayer/2.7.2/skins/default/aliplayer-min.css);
.prism-player {
  .prism-ErrorMessage,
  .operators {
    display: none;
  }
}
</style>


