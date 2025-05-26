window.addEventListener("DOMContentLoaded", () => {
  if (!customElements.get("video-hero")) {
    class videoHero extends HTMLElement {
      constructor() {
        super();
        this.video = this.querySelector(".custom-video");
        this.YoutubeVideo = this.querySelector(".youtube-video-player");
        this.VimeoVideo = this.querySelector(".vimeo-video-player");
        this.circlePlayButton = this.querySelector(".custom-video-btn");

        // init functions
        if (this.video) this.togglePlay();
        if (this.YoutubeVideo) this.YTVideo();
        if (this.VimeoVideo) this.vimeoVideos();
      }

      // HTML5 video toggle
      togglePlay = () => {
        const circlePlaying = this.querySelector(".thumbnail-wrapper-id");
        const SecondplayBtn = this.querySelector(".second_play-btn");
        const video = this.video;
        const videoAutoplay = video.dataset.autoplay;
        const videomuted = video.getAttribute("muted");

        if (videoAutoplay === "true" && videomuted === "muted") {
          SecondplayBtn.style.opacity = "0";
          SecondplayBtn.classList.add("show_btn");
        } else {
          this.circlePlayButton.addEventListener("click", () => {
            if (video.paused || video.ended) {
              video.play();
              circlePlaying.style.display = "none";
              SecondplayBtn.style.opacity = "0";
              SecondplayBtn.classList.add("show_btn");
            }
          });
        }

        SecondplayBtn.addEventListener("click", () => {
          if (video.paused || video.ended) {
            video.play();
            SecondplayBtn.style.opacity = "0";
          } else {
            video.pause();
            SecondplayBtn.style.opacity = "1";
          }
        });
      };

      YTVideo = () => {
        let player = null;
        const {
          youtubeid: getYoutubeId,
          youtubeautoplay: youtubeAutoplay,
          youtubemuted: youtubeMuted,
        } = this.YoutubeVideo.dataset;

        const circlePlaying = this.querySelector(".thumbnail-wrapper-id");
        const SecondplayBtn = this.querySelector(".second_play-btn");

        const handleVideoPlayer = () => {
          if (youtubeMuted === "1") player.mute();
          else player.unMute();

          if (youtubeAutoplay === "1" && youtubeMuted === "1") {
            player.playVideo();
            SecondplayBtn.style.opacity = "0";
            SecondplayBtn.classList.add("show_btn");
          } else {
            this.circlePlayButton.addEventListener("click", () => {
              if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
                player.playVideo();
                if (youtubeMuted === "1") player.mute();
                else player.unMute();

                circlePlaying.style.display = "none";
                SecondplayBtn.style.opacity = "0";
                SecondplayBtn.classList.add("show_btn");
              }
            });
          }

          SecondplayBtn.addEventListener("click", () => {
            if (player.getPlayerState() === YT.PlayerState.PLAYING) {
              player.pauseVideo();
              SecondplayBtn.style.opacity = "1";
            } else {
              player.playVideo();
              SecondplayBtn.style.opacity = "0";
            }
          });
        };

        const onPlayerStateChange = (event) => {
          const videoStatuses = Object.entries(window.YT.PlayerState);
          console.log(
            videoStatuses.find((status) => status[1] === event.data)?.[0]
          );
        };

        window.YT.ready(() => {
          player = new YT.Player("player", {
            videoId: getYoutubeId,
            playerVars: {
              controls: 0,
              showinfo: 0,
              rel: 0,
              enablejsapi: 1,
            },
            events: {
              onReady: handleVideoPlayer,
              onStateChange: onPlayerStateChange, // fixed typo: was "onStateChane"
            },
          });
        });
      };

      vimeoVideos = () => {
        const playerContainer = this.querySelector(".player-container");
        const {
          vimeoid: getVimeoId,
          vimeoautoplay: vimeoAutoplay,
          vimeomuted: vimeoMuted,
        } = this.VimeoVideo.dataset;

        const circlePlaying = this.querySelector(".thumbnail-wrapper-id");
        const SecondplayBtn = this.querySelector(".second_play-btn");

        const options = {
          url: `https://vimeo.com/${getVimeoId}`,
          autoplay: false,
          controls: false,
          muted: vimeoMuted === "true",
        };

        const player = new Vimeo.Player(playerContainer, options);

        const isVideoPlaying = () =>
          player.getPaused().then((paused) => !paused);

        if (vimeoAutoplay === "true" && vimeoMuted === "true") {
          player.play();
          SecondplayBtn.style.opacity = "0";
          SecondplayBtn.classList.add("show_btn");
        } else {
          this.circlePlayButton.addEventListener("click", () => {
            isVideoPlaying().then((playing) => {
              if (!playing) {
                player.play();
                circlePlaying.style.display = "none";
                SecondplayBtn.style.opacity = "0";
                SecondplayBtn.classList.add("show_btn");
              }
            });
          });
        }

        SecondplayBtn.addEventListener("click", () => {
          isVideoPlaying().then((playing) => {
            if (playing) {
              player.pause();
              SecondplayBtn.style.opacity = "1";
            } else {
              player.play();
              SecondplayBtn.style.opacity = "0";
            }
          });
        });
      };
    }

    customElements.define("video-hero", videoHero);
  }
});
