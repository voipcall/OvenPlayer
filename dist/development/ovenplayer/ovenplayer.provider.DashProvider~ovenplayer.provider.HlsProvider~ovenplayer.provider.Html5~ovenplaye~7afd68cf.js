/*! OvenPlayerv0.7.79 | (c)2018 AirenSoft Co., Ltd. | MIT license (https://github.com/AirenSoft/OvenPlayerPrivate/blob/master/LICENSE) | Github : https://github.com/AirenSoft/OvenPlayer */
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["ovenplayer.provider.DashProvider~ovenplayer.provider.HlsProvider~ovenplayer.provider.Html5~ovenplaye~7afd68cf"],{

/***/ "./src/assets/OvenPlayerFlash.swf":
/*!****************************************!*\
  !*** ./src/assets/OvenPlayerFlash.swf ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "OvenPlayerFlash.swf";

/***/ }),

/***/ "./src/js/api/media/Manager.js":
/*!*************************************!*\
  !*** ./src/js/api/media/Manager.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _browser = __webpack_require__(/*! utils/browser */ "./src/js/utils/browser.js");

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

var _OvenPlayerFlash = __webpack_require__(/*! ../../../assets/OvenPlayerFlash.swf */ "./src/assets/OvenPlayerFlash.swf");

var _OvenPlayerFlash2 = _interopRequireDefault(_OvenPlayerFlash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Manager = function Manager(container, providerType) {
    var that = {};
    var rootId = container.getAttribute("data-parent-id");
    var mediaElement = "";
    var browserType = (0, _browser.getBrowser)();

    OvenPlayerConsole.log("MediaManager loaded. browserType : " + browserType);
    var createMediaElement = function createMediaElement() {
        if (providerType !== _constants.PROVIDER_RTMP) {
            mediaElement = document.createElement('video');
            mediaElement.setAttribute('disableRemotePlayback', '');
            mediaElement.setAttribute('webkit-playsinline', '');
            mediaElement.setAttribute('playsinline', '');
            container.appendChild(mediaElement);
        } else {
            var movie = void 0,
                flashvars = void 0,
                allowscriptaccess = void 0,
                allowfullscreen = void 0,
                quality = void 0,
                name = void 0,
                menu = void 0,
                qual = void 0,
                bgcolor = void 0;
            movie = document.createElement('param');
            movie.setAttribute('name', 'movie');
            movie.setAttribute('value', _OvenPlayerFlash2["default"]);

            flashvars = document.createElement('param');
            flashvars.setAttribute('name', 'flashvars');
            //playerId uses SWF for ExternalInterface.call().
            flashvars.setAttribute('value', 'playerId=' + rootId);

            allowscriptaccess = document.createElement('param');
            allowscriptaccess.setAttribute('name', 'allowscriptaccess');
            allowscriptaccess.setAttribute('value', 'always');

            allowfullscreen = document.createElement('param');
            allowfullscreen.setAttribute('name', 'allowfullscreen');
            allowfullscreen.setAttribute('value', 'true');

            quality = document.createElement('param');
            quality.setAttribute('name', 'quality');
            quality.setAttribute('value', 'height');

            name = document.createElement('param');
            name.setAttribute('name', 'name');
            name.setAttribute('value', rootId + "-flash");

            menu = document.createElement('param');
            menu.setAttribute('name', 'menu');
            menu.setAttribute('value', 'false');

            qual = document.createElement('param');
            qual.setAttribute('name', 'quality');
            qual.setAttribute('value', 'high');

            bgcolor = document.createElement('param');
            bgcolor.setAttribute('name', 'bgcolor');
            bgcolor.setAttribute('value', '#000000');

            mediaElement = document.createElement('object');
            mediaElement.setAttribute('id', rootId + "-flash");
            mediaElement.setAttribute('name', rootId + "-flash");
            mediaElement.setAttribute('width', '100%');
            mediaElement.setAttribute('height', '100%');

            if (browserType !== "oldIE") {
                mediaElement.setAttribute('data', _OvenPlayerFlash2["default"]);
                mediaElement.setAttribute('type', 'application/x-shockwave-flash');
            } else {
                mediaElement.setAttribute('classid', 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000');

                mediaElement.appendChild(movie);
            }
            mediaElement.appendChild(bgcolor);
            mediaElement.appendChild(qual);
            mediaElement.appendChild(allowfullscreen);
            mediaElement.appendChild(allowscriptaccess);
            mediaElement.appendChild(flashvars);

            container.appendChild(mediaElement);
        }
        return mediaElement;
    };

    that.create = function () {
        OvenPlayerConsole.log("MediaManager createElement()");
        if (mediaElement) {
            that.destroy();
        }
        return createMediaElement();
    };

    that.destroy = function () {
        OvenPlayerConsole.log("MediaManager removeElement()");
        container.removeChild(mediaElement);
        mediaElement = null;
    };

    return that;
}; /**
    * @brief   미디어 엘리먼트를 관리하는 객체. 현재는 하는 일이 많지 않다.
    * @param   {element}   container   dom element
    *
    * */
exports["default"] = Manager;

/***/ }),

/***/ "./src/js/api/provider/html5/Listener.js":
/*!***********************************************!*\
  !*** ./src/js/api/provider/html5/Listener.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

var _utils = __webpack_require__(/*! api/provider/utils */ "./src/js/api/provider/utils.js");

/**
 * @brief   Trigger on various video events.
 * @param   extendedElement extended media object by mse.
 * @param   Provider provider  html5Provider
 * */

var Listener = function Listener(extendedElement, provider) {
    var lowLevelEvents = {};

    OvenPlayerConsole.log("EventListener loaded.", extendedElement, provider);
    var that = {};

    var elVideo = (0, _utils.extractVideoElement)(extendedElement);
    var between = function between(num, min, max) {
        return Math.max(Math.min(num, max), min);
    };
    var onError = function onError(error) {
        provider.setState(_constants.STATE_ERROR);
        provider.pause();

        //PRIVATE_STATE_ERROR
        provider.trigger(_constants.ERROR, error);
    };

    //Fires when the browser can start playing the audio/video
    lowLevelEvents.canplay = function () {
        provider.setCanSeek(true);
        provider.trigger(_constants.CONTENT_BUFFER_FULL);
        OvenPlayerConsole.log("EventListener : on canplay");
    };
    //Fires when the duration of the audio/video is changed
    lowLevelEvents.durationchange = function () {
        lowLevelEvents.progress();
        OvenPlayerConsole.log("EventListener : on durationchange");
    };
    //Fires when the current playlist is ended
    lowLevelEvents.ended = function () {
        OvenPlayerConsole.log("EventListener : on ended");
        if (provider.getState() != _constants.STATE_IDLE && provider.getState() != _constants.STATE_COMPLETE) {
            provider.trigger(_constants.CONTENT_COMPLETE);
            provider.setState(_constants.STATE_COMPLETE);
        }
    };
    //Fires when the browser has loaded the current frame of the audio/video
    lowLevelEvents.loadeddata = function () {
        //Do nothing Because this causes chaos by loadedmetadata.
        /*
        var metadata = {
            duration: elVideo.duration,
            height: elVideo.videoHeight,
            width: elVideo.videoWidth
        };
        provider.trigger(CONTENT_META, metadata);*/
        OvenPlayerConsole.log("EventListener : on loadeddata");
    };
    //Fires when the browser has loaded meta data for the audio/video
    lowLevelEvents.loadedmetadata = function () {
        var isLive = elVideo.duration === Infinity ? true : (0, _utils.separateLive)(extendedElement);
        var sources = provider.getSources();
        var sourceIndex = provider.getCurrentSource();
        var type = sourceIndex > -1 ? sources[sourceIndex].type : "";
        var metadata = {
            duration: isLive ? Infinity : elVideo.duration,
            type: type
        };

        OvenPlayerConsole.log("EventListener : on loadedmetadata", metadata);
        provider.trigger(_constants.CONTENT_META, metadata);
    };
    //Fires when the audio/video has been paused
    lowLevelEvents.pause = function () {
        if (provider.getState() === _constants.STATE_COMPLETE || provider.getState() === _constants.STATE_ERROR) {
            return false;
        }
        if (elVideo.ended) {
            return false;
        }
        if (elVideo.error) {
            return false;
        }
        if (elVideo.currentTime === elVideo.duration) {
            return false;
        }
        OvenPlayerConsole.log("EventListener : on pause");
        provider.setState(_constants.STATE_PAUSED);
    };
    //Fires when the audio/video has been started or is no longer paused
    lowLevelEvents.play = function () {
        if (!elVideo.paused && provider.getState() !== _constants.STATE_PLAYING) {
            OvenPlayerConsole.log("EventListener : on play");
            provider.setState(_constants.STATE_LOADING);
        }
    };
    //Fires when the audio/video is playing after having been paused or stopped for buffering
    lowLevelEvents.playing = function () {
        OvenPlayerConsole.log("EventListener : on playing");
        provider.setState(_constants.STATE_PLAYING);
        //provider.trigger(PROVIDER_FIRST_FRAME);
    };
    //Fires when the browser is downloading the audio/video
    lowLevelEvents.progress = function () {
        var timeRanges = elVideo.buffered;
        if (!timeRanges) {
            return false;
        }

        var duration = elVideo.duration,
            position = elVideo.currentTime;
        var buffered = between((timeRanges.length > 0 ? timeRanges.end(timeRanges.length - 1) : 0) / duration, 0, 1);

        OvenPlayerConsole.log("EventListener : on progress", buffered * 100);

        provider.setBuffer(buffered * 100);
        provider.trigger(_constants.CONTENT_BUFFER, {
            bufferPercent: buffered * 100,
            position: position,
            duration: duration
        });
    };
    //Fires when the browser is trying to get media data, but data is not available
    lowLevelEvents.stalled = function () {
        OvenPlayerConsole.log("EventListener : on stall");
    };
    //Fires when the current playback position has changed
    lowLevelEvents.timeupdate = function () {
        var position = elVideo.currentTime;
        var duration = elVideo.duration;
        if (isNaN(duration)) {
            return;
        }

        if (!provider.isSeeking() && !elVideo.paused) {
            provider.setState(_constants.STATE_PLAYING);
        }
        /*OvenPlayerConsole.log("EventListener : on timeupdate" , {
            position: position,
            duration: duration
        });*/
        if (provider.getState() === _constants.STATE_PLAYING || provider.isSeeking()) {
            provider.trigger(_constants.CONTENT_TIME, {
                position: position,
                duration: duration
            });
        }
    };
    lowLevelEvents.resize = function () {
        OvenPlayerConsole.log("EventListener : on resize");
    };
    lowLevelEvents.seeking = function () {
        provider.setSeeking(true);
        OvenPlayerConsole.log("EventListener : on seeking", elVideo.currentTime);
        provider.trigger(_constants.CONTENT_SEEK, {
            position: elVideo.currentTime
        });
    };
    lowLevelEvents.seeked = function () {
        if (!provider.isSeeking()) {
            return;
        }
        OvenPlayerConsole.log("EventListener : on seeked");
        provider.setSeeking(false);
        provider.trigger(_constants.CONTENT_SEEKED);
    };

    //Fires when the video stops because it needs to buffer the next frame
    lowLevelEvents.waiting = function () {
        OvenPlayerConsole.log("EventListener : on waiting", provider.getState());
        if (provider.isSeeking()) {
            provider.setState(_constants.STATE_LOADING);
        } else if (provider.getState() === _constants.STATE_PLAYING) {
            provider.setState(_constants.STATE_STALLED);
        }
    };

    lowLevelEvents.volumechange = function () {

        OvenPlayerConsole.log("EventListener : on volumechange", Math.round(elVideo.volume * 100));
        provider.trigger(_constants.CONTENT_VOLUME, {
            volume: Math.round(elVideo.volume * 100),
            mute: elVideo.muted
        });
    };

    lowLevelEvents.error = function () {
        var code = elVideo.error && elVideo.error.code || 0;
        var errorCodeGen = {
            0: { code: _constants.PLAYER_UNKNWON_ERROR, reason: "Unknown html5 video error", message: "Unknown html5 video error" },
            1: { code: _constants.PLAYER_UNKNWON_OPERATION_ERROR, reason: "Unknown operation aborted", message: "Unknown operation aborted" },
            2: { code: _constants.PLAYER_UNKNWON_NEWWORK_ERROR, reason: "Unknown network error", message: "Unknown network error" },
            3: { code: _constants.PLAYER_UNKNWON_DECODE_ERROR, reason: "Unknown decode error", message: "Unknown decode error" },
            4: { code: _constants.PLAYER_FILE_ERROR, reason: "File could not be played", message: "File could not be played" }
        }[code] || 0;
        errorCodeGen.error = elVideo.error;

        OvenPlayerConsole.log("EventListener : on error", errorCodeGen);
        onError(errorCodeGen);
    };

    Object.keys(lowLevelEvents).forEach(function (eventName) {
        elVideo.removeEventListener(eventName, lowLevelEvents[eventName]);
        elVideo.addEventListener(eventName, lowLevelEvents[eventName]);
    });

    that.destroy = function () {
        OvenPlayerConsole.log("EventListener : destroy()");

        Object.keys(lowLevelEvents).forEach(function (eventName) {
            elVideo.removeEventListener(eventName, lowLevelEvents[eventName]);
        });
    };
    return that;
};

exports["default"] = Listener;

/***/ }),

/***/ "./src/js/api/provider/html5/Provider.js":
/*!***********************************************!*\
  !*** ./src/js/api/provider/html5/Provider.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _EventEmitter = __webpack_require__(/*! api/EventEmitter */ "./src/js/api/EventEmitter.js");

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _Listener = __webpack_require__(/*! api/provider/html5/Listener */ "./src/js/api/provider/html5/Listener.js");

var _Listener2 = _interopRequireDefault(_Listener);

var _utils = __webpack_require__(/*! api/provider/utils */ "./src/js/api/provider/utils.js");

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @brief   Core For Html5 Video.
 * @param   spec member value
 * @param   playerConfig  player config
 * @param   onExtendedLoad on load handler
 * */
/**
 * Created by hoho on 2018. 6. 27..
 */
var Provider = function Provider(spec, playerConfig, onExtendedLoad) {
    OvenPlayerConsole.log("CORE loaded. ");

    var that = {};
    (0, _EventEmitter2["default"])(that);

    var listener = (0, _Listener2["default"])(spec.extendedElement, that);
    var elVideo = (0, _utils.extractVideoElement)(spec.extendedElement);
    var posterImage = playerConfig.getConfig().image || "";
    elVideo.playbackRate = elVideo.defaultPlaybackRate = playerConfig.getDefaultPlaybackRate();

    var _load = function _load(lastPlayPosition) {
        var source = spec.sources[spec.currentSource];
        spec.framerate = source.framerate;
        if (onExtendedLoad) {
            onExtendedLoad(source, lastPlayPosition);
        } else {
            OvenPlayerConsole.log("source loaded : ", source, "lastPlayPosition : " + lastPlayPosition);
            var previousSource = elVideo.src;
            var sourceElement = document.createElement('source');

            sourceElement.src = source.file;
            var sourceChanged = sourceElement.src !== previousSource;
            if (sourceChanged) {
                elVideo.src = spec.sources[spec.currentSource].file;
                // Do not call load if src was not set. load() will cancel any active play promise.
                if (previousSource) {
                    elVideo.load();
                }
            } else if (lastPlayPosition === 0 && elVideo.currentTime > 0) {
                that.seek(lastPlayPosition);
            }
            if (lastPlayPosition > 0) {
                that.seek(lastPlayPosition);
                that.play();
            }
            /*that.trigger(CONTENT_SOURCE_CHANGED, {
                currentSource: spec.currentSource
            });*/

            if (posterImage) {
                elVideo.poster = posterImage;
            }
        }
    };

    that.getName = function () {
        return spec.name;
    };
    that.canSeek = function () {
        return spec.canSeek;
    };
    that.setCanSeek = function (canSeek) {
        spec.canSeek = canSeek;
    };
    that.isSeeking = function () {
        return spec.seeking;
    };
    that.setSeeking = function (seeking) {
        spec.seeking = seeking;
    };

    that.setState = function (newState) {
        if (spec.state !== newState) {
            var prevState = spec.state;
            switch (newState) {
                case _constants.STATE_COMPLETE:
                    that.trigger(_constants.PLAYER_COMPLETE);
                    break;
                case _constants.STATE_PAUSED:
                    that.trigger(_constants.PLAYER_PAUSE, {
                        prevState: spec.state
                    });
                    break;
                case _constants.STATE_PLAYING:
                    that.trigger(_constants.PLAYER_PLAY, {
                        prevState: spec.state
                    });
                    break;
            }
            spec.state = newState;
            that.trigger(_constants.PLAYER_STATE, {
                prevstate: prevState,
                newstate: spec.state
            });
        }
    };
    that.getState = function () {
        return spec.state;
    };
    that.setBuffer = function (newBuffer) {
        spec.buffer = newBuffer;
    };
    that.getBuffer = function () {
        return spec.buffer;
    };
    that.getDuration = function () {
        var isLive = elVideo.duration === Infinity ? true : (0, _utils.separateLive)(spec.extendedElement);
        return isLive ? Infinity : elVideo.duration;
    };
    that.getPosition = function () {
        if (!elVideo) {
            return 0;
        }
        return elVideo.currentTime;
    };
    that.setVolume = function (volume) {
        if (!elVideo) {
            return false;
        }
        elVideo.volume = volume / 100;
    };
    that.getVolume = function () {
        if (!elVideo) {
            return 0;
        }
        return elVideo.volume * 100;
    };
    that.setMute = function (state) {
        if (!elVideo) {
            return false;
        }
        if (typeof state === 'undefined') {

            elVideo.muted = !elVideo.muted;

            that.trigger(_constants.CONTENT_MUTE, {
                mute: elVideo.muted
            });
        } else {

            elVideo.muted = state;

            that.trigger(_constants.CONTENT_MUTE, {
                mute: elVideo.muted
            });
        }
        return elVideo.muted;
    };
    that.getMute = function () {
        if (!elVideo) {
            return false;
        }
        return elVideo.muted;
    };

    that.preload = function (sources, lastPlayPosition) {
        spec.sources = sources;
        spec.currentSource = (0, _utils.pickCurrentSource)(sources, spec.currentSource, playerConfig);
        _load(lastPlayPosition || 0);

        return new Promise(function (resolve, reject) {
            resolve();
        });
    };
    that.load = function (sources) {
        spec.sources = sources;
        spec.currentSource = (0, _utils.pickCurrentSource)(sources, spec.currentSource, playerConfig);
        _load(spec.sources.starttime || 0);
    };

    that.play = function () {
        if (!elVideo) {
            return false;
        }

        if (that.getState() !== _constants.STATE_PLAYING) {
            var promise = elVideo.play();
            if (promise !== undefined) {
                promise.then(function (_) {
                    // Autoplay started!
                })["catch"](function (error) {
                    //Can't play because User doesn't any interactions.
                    //Wait for User Interactions. (like click)
                    setTimeout(function () {
                        that.play();
                    }, 1000);
                });
            }
        }
    };
    that.pause = function () {
        if (!elVideo) {
            return false;
        }
        if (that.getState() === _constants.STATE_PLAYING) {
            elVideo.pause();
        }
    };
    that.seek = function (position) {
        if (!elVideo) {
            return false;
        }
        elVideo.currentTime = position;
    };
    that.setPlaybackRate = function (playbackRate) {
        if (!elVideo) {
            return false;
        }
        that.trigger(_constants.PLAYBACK_RATE_CHANGED, { playbackRate: playbackRate });
        return elVideo.playbackRate = elVideo.defaultPlaybackRate = playbackRate;
    };
    that.getPlaybackRate = function () {
        if (!elVideo) {
            return 0;
        }
        return elVideo.playbackRate;
    };

    that.getSources = function () {
        if (!elVideo) {
            return [];
        }

        return spec.sources.map(function (source, index) {
            return {
                file: source.file,
                type: source.type,
                label: source.label,
                index: index
            };
        });
    };
    that.getCurrentSource = function () {
        return spec.currentSource;
    };
    that.setCurrentSource = function (sourceIndex, needProviderChange) {
        if (spec.currentSource === sourceIndex) {
            return false;
        }

        if (sourceIndex > -1) {
            if (spec.sources && spec.sources.length > sourceIndex) {
                //that.pause();
                that.setState(_constants.STATE_IDLE);
                OvenPlayerConsole.log("source changed : " + sourceIndex);
                spec.currentSource = sourceIndex;

                that.trigger(_constants.CONTENT_SOURCE_CHANGED, {
                    currentSource: sourceIndex
                });
                playerConfig.setSourceLabel(spec.sources[sourceIndex].label);
                //spec.currentQuality = sourceIndex;
                if (needProviderChange) {

                    _load(elVideo.currentTime || 0);
                }
                return spec.currentSource;
            }
        }
    };

    that.getQualityLevels = function () {
        if (!elVideo) {
            return [];
        }
        return spec.qualityLevels;
    };
    that.getCurrentQuality = function () {
        if (!elVideo) {
            return null;
        }
        return spec.currentQuality;
    };
    that.setCurrentQuality = function (qualityIndex) {
        //Do nothing
    };
    that.isAutoQuality = function () {
        //Do nothing
    };
    that.setAutoQuality = function (isAuto) {
        //Do nothing
    };

    that.getFramerate = function () {
        return spec.framerate;
    };
    that.setFramerate = function (framerate) {
        return spec.framerate = framerate;
    };
    that.seekFrame = function (frameCount) {
        var fps = spec.framerate;
        var currentFrames = elVideo.currentTime * fps;
        var newPosition = (currentFrames + frameCount) / fps;
        newPosition = newPosition + 0.00001; // FIXES A SAFARI SEEK ISSUE. myVdieo.currentTime = 0.04 would give SMPTE 00:00:00:00 wheras it should give 00:00:00:01

        that.pause();
        that.seek(newPosition);
    };

    that.stop = function () {
        if (!elVideo) {
            return false;
        }
        OvenPlayerConsole.log("CORE : stop() ");
        elVideo.removeAttribute('preload');
        elVideo.removeAttribute('src');
        while (elVideo.firstChild) {
            elVideo.removeChild(elVideo.firstChild);
        }
        that.pause();
        that.setState(_constants.STATE_IDLE);
    };

    that.destroy = function () {
        if (!elVideo) {
            return false;
        }
        that.stop();
        listener.destroy();
        //elVideo.remove();
        that.off();
        OvenPlayerConsole.log("CORE : destroy() player stop, listener, event destroied");
    };

    //XXX : I hope using es6 classes. but I think to occur problem from Old IE. Then I choice function inherit. Finally using super function is so difficult.
    // use : let super_destroy  = that.super('destroy'); ... super_destroy();
    that["super"] = function (name) {
        var method = that[name];
        return function () {
            return method.apply(that, arguments);
        };
    };
    return that;
};

exports["default"] = Provider;

/***/ }),

/***/ "./src/js/api/provider/utils.js":
/*!**************************************!*\
  !*** ./src/js/api/provider/utils.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.pickCurrentSource = exports.errorTrigger = exports.separateLive = exports.extractVideoElement = undefined;

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

var _underscore = __webpack_require__(/*! utils/underscore */ "./src/js/utils/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Created by hoho on 2018. 11. 12..
 */
var extractVideoElement = exports.extractVideoElement = function extractVideoElement(extendedElement) {
    if (_underscore2["default"].isElement(extendedElement)) {
        return extendedElement;
    }
    if (extendedElement.getVideoElement) {
        return extendedElement.getVideoElement();
    } else if (extendedElement.media) {
        return extendedElement.media;
    }
    return null;
};

var separateLive = exports.separateLive = function separateLive(extendedElement) {
    //ToDo : You consider hlsjs. But not now because we don't support hlsjs.

    if (extendedElement.isDynamic) {
        return extendedElement.isDynamic();
    } else {
        return false;
    }
};

var errorTrigger = exports.errorTrigger = function errorTrigger(error, provider) {
    provider.setState(_constants.STATE_ERROR);
    provider.pause();
    provider.trigger(_constants.ERROR, error);
};

var pickCurrentSource = exports.pickCurrentSource = function pickCurrentSource(sources, currentSource, playerConfig) {
    var sourceIndex = Math.max(0, currentSource);
    var label = "";
    if (sources) {
        for (var i = 0; i < sources.length; i++) {
            if (sources[i]["default"]) {
                sourceIndex = i;
            }
            if (playerConfig.getSourceLabel() && sources[i].label === playerConfig.getSourceLabel()) {
                return i;
            }
        }
    }
    return sourceIndex;
};

/***/ }),

/***/ "./src/js/utils/browser.js":
/*!*********************************!*\
  !*** ./src/js/utils/browser.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Created by hoho on 2018. 8. 24..
 */

var getBrowser = exports.getBrowser = function getBrowser() {
    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
        return 'opera';
    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
        return 'chrome';
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
        return 'safari';
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
        return 'firefox';
    } else if (navigator.userAgent.indexOf("MSIE") != -1) {
        var msie = navigator.userAgent.indexOf("MSIE");
        /*if(!!document.documentMode == true ){
            return 'ie';
        }else if(!!navigator.userAgent.match(/Trident.*rv\:11\./)){
            if (!isNaN(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))))) {
                return 'ie';
            }else{
                return 'unknown';
            }
        }else{
            return 'unknown';
        }*/
        var ie = function () {

            var undef,
                v = 3,
                div = document.createElement('div'),
                all = div.getElementsByTagName('i');

            while (div.innerHTML = '<!--[if gt IE ' + ++v + ']><i></i><![endif]-->', all[0]) {}

            return v > 4 ? v : undef;
        }();
        if (ie < 9) {
            return 'oldIE';
        } else {
            return 'modernIE';
        }
    } else {
        return 'unknown';
    }
};

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvYXNzZXRzL092ZW5QbGF5ZXJGbGFzaC5zd2YiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2FwaS9tZWRpYS9NYW5hZ2VyLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9hcGkvcHJvdmlkZXIvaHRtbDUvTGlzdGVuZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2FwaS9wcm92aWRlci9odG1sNS9Qcm92aWRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvYXBpL3Byb3ZpZGVyL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy91dGlscy9icm93c2VyLmpzIl0sIm5hbWVzIjpbIk1hbmFnZXIiLCJjb250YWluZXIiLCJwcm92aWRlclR5cGUiLCJ0aGF0Iiwicm9vdElkIiwiZ2V0QXR0cmlidXRlIiwibWVkaWFFbGVtZW50IiwiYnJvd3NlclR5cGUiLCJPdmVuUGxheWVyQ29uc29sZSIsImxvZyIsImNyZWF0ZU1lZGlhRWxlbWVudCIsIlBST1ZJREVSX1JUTVAiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzZXRBdHRyaWJ1dGUiLCJhcHBlbmRDaGlsZCIsIm1vdmllIiwiZmxhc2h2YXJzIiwiYWxsb3dzY3JpcHRhY2Nlc3MiLCJhbGxvd2Z1bGxzY3JlZW4iLCJxdWFsaXR5IiwibmFtZSIsIm1lbnUiLCJxdWFsIiwiYmdjb2xvciIsIlNXRnBhdGgiLCJjcmVhdGUiLCJkZXN0cm95IiwicmVtb3ZlQ2hpbGQiLCJMaXN0ZW5lciIsImV4dGVuZGVkRWxlbWVudCIsInByb3ZpZGVyIiwibG93TGV2ZWxFdmVudHMiLCJlbFZpZGVvIiwiYmV0d2VlbiIsIm51bSIsIm1pbiIsIm1heCIsIk1hdGgiLCJvbkVycm9yIiwiZXJyb3IiLCJzZXRTdGF0ZSIsIlNUQVRFX0VSUk9SIiwicGF1c2UiLCJ0cmlnZ2VyIiwiRVJST1IiLCJjYW5wbGF5Iiwic2V0Q2FuU2VlayIsIkNPTlRFTlRfQlVGRkVSX0ZVTEwiLCJkdXJhdGlvbmNoYW5nZSIsInByb2dyZXNzIiwiZW5kZWQiLCJnZXRTdGF0ZSIsIlNUQVRFX0lETEUiLCJTVEFURV9DT01QTEVURSIsIkNPTlRFTlRfQ09NUExFVEUiLCJsb2FkZWRkYXRhIiwibG9hZGVkbWV0YWRhdGEiLCJpc0xpdmUiLCJkdXJhdGlvbiIsIkluZmluaXR5Iiwic291cmNlcyIsImdldFNvdXJjZXMiLCJzb3VyY2VJbmRleCIsImdldEN1cnJlbnRTb3VyY2UiLCJ0eXBlIiwibWV0YWRhdGEiLCJDT05URU5UX01FVEEiLCJjdXJyZW50VGltZSIsIlNUQVRFX1BBVVNFRCIsInBsYXkiLCJwYXVzZWQiLCJTVEFURV9QTEFZSU5HIiwiU1RBVEVfTE9BRElORyIsInBsYXlpbmciLCJ0aW1lUmFuZ2VzIiwiYnVmZmVyZWQiLCJwb3NpdGlvbiIsImxlbmd0aCIsImVuZCIsInNldEJ1ZmZlciIsIkNPTlRFTlRfQlVGRkVSIiwiYnVmZmVyUGVyY2VudCIsInN0YWxsZWQiLCJ0aW1ldXBkYXRlIiwiaXNOYU4iLCJpc1NlZWtpbmciLCJDT05URU5UX1RJTUUiLCJyZXNpemUiLCJzZWVraW5nIiwic2V0U2Vla2luZyIsIkNPTlRFTlRfU0VFSyIsInNlZWtlZCIsIkNPTlRFTlRfU0VFS0VEIiwid2FpdGluZyIsIlNUQVRFX1NUQUxMRUQiLCJ2b2x1bWVjaGFuZ2UiLCJyb3VuZCIsInZvbHVtZSIsIkNPTlRFTlRfVk9MVU1FIiwibXV0ZSIsIm11dGVkIiwiY29kZSIsImVycm9yQ29kZUdlbiIsIlBMQVlFUl9VTktOV09OX0VSUk9SIiwicmVhc29uIiwibWVzc2FnZSIsIlBMQVlFUl9VTktOV09OX09QRVJBVElPTl9FUlJPUiIsIlBMQVlFUl9VTktOV09OX05FV1dPUktfRVJST1IiLCJQTEFZRVJfVU5LTldPTl9ERUNPREVfRVJST1IiLCJQTEFZRVJfRklMRV9FUlJPUiIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImV2ZW50TmFtZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJQcm92aWRlciIsInNwZWMiLCJwbGF5ZXJDb25maWciLCJvbkV4dGVuZGVkTG9hZCIsImxpc3RlbmVyIiwicG9zdGVySW1hZ2UiLCJnZXRDb25maWciLCJpbWFnZSIsInBsYXliYWNrUmF0ZSIsImRlZmF1bHRQbGF5YmFja1JhdGUiLCJnZXREZWZhdWx0UGxheWJhY2tSYXRlIiwiX2xvYWQiLCJsYXN0UGxheVBvc2l0aW9uIiwic291cmNlIiwiY3VycmVudFNvdXJjZSIsImZyYW1lcmF0ZSIsInByZXZpb3VzU291cmNlIiwic3JjIiwic291cmNlRWxlbWVudCIsImZpbGUiLCJzb3VyY2VDaGFuZ2VkIiwibG9hZCIsInNlZWsiLCJwb3N0ZXIiLCJnZXROYW1lIiwiY2FuU2VlayIsIm5ld1N0YXRlIiwic3RhdGUiLCJwcmV2U3RhdGUiLCJQTEFZRVJfQ09NUExFVEUiLCJQTEFZRVJfUEFVU0UiLCJQTEFZRVJfUExBWSIsIlBMQVlFUl9TVEFURSIsInByZXZzdGF0ZSIsIm5ld3N0YXRlIiwibmV3QnVmZmVyIiwiYnVmZmVyIiwiZ2V0QnVmZmVyIiwiZ2V0RHVyYXRpb24iLCJnZXRQb3NpdGlvbiIsInNldFZvbHVtZSIsImdldFZvbHVtZSIsInNldE11dGUiLCJDT05URU5UX01VVEUiLCJnZXRNdXRlIiwicHJlbG9hZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic3RhcnR0aW1lIiwicHJvbWlzZSIsInVuZGVmaW5lZCIsInRoZW4iLCJzZXRUaW1lb3V0Iiwic2V0UGxheWJhY2tSYXRlIiwiUExBWUJBQ0tfUkFURV9DSEFOR0VEIiwiZ2V0UGxheWJhY2tSYXRlIiwibWFwIiwiaW5kZXgiLCJsYWJlbCIsInNldEN1cnJlbnRTb3VyY2UiLCJuZWVkUHJvdmlkZXJDaGFuZ2UiLCJDT05URU5UX1NPVVJDRV9DSEFOR0VEIiwic2V0U291cmNlTGFiZWwiLCJnZXRRdWFsaXR5TGV2ZWxzIiwicXVhbGl0eUxldmVscyIsImdldEN1cnJlbnRRdWFsaXR5IiwiY3VycmVudFF1YWxpdHkiLCJzZXRDdXJyZW50UXVhbGl0eSIsInF1YWxpdHlJbmRleCIsImlzQXV0b1F1YWxpdHkiLCJzZXRBdXRvUXVhbGl0eSIsImlzQXV0byIsImdldEZyYW1lcmF0ZSIsInNldEZyYW1lcmF0ZSIsInNlZWtGcmFtZSIsImZyYW1lQ291bnQiLCJmcHMiLCJjdXJyZW50RnJhbWVzIiwibmV3UG9zaXRpb24iLCJzdG9wIiwicmVtb3ZlQXR0cmlidXRlIiwiZmlyc3RDaGlsZCIsIm9mZiIsIm1ldGhvZCIsImFwcGx5IiwiYXJndW1lbnRzIiwiZXh0cmFjdFZpZGVvRWxlbWVudCIsIl8iLCJpc0VsZW1lbnQiLCJnZXRWaWRlb0VsZW1lbnQiLCJtZWRpYSIsInNlcGFyYXRlTGl2ZSIsImlzRHluYW1pYyIsImVycm9yVHJpZ2dlciIsInBpY2tDdXJyZW50U291cmNlIiwiaSIsImdldFNvdXJjZUxhYmVsIiwiZ2V0QnJvd3NlciIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImluZGV4T2YiLCJtc2llIiwiaWUiLCJ1bmRlZiIsInYiLCJkaXYiLCJhbGwiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImlubmVySFRNTCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGlCQUFpQixxQkFBdUIseUI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0t4Qzs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsVUFBVSxTQUFWQSxPQUFVLENBQVNDLFNBQVQsRUFBb0JDLFlBQXBCLEVBQWlDO0FBQzdDLFFBQU1DLE9BQU8sRUFBYjtBQUNBLFFBQUlDLFNBQVNILFVBQVVJLFlBQVYsQ0FBdUIsZ0JBQXZCLENBQWI7QUFDQSxRQUFJQyxlQUFlLEVBQW5CO0FBQ0EsUUFBSUMsY0FBYywwQkFBbEI7O0FBRUFDLHNCQUFrQkMsR0FBbEIsQ0FBc0Isd0NBQXVDRixXQUE3RDtBQUNBLFFBQU1HLHFCQUFxQixTQUFyQkEsa0JBQXFCLEdBQVU7QUFDakMsWUFBR1IsaUJBQWlCUyx3QkFBcEIsRUFBa0M7QUFDOUJMLDJCQUFlTSxTQUFTQyxhQUFULENBQXVCLE9BQXZCLENBQWY7QUFDQVAseUJBQWFRLFlBQWIsQ0FBMEIsdUJBQTFCLEVBQW1ELEVBQW5EO0FBQ0FSLHlCQUFhUSxZQUFiLENBQTBCLG9CQUExQixFQUFnRCxFQUFoRDtBQUNBUix5QkFBYVEsWUFBYixDQUEwQixhQUExQixFQUF5QyxFQUF6QztBQUNBYixzQkFBVWMsV0FBVixDQUFzQlQsWUFBdEI7QUFFSCxTQVBELE1BT0s7QUFDRCxnQkFBSVUsY0FBSjtBQUFBLGdCQUFXQyxrQkFBWDtBQUFBLGdCQUFzQkMsMEJBQXRCO0FBQUEsZ0JBQXlDQyx3QkFBekM7QUFBQSxnQkFBMERDLGdCQUExRDtBQUFBLGdCQUFtRUMsYUFBbkU7QUFBQSxnQkFBeUVDLGFBQXpFO0FBQUEsZ0JBQStFQyxhQUEvRTtBQUFBLGdCQUFxRkMsZ0JBQXJGO0FBQ0FSLG9CQUFRSixTQUFTQyxhQUFULENBQXVCLE9BQXZCLENBQVI7QUFDQUcsa0JBQU1GLFlBQU4sQ0FBbUIsTUFBbkIsRUFBMkIsT0FBM0I7QUFDQUUsa0JBQU1GLFlBQU4sQ0FBbUIsT0FBbkIsRUFBNEJXLDRCQUE1Qjs7QUFFQVIsd0JBQVlMLFNBQVNDLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBWjtBQUNBSSxzQkFBVUgsWUFBVixDQUF1QixNQUF2QixFQUErQixXQUEvQjtBQUNBO0FBQ0FHLHNCQUFVSCxZQUFWLENBQXVCLE9BQXZCLEVBQWdDLGNBQVlWLE1BQTVDOztBQUVBYyxnQ0FBb0JOLFNBQVNDLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBcEI7QUFDQUssOEJBQWtCSixZQUFsQixDQUErQixNQUEvQixFQUF1QyxtQkFBdkM7QUFDQUksOEJBQWtCSixZQUFsQixDQUErQixPQUEvQixFQUF3QyxRQUF4Qzs7QUFFQUssOEJBQWtCUCxTQUFTQyxhQUFULENBQXVCLE9BQXZCLENBQWxCO0FBQ0FNLDRCQUFnQkwsWUFBaEIsQ0FBNkIsTUFBN0IsRUFBcUMsaUJBQXJDO0FBQ0FLLDRCQUFnQkwsWUFBaEIsQ0FBNkIsT0FBN0IsRUFBc0MsTUFBdEM7O0FBRUFNLHNCQUFVUixTQUFTQyxhQUFULENBQXVCLE9BQXZCLENBQVY7QUFDQU8sb0JBQVFOLFlBQVIsQ0FBcUIsTUFBckIsRUFBNkIsU0FBN0I7QUFDQU0sb0JBQVFOLFlBQVIsQ0FBcUIsT0FBckIsRUFBOEIsUUFBOUI7O0FBRUFPLG1CQUFPVCxTQUFTQyxhQUFULENBQXVCLE9BQXZCLENBQVA7QUFDQVEsaUJBQUtQLFlBQUwsQ0FBa0IsTUFBbEIsRUFBMEIsTUFBMUI7QUFDQU8saUJBQUtQLFlBQUwsQ0FBa0IsT0FBbEIsRUFBMkJWLFNBQU8sUUFBbEM7O0FBRUFrQixtQkFBT1YsU0FBU0MsYUFBVCxDQUF1QixPQUF2QixDQUFQO0FBQ0FTLGlCQUFLUixZQUFMLENBQWtCLE1BQWxCLEVBQTBCLE1BQTFCO0FBQ0FRLGlCQUFLUixZQUFMLENBQWtCLE9BQWxCLEVBQTJCLE9BQTNCOztBQUVBUyxtQkFBT1gsU0FBU0MsYUFBVCxDQUF1QixPQUF2QixDQUFQO0FBQ0FVLGlCQUFLVCxZQUFMLENBQWtCLE1BQWxCLEVBQTBCLFNBQTFCO0FBQ0FTLGlCQUFLVCxZQUFMLENBQWtCLE9BQWxCLEVBQTJCLE1BQTNCOztBQUVBVSxzQkFBVVosU0FBU0MsYUFBVCxDQUF1QixPQUF2QixDQUFWO0FBQ0FXLG9CQUFRVixZQUFSLENBQXFCLE1BQXJCLEVBQTZCLFNBQTdCO0FBQ0FVLG9CQUFRVixZQUFSLENBQXFCLE9BQXJCLEVBQThCLFNBQTlCOztBQUVBUiwyQkFBZU0sU0FBU0MsYUFBVCxDQUF1QixRQUF2QixDQUFmO0FBQ0FQLHlCQUFhUSxZQUFiLENBQTBCLElBQTFCLEVBQWdDVixTQUFPLFFBQXZDO0FBQ0FFLHlCQUFhUSxZQUFiLENBQTBCLE1BQTFCLEVBQWtDVixTQUFPLFFBQXpDO0FBQ0FFLHlCQUFhUSxZQUFiLENBQTBCLE9BQTFCLEVBQW1DLE1BQW5DO0FBQ0FSLHlCQUFhUSxZQUFiLENBQTBCLFFBQTFCLEVBQW9DLE1BQXBDOztBQUVBLGdCQUFHUCxnQkFBZ0IsT0FBbkIsRUFBMkI7QUFDdkJELDZCQUFhUSxZQUFiLENBQTBCLE1BQTFCLEVBQWtDVyw0QkFBbEM7QUFDQW5CLDZCQUFhUSxZQUFiLENBQTBCLE1BQTFCLEVBQWtDLCtCQUFsQztBQUNILGFBSEQsTUFHSztBQUNEUiw2QkFBYVEsWUFBYixDQUEwQixTQUExQixFQUFxQyw0Q0FBckM7O0FBRUFSLDZCQUFhUyxXQUFiLENBQXlCQyxLQUF6QjtBQUNIO0FBQ0RWLHlCQUFhUyxXQUFiLENBQXlCUyxPQUF6QjtBQUNBbEIseUJBQWFTLFdBQWIsQ0FBeUJRLElBQXpCO0FBQ0FqQix5QkFBYVMsV0FBYixDQUF5QkksZUFBekI7QUFDQWIseUJBQWFTLFdBQWIsQ0FBeUJHLGlCQUF6QjtBQUNBWix5QkFBYVMsV0FBYixDQUF5QkUsU0FBekI7O0FBRUFoQixzQkFBVWMsV0FBVixDQUFzQlQsWUFBdEI7QUFDSDtBQUNELGVBQU9BLFlBQVA7QUFDSCxLQXRFRDs7QUF3RUFILFNBQUt1QixNQUFMLEdBQWMsWUFBSztBQUNmbEIsMEJBQWtCQyxHQUFsQixDQUFzQiw4QkFBdEI7QUFDQSxZQUFHSCxZQUFILEVBQWdCO0FBQ1pILGlCQUFLd0IsT0FBTDtBQUNIO0FBQ0QsZUFBT2pCLG9CQUFQO0FBQ0gsS0FORDs7QUFRQVAsU0FBS3dCLE9BQUwsR0FBZSxZQUFLO0FBQ2hCbkIsMEJBQWtCQyxHQUFsQixDQUFzQiw4QkFBdEI7QUFDQVIsa0JBQVUyQixXQUFWLENBQXNCdEIsWUFBdEI7QUFDQUEsdUJBQWUsSUFBZjtBQUNILEtBSkQ7O0FBTUEsV0FBT0gsSUFBUDtBQUNILENBOUZELEMsQ0FUQTs7Ozs7cUJBeUdlSCxPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6R2Y7O0FBMkJBOztBQUdBOzs7Ozs7QUFPQSxJQUFNNkIsV0FBVyxTQUFYQSxRQUFXLENBQVNDLGVBQVQsRUFBMEJDLFFBQTFCLEVBQW1DO0FBQ2hELFFBQU1DLGlCQUFpQixFQUF2Qjs7QUFFQXhCLHNCQUFrQkMsR0FBbEIsQ0FBc0IsdUJBQXRCLEVBQThDcUIsZUFBOUMsRUFBK0RDLFFBQS9EO0FBQ0EsUUFBTTVCLE9BQU8sRUFBYjs7QUFFQSxRQUFJOEIsVUFBVSxnQ0FBb0JILGVBQXBCLENBQWQ7QUFDQSxRQUFNSSxVQUFVLFNBQVZBLE9BQVUsQ0FBVUMsR0FBVixFQUFlQyxHQUFmLEVBQW9CQyxHQUFwQixFQUF5QjtBQUNyQyxlQUFPQyxLQUFLRCxHQUFMLENBQVNDLEtBQUtGLEdBQUwsQ0FBU0QsR0FBVCxFQUFjRSxHQUFkLENBQVQsRUFBNkJELEdBQTdCLENBQVA7QUFDSCxLQUZEO0FBR0EsUUFBTUcsVUFBVSxTQUFWQSxPQUFVLENBQVNDLEtBQVQsRUFBZTtBQUMzQlQsaUJBQVNVLFFBQVQsQ0FBa0JDLHNCQUFsQjtBQUNBWCxpQkFBU1ksS0FBVDs7QUFFQTtBQUNBWixpQkFBU2EsT0FBVCxDQUFpQkMsZ0JBQWpCLEVBQXdCTCxLQUF4QjtBQUNILEtBTkQ7O0FBUUE7QUFDQVIsbUJBQWVjLE9BQWYsR0FBeUIsWUFBTTtBQUMzQmYsaUJBQVNnQixVQUFULENBQW9CLElBQXBCO0FBQ0FoQixpQkFBU2EsT0FBVCxDQUFpQkksOEJBQWpCO0FBQ0F4QywwQkFBa0JDLEdBQWxCLENBQXNCLDRCQUF0QjtBQUNILEtBSkQ7QUFLQTtBQUNBdUIsbUJBQWVpQixjQUFmLEdBQWdDLFlBQU07QUFDbENqQix1QkFBZWtCLFFBQWY7QUFDQTFDLDBCQUFrQkMsR0FBbEIsQ0FBc0IsbUNBQXRCO0FBQ0gsS0FIRDtBQUlBO0FBQ0F1QixtQkFBZW1CLEtBQWYsR0FBdUIsWUFBTTtBQUN6QjNDLDBCQUFrQkMsR0FBbEIsQ0FBc0IsMEJBQXRCO0FBQ0EsWUFBR3NCLFNBQVNxQixRQUFULE1BQXVCQyxxQkFBdkIsSUFBcUN0QixTQUFTcUIsUUFBVCxNQUF1QkUseUJBQS9ELEVBQThFO0FBQzFFdkIscUJBQVNhLE9BQVQsQ0FBaUJXLDJCQUFqQjtBQUNBeEIscUJBQVNVLFFBQVQsQ0FBa0JhLHlCQUFsQjtBQUNIO0FBQ0osS0FORDtBQU9BO0FBQ0F0QixtQkFBZXdCLFVBQWYsR0FBNEIsWUFBTTtBQUM5QjtBQUNBOzs7Ozs7O0FBT0FoRCwwQkFBa0JDLEdBQWxCLENBQXNCLCtCQUF0QjtBQUNILEtBVkQ7QUFXQTtBQUNBdUIsbUJBQWV5QixjQUFmLEdBQWdDLFlBQU07QUFDbEMsWUFBSUMsU0FBVXpCLFFBQVEwQixRQUFSLEtBQXFCQyxRQUF0QixHQUFrQyxJQUFsQyxHQUF5Qyx5QkFBYTlCLGVBQWIsQ0FBdEQ7QUFDQSxZQUFJK0IsVUFBVTlCLFNBQVMrQixVQUFULEVBQWQ7QUFDQSxZQUFJQyxjQUFjaEMsU0FBU2lDLGdCQUFULEVBQWxCO0FBQ0EsWUFBSUMsT0FBT0YsY0FBYyxDQUFDLENBQWYsR0FBbUJGLFFBQVFFLFdBQVIsRUFBcUJFLElBQXhDLEdBQStDLEVBQTFEO0FBQ0EsWUFBSUMsV0FBVztBQUNYUCxzQkFBVUQsU0FBVUUsUUFBVixHQUFxQjNCLFFBQVEwQixRQUQ1QjtBQUVYTSxrQkFBTUE7QUFGSyxTQUFmOztBQUtBekQsMEJBQWtCQyxHQUFsQixDQUFzQixtQ0FBdEIsRUFBMkR5RCxRQUEzRDtBQUNBbkMsaUJBQVNhLE9BQVQsQ0FBaUJ1Qix1QkFBakIsRUFBK0JELFFBQS9CO0FBQ0gsS0FaRDtBQWFBO0FBQ0FsQyxtQkFBZVcsS0FBZixHQUF1QixZQUFNO0FBQ3pCLFlBQUdaLFNBQVNxQixRQUFULE9BQXdCRSx5QkFBeEIsSUFBeUN2QixTQUFTcUIsUUFBVCxPQUF3QlYsc0JBQXBFLEVBQWdGO0FBQzVFLG1CQUFPLEtBQVA7QUFDSDtBQUNELFlBQUdULFFBQVFrQixLQUFYLEVBQWlCO0FBQ2IsbUJBQU8sS0FBUDtBQUNIO0FBQ0QsWUFBR2xCLFFBQVFPLEtBQVgsRUFBaUI7QUFDYixtQkFBTyxLQUFQO0FBQ0g7QUFDRCxZQUFHUCxRQUFRbUMsV0FBUixLQUF3Qm5DLFFBQVEwQixRQUFuQyxFQUE0QztBQUN4QyxtQkFBTyxLQUFQO0FBQ0g7QUFDRG5ELDBCQUFrQkMsR0FBbEIsQ0FBc0IsMEJBQXRCO0FBQ0FzQixpQkFBU1UsUUFBVCxDQUFrQjRCLHVCQUFsQjtBQUNILEtBZkQ7QUFnQkE7QUFDQXJDLG1CQUFlc0MsSUFBZixHQUFzQixZQUFNO0FBQ3hCLFlBQUksQ0FBQ3JDLFFBQVFzQyxNQUFULElBQW1CeEMsU0FBU3FCLFFBQVQsT0FBd0JvQix3QkFBL0MsRUFBOEQ7QUFDMURoRSw4QkFBa0JDLEdBQWxCLENBQXNCLHlCQUF0QjtBQUNBc0IscUJBQVNVLFFBQVQsQ0FBa0JnQyx3QkFBbEI7QUFDSDtBQUVKLEtBTkQ7QUFPQTtBQUNBekMsbUJBQWUwQyxPQUFmLEdBQXlCLFlBQU07QUFDM0JsRSwwQkFBa0JDLEdBQWxCLENBQXNCLDRCQUF0QjtBQUNBc0IsaUJBQVNVLFFBQVQsQ0FBa0IrQix3QkFBbEI7QUFDQTtBQUNILEtBSkQ7QUFLQTtBQUNBeEMsbUJBQWVrQixRQUFmLEdBQTBCLFlBQU07QUFDNUIsWUFBSXlCLGFBQWExQyxRQUFRMkMsUUFBekI7QUFDQSxZQUFHLENBQUNELFVBQUosRUFBZ0I7QUFDWixtQkFBTyxLQUFQO0FBQ0g7O0FBRUQsWUFBSWhCLFdBQVcxQixRQUFRMEIsUUFBdkI7QUFBQSxZQUFpQ2tCLFdBQVc1QyxRQUFRbUMsV0FBcEQ7QUFDQSxZQUFJUSxXQUFXMUMsUUFBUyxDQUFDeUMsV0FBV0csTUFBWCxHQUFtQixDQUFuQixHQUF1QkgsV0FBV0ksR0FBWCxDQUFlSixXQUFXRyxNQUFYLEdBQW9CLENBQW5DLENBQXZCLEdBQStELENBQWhFLElBQXNFbkIsUUFBL0UsRUFBeUYsQ0FBekYsRUFBNEYsQ0FBNUYsQ0FBZjs7QUFFQW5ELDBCQUFrQkMsR0FBbEIsQ0FBc0IsNkJBQXRCLEVBQXFEbUUsV0FBUyxHQUE5RDs7QUFFQTdDLGlCQUFTaUQsU0FBVCxDQUFtQkosV0FBUyxHQUE1QjtBQUNBN0MsaUJBQVNhLE9BQVQsQ0FBaUJxQyx5QkFBakIsRUFBaUM7QUFDN0JDLDJCQUFlTixXQUFTLEdBREs7QUFFN0JDLHNCQUFXQSxRQUZrQjtBQUc3QmxCLHNCQUFVQTtBQUhtQixTQUFqQztBQUtILEtBakJEO0FBa0JBO0FBQ0EzQixtQkFBZW1ELE9BQWYsR0FBeUIsWUFBTTtBQUMzQjNFLDBCQUFrQkMsR0FBbEIsQ0FBc0IsMEJBQXRCO0FBQ0gsS0FGRDtBQUdBO0FBQ0F1QixtQkFBZW9ELFVBQWYsR0FBNEIsWUFBTTtBQUM5QixZQUFNUCxXQUFXNUMsUUFBUW1DLFdBQXpCO0FBQ0EsWUFBTVQsV0FBVzFCLFFBQVEwQixRQUF6QjtBQUNBLFlBQUkwQixNQUFNMUIsUUFBTixDQUFKLEVBQXFCO0FBQ2pCO0FBQ0g7O0FBRUQsWUFBRyxDQUFDNUIsU0FBU3VELFNBQVQsRUFBRCxJQUF5QixDQUFDckQsUUFBUXNDLE1BQXJDLEVBQTRDO0FBQ3hDeEMscUJBQVNVLFFBQVQsQ0FBa0IrQix3QkFBbEI7QUFDSDtBQUNEOzs7O0FBSUEsWUFBSXpDLFNBQVNxQixRQUFULE9BQXdCb0Isd0JBQXhCLElBQXlDekMsU0FBU3VELFNBQVQsRUFBN0MsRUFBbUU7QUFDL0R2RCxxQkFBU2EsT0FBVCxDQUFpQjJDLHVCQUFqQixFQUErQjtBQUMzQlYsMEJBQVVBLFFBRGlCO0FBRTNCbEIsMEJBQVVBO0FBRmlCLGFBQS9CO0FBSUg7QUFFSixLQXJCRDtBQXNCQTNCLG1CQUFld0QsTUFBZixHQUF3QixZQUFNO0FBQzFCaEYsMEJBQWtCQyxHQUFsQixDQUFzQiwyQkFBdEI7QUFDSCxLQUZEO0FBR0F1QixtQkFBZXlELE9BQWYsR0FBeUIsWUFBTTtBQUMzQjFELGlCQUFTMkQsVUFBVCxDQUFvQixJQUFwQjtBQUNBbEYsMEJBQWtCQyxHQUFsQixDQUFzQiw0QkFBdEIsRUFBb0R3QixRQUFRbUMsV0FBNUQ7QUFDQXJDLGlCQUFTYSxPQUFULENBQWlCK0MsdUJBQWpCLEVBQThCO0FBQzFCZCxzQkFBVzVDLFFBQVFtQztBQURPLFNBQTlCO0FBR0gsS0FORDtBQU9BcEMsbUJBQWU0RCxNQUFmLEdBQXdCLFlBQU07QUFDMUIsWUFBRyxDQUFDN0QsU0FBU3VELFNBQVQsRUFBSixFQUF5QjtBQUNyQjtBQUNIO0FBQ0Q5RSwwQkFBa0JDLEdBQWxCLENBQXNCLDJCQUF0QjtBQUNBc0IsaUJBQVMyRCxVQUFULENBQW9CLEtBQXBCO0FBQ0EzRCxpQkFBU2EsT0FBVCxDQUFpQmlELHlCQUFqQjtBQUNILEtBUEQ7O0FBU0E7QUFDQTdELG1CQUFlOEQsT0FBZixHQUF5QixZQUFNO0FBQzNCdEYsMEJBQWtCQyxHQUFsQixDQUFzQiw0QkFBdEIsRUFBb0RzQixTQUFTcUIsUUFBVCxFQUFwRDtBQUNBLFlBQUdyQixTQUFTdUQsU0FBVCxFQUFILEVBQXdCO0FBQ3BCdkQscUJBQVNVLFFBQVQsQ0FBa0JnQyx3QkFBbEI7QUFDSCxTQUZELE1BRU0sSUFBRzFDLFNBQVNxQixRQUFULE9BQXdCb0Isd0JBQTNCLEVBQXlDO0FBQzNDekMscUJBQVNVLFFBQVQsQ0FBa0JzRCx3QkFBbEI7QUFDSDtBQUNKLEtBUEQ7O0FBU0EvRCxtQkFBZWdFLFlBQWYsR0FBOEIsWUFBTTs7QUFFaEN4RiwwQkFBa0JDLEdBQWxCLENBQXNCLGlDQUF0QixFQUF5RDZCLEtBQUsyRCxLQUFMLENBQVdoRSxRQUFRaUUsTUFBUixHQUFpQixHQUE1QixDQUF6RDtBQUNBbkUsaUJBQVNhLE9BQVQsQ0FBaUJ1RCx5QkFBakIsRUFBaUM7QUFDN0JELG9CQUFRNUQsS0FBSzJELEtBQUwsQ0FBV2hFLFFBQVFpRSxNQUFSLEdBQWlCLEdBQTVCLENBRHFCO0FBRTdCRSxrQkFBTW5FLFFBQVFvRTtBQUZlLFNBQWpDO0FBSUgsS0FQRDs7QUFTQXJFLG1CQUFlUSxLQUFmLEdBQXVCLFlBQU07QUFDekIsWUFBTThELE9BQVFyRSxRQUFRTyxLQUFSLElBQWlCUCxRQUFRTyxLQUFSLENBQWM4RCxJQUFoQyxJQUF5QyxDQUF0RDtBQUNBLFlBQU1DLGVBQWdCO0FBQ2xCLGVBQUcsRUFBQ0QsTUFBT0UsK0JBQVIsRUFBOEJDLFFBQVMsMkJBQXZDLEVBQW9FQyxTQUFVLDJCQUE5RSxFQURlO0FBRWxCLGVBQUcsRUFBQ0osTUFBT0sseUNBQVIsRUFBd0NGLFFBQVMsMkJBQWpELEVBQThFQyxTQUFVLDJCQUF4RixFQUZlO0FBR2xCLGVBQUcsRUFBQ0osTUFBT00sdUNBQVIsRUFBc0NILFFBQVMsdUJBQS9DLEVBQXdFQyxTQUFVLHVCQUFsRixFQUhlO0FBSWxCLGVBQUcsRUFBQ0osTUFBT08sc0NBQVIsRUFBcUNKLFFBQVMsc0JBQTlDLEVBQXNFQyxTQUFVLHNCQUFoRixFQUplO0FBS2xCLGVBQUcsRUFBQ0osTUFBT1EsNEJBQVIsRUFBMkJMLFFBQVMsMEJBQXBDLEVBQWdFQyxTQUFVLDBCQUExRTtBQUxlLFVBTXBCSixJQU5vQixLQU1iLENBTlQ7QUFPQUMscUJBQWEvRCxLQUFiLEdBQXFCUCxRQUFRTyxLQUE3Qjs7QUFFQWhDLDBCQUFrQkMsR0FBbEIsQ0FBc0IsMEJBQXRCLEVBQWtEOEYsWUFBbEQ7QUFDQWhFLGdCQUFRZ0UsWUFBUjtBQUNILEtBYkQ7O0FBZUFRLFdBQU9DLElBQVAsQ0FBWWhGLGNBQVosRUFBNEJpRixPQUE1QixDQUFvQyxxQkFBYTtBQUM3Q2hGLGdCQUFRaUYsbUJBQVIsQ0FBNEJDLFNBQTVCLEVBQXVDbkYsZUFBZW1GLFNBQWYsQ0FBdkM7QUFDQWxGLGdCQUFRbUYsZ0JBQVIsQ0FBeUJELFNBQXpCLEVBQW9DbkYsZUFBZW1GLFNBQWYsQ0FBcEM7QUFDSCxLQUhEOztBQUtBaEgsU0FBS3dCLE9BQUwsR0FBZSxZQUFLO0FBQ2hCbkIsMEJBQWtCQyxHQUFsQixDQUFzQiwyQkFBdEI7O0FBRUFzRyxlQUFPQyxJQUFQLENBQVloRixjQUFaLEVBQTRCaUYsT0FBNUIsQ0FBb0MscUJBQWE7QUFDN0NoRixvQkFBUWlGLG1CQUFSLENBQTRCQyxTQUE1QixFQUF1Q25GLGVBQWVtRixTQUFmLENBQXZDO0FBQ0gsU0FGRDtBQUdILEtBTkQ7QUFPQSxXQUFPaEgsSUFBUDtBQUNILENBOU1EOztxQkFnTmUwQixROzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsUGY7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBT0E7Ozs7OztBQWJBOzs7QUFtQkEsSUFBTXdGLFdBQVcsU0FBWEEsUUFBVyxDQUFVQyxJQUFWLEVBQWdCQyxZQUFoQixFQUE4QkMsY0FBOUIsRUFBNkM7QUFDMURoSCxzQkFBa0JDLEdBQWxCLENBQXNCLGVBQXRCOztBQUVBLFFBQUlOLE9BQU0sRUFBVjtBQUNBLG1DQUFhQSxJQUFiOztBQUVBLFFBQUlzSCxXQUFXLDJCQUFlSCxLQUFLeEYsZUFBcEIsRUFBcUMzQixJQUFyQyxDQUFmO0FBQ0EsUUFBSThCLFVBQVUsZ0NBQW9CcUYsS0FBS3hGLGVBQXpCLENBQWQ7QUFDQSxRQUFJNEYsY0FBY0gsYUFBYUksU0FBYixHQUF5QkMsS0FBekIsSUFBZ0MsRUFBbEQ7QUFDQTNGLFlBQVE0RixZQUFSLEdBQXVCNUYsUUFBUTZGLG1CQUFSLEdBQThCUCxhQUFhUSxzQkFBYixFQUFyRDs7QUFHQSxRQUFNQyxRQUFRLFNBQVJBLEtBQVEsQ0FBQ0MsZ0JBQUQsRUFBcUI7QUFDL0IsWUFBTUMsU0FBVVosS0FBS3pELE9BQUwsQ0FBYXlELEtBQUthLGFBQWxCLENBQWhCO0FBQ0FiLGFBQUtjLFNBQUwsR0FBaUJGLE9BQU9FLFNBQXhCO0FBQ0EsWUFBR1osY0FBSCxFQUFrQjtBQUNkQSwyQkFBZVUsTUFBZixFQUF1QkQsZ0JBQXZCO0FBQ0gsU0FGRCxNQUVLO0FBQ0R6SCw4QkFBa0JDLEdBQWxCLENBQXNCLGtCQUF0QixFQUEwQ3lILE1BQTFDLEVBQWtELHdCQUF1QkQsZ0JBQXpFO0FBQ0EsZ0JBQUlJLGlCQUFpQnBHLFFBQVFxRyxHQUE3QjtBQUNBLGdCQUFNQyxnQkFBZ0IzSCxTQUFTQyxhQUFULENBQXVCLFFBQXZCLENBQXRCOztBQUVBMEgsMEJBQWNELEdBQWQsR0FBb0JKLE9BQU9NLElBQTNCO0FBQ0EsZ0JBQU1DLGdCQUFpQkYsY0FBY0QsR0FBZCxLQUFzQkQsY0FBN0M7QUFDQSxnQkFBSUksYUFBSixFQUFtQjtBQUNmeEcsd0JBQVFxRyxHQUFSLEdBQWNoQixLQUFLekQsT0FBTCxDQUFheUQsS0FBS2EsYUFBbEIsRUFBaUNLLElBQS9DO0FBQ0E7QUFDQSxvQkFBSUgsY0FBSixFQUFvQjtBQUNoQnBHLDRCQUFReUcsSUFBUjtBQUNIO0FBQ0osYUFORCxNQU1NLElBQUdULHFCQUFxQixDQUFyQixJQUEwQmhHLFFBQVFtQyxXQUFSLEdBQXNCLENBQW5ELEVBQXFEO0FBQ3ZEakUscUJBQUt3SSxJQUFMLENBQVVWLGdCQUFWO0FBQ0g7QUFDRCxnQkFBR0EsbUJBQW1CLENBQXRCLEVBQXdCO0FBQ3BCOUgscUJBQUt3SSxJQUFMLENBQVVWLGdCQUFWO0FBQ0E5SCxxQkFBS21FLElBQUw7QUFDSDtBQUNEOzs7O0FBSUEsZ0JBQUdvRCxXQUFILEVBQWU7QUFDWHpGLHdCQUFRMkcsTUFBUixHQUFpQmxCLFdBQWpCO0FBQ0g7QUFDSjtBQUNKLEtBakNEOztBQW1DQXZILFNBQUswSSxPQUFMLEdBQWUsWUFBTTtBQUNqQixlQUFPdkIsS0FBS2pHLElBQVo7QUFDSCxLQUZEO0FBR0FsQixTQUFLMkksT0FBTCxHQUFlLFlBQU07QUFDakIsZUFBT3hCLEtBQUt3QixPQUFaO0FBQ0gsS0FGRDtBQUdBM0ksU0FBSzRDLFVBQUwsR0FBa0IsVUFBQytGLE9BQUQsRUFBYTtBQUMzQnhCLGFBQUt3QixPQUFMLEdBQWVBLE9BQWY7QUFDSCxLQUZEO0FBR0EzSSxTQUFLbUYsU0FBTCxHQUFpQixZQUFJO0FBQ2pCLGVBQU9nQyxLQUFLN0IsT0FBWjtBQUNILEtBRkQ7QUFHQXRGLFNBQUt1RixVQUFMLEdBQWtCLFVBQUNELE9BQUQsRUFBVztBQUN6QjZCLGFBQUs3QixPQUFMLEdBQWVBLE9BQWY7QUFDSCxLQUZEOztBQUlBdEYsU0FBS3NDLFFBQUwsR0FBZ0IsVUFBQ3NHLFFBQUQsRUFBYztBQUMxQixZQUFHekIsS0FBSzBCLEtBQUwsS0FBZUQsUUFBbEIsRUFBMkI7QUFDdkIsZ0JBQUlFLFlBQVkzQixLQUFLMEIsS0FBckI7QUFDQSxvQkFBT0QsUUFBUDtBQUNJLHFCQUFLekYseUJBQUw7QUFDSW5ELHlCQUFLeUMsT0FBTCxDQUFhc0csMEJBQWI7QUFDQTtBQUNKLHFCQUFLN0UsdUJBQUw7QUFDSWxFLHlCQUFLeUMsT0FBTCxDQUFhdUcsdUJBQWIsRUFBMkI7QUFDdkJGLG1DQUFXM0IsS0FBSzBCO0FBRE8scUJBQTNCO0FBR0E7QUFDSixxQkFBS3hFLHdCQUFMO0FBQ0lyRSx5QkFBS3lDLE9BQUwsQ0FBYXdHLHNCQUFiLEVBQTBCO0FBQ3RCSCxtQ0FBVzNCLEtBQUswQjtBQURNLHFCQUExQjtBQUdBO0FBYlI7QUFlQTFCLGlCQUFLMEIsS0FBTCxHQUFhRCxRQUFiO0FBQ0E1SSxpQkFBS3lDLE9BQUwsQ0FBYXlHLHVCQUFiLEVBQTJCO0FBQ3ZCQywyQkFBWUwsU0FEVztBQUV2Qk0sMEJBQVVqQyxLQUFLMEI7QUFGUSxhQUEzQjtBQUlIO0FBQ0osS0F4QkQ7QUF5QkE3SSxTQUFLaUQsUUFBTCxHQUFnQixZQUFLO0FBQ2pCLGVBQU9rRSxLQUFLMEIsS0FBWjtBQUNILEtBRkQ7QUFHQTdJLFNBQUs2RSxTQUFMLEdBQWlCLFVBQUN3RSxTQUFELEVBQWU7QUFDNUJsQyxhQUFLbUMsTUFBTCxHQUFjRCxTQUFkO0FBQ0gsS0FGRDtBQUdBckosU0FBS3VKLFNBQUwsR0FBaUIsWUFBTTtBQUNuQixlQUFPcEMsS0FBS21DLE1BQVo7QUFDSCxLQUZEO0FBR0F0SixTQUFLd0osV0FBTCxHQUFtQixZQUFNO0FBQ3JCLFlBQUlqRyxTQUFVekIsUUFBUTBCLFFBQVIsS0FBcUJDLFFBQXRCLEdBQWtDLElBQWxDLEdBQXlDLHlCQUFhMEQsS0FBS3hGLGVBQWxCLENBQXREO0FBQ0EsZUFBTzRCLFNBQVVFLFFBQVYsR0FBcUIzQixRQUFRMEIsUUFBcEM7QUFDSCxLQUhEO0FBSUF4RCxTQUFLeUosV0FBTCxHQUFtQixZQUFNO0FBQ3JCLFlBQUcsQ0FBQzNILE9BQUosRUFBWTtBQUNSLG1CQUFPLENBQVA7QUFDSDtBQUNELGVBQU9BLFFBQVFtQyxXQUFmO0FBQ0gsS0FMRDtBQU1BakUsU0FBSzBKLFNBQUwsR0FBaUIsVUFBQzNELE1BQUQsRUFBVztBQUN4QixZQUFHLENBQUNqRSxPQUFKLEVBQVk7QUFDUixtQkFBTyxLQUFQO0FBQ0g7QUFDREEsZ0JBQVFpRSxNQUFSLEdBQWlCQSxTQUFPLEdBQXhCO0FBQ0gsS0FMRDtBQU1BL0YsU0FBSzJKLFNBQUwsR0FBaUIsWUFBSztBQUNsQixZQUFHLENBQUM3SCxPQUFKLEVBQVk7QUFDUixtQkFBTyxDQUFQO0FBQ0g7QUFDRCxlQUFPQSxRQUFRaUUsTUFBUixHQUFlLEdBQXRCO0FBQ0gsS0FMRDtBQU1BL0YsU0FBSzRKLE9BQUwsR0FBZSxVQUFDZixLQUFELEVBQVU7QUFDckIsWUFBRyxDQUFDL0csT0FBSixFQUFZO0FBQ1IsbUJBQU8sS0FBUDtBQUNIO0FBQ0QsWUFBSSxPQUFPK0csS0FBUCxLQUFpQixXQUFyQixFQUFrQzs7QUFFOUIvRyxvQkFBUW9FLEtBQVIsR0FBZ0IsQ0FBQ3BFLFFBQVFvRSxLQUF6Qjs7QUFFQWxHLGlCQUFLeUMsT0FBTCxDQUFhb0gsdUJBQWIsRUFBMkI7QUFDdkI1RCxzQkFBTW5FLFFBQVFvRTtBQURTLGFBQTNCO0FBSUgsU0FSRCxNQVFPOztBQUVIcEUsb0JBQVFvRSxLQUFSLEdBQWdCMkMsS0FBaEI7O0FBRUE3SSxpQkFBS3lDLE9BQUwsQ0FBYW9ILHVCQUFiLEVBQTJCO0FBQ3ZCNUQsc0JBQU1uRSxRQUFRb0U7QUFEUyxhQUEzQjtBQUdIO0FBQ0QsZUFBT3BFLFFBQVFvRSxLQUFmO0FBQ0gsS0FyQkQ7QUFzQkFsRyxTQUFLOEosT0FBTCxHQUFlLFlBQUs7QUFDaEIsWUFBRyxDQUFDaEksT0FBSixFQUFZO0FBQ1IsbUJBQU8sS0FBUDtBQUNIO0FBQ0QsZUFBT0EsUUFBUW9FLEtBQWY7QUFDSCxLQUxEOztBQU9BbEcsU0FBSytKLE9BQUwsR0FBZSxVQUFDckcsT0FBRCxFQUFVb0UsZ0JBQVYsRUFBOEI7QUFDekNYLGFBQUt6RCxPQUFMLEdBQWVBLE9BQWY7QUFDQXlELGFBQUthLGFBQUwsR0FBcUIsOEJBQWtCdEUsT0FBbEIsRUFBMkJ5RCxLQUFLYSxhQUFoQyxFQUErQ1osWUFBL0MsQ0FBckI7QUFDQVMsY0FBTUMsb0JBQW9CLENBQTFCOztBQUVBLGVBQU8sSUFBSWtDLE9BQUosQ0FBWSxVQUFVQyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjtBQUMxQ0Q7QUFDSCxTQUZNLENBQVA7QUFJSCxLQVREO0FBVUFqSyxTQUFLdUksSUFBTCxHQUFZLFVBQUM3RSxPQUFELEVBQVk7QUFDcEJ5RCxhQUFLekQsT0FBTCxHQUFlQSxPQUFmO0FBQ0F5RCxhQUFLYSxhQUFMLEdBQXFCLDhCQUFrQnRFLE9BQWxCLEVBQTJCeUQsS0FBS2EsYUFBaEMsRUFBK0NaLFlBQS9DLENBQXJCO0FBQ0FTLGNBQU1WLEtBQUt6RCxPQUFMLENBQWF5RyxTQUFiLElBQTBCLENBQWhDO0FBQ0gsS0FKRDs7QUFNQW5LLFNBQUttRSxJQUFMLEdBQVksWUFBSztBQUNiLFlBQUcsQ0FBQ3JDLE9BQUosRUFBWTtBQUNSLG1CQUFPLEtBQVA7QUFDSDs7QUFFRCxZQUFHOUIsS0FBS2lELFFBQUwsT0FBb0JvQix3QkFBdkIsRUFBcUM7QUFDakMsZ0JBQUkrRixVQUFVdEksUUFBUXFDLElBQVIsRUFBZDtBQUNBLGdCQUFJaUcsWUFBWUMsU0FBaEIsRUFBMkI7QUFDdkJELHdCQUFRRSxJQUFSLENBQWEsYUFBSztBQUNkO0FBQ0gsaUJBRkQsV0FFUyxpQkFBUztBQUNkO0FBQ0E7QUFDQUMsK0JBQVcsWUFBVTtBQUNqQnZLLDZCQUFLbUUsSUFBTDtBQUNILHFCQUZELEVBRUcsSUFGSDtBQUlILGlCQVREO0FBVUg7QUFFSjtBQUNKLEtBckJEO0FBc0JBbkUsU0FBS3dDLEtBQUwsR0FBYSxZQUFLO0FBQ2QsWUFBRyxDQUFDVixPQUFKLEVBQVk7QUFDUixtQkFBTyxLQUFQO0FBQ0g7QUFDRCxZQUFHOUIsS0FBS2lELFFBQUwsT0FBb0JvQix3QkFBdkIsRUFBcUM7QUFDakN2QyxvQkFBUVUsS0FBUjtBQUNIO0FBQ0osS0FQRDtBQVFBeEMsU0FBS3dJLElBQUwsR0FBWSxVQUFDOUQsUUFBRCxFQUFhO0FBQ3JCLFlBQUcsQ0FBQzVDLE9BQUosRUFBWTtBQUNSLG1CQUFPLEtBQVA7QUFDSDtBQUNEQSxnQkFBUW1DLFdBQVIsR0FBc0JTLFFBQXRCO0FBQ0gsS0FMRDtBQU1BMUUsU0FBS3dLLGVBQUwsR0FBdUIsVUFBQzlDLFlBQUQsRUFBaUI7QUFDcEMsWUFBRyxDQUFDNUYsT0FBSixFQUFZO0FBQ1IsbUJBQU8sS0FBUDtBQUNIO0FBQ0Q5QixhQUFLeUMsT0FBTCxDQUFhZ0ksZ0NBQWIsRUFBb0MsRUFBQy9DLGNBQWVBLFlBQWhCLEVBQXBDO0FBQ0EsZUFBTzVGLFFBQVE0RixZQUFSLEdBQXVCNUYsUUFBUTZGLG1CQUFSLEdBQThCRCxZQUE1RDtBQUNILEtBTkQ7QUFPQTFILFNBQUswSyxlQUFMLEdBQXVCLFlBQUs7QUFDeEIsWUFBRyxDQUFDNUksT0FBSixFQUFZO0FBQ1IsbUJBQU8sQ0FBUDtBQUNIO0FBQ0QsZUFBT0EsUUFBUTRGLFlBQWY7QUFDSCxLQUxEOztBQU9BMUgsU0FBSzJELFVBQUwsR0FBa0IsWUFBTTtBQUNwQixZQUFHLENBQUM3QixPQUFKLEVBQVk7QUFDUixtQkFBTyxFQUFQO0FBQ0g7O0FBRUQsZUFBT3FGLEtBQUt6RCxPQUFMLENBQWFpSCxHQUFiLENBQWlCLFVBQVM1QyxNQUFULEVBQWlCNkMsS0FBakIsRUFBd0I7QUFDNUMsbUJBQU87QUFDSHZDLHNCQUFNTixPQUFPTSxJQURWO0FBRUh2RSxzQkFBTWlFLE9BQU9qRSxJQUZWO0FBR0grRyx1QkFBTzlDLE9BQU84QyxLQUhYO0FBSUhELHVCQUFRQTtBQUpMLGFBQVA7QUFNSCxTQVBNLENBQVA7QUFRSCxLQWJEO0FBY0E1SyxTQUFLNkQsZ0JBQUwsR0FBd0IsWUFBSztBQUN6QixlQUFPc0QsS0FBS2EsYUFBWjtBQUNILEtBRkQ7QUFHQWhJLFNBQUs4SyxnQkFBTCxHQUF3QixVQUFDbEgsV0FBRCxFQUFjbUgsa0JBQWQsRUFBcUM7QUFDckQsWUFBRzVELEtBQUthLGFBQUwsS0FBdUJwRSxXQUExQixFQUFzQztBQUN0QyxtQkFBTyxLQUFQO0FBQ0g7O0FBRUQsWUFBR0EsY0FBYyxDQUFDLENBQWxCLEVBQW9CO0FBQ2hCLGdCQUFHdUQsS0FBS3pELE9BQUwsSUFBZ0J5RCxLQUFLekQsT0FBTCxDQUFhaUIsTUFBYixHQUFzQmYsV0FBekMsRUFBcUQ7QUFDakQ7QUFDQTVELHFCQUFLc0MsUUFBTCxDQUFjWSxxQkFBZDtBQUNBN0Msa0NBQWtCQyxHQUFsQixDQUFzQixzQkFBc0JzRCxXQUE1QztBQUNBdUQscUJBQUthLGFBQUwsR0FBcUJwRSxXQUFyQjs7QUFFQTVELHFCQUFLeUMsT0FBTCxDQUFhdUksaUNBQWIsRUFBcUM7QUFDakNoRCxtQ0FBZXBFO0FBRGtCLGlCQUFyQztBQUdBd0QsNkJBQWE2RCxjQUFiLENBQTRCOUQsS0FBS3pELE9BQUwsQ0FBYUUsV0FBYixFQUEwQmlILEtBQXREO0FBQ0E7QUFDQSxvQkFBR0Usa0JBQUgsRUFBc0I7O0FBRWxCbEQsMEJBQU0vRixRQUFRbUMsV0FBUixJQUF1QixDQUE3QjtBQUNIO0FBQ0QsdUJBQU9rRCxLQUFLYSxhQUFaO0FBQ0g7QUFDSjtBQUNKLEtBeEJEOztBQTJCQWhJLFNBQUtrTCxnQkFBTCxHQUF3QixZQUFNO0FBQzFCLFlBQUcsQ0FBQ3BKLE9BQUosRUFBWTtBQUNSLG1CQUFPLEVBQVA7QUFDSDtBQUNELGVBQU9xRixLQUFLZ0UsYUFBWjtBQUNILEtBTEQ7QUFNQW5MLFNBQUtvTCxpQkFBTCxHQUF5QixZQUFNO0FBQzNCLFlBQUcsQ0FBQ3RKLE9BQUosRUFBWTtBQUNSLG1CQUFPLElBQVA7QUFDSDtBQUNELGVBQU9xRixLQUFLa0UsY0FBWjtBQUNILEtBTEQ7QUFNQXJMLFNBQUtzTCxpQkFBTCxHQUF5QixVQUFDQyxZQUFELEVBQWtCO0FBQ3ZDO0FBQ0gsS0FGRDtBQUdBdkwsU0FBS3dMLGFBQUwsR0FBcUIsWUFBTTtBQUN2QjtBQUNILEtBRkQ7QUFHQXhMLFNBQUt5TCxjQUFMLEdBQXNCLFVBQUNDLE1BQUQsRUFBWTtBQUM5QjtBQUNILEtBRkQ7O0FBSUExTCxTQUFLMkwsWUFBTCxHQUFvQixZQUFNO0FBQ3RCLGVBQU94RSxLQUFLYyxTQUFaO0FBQ0gsS0FGRDtBQUdBakksU0FBSzRMLFlBQUwsR0FBb0IsVUFBQzNELFNBQUQsRUFBZTtBQUMvQixlQUFPZCxLQUFLYyxTQUFMLEdBQWlCQSxTQUF4QjtBQUNILEtBRkQ7QUFHQWpJLFNBQUs2TCxTQUFMLEdBQWlCLFVBQUNDLFVBQUQsRUFBZTtBQUM1QixZQUFJQyxNQUFNNUUsS0FBS2MsU0FBZjtBQUNBLFlBQUkrRCxnQkFBZ0JsSyxRQUFRbUMsV0FBUixHQUFzQjhILEdBQTFDO0FBQ0EsWUFBSUUsY0FBYyxDQUFDRCxnQkFBZ0JGLFVBQWpCLElBQStCQyxHQUFqRDtBQUNBRSxzQkFBY0EsY0FBYyxPQUE1QixDQUo0QixDQUlTOztBQUVyQ2pNLGFBQUt3QyxLQUFMO0FBQ0F4QyxhQUFLd0ksSUFBTCxDQUFVeUQsV0FBVjtBQUNILEtBUkQ7O0FBVUFqTSxTQUFLa00sSUFBTCxHQUFZLFlBQUs7QUFDYixZQUFHLENBQUNwSyxPQUFKLEVBQVk7QUFDUixtQkFBTyxLQUFQO0FBQ0g7QUFDRHpCLDBCQUFrQkMsR0FBbEIsQ0FBc0IsZ0JBQXRCO0FBQ0F3QixnQkFBUXFLLGVBQVIsQ0FBd0IsU0FBeEI7QUFDQXJLLGdCQUFRcUssZUFBUixDQUF3QixLQUF4QjtBQUNBLGVBQU9ySyxRQUFRc0ssVUFBZixFQUEyQjtBQUN2QnRLLG9CQUFRTCxXQUFSLENBQW9CSyxRQUFRc0ssVUFBNUI7QUFDSDtBQUNEcE0sYUFBS3dDLEtBQUw7QUFDQXhDLGFBQUtzQyxRQUFMLENBQWNZLHFCQUFkO0FBQ0gsS0FaRDs7QUFjQWxELFNBQUt3QixPQUFMLEdBQWUsWUFBSztBQUNoQixZQUFHLENBQUNNLE9BQUosRUFBWTtBQUNSLG1CQUFPLEtBQVA7QUFDSDtBQUNEOUIsYUFBS2tNLElBQUw7QUFDQTVFLGlCQUFTOUYsT0FBVDtBQUNBO0FBQ0F4QixhQUFLcU0sR0FBTDtBQUNBaE0sMEJBQWtCQyxHQUFsQixDQUFzQix5REFBdEI7QUFDSCxLQVREOztBQVdBO0FBQ0E7QUFDQU4sb0JBQWEsVUFBQ2tCLElBQUQsRUFBVTtBQUNuQixZQUFNb0wsU0FBU3RNLEtBQUtrQixJQUFMLENBQWY7QUFDQSxlQUFPLFlBQVU7QUFDYixtQkFBT29MLE9BQU9DLEtBQVAsQ0FBYXZNLElBQWIsRUFBbUJ3TSxTQUFuQixDQUFQO0FBQ0gsU0FGRDtBQUdILEtBTEQ7QUFNQSxXQUFPeE0sSUFBUDtBQUVILENBM1VEOztxQkE2VWVrSCxROzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN1ZmOztBQUNBOzs7Ozs7QUFKQTs7O0FBTU8sSUFBTXVGLG9EQUFzQixTQUF0QkEsbUJBQXNCLENBQVM5SyxlQUFULEVBQTBCO0FBQ3pELFFBQUcrSyx3QkFBRUMsU0FBRixDQUFZaEwsZUFBWixDQUFILEVBQWdDO0FBQzVCLGVBQU9BLGVBQVA7QUFDSDtBQUNELFFBQUdBLGdCQUFnQmlMLGVBQW5CLEVBQW1DO0FBQy9CLGVBQU9qTCxnQkFBZ0JpTCxlQUFoQixFQUFQO0FBQ0gsS0FGRCxNQUVNLElBQUdqTCxnQkFBZ0JrTCxLQUFuQixFQUF5QjtBQUMzQixlQUFPbEwsZ0JBQWdCa0wsS0FBdkI7QUFDSDtBQUNELFdBQU8sSUFBUDtBQUNILENBVk07O0FBWUEsSUFBTUMsc0NBQWUsU0FBZkEsWUFBZSxDQUFTbkwsZUFBVCxFQUEwQjtBQUNsRDs7QUFFQSxRQUFHQSxnQkFBZ0JvTCxTQUFuQixFQUE2QjtBQUN6QixlQUFPcEwsZ0JBQWdCb0wsU0FBaEIsRUFBUDtBQUNILEtBRkQsTUFFSztBQUNELGVBQU8sS0FBUDtBQUNIO0FBQ0osQ0FSTTs7QUFVQSxJQUFNQyxzQ0FBZSxTQUFmQSxZQUFlLENBQVMzSyxLQUFULEVBQWdCVCxRQUFoQixFQUF5QjtBQUNqREEsYUFBU1UsUUFBVCxDQUFrQkMsc0JBQWxCO0FBQ0FYLGFBQVNZLEtBQVQ7QUFDQVosYUFBU2EsT0FBVCxDQUFpQkMsZ0JBQWpCLEVBQXdCTCxLQUF4QjtBQUNILENBSk07O0FBTUEsSUFBTTRLLGdEQUFvQixTQUFwQkEsaUJBQW9CLENBQUN2SixPQUFELEVBQVVzRSxhQUFWLEVBQXlCWixZQUF6QixFQUEwQztBQUN2RSxRQUFJeEQsY0FBY3pCLEtBQUtELEdBQUwsQ0FBUyxDQUFULEVBQVk4RixhQUFaLENBQWxCO0FBQ0EsUUFBTTZDLFFBQU8sRUFBYjtBQUNBLFFBQUluSCxPQUFKLEVBQWE7QUFDVCxhQUFLLElBQUl3SixJQUFJLENBQWIsRUFBZ0JBLElBQUl4SixRQUFRaUIsTUFBNUIsRUFBb0N1SSxHQUFwQyxFQUF5QztBQUNyQyxnQkFBSXhKLFFBQVF3SixDQUFSLFlBQUosRUFBd0I7QUFDcEJ0Siw4QkFBY3NKLENBQWQ7QUFDSDtBQUNELGdCQUFJOUYsYUFBYStGLGNBQWIsTUFBaUN6SixRQUFRd0osQ0FBUixFQUFXckMsS0FBWCxLQUFxQnpELGFBQWErRixjQUFiLEVBQTFELEVBQTBGO0FBQ3RGLHVCQUFPRCxDQUFQO0FBQ0g7QUFDSjtBQUNKO0FBQ0QsV0FBT3RKLFdBQVA7QUFDSCxDQWRNLEM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbENQOzs7O0FBS08sSUFBTXdKLGtDQUFhLFNBQWJBLFVBQWEsR0FBVTtBQUNoQyxRQUFHLENBQUNDLFVBQVVDLFNBQVYsQ0FBb0JDLE9BQXBCLENBQTRCLE9BQTVCLEtBQXdDRixVQUFVQyxTQUFWLENBQW9CQyxPQUFwQixDQUE0QixLQUE1QixDQUF6QyxLQUFnRixDQUFDLENBQXBGLEVBQXVGO0FBQ25GLGVBQU8sT0FBUDtBQUNILEtBRkQsTUFFTSxJQUFHRixVQUFVQyxTQUFWLENBQW9CQyxPQUFwQixDQUE0QixRQUE1QixLQUF5QyxDQUFDLENBQTdDLEVBQWdEO0FBQ2xELGVBQU8sUUFBUDtBQUNILEtBRkssTUFFQSxJQUFHRixVQUFVQyxTQUFWLENBQW9CQyxPQUFwQixDQUE0QixRQUE1QixLQUF5QyxDQUFDLENBQTdDLEVBQStDO0FBQ2pELGVBQU8sUUFBUDtBQUNILEtBRkssTUFFQSxJQUFHRixVQUFVQyxTQUFWLENBQW9CQyxPQUFwQixDQUE0QixTQUE1QixLQUEwQyxDQUFDLENBQTlDLEVBQWlEO0FBQ25ELGVBQU8sU0FBUDtBQUNILEtBRkssTUFFQSxJQUFJRixVQUFVQyxTQUFWLENBQW9CQyxPQUFwQixDQUE0QixNQUE1QixLQUF1QyxDQUFDLENBQTVDLEVBQWdEO0FBQ2xELFlBQUlDLE9BQU9ILFVBQVVDLFNBQVYsQ0FBb0JDLE9BQXBCLENBQTRCLE1BQTVCLENBQVg7QUFDQTs7Ozs7Ozs7Ozs7QUFXQSxZQUFJRSxLQUFNLFlBQVU7O0FBRWhCLGdCQUFJQyxLQUFKO0FBQUEsZ0JBQ0lDLElBQUksQ0FEUjtBQUFBLGdCQUVJQyxNQUFNbk4sU0FBU0MsYUFBVCxDQUF1QixLQUF2QixDQUZWO0FBQUEsZ0JBR0ltTixNQUFNRCxJQUFJRSxvQkFBSixDQUF5QixHQUF6QixDQUhWOztBQUtBLG1CQUNJRixJQUFJRyxTQUFKLEdBQWdCLG1CQUFvQixFQUFFSixDQUF0QixHQUEyQix1QkFBM0MsRUFDSUUsSUFBSSxDQUFKLENBRlI7O0FBS0EsbUJBQU9GLElBQUksQ0FBSixHQUFRQSxDQUFSLEdBQVlELEtBQW5CO0FBRUgsU0FkUyxFQUFWO0FBZUEsWUFBR0QsS0FBSyxDQUFSLEVBQVU7QUFDTixtQkFBTyxPQUFQO0FBQ0gsU0FGRCxNQUVLO0FBQ0QsbUJBQU8sVUFBUDtBQUNIO0FBRUosS0FsQ0ssTUFrQ0Q7QUFDRCxlQUFPLFNBQVA7QUFDSDtBQUVKLENBL0NNLEMiLCJmaWxlIjoib3ZlbnBsYXllci5wcm92aWRlci5EYXNoUHJvdmlkZXJ+b3ZlbnBsYXllci5wcm92aWRlci5IbHNQcm92aWRlcn5vdmVucGxheWVyLnByb3ZpZGVyLkh0bWw1fm92ZW5wbGF5ZX43YWZkNjhjZi5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIk92ZW5QbGF5ZXJGbGFzaC5zd2ZcIjsiLCIvKipcclxuICogQGJyaWVmICAg66+465SU7Ja0IOyXmOumrOuovO2KuOulvCDqtIDrpqztlZjripQg6rCd7LK0LiDtmITsnqzripQg7ZWY64qUIOydvOydtCDrp47sp4Ag7JWK64ukLlxyXG4gKiBAcGFyYW0gICB7ZWxlbWVudH0gICBjb250YWluZXIgICBkb20gZWxlbWVudFxyXG4gKlxyXG4gKiAqL1xyXG5pbXBvcnQge2dldEJyb3dzZXJ9IGZyb20gXCJ1dGlscy9icm93c2VyXCI7XHJcbmltcG9ydCB7UFJPVklERVJfUlRNUH0gZnJvbSBcImFwaS9jb25zdGFudHNcIjtcclxuaW1wb3J0IFNXRnBhdGggZnJvbSAnLi4vLi4vLi4vYXNzZXRzL092ZW5QbGF5ZXJGbGFzaC5zd2YnO1xyXG5cclxuY29uc3QgTWFuYWdlciA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgcHJvdmlkZXJUeXBlKXtcclxuICAgIGNvbnN0IHRoYXQgPSB7fTtcclxuICAgIGxldCByb290SWQgPSBjb250YWluZXIuZ2V0QXR0cmlidXRlKFwiZGF0YS1wYXJlbnQtaWRcIik7XHJcbiAgICBsZXQgbWVkaWFFbGVtZW50ID0gXCJcIjtcclxuICAgIGxldCBicm93c2VyVHlwZSA9IGdldEJyb3dzZXIoKTtcclxuXHJcbiAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJNZWRpYU1hbmFnZXIgbG9hZGVkLiBicm93c2VyVHlwZSA6IFwiKyBicm93c2VyVHlwZSk7XHJcbiAgICBjb25zdCBjcmVhdGVNZWRpYUVsZW1lbnQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGlmKHByb3ZpZGVyVHlwZSAhPT0gUFJPVklERVJfUlRNUCl7XHJcbiAgICAgICAgICAgIG1lZGlhRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XHJcbiAgICAgICAgICAgIG1lZGlhRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVSZW1vdGVQbGF5YmFjaycsICcnKTtcclxuICAgICAgICAgICAgbWVkaWFFbGVtZW50LnNldEF0dHJpYnV0ZSgnd2Via2l0LXBsYXlzaW5saW5lJywgJycpO1xyXG4gICAgICAgICAgICBtZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKCdwbGF5c2lubGluZScsICcnKTtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1lZGlhRWxlbWVudCk7XHJcblxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBsZXQgbW92aWUsIGZsYXNodmFycywgYWxsb3dzY3JpcHRhY2Nlc3MsIGFsbG93ZnVsbHNjcmVlbiwgcXVhbGl0eSwgbmFtZSwgbWVudSwgcXVhbCwgYmdjb2xvcjtcclxuICAgICAgICAgICAgbW92aWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwYXJhbScpO1xyXG4gICAgICAgICAgICBtb3ZpZS5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnbW92aWUnKTtcclxuICAgICAgICAgICAgbW92aWUuc2V0QXR0cmlidXRlKCd2YWx1ZScsIFNXRnBhdGgpO1xyXG5cclxuICAgICAgICAgICAgZmxhc2h2YXJzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncGFyYW0nKTtcclxuICAgICAgICAgICAgZmxhc2h2YXJzLnNldEF0dHJpYnV0ZSgnbmFtZScsICdmbGFzaHZhcnMnKTtcclxuICAgICAgICAgICAgLy9wbGF5ZXJJZCB1c2VzIFNXRiBmb3IgRXh0ZXJuYWxJbnRlcmZhY2UuY2FsbCgpLlxyXG4gICAgICAgICAgICBmbGFzaHZhcnMuc2V0QXR0cmlidXRlKCd2YWx1ZScsICdwbGF5ZXJJZD0nK3Jvb3RJZCk7XHJcblxyXG4gICAgICAgICAgICBhbGxvd3NjcmlwdGFjY2VzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BhcmFtJyk7XHJcbiAgICAgICAgICAgIGFsbG93c2NyaXB0YWNjZXNzLnNldEF0dHJpYnV0ZSgnbmFtZScsICdhbGxvd3NjcmlwdGFjY2VzcycpO1xyXG4gICAgICAgICAgICBhbGxvd3NjcmlwdGFjY2Vzcy5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJ2Fsd2F5cycpO1xyXG5cclxuICAgICAgICAgICAgYWxsb3dmdWxsc2NyZWVuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncGFyYW0nKTtcclxuICAgICAgICAgICAgYWxsb3dmdWxsc2NyZWVuLnNldEF0dHJpYnV0ZSgnbmFtZScsICdhbGxvd2Z1bGxzY3JlZW4nKTtcclxuICAgICAgICAgICAgYWxsb3dmdWxsc2NyZWVuLnNldEF0dHJpYnV0ZSgndmFsdWUnLCAndHJ1ZScpO1xyXG5cclxuICAgICAgICAgICAgcXVhbGl0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BhcmFtJyk7XHJcbiAgICAgICAgICAgIHF1YWxpdHkuc2V0QXR0cmlidXRlKCduYW1lJywgJ3F1YWxpdHknKTtcclxuICAgICAgICAgICAgcXVhbGl0eS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJ2hlaWdodCcpO1xyXG5cclxuICAgICAgICAgICAgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BhcmFtJyk7XHJcbiAgICAgICAgICAgIG5hbWUuc2V0QXR0cmlidXRlKCduYW1lJywgJ25hbWUnKTtcclxuICAgICAgICAgICAgbmFtZS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgcm9vdElkK1wiLWZsYXNoXCIpO1xyXG5cclxuICAgICAgICAgICAgbWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BhcmFtJyk7XHJcbiAgICAgICAgICAgIG1lbnUuc2V0QXR0cmlidXRlKCduYW1lJywgJ21lbnUnKTtcclxuICAgICAgICAgICAgbWVudS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJ2ZhbHNlJyk7XHJcblxyXG4gICAgICAgICAgICBxdWFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncGFyYW0nKTtcclxuICAgICAgICAgICAgcXVhbC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAncXVhbGl0eScpO1xyXG4gICAgICAgICAgICBxdWFsLnNldEF0dHJpYnV0ZSgndmFsdWUnLCAnaGlnaCcpO1xyXG5cclxuICAgICAgICAgICAgYmdjb2xvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3BhcmFtJyk7XHJcbiAgICAgICAgICAgIGJnY29sb3Iuc2V0QXR0cmlidXRlKCduYW1lJywgJ2JnY29sb3InKTtcclxuICAgICAgICAgICAgYmdjb2xvci5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJyMwMDAwMDAnKTtcclxuXHJcbiAgICAgICAgICAgIG1lZGlhRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29iamVjdCcpO1xyXG4gICAgICAgICAgICBtZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsIHJvb3RJZCtcIi1mbGFzaFwiKTtcclxuICAgICAgICAgICAgbWVkaWFFbGVtZW50LnNldEF0dHJpYnV0ZSgnbmFtZScsIHJvb3RJZCtcIi1mbGFzaFwiKTtcclxuICAgICAgICAgICAgbWVkaWFFbGVtZW50LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAnMTAwJScpO1xyXG4gICAgICAgICAgICBtZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCAnMTAwJScpO1xyXG5cclxuICAgICAgICAgICAgaWYoYnJvd3NlclR5cGUgIT09IFwib2xkSUVcIil7XHJcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhJywgU1dGcGF0aCk7XHJcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgbWVkaWFFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xhc3NpZCcsICdjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDAnKTtcclxuXHJcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuYXBwZW5kQ2hpbGQobW92aWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lZGlhRWxlbWVudC5hcHBlbmRDaGlsZChiZ2NvbG9yKTtcclxuICAgICAgICAgICAgbWVkaWFFbGVtZW50LmFwcGVuZENoaWxkKHF1YWwpO1xyXG4gICAgICAgICAgICBtZWRpYUVsZW1lbnQuYXBwZW5kQ2hpbGQoYWxsb3dmdWxsc2NyZWVuKTtcclxuICAgICAgICAgICAgbWVkaWFFbGVtZW50LmFwcGVuZENoaWxkKGFsbG93c2NyaXB0YWNjZXNzKTtcclxuICAgICAgICAgICAgbWVkaWFFbGVtZW50LmFwcGVuZENoaWxkKGZsYXNodmFycyk7XHJcblxyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobWVkaWFFbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1lZGlhRWxlbWVudDtcclxuICAgIH07XHJcblxyXG4gICAgdGhhdC5jcmVhdGUgPSAoKSA9PntcclxuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJNZWRpYU1hbmFnZXIgY3JlYXRlRWxlbWVudCgpXCIpO1xyXG4gICAgICAgIGlmKG1lZGlhRWxlbWVudCl7XHJcbiAgICAgICAgICAgIHRoYXQuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3JlYXRlTWVkaWFFbGVtZW50KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoYXQuZGVzdHJveSA9ICgpID0+e1xyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIk1lZGlhTWFuYWdlciByZW1vdmVFbGVtZW50KClcIik7XHJcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKG1lZGlhRWxlbWVudCk7XHJcbiAgICAgICAgbWVkaWFFbGVtZW50ID0gbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHRoYXQ7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYW5hZ2VyO1xyXG4iLCJpbXBvcnQge1xyXG4gICAgRVJST1IsXHJcbiAgICBTVEFURV9JRExFLFxyXG4gICAgU1RBVEVfUExBWUlORyxcclxuICAgIFNUQVRFX1NUQUxMRUQsXHJcbiAgICBTVEFURV9MT0FESU5HLFxyXG4gICAgU1RBVEVfQ09NUExFVEUsXHJcbiAgICBTVEFURV9QQVVTRUQsXHJcbiAgICBTVEFURV9FUlJPUixcclxuICAgIENPTlRFTlRfQ09NUExFVEUsXHJcbiAgICBDT05URU5UX1NFRUssXHJcbiAgICBDT05URU5UX0JVRkZFUl9GVUxMLFxyXG4gICAgQ09OVEVOVF9TRUVLRUQsXHJcbiAgICBDT05URU5UX0JVRkZFUixcclxuICAgIENPTlRFTlRfVElNRSxcclxuICAgIENPTlRFTlRfVk9MVU1FLFxyXG4gICAgQ09OVEVOVF9NRVRBLFxyXG4gICAgUExBWUVSX1VOS05XT05fRVJST1IsXHJcbiAgICBQTEFZRVJfVU5LTldPTl9PUEVSQVRJT05fRVJST1IsXHJcbiAgICBQTEFZRVJfVU5LTldPTl9ORVdXT1JLX0VSUk9SLFxyXG4gICAgUExBWUVSX1VOS05XT05fREVDT0RFX0VSUk9SLFxyXG4gICAgUExBWUVSX0ZJTEVfRVJST1IsXHJcbiAgICBQUk9WSURFUl9IVE1MNSxcclxuICAgIFBST1ZJREVSX1dFQlJUQyxcclxuICAgIFBST1ZJREVSX0RBU0gsXHJcbiAgICBQUk9WSURFUl9ITFNcclxufSBmcm9tIFwiYXBpL2NvbnN0YW50c1wiO1xyXG5pbXBvcnQge2V4dHJhY3RWaWRlb0VsZW1lbnQsIHNlcGFyYXRlTGl2ZX0gZnJvbSBcImFwaS9wcm92aWRlci91dGlsc1wiO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAYnJpZWYgICBUcmlnZ2VyIG9uIHZhcmlvdXMgdmlkZW8gZXZlbnRzLlxyXG4gKiBAcGFyYW0gICBleHRlbmRlZEVsZW1lbnQgZXh0ZW5kZWQgbWVkaWEgb2JqZWN0IGJ5IG1zZS5cclxuICogQHBhcmFtICAgUHJvdmlkZXIgcHJvdmlkZXIgIGh0bWw1UHJvdmlkZXJcclxuICogKi9cclxuXHJcblxyXG5jb25zdCBMaXN0ZW5lciA9IGZ1bmN0aW9uKGV4dGVuZGVkRWxlbWVudCwgcHJvdmlkZXIpe1xyXG4gICAgY29uc3QgbG93TGV2ZWxFdmVudHMgPSB7fTtcclxuXHJcbiAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJFdmVudExpc3RlbmVyIGxvYWRlZC5cIixleHRlbmRlZEVsZW1lbnQgLHByb3ZpZGVyICk7XHJcbiAgICBjb25zdCB0aGF0ID0ge307XHJcblxyXG4gICAgbGV0IGVsVmlkZW8gPSBleHRyYWN0VmlkZW9FbGVtZW50KGV4dGVuZGVkRWxlbWVudCk7XHJcbiAgICBjb25zdCBiZXR3ZWVuID0gZnVuY3Rpb24gKG51bSwgbWluLCBtYXgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5taW4obnVtLCBtYXgpLCBtaW4pO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgb25FcnJvciA9IGZ1bmN0aW9uKGVycm9yKXtcclxuICAgICAgICBwcm92aWRlci5zZXRTdGF0ZShTVEFURV9FUlJPUik7XHJcbiAgICAgICAgcHJvdmlkZXIucGF1c2UoKTtcclxuXHJcbiAgICAgICAgLy9QUklWQVRFX1NUQVRFX0VSUk9SXHJcbiAgICAgICAgcHJvdmlkZXIudHJpZ2dlcihFUlJPUiwgZXJyb3IpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL0ZpcmVzIHdoZW4gdGhlIGJyb3dzZXIgY2FuIHN0YXJ0IHBsYXlpbmcgdGhlIGF1ZGlvL3ZpZGVvXHJcbiAgICBsb3dMZXZlbEV2ZW50cy5jYW5wbGF5ID0gKCkgPT4ge1xyXG4gICAgICAgIHByb3ZpZGVyLnNldENhblNlZWsodHJ1ZSk7XHJcbiAgICAgICAgcHJvdmlkZXIudHJpZ2dlcihDT05URU5UX0JVRkZFUl9GVUxMKTtcclxuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJFdmVudExpc3RlbmVyIDogb24gY2FucGxheVwiKTtcclxuICAgIH07XHJcbiAgICAvL0ZpcmVzIHdoZW4gdGhlIGR1cmF0aW9uIG9mIHRoZSBhdWRpby92aWRlbyBpcyBjaGFuZ2VkXHJcbiAgICBsb3dMZXZlbEV2ZW50cy5kdXJhdGlvbmNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICBsb3dMZXZlbEV2ZW50cy5wcm9ncmVzcygpO1xyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkV2ZW50TGlzdGVuZXIgOiBvbiBkdXJhdGlvbmNoYW5nZVwiKTtcclxuICAgIH07XHJcbiAgICAvL0ZpcmVzIHdoZW4gdGhlIGN1cnJlbnQgcGxheWxpc3QgaXMgZW5kZWRcclxuICAgIGxvd0xldmVsRXZlbnRzLmVuZGVkID0gKCkgPT4ge1xyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkV2ZW50TGlzdGVuZXIgOiBvbiBlbmRlZFwiKTtcclxuICAgICAgICBpZihwcm92aWRlci5nZXRTdGF0ZSgpICE9IFNUQVRFX0lETEUgJiYgcHJvdmlkZXIuZ2V0U3RhdGUoKSAhPSBTVEFURV9DT01QTEVURSl7XHJcbiAgICAgICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoQ09OVEVOVF9DT01QTEVURSk7XHJcbiAgICAgICAgICAgIHByb3ZpZGVyLnNldFN0YXRlKFNUQVRFX0NPTVBMRVRFKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLy9GaXJlcyB3aGVuIHRoZSBicm93c2VyIGhhcyBsb2FkZWQgdGhlIGN1cnJlbnQgZnJhbWUgb2YgdGhlIGF1ZGlvL3ZpZGVvXHJcbiAgICBsb3dMZXZlbEV2ZW50cy5sb2FkZWRkYXRhID0gKCkgPT4ge1xyXG4gICAgICAgIC8vRG8gbm90aGluZyBCZWNhdXNlIHRoaXMgY2F1c2VzIGNoYW9zIGJ5IGxvYWRlZG1ldGFkYXRhLlxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgdmFyIG1ldGFkYXRhID0ge1xyXG4gICAgICAgICAgICBkdXJhdGlvbjogZWxWaWRlby5kdXJhdGlvbixcclxuICAgICAgICAgICAgaGVpZ2h0OiBlbFZpZGVvLnZpZGVvSGVpZ2h0LFxyXG4gICAgICAgICAgICB3aWR0aDogZWxWaWRlby52aWRlb1dpZHRoXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwcm92aWRlci50cmlnZ2VyKENPTlRFTlRfTUVUQSwgbWV0YWRhdGEpOyovXHJcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiRXZlbnRMaXN0ZW5lciA6IG9uIGxvYWRlZGRhdGFcIik7XHJcbiAgICB9O1xyXG4gICAgLy9GaXJlcyB3aGVuIHRoZSBicm93c2VyIGhhcyBsb2FkZWQgbWV0YSBkYXRhIGZvciB0aGUgYXVkaW8vdmlkZW9cclxuICAgIGxvd0xldmVsRXZlbnRzLmxvYWRlZG1ldGFkYXRhID0gKCkgPT4ge1xyXG4gICAgICAgIGxldCBpc0xpdmUgPSAoZWxWaWRlby5kdXJhdGlvbiA9PT0gSW5maW5pdHkpID8gdHJ1ZSA6IHNlcGFyYXRlTGl2ZShleHRlbmRlZEVsZW1lbnQpO1xyXG4gICAgICAgIGxldCBzb3VyY2VzID0gcHJvdmlkZXIuZ2V0U291cmNlcygpO1xyXG4gICAgICAgIGxldCBzb3VyY2VJbmRleCA9IHByb3ZpZGVyLmdldEN1cnJlbnRTb3VyY2UoKTtcclxuICAgICAgICBsZXQgdHlwZSA9IHNvdXJjZUluZGV4ID4gLTEgPyBzb3VyY2VzW3NvdXJjZUluZGV4XS50eXBlIDogXCJcIjtcclxuICAgICAgICB2YXIgbWV0YWRhdGEgPSB7XHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiBpc0xpdmUgPyAgSW5maW5pdHkgOiBlbFZpZGVvLmR1cmF0aW9uLFxyXG4gICAgICAgICAgICB0eXBlIDp0eXBlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiRXZlbnRMaXN0ZW5lciA6IG9uIGxvYWRlZG1ldGFkYXRhXCIsIG1ldGFkYXRhKTtcclxuICAgICAgICBwcm92aWRlci50cmlnZ2VyKENPTlRFTlRfTUVUQSwgbWV0YWRhdGEpO1xyXG4gICAgfTtcclxuICAgIC8vRmlyZXMgd2hlbiB0aGUgYXVkaW8vdmlkZW8gaGFzIGJlZW4gcGF1c2VkXHJcbiAgICBsb3dMZXZlbEV2ZW50cy5wYXVzZSA9ICgpID0+IHtcclxuICAgICAgICBpZihwcm92aWRlci5nZXRTdGF0ZSgpID09PSBTVEFURV9DT01QTEVURSB8fHByb3ZpZGVyLmdldFN0YXRlKCkgPT09IFNUQVRFX0VSUk9SKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlbFZpZGVvLmVuZGVkKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlbFZpZGVvLmVycm9yKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlbFZpZGVvLmN1cnJlbnRUaW1lID09PSBlbFZpZGVvLmR1cmF0aW9uKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJFdmVudExpc3RlbmVyIDogb24gcGF1c2VcIik7XHJcbiAgICAgICAgcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfUEFVU0VEKTtcclxuICAgIH07XHJcbiAgICAvL0ZpcmVzIHdoZW4gdGhlIGF1ZGlvL3ZpZGVvIGhhcyBiZWVuIHN0YXJ0ZWQgb3IgaXMgbm8gbG9uZ2VyIHBhdXNlZFxyXG4gICAgbG93TGV2ZWxFdmVudHMucGxheSA9ICgpID0+IHtcclxuICAgICAgICBpZiAoIWVsVmlkZW8ucGF1c2VkICYmIHByb3ZpZGVyLmdldFN0YXRlKCkgIT09IFNUQVRFX1BMQVlJTkcpIHtcclxuICAgICAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiRXZlbnRMaXN0ZW5lciA6IG9uIHBsYXlcIik7XHJcbiAgICAgICAgICAgIHByb3ZpZGVyLnNldFN0YXRlKFNUQVRFX0xPQURJTkcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG4gICAgLy9GaXJlcyB3aGVuIHRoZSBhdWRpby92aWRlbyBpcyBwbGF5aW5nIGFmdGVyIGhhdmluZyBiZWVuIHBhdXNlZCBvciBzdG9wcGVkIGZvciBidWZmZXJpbmdcclxuICAgIGxvd0xldmVsRXZlbnRzLnBsYXlpbmcgPSAoKSA9PiB7XHJcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiRXZlbnRMaXN0ZW5lciA6IG9uIHBsYXlpbmdcIik7XHJcbiAgICAgICAgcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfUExBWUlORyk7XHJcbiAgICAgICAgLy9wcm92aWRlci50cmlnZ2VyKFBST1ZJREVSX0ZJUlNUX0ZSQU1FKTtcclxuICAgIH07XHJcbiAgICAvL0ZpcmVzIHdoZW4gdGhlIGJyb3dzZXIgaXMgZG93bmxvYWRpbmcgdGhlIGF1ZGlvL3ZpZGVvXHJcbiAgICBsb3dMZXZlbEV2ZW50cy5wcm9ncmVzcyA9ICgpID0+IHtcclxuICAgICAgICBsZXQgdGltZVJhbmdlcyA9IGVsVmlkZW8uYnVmZmVyZWQ7XHJcbiAgICAgICAgaWYoIXRpbWVSYW5nZXMgKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGR1cmF0aW9uID0gZWxWaWRlby5kdXJhdGlvbiwgcG9zaXRpb24gPSBlbFZpZGVvLmN1cnJlbnRUaW1lO1xyXG4gICAgICAgIGxldCBidWZmZXJlZCA9IGJldHdlZW4oICh0aW1lUmFuZ2VzLmxlbmd0aD4gMCA/IHRpbWVSYW5nZXMuZW5kKHRpbWVSYW5nZXMubGVuZ3RoIC0gMSkgOiAwICkgLyBkdXJhdGlvbiwgMCwgMSk7XHJcblxyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkV2ZW50TGlzdGVuZXIgOiBvbiBwcm9ncmVzc1wiLCBidWZmZXJlZCoxMDApO1xyXG5cclxuICAgICAgICBwcm92aWRlci5zZXRCdWZmZXIoYnVmZmVyZWQqMTAwKTtcclxuICAgICAgICBwcm92aWRlci50cmlnZ2VyKENPTlRFTlRfQlVGRkVSLCB7XHJcbiAgICAgICAgICAgIGJ1ZmZlclBlcmNlbnQ6IGJ1ZmZlcmVkKjEwMCxcclxuICAgICAgICAgICAgcG9zaXRpb246ICBwb3NpdGlvbixcclxuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgLy9GaXJlcyB3aGVuIHRoZSBicm93c2VyIGlzIHRyeWluZyB0byBnZXQgbWVkaWEgZGF0YSwgYnV0IGRhdGEgaXMgbm90IGF2YWlsYWJsZVxyXG4gICAgbG93TGV2ZWxFdmVudHMuc3RhbGxlZCA9ICgpID0+IHtcclxuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJFdmVudExpc3RlbmVyIDogb24gc3RhbGxcIik7XHJcbiAgICB9O1xyXG4gICAgLy9GaXJlcyB3aGVuIHRoZSBjdXJyZW50IHBsYXliYWNrIHBvc2l0aW9uIGhhcyBjaGFuZ2VkXHJcbiAgICBsb3dMZXZlbEV2ZW50cy50aW1ldXBkYXRlID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZWxWaWRlby5jdXJyZW50VGltZTtcclxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGVsVmlkZW8uZHVyYXRpb247XHJcbiAgICAgICAgaWYgKGlzTmFOKGR1cmF0aW9uKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZighcHJvdmlkZXIuaXNTZWVraW5nKCkgJiYgIWVsVmlkZW8ucGF1c2VkKXtcclxuICAgICAgICAgICAgcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfUExBWUlORyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qT3ZlblBsYXllckNvbnNvbGUubG9nKFwiRXZlbnRMaXN0ZW5lciA6IG9uIHRpbWV1cGRhdGVcIiAsIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb25cclxuICAgICAgICB9KTsqL1xyXG4gICAgICAgIGlmIChwcm92aWRlci5nZXRTdGF0ZSgpID09PSBTVEFURV9QTEFZSU5HIHx8IHByb3ZpZGVyLmlzU2Vla2luZygpKSB7XHJcbiAgICAgICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoQ09OVEVOVF9USU1FLCB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogZHVyYXRpb25cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcbiAgICBsb3dMZXZlbEV2ZW50cy5yZXNpemUgPSAoKSA9PiB7XHJcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiRXZlbnRMaXN0ZW5lciA6IG9uIHJlc2l6ZVwiKTtcclxuICAgIH07XHJcbiAgICBsb3dMZXZlbEV2ZW50cy5zZWVraW5nID0gKCkgPT4ge1xyXG4gICAgICAgIHByb3ZpZGVyLnNldFNlZWtpbmcodHJ1ZSk7XHJcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiRXZlbnRMaXN0ZW5lciA6IG9uIHNlZWtpbmdcIiwgZWxWaWRlby5jdXJyZW50VGltZSk7XHJcbiAgICAgICAgcHJvdmlkZXIudHJpZ2dlcihDT05URU5UX1NFRUsse1xyXG4gICAgICAgICAgICBwb3NpdGlvbiA6IGVsVmlkZW8uY3VycmVudFRpbWVcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBsb3dMZXZlbEV2ZW50cy5zZWVrZWQgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYoIXByb3ZpZGVyLmlzU2Vla2luZygpKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJFdmVudExpc3RlbmVyIDogb24gc2Vla2VkXCIpO1xyXG4gICAgICAgIHByb3ZpZGVyLnNldFNlZWtpbmcoZmFsc2UpO1xyXG4gICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoQ09OVEVOVF9TRUVLRUQpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL0ZpcmVzIHdoZW4gdGhlIHZpZGVvIHN0b3BzIGJlY2F1c2UgaXQgbmVlZHMgdG8gYnVmZmVyIHRoZSBuZXh0IGZyYW1lXHJcbiAgICBsb3dMZXZlbEV2ZW50cy53YWl0aW5nID0gKCkgPT4ge1xyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkV2ZW50TGlzdGVuZXIgOiBvbiB3YWl0aW5nXCIsIHByb3ZpZGVyLmdldFN0YXRlKCkpO1xyXG4gICAgICAgIGlmKHByb3ZpZGVyLmlzU2Vla2luZygpKXtcclxuICAgICAgICAgICAgcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfTE9BRElORyk7XHJcbiAgICAgICAgfWVsc2UgaWYocHJvdmlkZXIuZ2V0U3RhdGUoKSA9PT0gU1RBVEVfUExBWUlORyl7XHJcbiAgICAgICAgICAgIHByb3ZpZGVyLnNldFN0YXRlKFNUQVRFX1NUQUxMRUQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbG93TGV2ZWxFdmVudHMudm9sdW1lY2hhbmdlID0gKCkgPT4ge1xyXG5cclxuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJFdmVudExpc3RlbmVyIDogb24gdm9sdW1lY2hhbmdlXCIsIE1hdGgucm91bmQoZWxWaWRlby52b2x1bWUgKiAxMDApKTtcclxuICAgICAgICBwcm92aWRlci50cmlnZ2VyKENPTlRFTlRfVk9MVU1FLCB7XHJcbiAgICAgICAgICAgIHZvbHVtZTogTWF0aC5yb3VuZChlbFZpZGVvLnZvbHVtZSAqIDEwMCksXHJcbiAgICAgICAgICAgIG11dGU6IGVsVmlkZW8ubXV0ZWRcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgbG93TGV2ZWxFdmVudHMuZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY29kZSA9IChlbFZpZGVvLmVycm9yICYmIGVsVmlkZW8uZXJyb3IuY29kZSkgfHwgMDtcclxuICAgICAgICBjb25zdCBlcnJvckNvZGVHZW4gPSAoe1xyXG4gICAgICAgICAgICAwOiB7Y29kZSA6IFBMQVlFUl9VTktOV09OX0VSUk9SLCByZWFzb24gOiBcIlVua25vd24gaHRtbDUgdmlkZW8gZXJyb3JcIiwgbWVzc2FnZSA6IFwiVW5rbm93biBodG1sNSB2aWRlbyBlcnJvclwifSxcclxuICAgICAgICAgICAgMToge2NvZGUgOiBQTEFZRVJfVU5LTldPTl9PUEVSQVRJT05fRVJST1IsIHJlYXNvbiA6IFwiVW5rbm93biBvcGVyYXRpb24gYWJvcnRlZFwiLCBtZXNzYWdlIDogXCJVbmtub3duIG9wZXJhdGlvbiBhYm9ydGVkXCJ9LFxyXG4gICAgICAgICAgICAyOiB7Y29kZSA6IFBMQVlFUl9VTktOV09OX05FV1dPUktfRVJST1IsIHJlYXNvbiA6IFwiVW5rbm93biBuZXR3b3JrIGVycm9yXCIsIG1lc3NhZ2UgOiBcIlVua25vd24gbmV0d29yayBlcnJvclwifSxcclxuICAgICAgICAgICAgMzoge2NvZGUgOiBQTEFZRVJfVU5LTldPTl9ERUNPREVfRVJST1IsIHJlYXNvbiA6IFwiVW5rbm93biBkZWNvZGUgZXJyb3JcIiwgbWVzc2FnZSA6IFwiVW5rbm93biBkZWNvZGUgZXJyb3JcIn0sXHJcbiAgICAgICAgICAgIDQ6IHtjb2RlIDogUExBWUVSX0ZJTEVfRVJST1IsIHJlYXNvbiA6IFwiRmlsZSBjb3VsZCBub3QgYmUgcGxheWVkXCIsIG1lc3NhZ2UgOiBcIkZpbGUgY291bGQgbm90IGJlIHBsYXllZFwifVxyXG4gICAgICAgIH1bY29kZV18fDApO1xyXG4gICAgICAgIGVycm9yQ29kZUdlbi5lcnJvciA9IGVsVmlkZW8uZXJyb3I7XHJcblxyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkV2ZW50TGlzdGVuZXIgOiBvbiBlcnJvclwiLCBlcnJvckNvZGVHZW4pO1xyXG4gICAgICAgIG9uRXJyb3IoZXJyb3JDb2RlR2VuKTtcclxuICAgIH07XHJcblxyXG4gICAgT2JqZWN0LmtleXMobG93TGV2ZWxFdmVudHMpLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgICAgICBlbFZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBsb3dMZXZlbEV2ZW50c1tldmVudE5hbWVdKTtcclxuICAgICAgICBlbFZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBsb3dMZXZlbEV2ZW50c1tldmVudE5hbWVdKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoYXQuZGVzdHJveSA9ICgpID0+e1xyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkV2ZW50TGlzdGVuZXIgOiBkZXN0cm95KClcIik7XHJcblxyXG4gICAgICAgIE9iamVjdC5rZXlzKGxvd0xldmVsRXZlbnRzKS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICAgICAgICAgIGVsVmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxvd0xldmVsRXZlbnRzW2V2ZW50TmFtZV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB0aGF0O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTGlzdGVuZXI7IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgaG9obyBvbiAyMDE4LiA2LiAyNy4uXHJcbiAqL1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJhcGkvRXZlbnRFbWl0dGVyXCI7XHJcbmltcG9ydCBFdmVudHNMaXN0ZW5lciBmcm9tIFwiYXBpL3Byb3ZpZGVyL2h0bWw1L0xpc3RlbmVyXCI7XHJcbmltcG9ydCB7ZXh0cmFjdFZpZGVvRWxlbWVudCwgc2VwYXJhdGVMaXZlLCBwaWNrQ3VycmVudFNvdXJjZX0gZnJvbSBcImFwaS9wcm92aWRlci91dGlsc1wiO1xyXG5pbXBvcnQge1xyXG4gICAgU1RBVEVfSURMRSwgU1RBVEVfUExBWUlORywgU1RBVEVfUEFVU0VELCBTVEFURV9DT01QTEVURSxcclxuICAgIFBMQVlFUl9TVEFURSwgUExBWUVSX0NPTVBMRVRFLCBQTEFZRVJfUEFVU0UsIFBMQVlFUl9QTEFZLFxyXG4gICAgQ09OVEVOVF9USU1FLCBDT05URU5UX0NBUFRJT05fQ1VFX0NIQU5HRUQsIENPTlRFTlRfU09VUkNFX0NIQU5HRUQsXHJcbiAgICBQTEFZQkFDS19SQVRFX0NIQU5HRUQsIENPTlRFTlRfTVVURSwgUFJPVklERVJfSFRNTDUsIFBST1ZJREVSX1dFQlJUQywgUFJPVklERVJfREFTSCwgUFJPVklERVJfSExTXHJcbn0gZnJvbSBcImFwaS9jb25zdGFudHNcIjtcclxuXHJcbi8qKlxyXG4gKiBAYnJpZWYgICBDb3JlIEZvciBIdG1sNSBWaWRlby5cclxuICogQHBhcmFtICAgc3BlYyBtZW1iZXIgdmFsdWVcclxuICogQHBhcmFtICAgcGxheWVyQ29uZmlnICBwbGF5ZXIgY29uZmlnXHJcbiAqIEBwYXJhbSAgIG9uRXh0ZW5kZWRMb2FkIG9uIGxvYWQgaGFuZGxlclxyXG4gKiAqL1xyXG5jb25zdCBQcm92aWRlciA9IGZ1bmN0aW9uIChzcGVjLCBwbGF5ZXJDb25maWcsIG9uRXh0ZW5kZWRMb2FkKXtcclxuICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkNPUkUgbG9hZGVkLiBcIik7XHJcblxyXG4gICAgbGV0IHRoYXQgPXt9O1xyXG4gICAgRXZlbnRFbWl0dGVyKHRoYXQpO1xyXG5cclxuICAgIGxldCBsaXN0ZW5lciA9IEV2ZW50c0xpc3RlbmVyKHNwZWMuZXh0ZW5kZWRFbGVtZW50LCB0aGF0KTtcclxuICAgIGxldCBlbFZpZGVvID0gZXh0cmFjdFZpZGVvRWxlbWVudChzcGVjLmV4dGVuZGVkRWxlbWVudCk7XHJcbiAgICBsZXQgcG9zdGVySW1hZ2UgPSBwbGF5ZXJDb25maWcuZ2V0Q29uZmlnKCkuaW1hZ2V8fFwiXCI7XHJcbiAgICBlbFZpZGVvLnBsYXliYWNrUmF0ZSA9IGVsVmlkZW8uZGVmYXVsdFBsYXliYWNrUmF0ZSA9IHBsYXllckNvbmZpZy5nZXREZWZhdWx0UGxheWJhY2tSYXRlKCk7XHJcblxyXG5cclxuICAgIGNvbnN0IF9sb2FkID0gKGxhc3RQbGF5UG9zaXRpb24pID0+e1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZSA9ICBzcGVjLnNvdXJjZXNbc3BlYy5jdXJyZW50U291cmNlXTtcclxuICAgICAgICBzcGVjLmZyYW1lcmF0ZSA9IHNvdXJjZS5mcmFtZXJhdGU7XHJcbiAgICAgICAgaWYob25FeHRlbmRlZExvYWQpe1xyXG4gICAgICAgICAgICBvbkV4dGVuZGVkTG9hZChzb3VyY2UsIGxhc3RQbGF5UG9zaXRpb24pO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJzb3VyY2UgbG9hZGVkIDogXCIsIHNvdXJjZSwgXCJsYXN0UGxheVBvc2l0aW9uIDogXCIrIGxhc3RQbGF5UG9zaXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgcHJldmlvdXNTb3VyY2UgPSBlbFZpZGVvLnNyYztcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xyXG5cclxuICAgICAgICAgICAgc291cmNlRWxlbWVudC5zcmMgPSBzb3VyY2UuZmlsZTtcclxuICAgICAgICAgICAgY29uc3Qgc291cmNlQ2hhbmdlZCA9IChzb3VyY2VFbGVtZW50LnNyYyAhPT0gcHJldmlvdXNTb3VyY2UpO1xyXG4gICAgICAgICAgICBpZiAoc291cmNlQ2hhbmdlZCkge1xyXG4gICAgICAgICAgICAgICAgZWxWaWRlby5zcmMgPSBzcGVjLnNvdXJjZXNbc3BlYy5jdXJyZW50U291cmNlXS5maWxlO1xyXG4gICAgICAgICAgICAgICAgLy8gRG8gbm90IGNhbGwgbG9hZCBpZiBzcmMgd2FzIG5vdCBzZXQuIGxvYWQoKSB3aWxsIGNhbmNlbCBhbnkgYWN0aXZlIHBsYXkgcHJvbWlzZS5cclxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c1NvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsVmlkZW8ubG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZihsYXN0UGxheVBvc2l0aW9uID09PSAwICYmIGVsVmlkZW8uY3VycmVudFRpbWUgPiAwKXtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2VlayhsYXN0UGxheVBvc2l0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihsYXN0UGxheVBvc2l0aW9uID4gMCl7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNlZWsobGFzdFBsYXlQb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKnRoYXQudHJpZ2dlcihDT05URU5UX1NPVVJDRV9DSEFOR0VELCB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlOiBzcGVjLmN1cnJlbnRTb3VyY2VcclxuICAgICAgICAgICAgfSk7Ki9cclxuXHJcbiAgICAgICAgICAgIGlmKHBvc3RlckltYWdlKXtcclxuICAgICAgICAgICAgICAgIGVsVmlkZW8ucG9zdGVyID0gcG9zdGVySW1hZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoYXQuZ2V0TmFtZSA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gc3BlYy5uYW1lO1xyXG4gICAgfTtcclxuICAgIHRoYXQuY2FuU2VlayA9ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gc3BlYy5jYW5TZWVrO1xyXG4gICAgfTtcclxuICAgIHRoYXQuc2V0Q2FuU2VlayA9IChjYW5TZWVrKSA9PiB7XHJcbiAgICAgICAgc3BlYy5jYW5TZWVrID0gY2FuU2VlaztcclxuICAgIH07XHJcbiAgICB0aGF0LmlzU2Vla2luZyA9ICgpPT57XHJcbiAgICAgICAgcmV0dXJuIHNwZWMuc2Vla2luZztcclxuICAgIH07XHJcbiAgICB0aGF0LnNldFNlZWtpbmcgPSAoc2Vla2luZyk9PntcclxuICAgICAgICBzcGVjLnNlZWtpbmcgPSBzZWVraW5nO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGF0LnNldFN0YXRlID0gKG5ld1N0YXRlKSA9PiB7XHJcbiAgICAgICAgaWYoc3BlYy5zdGF0ZSAhPT0gbmV3U3RhdGUpe1xyXG4gICAgICAgICAgICBsZXQgcHJldlN0YXRlID0gc3BlYy5zdGF0ZTtcclxuICAgICAgICAgICAgc3dpdGNoKG5ld1N0YXRlKXtcclxuICAgICAgICAgICAgICAgIGNhc2UgU1RBVEVfQ09NUExFVEUgOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlcihQTEFZRVJfQ09NUExFVEUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBTVEFURV9QQVVTRUQgOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlcihQTEFZRVJfUEFVU0UsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlN0YXRlOiBzcGVjLnN0YXRlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNUQVRFX1BMQVlJTkcgOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQudHJpZ2dlcihQTEFZRVJfUExBWSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2U3RhdGU6IHNwZWMuc3RhdGVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzcGVjLnN0YXRlID0gbmV3U3RhdGU7XHJcbiAgICAgICAgICAgIHRoYXQudHJpZ2dlcihQTEFZRVJfU1RBVEUsIHtcclxuICAgICAgICAgICAgICAgIHByZXZzdGF0ZSA6IHByZXZTdGF0ZSxcclxuICAgICAgICAgICAgICAgIG5ld3N0YXRlOiBzcGVjLnN0YXRlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGF0LmdldFN0YXRlID0gKCkgPT57XHJcbiAgICAgICAgcmV0dXJuIHNwZWMuc3RhdGU7XHJcbiAgICB9O1xyXG4gICAgdGhhdC5zZXRCdWZmZXIgPSAobmV3QnVmZmVyKSA9PiB7XHJcbiAgICAgICAgc3BlYy5idWZmZXIgPSBuZXdCdWZmZXI7XHJcbiAgICB9O1xyXG4gICAgdGhhdC5nZXRCdWZmZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHNwZWMuYnVmZmVyO1xyXG4gICAgfTtcclxuICAgIHRoYXQuZ2V0RHVyYXRpb24gPSAoKSA9PiB7XHJcbiAgICAgICAgbGV0IGlzTGl2ZSA9IChlbFZpZGVvLmR1cmF0aW9uID09PSBJbmZpbml0eSkgPyB0cnVlIDogc2VwYXJhdGVMaXZlKHNwZWMuZXh0ZW5kZWRFbGVtZW50KTtcclxuICAgICAgICByZXR1cm4gaXNMaXZlID8gIEluZmluaXR5IDogZWxWaWRlby5kdXJhdGlvbjtcclxuICAgIH07XHJcbiAgICB0aGF0LmdldFBvc2l0aW9uID0gKCkgPT4ge1xyXG4gICAgICAgIGlmKCFlbFZpZGVvKXtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlbFZpZGVvLmN1cnJlbnRUaW1lO1xyXG4gICAgfTtcclxuICAgIHRoYXQuc2V0Vm9sdW1lID0gKHZvbHVtZSkgPT57XHJcbiAgICAgICAgaWYoIWVsVmlkZW8pe1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsVmlkZW8udm9sdW1lID0gdm9sdW1lLzEwMDtcclxuICAgIH07XHJcbiAgICB0aGF0LmdldFZvbHVtZSA9ICgpID0+e1xyXG4gICAgICAgIGlmKCFlbFZpZGVvKXtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlbFZpZGVvLnZvbHVtZSoxMDA7XHJcbiAgICB9O1xyXG4gICAgdGhhdC5zZXRNdXRlID0gKHN0YXRlKSA9PntcclxuICAgICAgICBpZighZWxWaWRlbyl7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHJcbiAgICAgICAgICAgIGVsVmlkZW8ubXV0ZWQgPSAhZWxWaWRlby5tdXRlZDtcclxuXHJcbiAgICAgICAgICAgIHRoYXQudHJpZ2dlcihDT05URU5UX01VVEUsIHtcclxuICAgICAgICAgICAgICAgIG11dGU6IGVsVmlkZW8ubXV0ZWRcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBlbFZpZGVvLm11dGVkID0gc3RhdGU7XHJcblxyXG4gICAgICAgICAgICB0aGF0LnRyaWdnZXIoQ09OVEVOVF9NVVRFLCB7XHJcbiAgICAgICAgICAgICAgICBtdXRlOiBlbFZpZGVvLm11dGVkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxWaWRlby5tdXRlZDtcclxuICAgIH07XHJcbiAgICB0aGF0LmdldE11dGUgPSAoKSA9PntcclxuICAgICAgICBpZighZWxWaWRlbyl7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVsVmlkZW8ubXV0ZWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoYXQucHJlbG9hZCA9IChzb3VyY2VzLCBsYXN0UGxheVBvc2l0aW9uKSA9PntcclxuICAgICAgICBzcGVjLnNvdXJjZXMgPSBzb3VyY2VzO1xyXG4gICAgICAgIHNwZWMuY3VycmVudFNvdXJjZSA9IHBpY2tDdXJyZW50U291cmNlKHNvdXJjZXMsIHNwZWMuY3VycmVudFNvdXJjZSwgcGxheWVyQ29uZmlnKTtcclxuICAgICAgICBfbG9hZChsYXN0UGxheVBvc2l0aW9uIHx8IDApO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfTtcclxuICAgIHRoYXQubG9hZCA9IChzb3VyY2VzKSA9PntcclxuICAgICAgICBzcGVjLnNvdXJjZXMgPSBzb3VyY2VzO1xyXG4gICAgICAgIHNwZWMuY3VycmVudFNvdXJjZSA9IHBpY2tDdXJyZW50U291cmNlKHNvdXJjZXMsIHNwZWMuY3VycmVudFNvdXJjZSwgcGxheWVyQ29uZmlnKTtcclxuICAgICAgICBfbG9hZChzcGVjLnNvdXJjZXMuc3RhcnR0aW1lIHx8IDApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGF0LnBsYXkgPSAoKSA9PntcclxuICAgICAgICBpZighZWxWaWRlbyl7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoYXQuZ2V0U3RhdGUoKSAhPT0gU1RBVEVfUExBWUlORyl7XHJcbiAgICAgICAgICAgIGxldCBwcm9taXNlID0gZWxWaWRlby5wbGF5KCk7XHJcbiAgICAgICAgICAgIGlmIChwcm9taXNlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHByb21pc2UudGhlbihfID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBBdXRvcGxheSBzdGFydGVkIVxyXG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vQ2FuJ3QgcGxheSBiZWNhdXNlIFVzZXIgZG9lc24ndCBhbnkgaW50ZXJhY3Rpb25zLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vV2FpdCBmb3IgVXNlciBJbnRlcmFjdGlvbnMuIChsaWtlIGNsaWNrKVxyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhhdC5wYXVzZSA9ICgpID0+e1xyXG4gICAgICAgIGlmKCFlbFZpZGVvKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGF0LmdldFN0YXRlKCkgPT09IFNUQVRFX1BMQVlJTkcpe1xyXG4gICAgICAgICAgICBlbFZpZGVvLnBhdXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRoYXQuc2VlayA9IChwb3NpdGlvbikgPT57XHJcbiAgICAgICAgaWYoIWVsVmlkZW8pe1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsVmlkZW8uY3VycmVudFRpbWUgPSBwb3NpdGlvbjtcclxuICAgIH07XHJcbiAgICB0aGF0LnNldFBsYXliYWNrUmF0ZSA9IChwbGF5YmFja1JhdGUpID0+e1xyXG4gICAgICAgIGlmKCFlbFZpZGVvKXtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGF0LnRyaWdnZXIoUExBWUJBQ0tfUkFURV9DSEFOR0VELCB7cGxheWJhY2tSYXRlIDogcGxheWJhY2tSYXRlfSk7XHJcbiAgICAgICAgcmV0dXJuIGVsVmlkZW8ucGxheWJhY2tSYXRlID0gZWxWaWRlby5kZWZhdWx0UGxheWJhY2tSYXRlID0gcGxheWJhY2tSYXRlO1xyXG4gICAgfTtcclxuICAgIHRoYXQuZ2V0UGxheWJhY2tSYXRlID0gKCkgPT57XHJcbiAgICAgICAgaWYoIWVsVmlkZW8pe1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVsVmlkZW8ucGxheWJhY2tSYXRlO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGF0LmdldFNvdXJjZXMgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYoIWVsVmlkZW8pe1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3BlYy5zb3VyY2VzLm1hcChmdW5jdGlvbihzb3VyY2UsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmaWxlOiBzb3VyY2UuZmlsZSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IHNvdXJjZS50eXBlLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IHNvdXJjZS5sYWJlbCxcclxuICAgICAgICAgICAgICAgIGluZGV4IDogaW5kZXhcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICB0aGF0LmdldEN1cnJlbnRTb3VyY2UgPSAoKSA9PntcclxuICAgICAgICByZXR1cm4gc3BlYy5jdXJyZW50U291cmNlO1xyXG4gICAgfTtcclxuICAgIHRoYXQuc2V0Q3VycmVudFNvdXJjZSA9IChzb3VyY2VJbmRleCwgbmVlZFByb3ZpZGVyQ2hhbmdlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKHNwZWMuY3VycmVudFNvdXJjZSA9PT0gc291cmNlSW5kZXgpe1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihzb3VyY2VJbmRleCA+IC0xKXtcclxuICAgICAgICAgICAgaWYoc3BlYy5zb3VyY2VzICYmIHNwZWMuc291cmNlcy5sZW5ndGggPiBzb3VyY2VJbmRleCl7XHJcbiAgICAgICAgICAgICAgICAvL3RoYXQucGF1c2UoKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoU1RBVEVfSURMRSk7XHJcbiAgICAgICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJzb3VyY2UgY2hhbmdlZCA6IFwiICsgc291cmNlSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgc3BlYy5jdXJyZW50U291cmNlID0gc291cmNlSW5kZXg7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhhdC50cmlnZ2VyKENPTlRFTlRfU09VUkNFX0NIQU5HRUQsIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlOiBzb3VyY2VJbmRleFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJDb25maWcuc2V0U291cmNlTGFiZWwoc3BlYy5zb3VyY2VzW3NvdXJjZUluZGV4XS5sYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAvL3NwZWMuY3VycmVudFF1YWxpdHkgPSBzb3VyY2VJbmRleDtcclxuICAgICAgICAgICAgICAgIGlmKG5lZWRQcm92aWRlckNoYW5nZSl7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF9sb2FkKGVsVmlkZW8uY3VycmVudFRpbWUgfHwgMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BlYy5jdXJyZW50U291cmNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdGhhdC5nZXRRdWFsaXR5TGV2ZWxzID0gKCkgPT4ge1xyXG4gICAgICAgIGlmKCFlbFZpZGVvKXtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3BlYy5xdWFsaXR5TGV2ZWxzO1xyXG4gICAgfTtcclxuICAgIHRoYXQuZ2V0Q3VycmVudFF1YWxpdHkgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYoIWVsVmlkZW8pe1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNwZWMuY3VycmVudFF1YWxpdHk7XHJcbiAgICB9O1xyXG4gICAgdGhhdC5zZXRDdXJyZW50UXVhbGl0eSA9IChxdWFsaXR5SW5kZXgpID0+IHtcclxuICAgICAgICAvL0RvIG5vdGhpbmdcclxuICAgIH07XHJcbiAgICB0aGF0LmlzQXV0b1F1YWxpdHkgPSAoKSA9PiB7XHJcbiAgICAgICAgLy9EbyBub3RoaW5nXHJcbiAgICB9O1xyXG4gICAgdGhhdC5zZXRBdXRvUXVhbGl0eSA9IChpc0F1dG8pID0+IHtcclxuICAgICAgICAvL0RvIG5vdGhpbmdcclxuICAgIH07XHJcblxyXG4gICAgdGhhdC5nZXRGcmFtZXJhdGUgPSAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHNwZWMuZnJhbWVyYXRlO1xyXG4gICAgfTtcclxuICAgIHRoYXQuc2V0RnJhbWVyYXRlID0gKGZyYW1lcmF0ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiBzcGVjLmZyYW1lcmF0ZSA9IGZyYW1lcmF0ZTtcclxuICAgIH07XHJcbiAgICB0aGF0LnNlZWtGcmFtZSA9IChmcmFtZUNvdW50KSA9PntcclxuICAgICAgICBsZXQgZnBzID0gc3BlYy5mcmFtZXJhdGU7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRGcmFtZXMgPSBlbFZpZGVvLmN1cnJlbnRUaW1lICogZnBzO1xyXG4gICAgICAgIGxldCBuZXdQb3NpdGlvbiA9IChjdXJyZW50RnJhbWVzICsgZnJhbWVDb3VudCkgLyBmcHM7XHJcbiAgICAgICAgbmV3UG9zaXRpb24gPSBuZXdQb3NpdGlvbiArIDAuMDAwMDE7IC8vIEZJWEVTIEEgU0FGQVJJIFNFRUsgSVNTVUUuIG15VmRpZW8uY3VycmVudFRpbWUgPSAwLjA0IHdvdWxkIGdpdmUgU01QVEUgMDA6MDA6MDA6MDAgd2hlcmFzIGl0IHNob3VsZCBnaXZlIDAwOjAwOjAwOjAxXHJcblxyXG4gICAgICAgIHRoYXQucGF1c2UoKTtcclxuICAgICAgICB0aGF0LnNlZWsobmV3UG9zaXRpb24pO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGF0LnN0b3AgPSAoKSA9PntcclxuICAgICAgICBpZighZWxWaWRlbyl7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiQ09SRSA6IHN0b3AoKSBcIik7XHJcbiAgICAgICAgZWxWaWRlby5yZW1vdmVBdHRyaWJ1dGUoJ3ByZWxvYWQnKTtcclxuICAgICAgICBlbFZpZGVvLnJlbW92ZUF0dHJpYnV0ZSgnc3JjJyk7XHJcbiAgICAgICAgd2hpbGUgKGVsVmlkZW8uZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICBlbFZpZGVvLnJlbW92ZUNoaWxkKGVsVmlkZW8uZmlyc3RDaGlsZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoYXQucGF1c2UoKTtcclxuICAgICAgICB0aGF0LnNldFN0YXRlKFNUQVRFX0lETEUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGF0LmRlc3Ryb3kgPSAoKSA9PntcclxuICAgICAgICBpZighZWxWaWRlbyl7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhhdC5zdG9wKCk7XHJcbiAgICAgICAgbGlzdGVuZXIuZGVzdHJveSgpO1xyXG4gICAgICAgIC8vZWxWaWRlby5yZW1vdmUoKTtcclxuICAgICAgICB0aGF0Lm9mZigpO1xyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIkNPUkUgOiBkZXN0cm95KCkgcGxheWVyIHN0b3AsIGxpc3RlbmVyLCBldmVudCBkZXN0cm9pZWRcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vWFhYIDogSSBob3BlIHVzaW5nIGVzNiBjbGFzc2VzLiBidXQgSSB0aGluayB0byBvY2N1ciBwcm9ibGVtIGZyb20gT2xkIElFLiBUaGVuIEkgY2hvaWNlIGZ1bmN0aW9uIGluaGVyaXQuIEZpbmFsbHkgdXNpbmcgc3VwZXIgZnVuY3Rpb24gaXMgc28gZGlmZmljdWx0LlxyXG4gICAgLy8gdXNlIDogbGV0IHN1cGVyX2Rlc3Ryb3kgID0gdGhhdC5zdXBlcignZGVzdHJveScpOyAuLi4gc3VwZXJfZGVzdHJveSgpO1xyXG4gICAgdGhhdC5zdXBlciA9IChuYW1lKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbWV0aG9kID0gdGhhdFtuYW1lXTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIHRoYXQ7XHJcblxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUHJvdmlkZXI7XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGhvaG8gb24gMjAxOC4gMTEuIDEyLi5cclxuICovXHJcbmltcG9ydCB7RVJST1IsIFNUQVRFX0VSUk9SfSBmcm9tIFwiYXBpL2NvbnN0YW50c1wiO1xyXG5pbXBvcnQgXyBmcm9tIFwidXRpbHMvdW5kZXJzY29yZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGV4dHJhY3RWaWRlb0VsZW1lbnQgPSBmdW5jdGlvbihleHRlbmRlZEVsZW1lbnQpIHtcclxuICAgIGlmKF8uaXNFbGVtZW50KGV4dGVuZGVkRWxlbWVudCkpe1xyXG4gICAgICAgIHJldHVybiBleHRlbmRlZEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICBpZihleHRlbmRlZEVsZW1lbnQuZ2V0VmlkZW9FbGVtZW50KXtcclxuICAgICAgICByZXR1cm4gZXh0ZW5kZWRFbGVtZW50LmdldFZpZGVvRWxlbWVudCgpO1xyXG4gICAgfWVsc2UgaWYoZXh0ZW5kZWRFbGVtZW50Lm1lZGlhKXtcclxuICAgICAgICByZXR1cm4gZXh0ZW5kZWRFbGVtZW50Lm1lZGlhO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc2VwYXJhdGVMaXZlID0gZnVuY3Rpb24oZXh0ZW5kZWRFbGVtZW50KSB7XHJcbiAgICAvL1RvRG8gOiBZb3UgY29uc2lkZXIgaGxzanMuIEJ1dCBub3Qgbm93IGJlY2F1c2Ugd2UgZG9uJ3Qgc3VwcG9ydCBobHNqcy5cclxuXHJcbiAgICBpZihleHRlbmRlZEVsZW1lbnQuaXNEeW5hbWljKXtcclxuICAgICAgICByZXR1cm4gZXh0ZW5kZWRFbGVtZW50LmlzRHluYW1pYygpO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGVycm9yVHJpZ2dlciA9IGZ1bmN0aW9uKGVycm9yLCBwcm92aWRlcil7XHJcbiAgICBwcm92aWRlci5zZXRTdGF0ZShTVEFURV9FUlJPUik7XHJcbiAgICBwcm92aWRlci5wYXVzZSgpO1xyXG4gICAgcHJvdmlkZXIudHJpZ2dlcihFUlJPUiwgZXJyb3IgKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBwaWNrQ3VycmVudFNvdXJjZSA9IChzb3VyY2VzLCBjdXJyZW50U291cmNlLCBwbGF5ZXJDb25maWcpID0+IHtcclxuICAgIGxldCBzb3VyY2VJbmRleCA9IE1hdGgubWF4KDAsIGN1cnJlbnRTb3VyY2UpO1xyXG4gICAgY29uc3QgbGFiZWwgPVwiXCI7XHJcbiAgICBpZiAoc291cmNlcykge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoc291cmNlc1tpXS5kZWZhdWx0KSB7XHJcbiAgICAgICAgICAgICAgICBzb3VyY2VJbmRleCA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBsYXllckNvbmZpZy5nZXRTb3VyY2VMYWJlbCgpICYmIHNvdXJjZXNbaV0ubGFiZWwgPT09IHBsYXllckNvbmZpZy5nZXRTb3VyY2VMYWJlbCgpICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc291cmNlSW5kZXg7XHJcbn07IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGhvaG8gb24gMjAxOC4gOC4gMjQuLlxuICovXG5cblxuZXhwb3J0IGNvbnN0IGdldEJyb3dzZXIgPSBmdW5jdGlvbigpe1xuICAgIGlmKChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJPcGVyYVwiKSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ09QUicpKSAhPSAtMSApe1xuICAgICAgICByZXR1cm4gJ29wZXJhJztcbiAgICB9ZWxzZSBpZihuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJDaHJvbWVcIikgIT0gLTEgKXtcbiAgICAgICAgcmV0dXJuICdjaHJvbWUnO1xuICAgIH1lbHNlIGlmKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIlNhZmFyaVwiKSAhPSAtMSl7XG4gICAgICAgIHJldHVybiAnc2FmYXJpJztcbiAgICB9ZWxzZSBpZihuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJGaXJlZm94XCIpICE9IC0xICl7XG4gICAgICAgIHJldHVybiAnZmlyZWZveCc7XG4gICAgfWVsc2UgaWYoKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIk1TSUVcIikgIT0gLTEgKSl7XG4gICAgICAgIGxldCBtc2llID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiTVNJRVwiKTtcbiAgICAgICAgLyppZighIWRvY3VtZW50LmRvY3VtZW50TW9kZSA9PSB0cnVlICl7XG4gICAgICAgICAgICByZXR1cm4gJ2llJztcbiAgICAgICAgfWVsc2UgaWYoISFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9UcmlkZW50LipydlxcOjExXFwuLykpe1xuICAgICAgICAgICAgaWYgKCFpc05hTihwYXJzZUludCh1YS5zdWJzdHJpbmcobXNpZSArIDUsIHVhLmluZGV4T2YoXCIuXCIsIG1zaWUpKSkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdpZSc7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3Vua25vd24nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiAndW5rbm93bic7XG4gICAgICAgIH0qL1xuICAgICAgICB2YXIgaWUgPSAoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgdmFyIHVuZGVmLFxuICAgICAgICAgICAgICAgIHYgPSAzLFxuICAgICAgICAgICAgICAgIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICAgICAgICAgIGFsbCA9IGRpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaScpO1xuXG4gICAgICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9ICc8IS0tW2lmIGd0IElFICcgKyAoKyt2KSArICddPjxpPjwvaT48IVtlbmRpZl0tLT4nLFxuICAgICAgICAgICAgICAgICAgICBhbGxbMF1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gdiA+IDQgPyB2IDogdW5kZWY7XG5cbiAgICAgICAgfSgpKTtcbiAgICAgICAgaWYoaWUgPCA5KXtcbiAgICAgICAgICAgIHJldHVybiAnb2xkSUUnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiAnbW9kZXJuSUUnO1xuICAgICAgICB9XG5cbiAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuICd1bmtub3duJztcbiAgICB9XG5cbn07XG5cbiJdLCJzb3VyY2VSb290IjoiIn0=