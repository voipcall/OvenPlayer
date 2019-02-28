/*! OvenPlayerv0.8.4 | (c)2019 AirenSoft Co., Ltd. | MIT license (https://github.com/AirenSoft/OvenPlayerPrivate/blob/master/LICENSE) | Github : https://github.com/AirenSoft/OvenPlayer */
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["ovenplayer.provider.WebRTCProvider"],{

/***/ "./src/js/api/provider/html5/providers/WebRTC.js":
/*!*******************************************************!*\
  !*** ./src/js/api/provider/html5/providers/WebRTC.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Manager = __webpack_require__(/*! api/media/Manager */ "./src/js/api/media/Manager.js");

var _Manager2 = _interopRequireDefault(_Manager);

var _Provider = __webpack_require__(/*! api/provider/html5/Provider */ "./src/js/api/provider/html5/Provider.js");

var _Provider2 = _interopRequireDefault(_Provider);

var _WebRTCLoader = __webpack_require__(/*! api/provider/html5/providers/WebRTCLoader */ "./src/js/api/provider/html5/providers/WebRTCLoader.js");

var _WebRTCLoader2 = _interopRequireDefault(_WebRTCLoader);

var _validator = __webpack_require__(/*! utils/validator */ "./src/js/utils/validator.js");

var _utils = __webpack_require__(/*! api/provider/utils */ "./src/js/api/provider/utils.js");

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @brief   webrtc provider extended core.
 * @param   container player element.
 * @param   playerConfig    config.
 * */

/**
 * Created by hoho on 2018. 6. 11..
 */
var WebRTC = function WebRTC(container, playerConfig) {
    var that = {};
    var webrtcLoader = null;
    var superDestroy_func = null;

    var mediaManager = (0, _Manager2["default"])(container, _constants.PROVIDER_WEBRTC);
    var element = mediaManager.create();

    var spec = {
        name: _constants.PROVIDER_WEBRTC,
        extendedElement: element,
        listener: null,
        canSeek: false,
        isLive: false,
        seeking: false,
        state: _constants.STATE_IDLE,
        buffer: 0,
        framerate: 0,
        currentQuality: -1,
        currentSource: -1,
        qualityLevels: [],
        sources: []
    };

    that = (0, _Provider2["default"])(spec, playerConfig, function (source) {
        if ((0, _validator.isWebRTC)(source.file, source.type)) {
            OvenPlayerConsole.log("WEBRTC : onBeforeLoad : ", source);
            if (webrtcLoader) {
                webrtcLoader.destroy();
                webrtcLoader = null;
            }
            webrtcLoader = (0, _WebRTCLoader2["default"])(that, source.file, _utils.errorTrigger);
            webrtcLoader.connect().then(function (stream) {
                element.srcObject = stream;
                that.play();
            })["catch"](function (error) {
                //that.destroy();
                //Do nothing
            });
        }
    });
    superDestroy_func = that["super"]('destroy');

    OvenPlayerConsole.log("WEBRTC PROVIDER LOADED.");

    that.destroy = function () {
        if (webrtcLoader) {
            webrtcLoader.destroy();
            webrtcLoader = null;
        }
        mediaManager.destroy();
        mediaManager = null;
        element = null;
        OvenPlayerConsole.log("WEBRTC :  PROVIDER DESTROYED.");

        superDestroy_func();
    };
    return that;
};

exports["default"] = WebRTC;

/***/ }),

/***/ "./src/js/api/provider/html5/providers/WebRTCLoader.js":
/*!*************************************************************!*\
  !*** ./src/js/api/provider/html5/providers/WebRTCLoader.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _adapter = __webpack_require__(/*! utils/adapter */ "./src/js/utils/adapter.js");

var _adapter2 = _interopRequireDefault(_adapter);

var _underscore = __webpack_require__(/*! utils/underscore */ "./src/js/utils/underscore.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var WebRTCLoader = function WebRTCLoader(provider, url, errorTrigger) {
    var url = url;
    var ws = "";
    var peerConnection = "";
    var statisticsTimer = "";
    var config = {
        'iceServers': [{
            urls: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        }, {
            urls: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        }, {
            urls: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        }, {
            urls: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        }, {
            urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        }, {
            'urls': 'stun:stun.l.google.com:19302'
        }]
    };
    var that = {};
    var answerSdp = "",
        offerSdp = "";

    (function () {
        var existingHandler = window.onbeforeunload;
        window.onbeforeunload = function (event) {
            if (existingHandler) {
                existingHandler(event);
            };
            OvenPlayerConsole.log("This calls auto when browser closed.");
            closePeer();
        };
    })();

    function initialize() {
        OvenPlayerConsole.log("WebRTCLoader connecting...");

        var onLocalDescription = function onLocalDescription(id, connection, desc) {
            connection.setLocalDescription(desc).then(function () {
                // my SDP created.
                var localSDP = connection.localDescription;
                OvenPlayerConsole.log('Local SDP', localSDP);
                answerSdp = localSDP; //test code
                // my sdp send to server.
                ws.send(JSON.stringify({
                    id: id,
                    command: "answer",
                    sdp: localSDP
                }));
            })["catch"](function (error) {
                var tempError = _constants.ERRORS[_constants.PLAYER_WEBRTC_SET_LOCAL_DESC_ERROR];
                tempError.error = error;
                closePeer(tempError);
            });
        };

        return new Promise(function (resolve, reject) {
            OvenPlayerConsole.log("WebRTCLoader url : " + url);
            try {
                ws = new WebSocket(url);
                ws.onopen = function () {
                    ws.send(JSON.stringify({ command: "request_offer" }));
                };
                ws.onmessage = function (e) {
                    var message = JSON.parse(e.data);
                    if (message.error) {
                        var tempError = _constants.ERRORS[_constants.PLAYER_WEBRTC_WS_ERROR];
                        tempError.error = message.error;
                        closePeer(tempError);
                        return false;
                    }
                    if (message.list) {
                        OvenPlayerConsole.log('List received');
                        return;
                    }

                    if (!message.id) {
                        OvenPlayerConsole.log('ID must be not null');
                        return;
                    }

                    if (!peerConnection) {
                        peerConnection = new RTCPeerConnection(config);

                        peerConnection.onicecandidate = function (e) {
                            if (e.candidate) {
                                OvenPlayerConsole.log("WebRTCLoader send candidate to server : " + e.candidate);
                                ws.send(JSON.stringify({
                                    id: message.id,
                                    command: "candidate",
                                    candidates: [e.candidate]
                                }));
                            }
                        };

                        peerConnection.oniceconnectionstatechange = function (event) {
                            console.log(peerConnection.iceConnectionState);
                            provider.trigger("oniceconnectionstatechange", {
                                state: peerConnection.iceConnectionState,
                                answerSdp: answerSdp,
                                offerSdp: offerSdp
                            });
                        };

                        peerConnection.onnegotiationneeded = function () {
                            peerConnection.createOffer().then(function (desc) {
                                OvenPlayerConsole.log("createOffer : success");
                                onLocalDescription(message.id, peerConnection, desc);
                            })["catch"](function (error) {
                                var tempError = _constants.ERRORS[_constants.PLAYER_WEBRTC_CREATE_ANSWER_ERROR];
                                tempError.error = error;
                                closePeer(tempError);
                            });
                        };

                        peerConnection.onaddstream = function (e) {
                            OvenPlayerConsole.log("stream received.");
                            // stream received.
                            var lostPacketsArr = [],
                                slotLength = 8,
                                //8 statistics. every 2 seconds
                            prevPacketsLost = 0,
                                avg8Losses = 0,
                                avgMoreThanThresholdCount = 0,
                                //If avg8Loss more than threshold.
                            threshold = 20;
                            var extractLossPacketsOnNetworkStatus = function extractLossPacketsOnNetworkStatus() {
                                statisticsTimer = setTimeout(function () {
                                    if (!peerConnection) {
                                        return false;
                                    }
                                    peerConnection.getStats().then(function (stats) {
                                        stats.forEach(function (state) {
                                            if (state.type === "inbound-rtp" && !state.isRemote) {
                                                OvenPlayerConsole.log(state);

                                                //(state.packetsLost - prevPacketsLost) is real current lost.
                                                lostPacketsArr.push(parseInt(state.packetsLost) - parseInt(prevPacketsLost));

                                                if (lostPacketsArr.length > slotLength) {
                                                    lostPacketsArr = lostPacketsArr.slice(lostPacketsArr.length - slotLength, lostPacketsArr.length);
                                                    avg8Losses = _underscore2["default"].reduce(lostPacketsArr, function (memo, num) {
                                                        return memo + num;
                                                    }, 0) / slotLength;
                                                    OvenPlayerConsole.log("Last8 LOST PACKET AVG  : " + avg8Losses, state.packetsLost, lostPacketsArr);
                                                    if (avg8Losses > threshold) {
                                                        avgMoreThanThresholdCount++;
                                                        if (avgMoreThanThresholdCount === 3) {
                                                            OvenPlayerConsole.log("NETWORK UNSTABLED!!! ");
                                                            clearTimeout(statisticsTimer);
                                                            provider.trigger(_constants.NETWORK_UNSTABLED);
                                                        }
                                                    } else {
                                                        avgMoreThanThresholdCount = 0;
                                                    }
                                                }

                                                prevPacketsLost = state.packetsLost;
                                            }
                                        });

                                        extractLossPacketsOnNetworkStatus();
                                    });
                                }, 2000);
                            };
                            extractLossPacketsOnNetworkStatus();
                            resolve(e.stream);
                        };
                    }

                    if (message.sdp) {
                        //Set remote description when I received sdp from server.
                        peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp)).then(function () {
                            if (peerConnection.remoteDescription.type === 'offer') {
                                // This creates answer when I received offer from publisher.
                                offerSdp = peerConnection.remoteDescription.sdp;
                                peerConnection.createAnswer().then(function (desc) {
                                    OvenPlayerConsole.log("createAnswer : success");
                                    onLocalDescription(message.id, peerConnection, desc);
                                })["catch"](function (error) {
                                    var tempError = _constants.ERRORS[_constants.PLAYER_WEBRTC_CREATE_ANSWER_ERROR];
                                    tempError.error = error;
                                    closePeer(tempError);
                                });
                            }
                        })["catch"](function (error) {
                            var tempError = _constants.ERRORS[_constants.PLAYER_WEBRTC_SET_REMOTE_DESC_ERROR];
                            tempError.error = error;
                            closePeer(tempError);
                        });
                    }

                    if (message.candidates) {
                        // This receives ICE Candidate from server.
                        for (var i = 0; i < message.candidates.length; i++) {
                            if (message.candidates[i] && message.candidates[i].candidate) {

                                peerConnection.addIceCandidate(new RTCIceCandidate(message.candidates[i])).then(function () {
                                    OvenPlayerConsole.log("addIceCandidate : success");
                                })["catch"](function (error) {
                                    var tempError = _constants.ERRORS[_constants.PLAYER_WEBRTC_ADD_ICECANDIDATE_ERROR];
                                    tempError.error = error;
                                    closePeer(tempError);
                                });
                            }
                        }
                    }
                };
                ws.onerror = function (error) {
                    var tempError = _constants.ERRORS[_constants.PLAYER_WEBRTC_WS_ERROR];
                    tempError.error = error;
                    closePeer(tempError);
                    reject(error);
                };
            } catch (error) {
                closePeer(error);
            }
        });
    }

    function closePeer(error) {
        OvenPlayerConsole.log('WebRTC Loader closePeear()');
        if (ws) {
            OvenPlayerConsole.log('Closing websocket connection...');
            OvenPlayerConsole.log("Send Signaling : Stop.");
            /*
            0 (CONNECTING)
            1 (OPEN)
            2 (CLOSING)
            3 (CLOSED)
            */
            if (ws.readyState == 1) {
                ws.send(JSON.stringify({ command: "stop" }));
                ws.close();
            }
            ws = null;
        }
        if (peerConnection) {
            OvenPlayerConsole.log('Closing peer connection...');
            if (statisticsTimer) {
                clearTimeout(statisticsTimer);
            }
            peerConnection.close();
            peerConnection = null;
        }
        if (error) {
            errorTrigger(error, provider);
        }
    }

    that.connect = function () {
        return initialize();
    };
    that.destroy = function () {
        peerConnection.log("WEBRTC LOADER destroy");
        closePeer();
    };
    return that;
};

exports["default"] = WebRTCLoader;

/***/ }),

/***/ "./src/js/utils/adapter.js":
/*!*********************************!*\
  !*** ./src/js/utils/adapter.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var require;var require;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (f) {
  if (( false ? undefined : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (f),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var g; }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return require(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (require, module, exports) {
      /*
       *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var SDPUtils = require('sdp');

      function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
        var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

        // Map ICE parameters (ufrag, pwd) to SDP.
        sdp += SDPUtils.writeIceParameters(transceiver.iceGatherer.getLocalParameters());

        // Map DTLS parameters to SDP.
        sdp += SDPUtils.writeDtlsParameters(transceiver.dtlsTransport.getLocalParameters(), type === 'offer' ? 'actpass' : dtlsRole || 'active');

        sdp += 'a=mid:' + transceiver.mid + '\r\n';

        if (transceiver.rtpSender && transceiver.rtpReceiver) {
          sdp += 'a=sendrecv\r\n';
        } else if (transceiver.rtpSender) {
          sdp += 'a=sendonly\r\n';
        } else if (transceiver.rtpReceiver) {
          sdp += 'a=recvonly\r\n';
        } else {
          sdp += 'a=inactive\r\n';
        }

        if (transceiver.rtpSender) {
          var trackId = transceiver.rtpSender._initialTrackId || transceiver.rtpSender.track.id;
          transceiver.rtpSender._initialTrackId = trackId;
          // spec.
          var msid = 'msid:' + (stream ? stream.id : '-') + ' ' + trackId + '\r\n';
          sdp += 'a=' + msid;
          // for Chrome. Legacy should no longer be required.
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' ' + msid;

          // RTX
          if (transceiver.sendEncodingParameters[0].rtx) {
            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' ' + msid;
            sdp += 'a=ssrc-group:FID ' + transceiver.sendEncodingParameters[0].ssrc + ' ' + transceiver.sendEncodingParameters[0].rtx.ssrc + '\r\n';
          }
        }
        // FIXME: this should be written by writeRtpDescription.
        sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
        if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
        }
        return sdp;
      }

      // Edge does not like
      // 1) stun: filtered after 14393 unless ?transport=udp is present
      // 2) turn: that does not have all of turn:host:port?transport=udp
      // 3) turn: with ipv6 addresses
      // 4) turn: occurring muliple times
      function filterIceServers(iceServers, edgeVersion) {
        var hasTurn = false;
        iceServers = JSON.parse(JSON.stringify(iceServers));
        return iceServers.filter(function (server) {
          if (server && (server.urls || server.url)) {
            var urls = server.urls || server.url;
            if (server.url && !server.urls) {
              console.warn('RTCIceServer.url is deprecated! Use urls instead.');
            }
            var isString = typeof urls === 'string';
            if (isString) {
              urls = [urls];
            }
            urls = urls.filter(function (url) {
              var validTurn = url.indexOf('turn:') === 0 && url.indexOf('transport=udp') !== -1 && url.indexOf('turn:[') === -1 && !hasTurn;

              if (validTurn) {
                hasTurn = true;
                return true;
              }
              return url.indexOf('stun:') === 0 && edgeVersion >= 14393 && url.indexOf('?transport=udp') === -1;
            });

            delete server.url;
            server.urls = isString ? urls[0] : urls;
            return !!urls.length;
          }
        });
      }

      // Determines the intersection of local and remote capabilities.
      function getCommonCapabilities(localCapabilities, remoteCapabilities) {
        var commonCapabilities = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: []
        };

        var findCodecByPayloadType = function findCodecByPayloadType(pt, codecs) {
          pt = parseInt(pt, 10);
          for (var i = 0; i < codecs.length; i++) {
            if (codecs[i].payloadType === pt || codecs[i].preferredPayloadType === pt) {
              return codecs[i];
            }
          }
        };

        var rtxCapabilityMatches = function rtxCapabilityMatches(lRtx, rRtx, lCodecs, rCodecs) {
          var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
          var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
          return lCodec && rCodec && lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
        };

        localCapabilities.codecs.forEach(function (lCodec) {
          for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
            var rCodec = remoteCapabilities.codecs[i];
            if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() && lCodec.clockRate === rCodec.clockRate) {
              if (lCodec.name.toLowerCase() === 'rtx' && lCodec.parameters && rCodec.parameters.apt) {
                // for RTX we need to find the local rtx that has a apt
                // which points to the same local codec as the remote one.
                if (!rtxCapabilityMatches(lCodec, rCodec, localCapabilities.codecs, remoteCapabilities.codecs)) {
                  continue;
                }
              }
              rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
              // number of channels is the highest common number of channels
              rCodec.numChannels = Math.min(lCodec.numChannels, rCodec.numChannels);
              // push rCodec so we reply with offerer payload type
              commonCapabilities.codecs.push(rCodec);

              // determine common feedback mechanisms
              rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function (fb) {
                for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                  if (lCodec.rtcpFeedback[j].type === fb.type && lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                    return true;
                  }
                }
                return false;
              });
              // FIXME: also need to determine .parameters
              //  see https://github.com/openpeer/ortc/issues/569
              break;
            }
          }
        });

        localCapabilities.headerExtensions.forEach(function (lHeaderExtension) {
          for (var i = 0; i < remoteCapabilities.headerExtensions.length; i++) {
            var rHeaderExtension = remoteCapabilities.headerExtensions[i];
            if (lHeaderExtension.uri === rHeaderExtension.uri) {
              commonCapabilities.headerExtensions.push(rHeaderExtension);
              break;
            }
          }
        });

        // FIXME: fecMechanisms
        return commonCapabilities;
      }

      // is action=setLocalDescription with type allowed in signalingState
      function isActionAllowedInSignalingState(action, type, signalingState) {
        return {
          offer: {
            setLocalDescription: ['stable', 'have-local-offer'],
            setRemoteDescription: ['stable', 'have-remote-offer']
          },
          answer: {
            setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
            setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
          }
        }[type][action].indexOf(signalingState) !== -1;
      }

      function maybeAddCandidate(iceTransport, candidate) {
        // Edge's internal representation adds some fields therefore
        // not all fieldѕ are taken into account.
        var alreadyAdded = iceTransport.getRemoteCandidates().find(function (remoteCandidate) {
          return candidate.foundation === remoteCandidate.foundation && candidate.ip === remoteCandidate.ip && candidate.port === remoteCandidate.port && candidate.priority === remoteCandidate.priority && candidate.protocol === remoteCandidate.protocol && candidate.type === remoteCandidate.type;
        });
        if (!alreadyAdded) {
          iceTransport.addRemoteCandidate(candidate);
        }
        return !alreadyAdded;
      }

      function makeError(name, description) {
        var e = new Error(description);
        e.name = name;
        // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
        e.code = {
          NotSupportedError: 9,
          InvalidStateError: 11,
          InvalidAccessError: 15,
          TypeError: undefined,
          OperationError: undefined
        }[name];
        return e;
      }

      module.exports = function (window, edgeVersion) {
        // https://w3c.github.io/mediacapture-main/#mediastream
        // Helper function to add the track to the stream and
        // dispatch the event ourselves.
        function addTrackToStreamAndFireEvent(track, stream) {
          stream.addTrack(track);
          stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack', { track: track }));
        }

        function removeTrackFromStreamAndFireEvent(track, stream) {
          stream.removeTrack(track);
          stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack', { track: track }));
        }

        function fireAddTrack(pc, track, receiver, streams) {
          var trackEvent = new Event('track');
          trackEvent.track = track;
          trackEvent.receiver = receiver;
          trackEvent.transceiver = { receiver: receiver };
          trackEvent.streams = streams;
          window.setTimeout(function () {
            pc._dispatchEvent('track', trackEvent);
          });
        }

        var RTCPeerConnection = function RTCPeerConnection(config) {
          var pc = this;

          var _eventTarget = document.createDocumentFragment();
          ['addEventListener', 'removeEventListener', 'dispatchEvent'].forEach(function (method) {
            pc[method] = _eventTarget[method].bind(_eventTarget);
          });

          this.canTrickleIceCandidates = null;

          this.needNegotiation = false;

          this.localStreams = [];
          this.remoteStreams = [];

          this.localDescription = null;
          this.remoteDescription = null;

          this.signalingState = 'stable';
          this.iceConnectionState = 'new';
          this.connectionState = 'new';
          this.iceGatheringState = 'new';

          config = JSON.parse(JSON.stringify(config || {}));

          this.usingBundle = config.bundlePolicy === 'max-bundle';
          if (config.rtcpMuxPolicy === 'negotiate') {
            throw makeError('NotSupportedError', 'rtcpMuxPolicy \'negotiate\' is not supported');
          } else if (!config.rtcpMuxPolicy) {
            config.rtcpMuxPolicy = 'require';
          }

          switch (config.iceTransportPolicy) {
            case 'all':
            case 'relay':
              break;
            default:
              config.iceTransportPolicy = 'all';
              break;
          }

          switch (config.bundlePolicy) {
            case 'balanced':
            case 'max-compat':
            case 'max-bundle':
              break;
            default:
              config.bundlePolicy = 'balanced';
              break;
          }

          config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

          this._iceGatherers = [];
          if (config.iceCandidatePoolSize) {
            for (var i = config.iceCandidatePoolSize; i > 0; i--) {
              this._iceGatherers.push(new window.RTCIceGatherer({
                iceServers: config.iceServers,
                gatherPolicy: config.iceTransportPolicy
              }));
            }
          } else {
            config.iceCandidatePoolSize = 0;
          }

          this._config = config;

          // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
          // everything that is needed to describe a SDP m-line.
          this.transceivers = [];

          this._sdpSessionId = SDPUtils.generateSessionId();
          this._sdpSessionVersion = 0;

          this._dtlsRole = undefined; // role for a=setup to use in answers.

          this._isClosed = false;
        };

        // set up event handlers on prototype
        RTCPeerConnection.prototype.onicecandidate = null;
        RTCPeerConnection.prototype.onaddstream = null;
        RTCPeerConnection.prototype.ontrack = null;
        RTCPeerConnection.prototype.onremovestream = null;
        RTCPeerConnection.prototype.onsignalingstatechange = null;
        RTCPeerConnection.prototype.oniceconnectionstatechange = null;
        RTCPeerConnection.prototype.onconnectionstatechange = null;
        RTCPeerConnection.prototype.onicegatheringstatechange = null;
        RTCPeerConnection.prototype.onnegotiationneeded = null;
        RTCPeerConnection.prototype.ondatachannel = null;

        RTCPeerConnection.prototype._dispatchEvent = function (name, event) {
          if (this._isClosed) {
            return;
          }
          this.dispatchEvent(event);
          if (typeof this['on' + name] === 'function') {
            this['on' + name](event);
          }
        };

        RTCPeerConnection.prototype._emitGatheringStateChange = function () {
          var event = new Event('icegatheringstatechange');
          this._dispatchEvent('icegatheringstatechange', event);
        };

        RTCPeerConnection.prototype.getConfiguration = function () {
          return this._config;
        };

        RTCPeerConnection.prototype.getLocalStreams = function () {
          return this.localStreams;
        };

        RTCPeerConnection.prototype.getRemoteStreams = function () {
          return this.remoteStreams;
        };

        // internal helper to create a transceiver object.
        // (which is not yet the same as the WebRTC 1.0 transceiver)
        RTCPeerConnection.prototype._createTransceiver = function (kind, doNotAdd) {
          var hasBundleTransport = this.transceivers.length > 0;
          var transceiver = {
            track: null,
            iceGatherer: null,
            iceTransport: null,
            dtlsTransport: null,
            localCapabilities: null,
            remoteCapabilities: null,
            rtpSender: null,
            rtpReceiver: null,
            kind: kind,
            mid: null,
            sendEncodingParameters: null,
            recvEncodingParameters: null,
            stream: null,
            associatedRemoteMediaStreams: [],
            wantReceive: true
          };
          if (this.usingBundle && hasBundleTransport) {
            transceiver.iceTransport = this.transceivers[0].iceTransport;
            transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
          } else {
            var transports = this._createIceAndDtlsTransports();
            transceiver.iceTransport = transports.iceTransport;
            transceiver.dtlsTransport = transports.dtlsTransport;
          }
          if (!doNotAdd) {
            this.transceivers.push(transceiver);
          }
          return transceiver;
        };

        RTCPeerConnection.prototype.addTrack = function (track, stream) {
          if (this._isClosed) {
            throw makeError('InvalidStateError', 'Attempted to call addTrack on a closed peerconnection.');
          }

          var alreadyExists = this.transceivers.find(function (s) {
            return s.track === track;
          });

          if (alreadyExists) {
            throw makeError('InvalidAccessError', 'Track already exists.');
          }

          var transceiver;
          for (var i = 0; i < this.transceivers.length; i++) {
            if (!this.transceivers[i].track && this.transceivers[i].kind === track.kind) {
              transceiver = this.transceivers[i];
            }
          }
          if (!transceiver) {
            transceiver = this._createTransceiver(track.kind);
          }

          this._maybeFireNegotiationNeeded();

          if (this.localStreams.indexOf(stream) === -1) {
            this.localStreams.push(stream);
          }

          transceiver.track = track;
          transceiver.stream = stream;
          transceiver.rtpSender = new window.RTCRtpSender(track, transceiver.dtlsTransport);
          return transceiver.rtpSender;
        };

        RTCPeerConnection.prototype.addStream = function (stream) {
          var pc = this;
          if (edgeVersion >= 15025) {
            stream.getTracks().forEach(function (track) {
              pc.addTrack(track, stream);
            });
          } else {
            // Clone is necessary for local demos mostly, attaching directly
            // to two different senders does not work (build 10547).
            // Fixed in 15025 (or earlier)
            var clonedStream = stream.clone();
            stream.getTracks().forEach(function (track, idx) {
              var clonedTrack = clonedStream.getTracks()[idx];
              track.addEventListener('enabled', function (event) {
                clonedTrack.enabled = event.enabled;
              });
            });
            clonedStream.getTracks().forEach(function (track) {
              pc.addTrack(track, clonedStream);
            });
          }
        };

        RTCPeerConnection.prototype.removeTrack = function (sender) {
          if (this._isClosed) {
            throw makeError('InvalidStateError', 'Attempted to call removeTrack on a closed peerconnection.');
          }

          if (!(sender instanceof window.RTCRtpSender)) {
            throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.');
          }

          var transceiver = this.transceivers.find(function (t) {
            return t.rtpSender === sender;
          });

          if (!transceiver) {
            throw makeError('InvalidAccessError', 'Sender was not created by this connection.');
          }
          var stream = transceiver.stream;

          transceiver.rtpSender.stop();
          transceiver.rtpSender = null;
          transceiver.track = null;
          transceiver.stream = null;

          // remove the stream from the set of local streams
          var localStreams = this.transceivers.map(function (t) {
            return t.stream;
          });
          if (localStreams.indexOf(stream) === -1 && this.localStreams.indexOf(stream) > -1) {
            this.localStreams.splice(this.localStreams.indexOf(stream), 1);
          }

          this._maybeFireNegotiationNeeded();
        };

        RTCPeerConnection.prototype.removeStream = function (stream) {
          var pc = this;
          stream.getTracks().forEach(function (track) {
            var sender = pc.getSenders().find(function (s) {
              return s.track === track;
            });
            if (sender) {
              pc.removeTrack(sender);
            }
          });
        };

        RTCPeerConnection.prototype.getSenders = function () {
          return this.transceivers.filter(function (transceiver) {
            return !!transceiver.rtpSender;
          }).map(function (transceiver) {
            return transceiver.rtpSender;
          });
        };

        RTCPeerConnection.prototype.getReceivers = function () {
          return this.transceivers.filter(function (transceiver) {
            return !!transceiver.rtpReceiver;
          }).map(function (transceiver) {
            return transceiver.rtpReceiver;
          });
        };

        RTCPeerConnection.prototype._createIceGatherer = function (sdpMLineIndex, usingBundle) {
          var pc = this;
          if (usingBundle && sdpMLineIndex > 0) {
            return this.transceivers[0].iceGatherer;
          } else if (this._iceGatherers.length) {
            return this._iceGatherers.shift();
          }
          var iceGatherer = new window.RTCIceGatherer({
            iceServers: this._config.iceServers,
            gatherPolicy: this._config.iceTransportPolicy
          });
          Object.defineProperty(iceGatherer, 'state', { value: 'new', writable: true });

          this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
          this.transceivers[sdpMLineIndex].bufferCandidates = function (event) {
            var end = !event.candidate || Object.keys(event.candidate).length === 0;
            // polyfill since RTCIceGatherer.state is not implemented in
            // Edge 10547 yet.
            iceGatherer.state = end ? 'completed' : 'gathering';
            if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
              pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
            }
          };
          iceGatherer.addEventListener('localcandidate', this.transceivers[sdpMLineIndex].bufferCandidates);
          return iceGatherer;
        };

        // start gathering from an RTCIceGatherer.
        RTCPeerConnection.prototype._gather = function (mid, sdpMLineIndex) {
          var pc = this;
          var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
          if (iceGatherer.onlocalcandidate) {
            return;
          }
          var bufferedCandidateEvents = this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
          this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
          iceGatherer.removeEventListener('localcandidate', this.transceivers[sdpMLineIndex].bufferCandidates);
          iceGatherer.onlocalcandidate = function (evt) {
            if (pc.usingBundle && sdpMLineIndex > 0) {
              // if we know that we use bundle we can drop candidates with
              // ѕdpMLineIndex > 0. If we don't do this then our state gets
              // confused since we dispose the extra ice gatherer.
              return;
            }
            var event = new Event('icecandidate');
            event.candidate = { sdpMid: mid, sdpMLineIndex: sdpMLineIndex };

            var cand = evt.candidate;
            // Edge emits an empty object for RTCIceCandidateComplete‥
            var end = !cand || Object.keys(cand).length === 0;
            if (end) {
              // polyfill since RTCIceGatherer.state is not implemented in
              // Edge 10547 yet.
              if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
                iceGatherer.state = 'completed';
              }
            } else {
              if (iceGatherer.state === 'new') {
                iceGatherer.state = 'gathering';
              }
              // RTCIceCandidate doesn't have a component, needs to be added
              cand.component = 1;
              // also the usernameFragment. TODO: update SDP to take both variants.
              cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

              var serializedCandidate = SDPUtils.writeCandidate(cand);
              event.candidate = _extends(event.candidate, SDPUtils.parseCandidate(serializedCandidate));

              event.candidate.candidate = serializedCandidate;
              event.candidate.toJSON = function () {
                return {
                  candidate: event.candidate.candidate,
                  sdpMid: event.candidate.sdpMid,
                  sdpMLineIndex: event.candidate.sdpMLineIndex,
                  usernameFragment: event.candidate.usernameFragment
                };
              };
            }

            // update local description.
            var sections = SDPUtils.getMediaSections(pc.localDescription.sdp);
            if (!end) {
              sections[event.candidate.sdpMLineIndex] += 'a=' + event.candidate.candidate + '\r\n';
            } else {
              sections[event.candidate.sdpMLineIndex] += 'a=end-of-candidates\r\n';
            }
            pc.localDescription.sdp = SDPUtils.getDescription(pc.localDescription.sdp) + sections.join('');
            var complete = pc.transceivers.every(function (transceiver) {
              return transceiver.iceGatherer && transceiver.iceGatherer.state === 'completed';
            });

            if (pc.iceGatheringState !== 'gathering') {
              pc.iceGatheringState = 'gathering';
              pc._emitGatheringStateChange();
            }

            // Emit candidate. Also emit null candidate when all gatherers are
            // complete.
            if (!end) {
              pc._dispatchEvent('icecandidate', event);
            }
            if (complete) {
              pc._dispatchEvent('icecandidate', new Event('icecandidate'));
              pc.iceGatheringState = 'complete';
              pc._emitGatheringStateChange();
            }
          };

          // emit already gathered candidates.
          window.setTimeout(function () {
            bufferedCandidateEvents.forEach(function (e) {
              iceGatherer.onlocalcandidate(e);
            });
          }, 0);
        };

        // Create ICE transport and DTLS transport.
        RTCPeerConnection.prototype._createIceAndDtlsTransports = function () {
          var pc = this;
          var iceTransport = new window.RTCIceTransport(null);
          iceTransport.onicestatechange = function () {
            pc._updateIceConnectionState();
            pc._updateConnectionState();
          };

          var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
          dtlsTransport.ondtlsstatechange = function () {
            pc._updateConnectionState();
          };
          dtlsTransport.onerror = function () {
            // onerror does not set state to failed by itself.
            Object.defineProperty(dtlsTransport, 'state', { value: 'failed', writable: true });
            pc._updateConnectionState();
          };

          return {
            iceTransport: iceTransport,
            dtlsTransport: dtlsTransport
          };
        };

        // Destroy ICE gatherer, ICE transport and DTLS transport.
        // Without triggering the callbacks.
        RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function (sdpMLineIndex) {
          var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
          if (iceGatherer) {
            delete iceGatherer.onlocalcandidate;
            delete this.transceivers[sdpMLineIndex].iceGatherer;
          }
          var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
          if (iceTransport) {
            delete iceTransport.onicestatechange;
            delete this.transceivers[sdpMLineIndex].iceTransport;
          }
          var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
          if (dtlsTransport) {
            delete dtlsTransport.ondtlsstatechange;
            delete dtlsTransport.onerror;
            delete this.transceivers[sdpMLineIndex].dtlsTransport;
          }
        };

        // Start the RTP Sender and Receiver for a transceiver.
        RTCPeerConnection.prototype._transceive = function (transceiver, send, recv) {
          var params = getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);
          if (send && transceiver.rtpSender) {
            params.encodings = transceiver.sendEncodingParameters;
            params.rtcp = {
              cname: SDPUtils.localCName,
              compound: transceiver.rtcpParameters.compound
            };
            if (transceiver.recvEncodingParameters.length) {
              params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
            }
            transceiver.rtpSender.send(params);
          }
          if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
            // remove RTX field in Edge 14942
            if (transceiver.kind === 'video' && transceiver.recvEncodingParameters && edgeVersion < 15019) {
              transceiver.recvEncodingParameters.forEach(function (p) {
                delete p.rtx;
              });
            }
            if (transceiver.recvEncodingParameters.length) {
              params.encodings = transceiver.recvEncodingParameters;
            } else {
              params.encodings = [{}];
            }
            params.rtcp = {
              compound: transceiver.rtcpParameters.compound
            };
            if (transceiver.rtcpParameters.cname) {
              params.rtcp.cname = transceiver.rtcpParameters.cname;
            }
            if (transceiver.sendEncodingParameters.length) {
              params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
            }
            transceiver.rtpReceiver.receive(params);
          }
        };

        RTCPeerConnection.prototype.setLocalDescription = function (description) {
          var pc = this;

          // Note: pranswer is not supported.
          if (['offer', 'answer'].indexOf(description.type) === -1) {
            return Promise.reject(makeError('TypeError', 'Unsupported type "' + description.type + '"'));
          }

          if (!isActionAllowedInSignalingState('setLocalDescription', description.type, pc.signalingState) || pc._isClosed) {
            return Promise.reject(makeError('InvalidStateError', 'Can not set local ' + description.type + ' in state ' + pc.signalingState));
          }

          var sections;
          var sessionpart;
          if (description.type === 'offer') {
            // VERY limited support for SDP munging. Limited to:
            // * changing the order of codecs
            sections = SDPUtils.splitSections(description.sdp);
            sessionpart = sections.shift();
            sections.forEach(function (mediaSection, sdpMLineIndex) {
              var caps = SDPUtils.parseRtpParameters(mediaSection);
              pc.transceivers[sdpMLineIndex].localCapabilities = caps;
            });

            pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
              pc._gather(transceiver.mid, sdpMLineIndex);
            });
          } else if (description.type === 'answer') {
            sections = SDPUtils.splitSections(pc.remoteDescription.sdp);
            sessionpart = sections.shift();
            var isIceLite = SDPUtils.matchPrefix(sessionpart, 'a=ice-lite').length > 0;
            sections.forEach(function (mediaSection, sdpMLineIndex) {
              var transceiver = pc.transceivers[sdpMLineIndex];
              var iceGatherer = transceiver.iceGatherer;
              var iceTransport = transceiver.iceTransport;
              var dtlsTransport = transceiver.dtlsTransport;
              var localCapabilities = transceiver.localCapabilities;
              var remoteCapabilities = transceiver.remoteCapabilities;

              // treat bundle-only as not-rejected.
              var rejected = SDPUtils.isRejected(mediaSection) && SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

              if (!rejected && !transceiver.rejected) {
                var remoteIceParameters = SDPUtils.getIceParameters(mediaSection, sessionpart);
                var remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection, sessionpart);
                if (isIceLite) {
                  remoteDtlsParameters.role = 'server';
                }

                if (!pc.usingBundle || sdpMLineIndex === 0) {
                  pc._gather(transceiver.mid, sdpMLineIndex);
                  if (iceTransport.state === 'new') {
                    iceTransport.start(iceGatherer, remoteIceParameters, isIceLite ? 'controlling' : 'controlled');
                  }
                  if (dtlsTransport.state === 'new') {
                    dtlsTransport.start(remoteDtlsParameters);
                  }
                }

                // Calculate intersection of capabilities.
                var params = getCommonCapabilities(localCapabilities, remoteCapabilities);

                // Start the RTCRtpSender. The RTCRtpReceiver for this
                // transceiver has already been started in setRemoteDescription.
                pc._transceive(transceiver, params.codecs.length > 0, false);
              }
            });
          }

          pc.localDescription = {
            type: description.type,
            sdp: description.sdp
          };
          if (description.type === 'offer') {
            pc._updateSignalingState('have-local-offer');
          } else {
            pc._updateSignalingState('stable');
          }

          return Promise.resolve();
        };

        RTCPeerConnection.prototype.setRemoteDescription = function (description) {
          var pc = this;

          // Note: pranswer is not supported.
          if (['offer', 'answer'].indexOf(description.type) === -1) {
            return Promise.reject(makeError('TypeError', 'Unsupported type "' + description.type + '"'));
          }

          if (!isActionAllowedInSignalingState('setRemoteDescription', description.type, pc.signalingState) || pc._isClosed) {
            return Promise.reject(makeError('InvalidStateError', 'Can not set remote ' + description.type + ' in state ' + pc.signalingState));
          }

          var streams = {};
          pc.remoteStreams.forEach(function (stream) {
            streams[stream.id] = stream;
          });
          var receiverList = [];
          var sections = SDPUtils.splitSections(description.sdp);
          var sessionpart = sections.shift();
          var isIceLite = SDPUtils.matchPrefix(sessionpart, 'a=ice-lite').length > 0;
          var usingBundle = SDPUtils.matchPrefix(sessionpart, 'a=group:BUNDLE ').length > 0;
          pc.usingBundle = usingBundle;
          var iceOptions = SDPUtils.matchPrefix(sessionpart, 'a=ice-options:')[0];
          if (iceOptions) {
            pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ').indexOf('trickle') >= 0;
          } else {
            pc.canTrickleIceCandidates = false;
          }

          sections.forEach(function (mediaSection, sdpMLineIndex) {
            var lines = SDPUtils.splitLines(mediaSection);
            var kind = SDPUtils.getKind(mediaSection);
            // treat bundle-only as not-rejected.
            var rejected = SDPUtils.isRejected(mediaSection) && SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
            var protocol = lines[0].substr(2).split(' ')[2];

            var direction = SDPUtils.getDirection(mediaSection, sessionpart);
            var remoteMsid = SDPUtils.parseMsid(mediaSection);

            var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

            // Reject datachannels which are not implemented yet.
            if (kind === 'application' && protocol === 'DTLS/SCTP' || rejected) {
              // TODO: this is dangerous in the case where a non-rejected m-line
              //     becomes rejected.
              pc.transceivers[sdpMLineIndex] = {
                mid: mid,
                kind: kind,
                rejected: true
              };
              return;
            }

            if (!rejected && pc.transceivers[sdpMLineIndex] && pc.transceivers[sdpMLineIndex].rejected) {
              // recycle a rejected transceiver.
              pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
            }

            var transceiver;
            var iceGatherer;
            var iceTransport;
            var dtlsTransport;
            var rtpReceiver;
            var sendEncodingParameters;
            var recvEncodingParameters;
            var localCapabilities;

            var track;
            // FIXME: ensure the mediaSection has rtcp-mux set.
            var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
            var remoteIceParameters;
            var remoteDtlsParameters;
            if (!rejected) {
              remoteIceParameters = SDPUtils.getIceParameters(mediaSection, sessionpart);
              remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection, sessionpart);
              remoteDtlsParameters.role = 'client';
            }
            recvEncodingParameters = SDPUtils.parseRtpEncodingParameters(mediaSection);

            var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

            var isComplete = SDPUtils.matchPrefix(mediaSection, 'a=end-of-candidates', sessionpart).length > 0;
            var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:').map(function (cand) {
              return SDPUtils.parseCandidate(cand);
            }).filter(function (cand) {
              return cand.component === 1;
            });

            // Check if we can use BUNDLE and dispose transports.
            if ((description.type === 'offer' || description.type === 'answer') && !rejected && usingBundle && sdpMLineIndex > 0 && pc.transceivers[sdpMLineIndex]) {
              pc._disposeIceAndDtlsTransports(sdpMLineIndex);
              pc.transceivers[sdpMLineIndex].iceGatherer = pc.transceivers[0].iceGatherer;
              pc.transceivers[sdpMLineIndex].iceTransport = pc.transceivers[0].iceTransport;
              pc.transceivers[sdpMLineIndex].dtlsTransport = pc.transceivers[0].dtlsTransport;
              if (pc.transceivers[sdpMLineIndex].rtpSender) {
                pc.transceivers[sdpMLineIndex].rtpSender.setTransport(pc.transceivers[0].dtlsTransport);
              }
              if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
                pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(pc.transceivers[0].dtlsTransport);
              }
            }
            if (description.type === 'offer' && !rejected) {
              transceiver = pc.transceivers[sdpMLineIndex] || pc._createTransceiver(kind);
              transceiver.mid = mid;

              if (!transceiver.iceGatherer) {
                transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex, usingBundle);
              }

              if (cands.length && transceiver.iceTransport.state === 'new') {
                if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
                  transceiver.iceTransport.setRemoteCandidates(cands);
                } else {
                  cands.forEach(function (candidate) {
                    maybeAddCandidate(transceiver.iceTransport, candidate);
                  });
                }
              }

              localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

              // filter RTX until additional stuff needed for RTX is implemented
              // in adapter.js
              if (edgeVersion < 15019) {
                localCapabilities.codecs = localCapabilities.codecs.filter(function (codec) {
                  return codec.name !== 'rtx';
                });
              }

              sendEncodingParameters = transceiver.sendEncodingParameters || [{
                ssrc: (2 * sdpMLineIndex + 2) * 1001
              }];

              // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
              var isNewTrack = false;
              if (direction === 'sendrecv' || direction === 'sendonly') {
                isNewTrack = !transceiver.rtpReceiver;
                rtpReceiver = transceiver.rtpReceiver || new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

                if (isNewTrack) {
                  var stream;
                  track = rtpReceiver.track;
                  // FIXME: does not work with Plan B.
                  if (remoteMsid && remoteMsid.stream === '-') {
                    // no-op. a stream id of '-' means: no associated stream.
                  } else if (remoteMsid) {
                    if (!streams[remoteMsid.stream]) {
                      streams[remoteMsid.stream] = new window.MediaStream();
                      Object.defineProperty(streams[remoteMsid.stream], 'id', {
                        get: function get() {
                          return remoteMsid.stream;
                        }
                      });
                    }
                    Object.defineProperty(track, 'id', {
                      get: function get() {
                        return remoteMsid.track;
                      }
                    });
                    stream = streams[remoteMsid.stream];
                  } else {
                    if (!streams["default"]) {
                      streams["default"] = new window.MediaStream();
                    }
                    stream = streams["default"];
                  }
                  if (stream) {
                    addTrackToStreamAndFireEvent(track, stream);
                    transceiver.associatedRemoteMediaStreams.push(stream);
                  }
                  receiverList.push([track, rtpReceiver, stream]);
                }
              } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
                transceiver.associatedRemoteMediaStreams.forEach(function (s) {
                  var nativeTrack = s.getTracks().find(function (t) {
                    return t.id === transceiver.rtpReceiver.track.id;
                  });
                  if (nativeTrack) {
                    removeTrackFromStreamAndFireEvent(nativeTrack, s);
                  }
                });
                transceiver.associatedRemoteMediaStreams = [];
              }

              transceiver.localCapabilities = localCapabilities;
              transceiver.remoteCapabilities = remoteCapabilities;
              transceiver.rtpReceiver = rtpReceiver;
              transceiver.rtcpParameters = rtcpParameters;
              transceiver.sendEncodingParameters = sendEncodingParameters;
              transceiver.recvEncodingParameters = recvEncodingParameters;

              // Start the RTCRtpReceiver now. The RTPSender is started in
              // setLocalDescription.
              pc._transceive(pc.transceivers[sdpMLineIndex], false, isNewTrack);
            } else if (description.type === 'answer' && !rejected) {
              transceiver = pc.transceivers[sdpMLineIndex];
              iceGatherer = transceiver.iceGatherer;
              iceTransport = transceiver.iceTransport;
              dtlsTransport = transceiver.dtlsTransport;
              rtpReceiver = transceiver.rtpReceiver;
              sendEncodingParameters = transceiver.sendEncodingParameters;
              localCapabilities = transceiver.localCapabilities;

              pc.transceivers[sdpMLineIndex].recvEncodingParameters = recvEncodingParameters;
              pc.transceivers[sdpMLineIndex].remoteCapabilities = remoteCapabilities;
              pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

              if (cands.length && iceTransport.state === 'new') {
                if ((isIceLite || isComplete) && (!usingBundle || sdpMLineIndex === 0)) {
                  iceTransport.setRemoteCandidates(cands);
                } else {
                  cands.forEach(function (candidate) {
                    maybeAddCandidate(transceiver.iceTransport, candidate);
                  });
                }
              }

              if (!usingBundle || sdpMLineIndex === 0) {
                if (iceTransport.state === 'new') {
                  iceTransport.start(iceGatherer, remoteIceParameters, 'controlling');
                }
                if (dtlsTransport.state === 'new') {
                  dtlsTransport.start(remoteDtlsParameters);
                }
              }

              pc._transceive(transceiver, direction === 'sendrecv' || direction === 'recvonly', direction === 'sendrecv' || direction === 'sendonly');

              // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
              if (rtpReceiver && (direction === 'sendrecv' || direction === 'sendonly')) {
                track = rtpReceiver.track;
                if (remoteMsid) {
                  if (!streams[remoteMsid.stream]) {
                    streams[remoteMsid.stream] = new window.MediaStream();
                  }
                  addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
                  receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
                } else {
                  if (!streams["default"]) {
                    streams["default"] = new window.MediaStream();
                  }
                  addTrackToStreamAndFireEvent(track, streams["default"]);
                  receiverList.push([track, rtpReceiver, streams["default"]]);
                }
              } else {
                // FIXME: actually the receiver should be created later.
                delete transceiver.rtpReceiver;
              }
            }
          });

          if (pc._dtlsRole === undefined) {
            pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
          }

          pc.remoteDescription = {
            type: description.type,
            sdp: description.sdp
          };
          if (description.type === 'offer') {
            pc._updateSignalingState('have-remote-offer');
          } else {
            pc._updateSignalingState('stable');
          }
          Object.keys(streams).forEach(function (sid) {
            var stream = streams[sid];
            if (stream.getTracks().length) {
              if (pc.remoteStreams.indexOf(stream) === -1) {
                pc.remoteStreams.push(stream);
                var event = new Event('addstream');
                event.stream = stream;
                window.setTimeout(function () {
                  pc._dispatchEvent('addstream', event);
                });
              }

              receiverList.forEach(function (item) {
                var track = item[0];
                var receiver = item[1];
                if (stream.id !== item[2].id) {
                  return;
                }
                fireAddTrack(pc, track, receiver, [stream]);
              });
            }
          });
          receiverList.forEach(function (item) {
            if (item[2]) {
              return;
            }
            fireAddTrack(pc, item[0], item[1], []);
          });

          // check whether addIceCandidate({}) was called within four seconds after
          // setRemoteDescription.
          window.setTimeout(function () {
            if (!(pc && pc.transceivers)) {
              return;
            }
            pc.transceivers.forEach(function (transceiver) {
              if (transceiver.iceTransport && transceiver.iceTransport.state === 'new' && transceiver.iceTransport.getRemoteCandidates().length > 0) {
                console.warn('Timeout for addRemoteCandidate. Consider sending ' + 'an end-of-candidates notification');
                transceiver.iceTransport.addRemoteCandidate({});
              }
            });
          }, 4000);

          return Promise.resolve();
        };

        RTCPeerConnection.prototype.close = function () {
          this.transceivers.forEach(function (transceiver) {
            /* not yet
            if (transceiver.iceGatherer) {
              transceiver.iceGatherer.close();
            }
            */
            if (transceiver.iceTransport) {
              transceiver.iceTransport.stop();
            }
            if (transceiver.dtlsTransport) {
              transceiver.dtlsTransport.stop();
            }
            if (transceiver.rtpSender) {
              transceiver.rtpSender.stop();
            }
            if (transceiver.rtpReceiver) {
              transceiver.rtpReceiver.stop();
            }
          });
          // FIXME: clean up tracks, local streams, remote streams, etc
          this._isClosed = true;
          this._updateSignalingState('closed');
        };

        // Update the signaling state.
        RTCPeerConnection.prototype._updateSignalingState = function (newState) {
          this.signalingState = newState;
          var event = new Event('signalingstatechange');
          this._dispatchEvent('signalingstatechange', event);
        };

        // Determine whether to fire the negotiationneeded event.
        RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function () {
          var pc = this;
          if (this.signalingState !== 'stable' || this.needNegotiation === true) {
            return;
          }
          this.needNegotiation = true;
          window.setTimeout(function () {
            if (pc.needNegotiation) {
              pc.needNegotiation = false;
              var event = new Event('negotiationneeded');
              pc._dispatchEvent('negotiationneeded', event);
            }
          }, 0);
        };

        // Update the ice connection state.
        RTCPeerConnection.prototype._updateIceConnectionState = function () {
          var newState;
          var states = {
            'new': 0,
            closed: 0,
            checking: 0,
            connected: 0,
            completed: 0,
            disconnected: 0,
            failed: 0
          };
          this.transceivers.forEach(function (transceiver) {
            states[transceiver.iceTransport.state]++;
          });

          newState = 'new';
          if (states.failed > 0) {
            newState = 'failed';
          } else if (states.checking > 0) {
            newState = 'checking';
          } else if (states.disconnected > 0) {
            newState = 'disconnected';
          } else if (states["new"] > 0) {
            newState = 'new';
          } else if (states.connected > 0) {
            newState = 'connected';
          } else if (states.completed > 0) {
            newState = 'completed';
          }

          if (newState !== this.iceConnectionState) {
            this.iceConnectionState = newState;
            var event = new Event('iceconnectionstatechange');
            this._dispatchEvent('iceconnectionstatechange', event);
          }
        };

        // Update the connection state.
        RTCPeerConnection.prototype._updateConnectionState = function () {
          var newState;
          var states = {
            'new': 0,
            closed: 0,
            connecting: 0,
            connected: 0,
            completed: 0,
            disconnected: 0,
            failed: 0
          };
          this.transceivers.forEach(function (transceiver) {
            states[transceiver.iceTransport.state]++;
            states[transceiver.dtlsTransport.state]++;
          });
          // ICETransport.completed and connected are the same for this purpose.
          states.connected += states.completed;

          newState = 'new';
          if (states.failed > 0) {
            newState = 'failed';
          } else if (states.connecting > 0) {
            newState = 'connecting';
          } else if (states.disconnected > 0) {
            newState = 'disconnected';
          } else if (states["new"] > 0) {
            newState = 'new';
          } else if (states.connected > 0) {
            newState = 'connected';
          }

          if (newState !== this.connectionState) {
            this.connectionState = newState;
            var event = new Event('connectionstatechange');
            this._dispatchEvent('connectionstatechange', event);
          }
        };

        RTCPeerConnection.prototype.createOffer = function () {
          var pc = this;

          if (pc._isClosed) {
            return Promise.reject(makeError('InvalidStateError', 'Can not call createOffer after close'));
          }

          var numAudioTracks = pc.transceivers.filter(function (t) {
            return t.kind === 'audio';
          }).length;
          var numVideoTracks = pc.transceivers.filter(function (t) {
            return t.kind === 'video';
          }).length;

          // Determine number of audio and video tracks we need to send/recv.
          var offerOptions = arguments[0];
          if (offerOptions) {
            // Reject Chrome legacy constraints.
            if (offerOptions.mandatory || offerOptions.optional) {
              throw new TypeError('Legacy mandatory/optional constraints not supported.');
            }
            if (offerOptions.offerToReceiveAudio !== undefined) {
              if (offerOptions.offerToReceiveAudio === true) {
                numAudioTracks = 1;
              } else if (offerOptions.offerToReceiveAudio === false) {
                numAudioTracks = 0;
              } else {
                numAudioTracks = offerOptions.offerToReceiveAudio;
              }
            }
            if (offerOptions.offerToReceiveVideo !== undefined) {
              if (offerOptions.offerToReceiveVideo === true) {
                numVideoTracks = 1;
              } else if (offerOptions.offerToReceiveVideo === false) {
                numVideoTracks = 0;
              } else {
                numVideoTracks = offerOptions.offerToReceiveVideo;
              }
            }
          }

          pc.transceivers.forEach(function (transceiver) {
            if (transceiver.kind === 'audio') {
              numAudioTracks--;
              if (numAudioTracks < 0) {
                transceiver.wantReceive = false;
              }
            } else if (transceiver.kind === 'video') {
              numVideoTracks--;
              if (numVideoTracks < 0) {
                transceiver.wantReceive = false;
              }
            }
          });

          // Create M-lines for recvonly streams.
          while (numAudioTracks > 0 || numVideoTracks > 0) {
            if (numAudioTracks > 0) {
              pc._createTransceiver('audio');
              numAudioTracks--;
            }
            if (numVideoTracks > 0) {
              pc._createTransceiver('video');
              numVideoTracks--;
            }
          }

          var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId, pc._sdpSessionVersion++);
          pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
            // For each track, create an ice gatherer, ice transport,
            // dtls transport, potentially rtpsender and rtpreceiver.
            var track = transceiver.track;
            var kind = transceiver.kind;
            var mid = transceiver.mid || SDPUtils.generateIdentifier();
            transceiver.mid = mid;

            if (!transceiver.iceGatherer) {
              transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex, pc.usingBundle);
            }

            var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
            // filter RTX until additional stuff needed for RTX is implemented
            // in adapter.js
            if (edgeVersion < 15019) {
              localCapabilities.codecs = localCapabilities.codecs.filter(function (codec) {
                return codec.name !== 'rtx';
              });
            }
            localCapabilities.codecs.forEach(function (codec) {
              // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
              // by adding level-asymmetry-allowed=1
              if (codec.name === 'H264' && codec.parameters['level-asymmetry-allowed'] === undefined) {
                codec.parameters['level-asymmetry-allowed'] = '1';
              }

              // for subsequent offers, we might have to re-use the payload
              // type of the last offer.
              if (transceiver.remoteCapabilities && transceiver.remoteCapabilities.codecs) {
                transceiver.remoteCapabilities.codecs.forEach(function (remoteCodec) {
                  if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() && codec.clockRate === remoteCodec.clockRate) {
                    codec.preferredPayloadType = remoteCodec.payloadType;
                  }
                });
              }
            });
            localCapabilities.headerExtensions.forEach(function (hdrExt) {
              var remoteExtensions = transceiver.remoteCapabilities && transceiver.remoteCapabilities.headerExtensions || [];
              remoteExtensions.forEach(function (rHdrExt) {
                if (hdrExt.uri === rHdrExt.uri) {
                  hdrExt.id = rHdrExt.id;
                }
              });
            });

            // generate an ssrc now, to be used later in rtpSender.send
            var sendEncodingParameters = transceiver.sendEncodingParameters || [{
              ssrc: (2 * sdpMLineIndex + 1) * 1001
            }];
            if (track) {
              // add RTX
              if (edgeVersion >= 15019 && kind === 'video' && !sendEncodingParameters[0].rtx) {
                sendEncodingParameters[0].rtx = {
                  ssrc: sendEncodingParameters[0].ssrc + 1
                };
              }
            }

            if (transceiver.wantReceive) {
              transceiver.rtpReceiver = new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);
            }

            transceiver.localCapabilities = localCapabilities;
            transceiver.sendEncodingParameters = sendEncodingParameters;
          });

          // always offer BUNDLE and dispose on return if not supported.
          if (pc._config.bundlePolicy !== 'max-compat') {
            sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function (t) {
              return t.mid;
            }).join(' ') + '\r\n';
          }
          sdp += 'a=ice-options:trickle\r\n';

          pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
            sdp += writeMediaSection(transceiver, transceiver.localCapabilities, 'offer', transceiver.stream, pc._dtlsRole);
            sdp += 'a=rtcp-rsize\r\n';

            if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' && (sdpMLineIndex === 0 || !pc.usingBundle)) {
              transceiver.iceGatherer.getLocalCandidates().forEach(function (cand) {
                cand.component = 1;
                sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
              });

              if (transceiver.iceGatherer.state === 'completed') {
                sdp += 'a=end-of-candidates\r\n';
              }
            }
          });

          var desc = new window.RTCSessionDescription({
            type: 'offer',
            sdp: sdp
          });
          return Promise.resolve(desc);
        };

        RTCPeerConnection.prototype.createAnswer = function () {
          var pc = this;

          if (pc._isClosed) {
            return Promise.reject(makeError('InvalidStateError', 'Can not call createAnswer after close'));
          }

          if (!(pc.signalingState === 'have-remote-offer' || pc.signalingState === 'have-local-pranswer')) {
            return Promise.reject(makeError('InvalidStateError', 'Can not call createAnswer in signalingState ' + pc.signalingState));
          }

          var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId, pc._sdpSessionVersion++);
          if (pc.usingBundle) {
            sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function (t) {
              return t.mid;
            }).join(' ') + '\r\n';
          }
          var mediaSectionsInOffer = SDPUtils.getMediaSections(pc.remoteDescription.sdp).length;
          pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
            if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
              return;
            }
            if (transceiver.rejected) {
              if (transceiver.kind === 'application') {
                sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
              } else if (transceiver.kind === 'audio') {
                sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' + 'a=rtpmap:0 PCMU/8000\r\n';
              } else if (transceiver.kind === 'video') {
                sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' + 'a=rtpmap:120 VP8/90000\r\n';
              }
              sdp += 'c=IN IP4 0.0.0.0\r\n' + 'a=inactive\r\n' + 'a=mid:' + transceiver.mid + '\r\n';
              return;
            }

            // FIXME: look at direction.
            if (transceiver.stream) {
              var localTrack;
              if (transceiver.kind === 'audio') {
                localTrack = transceiver.stream.getAudioTracks()[0];
              } else if (transceiver.kind === 'video') {
                localTrack = transceiver.stream.getVideoTracks()[0];
              }
              if (localTrack) {
                // add RTX
                if (edgeVersion >= 15019 && transceiver.kind === 'video' && !transceiver.sendEncodingParameters[0].rtx) {
                  transceiver.sendEncodingParameters[0].rtx = {
                    ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
                  };
                }
              }
            }

            // Calculate intersection of capabilities.
            var commonCapabilities = getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);

            var hasRtx = commonCapabilities.codecs.filter(function (c) {
              return c.name.toLowerCase() === 'rtx';
            }).length;
            if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
              delete transceiver.sendEncodingParameters[0].rtx;
            }

            sdp += writeMediaSection(transceiver, commonCapabilities, 'answer', transceiver.stream, pc._dtlsRole);
            if (transceiver.rtcpParameters && transceiver.rtcpParameters.reducedSize) {
              sdp += 'a=rtcp-rsize\r\n';
            }
          });

          var desc = new window.RTCSessionDescription({
            type: 'answer',
            sdp: sdp
          });
          return Promise.resolve(desc);
        };

        RTCPeerConnection.prototype.addIceCandidate = function (candidate) {
          var pc = this;
          var sections;
          if (candidate && !(candidate.sdpMLineIndex !== undefined || candidate.sdpMid)) {
            return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
          }

          // TODO: needs to go into ops queue.
          return new Promise(function (resolve, reject) {
            if (!pc.remoteDescription) {
              return reject(makeError('InvalidStateError', 'Can not add ICE candidate without a remote description'));
            } else if (!candidate || candidate.candidate === '') {
              for (var j = 0; j < pc.transceivers.length; j++) {
                if (pc.transceivers[j].rejected) {
                  continue;
                }
                pc.transceivers[j].iceTransport.addRemoteCandidate({});
                sections = SDPUtils.getMediaSections(pc.remoteDescription.sdp);
                sections[j] += 'a=end-of-candidates\r\n';
                pc.remoteDescription.sdp = SDPUtils.getDescription(pc.remoteDescription.sdp) + sections.join('');
                if (pc.usingBundle) {
                  break;
                }
              }
            } else {
              var sdpMLineIndex = candidate.sdpMLineIndex;
              if (candidate.sdpMid) {
                for (var i = 0; i < pc.transceivers.length; i++) {
                  if (pc.transceivers[i].mid === candidate.sdpMid) {
                    sdpMLineIndex = i;
                    break;
                  }
                }
              }
              var transceiver = pc.transceivers[sdpMLineIndex];
              if (transceiver) {
                if (transceiver.rejected) {
                  return resolve();
                }
                var cand = Object.keys(candidate.candidate).length > 0 ? SDPUtils.parseCandidate(candidate.candidate) : {};
                // Ignore Chrome's invalid candidates since Edge does not like them.
                if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
                  return resolve();
                }
                // Ignore RTCP candidates, we assume RTCP-MUX.
                if (cand.component && cand.component !== 1) {
                  return resolve();
                }
                // when using bundle, avoid adding candidates to the wrong
                // ice transport. And avoid adding candidates added in the SDP.
                if (sdpMLineIndex === 0 || sdpMLineIndex > 0 && transceiver.iceTransport !== pc.transceivers[0].iceTransport) {
                  if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
                    return reject(makeError('OperationError', 'Can not add ICE candidate'));
                  }
                }

                // update the remoteDescription.
                var candidateString = candidate.candidate.trim();
                if (candidateString.indexOf('a=') === 0) {
                  candidateString = candidateString.substr(2);
                }
                sections = SDPUtils.getMediaSections(pc.remoteDescription.sdp);
                sections[sdpMLineIndex] += 'a=' + (cand.type ? candidateString : 'end-of-candidates') + '\r\n';
                pc.remoteDescription.sdp = SDPUtils.getDescription(pc.remoteDescription.sdp) + sections.join('');
              } else {
                return reject(makeError('OperationError', 'Can not add ICE candidate'));
              }
            }
            resolve();
          });
        };

        RTCPeerConnection.prototype.getStats = function () {
          var promises = [];
          this.transceivers.forEach(function (transceiver) {
            ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport', 'dtlsTransport'].forEach(function (method) {
              if (transceiver[method]) {
                promises.push(transceiver[method].getStats());
              }
            });
          });
          var fixStatsType = function fixStatsType(stat) {
            return {
              inboundrtp: 'inbound-rtp',
              outboundrtp: 'outbound-rtp',
              candidatepair: 'candidate-pair',
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[stat.type] || stat.type;
          };
          return new Promise(function (resolve) {
            // shim getStats with maplike support
            var results = new Map();
            Promise.all(promises).then(function (res) {
              res.forEach(function (result) {
                Object.keys(result).forEach(function (id) {
                  result[id].type = fixStatsType(result[id]);
                  results.set(id, result[id]);
                });
              });
              resolve(results);
            });
          });
        };

        // legacy callback shims. Should be moved to adapter.js some days.
        var methods = ['createOffer', 'createAnswer'];
        methods.forEach(function (method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function () {
            var args = arguments;
            if (typeof args[0] === 'function' || typeof args[1] === 'function') {
              // legacy
              return nativeMethod.apply(this, [arguments[2]]).then(function (description) {
                if (typeof args[0] === 'function') {
                  args[0].apply(null, [description]);
                }
              }, function (error) {
                if (typeof args[1] === 'function') {
                  args[1].apply(null, [error]);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });

        methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
        methods.forEach(function (method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function () {
            var args = arguments;
            if (typeof args[1] === 'function' || typeof args[2] === 'function') {
              // legacy
              return nativeMethod.apply(this, arguments).then(function () {
                if (typeof args[1] === 'function') {
                  args[1].apply(null);
                }
              }, function (error) {
                if (typeof args[2] === 'function') {
                  args[2].apply(null, [error]);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });

        // getStats is special. It doesn't have a spec legacy method yet we support
        // getStats(something, cb) without error callbacks.
        ['getStats'].forEach(function (method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function () {
            var args = arguments;
            if (typeof args[1] === 'function') {
              return nativeMethod.apply(this, arguments).then(function () {
                if (typeof args[1] === 'function') {
                  args[1].apply(null);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });

        return RTCPeerConnection;
      };
    }, { "sdp": 2 }], 2: [function (require, module, exports) {
      /* eslint-env node */
      'use strict';

      // SDP helpers.

      var SDPUtils = {};

      // Generate an alphanumeric identifier for cname or mids.
      // TODO: use UUIDs instead? https://gist.github.com/jed/982883
      SDPUtils.generateIdentifier = function () {
        return Math.random().toString(36).substr(2, 10);
      };

      // The RTCP CNAME used by all peerconnections from the same JS.
      SDPUtils.localCName = SDPUtils.generateIdentifier();

      // Splits SDP into lines, dealing with both CRLF and LF.
      SDPUtils.splitLines = function (blob) {
        return blob.trim().split('\n').map(function (line) {
          return line.trim();
        });
      };
      // Splits SDP into sessionpart and mediasections. Ensures CRLF.
      SDPUtils.splitSections = function (blob) {
        var parts = blob.split('\nm=');
        return parts.map(function (part, index) {
          return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
        });
      };

      // returns the session description.
      SDPUtils.getDescription = function (blob) {
        var sections = SDPUtils.splitSections(blob);
        return sections && sections[0];
      };

      // returns the individual media sections.
      SDPUtils.getMediaSections = function (blob) {
        var sections = SDPUtils.splitSections(blob);
        sections.shift();
        return sections;
      };

      // Returns lines that start with a certain prefix.
      SDPUtils.matchPrefix = function (blob, prefix) {
        return SDPUtils.splitLines(blob).filter(function (line) {
          return line.indexOf(prefix) === 0;
        });
      };

      // Parses an ICE candidate line. Sample input:
      // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
      // rport 55996"
      SDPUtils.parseCandidate = function (line) {
        var parts;
        // Parse both variants.
        if (line.indexOf('a=candidate:') === 0) {
          parts = line.substring(12).split(' ');
        } else {
          parts = line.substring(10).split(' ');
        }

        var candidate = {
          foundation: parts[0],
          component: parseInt(parts[1], 10),
          protocol: parts[2].toLowerCase(),
          priority: parseInt(parts[3], 10),
          ip: parts[4],
          port: parseInt(parts[5], 10),
          // skip parts[6] == 'typ'
          type: parts[7]
        };

        for (var i = 8; i < parts.length; i += 2) {
          switch (parts[i]) {
            case 'raddr':
              candidate.relatedAddress = parts[i + 1];
              break;
            case 'rport':
              candidate.relatedPort = parseInt(parts[i + 1], 10);
              break;
            case 'tcptype':
              candidate.tcpType = parts[i + 1];
              break;
            case 'ufrag':
              candidate.ufrag = parts[i + 1]; // for backward compability.
              candidate.usernameFragment = parts[i + 1];
              break;
            default:
              // extension handling, in particular ufrag
              candidate[parts[i]] = parts[i + 1];
              break;
          }
        }
        return candidate;
      };

      // Translates a candidate object into SDP candidate attribute.
      SDPUtils.writeCandidate = function (candidate) {
        var sdp = [];
        sdp.push(candidate.foundation);
        sdp.push(candidate.component);
        sdp.push(candidate.protocol.toUpperCase());
        sdp.push(candidate.priority);
        sdp.push(candidate.ip);
        sdp.push(candidate.port);

        var type = candidate.type;
        sdp.push('typ');
        sdp.push(type);
        if (type !== 'host' && candidate.relatedAddress && candidate.relatedPort) {
          sdp.push('raddr');
          sdp.push(candidate.relatedAddress); // was: relAddr
          sdp.push('rport');
          sdp.push(candidate.relatedPort); // was: relPort
        }
        if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
          sdp.push('tcptype');
          sdp.push(candidate.tcpType);
        }
        if (candidate.usernameFragment || candidate.ufrag) {
          sdp.push('ufrag');
          sdp.push(candidate.usernameFragment || candidate.ufrag);
        }
        return 'candidate:' + sdp.join(' ');
      };

      // Parses an ice-options line, returns an array of option tags.
      // a=ice-options:foo bar
      SDPUtils.parseIceOptions = function (line) {
        return line.substr(14).split(' ');
      };

      // Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
      // a=rtpmap:111 opus/48000/2
      SDPUtils.parseRtpMap = function (line) {
        var parts = line.substr(9).split(' ');
        var parsed = {
          payloadType: parseInt(parts.shift(), 10) // was: id
        };

        parts = parts[0].split('/');

        parsed.name = parts[0];
        parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
        // was: channels
        parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
        return parsed;
      };

      // Generate an a=rtpmap line from RTCRtpCodecCapability or
      // RTCRtpCodecParameters.
      SDPUtils.writeRtpMap = function (codec) {
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate + (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
      };

      // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
      // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
      // a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
      SDPUtils.parseExtmap = function (line) {
        var parts = line.substr(9).split(' ');
        return {
          id: parseInt(parts[0], 10),
          direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
          uri: parts[1]
        };
      };

      // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
      // RTCRtpHeaderExtension.
      SDPUtils.writeExtmap = function (headerExtension) {
        return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== 'sendrecv' ? '/' + headerExtension.direction : '') + ' ' + headerExtension.uri + '\r\n';
      };

      // Parses an ftmp line, returns dictionary. Sample input:
      // a=fmtp:96 vbr=on;cng=on
      // Also deals with vbr=on; cng=on
      SDPUtils.parseFmtp = function (line) {
        var parsed = {};
        var kv;
        var parts = line.substr(line.indexOf(' ') + 1).split(';');
        for (var j = 0; j < parts.length; j++) {
          kv = parts[j].trim().split('=');
          parsed[kv[0].trim()] = kv[1];
        }
        return parsed;
      };

      // Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
      SDPUtils.writeFmtp = function (codec) {
        var line = '';
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        if (codec.parameters && Object.keys(codec.parameters).length) {
          var params = [];
          Object.keys(codec.parameters).forEach(function (param) {
            params.push(param + '=' + codec.parameters[param]);
          });
          line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
        }
        return line;
      };

      // Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
      // a=rtcp-fb:98 nack rpsi
      SDPUtils.parseRtcpFb = function (line) {
        var parts = line.substr(line.indexOf(' ') + 1).split(' ');
        return {
          type: parts.shift(),
          parameter: parts.join(' ')
        };
      };
      // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
      SDPUtils.writeRtcpFb = function (codec) {
        var lines = '';
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
          // FIXME: special handling for trr-int?
          codec.rtcpFeedback.forEach(function (fb) {
            lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') + '\r\n';
          });
        }
        return lines;
      };

      // Parses an RFC 5576 ssrc media attribute. Sample input:
      // a=ssrc:3735928559 cname:something
      SDPUtils.parseSsrcMedia = function (line) {
        var sp = line.indexOf(' ');
        var parts = {
          ssrc: parseInt(line.substr(7, sp - 7), 10)
        };
        var colon = line.indexOf(':', sp);
        if (colon > -1) {
          parts.attribute = line.substr(sp + 1, colon - sp - 1);
          parts.value = line.substr(colon + 1);
        } else {
          parts.attribute = line.substr(sp + 1);
        }
        return parts;
      };

      // Extracts the MID (RFC 5888) from a media section.
      // returns the MID or undefined if no mid line was found.
      SDPUtils.getMid = function (mediaSection) {
        var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
        if (mid) {
          return mid.substr(6);
        }
      };

      SDPUtils.parseFingerprint = function (line) {
        var parts = line.substr(14).split(' ');
        return {
          algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
          value: parts[1]
        };
      };

      // Extracts DTLS parameters from SDP media section or sessionpart.
      // FIXME: for consistency with other functions this should only
      //   get the fingerprint line as input. See also getIceParameters.
      SDPUtils.getDtlsParameters = function (mediaSection, sessionpart) {
        var lines = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=fingerprint:');
        // Note: a=setup line is ignored since we use the 'auto' role.
        // Note2: 'algorithm' is not case sensitive except in Edge.
        return {
          role: 'auto',
          fingerprints: lines.map(SDPUtils.parseFingerprint)
        };
      };

      // Serializes DTLS parameters to SDP.
      SDPUtils.writeDtlsParameters = function (params, setupType) {
        var sdp = 'a=setup:' + setupType + '\r\n';
        params.fingerprints.forEach(function (fp) {
          sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
        });
        return sdp;
      };
      // Parses ICE information from SDP media section or sessionpart.
      // FIXME: for consistency with other functions this should only
      //   get the ice-ufrag and ice-pwd lines as input.
      SDPUtils.getIceParameters = function (mediaSection, sessionpart) {
        var lines = SDPUtils.splitLines(mediaSection);
        // Search in session part, too.
        lines = lines.concat(SDPUtils.splitLines(sessionpart));
        var iceParameters = {
          usernameFragment: lines.filter(function (line) {
            return line.indexOf('a=ice-ufrag:') === 0;
          })[0].substr(12),
          password: lines.filter(function (line) {
            return line.indexOf('a=ice-pwd:') === 0;
          })[0].substr(10)
        };
        return iceParameters;
      };

      // Serializes ICE parameters to SDP.
      SDPUtils.writeIceParameters = function (params) {
        return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' + 'a=ice-pwd:' + params.password + '\r\n';
      };

      // Parses the SDP media section and returns RTCRtpParameters.
      SDPUtils.parseRtpParameters = function (mediaSection) {
        var description = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: [],
          rtcp: []
        };
        var lines = SDPUtils.splitLines(mediaSection);
        var mline = lines[0].split(' ');
        for (var i = 3; i < mline.length; i++) {
          // find all codecs from mline[3..]
          var pt = mline[i];
          var rtpmapline = SDPUtils.matchPrefix(mediaSection, 'a=rtpmap:' + pt + ' ')[0];
          if (rtpmapline) {
            var codec = SDPUtils.parseRtpMap(rtpmapline);
            var fmtps = SDPUtils.matchPrefix(mediaSection, 'a=fmtp:' + pt + ' ');
            // Only the first a=fmtp:<pt> is considered.
            codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
            codec.rtcpFeedback = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-fb:' + pt + ' ').map(SDPUtils.parseRtcpFb);
            description.codecs.push(codec);
            // parse FEC mechanisms from rtpmap lines.
            switch (codec.name.toUpperCase()) {
              case 'RED':
              case 'ULPFEC':
                description.fecMechanisms.push(codec.name.toUpperCase());
                break;
              default:
                // only RED and ULPFEC are recognized as FEC mechanisms.
                break;
            }
          }
        }
        SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function (line) {
          description.headerExtensions.push(SDPUtils.parseExtmap(line));
        });
        // FIXME: parse rtcp.
        return description;
      };

      // Generates parts of the SDP media section describing the capabilities /
      // parameters.
      SDPUtils.writeRtpDescription = function (kind, caps) {
        var sdp = '';

        // Build the mline.
        sdp += 'm=' + kind + ' ';
        sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
        sdp += ' UDP/TLS/RTP/SAVPF ';
        sdp += caps.codecs.map(function (codec) {
          if (codec.preferredPayloadType !== undefined) {
            return codec.preferredPayloadType;
          }
          return codec.payloadType;
        }).join(' ') + '\r\n';

        sdp += 'c=IN IP4 0.0.0.0\r\n';
        sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

        // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
        caps.codecs.forEach(function (codec) {
          sdp += SDPUtils.writeRtpMap(codec);
          sdp += SDPUtils.writeFmtp(codec);
          sdp += SDPUtils.writeRtcpFb(codec);
        });
        var maxptime = 0;
        caps.codecs.forEach(function (codec) {
          if (codec.maxptime > maxptime) {
            maxptime = codec.maxptime;
          }
        });
        if (maxptime > 0) {
          sdp += 'a=maxptime:' + maxptime + '\r\n';
        }
        sdp += 'a=rtcp-mux\r\n';

        caps.headerExtensions.forEach(function (extension) {
          sdp += SDPUtils.writeExtmap(extension);
        });
        // FIXME: write fecMechanisms.
        return sdp;
      };

      // Parses the SDP media section and returns an array of
      // RTCRtpEncodingParameters.
      SDPUtils.parseRtpEncodingParameters = function (mediaSection) {
        var encodingParameters = [];
        var description = SDPUtils.parseRtpParameters(mediaSection);
        var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
        var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

        // filter a=ssrc:... cname:, ignore PlanB-msid
        var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
          return SDPUtils.parseSsrcMedia(line);
        }).filter(function (parts) {
          return parts.attribute === 'cname';
        });
        var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
        var secondarySsrc;

        var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID').map(function (line) {
          var parts = line.split(' ');
          parts.shift();
          return parts.map(function (part) {
            return parseInt(part, 10);
          });
        });
        if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
          secondarySsrc = flows[0][1];
        }

        description.codecs.forEach(function (codec) {
          if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
            var encParam = {
              ssrc: primarySsrc,
              codecPayloadType: parseInt(codec.parameters.apt, 10),
              rtx: {
                ssrc: secondarySsrc
              }
            };
            encodingParameters.push(encParam);
            if (hasRed) {
              encParam = JSON.parse(JSON.stringify(encParam));
              encParam.fec = {
                ssrc: secondarySsrc,
                mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
              };
              encodingParameters.push(encParam);
            }
          }
        });
        if (encodingParameters.length === 0 && primarySsrc) {
          encodingParameters.push({
            ssrc: primarySsrc
          });
        }

        // we support both b=AS and b=TIAS but interpret AS as TIAS.
        var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
        if (bandwidth.length) {
          if (bandwidth[0].indexOf('b=TIAS:') === 0) {
            bandwidth = parseInt(bandwidth[0].substr(7), 10);
          } else if (bandwidth[0].indexOf('b=AS:') === 0) {
            // use formula from JSEP to convert b=AS to TIAS value.
            bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95 - 50 * 40 * 8;
          } else {
            bandwidth = undefined;
          }
          encodingParameters.forEach(function (params) {
            params.maxBitrate = bandwidth;
          });
        }
        return encodingParameters;
      };

      // parses http://draft.ortc.org/#rtcrtcpparameters*
      SDPUtils.parseRtcpParameters = function (mediaSection) {
        var rtcpParameters = {};

        var cname;
        // Gets the first SSRC. Note that with RTX there might be multiple
        // SSRCs.
        var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
          return SDPUtils.parseSsrcMedia(line);
        }).filter(function (obj) {
          return obj.attribute === 'cname';
        })[0];
        if (remoteSsrc) {
          rtcpParameters.cname = remoteSsrc.value;
          rtcpParameters.ssrc = remoteSsrc.ssrc;
        }

        // Edge uses the compound attribute instead of reducedSize
        // compound is !reducedSize
        var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
        rtcpParameters.reducedSize = rsize.length > 0;
        rtcpParameters.compound = rsize.length === 0;

        // parses the rtcp-mux attrіbute.
        // Note that Edge does not support unmuxed RTCP.
        var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
        rtcpParameters.mux = mux.length > 0;

        return rtcpParameters;
      };

      // parses either a=msid: or a=ssrc:... msid lines and returns
      // the id of the MediaStream and MediaStreamTrack.
      SDPUtils.parseMsid = function (mediaSection) {
        var parts;
        var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
        if (spec.length === 1) {
          parts = spec[0].substr(7).split(' ');
          return { stream: parts[0], track: parts[1] };
        }
        var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
          return SDPUtils.parseSsrcMedia(line);
        }).filter(function (parts) {
          return parts.attribute === 'msid';
        });
        if (planB.length > 0) {
          parts = planB[0].value.split(' ');
          return { stream: parts[0], track: parts[1] };
        }
      };

      // Generate a session ID for SDP.
      // https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
      // recommends using a cryptographically random +ve 64-bit value
      // but right now this should be acceptable and within the right range
      SDPUtils.generateSessionId = function () {
        return Math.random().toString().substr(2, 21);
      };

      // Write boilder plate for start of SDP
      // sessId argument is optional - if not supplied it will
      // be generated randomly
      // sessVersion is optional and defaults to 2
      SDPUtils.writeSessionBoilerplate = function (sessId, sessVer) {
        var sessionId;
        var version = sessVer !== undefined ? sessVer : 2;
        if (sessId) {
          sessionId = sessId;
        } else {
          sessionId = SDPUtils.generateSessionId();
        }
        // FIXME: sess-id should be an NTP timestamp.
        return 'v=0\r\n' + 'o=thisisadapterortc ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' + 's=-\r\n' + 't=0 0\r\n';
      };

      SDPUtils.writeMediaSection = function (transceiver, caps, type, stream) {
        var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

        // Map ICE parameters (ufrag, pwd) to SDP.
        sdp += SDPUtils.writeIceParameters(transceiver.iceGatherer.getLocalParameters());

        // Map DTLS parameters to SDP.
        sdp += SDPUtils.writeDtlsParameters(transceiver.dtlsTransport.getLocalParameters(), type === 'offer' ? 'actpass' : 'active');

        sdp += 'a=mid:' + transceiver.mid + '\r\n';

        if (transceiver.direction) {
          sdp += 'a=' + transceiver.direction + '\r\n';
        } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
          sdp += 'a=sendrecv\r\n';
        } else if (transceiver.rtpSender) {
          sdp += 'a=sendonly\r\n';
        } else if (transceiver.rtpReceiver) {
          sdp += 'a=recvonly\r\n';
        } else {
          sdp += 'a=inactive\r\n';
        }

        if (transceiver.rtpSender) {
          // spec.
          var msid = 'msid:' + stream.id + ' ' + transceiver.rtpSender.track.id + '\r\n';
          sdp += 'a=' + msid;

          // for Chrome.
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' ' + msid;
          if (transceiver.sendEncodingParameters[0].rtx) {
            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' ' + msid;
            sdp += 'a=ssrc-group:FID ' + transceiver.sendEncodingParameters[0].ssrc + ' ' + transceiver.sendEncodingParameters[0].rtx.ssrc + '\r\n';
          }
        }
        // FIXME: this should be written by writeRtpDescription.
        sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
        if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
        }
        return sdp;
      };

      // Gets the direction from the mediaSection or the sessionpart.
      SDPUtils.getDirection = function (mediaSection, sessionpart) {
        // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
        var lines = SDPUtils.splitLines(mediaSection);
        for (var i = 0; i < lines.length; i++) {
          switch (lines[i]) {
            case 'a=sendrecv':
            case 'a=sendonly':
            case 'a=recvonly':
            case 'a=inactive':
              return lines[i].substr(2);
            default:
            // FIXME: What should happen here?
          }
        }
        if (sessionpart) {
          return SDPUtils.getDirection(sessionpart);
        }
        return 'sendrecv';
      };

      SDPUtils.getKind = function (mediaSection) {
        var lines = SDPUtils.splitLines(mediaSection);
        var mline = lines[0].split(' ');
        return mline[0].substr(2);
      };

      SDPUtils.isRejected = function (mediaSection) {
        return mediaSection.split(' ', 2)[1] === '0';
      };

      SDPUtils.parseMLine = function (mediaSection) {
        var lines = SDPUtils.splitLines(mediaSection);
        var parts = lines[0].substr(2).split(' ');
        return {
          kind: parts[0],
          port: parseInt(parts[1], 10),
          protocol: parts[2],
          fmt: parts.slice(3).join(' ')
        };
      };

      SDPUtils.parseOLine = function (mediaSection) {
        var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
        var parts = line.substr(2).split(' ');
        return {
          username: parts[0],
          sessionId: parts[1],
          sessionVersion: parseInt(parts[2], 10),
          netType: parts[3],
          addressType: parts[4],
          address: parts[5]
        };
      };

      // Expose public methods.
      if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') {
        module.exports = SDPUtils;
      }
    }, {}], 3: [function (require, module, exports) {
      (function (global) {
        /*
         *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
         *
         *  Use of this source code is governed by a BSD-style license
         *  that can be found in the LICENSE file in the root of the source
         *  tree.
         */
        /* eslint-env node */

        'use strict';

        var adapterFactory = require('./adapter_factory.js');
        module.exports = adapterFactory({ window: global.window });
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "./adapter_factory.js": 4 }], 4: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */

      'use strict';

      var utils = require('./utils');
      // Shimming starts here.
      module.exports = function (dependencies, opts) {
        var window = dependencies && dependencies.window;

        var options = {
          shimChrome: true,
          shimFirefox: true,
          shimEdge: true,
          shimSafari: true
        };

        for (var key in opts) {
          if (hasOwnProperty.call(opts, key)) {
            options[key] = opts[key];
          }
        }

        // Utils.
        var logging = utils.log;
        var browserDetails = utils.detectBrowser(window);

        // Uncomment the line below if you want logging to occur, including logging
        // for the switch statement below. Can also be turned on in the browser via
        // adapter.disableLog(false), but then logging from the switch statement below
        // will not appear.
        // require('./utils').disableLog(false);

        // Browser shims.
        var chromeShim = require('./chrome/chrome_shim') || null;
        var edgeShim = require('./edge/edge_shim') || null;
        var firefoxShim = require('./firefox/firefox_shim') || null;
        var safariShim = require('./safari/safari_shim') || null;
        var commonShim = require('./common_shim') || null;

        // Export to the adapter global object visible in the browser.
        var adapter = {
          browserDetails: browserDetails,
          commonShim: commonShim,
          extractVersion: utils.extractVersion,
          disableLog: utils.disableLog,
          disableWarnings: utils.disableWarnings
        };

        // Shim browser if found.
        switch (browserDetails.browser) {
          case 'chrome':
            if (!chromeShim || !chromeShim.shimPeerConnection || !options.shimChrome) {
              logging('Chrome shim is not included in this adapter release.');
              return adapter;
            }
            logging('adapter.js shimming chrome.');
            // Export to the adapter global object visible in the browser.
            adapter.browserShim = chromeShim;
            commonShim.shimCreateObjectURL(window);

            chromeShim.shimGetUserMedia(window);
            chromeShim.shimMediaStream(window);
            chromeShim.shimSourceObject(window);
            chromeShim.shimPeerConnection(window);
            chromeShim.shimOnTrack(window);
            chromeShim.shimAddTrackRemoveTrack(window);
            chromeShim.shimGetSendersWithDtmf(window);

            commonShim.shimRTCIceCandidate(window);
            commonShim.shimMaxMessageSize(window);
            commonShim.shimSendThrowTypeError(window);
            break;
          case 'firefox':
            if (!firefoxShim || !firefoxShim.shimPeerConnection || !options.shimFirefox) {
              logging('Firefox shim is not included in this adapter release.');
              return adapter;
            }
            logging('adapter.js shimming firefox.');
            // Export to the adapter global object visible in the browser.
            adapter.browserShim = firefoxShim;
            commonShim.shimCreateObjectURL(window);

            firefoxShim.shimGetUserMedia(window);
            firefoxShim.shimSourceObject(window);
            firefoxShim.shimPeerConnection(window);
            firefoxShim.shimOnTrack(window);
            firefoxShim.shimRemoveStream(window);

            commonShim.shimRTCIceCandidate(window);
            commonShim.shimMaxMessageSize(window);
            commonShim.shimSendThrowTypeError(window);
            break;
          case 'edge':
            if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
              logging('MS edge shim is not included in this adapter release.');
              return adapter;
            }
            logging('adapter.js shimming edge.');
            // Export to the adapter global object visible in the browser.
            adapter.browserShim = edgeShim;
            commonShim.shimCreateObjectURL(window);

            edgeShim.shimGetUserMedia(window);
            edgeShim.shimPeerConnection(window);
            edgeShim.shimReplaceTrack(window);

            // the edge shim implements the full RTCIceCandidate object.

            commonShim.shimMaxMessageSize(window);
            commonShim.shimSendThrowTypeError(window);
            break;
          case 'safari':
            if (!safariShim || !options.shimSafari) {
              logging('Safari shim is not included in this adapter release.');
              return adapter;
            }
            logging('adapter.js shimming safari.');
            // Export to the adapter global object visible in the browser.
            adapter.browserShim = safariShim;
            commonShim.shimCreateObjectURL(window);

            safariShim.shimRTCIceServerUrls(window);
            safariShim.shimCallbacksAPI(window);
            safariShim.shimLocalStreamsAPI(window);
            safariShim.shimRemoteStreamsAPI(window);
            safariShim.shimTrackEventTransceiver(window);
            safariShim.shimGetUserMedia(window);
            safariShim.shimCreateOfferLegacy(window);

            commonShim.shimRTCIceCandidate(window);
            commonShim.shimMaxMessageSize(window);
            commonShim.shimSendThrowTypeError(window);
            break;
          default:
            logging('Unsupported browser!');
            break;
        }

        return adapter;
      };
    }, { "./chrome/chrome_shim": 5, "./common_shim": 7, "./edge/edge_shim": 8, "./firefox/firefox_shim": 10, "./safari/safari_shim": 12, "./utils": 13 }], 5: [function (require, module, exports) {

      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils.js');
      var logging = utils.log;

      module.exports = {
        shimGetUserMedia: require('./getusermedia'),
        shimMediaStream: function shimMediaStream(window) {
          window.MediaStream = window.MediaStream || window.webkitMediaStream;
        },

        shimOnTrack: function shimOnTrack(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
              get: function get() {
                return this._ontrack;
              },
              set: function set(f) {
                if (this._ontrack) {
                  this.removeEventListener('track', this._ontrack);
                }
                this.addEventListener('track', this._ontrack = f);
              }
            });
            var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
            window.RTCPeerConnection.prototype.setRemoteDescription = function () {
              var pc = this;
              if (!pc._ontrackpoly) {
                pc._ontrackpoly = function (e) {
                  // onaddstream does not fire when a track is added to an existing
                  // stream. But stream.onaddtrack is implemented so we use that.
                  e.stream.addEventListener('addtrack', function (te) {
                    var receiver;
                    if (window.RTCPeerConnection.prototype.getReceivers) {
                      receiver = pc.getReceivers().find(function (r) {
                        return r.track && r.track.id === te.track.id;
                      });
                    } else {
                      receiver = { track: te.track };
                    }

                    var event = new Event('track');
                    event.track = te.track;
                    event.receiver = receiver;
                    event.transceiver = { receiver: receiver };
                    event.streams = [e.stream];
                    pc.dispatchEvent(event);
                  });
                  e.stream.getTracks().forEach(function (track) {
                    var receiver;
                    if (window.RTCPeerConnection.prototype.getReceivers) {
                      receiver = pc.getReceivers().find(function (r) {
                        return r.track && r.track.id === track.id;
                      });
                    } else {
                      receiver = { track: track };
                    }
                    var event = new Event('track');
                    event.track = track;
                    event.receiver = receiver;
                    event.transceiver = { receiver: receiver };
                    event.streams = [e.stream];
                    pc.dispatchEvent(event);
                  });
                };
                pc.addEventListener('addstream', pc._ontrackpoly);
              }
              return origSetRemoteDescription.apply(pc, arguments);
            };
          } else if (!('RTCRtpTransceiver' in window)) {
            utils.wrapPeerConnectionEvent(window, 'track', function (e) {
              if (!e.transceiver) {
                e.transceiver = { receiver: e.receiver };
              }
              return e;
            });
          }
        },

        shimGetSendersWithDtmf: function shimGetSendersWithDtmf(window) {
          // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('getSenders' in window.RTCPeerConnection.prototype) && 'createDTMFSender' in window.RTCPeerConnection.prototype) {
            var shimSenderWithDtmf = function shimSenderWithDtmf(pc, track) {
              return {
                track: track,
                get dtmf() {
                  if (this._dtmf === undefined) {
                    if (track.kind === 'audio') {
                      this._dtmf = pc.createDTMFSender(track);
                    } else {
                      this._dtmf = null;
                    }
                  }
                  return this._dtmf;
                },
                _pc: pc
              };
            };

            // augment addTrack when getSenders is not available.
            if (!window.RTCPeerConnection.prototype.getSenders) {
              window.RTCPeerConnection.prototype.getSenders = function () {
                this._senders = this._senders || [];
                return this._senders.slice(); // return a copy of the internal state.
              };
              var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
              window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
                var pc = this;
                var sender = origAddTrack.apply(pc, arguments);
                if (!sender) {
                  sender = shimSenderWithDtmf(pc, track);
                  pc._senders.push(sender);
                }
                return sender;
              };

              var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
              window.RTCPeerConnection.prototype.removeTrack = function (sender) {
                var pc = this;
                origRemoveTrack.apply(pc, arguments);
                var idx = pc._senders.indexOf(sender);
                if (idx !== -1) {
                  pc._senders.splice(idx, 1);
                }
              };
            }
            var origAddStream = window.RTCPeerConnection.prototype.addStream;
            window.RTCPeerConnection.prototype.addStream = function (stream) {
              var pc = this;
              pc._senders = pc._senders || [];
              origAddStream.apply(pc, [stream]);
              stream.getTracks().forEach(function (track) {
                pc._senders.push(shimSenderWithDtmf(pc, track));
              });
            };

            var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
            window.RTCPeerConnection.prototype.removeStream = function (stream) {
              var pc = this;
              pc._senders = pc._senders || [];
              origRemoveStream.apply(pc, [stream]);

              stream.getTracks().forEach(function (track) {
                var sender = pc._senders.find(function (s) {
                  return s.track === track;
                });
                if (sender) {
                  pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
                }
              });
            };
          } else if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && 'getSenders' in window.RTCPeerConnection.prototype && 'createDTMFSender' in window.RTCPeerConnection.prototype && window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
            var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
            window.RTCPeerConnection.prototype.getSenders = function () {
              var pc = this;
              var senders = origGetSenders.apply(pc, []);
              senders.forEach(function (sender) {
                sender._pc = pc;
              });
              return senders;
            };

            Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
              get: function get() {
                if (this._dtmf === undefined) {
                  if (this.track.kind === 'audio') {
                    this._dtmf = this._pc.createDTMFSender(this.track);
                  } else {
                    this._dtmf = null;
                  }
                }
                return this._dtmf;
              }
            });
          }
        },

        shimSourceObject: function shimSourceObject(window) {
          var URL = window && window.URL;

          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
            if (window.HTMLMediaElement && !('srcObject' in window.HTMLMediaElement.prototype)) {
              // Shim the srcObject property, once, when HTMLMediaElement is found.
              Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                get: function get() {
                  return this._srcObject;
                },
                set: function set(stream) {
                  var self = this;
                  // Use _srcObject as a private property for this shim
                  this._srcObject = stream;
                  if (this.src) {
                    URL.revokeObjectURL(this.src);
                  }

                  if (!stream) {
                    this.src = '';
                    return undefined;
                  }
                  this.src = URL.createObjectURL(stream);
                  // We need to recreate the blob url when a track is added or
                  // removed. Doing it manually since we want to avoid a recursion.
                  stream.addEventListener('addtrack', function () {
                    if (self.src) {
                      URL.revokeObjectURL(self.src);
                    }
                    self.src = URL.createObjectURL(stream);
                  });
                  stream.addEventListener('removetrack', function () {
                    if (self.src) {
                      URL.revokeObjectURL(self.src);
                    }
                    self.src = URL.createObjectURL(stream);
                  });
                }
              });
            }
          }
        },

        shimAddTrackRemoveTrackWithNative: function shimAddTrackRemoveTrackWithNative(window) {
          // shim addTrack/removeTrack with native variants in order to make
          // the interactions with legacy getLocalStreams behave as in other browsers.
          // Keeps a mapping stream.id => [stream, rtpsenders...]
          window.RTCPeerConnection.prototype.getLocalStreams = function () {
            var pc = this;
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};
            return Object.keys(this._shimmedLocalStreams).map(function (streamId) {
              return pc._shimmedLocalStreams[streamId][0];
            });
          };

          var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
          window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
            if (!stream) {
              return origAddTrack.apply(this, arguments);
            }
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};

            var sender = origAddTrack.apply(this, arguments);
            if (!this._shimmedLocalStreams[stream.id]) {
              this._shimmedLocalStreams[stream.id] = [stream, sender];
            } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
              this._shimmedLocalStreams[stream.id].push(sender);
            }
            return sender;
          };

          var origAddStream = window.RTCPeerConnection.prototype.addStream;
          window.RTCPeerConnection.prototype.addStream = function (stream) {
            var pc = this;
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};

            stream.getTracks().forEach(function (track) {
              var alreadyExists = pc.getSenders().find(function (s) {
                return s.track === track;
              });
              if (alreadyExists) {
                throw new DOMException('Track already exists.', 'InvalidAccessError');
              }
            });
            var existingSenders = pc.getSenders();
            origAddStream.apply(this, arguments);
            var newSenders = pc.getSenders().filter(function (newSender) {
              return existingSenders.indexOf(newSender) === -1;
            });
            this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
          };

          var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
          window.RTCPeerConnection.prototype.removeStream = function (stream) {
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};
            delete this._shimmedLocalStreams[stream.id];
            return origRemoveStream.apply(this, arguments);
          };

          var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
          window.RTCPeerConnection.prototype.removeTrack = function (sender) {
            var pc = this;
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};
            if (sender) {
              Object.keys(this._shimmedLocalStreams).forEach(function (streamId) {
                var idx = pc._shimmedLocalStreams[streamId].indexOf(sender);
                if (idx !== -1) {
                  pc._shimmedLocalStreams[streamId].splice(idx, 1);
                }
                if (pc._shimmedLocalStreams[streamId].length === 1) {
                  delete pc._shimmedLocalStreams[streamId];
                }
              });
            }
            return origRemoveTrack.apply(this, arguments);
          };
        },

        shimAddTrackRemoveTrack: function shimAddTrackRemoveTrack(window) {
          var browserDetails = utils.detectBrowser(window);
          // shim addTrack and removeTrack.
          if (window.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
            return this.shimAddTrackRemoveTrackWithNative(window);
          }

          // also shim pc.getLocalStreams when addTrack is shimmed
          // to return the original streams.
          var origGetLocalStreams = window.RTCPeerConnection.prototype.getLocalStreams;
          window.RTCPeerConnection.prototype.getLocalStreams = function () {
            var pc = this;
            var nativeStreams = origGetLocalStreams.apply(this);
            pc._reverseStreams = pc._reverseStreams || {};
            return nativeStreams.map(function (stream) {
              return pc._reverseStreams[stream.id];
            });
          };

          var origAddStream = window.RTCPeerConnection.prototype.addStream;
          window.RTCPeerConnection.prototype.addStream = function (stream) {
            var pc = this;
            pc._streams = pc._streams || {};
            pc._reverseStreams = pc._reverseStreams || {};

            stream.getTracks().forEach(function (track) {
              var alreadyExists = pc.getSenders().find(function (s) {
                return s.track === track;
              });
              if (alreadyExists) {
                throw new DOMException('Track already exists.', 'InvalidAccessError');
              }
            });
            // Add identity mapping for consistency with addTrack.
            // Unless this is being used with a stream from addTrack.
            if (!pc._reverseStreams[stream.id]) {
              var newStream = new window.MediaStream(stream.getTracks());
              pc._streams[stream.id] = newStream;
              pc._reverseStreams[newStream.id] = stream;
              stream = newStream;
            }
            origAddStream.apply(pc, [stream]);
          };

          var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
          window.RTCPeerConnection.prototype.removeStream = function (stream) {
            var pc = this;
            pc._streams = pc._streams || {};
            pc._reverseStreams = pc._reverseStreams || {};

            origRemoveStream.apply(pc, [pc._streams[stream.id] || stream]);
            delete pc._reverseStreams[pc._streams[stream.id] ? pc._streams[stream.id].id : stream.id];
            delete pc._streams[stream.id];
          };

          window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
            var pc = this;
            if (pc.signalingState === 'closed') {
              throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
            }
            var streams = [].slice.call(arguments, 1);
            if (streams.length !== 1 || !streams[0].getTracks().find(function (t) {
              return t === track;
            })) {
              // this is not fully correct but all we can manage without
              // [[associated MediaStreams]] internal slot.
              throw new DOMException('The adapter.js addTrack polyfill only supports a single ' + ' stream which is associated with the specified track.', 'NotSupportedError');
            }

            var alreadyExists = pc.getSenders().find(function (s) {
              return s.track === track;
            });
            if (alreadyExists) {
              throw new DOMException('Track already exists.', 'InvalidAccessError');
            }

            pc._streams = pc._streams || {};
            pc._reverseStreams = pc._reverseStreams || {};
            var oldStream = pc._streams[stream.id];
            if (oldStream) {
              // this is using odd Chrome behaviour, use with caution:
              // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
              // Note: we rely on the high-level addTrack/dtmf shim to
              // create the sender with a dtmf sender.
              oldStream.addTrack(track);

              // Trigger ONN async.
              Promise.resolve().then(function () {
                pc.dispatchEvent(new Event('negotiationneeded'));
              });
            } else {
              var newStream = new window.MediaStream([track]);
              pc._streams[stream.id] = newStream;
              pc._reverseStreams[newStream.id] = stream;
              pc.addStream(newStream);
            }
            return pc.getSenders().find(function (s) {
              return s.track === track;
            });
          };

          // replace the internal stream id with the external one and
          // vice versa.
          function replaceInternalStreamId(pc, description) {
            var sdp = description.sdp;
            Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
              var externalStream = pc._reverseStreams[internalId];
              var internalStream = pc._streams[externalStream.id];
              sdp = sdp.replace(new RegExp(internalStream.id, 'g'), externalStream.id);
            });
            return new RTCSessionDescription({
              type: description.type,
              sdp: sdp
            });
          }
          function replaceExternalStreamId(pc, description) {
            var sdp = description.sdp;
            Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
              var externalStream = pc._reverseStreams[internalId];
              var internalStream = pc._streams[externalStream.id];
              sdp = sdp.replace(new RegExp(externalStream.id, 'g'), internalStream.id);
            });
            return new RTCSessionDescription({
              type: description.type,
              sdp: sdp
            });
          }
          ['createOffer', 'createAnswer'].forEach(function (method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function () {
              var pc = this;
              var args = arguments;
              var isLegacyCall = arguments.length && typeof arguments[0] === 'function';
              if (isLegacyCall) {
                return nativeMethod.apply(pc, [function (description) {
                  var desc = replaceInternalStreamId(pc, description);
                  args[0].apply(null, [desc]);
                }, function (err) {
                  if (args[1]) {
                    args[1].apply(null, err);
                  }
                }, arguments[2]]);
              }
              return nativeMethod.apply(pc, arguments).then(function (description) {
                return replaceInternalStreamId(pc, description);
              });
            };
          });

          var origSetLocalDescription = window.RTCPeerConnection.prototype.setLocalDescription;
          window.RTCPeerConnection.prototype.setLocalDescription = function () {
            var pc = this;
            if (!arguments.length || !arguments[0].type) {
              return origSetLocalDescription.apply(pc, arguments);
            }
            arguments[0] = replaceExternalStreamId(pc, arguments[0]);
            return origSetLocalDescription.apply(pc, arguments);
          };

          // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

          var origLocalDescription = Object.getOwnPropertyDescriptor(window.RTCPeerConnection.prototype, 'localDescription');
          Object.defineProperty(window.RTCPeerConnection.prototype, 'localDescription', {
            get: function get() {
              var pc = this;
              var description = origLocalDescription.get.apply(this);
              if (description.type === '') {
                return description;
              }
              return replaceInternalStreamId(pc, description);
            }
          });

          window.RTCPeerConnection.prototype.removeTrack = function (sender) {
            var pc = this;
            if (pc.signalingState === 'closed') {
              throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
            }
            // We can not yet check for sender instanceof RTCRtpSender
            // since we shim RTPSender. So we check if sender._pc is set.
            if (!sender._pc) {
              throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.', 'TypeError');
            }
            var isLocal = sender._pc === pc;
            if (!isLocal) {
              throw new DOMException('Sender was not created by this connection.', 'InvalidAccessError');
            }

            // Search for the native stream the senders track belongs to.
            pc._streams = pc._streams || {};
            var stream;
            Object.keys(pc._streams).forEach(function (streamid) {
              var hasTrack = pc._streams[streamid].getTracks().find(function (track) {
                return sender.track === track;
              });
              if (hasTrack) {
                stream = pc._streams[streamid];
              }
            });

            if (stream) {
              if (stream.getTracks().length === 1) {
                // if this is the last track of the stream, remove the stream. This
                // takes care of any shimmed _senders.
                pc.removeStream(pc._reverseStreams[stream.id]);
              } else {
                // relying on the same odd chrome behaviour as above.
                stream.removeTrack(sender.track);
              }
              pc.dispatchEvent(new Event('negotiationneeded'));
            }
          };
        },

        shimPeerConnection: function shimPeerConnection(window) {
          var browserDetails = utils.detectBrowser(window);

          // The RTCPeerConnection object.
          if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
            window.RTCPeerConnection = function (pcConfig, pcConstraints) {
              // Translate iceTransportPolicy to iceTransports,
              // see https://code.google.com/p/webrtc/issues/detail?id=4869
              // this was fixed in M56 along with unprefixing RTCPeerConnection.
              logging('PeerConnection');
              if (pcConfig && pcConfig.iceTransportPolicy) {
                pcConfig.iceTransports = pcConfig.iceTransportPolicy;
              }

              return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
            };
            window.RTCPeerConnection.prototype = window.webkitRTCPeerConnection.prototype;
            // wrap static methods. Currently just generateCertificate.
            if (window.webkitRTCPeerConnection.generateCertificate) {
              Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                get: function get() {
                  return window.webkitRTCPeerConnection.generateCertificate;
                }
              });
            }
          } else {
            // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
            var OrigPeerConnection = window.RTCPeerConnection;
            window.RTCPeerConnection = function (pcConfig, pcConstraints) {
              if (pcConfig && pcConfig.iceServers) {
                var newIceServers = [];
                for (var i = 0; i < pcConfig.iceServers.length; i++) {
                  var server = pcConfig.iceServers[i];
                  if (!server.hasOwnProperty('urls') && server.hasOwnProperty('url')) {
                    utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
                    server = JSON.parse(JSON.stringify(server));
                    server.urls = server.url;
                    newIceServers.push(server);
                  } else {
                    newIceServers.push(pcConfig.iceServers[i]);
                  }
                }
                pcConfig.iceServers = newIceServers;
              }
              return new OrigPeerConnection(pcConfig, pcConstraints);
            };
            window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
            // wrap static methods. Currently just generateCertificate.
            Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
              get: function get() {
                return OrigPeerConnection.generateCertificate;
              }
            });
          }

          var origGetStats = window.RTCPeerConnection.prototype.getStats;
          window.RTCPeerConnection.prototype.getStats = function (selector, successCallback, errorCallback) {
            var pc = this;
            var args = arguments;

            // If selector is a function then we are in the old style stats so just
            // pass back the original getStats format to avoid breaking old users.
            if (arguments.length > 0 && typeof selector === 'function') {
              return origGetStats.apply(this, arguments);
            }

            // When spec-style getStats is supported, return those when called with
            // either no arguments or the selector argument is null.
            if (origGetStats.length === 0 && (arguments.length === 0 || typeof arguments[0] !== 'function')) {
              return origGetStats.apply(this, []);
            }

            var fixChromeStats_ = function fixChromeStats_(response) {
              var standardReport = {};
              var reports = response.result();
              reports.forEach(function (report) {
                var standardStats = {
                  id: report.id,
                  timestamp: report.timestamp,
                  type: {
                    localcandidate: 'local-candidate',
                    remotecandidate: 'remote-candidate'
                  }[report.type] || report.type
                };
                report.names().forEach(function (name) {
                  standardStats[name] = report.stat(name);
                });
                standardReport[standardStats.id] = standardStats;
              });

              return standardReport;
            };

            // shim getStats with maplike support
            var makeMapStats = function makeMapStats(stats) {
              return new Map(Object.keys(stats).map(function (key) {
                return [key, stats[key]];
              }));
            };

            if (arguments.length >= 2) {
              var successCallbackWrapper_ = function successCallbackWrapper_(response) {
                args[1](makeMapStats(fixChromeStats_(response)));
              };

              return origGetStats.apply(this, [successCallbackWrapper_, arguments[0]]);
            }

            // promise-support
            return new Promise(function (resolve, reject) {
              origGetStats.apply(pc, [function (response) {
                resolve(makeMapStats(fixChromeStats_(response)));
              }, reject]);
            }).then(successCallback, errorCallback);
          };

          // add promise support -- natively available in Chrome 51
          if (browserDetails.version < 51) {
            ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
              var nativeMethod = window.RTCPeerConnection.prototype[method];
              window.RTCPeerConnection.prototype[method] = function () {
                var args = arguments;
                var pc = this;
                var promise = new Promise(function (resolve, reject) {
                  nativeMethod.apply(pc, [args[0], resolve, reject]);
                });
                if (args.length < 2) {
                  return promise;
                }
                return promise.then(function () {
                  args[1].apply(null, []);
                }, function (err) {
                  if (args.length >= 3) {
                    args[2].apply(null, [err]);
                  }
                });
              };
            });
          }

          // promise support for createOffer and createAnswer. Available (without
          // bugs) since M52: crbug/619289
          if (browserDetails.version < 52) {
            ['createOffer', 'createAnswer'].forEach(function (method) {
              var nativeMethod = window.RTCPeerConnection.prototype[method];
              window.RTCPeerConnection.prototype[method] = function () {
                var pc = this;
                if (arguments.length < 1 || arguments.length === 1 && _typeof(arguments[0]) === 'object') {
                  var opts = arguments.length === 1 ? arguments[0] : undefined;
                  return new Promise(function (resolve, reject) {
                    nativeMethod.apply(pc, [resolve, reject, opts]);
                  });
                }
                return nativeMethod.apply(this, arguments);
              };
            });
          }

          // shim implicit creation of RTCSessionDescription/RTCIceCandidate
          ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function () {
              arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
              return nativeMethod.apply(this, arguments);
            };
          });

          // support for addIceCandidate(null or undefined)
          var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
          window.RTCPeerConnection.prototype.addIceCandidate = function () {
            if (!arguments[0]) {
              if (arguments[1]) {
                arguments[1].apply(null);
              }
              return Promise.resolve();
            }
            return nativeAddIceCandidate.apply(this, arguments);
          };
        }
      };
    }, { "../utils.js": 13, "./getusermedia": 6 }], 6: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils.js');
      var logging = utils.log;

      // Expose public methods.
      module.exports = function (window) {
        var browserDetails = utils.detectBrowser(window);
        var navigator = window && window.navigator;

        var constraintsToChrome_ = function constraintsToChrome_(c) {
          if ((typeof c === "undefined" ? "undefined" : _typeof(c)) !== 'object' || c.mandatory || c.optional) {
            return c;
          }
          var cc = {};
          Object.keys(c).forEach(function (key) {
            if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
              return;
            }
            var r = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
            if (r.exact !== undefined && typeof r.exact === 'number') {
              r.min = r.max = r.exact;
            }
            var oldname_ = function oldname_(prefix, name) {
              if (prefix) {
                return prefix + name.charAt(0).toUpperCase() + name.slice(1);
              }
              return name === 'deviceId' ? 'sourceId' : name;
            };
            if (r.ideal !== undefined) {
              cc.optional = cc.optional || [];
              var oc = {};
              if (typeof r.ideal === 'number') {
                oc[oldname_('min', key)] = r.ideal;
                cc.optional.push(oc);
                oc = {};
                oc[oldname_('max', key)] = r.ideal;
                cc.optional.push(oc);
              } else {
                oc[oldname_('', key)] = r.ideal;
                cc.optional.push(oc);
              }
            }
            if (r.exact !== undefined && typeof r.exact !== 'number') {
              cc.mandatory = cc.mandatory || {};
              cc.mandatory[oldname_('', key)] = r.exact;
            } else {
              ['min', 'max'].forEach(function (mix) {
                if (r[mix] !== undefined) {
                  cc.mandatory = cc.mandatory || {};
                  cc.mandatory[oldname_(mix, key)] = r[mix];
                }
              });
            }
          });
          if (c.advanced) {
            cc.optional = (cc.optional || []).concat(c.advanced);
          }
          return cc;
        };

        var shimConstraints_ = function shimConstraints_(constraints, func) {
          if (browserDetails.version >= 61) {
            return func(constraints);
          }
          constraints = JSON.parse(JSON.stringify(constraints));
          if (constraints && _typeof(constraints.audio) === 'object') {
            var remap = function remap(obj, a, b) {
              if (a in obj && !(b in obj)) {
                obj[b] = obj[a];
                delete obj[a];
              }
            };
            constraints = JSON.parse(JSON.stringify(constraints));
            remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
            remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
            constraints.audio = constraintsToChrome_(constraints.audio);
          }
          if (constraints && _typeof(constraints.video) === 'object') {
            // Shim facingMode for mobile & surface pro.
            var face = constraints.video.facingMode;
            face = face && ((typeof face === "undefined" ? "undefined" : _typeof(face)) === 'object' ? face : { ideal: face });
            var getSupportedFacingModeLies = browserDetails.version < 66;

            if (face && (face.exact === 'user' || face.exact === 'environment' || face.ideal === 'user' || face.ideal === 'environment') && !(navigator.mediaDevices.getSupportedConstraints && navigator.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
              delete constraints.video.facingMode;
              var matches;
              if (face.exact === 'environment' || face.ideal === 'environment') {
                matches = ['back', 'rear'];
              } else if (face.exact === 'user' || face.ideal === 'user') {
                matches = ['front'];
              }
              if (matches) {
                // Look for matches in label, or use last cam for back (typical).
                return navigator.mediaDevices.enumerateDevices().then(function (devices) {
                  devices = devices.filter(function (d) {
                    return d.kind === 'videoinput';
                  });
                  var dev = devices.find(function (d) {
                    return matches.some(function (match) {
                      return d.label.toLowerCase().indexOf(match) !== -1;
                    });
                  });
                  if (!dev && devices.length && matches.indexOf('back') !== -1) {
                    dev = devices[devices.length - 1]; // more likely the back cam
                  }
                  if (dev) {
                    constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
                  }
                  constraints.video = constraintsToChrome_(constraints.video);
                  logging('chrome: ' + JSON.stringify(constraints));
                  return func(constraints);
                });
              }
            }
            constraints.video = constraintsToChrome_(constraints.video);
          }
          logging('chrome: ' + JSON.stringify(constraints));
          return func(constraints);
        };

        var shimError_ = function shimError_(e) {
          return {
            name: {
              PermissionDeniedError: 'NotAllowedError',
              PermissionDismissedError: 'NotAllowedError',
              InvalidStateError: 'NotAllowedError',
              DevicesNotFoundError: 'NotFoundError',
              ConstraintNotSatisfiedError: 'OverconstrainedError',
              TrackStartError: 'NotReadableError',
              MediaDeviceFailedDueToShutdown: 'NotAllowedError',
              MediaDeviceKillSwitchOn: 'NotAllowedError',
              TabCaptureError: 'AbortError',
              ScreenCaptureError: 'AbortError',
              DeviceCaptureError: 'AbortError'
            }[e.name] || e.name,
            message: e.message,
            constraint: e.constraintName,
            toString: function toString() {
              return this.name + (this.message && ': ') + this.message;
            }
          };
        };

        var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
          shimConstraints_(constraints, function (c) {
            navigator.webkitGetUserMedia(c, onSuccess, function (e) {
              if (onError) {
                onError(shimError_(e));
              }
            });
          });
        };

        navigator.getUserMedia = getUserMedia_;

        // Returns the result of getUserMedia as a Promise.
        var getUserMediaPromise_ = function getUserMediaPromise_(constraints) {
          return new Promise(function (resolve, reject) {
            navigator.getUserMedia(constraints, resolve, reject);
          });
        };

        if (!navigator.mediaDevices) {
          navigator.mediaDevices = {
            getUserMedia: getUserMediaPromise_,
            enumerateDevices: function enumerateDevices() {
              return new Promise(function (resolve) {
                var kinds = { audio: 'audioinput', video: 'videoinput' };
                return window.MediaStreamTrack.getSources(function (devices) {
                  resolve(devices.map(function (device) {
                    return { label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: '' };
                  }));
                });
              });
            },
            getSupportedConstraints: function getSupportedConstraints() {
              return {
                deviceId: true, echoCancellation: true, facingMode: true,
                frameRate: true, height: true, width: true
              };
            }
          };
        }

        // A shim for getUserMedia method on the mediaDevices object.
        // TODO(KaptenJansson) remove once implemented in Chrome stable.
        if (!navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia = function (constraints) {
            return getUserMediaPromise_(constraints);
          };
        } else {
          // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
          // function which returns a Promise, it does not accept spec-style
          // constraints.
          var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function (cs) {
            return shimConstraints_(cs, function (c) {
              return origGetUserMedia(c).then(function (stream) {
                if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
                  stream.getTracks().forEach(function (track) {
                    track.stop();
                  });
                  throw new DOMException('', 'NotFoundError');
                }
                return stream;
              }, function (e) {
                return Promise.reject(shimError_(e));
              });
            });
          };
        }

        // Dummy devicechange event methods.
        // TODO(KaptenJansson) remove once implemented in Chrome stable.
        if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
          navigator.mediaDevices.addEventListener = function () {
            logging('Dummy mediaDevices.addEventListener called.');
          };
        }
        if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
          navigator.mediaDevices.removeEventListener = function () {
            logging('Dummy mediaDevices.removeEventListener called.');
          };
        }
      };
    }, { "../utils.js": 13 }], 7: [function (require, module, exports) {
      /*
       *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var SDPUtils = require('sdp');
      var utils = require('./utils');

      module.exports = {
        shimRTCIceCandidate: function shimRTCIceCandidate(window) {
          // foundation is arbitrarily chosen as an indicator for full support for
          // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
          if (!window.RTCIceCandidate || window.RTCIceCandidate && 'foundation' in window.RTCIceCandidate.prototype) {
            return;
          }

          var NativeRTCIceCandidate = window.RTCIceCandidate;
          window.RTCIceCandidate = function (args) {
            // Remove the a= which shouldn't be part of the candidate string.
            if ((typeof args === "undefined" ? "undefined" : _typeof(args)) === 'object' && args.candidate && args.candidate.indexOf('a=') === 0) {
              args = JSON.parse(JSON.stringify(args));
              args.candidate = args.candidate.substr(2);
            }

            if (args.candidate && args.candidate.length) {
              // Augment the native candidate with the parsed fields.
              var nativeCandidate = new NativeRTCIceCandidate(args);
              var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
              var augmentedCandidate = _extends(nativeCandidate, parsedCandidate);

              // Add a serializer that does not serialize the extra attributes.
              augmentedCandidate.toJSON = function () {
                return {
                  candidate: augmentedCandidate.candidate,
                  sdpMid: augmentedCandidate.sdpMid,
                  sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
                  usernameFragment: augmentedCandidate.usernameFragment
                };
              };
              return augmentedCandidate;
            }
            return new NativeRTCIceCandidate(args);
          };
          window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

          // Hook up the augmented candidate in onicecandidate and
          // addEventListener('icecandidate', ...)
          utils.wrapPeerConnectionEvent(window, 'icecandidate', function (e) {
            if (e.candidate) {
              Object.defineProperty(e, 'candidate', {
                value: new window.RTCIceCandidate(e.candidate),
                writable: 'false'
              });
            }
            return e;
          });
        },

        // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

        shimCreateObjectURL: function shimCreateObjectURL(window) {
          var URL = window && window.URL;

          if (!((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.HTMLMediaElement && 'srcObject' in window.HTMLMediaElement.prototype && URL.createObjectURL && URL.revokeObjectURL)) {
            // Only shim CreateObjectURL using srcObject if srcObject exists.
            return undefined;
          }

          var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
          var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
          var streams = new Map(),
              newId = 0;

          URL.createObjectURL = function (stream) {
            if ('getTracks' in stream) {
              var url = 'polyblob:' + ++newId;
              streams.set(url, stream);
              utils.deprecated('URL.createObjectURL(stream)', 'elem.srcObject = stream');
              return url;
            }
            return nativeCreateObjectURL(stream);
          };
          URL.revokeObjectURL = function (url) {
            nativeRevokeObjectURL(url);
            streams["delete"](url);
          };

          var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype, 'src');
          Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
            get: function get() {
              return dsc.get.apply(this);
            },
            set: function set(url) {
              this.srcObject = streams.get(url) || null;
              return dsc.set.apply(this, [url]);
            }
          });

          var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
          window.HTMLMediaElement.prototype.setAttribute = function () {
            if (arguments.length === 2 && ('' + arguments[0]).toLowerCase() === 'src') {
              this.srcObject = streams.get(arguments[1]) || null;
            }
            return nativeSetAttribute.apply(this, arguments);
          };
        },

        shimMaxMessageSize: function shimMaxMessageSize(window) {
          if (window.RTCSctpTransport || !window.RTCPeerConnection) {
            return;
          }
          var browserDetails = utils.detectBrowser(window);

          if (!('sctp' in window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
              get: function get() {
                return typeof this._sctp === 'undefined' ? null : this._sctp;
              }
            });
          }

          var sctpInDescription = function sctpInDescription(description) {
            var sections = SDPUtils.splitSections(description.sdp);
            sections.shift();
            return sections.some(function (mediaSection) {
              var mLine = SDPUtils.parseMLine(mediaSection);
              return mLine && mLine.kind === 'application' && mLine.protocol.indexOf('SCTP') !== -1;
            });
          };

          var getRemoteFirefoxVersion = function getRemoteFirefoxVersion(description) {
            // TODO: Is there a better solution for detecting Firefox?
            var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
            if (match === null || match.length < 2) {
              return -1;
            }
            var version = parseInt(match[1], 10);
            // Test for NaN (yes, this is ugly)
            return version !== version ? -1 : version;
          };

          var getCanSendMaxMessageSize = function getCanSendMaxMessageSize(remoteIsFirefox) {
            // Every implementation we know can send at least 64 KiB.
            // Note: Although Chrome is technically able to send up to 256 KiB, the
            //       data does not reach the other peer reliably.
            //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
            var canSendMaxMessageSize = 65536;
            if (browserDetails.browser === 'firefox') {
              if (browserDetails.version < 57) {
                if (remoteIsFirefox === -1) {
                  // FF < 57 will send in 16 KiB chunks using the deprecated PPID
                  // fragmentation.
                  canSendMaxMessageSize = 16384;
                } else {
                  // However, other FF (and RAWRTC) can reassemble PPID-fragmented
                  // messages. Thus, supporting ~2 GiB when sending.
                  canSendMaxMessageSize = 2147483637;
                }
              } else {
                // Currently, all FF >= 57 will reset the remote maximum message size
                // to the default value when a data channel is created at a later
                // stage. :(
                // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
                canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
              }
            }
            return canSendMaxMessageSize;
          };

          var getMaxMessageSize = function getMaxMessageSize(description, remoteIsFirefox) {
            // Note: 65536 bytes is the default value from the SDP spec. Also,
            //       every implementation we know supports receiving 65536 bytes.
            var maxMessageSize = 65536;

            // FF 57 has a slightly incorrect default remote max message size, so
            // we need to adjust it here to avoid a failure when sending.
            // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
            if (browserDetails.browser === 'firefox' && browserDetails.version === 57) {
              maxMessageSize = 65535;
            }

            var match = SDPUtils.matchPrefix(description.sdp, 'a=max-message-size:');
            if (match.length > 0) {
              maxMessageSize = parseInt(match[0].substr(19), 10);
            } else if (browserDetails.browser === 'firefox' && remoteIsFirefox !== -1) {
              // If the maximum message size is not present in the remote SDP and
              // both local and remote are Firefox, the remote peer can receive
              // ~2 GiB.
              maxMessageSize = 2147483637;
            }
            return maxMessageSize;
          };

          var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
          window.RTCPeerConnection.prototype.setRemoteDescription = function () {
            var pc = this;
            pc._sctp = null;

            if (sctpInDescription(arguments[0])) {
              // Check if the remote is FF.
              var isFirefox = getRemoteFirefoxVersion(arguments[0]);

              // Get the maximum message size the local peer is capable of sending
              var canSendMMS = getCanSendMaxMessageSize(isFirefox);

              // Get the maximum message size of the remote peer.
              var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

              // Determine final maximum message size
              var maxMessageSize;
              if (canSendMMS === 0 && remoteMMS === 0) {
                maxMessageSize = Number.POSITIVE_INFINITY;
              } else if (canSendMMS === 0 || remoteMMS === 0) {
                maxMessageSize = Math.max(canSendMMS, remoteMMS);
              } else {
                maxMessageSize = Math.min(canSendMMS, remoteMMS);
              }

              // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
              // attribute.
              var sctp = {};
              Object.defineProperty(sctp, 'maxMessageSize', {
                get: function get() {
                  return maxMessageSize;
                }
              });
              pc._sctp = sctp;
            }

            return origSetRemoteDescription.apply(pc, arguments);
          };
        },

        shimSendThrowTypeError: function shimSendThrowTypeError(window) {
          if (!(window.RTCPeerConnection && 'createDataChannel' in window.RTCPeerConnection.prototype)) {
            return;
          }

          // Note: Although Firefox >= 57 has a native implementation, the maximum
          //       message size can be reset for all data channels at a later stage.
          //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

          var origCreateDataChannel = window.RTCPeerConnection.prototype.createDataChannel;
          window.RTCPeerConnection.prototype.createDataChannel = function () {
            var pc = this;
            var dataChannel = origCreateDataChannel.apply(pc, arguments);
            var origDataChannelSend = dataChannel.send;

            // Patch 'send' method
            dataChannel.send = function () {
              var dc = this;
              var data = arguments[0];
              var length = data.length || data.size || data.byteLength;
              if (length > pc.sctp.maxMessageSize) {
                throw new DOMException('Message too large (can send a maximum of ' + pc.sctp.maxMessageSize + ' bytes)', 'TypeError');
              }
              return origDataChannelSend.apply(dc, arguments);
            };

            return dataChannel;
          };
        }
      };
    }, { "./utils": 13, "sdp": 2 }], 8: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils');
      var shimRTCPeerConnection = require('rtcpeerconnection-shim');

      module.exports = {
        shimGetUserMedia: require('./getusermedia'),
        shimPeerConnection: function shimPeerConnection(window) {
          var browserDetails = utils.detectBrowser(window);

          if (window.RTCIceGatherer) {
            if (!window.RTCIceCandidate) {
              window.RTCIceCandidate = function (args) {
                return args;
              };
            }
            if (!window.RTCSessionDescription) {
              window.RTCSessionDescription = function (args) {
                return args;
              };
            }
            // this adds an additional event listener to MediaStrackTrack that signals
            // when a tracks enabled property was changed. Workaround for a bug in
            // addStream, see below. No longer required in 15025+
            if (browserDetails.version < 15025) {
              var origMSTEnabled = Object.getOwnPropertyDescriptor(window.MediaStreamTrack.prototype, 'enabled');
              Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
                set: function set(value) {
                  origMSTEnabled.set.call(this, value);
                  var ev = new Event('enabled');
                  ev.enabled = value;
                  this.dispatchEvent(ev);
                }
              });
            }
          }

          // ORTC defines the DTMF sender a bit different.
          // https://github.com/w3c/ortc/issues/714
          if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
            Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
              get: function get() {
                if (this._dtmf === undefined) {
                  if (this.track.kind === 'audio') {
                    this._dtmf = new window.RTCDtmfSender(this);
                  } else if (this.track.kind === 'video') {
                    this._dtmf = null;
                  }
                }
                return this._dtmf;
              }
            });
          }
          // Edge currently only implements the RTCDtmfSender, not the
          // RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
          if (window.RTCDtmfSender && !window.RTCDTMFSender) {
            window.RTCDTMFSender = window.RTCDtmfSender;
          }

          window.RTCPeerConnection = shimRTCPeerConnection(window, browserDetails.version);
        },
        shimReplaceTrack: function shimReplaceTrack(window) {
          // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
          if (window.RTCRtpSender && !('replaceTrack' in window.RTCRtpSender.prototype)) {
            window.RTCRtpSender.prototype.replaceTrack = window.RTCRtpSender.prototype.setTrack;
          }
        }
      };
    }, { "../utils": 13, "./getusermedia": 9, "rtcpeerconnection-shim": 1 }], 9: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      // Expose public methods.

      module.exports = function (window) {
        var navigator = window && window.navigator;

        var shimError_ = function shimError_(e) {
          return {
            name: { PermissionDeniedError: 'NotAllowedError' }[e.name] || e.name,
            message: e.message,
            constraint: e.constraint,
            toString: function toString() {
              return this.name;
            }
          };
        };

        // getUserMedia error shim.
        var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function (c) {
          return origGetUserMedia(c)["catch"](function (e) {
            return Promise.reject(shimError_(e));
          });
        };
      };
    }, {}], 10: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils');

      module.exports = {
        shimGetUserMedia: require('./getusermedia'),
        shimOnTrack: function shimOnTrack(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
              get: function get() {
                return this._ontrack;
              },
              set: function set(f) {
                if (this._ontrack) {
                  this.removeEventListener('track', this._ontrack);
                  this.removeEventListener('addstream', this._ontrackpoly);
                }
                this.addEventListener('track', this._ontrack = f);
                this.addEventListener('addstream', this._ontrackpoly = function (e) {
                  e.stream.getTracks().forEach(function (track) {
                    var event = new Event('track');
                    event.track = track;
                    event.receiver = { track: track };
                    event.transceiver = { receiver: event.receiver };
                    event.streams = [e.stream];
                    this.dispatchEvent(event);
                  }.bind(this));
                }.bind(this));
              }
            });
          }
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
            Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
              get: function get() {
                return { receiver: this.receiver };
              }
            });
          }
        },

        shimSourceObject: function shimSourceObject(window) {
          // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
            if (window.HTMLMediaElement && !('srcObject' in window.HTMLMediaElement.prototype)) {
              // Shim the srcObject property, once, when HTMLMediaElement is found.
              Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                get: function get() {
                  return this.mozSrcObject;
                },
                set: function set(stream) {
                  this.mozSrcObject = stream;
                }
              });
            }
          }
        },

        shimPeerConnection: function shimPeerConnection(window) {
          var browserDetails = utils.detectBrowser(window);

          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
            return; // probably media.peerconnection.enabled=false in about:config
          }
          // The RTCPeerConnection object.
          if (!window.RTCPeerConnection) {
            window.RTCPeerConnection = function (pcConfig, pcConstraints) {
              if (browserDetails.version < 38) {
                // .urls is not supported in FF < 38.
                // create RTCIceServers with a single url.
                if (pcConfig && pcConfig.iceServers) {
                  var newIceServers = [];
                  for (var i = 0; i < pcConfig.iceServers.length; i++) {
                    var server = pcConfig.iceServers[i];
                    if (server.hasOwnProperty('urls')) {
                      for (var j = 0; j < server.urls.length; j++) {
                        var newServer = {
                          url: server.urls[j]
                        };
                        if (server.urls[j].indexOf('turn') === 0) {
                          newServer.username = server.username;
                          newServer.credential = server.credential;
                        }
                        newIceServers.push(newServer);
                      }
                    } else {
                      newIceServers.push(pcConfig.iceServers[i]);
                    }
                  }
                  pcConfig.iceServers = newIceServers;
                }
              }
              return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
            };
            window.RTCPeerConnection.prototype = window.mozRTCPeerConnection.prototype;

            // wrap static methods. Currently just generateCertificate.
            if (window.mozRTCPeerConnection.generateCertificate) {
              Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                get: function get() {
                  return window.mozRTCPeerConnection.generateCertificate;
                }
              });
            }

            window.RTCSessionDescription = window.mozRTCSessionDescription;
            window.RTCIceCandidate = window.mozRTCIceCandidate;
          }

          // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
          ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function () {
              arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
              return nativeMethod.apply(this, arguments);
            };
          });

          // support for addIceCandidate(null or undefined)
          var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
          window.RTCPeerConnection.prototype.addIceCandidate = function () {
            if (!arguments[0]) {
              if (arguments[1]) {
                arguments[1].apply(null);
              }
              return Promise.resolve();
            }
            return nativeAddIceCandidate.apply(this, arguments);
          };

          // shim getStats with maplike support
          var makeMapStats = function makeMapStats(stats) {
            var map = new Map();
            Object.keys(stats).forEach(function (key) {
              map.set(key, stats[key]);
              map[key] = stats[key];
            });
            return map;
          };

          var modernStatsTypes = {
            inboundrtp: 'inbound-rtp',
            outboundrtp: 'outbound-rtp',
            candidatepair: 'candidate-pair',
            localcandidate: 'local-candidate',
            remotecandidate: 'remote-candidate'
          };

          var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
          window.RTCPeerConnection.prototype.getStats = function (selector, onSucc, onErr) {
            return nativeGetStats.apply(this, [selector || null]).then(function (stats) {
              if (browserDetails.version < 48) {
                stats = makeMapStats(stats);
              }
              if (browserDetails.version < 53 && !onSucc) {
                // Shim only promise getStats with spec-hyphens in type names
                // Leave callback version alone; misc old uses of forEach before Map
                try {
                  stats.forEach(function (stat) {
                    stat.type = modernStatsTypes[stat.type] || stat.type;
                  });
                } catch (e) {
                  if (e.name !== 'TypeError') {
                    throw e;
                  }
                  // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
                  stats.forEach(function (stat, i) {
                    stats.set(i, _extends({}, stat, {
                      type: modernStatsTypes[stat.type] || stat.type
                    }));
                  });
                }
              }
              return stats;
            }).then(onSucc, onErr);
          };
        },

        shimRemoveStream: function shimRemoveStream(window) {
          if (!window.RTCPeerConnection || 'removeStream' in window.RTCPeerConnection.prototype) {
            return;
          }
          window.RTCPeerConnection.prototype.removeStream = function (stream) {
            var pc = this;
            utils.deprecated('removeStream', 'removeTrack');
            this.getSenders().forEach(function (sender) {
              if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
                pc.removeTrack(sender);
              }
            });
          };
        }
      };
    }, { "../utils": 13, "./getusermedia": 11 }], 11: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils');
      var logging = utils.log;

      // Expose public methods.
      module.exports = function (window) {
        var browserDetails = utils.detectBrowser(window);
        var navigator = window && window.navigator;
        var MediaStreamTrack = window && window.MediaStreamTrack;

        var shimError_ = function shimError_(e) {
          return {
            name: {
              InternalError: 'NotReadableError',
              NotSupportedError: 'TypeError',
              PermissionDeniedError: 'NotAllowedError',
              SecurityError: 'NotAllowedError'
            }[e.name] || e.name,
            message: {
              'The operation is insecure.': 'The request is not allowed by the ' + 'user agent or the platform in the current context.'
            }[e.message] || e.message,
            constraint: e.constraint,
            toString: function toString() {
              return this.name + (this.message && ': ') + this.message;
            }
          };
        };

        // getUserMedia constraints shim.
        var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
          var constraintsToFF37_ = function constraintsToFF37_(c) {
            if ((typeof c === "undefined" ? "undefined" : _typeof(c)) !== 'object' || c.require) {
              return c;
            }
            var require = [];
            Object.keys(c).forEach(function (key) {
              if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                return;
              }
              var r = c[key] = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
              if (r.min !== undefined || r.max !== undefined || r.exact !== undefined) {
                require.push(key);
              }
              if (r.exact !== undefined) {
                if (typeof r.exact === 'number') {
                  r.min = r.max = r.exact;
                } else {
                  c[key] = r.exact;
                }
                delete r.exact;
              }
              if (r.ideal !== undefined) {
                c.advanced = c.advanced || [];
                var oc = {};
                if (typeof r.ideal === 'number') {
                  oc[key] = { min: r.ideal, max: r.ideal };
                } else {
                  oc[key] = r.ideal;
                }
                c.advanced.push(oc);
                delete r.ideal;
                if (!Object.keys(r).length) {
                  delete c[key];
                }
              }
            });
            if (require.length) {
              c.require = require;
            }
            return c;
          };
          constraints = JSON.parse(JSON.stringify(constraints));
          if (browserDetails.version < 38) {
            logging('spec: ' + JSON.stringify(constraints));
            if (constraints.audio) {
              constraints.audio = constraintsToFF37_(constraints.audio);
            }
            if (constraints.video) {
              constraints.video = constraintsToFF37_(constraints.video);
            }
            logging('ff37: ' + JSON.stringify(constraints));
          }
          return navigator.mozGetUserMedia(constraints, onSuccess, function (e) {
            onError(shimError_(e));
          });
        };

        // Returns the result of getUserMedia as a Promise.
        var getUserMediaPromise_ = function getUserMediaPromise_(constraints) {
          return new Promise(function (resolve, reject) {
            getUserMedia_(constraints, resolve, reject);
          });
        };

        // Shim for mediaDevices on older versions.
        if (!navigator.mediaDevices) {
          navigator.mediaDevices = { getUserMedia: getUserMediaPromise_,
            addEventListener: function addEventListener() {},
            removeEventListener: function removeEventListener() {}
          };
        }
        navigator.mediaDevices.enumerateDevices = navigator.mediaDevices.enumerateDevices || function () {
          return new Promise(function (resolve) {
            var infos = [{ kind: 'audioinput', deviceId: 'default', label: '', groupId: '' }, { kind: 'videoinput', deviceId: 'default', label: '', groupId: '' }];
            resolve(infos);
          });
        };

        if (browserDetails.version < 41) {
          // Work around http://bugzil.la/1169665
          var orgEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
          navigator.mediaDevices.enumerateDevices = function () {
            return orgEnumerateDevices().then(undefined, function (e) {
              if (e.name === 'NotFoundError') {
                return [];
              }
              throw e;
            });
          };
        }
        if (browserDetails.version < 49) {
          var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function (c) {
            return origGetUserMedia(c).then(function (stream) {
              // Work around https://bugzil.la/802326
              if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
                stream.getTracks().forEach(function (track) {
                  track.stop();
                });
                throw new DOMException('The object can not be found here.', 'NotFoundError');
              }
              return stream;
            }, function (e) {
              return Promise.reject(shimError_(e));
            });
          };
        }
        if (!(browserDetails.version > 55 && 'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
          var remap = function remap(obj, a, b) {
            if (a in obj && !(b in obj)) {
              obj[b] = obj[a];
              delete obj[a];
            }
          };

          var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function (c) {
            if ((typeof c === "undefined" ? "undefined" : _typeof(c)) === 'object' && _typeof(c.audio) === 'object') {
              c = JSON.parse(JSON.stringify(c));
              remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
              remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
            }
            return nativeGetUserMedia(c);
          };

          if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
            var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
            MediaStreamTrack.prototype.getSettings = function () {
              var obj = nativeGetSettings.apply(this, arguments);
              remap(obj, 'mozAutoGainControl', 'autoGainControl');
              remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
              return obj;
            };
          }

          if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
            var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
            MediaStreamTrack.prototype.applyConstraints = function (c) {
              if (this.kind === 'audio' && (typeof c === "undefined" ? "undefined" : _typeof(c)) === 'object') {
                c = JSON.parse(JSON.stringify(c));
                remap(c, 'autoGainControl', 'mozAutoGainControl');
                remap(c, 'noiseSuppression', 'mozNoiseSuppression');
              }
              return nativeApplyConstraints.apply(this, [c]);
            };
          }
        }
        navigator.getUserMedia = function (constraints, onSuccess, onError) {
          if (browserDetails.version < 44) {
            return getUserMedia_(constraints, onSuccess, onError);
          }
          // Replace Firefox 44+'s deprecation warning with unprefixed version.
          utils.deprecated('navigator.getUserMedia', 'navigator.mediaDevices.getUserMedia');
          navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
        };
      };
    }, { "../utils": 13 }], 12: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      'use strict';

      var utils = require('../utils');

      module.exports = {
        shimLocalStreamsAPI: function shimLocalStreamsAPI(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
            return;
          }
          if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
            window.RTCPeerConnection.prototype.getLocalStreams = function () {
              if (!this._localStreams) {
                this._localStreams = [];
              }
              return this._localStreams;
            };
          }
          if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
            window.RTCPeerConnection.prototype.getStreamById = function (id) {
              var result = null;
              if (this._localStreams) {
                this._localStreams.forEach(function (stream) {
                  if (stream.id === id) {
                    result = stream;
                  }
                });
              }
              if (this._remoteStreams) {
                this._remoteStreams.forEach(function (stream) {
                  if (stream.id === id) {
                    result = stream;
                  }
                });
              }
              return result;
            };
          }
          if (!('addStream' in window.RTCPeerConnection.prototype)) {
            var _addTrack = window.RTCPeerConnection.prototype.addTrack;
            window.RTCPeerConnection.prototype.addStream = function (stream) {
              if (!this._localStreams) {
                this._localStreams = [];
              }
              if (this._localStreams.indexOf(stream) === -1) {
                this._localStreams.push(stream);
              }
              var pc = this;
              stream.getTracks().forEach(function (track) {
                _addTrack.call(pc, track, stream);
              });
            };

            window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
              if (stream) {
                if (!this._localStreams) {
                  this._localStreams = [stream];
                } else if (this._localStreams.indexOf(stream) === -1) {
                  this._localStreams.push(stream);
                }
              }
              return _addTrack.call(this, track, stream);
            };
          }
          if (!('removeStream' in window.RTCPeerConnection.prototype)) {
            window.RTCPeerConnection.prototype.removeStream = function (stream) {
              if (!this._localStreams) {
                this._localStreams = [];
              }
              var index = this._localStreams.indexOf(stream);
              if (index === -1) {
                return;
              }
              this._localStreams.splice(index, 1);
              var pc = this;
              var tracks = stream.getTracks();
              this.getSenders().forEach(function (sender) {
                if (tracks.indexOf(sender.track) !== -1) {
                  pc.removeTrack(sender);
                }
              });
            };
          }
        },
        shimRemoteStreamsAPI: function shimRemoteStreamsAPI(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
            return;
          }
          if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
            window.RTCPeerConnection.prototype.getRemoteStreams = function () {
              return this._remoteStreams ? this._remoteStreams : [];
            };
          }
          if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
              get: function get() {
                return this._onaddstream;
              },
              set: function set(f) {
                var pc = this;
                if (this._onaddstream) {
                  this.removeEventListener('addstream', this._onaddstream);
                  this.removeEventListener('track', this._onaddstreampoly);
                }
                this.addEventListener('addstream', this._onaddstream = f);
                this.addEventListener('track', this._onaddstreampoly = function (e) {
                  e.streams.forEach(function (stream) {
                    if (!pc._remoteStreams) {
                      pc._remoteStreams = [];
                    }
                    if (pc._remoteStreams.indexOf(stream) >= 0) {
                      return;
                    }
                    pc._remoteStreams.push(stream);
                    var event = new Event('addstream');
                    event.stream = stream;
                    pc.dispatchEvent(event);
                  });
                });
              }
            });
          }
        },
        shimCallbacksAPI: function shimCallbacksAPI(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
            return;
          }
          var prototype = window.RTCPeerConnection.prototype;
          var createOffer = prototype.createOffer;
          var createAnswer = prototype.createAnswer;
          var setLocalDescription = prototype.setLocalDescription;
          var setRemoteDescription = prototype.setRemoteDescription;
          var addIceCandidate = prototype.addIceCandidate;

          prototype.createOffer = function (successCallback, failureCallback) {
            var options = arguments.length >= 2 ? arguments[2] : arguments[0];
            var promise = createOffer.apply(this, [options]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };

          prototype.createAnswer = function (successCallback, failureCallback) {
            var options = arguments.length >= 2 ? arguments[2] : arguments[0];
            var promise = createAnswer.apply(this, [options]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };

          var withCallback = function withCallback(description, successCallback, failureCallback) {
            var promise = setLocalDescription.apply(this, [description]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };
          prototype.setLocalDescription = withCallback;

          withCallback = function withCallback(description, successCallback, failureCallback) {
            var promise = setRemoteDescription.apply(this, [description]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };
          prototype.setRemoteDescription = withCallback;

          withCallback = function withCallback(candidate, successCallback, failureCallback) {
            var promise = addIceCandidate.apply(this, [candidate]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };
          prototype.addIceCandidate = withCallback;
        },
        shimGetUserMedia: function shimGetUserMedia(window) {
          var navigator = window && window.navigator;

          if (!navigator.getUserMedia) {
            if (navigator.webkitGetUserMedia) {
              navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
            } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              navigator.getUserMedia = function (constraints, cb, errcb) {
                navigator.mediaDevices.getUserMedia(constraints).then(cb, errcb);
              }.bind(navigator);
            }
          }
        },
        shimRTCIceServerUrls: function shimRTCIceServerUrls(window) {
          // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
          var OrigPeerConnection = window.RTCPeerConnection;
          window.RTCPeerConnection = function (pcConfig, pcConstraints) {
            if (pcConfig && pcConfig.iceServers) {
              var newIceServers = [];
              for (var i = 0; i < pcConfig.iceServers.length; i++) {
                var server = pcConfig.iceServers[i];
                if (!server.hasOwnProperty('urls') && server.hasOwnProperty('url')) {
                  utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
                  server = JSON.parse(JSON.stringify(server));
                  server.urls = server.url;
                  delete server.url;
                  newIceServers.push(server);
                } else {
                  newIceServers.push(pcConfig.iceServers[i]);
                }
              }
              pcConfig.iceServers = newIceServers;
            }
            return new OrigPeerConnection(pcConfig, pcConstraints);
          };
          window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
          // wrap static methods. Currently just generateCertificate.
          if ('generateCertificate' in window.RTCPeerConnection) {
            Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
              get: function get() {
                return OrigPeerConnection.generateCertificate;
              }
            });
          }
        },
        shimTrackEventTransceiver: function shimTrackEventTransceiver(window) {
          // Add event.transceiver member over deprecated event.receiver
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && 'receiver' in window.RTCTrackEvent.prototype &&
          // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
          // defined for some reason even when window.RTCTransceiver is not.
          !window.RTCTransceiver) {
            Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
              get: function get() {
                return { receiver: this.receiver };
              }
            });
          }
        },

        shimCreateOfferLegacy: function shimCreateOfferLegacy(window) {
          var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
          window.RTCPeerConnection.prototype.createOffer = function (offerOptions) {
            var pc = this;
            if (offerOptions) {
              if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
                // support bit values
                offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
              }
              var audioTransceiver = pc.getTransceivers().find(function (transceiver) {
                return transceiver.sender.track && transceiver.sender.track.kind === 'audio';
              });
              if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
                if (audioTransceiver.direction === 'sendrecv') {
                  if (audioTransceiver.setDirection) {
                    audioTransceiver.setDirection('sendonly');
                  } else {
                    audioTransceiver.direction = 'sendonly';
                  }
                } else if (audioTransceiver.direction === 'recvonly') {
                  if (audioTransceiver.setDirection) {
                    audioTransceiver.setDirection('inactive');
                  } else {
                    audioTransceiver.direction = 'inactive';
                  }
                }
              } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
                pc.addTransceiver('audio');
              }

              if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
                // support bit values
                offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
              }
              var videoTransceiver = pc.getTransceivers().find(function (transceiver) {
                return transceiver.sender.track && transceiver.sender.track.kind === 'video';
              });
              if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
                if (videoTransceiver.direction === 'sendrecv') {
                  videoTransceiver.setDirection('sendonly');
                } else if (videoTransceiver.direction === 'recvonly') {
                  videoTransceiver.setDirection('inactive');
                }
              } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
                pc.addTransceiver('video');
              }
            }
            return origCreateOffer.apply(pc, arguments);
          };
        }
      };
    }, { "../utils": 13 }], 13: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var logDisabled_ = true;
      var deprecationWarnings_ = true;

      /**
       * Extract browser version out of the provided user agent string.
       *
       * @param {!string} uastring userAgent string.
       * @param {!string} expr Regular expression used as match criteria.
       * @param {!number} pos position in the version string to be returned.
       * @return {!number} browser version.
       */
      function extractVersion(uastring, expr, pos) {
        var match = uastring.match(expr);
        return match && match.length >= pos && parseInt(match[pos], 10);
      }

      // Wraps the peerconnection event eventNameToWrap in a function
      // which returns the modified event object.
      function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
        if (!window.RTCPeerConnection) {
          return;
        }
        var proto = window.RTCPeerConnection.prototype;
        var nativeAddEventListener = proto.addEventListener;
        proto.addEventListener = function (nativeEventName, cb) {
          if (nativeEventName !== eventNameToWrap) {
            return nativeAddEventListener.apply(this, arguments);
          }
          var wrappedCallback = function wrappedCallback(e) {
            cb(wrapper(e));
          };
          this._eventMap = this._eventMap || {};
          this._eventMap[cb] = wrappedCallback;
          return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
        };

        var nativeRemoveEventListener = proto.removeEventListener;
        proto.removeEventListener = function (nativeEventName, cb) {
          if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[cb]) {
            return nativeRemoveEventListener.apply(this, arguments);
          }
          var unwrappedCb = this._eventMap[cb];
          delete this._eventMap[cb];
          return nativeRemoveEventListener.apply(this, [nativeEventName, unwrappedCb]);
        };

        Object.defineProperty(proto, 'on' + eventNameToWrap, {
          get: function get() {
            return this['_on' + eventNameToWrap];
          },
          set: function set(cb) {
            if (this['_on' + eventNameToWrap]) {
              this.removeEventListener(eventNameToWrap, this['_on' + eventNameToWrap]);
              delete this['_on' + eventNameToWrap];
            }
            if (cb) {
              this.addEventListener(eventNameToWrap, this['_on' + eventNameToWrap] = cb);
            }
          }
        });
      }

      // Utility methods.
      module.exports = {
        extractVersion: extractVersion,
        wrapPeerConnectionEvent: wrapPeerConnectionEvent,
        disableLog: function disableLog(bool) {
          if (typeof bool !== 'boolean') {
            return new Error('Argument type: ' + (typeof bool === "undefined" ? "undefined" : _typeof(bool)) + '. Please use a boolean.');
          }
          logDisabled_ = bool;
          return bool ? 'adapter.js logging disabled' : 'adapter.js logging enabled';
        },

        /**
         * Disable or enable deprecation warnings
         * @param {!boolean} bool set to true to disable warnings.
         */
        disableWarnings: function disableWarnings(bool) {
          if (typeof bool !== 'boolean') {
            return new Error('Argument type: ' + (typeof bool === "undefined" ? "undefined" : _typeof(bool)) + '. Please use a boolean.');
          }
          deprecationWarnings_ = !bool;
          return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
        },

        log: function log() {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
            if (logDisabled_) {
              return;
            }
            if (typeof console !== 'undefined' && typeof console.log === 'function') {
              console.log.apply(console, arguments);
            }
          }
        },

        /**
         * Shows a deprecation warning suggesting the modern and spec-compatible API.
         */
        deprecated: function deprecated(oldMethod, newMethod) {
          if (!deprecationWarnings_) {
            return;
          }
          console.warn(oldMethod + ' is deprecated, please use ' + newMethod + ' instead.');
        },

        /**
         * Browser detector.
         *
         * @return {object} result containing browser and version
         *     properties.
         */
        detectBrowser: function detectBrowser(window) {
          var navigator = window && window.navigator;

          // Returned result object.
          var result = {};
          result.browser = null;
          result.version = null;

          // Fail early if it's not a browser
          if (typeof window === 'undefined' || !window.navigator) {
            result.browser = 'Not a browser.';
            return result;
          }

          if (navigator.mozGetUserMedia) {
            // Firefox.
            result.browser = 'firefox';
            result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1);
          } else if (navigator.webkitGetUserMedia) {
            // Chrome, Chromium, Webview, Opera.
            // Version matches Chrome/WebRTC version.
            result.browser = 'chrome';
            result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
          } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
            // Edge.
            result.browser = 'edge';
            result.version = extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2);
          } else if (window.RTCPeerConnection && navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
            // Safari.
            result.browser = 'safari';
            result.version = extractVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1);
          } else {
            // Default fallthrough: not supported.
            result.browser = 'Not a supported browser.';
            return result;
          }

          return result;
        }
      };
    }, {}] }, {}, [3])(3);
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvanMvYXBpL3Byb3ZpZGVyL2h0bWw1L3Byb3ZpZGVycy9XZWJSVEMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2FwaS9wcm92aWRlci9odG1sNS9wcm92aWRlcnMvV2ViUlRDTG9hZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy91dGlscy9hZGFwdGVyLmpzIl0sIm5hbWVzIjpbIldlYlJUQyIsImNvbnRhaW5lciIsInBsYXllckNvbmZpZyIsInRoYXQiLCJ3ZWJydGNMb2FkZXIiLCJzdXBlckRlc3Ryb3lfZnVuYyIsIm1lZGlhTWFuYWdlciIsIlBST1ZJREVSX1dFQlJUQyIsImVsZW1lbnQiLCJjcmVhdGUiLCJzcGVjIiwibmFtZSIsImV4dGVuZGVkRWxlbWVudCIsImxpc3RlbmVyIiwiY2FuU2VlayIsImlzTGl2ZSIsInNlZWtpbmciLCJzdGF0ZSIsIlNUQVRFX0lETEUiLCJidWZmZXIiLCJmcmFtZXJhdGUiLCJjdXJyZW50UXVhbGl0eSIsImN1cnJlbnRTb3VyY2UiLCJxdWFsaXR5TGV2ZWxzIiwic291cmNlcyIsInNvdXJjZSIsImZpbGUiLCJ0eXBlIiwiT3ZlblBsYXllckNvbnNvbGUiLCJsb2ciLCJkZXN0cm95IiwiZXJyb3JUcmlnZ2VyIiwiY29ubmVjdCIsInRoZW4iLCJzdHJlYW0iLCJzcmNPYmplY3QiLCJwbGF5IiwiZXJyb3IiLCJXZWJSVENMb2FkZXIiLCJwcm92aWRlciIsInVybCIsIndzIiwicGVlckNvbm5lY3Rpb24iLCJzdGF0aXN0aWNzVGltZXIiLCJjb25maWciLCJ1cmxzIiwiY3JlZGVudGlhbCIsInVzZXJuYW1lIiwiYW5zd2VyU2RwIiwib2ZmZXJTZHAiLCJleGlzdGluZ0hhbmRsZXIiLCJ3aW5kb3ciLCJvbmJlZm9yZXVubG9hZCIsImV2ZW50IiwiY2xvc2VQZWVyIiwiaW5pdGlhbGl6ZSIsIm9uTG9jYWxEZXNjcmlwdGlvbiIsImlkIiwiY29ubmVjdGlvbiIsImRlc2MiLCJzZXRMb2NhbERlc2NyaXB0aW9uIiwibG9jYWxTRFAiLCJsb2NhbERlc2NyaXB0aW9uIiwic2VuZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJjb21tYW5kIiwic2RwIiwidGVtcEVycm9yIiwiRVJST1JTIiwiUExBWUVSX1dFQlJUQ19TRVRfTE9DQUxfREVTQ19FUlJPUiIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiV2ViU29ja2V0Iiwib25vcGVuIiwib25tZXNzYWdlIiwiZSIsIm1lc3NhZ2UiLCJwYXJzZSIsImRhdGEiLCJQTEFZRVJfV0VCUlRDX1dTX0VSUk9SIiwibGlzdCIsIlJUQ1BlZXJDb25uZWN0aW9uIiwib25pY2VjYW5kaWRhdGUiLCJjYW5kaWRhdGUiLCJjYW5kaWRhdGVzIiwib25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UiLCJjb25zb2xlIiwiaWNlQ29ubmVjdGlvblN0YXRlIiwidHJpZ2dlciIsIm9ubmVnb3RpYXRpb25uZWVkZWQiLCJjcmVhdGVPZmZlciIsIlBMQVlFUl9XRUJSVENfQ1JFQVRFX0FOU1dFUl9FUlJPUiIsIm9uYWRkc3RyZWFtIiwibG9zdFBhY2tldHNBcnIiLCJzbG90TGVuZ3RoIiwicHJldlBhY2tldHNMb3N0IiwiYXZnOExvc3NlcyIsImF2Z01vcmVUaGFuVGhyZXNob2xkQ291bnQiLCJ0aHJlc2hvbGQiLCJleHRyYWN0TG9zc1BhY2tldHNPbk5ldHdvcmtTdGF0dXMiLCJzZXRUaW1lb3V0IiwiZ2V0U3RhdHMiLCJzdGF0cyIsImZvckVhY2giLCJpc1JlbW90ZSIsInB1c2giLCJwYXJzZUludCIsInBhY2tldHNMb3N0IiwibGVuZ3RoIiwic2xpY2UiLCJfIiwicmVkdWNlIiwibWVtbyIsIm51bSIsImNsZWFyVGltZW91dCIsIk5FVFdPUktfVU5TVEFCTEVEIiwic2V0UmVtb3RlRGVzY3JpcHRpb24iLCJSVENTZXNzaW9uRGVzY3JpcHRpb24iLCJyZW1vdGVEZXNjcmlwdGlvbiIsImNyZWF0ZUFuc3dlciIsIlBMQVlFUl9XRUJSVENfU0VUX1JFTU9URV9ERVNDX0VSUk9SIiwiaSIsImFkZEljZUNhbmRpZGF0ZSIsIlJUQ0ljZUNhbmRpZGF0ZSIsIlBMQVlFUl9XRUJSVENfQUREX0lDRUNBTkRJREFURV9FUlJPUiIsIm9uZXJyb3IiLCJyZWFkeVN0YXRlIiwiY2xvc2UiLCJmIiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsInQiLCJuIiwiciIsInMiLCJvIiwidSIsImEiLCJyZXF1aXJlIiwiRXJyb3IiLCJjb2RlIiwibCIsImNhbGwiLCJTRFBVdGlscyIsIndyaXRlTWVkaWFTZWN0aW9uIiwidHJhbnNjZWl2ZXIiLCJjYXBzIiwiZHRsc1JvbGUiLCJ3cml0ZVJ0cERlc2NyaXB0aW9uIiwia2luZCIsIndyaXRlSWNlUGFyYW1ldGVycyIsImljZUdhdGhlcmVyIiwiZ2V0TG9jYWxQYXJhbWV0ZXJzIiwid3JpdGVEdGxzUGFyYW1ldGVycyIsImR0bHNUcmFuc3BvcnQiLCJtaWQiLCJydHBTZW5kZXIiLCJydHBSZWNlaXZlciIsInRyYWNrSWQiLCJfaW5pdGlhbFRyYWNrSWQiLCJ0cmFjayIsIm1zaWQiLCJzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzIiwic3NyYyIsInJ0eCIsImxvY2FsQ05hbWUiLCJmaWx0ZXJJY2VTZXJ2ZXJzIiwiaWNlU2VydmVycyIsImVkZ2VWZXJzaW9uIiwiaGFzVHVybiIsImZpbHRlciIsInNlcnZlciIsIndhcm4iLCJpc1N0cmluZyIsInZhbGlkVHVybiIsImluZGV4T2YiLCJnZXRDb21tb25DYXBhYmlsaXRpZXMiLCJsb2NhbENhcGFiaWxpdGllcyIsInJlbW90ZUNhcGFiaWxpdGllcyIsImNvbW1vbkNhcGFiaWxpdGllcyIsImNvZGVjcyIsImhlYWRlckV4dGVuc2lvbnMiLCJmZWNNZWNoYW5pc21zIiwiZmluZENvZGVjQnlQYXlsb2FkVHlwZSIsInB0IiwicGF5bG9hZFR5cGUiLCJwcmVmZXJyZWRQYXlsb2FkVHlwZSIsInJ0eENhcGFiaWxpdHlNYXRjaGVzIiwibFJ0eCIsInJSdHgiLCJsQ29kZWNzIiwickNvZGVjcyIsImxDb2RlYyIsInBhcmFtZXRlcnMiLCJhcHQiLCJyQ29kZWMiLCJ0b0xvd2VyQ2FzZSIsImNsb2NrUmF0ZSIsIm51bUNoYW5uZWxzIiwiTWF0aCIsIm1pbiIsInJ0Y3BGZWVkYmFjayIsImZiIiwiaiIsInBhcmFtZXRlciIsImxIZWFkZXJFeHRlbnNpb24iLCJySGVhZGVyRXh0ZW5zaW9uIiwidXJpIiwiaXNBY3Rpb25BbGxvd2VkSW5TaWduYWxpbmdTdGF0ZSIsImFjdGlvbiIsInNpZ25hbGluZ1N0YXRlIiwib2ZmZXIiLCJhbnN3ZXIiLCJtYXliZUFkZENhbmRpZGF0ZSIsImljZVRyYW5zcG9ydCIsImFscmVhZHlBZGRlZCIsImdldFJlbW90ZUNhbmRpZGF0ZXMiLCJmaW5kIiwicmVtb3RlQ2FuZGlkYXRlIiwiZm91bmRhdGlvbiIsImlwIiwicG9ydCIsInByaW9yaXR5IiwicHJvdG9jb2wiLCJhZGRSZW1vdGVDYW5kaWRhdGUiLCJtYWtlRXJyb3IiLCJkZXNjcmlwdGlvbiIsIk5vdFN1cHBvcnRlZEVycm9yIiwiSW52YWxpZFN0YXRlRXJyb3IiLCJJbnZhbGlkQWNjZXNzRXJyb3IiLCJUeXBlRXJyb3IiLCJ1bmRlZmluZWQiLCJPcGVyYXRpb25FcnJvciIsImFkZFRyYWNrVG9TdHJlYW1BbmRGaXJlRXZlbnQiLCJhZGRUcmFjayIsImRpc3BhdGNoRXZlbnQiLCJNZWRpYVN0cmVhbVRyYWNrRXZlbnQiLCJyZW1vdmVUcmFja0Zyb21TdHJlYW1BbmRGaXJlRXZlbnQiLCJyZW1vdmVUcmFjayIsImZpcmVBZGRUcmFjayIsInBjIiwicmVjZWl2ZXIiLCJzdHJlYW1zIiwidHJhY2tFdmVudCIsIkV2ZW50IiwiX2Rpc3BhdGNoRXZlbnQiLCJfZXZlbnRUYXJnZXQiLCJkb2N1bWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJtZXRob2QiLCJiaW5kIiwiY2FuVHJpY2tsZUljZUNhbmRpZGF0ZXMiLCJuZWVkTmVnb3RpYXRpb24iLCJsb2NhbFN0cmVhbXMiLCJyZW1vdGVTdHJlYW1zIiwiY29ubmVjdGlvblN0YXRlIiwiaWNlR2F0aGVyaW5nU3RhdGUiLCJ1c2luZ0J1bmRsZSIsImJ1bmRsZVBvbGljeSIsInJ0Y3BNdXhQb2xpY3kiLCJpY2VUcmFuc3BvcnRQb2xpY3kiLCJfaWNlR2F0aGVyZXJzIiwiaWNlQ2FuZGlkYXRlUG9vbFNpemUiLCJSVENJY2VHYXRoZXJlciIsImdhdGhlclBvbGljeSIsIl9jb25maWciLCJ0cmFuc2NlaXZlcnMiLCJfc2RwU2Vzc2lvbklkIiwiZ2VuZXJhdGVTZXNzaW9uSWQiLCJfc2RwU2Vzc2lvblZlcnNpb24iLCJfZHRsc1JvbGUiLCJfaXNDbG9zZWQiLCJwcm90b3R5cGUiLCJvbnRyYWNrIiwib25yZW1vdmVzdHJlYW0iLCJvbnNpZ25hbGluZ3N0YXRlY2hhbmdlIiwib25jb25uZWN0aW9uc3RhdGVjaGFuZ2UiLCJvbmljZWdhdGhlcmluZ3N0YXRlY2hhbmdlIiwib25kYXRhY2hhbm5lbCIsIl9lbWl0R2F0aGVyaW5nU3RhdGVDaGFuZ2UiLCJnZXRDb25maWd1cmF0aW9uIiwiZ2V0TG9jYWxTdHJlYW1zIiwiZ2V0UmVtb3RlU3RyZWFtcyIsIl9jcmVhdGVUcmFuc2NlaXZlciIsImRvTm90QWRkIiwiaGFzQnVuZGxlVHJhbnNwb3J0IiwicmVjdkVuY29kaW5nUGFyYW1ldGVycyIsImFzc29jaWF0ZWRSZW1vdGVNZWRpYVN0cmVhbXMiLCJ3YW50UmVjZWl2ZSIsInRyYW5zcG9ydHMiLCJfY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMiLCJhbHJlYWR5RXhpc3RzIiwiX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkIiwiUlRDUnRwU2VuZGVyIiwiYWRkU3RyZWFtIiwiZ2V0VHJhY2tzIiwiY2xvbmVkU3RyZWFtIiwiY2xvbmUiLCJpZHgiLCJjbG9uZWRUcmFjayIsImFkZEV2ZW50TGlzdGVuZXIiLCJlbmFibGVkIiwic2VuZGVyIiwic3RvcCIsIm1hcCIsInNwbGljZSIsInJlbW92ZVN0cmVhbSIsImdldFNlbmRlcnMiLCJnZXRSZWNlaXZlcnMiLCJfY3JlYXRlSWNlR2F0aGVyZXIiLCJzZHBNTGluZUluZGV4Iiwic2hpZnQiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwid3JpdGFibGUiLCJidWZmZXJlZENhbmRpZGF0ZUV2ZW50cyIsImJ1ZmZlckNhbmRpZGF0ZXMiLCJlbmQiLCJrZXlzIiwiX2dhdGhlciIsIm9ubG9jYWxjYW5kaWRhdGUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZXZ0Iiwic2RwTWlkIiwiY2FuZCIsImNvbXBvbmVudCIsInVmcmFnIiwidXNlcm5hbWVGcmFnbWVudCIsInNlcmlhbGl6ZWRDYW5kaWRhdGUiLCJ3cml0ZUNhbmRpZGF0ZSIsInBhcnNlQ2FuZGlkYXRlIiwidG9KU09OIiwic2VjdGlvbnMiLCJnZXRNZWRpYVNlY3Rpb25zIiwiZ2V0RGVzY3JpcHRpb24iLCJqb2luIiwiY29tcGxldGUiLCJldmVyeSIsIlJUQ0ljZVRyYW5zcG9ydCIsIm9uaWNlc3RhdGVjaGFuZ2UiLCJfdXBkYXRlSWNlQ29ubmVjdGlvblN0YXRlIiwiX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSIsIlJUQ0R0bHNUcmFuc3BvcnQiLCJvbmR0bHNzdGF0ZWNoYW5nZSIsIl9kaXNwb3NlSWNlQW5kRHRsc1RyYW5zcG9ydHMiLCJfdHJhbnNjZWl2ZSIsInJlY3YiLCJwYXJhbXMiLCJlbmNvZGluZ3MiLCJydGNwIiwiY25hbWUiLCJjb21wb3VuZCIsInJ0Y3BQYXJhbWV0ZXJzIiwicCIsInJlY2VpdmUiLCJzZXNzaW9ucGFydCIsInNwbGl0U2VjdGlvbnMiLCJtZWRpYVNlY3Rpb24iLCJwYXJzZVJ0cFBhcmFtZXRlcnMiLCJpc0ljZUxpdGUiLCJtYXRjaFByZWZpeCIsInJlamVjdGVkIiwiaXNSZWplY3RlZCIsInJlbW90ZUljZVBhcmFtZXRlcnMiLCJnZXRJY2VQYXJhbWV0ZXJzIiwicmVtb3RlRHRsc1BhcmFtZXRlcnMiLCJnZXREdGxzUGFyYW1ldGVycyIsInJvbGUiLCJzdGFydCIsIl91cGRhdGVTaWduYWxpbmdTdGF0ZSIsInJlY2VpdmVyTGlzdCIsImljZU9wdGlvbnMiLCJzdWJzdHIiLCJzcGxpdCIsImxpbmVzIiwic3BsaXRMaW5lcyIsImdldEtpbmQiLCJkaXJlY3Rpb24iLCJnZXREaXJlY3Rpb24iLCJyZW1vdGVNc2lkIiwicGFyc2VNc2lkIiwiZ2V0TWlkIiwiZ2VuZXJhdGVJZGVudGlmaWVyIiwicGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMiLCJwYXJzZVJ0Y3BQYXJhbWV0ZXJzIiwiaXNDb21wbGV0ZSIsImNhbmRzIiwic2V0VHJhbnNwb3J0Iiwic2V0UmVtb3RlQ2FuZGlkYXRlcyIsIlJUQ1J0cFJlY2VpdmVyIiwiZ2V0Q2FwYWJpbGl0aWVzIiwiY29kZWMiLCJpc05ld1RyYWNrIiwiTWVkaWFTdHJlYW0iLCJnZXQiLCJuYXRpdmVUcmFjayIsInNpZCIsIml0ZW0iLCJuZXdTdGF0ZSIsInN0YXRlcyIsImNsb3NlZCIsImNoZWNraW5nIiwiY29ubmVjdGVkIiwiY29tcGxldGVkIiwiZGlzY29ubmVjdGVkIiwiZmFpbGVkIiwiY29ubmVjdGluZyIsIm51bUF1ZGlvVHJhY2tzIiwibnVtVmlkZW9UcmFja3MiLCJvZmZlck9wdGlvbnMiLCJhcmd1bWVudHMiLCJtYW5kYXRvcnkiLCJvcHRpb25hbCIsIm9mZmVyVG9SZWNlaXZlQXVkaW8iLCJvZmZlclRvUmVjZWl2ZVZpZGVvIiwid3JpdGVTZXNzaW9uQm9pbGVycGxhdGUiLCJyZW1vdGVDb2RlYyIsImhkckV4dCIsInJlbW90ZUV4dGVuc2lvbnMiLCJySGRyRXh0IiwiZ2V0TG9jYWxDYW5kaWRhdGVzIiwibWVkaWFTZWN0aW9uc0luT2ZmZXIiLCJsb2NhbFRyYWNrIiwiZ2V0QXVkaW9UcmFja3MiLCJnZXRWaWRlb1RyYWNrcyIsImhhc1J0eCIsImMiLCJyZWR1Y2VkU2l6ZSIsImNhbmRpZGF0ZVN0cmluZyIsInRyaW0iLCJwcm9taXNlcyIsImZpeFN0YXRzVHlwZSIsInN0YXQiLCJpbmJvdW5kcnRwIiwib3V0Ym91bmRydHAiLCJjYW5kaWRhdGVwYWlyIiwibG9jYWxjYW5kaWRhdGUiLCJyZW1vdGVjYW5kaWRhdGUiLCJyZXN1bHRzIiwiTWFwIiwiYWxsIiwicmVzIiwicmVzdWx0Iiwic2V0IiwibWV0aG9kcyIsIm5hdGl2ZU1ldGhvZCIsImFyZ3MiLCJhcHBseSIsInJhbmRvbSIsInRvU3RyaW5nIiwiYmxvYiIsImxpbmUiLCJwYXJ0cyIsInBhcnQiLCJpbmRleCIsInByZWZpeCIsInN1YnN0cmluZyIsInJlbGF0ZWRBZGRyZXNzIiwicmVsYXRlZFBvcnQiLCJ0Y3BUeXBlIiwidG9VcHBlckNhc2UiLCJwYXJzZUljZU9wdGlvbnMiLCJwYXJzZVJ0cE1hcCIsInBhcnNlZCIsIndyaXRlUnRwTWFwIiwicGFyc2VFeHRtYXAiLCJ3cml0ZUV4dG1hcCIsImhlYWRlckV4dGVuc2lvbiIsInByZWZlcnJlZElkIiwicGFyc2VGbXRwIiwia3YiLCJ3cml0ZUZtdHAiLCJwYXJhbSIsInBhcnNlUnRjcEZiIiwid3JpdGVSdGNwRmIiLCJwYXJzZVNzcmNNZWRpYSIsInNwIiwiY29sb24iLCJhdHRyaWJ1dGUiLCJwYXJzZUZpbmdlcnByaW50IiwiYWxnb3JpdGhtIiwiZmluZ2VycHJpbnRzIiwic2V0dXBUeXBlIiwiZnAiLCJjb25jYXQiLCJpY2VQYXJhbWV0ZXJzIiwicGFzc3dvcmQiLCJtbGluZSIsInJ0cG1hcGxpbmUiLCJmbXRwcyIsIm1heHB0aW1lIiwiZXh0ZW5zaW9uIiwiZW5jb2RpbmdQYXJhbWV0ZXJzIiwiaGFzUmVkIiwiaGFzVWxwZmVjIiwic3NyY3MiLCJwcmltYXJ5U3NyYyIsInNlY29uZGFyeVNzcmMiLCJmbG93cyIsImVuY1BhcmFtIiwiY29kZWNQYXlsb2FkVHlwZSIsImZlYyIsIm1lY2hhbmlzbSIsImJhbmR3aWR0aCIsIm1heEJpdHJhdGUiLCJyZW1vdGVTc3JjIiwib2JqIiwicnNpemUiLCJtdXgiLCJwbGFuQiIsInNlc3NJZCIsInNlc3NWZXIiLCJzZXNzaW9uSWQiLCJ2ZXJzaW9uIiwicGFyc2VNTGluZSIsImZtdCIsInBhcnNlT0xpbmUiLCJzZXNzaW9uVmVyc2lvbiIsIm5ldFR5cGUiLCJhZGRyZXNzVHlwZSIsImFkZHJlc3MiLCJnbG9iYWwiLCJhZGFwdGVyRmFjdG9yeSIsInNlbGYiLCJ1dGlscyIsImRlcGVuZGVuY2llcyIsIm9wdHMiLCJvcHRpb25zIiwic2hpbUNocm9tZSIsInNoaW1GaXJlZm94Iiwic2hpbUVkZ2UiLCJzaGltU2FmYXJpIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJsb2dnaW5nIiwiYnJvd3NlckRldGFpbHMiLCJkZXRlY3RCcm93c2VyIiwiY2hyb21lU2hpbSIsImVkZ2VTaGltIiwiZmlyZWZveFNoaW0iLCJzYWZhcmlTaGltIiwiY29tbW9uU2hpbSIsImFkYXB0ZXIiLCJleHRyYWN0VmVyc2lvbiIsImRpc2FibGVMb2ciLCJkaXNhYmxlV2FybmluZ3MiLCJicm93c2VyIiwic2hpbVBlZXJDb25uZWN0aW9uIiwiYnJvd3NlclNoaW0iLCJzaGltQ3JlYXRlT2JqZWN0VVJMIiwic2hpbUdldFVzZXJNZWRpYSIsInNoaW1NZWRpYVN0cmVhbSIsInNoaW1Tb3VyY2VPYmplY3QiLCJzaGltT25UcmFjayIsInNoaW1BZGRUcmFja1JlbW92ZVRyYWNrIiwic2hpbUdldFNlbmRlcnNXaXRoRHRtZiIsInNoaW1SVENJY2VDYW5kaWRhdGUiLCJzaGltTWF4TWVzc2FnZVNpemUiLCJzaGltU2VuZFRocm93VHlwZUVycm9yIiwic2hpbVJlbW92ZVN0cmVhbSIsInNoaW1SZXBsYWNlVHJhY2siLCJzaGltUlRDSWNlU2VydmVyVXJscyIsInNoaW1DYWxsYmFja3NBUEkiLCJzaGltTG9jYWxTdHJlYW1zQVBJIiwic2hpbVJlbW90ZVN0cmVhbXNBUEkiLCJzaGltVHJhY2tFdmVudFRyYW5zY2VpdmVyIiwic2hpbUNyZWF0ZU9mZmVyTGVnYWN5Iiwid2Via2l0TWVkaWFTdHJlYW0iLCJfb250cmFjayIsIm9yaWdTZXRSZW1vdGVEZXNjcmlwdGlvbiIsIl9vbnRyYWNrcG9seSIsInRlIiwid3JhcFBlZXJDb25uZWN0aW9uRXZlbnQiLCJzaGltU2VuZGVyV2l0aER0bWYiLCJkdG1mIiwiX2R0bWYiLCJjcmVhdGVEVE1GU2VuZGVyIiwiX3BjIiwiX3NlbmRlcnMiLCJvcmlnQWRkVHJhY2siLCJvcmlnUmVtb3ZlVHJhY2siLCJvcmlnQWRkU3RyZWFtIiwib3JpZ1JlbW92ZVN0cmVhbSIsIm9yaWdHZXRTZW5kZXJzIiwic2VuZGVycyIsIlVSTCIsIkhUTUxNZWRpYUVsZW1lbnQiLCJfc3JjT2JqZWN0Iiwic3JjIiwicmV2b2tlT2JqZWN0VVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwic2hpbUFkZFRyYWNrUmVtb3ZlVHJhY2tXaXRoTmF0aXZlIiwiX3NoaW1tZWRMb2NhbFN0cmVhbXMiLCJzdHJlYW1JZCIsIkRPTUV4Y2VwdGlvbiIsImV4aXN0aW5nU2VuZGVycyIsIm5ld1NlbmRlcnMiLCJuZXdTZW5kZXIiLCJvcmlnR2V0TG9jYWxTdHJlYW1zIiwibmF0aXZlU3RyZWFtcyIsIl9yZXZlcnNlU3RyZWFtcyIsIl9zdHJlYW1zIiwibmV3U3RyZWFtIiwib2xkU3RyZWFtIiwicmVwbGFjZUludGVybmFsU3RyZWFtSWQiLCJpbnRlcm5hbElkIiwiZXh0ZXJuYWxTdHJlYW0iLCJpbnRlcm5hbFN0cmVhbSIsInJlcGxhY2UiLCJSZWdFeHAiLCJyZXBsYWNlRXh0ZXJuYWxTdHJlYW1JZCIsImlzTGVnYWN5Q2FsbCIsImVyciIsIm9yaWdTZXRMb2NhbERlc2NyaXB0aW9uIiwib3JpZ0xvY2FsRGVzY3JpcHRpb24iLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJpc0xvY2FsIiwic3RyZWFtaWQiLCJoYXNUcmFjayIsIndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uIiwicGNDb25maWciLCJwY0NvbnN0cmFpbnRzIiwiaWNlVHJhbnNwb3J0cyIsImdlbmVyYXRlQ2VydGlmaWNhdGUiLCJPcmlnUGVlckNvbm5lY3Rpb24iLCJuZXdJY2VTZXJ2ZXJzIiwiZGVwcmVjYXRlZCIsIm9yaWdHZXRTdGF0cyIsInNlbGVjdG9yIiwic3VjY2Vzc0NhbGxiYWNrIiwiZXJyb3JDYWxsYmFjayIsImZpeENocm9tZVN0YXRzXyIsInJlc3BvbnNlIiwic3RhbmRhcmRSZXBvcnQiLCJyZXBvcnRzIiwicmVwb3J0Iiwic3RhbmRhcmRTdGF0cyIsInRpbWVzdGFtcCIsIm5hbWVzIiwibWFrZU1hcFN0YXRzIiwic3VjY2Vzc0NhbGxiYWNrV3JhcHBlcl8iLCJwcm9taXNlIiwibmF0aXZlQWRkSWNlQ2FuZGlkYXRlIiwibmF2aWdhdG9yIiwiY29uc3RyYWludHNUb0Nocm9tZV8iLCJjYyIsImlkZWFsIiwiZXhhY3QiLCJtYXgiLCJvbGRuYW1lXyIsImNoYXJBdCIsIm9jIiwibWl4IiwiYWR2YW5jZWQiLCJzaGltQ29uc3RyYWludHNfIiwiY29uc3RyYWludHMiLCJmdW5jIiwiYXVkaW8iLCJyZW1hcCIsImIiLCJ2aWRlbyIsImZhY2UiLCJmYWNpbmdNb2RlIiwiZ2V0U3VwcG9ydGVkRmFjaW5nTW9kZUxpZXMiLCJtZWRpYURldmljZXMiLCJnZXRTdXBwb3J0ZWRDb25zdHJhaW50cyIsIm1hdGNoZXMiLCJlbnVtZXJhdGVEZXZpY2VzIiwiZGV2aWNlcyIsImQiLCJkZXYiLCJzb21lIiwibWF0Y2giLCJsYWJlbCIsImRldmljZUlkIiwic2hpbUVycm9yXyIsIlBlcm1pc3Npb25EZW5pZWRFcnJvciIsIlBlcm1pc3Npb25EaXNtaXNzZWRFcnJvciIsIkRldmljZXNOb3RGb3VuZEVycm9yIiwiQ29uc3RyYWludE5vdFNhdGlzZmllZEVycm9yIiwiVHJhY2tTdGFydEVycm9yIiwiTWVkaWFEZXZpY2VGYWlsZWREdWVUb1NodXRkb3duIiwiTWVkaWFEZXZpY2VLaWxsU3dpdGNoT24iLCJUYWJDYXB0dXJlRXJyb3IiLCJTY3JlZW5DYXB0dXJlRXJyb3IiLCJEZXZpY2VDYXB0dXJlRXJyb3IiLCJjb25zdHJhaW50IiwiY29uc3RyYWludE5hbWUiLCJnZXRVc2VyTWVkaWFfIiwib25TdWNjZXNzIiwib25FcnJvciIsIndlYmtpdEdldFVzZXJNZWRpYSIsImdldFVzZXJNZWRpYSIsImdldFVzZXJNZWRpYVByb21pc2VfIiwia2luZHMiLCJNZWRpYVN0cmVhbVRyYWNrIiwiZ2V0U291cmNlcyIsImRldmljZSIsImdyb3VwSWQiLCJlY2hvQ2FuY2VsbGF0aW9uIiwiZnJhbWVSYXRlIiwiaGVpZ2h0Iiwid2lkdGgiLCJvcmlnR2V0VXNlck1lZGlhIiwiY3MiLCJOYXRpdmVSVENJY2VDYW5kaWRhdGUiLCJuYXRpdmVDYW5kaWRhdGUiLCJwYXJzZWRDYW5kaWRhdGUiLCJhdWdtZW50ZWRDYW5kaWRhdGUiLCJuYXRpdmVDcmVhdGVPYmplY3RVUkwiLCJuYXRpdmVSZXZva2VPYmplY3RVUkwiLCJuZXdJZCIsImRzYyIsIm5hdGl2ZVNldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsIlJUQ1NjdHBUcmFuc3BvcnQiLCJfc2N0cCIsInNjdHBJbkRlc2NyaXB0aW9uIiwibUxpbmUiLCJnZXRSZW1vdGVGaXJlZm94VmVyc2lvbiIsImdldENhblNlbmRNYXhNZXNzYWdlU2l6ZSIsInJlbW90ZUlzRmlyZWZveCIsImNhblNlbmRNYXhNZXNzYWdlU2l6ZSIsImdldE1heE1lc3NhZ2VTaXplIiwibWF4TWVzc2FnZVNpemUiLCJpc0ZpcmVmb3giLCJjYW5TZW5kTU1TIiwicmVtb3RlTU1TIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJzY3RwIiwib3JpZ0NyZWF0ZURhdGFDaGFubmVsIiwiY3JlYXRlRGF0YUNoYW5uZWwiLCJkYXRhQ2hhbm5lbCIsIm9yaWdEYXRhQ2hhbm5lbFNlbmQiLCJkYyIsInNpemUiLCJieXRlTGVuZ3RoIiwic2hpbVJUQ1BlZXJDb25uZWN0aW9uIiwib3JpZ01TVEVuYWJsZWQiLCJldiIsIlJUQ0R0bWZTZW5kZXIiLCJSVENEVE1GU2VuZGVyIiwicmVwbGFjZVRyYWNrIiwic2V0VHJhY2siLCJSVENUcmFja0V2ZW50IiwibW96U3JjT2JqZWN0IiwibW96UlRDUGVlckNvbm5lY3Rpb24iLCJuZXdTZXJ2ZXIiLCJtb3pSVENTZXNzaW9uRGVzY3JpcHRpb24iLCJtb3pSVENJY2VDYW5kaWRhdGUiLCJtb2Rlcm5TdGF0c1R5cGVzIiwibmF0aXZlR2V0U3RhdHMiLCJvblN1Y2MiLCJvbkVyciIsIkludGVybmFsRXJyb3IiLCJTZWN1cml0eUVycm9yIiwiY29uc3RyYWludHNUb0ZGMzdfIiwibW96R2V0VXNlck1lZGlhIiwiaW5mb3MiLCJvcmdFbnVtZXJhdGVEZXZpY2VzIiwibmF0aXZlR2V0VXNlck1lZGlhIiwiZ2V0U2V0dGluZ3MiLCJuYXRpdmVHZXRTZXR0aW5ncyIsImFwcGx5Q29uc3RyYWludHMiLCJuYXRpdmVBcHBseUNvbnN0cmFpbnRzIiwiX2xvY2FsU3RyZWFtcyIsImdldFN0cmVhbUJ5SWQiLCJfcmVtb3RlU3RyZWFtcyIsIl9hZGRUcmFjayIsInRyYWNrcyIsIl9vbmFkZHN0cmVhbSIsIl9vbmFkZHN0cmVhbXBvbHkiLCJmYWlsdXJlQ2FsbGJhY2siLCJ3aXRoQ2FsbGJhY2siLCJjYiIsImVycmNiIiwiUlRDVHJhbnNjZWl2ZXIiLCJvcmlnQ3JlYXRlT2ZmZXIiLCJhdWRpb1RyYW5zY2VpdmVyIiwiZ2V0VHJhbnNjZWl2ZXJzIiwic2V0RGlyZWN0aW9uIiwiYWRkVHJhbnNjZWl2ZXIiLCJ2aWRlb1RyYW5zY2VpdmVyIiwibG9nRGlzYWJsZWRfIiwiZGVwcmVjYXRpb25XYXJuaW5nc18iLCJ1YXN0cmluZyIsImV4cHIiLCJwb3MiLCJldmVudE5hbWVUb1dyYXAiLCJ3cmFwcGVyIiwicHJvdG8iLCJuYXRpdmVBZGRFdmVudExpc3RlbmVyIiwibmF0aXZlRXZlbnROYW1lIiwid3JhcHBlZENhbGxiYWNrIiwiX2V2ZW50TWFwIiwibmF0aXZlUmVtb3ZlRXZlbnRMaXN0ZW5lciIsInVud3JhcHBlZENiIiwiYm9vbCIsIm9sZE1ldGhvZCIsIm5ld01ldGhvZCIsInVzZXJBZ2VudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBOzs7Ozs7QUFWQTs7O0FBZ0JBLElBQU1BLFNBQVMsU0FBVEEsTUFBUyxDQUFTQyxTQUFULEVBQW9CQyxZQUFw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VUFBVThKLFNBQVYsQ0FBb0JqSSxLQUFwQixDQUEwQixzQkFBMUIsQ0FERyxFQUNnRDtBQUFFO0FBQ3ZEdE8sbUJBQU93RyxPQUFQLEdBQWlCLFFBQWpCO0FBQ0F4RyxtQkFBT3VFLE9BQVAsR0FBaUI4QixlQUFlb0csVUFBVThKLFNBQXpCLEVBQ2Isc0JBRGEsRUFDVyxDQURYLENBQWpCO0FBRUQsV0FMTSxNQUtBO0FBQUU7QUFDUHZXLG1CQUFPd0csT0FBUCxHQUFpQiwwQkFBakI7QUFDQSxtQkFBT3hHLE1BQVA7QUFDRDs7QUFFRCxpQkFBT0EsTUFBUDtBQUNEO0FBOUZjLE9BQWpCO0FBaUdDLEtBaExxQixFQWdMcEIsRUFoTG9CLENBOXBKb3hCLEVBQTNiLEVBODBKeFcsRUE5MEp3VyxFQTgwSnJXLENBQUMsQ0FBRCxDQTkwSnFXLEVBODBKaFcsQ0E5MEpnVyxDQUFQO0FBKzBKdlcsQ0EvMEpELEUiLCJmaWxlIjoib3ZlbnBsYXllci5wcm92aWRlci5XZWJSVENQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGhvaG8gb24gMjAxOC4gNi4gMTEuLlxyXG4gKi9cclxuaW1wb3J0IE1lZGlhTWFuYWdlciBmcm9tIFwiYXBpL21lZGlhL01hbmFnZXJcIjtcclxuaW1wb3J0IFByb3ZpZGVyIGZyb20gXCJhcGkvcHJvdmlkZXIvaHRtbDUvUHJvdmlkZXJcIjtcclxuaW1wb3J0IFdlYlJUQ0xvYWRlciBmcm9tIFwiYXBpL3Byb3ZpZGVyL2h0bWw1L3Byb3ZpZGVycy9XZWJSVENMb2FkZXJcIjtcclxuaW1wb3J0IHtpc1dlYlJUQ30gZnJvbSBcInV0aWxzL3ZhbGlkYXRvclwiO1xyXG5pbXBvcnQge2Vycm9yVHJpZ2dlcn0gZnJvbSBcImFwaS9wcm92aWRlci91dGlsc1wiO1xyXG5pbXBvcnQge1BST1ZJREVSX1dFQlJUQywgU1RBVEVfSURMRX0gZnJvbSBcImFwaS9jb25zdGFudHNcIjtcclxuXHJcbi8qKlxyXG4gKiBAYnJpZWYgICB3ZWJydGMgcHJvdmlkZXIgZXh0ZW5kZWQgY29yZS5cclxuICogQHBhcmFtICAgY29udGFpbmVyIHBsYXllciBlbGVtZW50LlxyXG4gKiBAcGFyYW0gICBwbGF5ZXJDb25maWcgICAgY29uZmlnLlxyXG4gKiAqL1xyXG5cclxuY29uc3QgV2ViUlRDID0gZnVuY3Rpb24oY29udGFpbmVyLCBwbGF5ZXJDb25maWcpe1xyXG4gICAgbGV0IHRoYXQgPSB7fTtcclxuICAgIGxldCB3ZWJydGNMb2FkZXIgPSBudWxsO1xyXG4gICAgbGV0IHN1cGVyRGVzdHJveV9mdW5jICA9IG51bGw7XHJcblxyXG4gICAgbGV0IG1lZGlhTWFuYWdlciA9IE1lZGlhTWFuYWdlcihjb250YWluZXIsIFBST1ZJREVSX1dFQlJUQyk7XHJcbiAgICBsZXQgZWxlbWVudCA9IG1lZGlhTWFuYWdlci5jcmVhdGUoKTtcclxuXHJcbiAgICBsZXQgc3BlYyA9IHtcclxuICAgICAgICBuYW1lIDogUFJPVklERVJfV0VCUlRDLFxyXG4gICAgICAgIGV4dGVuZGVkRWxlbWVudCA6IGVsZW1lbnQsXHJcbiAgICAgICAgbGlzdGVuZXIgOiBudWxsLFxyXG4gICAgICAgIGNhblNlZWsgOiBmYWxzZSxcclxuICAgICAgICBpc0xpdmUgOiBmYWxzZSxcclxuICAgICAgICBzZWVraW5nIDogZmFsc2UsXHJcbiAgICAgICAgc3RhdGUgOiBTVEFURV9JRExFLFxyXG4gICAgICAgIGJ1ZmZlciA6IDAsXHJcbiAgICAgICAgZnJhbWVyYXRlIDogMCxcclxuICAgICAgICBjdXJyZW50UXVhbGl0eSA6IC0xLFxyXG4gICAgICAgIGN1cnJlbnRTb3VyY2UgOiAtMSxcclxuICAgICAgICBxdWFsaXR5TGV2ZWxzIDogW10sXHJcbiAgICAgICAgc291cmNlcyA6IFtdXHJcbiAgICB9O1xyXG5cclxuICAgIHRoYXQgPSBQcm92aWRlcihzcGVjLCBwbGF5ZXJDb25maWcsIGZ1bmN0aW9uKHNvdXJjZSl7XHJcbiAgICAgICAgaWYoaXNXZWJSVEMoc291cmNlLmZpbGUsIHNvdXJjZS50eXBlKSl7XHJcbiAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIldFQlJUQyA6IG9uQmVmb3JlTG9hZCA6IFwiLCBzb3VyY2UpO1xyXG4gICAgICAgICAgICBpZih3ZWJydGNMb2FkZXIpe1xyXG4gICAgICAgICAgICAgICAgd2VicnRjTG9hZGVyLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIHdlYnJ0Y0xvYWRlciA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2VicnRjTG9hZGVyID0gV2ViUlRDTG9hZGVyKHRoYXQsIHNvdXJjZS5maWxlLCBlcnJvclRyaWdnZXIpO1xyXG4gICAgICAgICAgICB3ZWJydGNMb2FkZXIuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc3RyZWFtKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3JjT2JqZWN0ID0gc3RyZWFtO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5wbGF5KCk7XHJcbiAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcclxuICAgICAgICAgICAgICAgIC8vdGhhdC5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAvL0RvIG5vdGhpbmdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzdXBlckRlc3Ryb3lfZnVuYyA9IHRoYXQuc3VwZXIoJ2Rlc3Ryb3knKTtcclxuXHJcbiAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJXRUJSVEMgUFJPVklERVIgTE9BREVELlwiKTtcclxuXHJcblxyXG4gICAgdGhhdC5kZXN0cm95ID0gKCkgPT57XHJcbiAgICAgICAgaWYod2VicnRjTG9hZGVyKXtcclxuICAgICAgICAgICAgd2VicnRjTG9hZGVyLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgd2VicnRjTG9hZGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWVkaWFNYW5hZ2VyLmRlc3Ryb3koKTtcclxuICAgICAgICBtZWRpYU1hbmFnZXIgPSBudWxsO1xyXG4gICAgICAgIGVsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIldFQlJUQyA6ICBQUk9WSURFUiBERVNUUk9ZRUQuXCIpO1xyXG5cclxuICAgICAgICBzdXBlckRlc3Ryb3lfZnVuYygpO1xyXG5cclxuICAgIH07XHJcbiAgICByZXR1cm4gdGhhdDtcclxufTtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBXZWJSVEM7XHJcbiIsImltcG9ydCBhZGFwdGVyIGZyb20gJ3V0aWxzL2FkYXB0ZXInO1xyXG5pbXBvcnQgXyBmcm9tIFwidXRpbHMvdW5kZXJzY29yZVwiO1xyXG5pbXBvcnQge1xyXG4gICAgRVJST1JTLFxyXG4gICAgUExBWUVSX1dFQlJUQ19XU19FUlJPUixcclxuICAgIFBMQVlFUl9XRUJSVENfV1NfQ0xPU0VELFxyXG4gICAgUExBWUVSX1dFQlJUQ19BRERfSUNFQ0FORElEQVRFX0VSUk9SLFxyXG4gICAgUExBWUVSX1dFQlJUQ19TRVRfUkVNT1RFX0RFU0NfRVJST1IsXHJcbiAgICBQTEFZRVJfV0VCUlRDX0NSRUFURV9BTlNXRVJfRVJST1IsXHJcbiAgICBQTEFZRVJfV0VCUlRDX1NFVF9MT0NBTF9ERVNDX0VSUk9SLFxyXG4gICAgUExBWUVSX1dFQlJUQ19ORVRXT1JLX1NMT1csXHJcbiAgICBORVRXT1JLX1VOU1RBQkxFRFxyXG59IGZyb20gXCJhcGkvY29uc3RhbnRzXCI7XHJcblxyXG5cclxuY29uc3QgV2ViUlRDTG9hZGVyID0gZnVuY3Rpb24ocHJvdmlkZXIsIHVybCwgZXJyb3JUcmlnZ2VyKXtcclxuICAgIHZhciB1cmwgPSB1cmw7XHJcbiAgICBsZXQgd3MgPSBcIlwiO1xyXG4gICAgbGV0IHBlZXJDb25uZWN0aW9uID0gXCJcIjtcclxuICAgIGxldCBzdGF0aXN0aWNzVGltZXIgPSBcIlwiO1xyXG4gICAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgICAgICdpY2VTZXJ2ZXJzJzogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB1cmxzOiAndHVybjpudW1iLnZpYWdlbmllLmNhJyxcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWw6ICdtdWF6a2gnLFxyXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6ICd3ZWJydGNAbGl2ZS5jb20nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHVybHM6ICd0dXJuOjE5Mi4xNTguMjkuMzk6MzQ3OD90cmFuc3BvcnQ9dWRwJyxcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWw6ICdKWkVPRXQyVjNRYjB5MjdHUm50dDJ1MlBBWUE9JyxcclxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiAnMjgyMjQ1MTE6MTM3OTMzMDgwOCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdXJsczogJ3R1cm46MTkyLjE1OC4yOS4zOTozNDc4P3RyYW5zcG9ydD10Y3AnLFxyXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbDogJ0paRU9FdDJWM1FiMHkyN0dSbnR0MnUyUEFZQT0nLFxyXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6ICcyODIyNDUxMToxMzc5MzMwODA4J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB1cmxzOiAndHVybjp0dXJuLmJpc3RyaS5jb206ODAnLFxyXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbDogJ2hvbWVvJyxcclxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiAnaG9tZW8nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHVybHM6ICd0dXJuOnR1cm4uYW55ZmlyZXdhbGwuY29tOjQ0Mz90cmFuc3BvcnQ9dGNwJyxcclxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWw6ICd3ZWJydGMnLFxyXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6ICd3ZWJydGMnXHJcbiAgICAgICAgICAgIH0se1xyXG4gICAgICAgICAgICAndXJscyc6ICdzdHVuOnN0dW4ubC5nb29nbGUuY29tOjE5MzAyJ1xyXG4gICAgICAgIH1dXHJcbiAgICB9O1xyXG4gICAgY29uc3QgdGhhdCA9IHt9O1xyXG4gICAgbGV0IGFuc3dlclNkcCA9IFwiXCIsIG9mZmVyU2RwID0gXCJcIjtcclxuXHJcblxyXG4gICAgKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBleGlzdGluZ0hhbmRsZXIgPSB3aW5kb3cub25iZWZvcmV1bmxvYWQ7XHJcbiAgICAgICAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV4aXN0aW5nSGFuZGxlcil7XHJcbiAgICAgICAgICAgICAgICBleGlzdGluZ0hhbmRsZXIoZXZlbnQpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJUaGlzIGNhbGxzIGF1dG8gd2hlbiBicm93c2VyIGNsb3NlZC5cIik7XHJcbiAgICAgICAgICAgIGNsb3NlUGVlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH0pKCk7XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XHJcbiAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiV2ViUlRDTG9hZGVyIGNvbm5lY3RpbmcuLi5cIik7XHJcblxyXG4gICAgICAgIGNvbnN0IG9uTG9jYWxEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGlkLCBjb25uZWN0aW9uLCBkZXNjKSB7XHJcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihkZXNjKS50aGVuKGZ1bmN0aW9uICgpe1xyXG4gICAgICAgICAgICAgICAgLy8gbXkgU0RQIGNyZWF0ZWQuXHJcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxTRFAgPSBjb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coJ0xvY2FsIFNEUCcsIGxvY2FsU0RQKTtcclxuICAgICAgICAgICAgICAgIGFuc3dlclNkcCA9IGxvY2FsU0RQOyAgIC8vdGVzdCBjb2RlXHJcbiAgICAgICAgICAgICAgICAvLyBteSBzZHAgc2VuZCB0byBzZXJ2ZXIuXHJcbiAgICAgICAgICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZCA6IFwiYW5zd2VyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgc2RwOiBsb2NhbFNEUFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcEVycm9yID0gRVJST1JTW1BMQVlFUl9XRUJSVENfU0VUX0xPQ0FMX0RFU0NfRVJST1JdO1xyXG4gICAgICAgICAgICAgICAgdGVtcEVycm9yLmVycm9yID0gZXJyb3I7XHJcbiAgICAgICAgICAgICAgICBjbG9zZVBlZXIodGVtcEVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIldlYlJUQ0xvYWRlciB1cmwgOiBcIiArIHVybCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB3cyA9IG5ldyBXZWJTb2NrZXQodXJsKTtcclxuICAgICAgICAgICAgICAgIHdzLm9ub3BlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe2NvbW1hbmQgOiBcInJlcXVlc3Rfb2ZmZXJcIn0pKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB3cy5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBpZihtZXNzYWdlLmVycm9yKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBFcnJvciA9IEVSUk9SU1tQTEFZRVJfV0VCUlRDX1dTX0VSUk9SXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcEVycm9yLmVycm9yID0gbWVzc2FnZS5lcnJvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQZWVyKHRlbXBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobWVzc2FnZS5saXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZygnTGlzdCByZWNlaXZlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZighbWVzc2FnZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coJ0lEIG11c3QgYmUgbm90IG51bGwnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIXBlZXJDb25uZWN0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVlckNvbm5lY3Rpb24gPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oY29uZmlnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZS5jYW5kaWRhdGUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIldlYlJUQ0xvYWRlciBzZW5kIGNhbmRpZGF0ZSB0byBzZXJ2ZXIgOiBcIiArIGUuY2FuZGlkYXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG1lc3NhZ2UuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQgOiBcImNhbmRpZGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5kaWRhdGVzOiBbZS5jYW5kaWRhdGVdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVlckNvbm5lY3Rpb24ub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocGVlckNvbm5lY3Rpb24uaWNlQ29ubmVjdGlvblN0YXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoXCJvbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZVwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgOiBwZWVyQ29ubmVjdGlvbi5pY2VDb25uZWN0aW9uU3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyU2RwIDogYW5zd2VyU2RwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyU2RwIDogb2ZmZXJTZHBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uLm9ubmVnb3RpYXRpb25uZWVkZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uLmNyZWF0ZU9mZmVyKCkudGhlbihmdW5jdGlvbihkZXNjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiY3JlYXRlT2ZmZXIgOiBzdWNjZXNzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2NhbERlc2NyaXB0aW9uKG1lc3NhZ2UuaWQsIHBlZXJDb25uZWN0aW9uLCBkZXNjKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcEVycm9yID0gRVJST1JTW1BMQVlFUl9XRUJSVENfQ1JFQVRFX0FOU1dFUl9FUlJPUl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcEVycm9yLmVycm9yID0gZXJyb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQZWVyKHRlbXBFcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uLm9uYWRkc3RyZWFtID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwic3RyZWFtIHJlY2VpdmVkLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmVhbSByZWNlaXZlZC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb3N0UGFja2V0c0FyciA9IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsb3RMZW5ndGggPSA4LCAvLzggc3RhdGlzdGljcy4gZXZlcnkgMiBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldlBhY2tldHNMb3N0ID0gMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmc4TG9zc2VzID0gMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmdNb3JlVGhhblRocmVzaG9sZENvdW50ID0gMCwgIC8vSWYgYXZnOExvc3MgbW9yZSB0aGFuIHRocmVzaG9sZC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJlc2hvbGQgPSAyMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhY3RMb3NzUGFja2V0c09uTmV0d29ya1N0YXR1cyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGlzdGljc1RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZighcGVlckNvbm5lY3Rpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uLmdldFN0YXRzKCkudGhlbihmdW5jdGlvbihzdGF0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHMuZm9yRWFjaChmdW5jdGlvbihzdGF0ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoc3RhdGUudHlwZSA9PT0gXCJpbmJvdW5kLXJ0cFwiICYmICFzdGF0ZS5pc1JlbW90ZSApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coc3RhdGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8oc3RhdGUucGFja2V0c0xvc3QgLSBwcmV2UGFja2V0c0xvc3QpIGlzIHJlYWwgY3VycmVudCBsb3N0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb3N0UGFja2V0c0Fyci5wdXNoKHBhcnNlSW50KHN0YXRlLnBhY2tldHNMb3N0KS1wYXJzZUludChwcmV2UGFja2V0c0xvc3QpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGxvc3RQYWNrZXRzQXJyLmxlbmd0aCA+IHNsb3RMZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9zdFBhY2tldHNBcnIgPSBsb3N0UGFja2V0c0Fyci5zbGljZShsb3N0UGFja2V0c0Fyci5sZW5ndGggLSBzbG90TGVuZ3RoLCBsb3N0UGFja2V0c0Fyci5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZnOExvc3NlcyA9IF8ucmVkdWNlKGxvc3RQYWNrZXRzQXJyLCBmdW5jdGlvbihtZW1vLCBudW0peyByZXR1cm4gbWVtbyArIG51bTsgfSwgMCkgLyBzbG90TGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiTGFzdDggTE9TVCBQQUNLRVQgQVZHICA6IFwiKyAoYXZnOExvc3NlcyksIHN0YXRlLnBhY2tldHNMb3N0ICwgbG9zdFBhY2tldHNBcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXZnOExvc3NlcyA+IHRocmVzaG9sZCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZnTW9yZVRoYW5UaHJlc2hvbGRDb3VudCArKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhdmdNb3JlVGhhblRocmVzaG9sZENvdW50ID09PSAzKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiTkVUV09SSyBVTlNUQUJMRUQhISEgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc3RhdGlzdGljc1RpbWVyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIudHJpZ2dlcihORVRXT1JLX1VOU1RBQkxFRCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZnTW9yZVRoYW5UaHJlc2hvbGRDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2UGFja2V0c0xvc3QgPSBzdGF0ZS5wYWNrZXRzTG9zdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RMb3NzUGFja2V0c09uTmV0d29ya1N0YXR1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFjdExvc3NQYWNrZXRzT25OZXR3b3JrU3RhdHVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGUuc3RyZWFtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKG1lc3NhZ2Uuc2RwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vU2V0IHJlbW90ZSBkZXNjcmlwdGlvbiB3aGVuIEkgcmVjZWl2ZWQgc2RwIGZyb20gc2VydmVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZWVyQ29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKG1lc3NhZ2Uuc2RwKSkudGhlbihmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocGVlckNvbm5lY3Rpb24ucmVtb3RlRGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY3JlYXRlcyBhbnN3ZXIgd2hlbiBJIHJlY2VpdmVkIG9mZmVyIGZyb20gcHVibGlzaGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZmVyU2RwID0gcGVlckNvbm5lY3Rpb24ucmVtb3RlRGVzY3JpcHRpb24uc2RwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uLmNyZWF0ZUFuc3dlcigpLnRoZW4oZnVuY3Rpb24oZGVzYyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcImNyZWF0ZUFuc3dlciA6IHN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9jYWxEZXNjcmlwdGlvbihtZXNzYWdlLmlkLCBwZWVyQ29ubmVjdGlvbiwgZGVzYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcEVycm9yID0gRVJST1JTW1BMQVlFUl9XRUJSVENfQ1JFQVRFX0FOU1dFUl9FUlJPUl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBFcnJvci5lcnJvciA9IGVycm9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBlZXIodGVtcEVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBFcnJvciA9IEVSUk9SU1tQTEFZRVJfV0VCUlRDX1NFVF9SRU1PVEVfREVTQ19FUlJPUl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wRXJyb3IuZXJyb3IgPSBlcnJvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlUGVlcih0ZW1wRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKG1lc3NhZ2UuY2FuZGlkYXRlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHJlY2VpdmVzIElDRSBDYW5kaWRhdGUgZnJvbSBzZXJ2ZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBtZXNzYWdlLmNhbmRpZGF0ZXMubGVuZ3RoOyBpICsrICl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihtZXNzYWdlLmNhbmRpZGF0ZXNbaV0gJiYgbWVzc2FnZS5jYW5kaWRhdGVzW2ldLmNhbmRpZGF0ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZWVyQ29ubmVjdGlvbi5hZGRJY2VDYW5kaWRhdGUobmV3IFJUQ0ljZUNhbmRpZGF0ZShtZXNzYWdlLmNhbmRpZGF0ZXNbaV0pKS50aGVuKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcImFkZEljZUNhbmRpZGF0ZSA6IHN1Y2Nlc3NcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcEVycm9yID0gRVJST1JTW1BMQVlFUl9XRUJSVENfQUREX0lDRUNBTkRJREFURV9FUlJPUl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBFcnJvci5lcnJvciA9IGVycm9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBlZXIodGVtcEVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgd3Mub25lcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBFcnJvciA9IEVSUk9SU1tQTEFZRVJfV0VCUlRDX1dTX0VSUk9SXTtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wRXJyb3IuZXJyb3IgPSBlcnJvcjtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZVBlZXIodGVtcEVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfWNhdGNoKGVycm9yKXtcclxuICAgICAgICAgICAgICAgIGNsb3NlUGVlcihlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbG9zZVBlZXIoZXJyb3IpIHtcclxuICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coJ1dlYlJUQyBMb2FkZXIgY2xvc2VQZWVhcigpJyk7XHJcbiAgICAgICAgaWYod3MpIHtcclxuICAgICAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKCdDbG9zaW5nIHdlYnNvY2tldCBjb25uZWN0aW9uLi4uJyk7XHJcbiAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcIlNlbmQgU2lnbmFsaW5nIDogU3RvcC5cIik7XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIDAgKENPTk5FQ1RJTkcpXHJcbiAgICAgICAgICAgIDEgKE9QRU4pXHJcbiAgICAgICAgICAgIDIgKENMT1NJTkcpXHJcbiAgICAgICAgICAgIDMgKENMT1NFRClcclxuICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaWYod3MucmVhZHlTdGF0ZSA9PSAxKXtcclxuICAgICAgICAgICAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe2NvbW1hbmQgOiBcInN0b3BcIn0pKTtcclxuICAgICAgICAgICAgICAgIHdzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd3MgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihwZWVyQ29ubmVjdGlvbikge1xyXG4gICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coJ0Nsb3NpbmcgcGVlciBjb25uZWN0aW9uLi4uJyk7XHJcbiAgICAgICAgICAgIGlmKHN0YXRpc3RpY3NUaW1lcil7Y2xlYXJUaW1lb3V0KHN0YXRpc3RpY3NUaW1lcik7fVxyXG4gICAgICAgICAgICBwZWVyQ29ubmVjdGlvbi5jbG9zZSgpO1xyXG4gICAgICAgICAgICBwZWVyQ29ubmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGVycm9yKXtcclxuICAgICAgICAgICAgZXJyb3JUcmlnZ2VyKGVycm9yLCBwcm92aWRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICB0aGF0LmNvbm5lY3QgPSAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGluaXRpYWxpemUoKTtcclxuICAgIH07XHJcbiAgICB0aGF0LmRlc3Ryb3kgPSAoKSA9PiB7XHJcbiAgICAgICAgcGVlckNvbm5lY3Rpb24ubG9nKFwiV0VCUlRDIExPQURFUiBkZXN0cm95XCIpO1xyXG4gICAgICAgIGNsb3NlUGVlcigpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB0aGF0O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2ViUlRDTG9hZGVyO1xyXG4iLCIoZnVuY3Rpb24oZil7aWYodHlwZW9mIGV4cG9ydHM9PT1cIm9iamVjdFwiJiZ0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIil7bW9kdWxlLmV4cG9ydHM9ZigpfWVsc2UgaWYodHlwZW9mIGRlZmluZT09PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGYpfWVsc2V7dmFyIGc7aWYodHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCIpe2c9d2luZG93fWVsc2UgaWYodHlwZW9mIGdsb2JhbCE9PVwidW5kZWZpbmVkXCIpe2c9Z2xvYmFsfWVsc2UgaWYodHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiKXtnPXNlbGZ9ZWxzZXtnPXRoaXN9Zy5hZGFwdGVyID0gZigpfX0pKGZ1bmN0aW9uKCl7dmFyIGRlZmluZSxtb2R1bGUsZXhwb3J0cztyZXR1cm4gKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4vKlxyXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE3IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxyXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXHJcbiAqICB0cmVlLlxyXG4gKi9cclxuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgU0RQVXRpbHMgPSByZXF1aXJlKCdzZHAnKTtcclxuXHJcbmZ1bmN0aW9uIHdyaXRlTWVkaWFTZWN0aW9uKHRyYW5zY2VpdmVyLCBjYXBzLCB0eXBlLCBzdHJlYW0sIGR0bHNSb2xlKSB7XHJcbiAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24odHJhbnNjZWl2ZXIua2luZCwgY2Fwcyk7XHJcblxyXG4gIC8vIE1hcCBJQ0UgcGFyYW1ldGVycyAodWZyYWcsIHB3ZCkgdG8gU0RQLlxyXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMoXHJcbiAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmdldExvY2FsUGFyYW1ldGVycygpKTtcclxuXHJcbiAgLy8gTWFwIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXHJcbiAgc2RwICs9IFNEUFV0aWxzLndyaXRlRHRsc1BhcmFtZXRlcnMoXHJcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuZ2V0TG9jYWxQYXJhbWV0ZXJzKCksXHJcbiAgICAgIHR5cGUgPT09ICdvZmZlcicgPyAnYWN0cGFzcycgOiBkdGxzUm9sZSB8fCAnYWN0aXZlJyk7XHJcblxyXG4gIHNkcCArPSAnYT1taWQ6JyArIHRyYW5zY2VpdmVyLm1pZCArICdcXHJcXG4nO1xyXG5cclxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XHJcbiAgICBzZHAgKz0gJ2E9c2VuZHJlY3ZcXHJcXG4nO1xyXG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XHJcbiAgICBzZHAgKz0gJ2E9c2VuZG9ubHlcXHJcXG4nO1xyXG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcclxuICAgIHNkcCArPSAnYT1yZWN2b25seVxcclxcbic7XHJcbiAgfSBlbHNlIHtcclxuICAgIHNkcCArPSAnYT1pbmFjdGl2ZVxcclxcbic7XHJcbiAgfVxyXG5cclxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XHJcbiAgICB2YXIgdHJhY2tJZCA9IHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5faW5pdGlhbFRyYWNrSWQgfHxcclxuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIudHJhY2suaWQ7XHJcbiAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuX2luaXRpYWxUcmFja0lkID0gdHJhY2tJZDtcclxuICAgIC8vIHNwZWMuXHJcbiAgICB2YXIgbXNpZCA9ICdtc2lkOicgKyAoc3RyZWFtID8gc3RyZWFtLmlkIDogJy0nKSArICcgJyArXHJcbiAgICAgICAgdHJhY2tJZCArICdcXHJcXG4nO1xyXG4gICAgc2RwICs9ICdhPScgKyBtc2lkO1xyXG4gICAgLy8gZm9yIENocm9tZS4gTGVnYWN5IHNob3VsZCBubyBsb25nZXIgYmUgcmVxdWlyZWQuXHJcbiAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICtcclxuICAgICAgICAnICcgKyBtc2lkO1xyXG5cclxuICAgIC8vIFJUWFxyXG4gICAgaWYgKHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4KSB7XHJcbiAgICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcclxuICAgICAgICAgICcgJyArIG1zaWQ7XHJcbiAgICAgIHNkcCArPSAnYT1zc3JjLWdyb3VwOkZJRCAnICtcclxuICAgICAgICAgIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArICcgJyArXHJcbiAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcclxuICAgICAgICAgICdcXHJcXG4nO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyBGSVhNRTogdGhpcyBzaG91bGQgYmUgd3JpdHRlbiBieSB3cml0ZVJ0cERlc2NyaXB0aW9uLlxyXG4gIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xyXG4gICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XHJcbiAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlciAmJiB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eCkge1xyXG4gICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4LnNzcmMgK1xyXG4gICAgICAgICcgY25hbWU6JyArIFNEUFV0aWxzLmxvY2FsQ05hbWUgKyAnXFxyXFxuJztcclxuICB9XHJcbiAgcmV0dXJuIHNkcDtcclxufVxyXG5cclxuLy8gRWRnZSBkb2VzIG5vdCBsaWtlXHJcbi8vIDEpIHN0dW46IGZpbHRlcmVkIGFmdGVyIDE0MzkzIHVubGVzcyA/dHJhbnNwb3J0PXVkcCBpcyBwcmVzZW50XHJcbi8vIDIpIHR1cm46IHRoYXQgZG9lcyBub3QgaGF2ZSBhbGwgb2YgdHVybjpob3N0OnBvcnQ/dHJhbnNwb3J0PXVkcFxyXG4vLyAzKSB0dXJuOiB3aXRoIGlwdjYgYWRkcmVzc2VzXHJcbi8vIDQpIHR1cm46IG9jY3VycmluZyBtdWxpcGxlIHRpbWVzXHJcbmZ1bmN0aW9uIGZpbHRlckljZVNlcnZlcnMoaWNlU2VydmVycywgZWRnZVZlcnNpb24pIHtcclxuICB2YXIgaGFzVHVybiA9IGZhbHNlO1xyXG4gIGljZVNlcnZlcnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGljZVNlcnZlcnMpKTtcclxuICByZXR1cm4gaWNlU2VydmVycy5maWx0ZXIoZnVuY3Rpb24oc2VydmVyKSB7XHJcbiAgICBpZiAoc2VydmVyICYmIChzZXJ2ZXIudXJscyB8fCBzZXJ2ZXIudXJsKSkge1xyXG4gICAgICB2YXIgdXJscyA9IHNlcnZlci51cmxzIHx8IHNlcnZlci51cmw7XHJcbiAgICAgIGlmIChzZXJ2ZXIudXJsICYmICFzZXJ2ZXIudXJscykge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignUlRDSWNlU2VydmVyLnVybCBpcyBkZXByZWNhdGVkISBVc2UgdXJscyBpbnN0ZWFkLicpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBpc1N0cmluZyA9IHR5cGVvZiB1cmxzID09PSAnc3RyaW5nJztcclxuICAgICAgaWYgKGlzU3RyaW5nKSB7XHJcbiAgICAgICAgdXJscyA9IFt1cmxzXTtcclxuICAgICAgfVxyXG4gICAgICB1cmxzID0gdXJscy5maWx0ZXIoZnVuY3Rpb24odXJsKSB7XHJcbiAgICAgICAgdmFyIHZhbGlkVHVybiA9IHVybC5pbmRleE9mKCd0dXJuOicpID09PSAwICYmXHJcbiAgICAgICAgICAgIHVybC5pbmRleE9mKCd0cmFuc3BvcnQ9dWRwJykgIT09IC0xICYmXHJcbiAgICAgICAgICAgIHVybC5pbmRleE9mKCd0dXJuOlsnKSA9PT0gLTEgJiZcclxuICAgICAgICAgICAgIWhhc1R1cm47XHJcblxyXG4gICAgICAgIGlmICh2YWxpZFR1cm4pIHtcclxuICAgICAgICAgIGhhc1R1cm4gPSB0cnVlO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1cmwuaW5kZXhPZignc3R1bjonKSA9PT0gMCAmJiBlZGdlVmVyc2lvbiA+PSAxNDM5MyAmJlxyXG4gICAgICAgICAgICB1cmwuaW5kZXhPZignP3RyYW5zcG9ydD11ZHAnKSA9PT0gLTE7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZGVsZXRlIHNlcnZlci51cmw7XHJcbiAgICAgIHNlcnZlci51cmxzID0gaXNTdHJpbmcgPyB1cmxzWzBdIDogdXJscztcclxuICAgICAgcmV0dXJuICEhdXJscy5sZW5ndGg7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIERldGVybWluZXMgdGhlIGludGVyc2VjdGlvbiBvZiBsb2NhbCBhbmQgcmVtb3RlIGNhcGFiaWxpdGllcy5cclxuZnVuY3Rpb24gZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKGxvY2FsQ2FwYWJpbGl0aWVzLCByZW1vdGVDYXBhYmlsaXRpZXMpIHtcclxuICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0ge1xyXG4gICAgY29kZWNzOiBbXSxcclxuICAgIGhlYWRlckV4dGVuc2lvbnM6IFtdLFxyXG4gICAgZmVjTWVjaGFuaXNtczogW11cclxuICB9O1xyXG5cclxuICB2YXIgZmluZENvZGVjQnlQYXlsb2FkVHlwZSA9IGZ1bmN0aW9uKHB0LCBjb2RlY3MpIHtcclxuICAgIHB0ID0gcGFyc2VJbnQocHQsIDEwKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29kZWNzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChjb2RlY3NbaV0ucGF5bG9hZFR5cGUgPT09IHB0IHx8XHJcbiAgICAgICAgICBjb2RlY3NbaV0ucHJlZmVycmVkUGF5bG9hZFR5cGUgPT09IHB0KSB7XHJcbiAgICAgICAgcmV0dXJuIGNvZGVjc1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBydHhDYXBhYmlsaXR5TWF0Y2hlcyA9IGZ1bmN0aW9uKGxSdHgsIHJSdHgsIGxDb2RlY3MsIHJDb2RlY3MpIHtcclxuICAgIHZhciBsQ29kZWMgPSBmaW5kQ29kZWNCeVBheWxvYWRUeXBlKGxSdHgucGFyYW1ldGVycy5hcHQsIGxDb2RlY3MpO1xyXG4gICAgdmFyIHJDb2RlYyA9IGZpbmRDb2RlY0J5UGF5bG9hZFR5cGUoclJ0eC5wYXJhbWV0ZXJzLmFwdCwgckNvZGVjcyk7XHJcbiAgICByZXR1cm4gbENvZGVjICYmIHJDb2RlYyAmJlxyXG4gICAgICAgIGxDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IHJDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgfTtcclxuXHJcbiAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24obENvZGVjKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHJDb2RlYyA9IHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3NbaV07XHJcbiAgICAgIGlmIChsQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpID09PSByQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpICYmXHJcbiAgICAgICAgICBsQ29kZWMuY2xvY2tSYXRlID09PSByQ29kZWMuY2xvY2tSYXRlKSB7XHJcbiAgICAgICAgaWYgKGxDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdydHgnICYmXHJcbiAgICAgICAgICAgIGxDb2RlYy5wYXJhbWV0ZXJzICYmIHJDb2RlYy5wYXJhbWV0ZXJzLmFwdCkge1xyXG4gICAgICAgICAgLy8gZm9yIFJUWCB3ZSBuZWVkIHRvIGZpbmQgdGhlIGxvY2FsIHJ0eCB0aGF0IGhhcyBhIGFwdFxyXG4gICAgICAgICAgLy8gd2hpY2ggcG9pbnRzIHRvIHRoZSBzYW1lIGxvY2FsIGNvZGVjIGFzIHRoZSByZW1vdGUgb25lLlxyXG4gICAgICAgICAgaWYgKCFydHhDYXBhYmlsaXR5TWF0Y2hlcyhsQ29kZWMsIHJDb2RlYyxcclxuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MsIHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3MpKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByQ29kZWMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJDb2RlYykpOyAvLyBkZWVwY29weVxyXG4gICAgICAgIC8vIG51bWJlciBvZiBjaGFubmVscyBpcyB0aGUgaGlnaGVzdCBjb21tb24gbnVtYmVyIG9mIGNoYW5uZWxzXHJcbiAgICAgICAgckNvZGVjLm51bUNoYW5uZWxzID0gTWF0aC5taW4obENvZGVjLm51bUNoYW5uZWxzLFxyXG4gICAgICAgICAgICByQ29kZWMubnVtQ2hhbm5lbHMpO1xyXG4gICAgICAgIC8vIHB1c2ggckNvZGVjIHNvIHdlIHJlcGx5IHdpdGggb2ZmZXJlciBwYXlsb2FkIHR5cGVcclxuICAgICAgICBjb21tb25DYXBhYmlsaXRpZXMuY29kZWNzLnB1c2gockNvZGVjKTtcclxuXHJcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGNvbW1vbiBmZWVkYmFjayBtZWNoYW5pc21zXHJcbiAgICAgICAgckNvZGVjLnJ0Y3BGZWVkYmFjayA9IHJDb2RlYy5ydGNwRmVlZGJhY2suZmlsdGVyKGZ1bmN0aW9uKGZiKSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxDb2RlYy5ydGNwRmVlZGJhY2subGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKGxDb2RlYy5ydGNwRmVlZGJhY2tbal0udHlwZSA9PT0gZmIudHlwZSAmJlxyXG4gICAgICAgICAgICAgICAgbENvZGVjLnJ0Y3BGZWVkYmFja1tqXS5wYXJhbWV0ZXIgPT09IGZiLnBhcmFtZXRlcikge1xyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gRklYTUU6IGFsc28gbmVlZCB0byBkZXRlcm1pbmUgLnBhcmFtZXRlcnNcclxuICAgICAgICAvLyAgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVucGVlci9vcnRjL2lzc3Vlcy81NjlcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBsb2NhbENhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zLmZvckVhY2goZnVuY3Rpb24obEhlYWRlckV4dGVuc2lvbikge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5sZW5ndGg7XHJcbiAgICAgICAgIGkrKykge1xyXG4gICAgICB2YXIgckhlYWRlckV4dGVuc2lvbiA9IHJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zW2ldO1xyXG4gICAgICBpZiAobEhlYWRlckV4dGVuc2lvbi51cmkgPT09IHJIZWFkZXJFeHRlbnNpb24udXJpKSB7XHJcbiAgICAgICAgY29tbW9uQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMucHVzaChySGVhZGVyRXh0ZW5zaW9uKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBGSVhNRTogZmVjTWVjaGFuaXNtc1xyXG4gIHJldHVybiBjb21tb25DYXBhYmlsaXRpZXM7XHJcbn1cclxuXHJcbi8vIGlzIGFjdGlvbj1zZXRMb2NhbERlc2NyaXB0aW9uIHdpdGggdHlwZSBhbGxvd2VkIGluIHNpZ25hbGluZ1N0YXRlXHJcbmZ1bmN0aW9uIGlzQWN0aW9uQWxsb3dlZEluU2lnbmFsaW5nU3RhdGUoYWN0aW9uLCB0eXBlLCBzaWduYWxpbmdTdGF0ZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICBvZmZlcjoge1xyXG4gICAgICBzZXRMb2NhbERlc2NyaXB0aW9uOiBbJ3N0YWJsZScsICdoYXZlLWxvY2FsLW9mZmVyJ10sXHJcbiAgICAgIHNldFJlbW90ZURlc2NyaXB0aW9uOiBbJ3N0YWJsZScsICdoYXZlLXJlbW90ZS1vZmZlciddXHJcbiAgICB9LFxyXG4gICAgYW5zd2VyOiB7XHJcbiAgICAgIHNldExvY2FsRGVzY3JpcHRpb246IFsnaGF2ZS1yZW1vdGUtb2ZmZXInLCAnaGF2ZS1sb2NhbC1wcmFuc3dlciddLFxyXG4gICAgICBzZXRSZW1vdGVEZXNjcmlwdGlvbjogWydoYXZlLWxvY2FsLW9mZmVyJywgJ2hhdmUtcmVtb3RlLXByYW5zd2VyJ11cclxuICAgIH1cclxuICB9W3R5cGVdW2FjdGlvbl0uaW5kZXhPZihzaWduYWxpbmdTdGF0ZSkgIT09IC0xO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXliZUFkZENhbmRpZGF0ZShpY2VUcmFuc3BvcnQsIGNhbmRpZGF0ZSkge1xyXG4gIC8vIEVkZ2UncyBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBhZGRzIHNvbWUgZmllbGRzIHRoZXJlZm9yZVxyXG4gIC8vIG5vdCBhbGwgZmllbGTRlSBhcmUgdGFrZW4gaW50byBhY2NvdW50LlxyXG4gIHZhciBhbHJlYWR5QWRkZWQgPSBpY2VUcmFuc3BvcnQuZ2V0UmVtb3RlQ2FuZGlkYXRlcygpXHJcbiAgICAgIC5maW5kKGZ1bmN0aW9uKHJlbW90ZUNhbmRpZGF0ZSkge1xyXG4gICAgICAgIHJldHVybiBjYW5kaWRhdGUuZm91bmRhdGlvbiA9PT0gcmVtb3RlQ2FuZGlkYXRlLmZvdW5kYXRpb24gJiZcclxuICAgICAgICAgICAgY2FuZGlkYXRlLmlwID09PSByZW1vdGVDYW5kaWRhdGUuaXAgJiZcclxuICAgICAgICAgICAgY2FuZGlkYXRlLnBvcnQgPT09IHJlbW90ZUNhbmRpZGF0ZS5wb3J0ICYmXHJcbiAgICAgICAgICAgIGNhbmRpZGF0ZS5wcmlvcml0eSA9PT0gcmVtb3RlQ2FuZGlkYXRlLnByaW9yaXR5ICYmXHJcbiAgICAgICAgICAgIGNhbmRpZGF0ZS5wcm90b2NvbCA9PT0gcmVtb3RlQ2FuZGlkYXRlLnByb3RvY29sICYmXHJcbiAgICAgICAgICAgIGNhbmRpZGF0ZS50eXBlID09PSByZW1vdGVDYW5kaWRhdGUudHlwZTtcclxuICAgICAgfSk7XHJcbiAgaWYgKCFhbHJlYWR5QWRkZWQpIHtcclxuICAgIGljZVRyYW5zcG9ydC5hZGRSZW1vdGVDYW5kaWRhdGUoY2FuZGlkYXRlKTtcclxuICB9XHJcbiAgcmV0dXJuICFhbHJlYWR5QWRkZWQ7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBtYWtlRXJyb3IobmFtZSwgZGVzY3JpcHRpb24pIHtcclxuICB2YXIgZSA9IG5ldyBFcnJvcihkZXNjcmlwdGlvbik7XHJcbiAgZS5uYW1lID0gbmFtZTtcclxuICAvLyBsZWdhY3kgZXJyb3IgY29kZXMgZnJvbSBodHRwczovL2hleWNhbS5naXRodWIuaW8vd2ViaWRsLyNpZGwtRE9NRXhjZXB0aW9uLWVycm9yLW5hbWVzXHJcbiAgZS5jb2RlID0ge1xyXG4gICAgTm90U3VwcG9ydGVkRXJyb3I6IDksXHJcbiAgICBJbnZhbGlkU3RhdGVFcnJvcjogMTEsXHJcbiAgICBJbnZhbGlkQWNjZXNzRXJyb3I6IDE1LFxyXG4gICAgVHlwZUVycm9yOiB1bmRlZmluZWQsXHJcbiAgICBPcGVyYXRpb25FcnJvcjogdW5kZWZpbmVkXHJcbiAgfVtuYW1lXTtcclxuICByZXR1cm4gZTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih3aW5kb3csIGVkZ2VWZXJzaW9uKSB7XHJcbiAgLy8gaHR0cHM6Ly93M2MuZ2l0aHViLmlvL21lZGlhY2FwdHVyZS1tYWluLyNtZWRpYXN0cmVhbVxyXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBhZGQgdGhlIHRyYWNrIHRvIHRoZSBzdHJlYW0gYW5kXHJcbiAgLy8gZGlzcGF0Y2ggdGhlIGV2ZW50IG91cnNlbHZlcy5cclxuICBmdW5jdGlvbiBhZGRUcmFja1RvU3RyZWFtQW5kRmlyZUV2ZW50KHRyYWNrLCBzdHJlYW0pIHtcclxuICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XHJcbiAgICBzdHJlYW0uZGlzcGF0Y2hFdmVudChuZXcgd2luZG93Lk1lZGlhU3RyZWFtVHJhY2tFdmVudCgnYWRkdHJhY2snLFxyXG4gICAgICAgIHt0cmFjazogdHJhY2t9KSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW1vdmVUcmFja0Zyb21TdHJlYW1BbmRGaXJlRXZlbnQodHJhY2ssIHN0cmVhbSkge1xyXG4gICAgc3RyZWFtLnJlbW92ZVRyYWNrKHRyYWNrKTtcclxuICAgIHN0cmVhbS5kaXNwYXRjaEV2ZW50KG5ldyB3aW5kb3cuTWVkaWFTdHJlYW1UcmFja0V2ZW50KCdyZW1vdmV0cmFjaycsXHJcbiAgICAgICAge3RyYWNrOiB0cmFja30pKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpcmVBZGRUcmFjayhwYywgdHJhY2ssIHJlY2VpdmVyLCBzdHJlYW1zKSB7XHJcbiAgICB2YXIgdHJhY2tFdmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcclxuICAgIHRyYWNrRXZlbnQudHJhY2sgPSB0cmFjaztcclxuICAgIHRyYWNrRXZlbnQucmVjZWl2ZXIgPSByZWNlaXZlcjtcclxuICAgIHRyYWNrRXZlbnQudHJhbnNjZWl2ZXIgPSB7cmVjZWl2ZXI6IHJlY2VpdmVyfTtcclxuICAgIHRyYWNrRXZlbnQuc3RyZWFtcyA9IHN0cmVhbXM7XHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgcGMuX2Rpc3BhdGNoRXZlbnQoJ3RyYWNrJywgdHJhY2tFdmVudCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHZhciBSVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gICAgdmFyIHBjID0gdGhpcztcclxuXHJcbiAgICB2YXIgX2V2ZW50VGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gICAgWydhZGRFdmVudExpc3RlbmVyJywgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLCAnZGlzcGF0Y2hFdmVudCddXHJcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XHJcbiAgICAgICAgICBwY1ttZXRob2RdID0gX2V2ZW50VGFyZ2V0W21ldGhvZF0uYmluZChfZXZlbnRUYXJnZXQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIHRoaXMuY2FuVHJpY2tsZUljZUNhbmRpZGF0ZXMgPSBudWxsO1xyXG5cclxuICAgIHRoaXMubmVlZE5lZ290aWF0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5sb2NhbFN0cmVhbXMgPSBbXTtcclxuICAgIHRoaXMucmVtb3RlU3RyZWFtcyA9IFtdO1xyXG5cclxuICAgIHRoaXMubG9jYWxEZXNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gJ3N0YWJsZSc7XHJcbiAgICB0aGlzLmljZUNvbm5lY3Rpb25TdGF0ZSA9ICduZXcnO1xyXG4gICAgdGhpcy5jb25uZWN0aW9uU3RhdGUgPSAnbmV3JztcclxuICAgIHRoaXMuaWNlR2F0aGVyaW5nU3RhdGUgPSAnbmV3JztcclxuXHJcbiAgICBjb25maWcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbmZpZyB8fCB7fSkpO1xyXG5cclxuICAgIHRoaXMudXNpbmdCdW5kbGUgPSBjb25maWcuYnVuZGxlUG9saWN5ID09PSAnbWF4LWJ1bmRsZSc7XHJcbiAgICBpZiAoY29uZmlnLnJ0Y3BNdXhQb2xpY3kgPT09ICduZWdvdGlhdGUnKSB7XHJcbiAgICAgIHRocm93KG1ha2VFcnJvcignTm90U3VwcG9ydGVkRXJyb3InLFxyXG4gICAgICAgICAgJ3J0Y3BNdXhQb2xpY3kgXFwnbmVnb3RpYXRlXFwnIGlzIG5vdCBzdXBwb3J0ZWQnKSk7XHJcbiAgICB9IGVsc2UgaWYgKCFjb25maWcucnRjcE11eFBvbGljeSkge1xyXG4gICAgICBjb25maWcucnRjcE11eFBvbGljeSA9ICdyZXF1aXJlJztcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2ggKGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcclxuICAgICAgY2FzZSAnYWxsJzpcclxuICAgICAgY2FzZSAncmVsYXknOlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kgPSAnYWxsJztcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2ggKGNvbmZpZy5idW5kbGVQb2xpY3kpIHtcclxuICAgICAgY2FzZSAnYmFsYW5jZWQnOlxyXG4gICAgICBjYXNlICdtYXgtY29tcGF0JzpcclxuICAgICAgY2FzZSAnbWF4LWJ1bmRsZSc6XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgY29uZmlnLmJ1bmRsZVBvbGljeSA9ICdiYWxhbmNlZCc7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlnLmljZVNlcnZlcnMgPSBmaWx0ZXJJY2VTZXJ2ZXJzKGNvbmZpZy5pY2VTZXJ2ZXJzIHx8IFtdLCBlZGdlVmVyc2lvbik7XHJcblxyXG4gICAgdGhpcy5faWNlR2F0aGVyZXJzID0gW107XHJcbiAgICBpZiAoY29uZmlnLmljZUNhbmRpZGF0ZVBvb2xTaXplKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSBjb25maWcuaWNlQ2FuZGlkYXRlUG9vbFNpemU7IGkgPiAwOyBpLS0pIHtcclxuICAgICAgICB0aGlzLl9pY2VHYXRoZXJlcnMucHVzaChuZXcgd2luZG93LlJUQ0ljZUdhdGhlcmVyKHtcclxuICAgICAgICAgIGljZVNlcnZlcnM6IGNvbmZpZy5pY2VTZXJ2ZXJzLFxyXG4gICAgICAgICAgZ2F0aGVyUG9saWN5OiBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25maWcuaWNlQ2FuZGlkYXRlUG9vbFNpemUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcclxuXHJcbiAgICAvLyBwZXItdHJhY2sgaWNlR2F0aGVycywgaWNlVHJhbnNwb3J0cywgZHRsc1RyYW5zcG9ydHMsIHJ0cFNlbmRlcnMsIC4uLlxyXG4gICAgLy8gZXZlcnl0aGluZyB0aGF0IGlzIG5lZWRlZCB0byBkZXNjcmliZSBhIFNEUCBtLWxpbmUuXHJcbiAgICB0aGlzLnRyYW5zY2VpdmVycyA9IFtdO1xyXG5cclxuICAgIHRoaXMuX3NkcFNlc3Npb25JZCA9IFNEUFV0aWxzLmdlbmVyYXRlU2Vzc2lvbklkKCk7XHJcbiAgICB0aGlzLl9zZHBTZXNzaW9uVmVyc2lvbiA9IDA7XHJcblxyXG4gICAgdGhpcy5fZHRsc1JvbGUgPSB1bmRlZmluZWQ7IC8vIHJvbGUgZm9yIGE9c2V0dXAgdG8gdXNlIGluIGFuc3dlcnMuXHJcblxyXG4gICAgdGhpcy5faXNDbG9zZWQgPSBmYWxzZTtcclxuICB9O1xyXG5cclxuICAvLyBzZXQgdXAgZXZlbnQgaGFuZGxlcnMgb24gcHJvdG90eXBlXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLm9uaWNlY2FuZGlkYXRlID0gbnVsbDtcclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUub25hZGRzdHJlYW0gPSBudWxsO1xyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5vbnRyYWNrID0gbnVsbDtcclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUub25yZW1vdmVzdHJlYW0gPSBudWxsO1xyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlID0gbnVsbDtcclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgPSBudWxsO1xyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5vbmNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IG51bGw7XHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLm9uaWNlZ2F0aGVyaW5nc3RhdGVjaGFuZ2UgPSBudWxsO1xyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5vbm5lZ290aWF0aW9ubmVlZGVkID0gbnVsbDtcclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUub25kYXRhY2hhbm5lbCA9IG51bGw7XHJcblxyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKG5hbWUsIGV2ZW50KSB7XHJcbiAgICBpZiAodGhpcy5faXNDbG9zZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgIGlmICh0eXBlb2YgdGhpc1snb24nICsgbmFtZV0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpc1snb24nICsgbmFtZV0oZXZlbnQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZW1pdEdhdGhlcmluZ1N0YXRlQ2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWdhdGhlcmluZ3N0YXRlY2hhbmdlJyk7XHJcbiAgICB0aGlzLl9kaXNwYXRjaEV2ZW50KCdpY2VnYXRoZXJpbmdzdGF0ZWNoYW5nZScsIGV2ZW50KTtcclxuICB9O1xyXG5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcclxuICB9O1xyXG5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0TG9jYWxTdHJlYW1zID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2NhbFN0cmVhbXM7XHJcbiAgfTtcclxuXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFJlbW90ZVN0cmVhbXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnJlbW90ZVN0cmVhbXM7XHJcbiAgfTtcclxuXHJcbiAgLy8gaW50ZXJuYWwgaGVscGVyIHRvIGNyZWF0ZSBhIHRyYW5zY2VpdmVyIG9iamVjdC5cclxuICAvLyAod2hpY2ggaXMgbm90IHlldCB0aGUgc2FtZSBhcyB0aGUgV2ViUlRDIDEuMCB0cmFuc2NlaXZlcilcclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2NyZWF0ZVRyYW5zY2VpdmVyID0gZnVuY3Rpb24oa2luZCwgZG9Ob3RBZGQpIHtcclxuICAgIHZhciBoYXNCdW5kbGVUcmFuc3BvcnQgPSB0aGlzLnRyYW5zY2VpdmVycy5sZW5ndGggPiAwO1xyXG4gICAgdmFyIHRyYW5zY2VpdmVyID0ge1xyXG4gICAgICB0cmFjazogbnVsbCxcclxuICAgICAgaWNlR2F0aGVyZXI6IG51bGwsXHJcbiAgICAgIGljZVRyYW5zcG9ydDogbnVsbCxcclxuICAgICAgZHRsc1RyYW5zcG9ydDogbnVsbCxcclxuICAgICAgbG9jYWxDYXBhYmlsaXRpZXM6IG51bGwsXHJcbiAgICAgIHJlbW90ZUNhcGFiaWxpdGllczogbnVsbCxcclxuICAgICAgcnRwU2VuZGVyOiBudWxsLFxyXG4gICAgICBydHBSZWNlaXZlcjogbnVsbCxcclxuICAgICAga2luZDoga2luZCxcclxuICAgICAgbWlkOiBudWxsLFxyXG4gICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzOiBudWxsLFxyXG4gICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzOiBudWxsLFxyXG4gICAgICBzdHJlYW06IG51bGwsXHJcbiAgICAgIGFzc29jaWF0ZWRSZW1vdGVNZWRpYVN0cmVhbXM6IFtdLFxyXG4gICAgICB3YW50UmVjZWl2ZTogdHJ1ZVxyXG4gICAgfTtcclxuICAgIGlmICh0aGlzLnVzaW5nQnVuZGxlICYmIGhhc0J1bmRsZVRyYW5zcG9ydCkge1xyXG4gICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQgPSB0aGlzLnRyYW5zY2VpdmVyc1swXS5pY2VUcmFuc3BvcnQ7XHJcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQgPSB0aGlzLnRyYW5zY2VpdmVyc1swXS5kdGxzVHJhbnNwb3J0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIHRyYW5zcG9ydHMgPSB0aGlzLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cygpO1xyXG4gICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQgPSB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydDtcclxuICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydCA9IHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydDtcclxuICAgIH1cclxuICAgIGlmICghZG9Ob3RBZGQpIHtcclxuICAgICAgdGhpcy50cmFuc2NlaXZlcnMucHVzaCh0cmFuc2NlaXZlcik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJhbnNjZWl2ZXI7XHJcbiAgfTtcclxuXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrID0gZnVuY3Rpb24odHJhY2ssIHN0cmVhbSkge1xyXG4gICAgaWYgKHRoaXMuX2lzQ2xvc2VkKSB7XHJcbiAgICAgIHRocm93IG1ha2VFcnJvcignSW52YWxpZFN0YXRlRXJyb3InLFxyXG4gICAgICAgICAgJ0F0dGVtcHRlZCB0byBjYWxsIGFkZFRyYWNrIG9uIGEgY2xvc2VkIHBlZXJjb25uZWN0aW9uLicpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhbHJlYWR5RXhpc3RzID0gdGhpcy50cmFuc2NlaXZlcnMuZmluZChmdW5jdGlvbihzKSB7XHJcbiAgICAgIHJldHVybiBzLnRyYWNrID09PSB0cmFjaztcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChhbHJlYWR5RXhpc3RzKSB7XHJcbiAgICAgIHRocm93IG1ha2VFcnJvcignSW52YWxpZEFjY2Vzc0Vycm9yJywgJ1RyYWNrIGFscmVhZHkgZXhpc3RzLicpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB0cmFuc2NlaXZlcjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50cmFuc2NlaXZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKCF0aGlzLnRyYW5zY2VpdmVyc1tpXS50cmFjayAmJlxyXG4gICAgICAgICAgdGhpcy50cmFuc2NlaXZlcnNbaV0ua2luZCA9PT0gdHJhY2sua2luZCkge1xyXG4gICAgICAgIHRyYW5zY2VpdmVyID0gdGhpcy50cmFuc2NlaXZlcnNbaV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghdHJhbnNjZWl2ZXIpIHtcclxuICAgICAgdHJhbnNjZWl2ZXIgPSB0aGlzLl9jcmVhdGVUcmFuc2NlaXZlcih0cmFjay5raW5kKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xyXG5cclxuICAgIGlmICh0aGlzLmxvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSkgPT09IC0xKSB7XHJcbiAgICAgIHRoaXMubG9jYWxTdHJlYW1zLnB1c2goc3RyZWFtKTtcclxuICAgIH1cclxuXHJcbiAgICB0cmFuc2NlaXZlci50cmFjayA9IHRyYWNrO1xyXG4gICAgdHJhbnNjZWl2ZXIuc3RyZWFtID0gc3RyZWFtO1xyXG4gICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyID0gbmV3IHdpbmRvdy5SVENSdHBTZW5kZXIodHJhY2ssXHJcbiAgICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydCk7XHJcbiAgICByZXR1cm4gdHJhbnNjZWl2ZXIucnRwU2VuZGVyO1xyXG4gIH07XHJcblxyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICBpZiAoZWRnZVZlcnNpb24gPj0gMTUwMjUpIHtcclxuICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICBwYy5hZGRUcmFjayh0cmFjaywgc3RyZWFtKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBDbG9uZSBpcyBuZWNlc3NhcnkgZm9yIGxvY2FsIGRlbW9zIG1vc3RseSwgYXR0YWNoaW5nIGRpcmVjdGx5XHJcbiAgICAgIC8vIHRvIHR3byBkaWZmZXJlbnQgc2VuZGVycyBkb2VzIG5vdCB3b3JrIChidWlsZCAxMDU0NykuXHJcbiAgICAgIC8vIEZpeGVkIGluIDE1MDI1IChvciBlYXJsaWVyKVxyXG4gICAgICB2YXIgY2xvbmVkU3RyZWFtID0gc3RyZWFtLmNsb25lKCk7XHJcbiAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrLCBpZHgpIHtcclxuICAgICAgICB2YXIgY2xvbmVkVHJhY2sgPSBjbG9uZWRTdHJlYW0uZ2V0VHJhY2tzKClbaWR4XTtcclxuICAgICAgICB0cmFjay5hZGRFdmVudExpc3RlbmVyKCdlbmFibGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgIGNsb25lZFRyYWNrLmVuYWJsZWQgPSBldmVudC5lbmFibGVkO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgY2xvbmVkU3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICBwYy5hZGRUcmFjayh0cmFjaywgY2xvbmVkU3RyZWFtKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVRyYWNrID0gZnVuY3Rpb24oc2VuZGVyKSB7XHJcbiAgICBpZiAodGhpcy5faXNDbG9zZWQpIHtcclxuICAgICAgdGhyb3cgbWFrZUVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcicsXHJcbiAgICAgICAgICAnQXR0ZW1wdGVkIHRvIGNhbGwgcmVtb3ZlVHJhY2sgb24gYSBjbG9zZWQgcGVlcmNvbm5lY3Rpb24uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEoc2VuZGVyIGluc3RhbmNlb2Ygd2luZG93LlJUQ1J0cFNlbmRlcikpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgMSBvZiBSVENQZWVyQ29ubmVjdGlvbi5yZW1vdmVUcmFjayAnICtcclxuICAgICAgICAgICdkb2VzIG5vdCBpbXBsZW1lbnQgaW50ZXJmYWNlIFJUQ1J0cFNlbmRlci4nKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdHJhbnNjZWl2ZXIgPSB0aGlzLnRyYW5zY2VpdmVycy5maW5kKGZ1bmN0aW9uKHQpIHtcclxuICAgICAgcmV0dXJuIHQucnRwU2VuZGVyID09PSBzZW5kZXI7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXRyYW5zY2VpdmVyKSB7XHJcbiAgICAgIHRocm93IG1ha2VFcnJvcignSW52YWxpZEFjY2Vzc0Vycm9yJyxcclxuICAgICAgICAgICdTZW5kZXIgd2FzIG5vdCBjcmVhdGVkIGJ5IHRoaXMgY29ubmVjdGlvbi4nKTtcclxuICAgIH1cclxuICAgIHZhciBzdHJlYW0gPSB0cmFuc2NlaXZlci5zdHJlYW07XHJcblxyXG4gICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnN0b3AoKTtcclxuICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlciA9IG51bGw7XHJcbiAgICB0cmFuc2NlaXZlci50cmFjayA9IG51bGw7XHJcbiAgICB0cmFuc2NlaXZlci5zdHJlYW0gPSBudWxsO1xyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgc3RyZWFtIGZyb20gdGhlIHNldCBvZiBsb2NhbCBzdHJlYW1zXHJcbiAgICB2YXIgbG9jYWxTdHJlYW1zID0gdGhpcy50cmFuc2NlaXZlcnMubWFwKGZ1bmN0aW9uKHQpIHtcclxuICAgICAgcmV0dXJuIHQuc3RyZWFtO1xyXG4gICAgfSk7XHJcbiAgICBpZiAobG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKSA9PT0gLTEgJiZcclxuICAgICAgICB0aGlzLmxvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSkgPiAtMSkge1xyXG4gICAgICB0aGlzLmxvY2FsU3RyZWFtcy5zcGxpY2UodGhpcy5sb2NhbFN0cmVhbXMuaW5kZXhPZihzdHJlYW0pLCAxKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xyXG4gIH07XHJcblxyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICB2YXIgc2VuZGVyID0gcGMuZ2V0U2VuZGVycygpLmZpbmQoZnVuY3Rpb24ocykge1xyXG4gICAgICAgIHJldHVybiBzLnRyYWNrID09PSB0cmFjaztcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChzZW5kZXIpIHtcclxuICAgICAgICBwYy5yZW1vdmVUcmFjayhzZW5kZXIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U2VuZGVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNjZWl2ZXJzLmZpbHRlcihmdW5jdGlvbih0cmFuc2NlaXZlcikge1xyXG4gICAgICByZXR1cm4gISF0cmFuc2NlaXZlci5ydHBTZW5kZXI7XHJcbiAgICB9KVxyXG4gICAgLm1hcChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xyXG4gICAgICByZXR1cm4gdHJhbnNjZWl2ZXIucnRwU2VuZGVyO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFJlY2VpdmVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNjZWl2ZXJzLmZpbHRlcihmdW5jdGlvbih0cmFuc2NlaXZlcikge1xyXG4gICAgICByZXR1cm4gISF0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcclxuICAgIH0pXHJcbiAgICAubWFwKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XHJcbiAgICAgIHJldHVybiB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2NyZWF0ZUljZUdhdGhlcmVyID0gZnVuY3Rpb24oc2RwTUxpbmVJbmRleCxcclxuICAgICAgdXNpbmdCdW5kbGUpIHtcclxuICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICBpZiAodXNpbmdCdW5kbGUgJiYgc2RwTUxpbmVJbmRleCA+IDApIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNjZWl2ZXJzWzBdLmljZUdhdGhlcmVyO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLl9pY2VHYXRoZXJlcnMubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9pY2VHYXRoZXJlcnMuc2hpZnQoKTtcclxuICAgIH1cclxuICAgIHZhciBpY2VHYXRoZXJlciA9IG5ldyB3aW5kb3cuUlRDSWNlR2F0aGVyZXIoe1xyXG4gICAgICBpY2VTZXJ2ZXJzOiB0aGlzLl9jb25maWcuaWNlU2VydmVycyxcclxuICAgICAgZ2F0aGVyUG9saWN5OiB0aGlzLl9jb25maWcuaWNlVHJhbnNwb3J0UG9saWN5XHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpY2VHYXRoZXJlciwgJ3N0YXRlJyxcclxuICAgICAgICB7dmFsdWU6ICduZXcnLCB3cml0YWJsZTogdHJ1ZX1cclxuICAgICk7XHJcblxyXG4gICAgdGhpcy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uYnVmZmVyZWRDYW5kaWRhdGVFdmVudHMgPSBbXTtcclxuICAgIHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmJ1ZmZlckNhbmRpZGF0ZXMgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICB2YXIgZW5kID0gIWV2ZW50LmNhbmRpZGF0ZSB8fCBPYmplY3Qua2V5cyhldmVudC5jYW5kaWRhdGUpLmxlbmd0aCA9PT0gMDtcclxuICAgICAgLy8gcG9seWZpbGwgc2luY2UgUlRDSWNlR2F0aGVyZXIuc3RhdGUgaXMgbm90IGltcGxlbWVudGVkIGluXHJcbiAgICAgIC8vIEVkZ2UgMTA1NDcgeWV0LlxyXG4gICAgICBpY2VHYXRoZXJlci5zdGF0ZSA9IGVuZCA/ICdjb21wbGV0ZWQnIDogJ2dhdGhlcmluZyc7XHJcbiAgICAgIGlmIChwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uYnVmZmVyZWRDYW5kaWRhdGVFdmVudHMgIT09IG51bGwpIHtcclxuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uYnVmZmVyZWRDYW5kaWRhdGVFdmVudHMucHVzaChldmVudCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBpY2VHYXRoZXJlci5hZGRFdmVudExpc3RlbmVyKCdsb2NhbGNhbmRpZGF0ZScsXHJcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmJ1ZmZlckNhbmRpZGF0ZXMpO1xyXG4gICAgcmV0dXJuIGljZUdhdGhlcmVyO1xyXG4gIH07XHJcblxyXG4gIC8vIHN0YXJ0IGdhdGhlcmluZyBmcm9tIGFuIFJUQ0ljZUdhdGhlcmVyLlxyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZ2F0aGVyID0gZnVuY3Rpb24obWlkLCBzZHBNTGluZUluZGV4KSB7XHJcbiAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgdmFyIGljZUdhdGhlcmVyID0gdGhpcy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uaWNlR2F0aGVyZXI7XHJcbiAgICBpZiAoaWNlR2F0aGVyZXIub25sb2NhbGNhbmRpZGF0ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgYnVmZmVyZWRDYW5kaWRhdGVFdmVudHMgPVxyXG4gICAgICB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5idWZmZXJlZENhbmRpZGF0ZUV2ZW50cztcclxuICAgIHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmJ1ZmZlcmVkQ2FuZGlkYXRlRXZlbnRzID0gbnVsbDtcclxuICAgIGljZUdhdGhlcmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvY2FsY2FuZGlkYXRlJyxcclxuICAgICAgdGhpcy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uYnVmZmVyQ2FuZGlkYXRlcyk7XHJcbiAgICBpY2VHYXRoZXJlci5vbmxvY2FsY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgIGlmIChwYy51c2luZ0J1bmRsZSAmJiBzZHBNTGluZUluZGV4ID4gMCkge1xyXG4gICAgICAgIC8vIGlmIHdlIGtub3cgdGhhdCB3ZSB1c2UgYnVuZGxlIHdlIGNhbiBkcm9wIGNhbmRpZGF0ZXMgd2l0aFxyXG4gICAgICAgIC8vINGVZHBNTGluZUluZGV4ID4gMC4gSWYgd2UgZG9uJ3QgZG8gdGhpcyB0aGVuIG91ciBzdGF0ZSBnZXRzXHJcbiAgICAgICAgLy8gY29uZnVzZWQgc2luY2Ugd2UgZGlzcG9zZSB0aGUgZXh0cmEgaWNlIGdhdGhlcmVyLlxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpO1xyXG4gICAgICBldmVudC5jYW5kaWRhdGUgPSB7c2RwTWlkOiBtaWQsIHNkcE1MaW5lSW5kZXg6IHNkcE1MaW5lSW5kZXh9O1xyXG5cclxuICAgICAgdmFyIGNhbmQgPSBldnQuY2FuZGlkYXRlO1xyXG4gICAgICAvLyBFZGdlIGVtaXRzIGFuIGVtcHR5IG9iamVjdCBmb3IgUlRDSWNlQ2FuZGlkYXRlQ29tcGxldGXigKVcclxuICAgICAgdmFyIGVuZCA9ICFjYW5kIHx8IE9iamVjdC5rZXlzKGNhbmQpLmxlbmd0aCA9PT0gMDtcclxuICAgICAgaWYgKGVuZCkge1xyXG4gICAgICAgIC8vIHBvbHlmaWxsIHNpbmNlIFJUQ0ljZUdhdGhlcmVyLnN0YXRlIGlzIG5vdCBpbXBsZW1lbnRlZCBpblxyXG4gICAgICAgIC8vIEVkZ2UgMTA1NDcgeWV0LlxyXG4gICAgICAgIGlmIChpY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ25ldycgfHwgaWNlR2F0aGVyZXIuc3RhdGUgPT09ICdnYXRoZXJpbmcnKSB7XHJcbiAgICAgICAgICBpY2VHYXRoZXJlci5zdGF0ZSA9ICdjb21wbGV0ZWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoaWNlR2F0aGVyZXIuc3RhdGUgPT09ICduZXcnKSB7XHJcbiAgICAgICAgICBpY2VHYXRoZXJlci5zdGF0ZSA9ICdnYXRoZXJpbmcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBSVENJY2VDYW5kaWRhdGUgZG9lc24ndCBoYXZlIGEgY29tcG9uZW50LCBuZWVkcyB0byBiZSBhZGRlZFxyXG4gICAgICAgIGNhbmQuY29tcG9uZW50ID0gMTtcclxuICAgICAgICAvLyBhbHNvIHRoZSB1c2VybmFtZUZyYWdtZW50LiBUT0RPOiB1cGRhdGUgU0RQIHRvIHRha2UgYm90aCB2YXJpYW50cy5cclxuICAgICAgICBjYW5kLnVmcmFnID0gaWNlR2F0aGVyZXIuZ2V0TG9jYWxQYXJhbWV0ZXJzKCkudXNlcm5hbWVGcmFnbWVudDtcclxuXHJcbiAgICAgICAgdmFyIHNlcmlhbGl6ZWRDYW5kaWRhdGUgPSBTRFBVdGlscy53cml0ZUNhbmRpZGF0ZShjYW5kKTtcclxuICAgICAgICBldmVudC5jYW5kaWRhdGUgPSBPYmplY3QuYXNzaWduKGV2ZW50LmNhbmRpZGF0ZSxcclxuICAgICAgICAgICAgU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUoc2VyaWFsaXplZENhbmRpZGF0ZSkpO1xyXG5cclxuICAgICAgICBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlID0gc2VyaWFsaXplZENhbmRpZGF0ZTtcclxuICAgICAgICBldmVudC5jYW5kaWRhdGUudG9KU09OID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjYW5kaWRhdGU6IGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUsXHJcbiAgICAgICAgICAgIHNkcE1pZDogZXZlbnQuY2FuZGlkYXRlLnNkcE1pZCxcclxuICAgICAgICAgICAgc2RwTUxpbmVJbmRleDogZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXgsXHJcbiAgICAgICAgICAgIHVzZXJuYW1lRnJhZ21lbnQ6IGV2ZW50LmNhbmRpZGF0ZS51c2VybmFtZUZyYWdtZW50XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBsb2NhbCBkZXNjcmlwdGlvbi5cclxuICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuZ2V0TWVkaWFTZWN0aW9ucyhwYy5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XHJcbiAgICAgIGlmICghZW5kKSB7XHJcbiAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXhdICs9XHJcbiAgICAgICAgICAgICdhPScgKyBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlICsgJ1xcclxcbic7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXhdICs9XHJcbiAgICAgICAgICAgICdhPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJztcclxuICAgICAgfVxyXG4gICAgICBwYy5sb2NhbERlc2NyaXB0aW9uLnNkcCA9XHJcbiAgICAgICAgICBTRFBVdGlscy5nZXREZXNjcmlwdGlvbihwYy5sb2NhbERlc2NyaXB0aW9uLnNkcCkgK1xyXG4gICAgICAgICAgc2VjdGlvbnMuam9pbignJyk7XHJcbiAgICAgIHZhciBjb21wbGV0ZSA9IHBjLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xyXG4gICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5pY2VHYXRoZXJlciAmJlxyXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCc7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHBjLmljZUdhdGhlcmluZ1N0YXRlICE9PSAnZ2F0aGVyaW5nJykge1xyXG4gICAgICAgIHBjLmljZUdhdGhlcmluZ1N0YXRlID0gJ2dhdGhlcmluZyc7XHJcbiAgICAgICAgcGMuX2VtaXRHYXRoZXJpbmdTdGF0ZUNoYW5nZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBFbWl0IGNhbmRpZGF0ZS4gQWxzbyBlbWl0IG51bGwgY2FuZGlkYXRlIHdoZW4gYWxsIGdhdGhlcmVycyBhcmVcclxuICAgICAgLy8gY29tcGxldGUuXHJcbiAgICAgIGlmICghZW5kKSB7XHJcbiAgICAgICAgcGMuX2Rpc3BhdGNoRXZlbnQoJ2ljZWNhbmRpZGF0ZScsIGV2ZW50KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29tcGxldGUpIHtcclxuICAgICAgICBwYy5fZGlzcGF0Y2hFdmVudCgnaWNlY2FuZGlkYXRlJywgbmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XHJcbiAgICAgICAgcGMuaWNlR2F0aGVyaW5nU3RhdGUgPSAnY29tcGxldGUnO1xyXG4gICAgICAgIHBjLl9lbWl0R2F0aGVyaW5nU3RhdGVDaGFuZ2UoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBlbWl0IGFscmVhZHkgZ2F0aGVyZWQgY2FuZGlkYXRlcy5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICBidWZmZXJlZENhbmRpZGF0ZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBpY2VHYXRoZXJlci5vbmxvY2FsY2FuZGlkYXRlKGUpO1xyXG4gICAgICB9KTtcclxuICAgIH0sIDApO1xyXG4gIH07XHJcblxyXG4gIC8vIENyZWF0ZSBJQ0UgdHJhbnNwb3J0IGFuZCBEVExTIHRyYW5zcG9ydC5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgdmFyIGljZVRyYW5zcG9ydCA9IG5ldyB3aW5kb3cuUlRDSWNlVHJhbnNwb3J0KG51bGwpO1xyXG4gICAgaWNlVHJhbnNwb3J0Lm9uaWNlc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgcGMuX3VwZGF0ZUljZUNvbm5lY3Rpb25TdGF0ZSgpO1xyXG4gICAgICBwYy5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gbmV3IHdpbmRvdy5SVENEdGxzVHJhbnNwb3J0KGljZVRyYW5zcG9ydCk7XHJcbiAgICBkdGxzVHJhbnNwb3J0Lm9uZHRsc3N0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHBjLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcclxuICAgIH07XHJcbiAgICBkdGxzVHJhbnNwb3J0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcclxuICAgICAgLy8gb25lcnJvciBkb2VzIG5vdCBzZXQgc3RhdGUgdG8gZmFpbGVkIGJ5IGl0c2VsZi5cclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGR0bHNUcmFuc3BvcnQsICdzdGF0ZScsXHJcbiAgICAgICAgICB7dmFsdWU6ICdmYWlsZWQnLCB3cml0YWJsZTogdHJ1ZX0pO1xyXG4gICAgICBwYy5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGljZVRyYW5zcG9ydDogaWNlVHJhbnNwb3J0LFxyXG4gICAgICBkdGxzVHJhbnNwb3J0OiBkdGxzVHJhbnNwb3J0XHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIC8vIERlc3Ryb3kgSUNFIGdhdGhlcmVyLCBJQ0UgdHJhbnNwb3J0IGFuZCBEVExTIHRyYW5zcG9ydC5cclxuICAvLyBXaXRob3V0IHRyaWdnZXJpbmcgdGhlIGNhbGxiYWNrcy5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2Rpc3Bvc2VJY2VBbmREdGxzVHJhbnNwb3J0cyA9IGZ1bmN0aW9uKFxyXG4gICAgICBzZHBNTGluZUluZGV4KSB7XHJcbiAgICB2YXIgaWNlR2F0aGVyZXIgPSB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5pY2VHYXRoZXJlcjtcclxuICAgIGlmIChpY2VHYXRoZXJlcikge1xyXG4gICAgICBkZWxldGUgaWNlR2F0aGVyZXIub25sb2NhbGNhbmRpZGF0ZTtcclxuICAgICAgZGVsZXRlIHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmljZUdhdGhlcmVyO1xyXG4gICAgfVxyXG4gICAgdmFyIGljZVRyYW5zcG9ydCA9IHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmljZVRyYW5zcG9ydDtcclxuICAgIGlmIChpY2VUcmFuc3BvcnQpIHtcclxuICAgICAgZGVsZXRlIGljZVRyYW5zcG9ydC5vbmljZXN0YXRlY2hhbmdlO1xyXG4gICAgICBkZWxldGUgdGhpcy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uaWNlVHJhbnNwb3J0O1xyXG4gICAgfVxyXG4gICAgdmFyIGR0bHNUcmFuc3BvcnQgPSB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5kdGxzVHJhbnNwb3J0O1xyXG4gICAgaWYgKGR0bHNUcmFuc3BvcnQpIHtcclxuICAgICAgZGVsZXRlIGR0bHNUcmFuc3BvcnQub25kdGxzc3RhdGVjaGFuZ2U7XHJcbiAgICAgIGRlbGV0ZSBkdGxzVHJhbnNwb3J0Lm9uZXJyb3I7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5kdGxzVHJhbnNwb3J0O1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIFN0YXJ0IHRoZSBSVFAgU2VuZGVyIGFuZCBSZWNlaXZlciBmb3IgYSB0cmFuc2NlaXZlci5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3RyYW5zY2VpdmUgPSBmdW5jdGlvbih0cmFuc2NlaXZlcixcclxuICAgICAgc2VuZCwgcmVjdikge1xyXG4gICAgdmFyIHBhcmFtcyA9IGdldENvbW1vbkNhcGFiaWxpdGllcyh0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyxcclxuICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xyXG4gICAgaWYgKHNlbmQgJiYgdHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XHJcbiAgICAgIHBhcmFtcy5lbmNvZGluZ3MgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xyXG4gICAgICBwYXJhbXMucnRjcCA9IHtcclxuICAgICAgICBjbmFtZTogU0RQVXRpbHMubG9jYWxDTmFtZSxcclxuICAgICAgICBjb21wb3VuZDogdHJhbnNjZWl2ZXIucnRjcFBhcmFtZXRlcnMuY29tcG91bmRcclxuICAgICAgfTtcclxuICAgICAgaWYgKHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcclxuICAgICAgfVxyXG4gICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuc2VuZChwYXJhbXMpO1xyXG4gICAgfVxyXG4gICAgaWYgKHJlY3YgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIgJiYgcGFyYW1zLmNvZGVjcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIC8vIHJlbW92ZSBSVFggZmllbGQgaW4gRWRnZSAxNDk0MlxyXG4gICAgICBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ3ZpZGVvJ1xyXG4gICAgICAgICAgJiYgdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVyc1xyXG4gICAgICAgICAgJiYgZWRnZVZlcnNpb24gPCAxNTAxOSkge1xyXG4gICAgICAgIHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgICBkZWxldGUgcC5ydHg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IFt7fV07XHJcbiAgICAgIH1cclxuICAgICAgcGFyYW1zLnJ0Y3AgPSB7XHJcbiAgICAgICAgY29tcG91bmQ6IHRyYW5zY2VpdmVyLnJ0Y3BQYXJhbWV0ZXJzLmNvbXBvdW5kXHJcbiAgICAgIH07XHJcbiAgICAgIGlmICh0cmFuc2NlaXZlci5ydGNwUGFyYW1ldGVycy5jbmFtZSkge1xyXG4gICAgICAgIHBhcmFtcy5ydGNwLmNuYW1lID0gdHJhbnNjZWl2ZXIucnRjcFBhcmFtZXRlcnMuY25hbWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcclxuICAgICAgfVxyXG4gICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlci5yZWNlaXZlKHBhcmFtcyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldExvY2FsRGVzY3JpcHRpb24gPSBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgdmFyIHBjID0gdGhpcztcclxuXHJcbiAgICAvLyBOb3RlOiBwcmFuc3dlciBpcyBub3Qgc3VwcG9ydGVkLlxyXG4gICAgaWYgKFsnb2ZmZXInLCAnYW5zd2VyJ10uaW5kZXhPZihkZXNjcmlwdGlvbi50eXBlKSA9PT0gLTEpIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG1ha2VFcnJvcignVHlwZUVycm9yJyxcclxuICAgICAgICAgICdVbnN1cHBvcnRlZCB0eXBlIFwiJyArIGRlc2NyaXB0aW9uLnR5cGUgKyAnXCInKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc0FjdGlvbkFsbG93ZWRJblNpZ25hbGluZ1N0YXRlKCdzZXRMb2NhbERlc2NyaXB0aW9uJyxcclxuICAgICAgICBkZXNjcmlwdGlvbi50eXBlLCBwYy5zaWduYWxpbmdTdGF0ZSkgfHwgcGMuX2lzQ2xvc2VkKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChtYWtlRXJyb3IoJ0ludmFsaWRTdGF0ZUVycm9yJyxcclxuICAgICAgICAgICdDYW4gbm90IHNldCBsb2NhbCAnICsgZGVzY3JpcHRpb24udHlwZSArXHJcbiAgICAgICAgICAnIGluIHN0YXRlICcgKyBwYy5zaWduYWxpbmdTdGF0ZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZWN0aW9ucztcclxuICAgIHZhciBzZXNzaW9ucGFydDtcclxuICAgIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInKSB7XHJcbiAgICAgIC8vIFZFUlkgbGltaXRlZCBzdXBwb3J0IGZvciBTRFAgbXVuZ2luZy4gTGltaXRlZCB0bzpcclxuICAgICAgLy8gKiBjaGFuZ2luZyB0aGUgb3JkZXIgb2YgY29kZWNzXHJcbiAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xyXG4gICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XHJcbiAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XHJcbiAgICAgICAgdmFyIGNhcHMgPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcclxuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ubG9jYWxDYXBhYmlsaXRpZXMgPSBjYXBzO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHBjLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyLCBzZHBNTGluZUluZGV4KSB7XHJcbiAgICAgICAgcGMuX2dhdGhlcih0cmFuc2NlaXZlci5taWQsIHNkcE1MaW5lSW5kZXgpO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicpIHtcclxuICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHBjLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XHJcbiAgICAgIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcclxuICAgICAgdmFyIGlzSWNlTGl0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxyXG4gICAgICAgICAgJ2E9aWNlLWxpdGUnKS5sZW5ndGggPiAwO1xyXG4gICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xyXG4gICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcclxuICAgICAgICB2YXIgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcclxuICAgICAgICB2YXIgaWNlVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0O1xyXG4gICAgICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydDtcclxuICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcclxuICAgICAgICB2YXIgcmVtb3RlQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzO1xyXG5cclxuICAgICAgICAvLyB0cmVhdCBidW5kbGUtb25seSBhcyBub3QtcmVqZWN0ZWQuXHJcbiAgICAgICAgdmFyIHJlamVjdGVkID0gU0RQVXRpbHMuaXNSZWplY3RlZChtZWRpYVNlY3Rpb24pICYmXHJcbiAgICAgICAgICAgIFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9YnVuZGxlLW9ubHknKS5sZW5ndGggPT09IDA7XHJcblxyXG4gICAgICAgIGlmICghcmVqZWN0ZWQgJiYgIXRyYW5zY2VpdmVyLnJlamVjdGVkKSB7XHJcbiAgICAgICAgICB2YXIgcmVtb3RlSWNlUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMoXHJcbiAgICAgICAgICAgICAgbWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XHJcbiAgICAgICAgICB2YXIgcmVtb3RlRHRsc1BhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyhcclxuICAgICAgICAgICAgICBtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcclxuICAgICAgICAgIGlmIChpc0ljZUxpdGUpIHtcclxuICAgICAgICAgICAgcmVtb3RlRHRsc1BhcmFtZXRlcnMucm9sZSA9ICdzZXJ2ZXInO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghcGMudXNpbmdCdW5kbGUgfHwgc2RwTUxpbmVJbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICBwYy5fZ2F0aGVyKHRyYW5zY2VpdmVyLm1pZCwgc2RwTUxpbmVJbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChpY2VUcmFuc3BvcnQuc3RhdGUgPT09ICduZXcnKSB7XHJcbiAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxyXG4gICAgICAgICAgICAgICAgICBpc0ljZUxpdGUgPyAnY29udHJvbGxpbmcnIDogJ2NvbnRyb2xsZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHRsc1RyYW5zcG9ydC5zdGF0ZSA9PT0gJ25ldycpIHtcclxuICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXJ0KHJlbW90ZUR0bHNQYXJhbWV0ZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxyXG4gICAgICAgICAgdmFyIHBhcmFtcyA9IGdldENvbW1vbkNhcGFiaWxpdGllcyhsb2NhbENhcGFiaWxpdGllcyxcclxuICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXMpO1xyXG5cclxuICAgICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBTZW5kZXIuIFRoZSBSVENSdHBSZWNlaXZlciBmb3IgdGhpc1xyXG4gICAgICAgICAgLy8gdHJhbnNjZWl2ZXIgaGFzIGFscmVhZHkgYmVlbiBzdGFydGVkIGluIHNldFJlbW90ZURlc2NyaXB0aW9uLlxyXG4gICAgICAgICAgcGMuX3RyYW5zY2VpdmUodHJhbnNjZWl2ZXIsXHJcbiAgICAgICAgICAgICAgcGFyYW1zLmNvZGVjcy5sZW5ndGggPiAwLFxyXG4gICAgICAgICAgICAgIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHBjLmxvY2FsRGVzY3JpcHRpb24gPSB7XHJcbiAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLnR5cGUsXHJcbiAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXHJcbiAgICB9O1xyXG4gICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicpIHtcclxuICAgICAgcGMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdoYXZlLWxvY2FsLW9mZmVyJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwYy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ3N0YWJsZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICB9O1xyXG5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0UmVtb3RlRGVzY3JpcHRpb24gPSBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgdmFyIHBjID0gdGhpcztcclxuXHJcbiAgICAvLyBOb3RlOiBwcmFuc3dlciBpcyBub3Qgc3VwcG9ydGVkLlxyXG4gICAgaWYgKFsnb2ZmZXInLCAnYW5zd2VyJ10uaW5kZXhPZihkZXNjcmlwdGlvbi50eXBlKSA9PT0gLTEpIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG1ha2VFcnJvcignVHlwZUVycm9yJyxcclxuICAgICAgICAgICdVbnN1cHBvcnRlZCB0eXBlIFwiJyArIGRlc2NyaXB0aW9uLnR5cGUgKyAnXCInKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc0FjdGlvbkFsbG93ZWRJblNpZ25hbGluZ1N0YXRlKCdzZXRSZW1vdGVEZXNjcmlwdGlvbicsXHJcbiAgICAgICAgZGVzY3JpcHRpb24udHlwZSwgcGMuc2lnbmFsaW5nU3RhdGUpIHx8IHBjLl9pc0Nsb3NlZCkge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobWFrZUVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcicsXHJcbiAgICAgICAgICAnQ2FuIG5vdCBzZXQgcmVtb3RlICcgKyBkZXNjcmlwdGlvbi50eXBlICtcclxuICAgICAgICAgICcgaW4gc3RhdGUgJyArIHBjLnNpZ25hbGluZ1N0YXRlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0cmVhbXMgPSB7fTtcclxuICAgIHBjLnJlbW90ZVN0cmVhbXMuZm9yRWFjaChmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgc3RyZWFtc1tzdHJlYW0uaWRdID0gc3RyZWFtO1xyXG4gICAgfSk7XHJcbiAgICB2YXIgcmVjZWl2ZXJMaXN0ID0gW107XHJcbiAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKGRlc2NyaXB0aW9uLnNkcCk7XHJcbiAgICB2YXIgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xyXG4gICAgdmFyIGlzSWNlTGl0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxyXG4gICAgICAgICdhPWljZS1saXRlJykubGVuZ3RoID4gMDtcclxuICAgIHZhciB1c2luZ0J1bmRsZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxyXG4gICAgICAgICdhPWdyb3VwOkJVTkRMRSAnKS5sZW5ndGggPiAwO1xyXG4gICAgcGMudXNpbmdCdW5kbGUgPSB1c2luZ0J1bmRsZTtcclxuICAgIHZhciBpY2VPcHRpb25zID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoc2Vzc2lvbnBhcnQsXHJcbiAgICAgICAgJ2E9aWNlLW9wdGlvbnM6JylbMF07XHJcbiAgICBpZiAoaWNlT3B0aW9ucykge1xyXG4gICAgICBwYy5jYW5Ucmlja2xlSWNlQ2FuZGlkYXRlcyA9IGljZU9wdGlvbnMuc3Vic3RyKDE0KS5zcGxpdCgnICcpXHJcbiAgICAgICAgICAuaW5kZXhPZigndHJpY2tsZScpID49IDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwYy5jYW5Ucmlja2xlSWNlQ2FuZGlkYXRlcyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XHJcbiAgICAgIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcclxuICAgICAgdmFyIGtpbmQgPSBTRFBVdGlscy5nZXRLaW5kKG1lZGlhU2VjdGlvbik7XHJcbiAgICAgIC8vIHRyZWF0IGJ1bmRsZS1vbmx5IGFzIG5vdC1yZWplY3RlZC5cclxuICAgICAgdmFyIHJlamVjdGVkID0gU0RQVXRpbHMuaXNSZWplY3RlZChtZWRpYVNlY3Rpb24pICYmXHJcbiAgICAgICAgICBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWJ1bmRsZS1vbmx5JykubGVuZ3RoID09PSAwO1xyXG4gICAgICB2YXIgcHJvdG9jb2wgPSBsaW5lc1swXS5zdWJzdHIoMikuc3BsaXQoJyAnKVsyXTtcclxuXHJcbiAgICAgIHZhciBkaXJlY3Rpb24gPSBTRFBVdGlscy5nZXREaXJlY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XHJcbiAgICAgIHZhciByZW1vdGVNc2lkID0gU0RQVXRpbHMucGFyc2VNc2lkKG1lZGlhU2VjdGlvbik7XHJcblxyXG4gICAgICB2YXIgbWlkID0gU0RQVXRpbHMuZ2V0TWlkKG1lZGlhU2VjdGlvbikgfHwgU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XHJcblxyXG4gICAgICAvLyBSZWplY3QgZGF0YWNoYW5uZWxzIHdoaWNoIGFyZSBub3QgaW1wbGVtZW50ZWQgeWV0LlxyXG4gICAgICBpZiAoKGtpbmQgPT09ICdhcHBsaWNhdGlvbicgJiYgcHJvdG9jb2wgPT09ICdEVExTL1NDVFAnKSB8fCByZWplY3RlZCkge1xyXG4gICAgICAgIC8vIFRPRE86IHRoaXMgaXMgZGFuZ2Vyb3VzIGluIHRoZSBjYXNlIHdoZXJlIGEgbm9uLXJlamVjdGVkIG0tbGluZVxyXG4gICAgICAgIC8vICAgICBiZWNvbWVzIHJlamVjdGVkLlxyXG4gICAgICAgIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcclxuICAgICAgICAgIG1pZDogbWlkLFxyXG4gICAgICAgICAga2luZDoga2luZCxcclxuICAgICAgICAgIHJlamVjdGVkOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcmVqZWN0ZWQgJiYgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdICYmXHJcbiAgICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVqZWN0ZWQpIHtcclxuICAgICAgICAvLyByZWN5Y2xlIGEgcmVqZWN0ZWQgdHJhbnNjZWl2ZXIuXHJcbiAgICAgICAgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdID0gcGMuX2NyZWF0ZVRyYW5zY2VpdmVyKGtpbmQsIHRydWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgdHJhbnNjZWl2ZXI7XHJcbiAgICAgIHZhciBpY2VHYXRoZXJlcjtcclxuICAgICAgdmFyIGljZVRyYW5zcG9ydDtcclxuICAgICAgdmFyIGR0bHNUcmFuc3BvcnQ7XHJcbiAgICAgIHZhciBydHBSZWNlaXZlcjtcclxuICAgICAgdmFyIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XHJcbiAgICAgIHZhciByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xyXG4gICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXM7XHJcblxyXG4gICAgICB2YXIgdHJhY2s7XHJcbiAgICAgIC8vIEZJWE1FOiBlbnN1cmUgdGhlIG1lZGlhU2VjdGlvbiBoYXMgcnRjcC1tdXggc2V0LlxyXG4gICAgICB2YXIgcmVtb3RlQ2FwYWJpbGl0aWVzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XHJcbiAgICAgIHZhciByZW1vdGVJY2VQYXJhbWV0ZXJzO1xyXG4gICAgICB2YXIgcmVtb3RlRHRsc1BhcmFtZXRlcnM7XHJcbiAgICAgIGlmICghcmVqZWN0ZWQpIHtcclxuICAgICAgICByZW1vdGVJY2VQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24sXHJcbiAgICAgICAgICAgIHNlc3Npb25wYXJ0KTtcclxuICAgICAgICByZW1vdGVEdGxzUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbixcclxuICAgICAgICAgICAgc2Vzc2lvbnBhcnQpO1xyXG4gICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzLnJvbGUgPSAnY2xpZW50JztcclxuICAgICAgfVxyXG4gICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzID1cclxuICAgICAgICAgIFNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XHJcblxyXG4gICAgICB2YXIgcnRjcFBhcmFtZXRlcnMgPSBTRFBVdGlscy5wYXJzZVJ0Y3BQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XHJcblxyXG4gICAgICB2YXIgaXNDb21wbGV0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbixcclxuICAgICAgICAgICdhPWVuZC1vZi1jYW5kaWRhdGVzJywgc2Vzc2lvbnBhcnQpLmxlbmd0aCA+IDA7XHJcbiAgICAgIHZhciBjYW5kcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9Y2FuZGlkYXRlOicpXHJcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uKGNhbmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlKGNhbmQpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oY2FuZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2FuZC5jb21wb25lbnQgPT09IDE7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHdlIGNhbiB1c2UgQlVORExFIGFuZCBkaXNwb3NlIHRyYW5zcG9ydHMuXHJcbiAgICAgIGlmICgoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJyB8fCBkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJykgJiZcclxuICAgICAgICAgICFyZWplY3RlZCAmJiB1c2luZ0J1bmRsZSAmJiBzZHBNTGluZUluZGV4ID4gMCAmJlxyXG4gICAgICAgICAgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdKSB7XHJcbiAgICAgICAgcGMuX2Rpc3Bvc2VJY2VBbmREdGxzVHJhbnNwb3J0cyhzZHBNTGluZUluZGV4KTtcclxuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uaWNlR2F0aGVyZXIgPVxyXG4gICAgICAgICAgICBwYy50cmFuc2NlaXZlcnNbMF0uaWNlR2F0aGVyZXI7XHJcbiAgICAgICAgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmljZVRyYW5zcG9ydCA9XHJcbiAgICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1swXS5pY2VUcmFuc3BvcnQ7XHJcbiAgICAgICAgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmR0bHNUcmFuc3BvcnQgPVxyXG4gICAgICAgICAgICBwYy50cmFuc2NlaXZlcnNbMF0uZHRsc1RyYW5zcG9ydDtcclxuICAgICAgICBpZiAocGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJ0cFNlbmRlcikge1xyXG4gICAgICAgICAgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJ0cFNlbmRlci5zZXRUcmFuc3BvcnQoXHJcbiAgICAgICAgICAgICAgcGMudHJhbnNjZWl2ZXJzWzBdLmR0bHNUcmFuc3BvcnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJ0cFJlY2VpdmVyKSB7XHJcbiAgICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucnRwUmVjZWl2ZXIuc2V0VHJhbnNwb3J0KFxyXG4gICAgICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1swXS5kdGxzVHJhbnNwb3J0KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicgJiYgIXJlamVjdGVkKSB7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIgPSBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0gfHxcclxuICAgICAgICAgICAgcGMuX2NyZWF0ZVRyYW5zY2VpdmVyKGtpbmQpO1xyXG4gICAgICAgIHRyYW5zY2VpdmVyLm1pZCA9IG1pZDtcclxuXHJcbiAgICAgICAgaWYgKCF0cmFuc2NlaXZlci5pY2VHYXRoZXJlcikge1xyXG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgPSBwYy5fY3JlYXRlSWNlR2F0aGVyZXIoc2RwTUxpbmVJbmRleCxcclxuICAgICAgICAgICAgICB1c2luZ0J1bmRsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY2FuZHMubGVuZ3RoICYmIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5zdGF0ZSA9PT0gJ25ldycpIHtcclxuICAgICAgICAgIGlmIChpc0NvbXBsZXRlICYmICghdXNpbmdCdW5kbGUgfHwgc2RwTUxpbmVJbmRleCA9PT0gMCkpIHtcclxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2FuZHMuZm9yRWFjaChmdW5jdGlvbihjYW5kaWRhdGUpIHtcclxuICAgICAgICAgICAgICBtYXliZUFkZENhbmRpZGF0ZSh0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQsIGNhbmRpZGF0ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMgPSB3aW5kb3cuUlRDUnRwUmVjZWl2ZXIuZ2V0Q2FwYWJpbGl0aWVzKGtpbmQpO1xyXG5cclxuICAgICAgICAvLyBmaWx0ZXIgUlRYIHVudGlsIGFkZGl0aW9uYWwgc3R1ZmYgbmVlZGVkIGZvciBSVFggaXMgaW1wbGVtZW50ZWRcclxuICAgICAgICAvLyBpbiBhZGFwdGVyLmpzXHJcbiAgICAgICAgaWYgKGVkZ2VWZXJzaW9uIDwgMTUwMTkpIHtcclxuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcyA9IGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcy5maWx0ZXIoXHJcbiAgICAgICAgICAgICAgZnVuY3Rpb24oY29kZWMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb2RlYy5uYW1lICE9PSAncnR4JztcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzIHx8IFt7XHJcbiAgICAgICAgICBzc3JjOiAoMiAqIHNkcE1MaW5lSW5kZXggKyAyKSAqIDEwMDFcclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogcmV3cml0ZSB0byB1c2UgaHR0cDovL3czYy5naXRodWIuaW8vd2VicnRjLXBjLyNzZXQtYXNzb2NpYXRlZC1yZW1vdGUtc3RyZWFtc1xyXG4gICAgICAgIHZhciBpc05ld1RyYWNrID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpIHtcclxuICAgICAgICAgIGlzTmV3VHJhY2sgPSAhdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XHJcbiAgICAgICAgICBydHBSZWNlaXZlciA9IHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyIHx8XHJcbiAgICAgICAgICAgICAgbmV3IHdpbmRvdy5SVENSdHBSZWNlaXZlcih0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LCBraW5kKTtcclxuXHJcbiAgICAgICAgICBpZiAoaXNOZXdUcmFjaykge1xyXG4gICAgICAgICAgICB2YXIgc3RyZWFtO1xyXG4gICAgICAgICAgICB0cmFjayA9IHJ0cFJlY2VpdmVyLnRyYWNrO1xyXG4gICAgICAgICAgICAvLyBGSVhNRTogZG9lcyBub3Qgd29yayB3aXRoIFBsYW4gQi5cclxuICAgICAgICAgICAgaWYgKHJlbW90ZU1zaWQgJiYgcmVtb3RlTXNpZC5zdHJlYW0gPT09ICctJykge1xyXG4gICAgICAgICAgICAgIC8vIG5vLW9wLiBhIHN0cmVhbSBpZCBvZiAnLScgbWVhbnM6IG5vIGFzc29jaWF0ZWQgc3RyZWFtLlxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlbW90ZU1zaWQpIHtcclxuICAgICAgICAgICAgICBpZiAoIXN0cmVhbXNbcmVtb3RlTXNpZC5zdHJlYW1dKSB7XHJcbiAgICAgICAgICAgICAgICBzdHJlYW1zW3JlbW90ZU1zaWQuc3RyZWFtXSA9IG5ldyB3aW5kb3cuTWVkaWFTdHJlYW0oKTtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHJlYW1zW3JlbW90ZU1zaWQuc3RyZWFtXSwgJ2lkJywge1xyXG4gICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZW1vdGVNc2lkLnN0cmVhbTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0cmFjaywgJ2lkJywge1xyXG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbW90ZU1zaWQudHJhY2s7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc3RyZWFtID0gc3RyZWFtc1tyZW1vdGVNc2lkLnN0cmVhbV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYgKCFzdHJlYW1zLmRlZmF1bHQpIHtcclxuICAgICAgICAgICAgICAgIHN0cmVhbXMuZGVmYXVsdCA9IG5ldyB3aW5kb3cuTWVkaWFTdHJlYW0oKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgc3RyZWFtID0gc3RyZWFtcy5kZWZhdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdHJlYW0pIHtcclxuICAgICAgICAgICAgICBhZGRUcmFja1RvU3RyZWFtQW5kRmlyZUV2ZW50KHRyYWNrLCBzdHJlYW0pO1xyXG4gICAgICAgICAgICAgIHRyYW5zY2VpdmVyLmFzc29jaWF0ZWRSZW1vdGVNZWRpYVN0cmVhbXMucHVzaChzdHJlYW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5wdXNoKFt0cmFjaywgcnRwUmVjZWl2ZXIsIHN0cmVhbV0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIudHJhY2spIHtcclxuICAgICAgICAgIHRyYW5zY2VpdmVyLmFzc29jaWF0ZWRSZW1vdGVNZWRpYVN0cmVhbXMuZm9yRWFjaChmdW5jdGlvbihzKSB7XHJcbiAgICAgICAgICAgIHZhciBuYXRpdmVUcmFjayA9IHMuZ2V0VHJhY2tzKCkuZmluZChmdW5jdGlvbih0KSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHQuaWQgPT09IHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnRyYWNrLmlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKG5hdGl2ZVRyYWNrKSB7XHJcbiAgICAgICAgICAgICAgcmVtb3ZlVHJhY2tGcm9tU3RyZWFtQW5kRmlyZUV2ZW50KG5hdGl2ZVRyYWNrLCBzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0cmFuc2NlaXZlci5hc3NvY2lhdGVkUmVtb3RlTWVkaWFTdHJlYW1zID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyA9IGxvY2FsQ2FwYWJpbGl0aWVzO1xyXG4gICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcyA9IHJlbW90ZUNhcGFiaWxpdGllcztcclxuICAgICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlciA9IHJ0cFJlY2VpdmVyO1xyXG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0Y3BQYXJhbWV0ZXJzID0gcnRjcFBhcmFtZXRlcnM7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycyA9IHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBSZWNlaXZlciBub3cuIFRoZSBSVFBTZW5kZXIgaXMgc3RhcnRlZCBpblxyXG4gICAgICAgIC8vIHNldExvY2FsRGVzY3JpcHRpb24uXHJcbiAgICAgICAgcGMuX3RyYW5zY2VpdmUocGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLFxyXG4gICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgaXNOZXdUcmFjayk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicgJiYgIXJlamVjdGVkKSB7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIgPSBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XHJcbiAgICAgICAgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcclxuICAgICAgICBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XHJcbiAgICAgICAgZHRsc1RyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQ7XHJcbiAgICAgICAgcnRwUmVjZWl2ZXIgPSB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcclxuICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycztcclxuICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzO1xyXG5cclxuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XHJcbiAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XHJcbiAgICAgICAgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJlbW90ZUNhcGFiaWxpdGllcyA9XHJcbiAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllcztcclxuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucnRjcFBhcmFtZXRlcnMgPSBydGNwUGFyYW1ldGVycztcclxuXHJcbiAgICAgICAgaWYgKGNhbmRzLmxlbmd0aCAmJiBpY2VUcmFuc3BvcnQuc3RhdGUgPT09ICduZXcnKSB7XHJcbiAgICAgICAgICBpZiAoKGlzSWNlTGl0ZSB8fCBpc0NvbXBsZXRlKSAmJlxyXG4gICAgICAgICAgICAgICghdXNpbmdCdW5kbGUgfHwgc2RwTUxpbmVJbmRleCA9PT0gMCkpIHtcclxuICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2FuZHMuZm9yRWFjaChmdW5jdGlvbihjYW5kaWRhdGUpIHtcclxuICAgICAgICAgICAgICBtYXliZUFkZENhbmRpZGF0ZSh0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQsIGNhbmRpZGF0ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF1c2luZ0J1bmRsZSB8fCBzZHBNTGluZUluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICBpZiAoaWNlVHJhbnNwb3J0LnN0YXRlID09PSAnbmV3Jykge1xyXG4gICAgICAgICAgICBpY2VUcmFuc3BvcnQuc3RhcnQoaWNlR2F0aGVyZXIsIHJlbW90ZUljZVBhcmFtZXRlcnMsXHJcbiAgICAgICAgICAgICAgICAnY29udHJvbGxpbmcnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChkdGxzVHJhbnNwb3J0LnN0YXRlID09PSAnbmV3Jykge1xyXG4gICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXJ0KHJlbW90ZUR0bHNQYXJhbWV0ZXJzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBjLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxyXG4gICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAncmVjdm9ubHknLFxyXG4gICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogcmV3cml0ZSB0byB1c2UgaHR0cDovL3czYy5naXRodWIuaW8vd2VicnRjLXBjLyNzZXQtYXNzb2NpYXRlZC1yZW1vdGUtc3RyZWFtc1xyXG4gICAgICAgIGlmIChydHBSZWNlaXZlciAmJlxyXG4gICAgICAgICAgICAoZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5JykpIHtcclxuICAgICAgICAgIHRyYWNrID0gcnRwUmVjZWl2ZXIudHJhY2s7XHJcbiAgICAgICAgICBpZiAocmVtb3RlTXNpZCkge1xyXG4gICAgICAgICAgICBpZiAoIXN0cmVhbXNbcmVtb3RlTXNpZC5zdHJlYW1dKSB7XHJcbiAgICAgICAgICAgICAgc3RyZWFtc1tyZW1vdGVNc2lkLnN0cmVhbV0gPSBuZXcgd2luZG93Lk1lZGlhU3RyZWFtKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkVHJhY2tUb1N0cmVhbUFuZEZpcmVFdmVudCh0cmFjaywgc3RyZWFtc1tyZW1vdGVNc2lkLnN0cmVhbV0pO1xyXG4gICAgICAgICAgICByZWNlaXZlckxpc3QucHVzaChbdHJhY2ssIHJ0cFJlY2VpdmVyLCBzdHJlYW1zW3JlbW90ZU1zaWQuc3RyZWFtXV0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCFzdHJlYW1zLmRlZmF1bHQpIHtcclxuICAgICAgICAgICAgICBzdHJlYW1zLmRlZmF1bHQgPSBuZXcgd2luZG93Lk1lZGlhU3RyZWFtKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkVHJhY2tUb1N0cmVhbUFuZEZpcmVFdmVudCh0cmFjaywgc3RyZWFtcy5kZWZhdWx0KTtcclxuICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlciwgc3RyZWFtcy5kZWZhdWx0XSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIEZJWE1FOiBhY3R1YWxseSB0aGUgcmVjZWl2ZXIgc2hvdWxkIGJlIGNyZWF0ZWQgbGF0ZXIuXHJcbiAgICAgICAgICBkZWxldGUgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocGMuX2R0bHNSb2xlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgcGMuX2R0bHNSb2xlID0gZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJyA/ICdhY3RpdmUnIDogJ3Bhc3NpdmUnO1xyXG4gICAgfVxyXG5cclxuICAgIHBjLnJlbW90ZURlc2NyaXB0aW9uID0ge1xyXG4gICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxyXG4gICAgICBzZHA6IGRlc2NyaXB0aW9uLnNkcFxyXG4gICAgfTtcclxuICAgIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInKSB7XHJcbiAgICAgIHBjLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnaGF2ZS1yZW1vdGUtb2ZmZXInKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBjLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XHJcbiAgICB9XHJcbiAgICBPYmplY3Qua2V5cyhzdHJlYW1zKS5mb3JFYWNoKGZ1bmN0aW9uKHNpZCkge1xyXG4gICAgICB2YXIgc3RyZWFtID0gc3RyZWFtc1tzaWRdO1xyXG4gICAgICBpZiAoc3RyZWFtLmdldFRyYWNrcygpLmxlbmd0aCkge1xyXG4gICAgICAgIGlmIChwYy5yZW1vdGVTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKSA9PT0gLTEpIHtcclxuICAgICAgICAgIHBjLnJlbW90ZVN0cmVhbXMucHVzaChzdHJlYW0pO1xyXG4gICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdhZGRzdHJlYW0nKTtcclxuICAgICAgICAgIGV2ZW50LnN0cmVhbSA9IHN0cmVhbTtcclxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBwYy5fZGlzcGF0Y2hFdmVudCgnYWRkc3RyZWFtJywgZXZlbnQpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZWNlaXZlckxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICB2YXIgdHJhY2sgPSBpdGVtWzBdO1xyXG4gICAgICAgICAgdmFyIHJlY2VpdmVyID0gaXRlbVsxXTtcclxuICAgICAgICAgIGlmIChzdHJlYW0uaWQgIT09IGl0ZW1bMl0uaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmlyZUFkZFRyYWNrKHBjLCB0cmFjaywgcmVjZWl2ZXIsIFtzdHJlYW1dKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZWNlaXZlckxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgIGlmIChpdGVtWzJdKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGZpcmVBZGRUcmFjayhwYywgaXRlbVswXSwgaXRlbVsxXSwgW10pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gY2hlY2sgd2hldGhlciBhZGRJY2VDYW5kaWRhdGUoe30pIHdhcyBjYWxsZWQgd2l0aGluIGZvdXIgc2Vjb25kcyBhZnRlclxyXG4gICAgLy8gc2V0UmVtb3RlRGVzY3JpcHRpb24uXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCEocGMgJiYgcGMudHJhbnNjZWl2ZXJzKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBwYy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xyXG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQgJiZcclxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0YXRlID09PSAnbmV3JyAmJlxyXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuZ2V0UmVtb3RlQ2FuZGlkYXRlcygpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGNvbnNvbGUud2FybignVGltZW91dCBmb3IgYWRkUmVtb3RlQ2FuZGlkYXRlLiBDb25zaWRlciBzZW5kaW5nICcgK1xyXG4gICAgICAgICAgICAgICdhbiBlbmQtb2YtY2FuZGlkYXRlcyBub3RpZmljYXRpb24nKTtcclxuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5hZGRSZW1vdGVDYW5kaWRhdGUoe30pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9LCA0MDAwKTtcclxuXHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgfTtcclxuXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XHJcbiAgICAgIC8qIG5vdCB5ZXRcclxuICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyKSB7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgICAqL1xyXG4gICAgICBpZiAodHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0KSB7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydCkge1xyXG4gICAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcclxuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xyXG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvLyBGSVhNRTogY2xlYW4gdXAgdHJhY2tzLCBsb2NhbCBzdHJlYW1zLCByZW1vdGUgc3RyZWFtcywgZXRjXHJcbiAgICB0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XHJcbiAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnY2xvc2VkJyk7XHJcbiAgfTtcclxuXHJcbiAgLy8gVXBkYXRlIHRoZSBzaWduYWxpbmcgc3RhdGUuXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGVTaWduYWxpbmdTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XHJcbiAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gbmV3U3RhdGU7XHJcbiAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3NpZ25hbGluZ3N0YXRlY2hhbmdlJyk7XHJcbiAgICB0aGlzLl9kaXNwYXRjaEV2ZW50KCdzaWduYWxpbmdzdGF0ZWNoYW5nZScsIGV2ZW50KTtcclxuICB9O1xyXG5cclxuICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBmaXJlIHRoZSBuZWdvdGlhdGlvbm5lZWRlZCBldmVudC5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgaWYgKHRoaXMuc2lnbmFsaW5nU3RhdGUgIT09ICdzdGFibGUnIHx8IHRoaXMubmVlZE5lZ290aWF0aW9uID09PSB0cnVlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMubmVlZE5lZ290aWF0aW9uID0gdHJ1ZTtcclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAocGMubmVlZE5lZ290aWF0aW9uKSB7XHJcbiAgICAgICAgcGMubmVlZE5lZ290aWF0aW9uID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCduZWdvdGlhdGlvbm5lZWRlZCcpO1xyXG4gICAgICAgIHBjLl9kaXNwYXRjaEV2ZW50KCduZWdvdGlhdGlvbm5lZWRlZCcsIGV2ZW50KTtcclxuICAgICAgfVxyXG4gICAgfSwgMCk7XHJcbiAgfTtcclxuXHJcbiAgLy8gVXBkYXRlIHRoZSBpY2UgY29ubmVjdGlvbiBzdGF0ZS5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZUljZUNvbm5lY3Rpb25TdGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5ld1N0YXRlO1xyXG4gICAgdmFyIHN0YXRlcyA9IHtcclxuICAgICAgJ25ldyc6IDAsXHJcbiAgICAgIGNsb3NlZDogMCxcclxuICAgICAgY2hlY2tpbmc6IDAsXHJcbiAgICAgIGNvbm5lY3RlZDogMCxcclxuICAgICAgY29tcGxldGVkOiAwLFxyXG4gICAgICBkaXNjb25uZWN0ZWQ6IDAsXHJcbiAgICAgIGZhaWxlZDogMFxyXG4gICAgfTtcclxuICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcclxuICAgICAgc3RhdGVzW3RyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5zdGF0ZV0rKztcclxuICAgIH0pO1xyXG5cclxuICAgIG5ld1N0YXRlID0gJ25ldyc7XHJcbiAgICBpZiAoc3RhdGVzLmZhaWxlZCA+IDApIHtcclxuICAgICAgbmV3U3RhdGUgPSAnZmFpbGVkJztcclxuICAgIH0gZWxzZSBpZiAoc3RhdGVzLmNoZWNraW5nID4gMCkge1xyXG4gICAgICBuZXdTdGF0ZSA9ICdjaGVja2luZyc7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5kaXNjb25uZWN0ZWQgPiAwKSB7XHJcbiAgICAgIG5ld1N0YXRlID0gJ2Rpc2Nvbm5lY3RlZCc7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5uZXcgPiAwKSB7XHJcbiAgICAgIG5ld1N0YXRlID0gJ25ldyc7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0ZWQgPiAwKSB7XHJcbiAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RlZCc7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb21wbGV0ZWQgPiAwKSB7XHJcbiAgICAgIG5ld1N0YXRlID0gJ2NvbXBsZXRlZCc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld1N0YXRlICE9PSB0aGlzLmljZUNvbm5lY3Rpb25TdGF0ZSkge1xyXG4gICAgICB0aGlzLmljZUNvbm5lY3Rpb25TdGF0ZSA9IG5ld1N0YXRlO1xyXG4gICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScpO1xyXG4gICAgICB0aGlzLl9kaXNwYXRjaEV2ZW50KCdpY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UnLCBldmVudCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gVXBkYXRlIHRoZSBjb25uZWN0aW9uIHN0YXRlLlxyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlQ29ubmVjdGlvblN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbmV3U3RhdGU7XHJcbiAgICB2YXIgc3RhdGVzID0ge1xyXG4gICAgICAnbmV3JzogMCxcclxuICAgICAgY2xvc2VkOiAwLFxyXG4gICAgICBjb25uZWN0aW5nOiAwLFxyXG4gICAgICBjb25uZWN0ZWQ6IDAsXHJcbiAgICAgIGNvbXBsZXRlZDogMCxcclxuICAgICAgZGlzY29ubmVjdGVkOiAwLFxyXG4gICAgICBmYWlsZWQ6IDBcclxuICAgIH07XHJcbiAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XHJcbiAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RhdGVdKys7XHJcbiAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LnN0YXRlXSsrO1xyXG4gICAgfSk7XHJcbiAgICAvLyBJQ0VUcmFuc3BvcnQuY29tcGxldGVkIGFuZCBjb25uZWN0ZWQgYXJlIHRoZSBzYW1lIGZvciB0aGlzIHB1cnBvc2UuXHJcbiAgICBzdGF0ZXMuY29ubmVjdGVkICs9IHN0YXRlcy5jb21wbGV0ZWQ7XHJcblxyXG4gICAgbmV3U3RhdGUgPSAnbmV3JztcclxuICAgIGlmIChzdGF0ZXMuZmFpbGVkID4gMCkge1xyXG4gICAgICBuZXdTdGF0ZSA9ICdmYWlsZWQnO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGluZyA+IDApIHtcclxuICAgICAgbmV3U3RhdGUgPSAnY29ubmVjdGluZyc7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5kaXNjb25uZWN0ZWQgPiAwKSB7XHJcbiAgICAgIG5ld1N0YXRlID0gJ2Rpc2Nvbm5lY3RlZCc7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5uZXcgPiAwKSB7XHJcbiAgICAgIG5ld1N0YXRlID0gJ25ldyc7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0ZWQgPiAwKSB7XHJcbiAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RlZCc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5ld1N0YXRlICE9PSB0aGlzLmNvbm5lY3Rpb25TdGF0ZSkge1xyXG4gICAgICB0aGlzLmNvbm5lY3Rpb25TdGF0ZSA9IG5ld1N0YXRlO1xyXG4gICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2Nvbm5lY3Rpb25zdGF0ZWNoYW5nZScpO1xyXG4gICAgICB0aGlzLl9kaXNwYXRjaEV2ZW50KCdjb25uZWN0aW9uc3RhdGVjaGFuZ2UnLCBldmVudCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZU9mZmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcGMgPSB0aGlzO1xyXG5cclxuICAgIGlmIChwYy5faXNDbG9zZWQpIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG1ha2VFcnJvcignSW52YWxpZFN0YXRlRXJyb3InLFxyXG4gICAgICAgICAgJ0NhbiBub3QgY2FsbCBjcmVhdGVPZmZlciBhZnRlciBjbG9zZScpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbnVtQXVkaW9UcmFja3MgPSBwYy50cmFuc2NlaXZlcnMuZmlsdGVyKGZ1bmN0aW9uKHQpIHtcclxuICAgICAgcmV0dXJuIHQua2luZCA9PT0gJ2F1ZGlvJztcclxuICAgIH0pLmxlbmd0aDtcclxuICAgIHZhciBudW1WaWRlb1RyYWNrcyA9IHBjLnRyYW5zY2VpdmVycy5maWx0ZXIoZnVuY3Rpb24odCkge1xyXG4gICAgICByZXR1cm4gdC5raW5kID09PSAndmlkZW8nO1xyXG4gICAgfSkubGVuZ3RoO1xyXG5cclxuICAgIC8vIERldGVybWluZSBudW1iZXIgb2YgYXVkaW8gYW5kIHZpZGVvIHRyYWNrcyB3ZSBuZWVkIHRvIHNlbmQvcmVjdi5cclxuICAgIHZhciBvZmZlck9wdGlvbnMgPSBhcmd1bWVudHNbMF07XHJcbiAgICBpZiAob2ZmZXJPcHRpb25zKSB7XHJcbiAgICAgIC8vIFJlamVjdCBDaHJvbWUgbGVnYWN5IGNvbnN0cmFpbnRzLlxyXG4gICAgICBpZiAob2ZmZXJPcHRpb25zLm1hbmRhdG9yeSB8fCBvZmZlck9wdGlvbnMub3B0aW9uYWwpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxyXG4gICAgICAgICAgICAnTGVnYWN5IG1hbmRhdG9yeS9vcHRpb25hbCBjb25zdHJhaW50cyBub3Qgc3VwcG9ydGVkLicpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZUF1ZGlvID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBudW1BdWRpb1RyYWNrcyA9IDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgIG51bUF1ZGlvVHJhY2tzID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbnVtQXVkaW9UcmFja3MgPSBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW8gPT09IHRydWUpIHtcclxuICAgICAgICAgIG51bVZpZGVvVHJhY2tzID0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgbnVtVmlkZW9UcmFja3MgPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBudW1WaWRlb1RyYWNrcyA9IG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBjLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XHJcbiAgICAgIGlmICh0cmFuc2NlaXZlci5raW5kID09PSAnYXVkaW8nKSB7XHJcbiAgICAgICAgbnVtQXVkaW9UcmFja3MtLTtcclxuICAgICAgICBpZiAobnVtQXVkaW9UcmFja3MgPCAwKSB7XHJcbiAgICAgICAgICB0cmFuc2NlaXZlci53YW50UmVjZWl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5raW5kID09PSAndmlkZW8nKSB7XHJcbiAgICAgICAgbnVtVmlkZW9UcmFja3MtLTtcclxuICAgICAgICBpZiAobnVtVmlkZW9UcmFja3MgPCAwKSB7XHJcbiAgICAgICAgICB0cmFuc2NlaXZlci53YW50UmVjZWl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIE0tbGluZXMgZm9yIHJlY3Zvbmx5IHN0cmVhbXMuXHJcbiAgICB3aGlsZSAobnVtQXVkaW9UcmFja3MgPiAwIHx8IG51bVZpZGVvVHJhY2tzID4gMCkge1xyXG4gICAgICBpZiAobnVtQXVkaW9UcmFja3MgPiAwKSB7XHJcbiAgICAgICAgcGMuX2NyZWF0ZVRyYW5zY2VpdmVyKCdhdWRpbycpO1xyXG4gICAgICAgIG51bUF1ZGlvVHJhY2tzLS07XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG51bVZpZGVvVHJhY2tzID4gMCkge1xyXG4gICAgICAgIHBjLl9jcmVhdGVUcmFuc2NlaXZlcigndmlkZW8nKTtcclxuICAgICAgICBudW1WaWRlb1RyYWNrcy0tO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlKHBjLl9zZHBTZXNzaW9uSWQsXHJcbiAgICAgICAgcGMuX3NkcFNlc3Npb25WZXJzaW9uKyspO1xyXG4gICAgcGMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIsIHNkcE1MaW5lSW5kZXgpIHtcclxuICAgICAgLy8gRm9yIGVhY2ggdHJhY2ssIGNyZWF0ZSBhbiBpY2UgZ2F0aGVyZXIsIGljZSB0cmFuc3BvcnQsXHJcbiAgICAgIC8vIGR0bHMgdHJhbnNwb3J0LCBwb3RlbnRpYWxseSBydHBzZW5kZXIgYW5kIHJ0cHJlY2VpdmVyLlxyXG4gICAgICB2YXIgdHJhY2sgPSB0cmFuc2NlaXZlci50cmFjaztcclxuICAgICAgdmFyIGtpbmQgPSB0cmFuc2NlaXZlci5raW5kO1xyXG4gICAgICB2YXIgbWlkID0gdHJhbnNjZWl2ZXIubWlkIHx8IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xyXG4gICAgICB0cmFuc2NlaXZlci5taWQgPSBtaWQ7XHJcblxyXG4gICAgICBpZiAoIXRyYW5zY2VpdmVyLmljZUdhdGhlcmVyKSB7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgPSBwYy5fY3JlYXRlSWNlR2F0aGVyZXIoc2RwTUxpbmVJbmRleCxcclxuICAgICAgICAgICAgcGMudXNpbmdCdW5kbGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSB3aW5kb3cuUlRDUnRwU2VuZGVyLmdldENhcGFiaWxpdGllcyhraW5kKTtcclxuICAgICAgLy8gZmlsdGVyIFJUWCB1bnRpbCBhZGRpdGlvbmFsIHN0dWZmIG5lZWRlZCBmb3IgUlRYIGlzIGltcGxlbWVudGVkXHJcbiAgICAgIC8vIGluIGFkYXB0ZXIuanNcclxuICAgICAgaWYgKGVkZ2VWZXJzaW9uIDwgMTUwMTkpIHtcclxuICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MgPSBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZmlsdGVyKFxyXG4gICAgICAgICAgICBmdW5jdGlvbihjb2RlYykge1xyXG4gICAgICAgICAgICAgIHJldHVybiBjb2RlYy5uYW1lICE9PSAncnR4JztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcclxuICAgICAgICAvLyB3b3JrIGFyb3VuZCBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3Avd2VicnRjL2lzc3Vlcy9kZXRhaWw/aWQ9NjU1MlxyXG4gICAgICAgIC8vIGJ5IGFkZGluZyBsZXZlbC1hc3ltbWV0cnktYWxsb3dlZD0xXHJcbiAgICAgICAgaWYgKGNvZGVjLm5hbWUgPT09ICdIMjY0JyAmJlxyXG4gICAgICAgICAgICBjb2RlYy5wYXJhbWV0ZXJzWydsZXZlbC1hc3ltbWV0cnktYWxsb3dlZCddID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIGNvZGVjLnBhcmFtZXRlcnNbJ2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkJ10gPSAnMSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmb3Igc3Vic2VxdWVudCBvZmZlcnMsIHdlIG1pZ2h0IGhhdmUgdG8gcmUtdXNlIHRoZSBwYXlsb2FkXHJcbiAgICAgICAgLy8gdHlwZSBvZiB0aGUgbGFzdCBvZmZlci5cclxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzICYmXHJcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3MpIHtcclxuICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihyZW1vdGVDb2RlYykge1xyXG4gICAgICAgICAgICBpZiAoY29kZWMubmFtZS50b0xvd2VyQ2FzZSgpID09PSByZW1vdGVDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgJiZcclxuICAgICAgICAgICAgICAgIGNvZGVjLmNsb2NrUmF0ZSA9PT0gcmVtb3RlQ29kZWMuY2xvY2tSYXRlKSB7XHJcbiAgICAgICAgICAgICAgY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgPSByZW1vdGVDb2RlYy5wYXlsb2FkVHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGhkckV4dCkge1xyXG4gICAgICAgIHZhciByZW1vdGVFeHRlbnNpb25zID0gdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzICYmXHJcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zIHx8IFtdO1xyXG4gICAgICAgIHJlbW90ZUV4dGVuc2lvbnMuZm9yRWFjaChmdW5jdGlvbihySGRyRXh0KSB7XHJcbiAgICAgICAgICBpZiAoaGRyRXh0LnVyaSA9PT0gckhkckV4dC51cmkpIHtcclxuICAgICAgICAgICAgaGRyRXh0LmlkID0gckhkckV4dC5pZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBnZW5lcmF0ZSBhbiBzc3JjIG5vdywgdG8gYmUgdXNlZCBsYXRlciBpbiBydHBTZW5kZXIuc2VuZFxyXG4gICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgfHwgW3tcclxuICAgICAgICBzc3JjOiAoMiAqIHNkcE1MaW5lSW5kZXggKyAxKSAqIDEwMDFcclxuICAgICAgfV07XHJcbiAgICAgIGlmICh0cmFjaykge1xyXG4gICAgICAgIC8vIGFkZCBSVFhcclxuICAgICAgICBpZiAoZWRnZVZlcnNpb24gPj0gMTUwMTkgJiYga2luZCA9PT0gJ3ZpZGVvJyAmJlxyXG4gICAgICAgICAgICAhc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcclxuICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4ID0ge1xyXG4gICAgICAgICAgICBzc3JjOiBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgKyAxXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRyYW5zY2VpdmVyLndhbnRSZWNlaXZlKSB7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIgPSBuZXcgd2luZG93LlJUQ1J0cFJlY2VpdmVyKFxyXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LCBraW5kKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMgPSBsb2NhbENhcGFiaWxpdGllcztcclxuICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBhbHdheXMgb2ZmZXIgQlVORExFIGFuZCBkaXNwb3NlIG9uIHJldHVybiBpZiBub3Qgc3VwcG9ydGVkLlxyXG4gICAgaWYgKHBjLl9jb25maWcuYnVuZGxlUG9saWN5ICE9PSAnbWF4LWNvbXBhdCcpIHtcclxuICAgICAgc2RwICs9ICdhPWdyb3VwOkJVTkRMRSAnICsgcGMudHJhbnNjZWl2ZXJzLm1hcChmdW5jdGlvbih0KSB7XHJcbiAgICAgICAgcmV0dXJuIHQubWlkO1xyXG4gICAgICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcclxuICAgIH1cclxuICAgIHNkcCArPSAnYT1pY2Utb3B0aW9uczp0cmlja2xlXFxyXFxuJztcclxuXHJcbiAgICBwYy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlciwgc2RwTUxpbmVJbmRleCkge1xyXG4gICAgICBzZHAgKz0gd3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsIHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLFxyXG4gICAgICAgICAgJ29mZmVyJywgdHJhbnNjZWl2ZXIuc3RyZWFtLCBwYy5fZHRsc1JvbGUpO1xyXG4gICAgICBzZHAgKz0gJ2E9cnRjcC1yc2l6ZVxcclxcbic7XHJcblxyXG4gICAgICBpZiAodHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiYgcGMuaWNlR2F0aGVyaW5nU3RhdGUgIT09ICduZXcnICYmXHJcbiAgICAgICAgICAoc2RwTUxpbmVJbmRleCA9PT0gMCB8fCAhcGMudXNpbmdCdW5kbGUpKSB7XHJcbiAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuZ2V0TG9jYWxDYW5kaWRhdGVzKCkuZm9yRWFjaChmdW5jdGlvbihjYW5kKSB7XHJcbiAgICAgICAgICBjYW5kLmNvbXBvbmVudCA9IDE7XHJcbiAgICAgICAgICBzZHAgKz0gJ2E9JyArIFNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlKGNhbmQpICsgJ1xcclxcbic7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCcpIHtcclxuICAgICAgICAgIHNkcCArPSAnYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgZGVzYyA9IG5ldyB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcclxuICAgICAgdHlwZTogJ29mZmVyJyxcclxuICAgICAgc2RwOiBzZHBcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcclxuICB9O1xyXG5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlQW5zd2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcGMgPSB0aGlzO1xyXG5cclxuICAgIGlmIChwYy5faXNDbG9zZWQpIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG1ha2VFcnJvcignSW52YWxpZFN0YXRlRXJyb3InLFxyXG4gICAgICAgICAgJ0NhbiBub3QgY2FsbCBjcmVhdGVBbnN3ZXIgYWZ0ZXIgY2xvc2UnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEocGMuc2lnbmFsaW5nU3RhdGUgPT09ICdoYXZlLXJlbW90ZS1vZmZlcicgfHxcclxuICAgICAgICBwYy5zaWduYWxpbmdTdGF0ZSA9PT0gJ2hhdmUtbG9jYWwtcHJhbnN3ZXInKSkge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobWFrZUVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcicsXHJcbiAgICAgICAgICAnQ2FuIG5vdCBjYWxsIGNyZWF0ZUFuc3dlciBpbiBzaWduYWxpbmdTdGF0ZSAnICsgcGMuc2lnbmFsaW5nU3RhdGUpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUocGMuX3NkcFNlc3Npb25JZCxcclxuICAgICAgICBwYy5fc2RwU2Vzc2lvblZlcnNpb24rKyk7XHJcbiAgICBpZiAocGMudXNpbmdCdW5kbGUpIHtcclxuICAgICAgc2RwICs9ICdhPWdyb3VwOkJVTkRMRSAnICsgcGMudHJhbnNjZWl2ZXJzLm1hcChmdW5jdGlvbih0KSB7XHJcbiAgICAgICAgcmV0dXJuIHQubWlkO1xyXG4gICAgICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcclxuICAgIH1cclxuICAgIHZhciBtZWRpYVNlY3Rpb25zSW5PZmZlciA9IFNEUFV0aWxzLmdldE1lZGlhU2VjdGlvbnMoXHJcbiAgICAgICAgcGMucmVtb3RlRGVzY3JpcHRpb24uc2RwKS5sZW5ndGg7XHJcbiAgICBwYy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlciwgc2RwTUxpbmVJbmRleCkge1xyXG4gICAgICBpZiAoc2RwTUxpbmVJbmRleCArIDEgPiBtZWRpYVNlY3Rpb25zSW5PZmZlcikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHJhbnNjZWl2ZXIucmVqZWN0ZWQpIHtcclxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ2FwcGxpY2F0aW9uJykge1xyXG4gICAgICAgICAgc2RwICs9ICdtPWFwcGxpY2F0aW9uIDAgRFRMUy9TQ1RQIDUwMDBcXHJcXG4nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ2F1ZGlvJykge1xyXG4gICAgICAgICAgc2RwICs9ICdtPWF1ZGlvIDAgVURQL1RMUy9SVFAvU0FWUEYgMFxcclxcbicgK1xyXG4gICAgICAgICAgICAgICdhPXJ0cG1hcDowIFBDTVUvODAwMFxcclxcbic7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5raW5kID09PSAndmlkZW8nKSB7XHJcbiAgICAgICAgICBzZHAgKz0gJ209dmlkZW8gMCBVRFAvVExTL1JUUC9TQVZQRiAxMjBcXHJcXG4nICtcclxuICAgICAgICAgICAgICAnYT1ydHBtYXA6MTIwIFZQOC85MDAwMFxcclxcbic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNkcCArPSAnYz1JTiBJUDQgMC4wLjAuMFxcclxcbicgK1xyXG4gICAgICAgICAgICAnYT1pbmFjdGl2ZVxcclxcbicgK1xyXG4gICAgICAgICAgICAnYT1taWQ6JyArIHRyYW5zY2VpdmVyLm1pZCArICdcXHJcXG4nO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRklYTUU6IGxvb2sgYXQgZGlyZWN0aW9uLlxyXG4gICAgICBpZiAodHJhbnNjZWl2ZXIuc3RyZWFtKSB7XHJcbiAgICAgICAgdmFyIGxvY2FsVHJhY2s7XHJcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmtpbmQgPT09ICdhdWRpbycpIHtcclxuICAgICAgICAgIGxvY2FsVHJhY2sgPSB0cmFuc2NlaXZlci5zdHJlYW0uZ2V0QXVkaW9UcmFja3MoKVswXTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLmtpbmQgPT09ICd2aWRlbycpIHtcclxuICAgICAgICAgIGxvY2FsVHJhY2sgPSB0cmFuc2NlaXZlci5zdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxvY2FsVHJhY2spIHtcclxuICAgICAgICAgIC8vIGFkZCBSVFhcclxuICAgICAgICAgIGlmIChlZGdlVmVyc2lvbiA+PSAxNTAxOSAmJiB0cmFuc2NlaXZlci5raW5kID09PSAndmlkZW8nICYmXHJcbiAgICAgICAgICAgICAgIXRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4KSB7XHJcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4ID0ge1xyXG4gICAgICAgICAgICAgIHNzcmM6IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArIDFcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxyXG4gICAgICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0gZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKFxyXG4gICAgICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsXHJcbiAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xyXG5cclxuICAgICAgdmFyIGhhc1J0eCA9IGNvbW1vbkNhcGFiaWxpdGllcy5jb2RlY3MuZmlsdGVyKGZ1bmN0aW9uKGMpIHtcclxuICAgICAgICByZXR1cm4gYy5uYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdydHgnO1xyXG4gICAgICB9KS5sZW5ndGg7XHJcbiAgICAgIGlmICghaGFzUnR4ICYmIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4KSB7XHJcbiAgICAgICAgZGVsZXRlIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZHAgKz0gd3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsIGNvbW1vbkNhcGFiaWxpdGllcyxcclxuICAgICAgICAgICdhbnN3ZXInLCB0cmFuc2NlaXZlci5zdHJlYW0sIHBjLl9kdGxzUm9sZSk7XHJcbiAgICAgIGlmICh0cmFuc2NlaXZlci5ydGNwUGFyYW1ldGVycyAmJlxyXG4gICAgICAgICAgdHJhbnNjZWl2ZXIucnRjcFBhcmFtZXRlcnMucmVkdWNlZFNpemUpIHtcclxuICAgICAgICBzZHAgKz0gJ2E9cnRjcC1yc2l6ZVxcclxcbic7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBkZXNjID0gbmV3IHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24oe1xyXG4gICAgICB0eXBlOiAnYW5zd2VyJyxcclxuICAgICAgc2RwOiBzZHBcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcclxuICB9O1xyXG5cclxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XHJcbiAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgdmFyIHNlY3Rpb25zO1xyXG4gICAgaWYgKGNhbmRpZGF0ZSAmJiAhKGNhbmRpZGF0ZS5zZHBNTGluZUluZGV4ICE9PSB1bmRlZmluZWQgfHxcclxuICAgICAgICBjYW5kaWRhdGUuc2RwTWlkKSkge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignc2RwTUxpbmVJbmRleCBvciBzZHBNaWQgcmVxdWlyZWQnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogbmVlZHMgdG8gZ28gaW50byBvcHMgcXVldWUuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIGlmICghcGMucmVtb3RlRGVzY3JpcHRpb24pIHtcclxuICAgICAgICByZXR1cm4gcmVqZWN0KG1ha2VFcnJvcignSW52YWxpZFN0YXRlRXJyb3InLFxyXG4gICAgICAgICAgICAnQ2FuIG5vdCBhZGQgSUNFIGNhbmRpZGF0ZSB3aXRob3V0IGEgcmVtb3RlIGRlc2NyaXB0aW9uJykpO1xyXG4gICAgICB9IGVsc2UgaWYgKCFjYW5kaWRhdGUgfHwgY2FuZGlkYXRlLmNhbmRpZGF0ZSA9PT0gJycpIHtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBjLnRyYW5zY2VpdmVycy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgaWYgKHBjLnRyYW5zY2VpdmVyc1tqXS5yZWplY3RlZCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1tqXS5pY2VUcmFuc3BvcnQuYWRkUmVtb3RlQ2FuZGlkYXRlKHt9KTtcclxuICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuZ2V0TWVkaWFTZWN0aW9ucyhwYy5yZW1vdGVEZXNjcmlwdGlvbi5zZHApO1xyXG4gICAgICAgICAgc2VjdGlvbnNbal0gKz0gJ2E9ZW5kLW9mLWNhbmRpZGF0ZXNcXHJcXG4nO1xyXG4gICAgICAgICAgcGMucmVtb3RlRGVzY3JpcHRpb24uc2RwID1cclxuICAgICAgICAgICAgICBTRFBVdGlscy5nZXREZXNjcmlwdGlvbihwYy5yZW1vdGVEZXNjcmlwdGlvbi5zZHApICtcclxuICAgICAgICAgICAgICBzZWN0aW9ucy5qb2luKCcnKTtcclxuICAgICAgICAgIGlmIChwYy51c2luZ0J1bmRsZSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIHNkcE1MaW5lSW5kZXggPSBjYW5kaWRhdGUuc2RwTUxpbmVJbmRleDtcclxuICAgICAgICBpZiAoY2FuZGlkYXRlLnNkcE1pZCkge1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYy50cmFuc2NlaXZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHBjLnRyYW5zY2VpdmVyc1tpXS5taWQgPT09IGNhbmRpZGF0ZS5zZHBNaWQpIHtcclxuICAgICAgICAgICAgICBzZHBNTGluZUluZGV4ID0gaTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdHJhbnNjZWl2ZXIgPSBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XHJcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyKSB7XHJcbiAgICAgICAgICBpZiAodHJhbnNjZWl2ZXIucmVqZWN0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHZhciBjYW5kID0gT2JqZWN0LmtleXMoY2FuZGlkYXRlLmNhbmRpZGF0ZSkubGVuZ3RoID4gMCA/XHJcbiAgICAgICAgICAgICAgU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUoY2FuZGlkYXRlLmNhbmRpZGF0ZSkgOiB7fTtcclxuICAgICAgICAgIC8vIElnbm9yZSBDaHJvbWUncyBpbnZhbGlkIGNhbmRpZGF0ZXMgc2luY2UgRWRnZSBkb2VzIG5vdCBsaWtlIHRoZW0uXHJcbiAgICAgICAgICBpZiAoY2FuZC5wcm90b2NvbCA9PT0gJ3RjcCcgJiYgKGNhbmQucG9ydCA9PT0gMCB8fCBjYW5kLnBvcnQgPT09IDkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBJZ25vcmUgUlRDUCBjYW5kaWRhdGVzLCB3ZSBhc3N1bWUgUlRDUC1NVVguXHJcbiAgICAgICAgICBpZiAoY2FuZC5jb21wb25lbnQgJiYgY2FuZC5jb21wb25lbnQgIT09IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIHdoZW4gdXNpbmcgYnVuZGxlLCBhdm9pZCBhZGRpbmcgY2FuZGlkYXRlcyB0byB0aGUgd3JvbmdcclxuICAgICAgICAgIC8vIGljZSB0cmFuc3BvcnQuIEFuZCBhdm9pZCBhZGRpbmcgY2FuZGlkYXRlcyBhZGRlZCBpbiB0aGUgU0RQLlxyXG4gICAgICAgICAgaWYgKHNkcE1MaW5lSW5kZXggPT09IDAgfHwgKHNkcE1MaW5lSW5kZXggPiAwICYmXHJcbiAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0ICE9PSBwYy50cmFuc2NlaXZlcnNbMF0uaWNlVHJhbnNwb3J0KSkge1xyXG4gICAgICAgICAgICBpZiAoIW1heWJlQWRkQ2FuZGlkYXRlKHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydCwgY2FuZCkpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KG1ha2VFcnJvcignT3BlcmF0aW9uRXJyb3InLFxyXG4gICAgICAgICAgICAgICAgICAnQ2FuIG5vdCBhZGQgSUNFIGNhbmRpZGF0ZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVtb3RlRGVzY3JpcHRpb24uXHJcbiAgICAgICAgICB2YXIgY2FuZGlkYXRlU3RyaW5nID0gY2FuZGlkYXRlLmNhbmRpZGF0ZS50cmltKCk7XHJcbiAgICAgICAgICBpZiAoY2FuZGlkYXRlU3RyaW5nLmluZGV4T2YoJ2E9JykgPT09IDApIHtcclxuICAgICAgICAgICAgY2FuZGlkYXRlU3RyaW5nID0gY2FuZGlkYXRlU3RyaW5nLnN1YnN0cigyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuZ2V0TWVkaWFTZWN0aW9ucyhwYy5yZW1vdGVEZXNjcmlwdGlvbi5zZHApO1xyXG4gICAgICAgICAgc2VjdGlvbnNbc2RwTUxpbmVJbmRleF0gKz0gJ2E9JyArXHJcbiAgICAgICAgICAgICAgKGNhbmQudHlwZSA/IGNhbmRpZGF0ZVN0cmluZyA6ICdlbmQtb2YtY2FuZGlkYXRlcycpXHJcbiAgICAgICAgICAgICAgKyAnXFxyXFxuJztcclxuICAgICAgICAgIHBjLnJlbW90ZURlc2NyaXB0aW9uLnNkcCA9XHJcbiAgICAgICAgICAgICAgU0RQVXRpbHMuZ2V0RGVzY3JpcHRpb24ocGMucmVtb3RlRGVzY3JpcHRpb24uc2RwKSArXHJcbiAgICAgICAgICAgICAgc2VjdGlvbnMuam9pbignJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiByZWplY3QobWFrZUVycm9yKCdPcGVyYXRpb25FcnJvcicsXHJcbiAgICAgICAgICAgICAgJ0NhbiBub3QgYWRkIElDRSBjYW5kaWRhdGUnKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJlc29sdmUoKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHByb21pc2VzID0gW107XHJcbiAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XHJcbiAgICAgIFsncnRwU2VuZGVyJywgJ3J0cFJlY2VpdmVyJywgJ2ljZUdhdGhlcmVyJywgJ2ljZVRyYW5zcG9ydCcsXHJcbiAgICAgICAgICAnZHRsc1RyYW5zcG9ydCddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2NlaXZlclttZXRob2RdKSB7XHJcbiAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0cmFuc2NlaXZlclttZXRob2RdLmdldFN0YXRzKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgdmFyIGZpeFN0YXRzVHlwZSA9IGZ1bmN0aW9uKHN0YXQpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBpbmJvdW5kcnRwOiAnaW5ib3VuZC1ydHAnLFxyXG4gICAgICAgIG91dGJvdW5kcnRwOiAnb3V0Ym91bmQtcnRwJyxcclxuICAgICAgICBjYW5kaWRhdGVwYWlyOiAnY2FuZGlkYXRlLXBhaXInLFxyXG4gICAgICAgIGxvY2FsY2FuZGlkYXRlOiAnbG9jYWwtY2FuZGlkYXRlJyxcclxuICAgICAgICByZW1vdGVjYW5kaWRhdGU6ICdyZW1vdGUtY2FuZGlkYXRlJ1xyXG4gICAgICB9W3N0YXQudHlwZV0gfHwgc3RhdC50eXBlO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XHJcbiAgICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcclxuICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgTWFwKCk7XHJcbiAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgICAgT2JqZWN0LmtleXMocmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFtpZF0udHlwZSA9IGZpeFN0YXRzVHlwZShyZXN1bHRbaWRdKTtcclxuICAgICAgICAgICAgcmVzdWx0cy5zZXQoaWQsIHJlc3VsdFtpZF0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAvLyBsZWdhY3kgY2FsbGJhY2sgc2hpbXMuIFNob3VsZCBiZSBtb3ZlZCB0byBhZGFwdGVyLmpzIHNvbWUgZGF5cy5cclxuICB2YXIgbWV0aG9kcyA9IFsnY3JlYXRlT2ZmZXInLCAnY3JlYXRlQW5zd2VyJ107XHJcbiAgbWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xyXG4gICAgdmFyIG5hdGl2ZU1ldGhvZCA9IFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xyXG4gICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XHJcbiAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ2Z1bmN0aW9uJyB8fFxyXG4gICAgICAgICAgdHlwZW9mIGFyZ3NbMV0gPT09ICdmdW5jdGlvbicpIHsgLy8gbGVnYWN5XHJcbiAgICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBbYXJndW1lbnRzWzJdXSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGFyZ3NbMF0uYXBwbHkobnVsbCwgW2Rlc2NyaXB0aW9uXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBhcmdzWzFdLmFwcGx5KG51bGwsIFtlcnJvcl0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIG1ldGhvZHMgPSBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ107XHJcbiAgbWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xyXG4gICAgdmFyIG5hdGl2ZU1ldGhvZCA9IFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xyXG4gICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XHJcbiAgICAgIGlmICh0eXBlb2YgYXJnc1sxXSA9PT0gJ2Z1bmN0aW9uJyB8fFxyXG4gICAgICAgICAgdHlwZW9mIGFyZ3NbMl0gPT09ICdmdW5jdGlvbicpIHsgLy8gbGVnYWN5XHJcbiAgICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMV0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgYXJnc1sxXS5hcHBseShudWxsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmdzWzJdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIGFyZ3NbMl0uYXBwbHkobnVsbCwgW2Vycm9yXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuICB9KTtcclxuXHJcbiAgLy8gZ2V0U3RhdHMgaXMgc3BlY2lhbC4gSXQgZG9lc24ndCBoYXZlIGEgc3BlYyBsZWdhY3kgbWV0aG9kIHlldCB3ZSBzdXBwb3J0XHJcbiAgLy8gZ2V0U3RhdHMoc29tZXRoaW5nLCBjYikgd2l0aG91dCBlcnJvciBjYWxsYmFja3MuXHJcbiAgWydnZXRTdGF0cyddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XHJcbiAgICB2YXIgbmF0aXZlTWV0aG9kID0gUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XHJcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgaWYgKHR5cGVvZiBhcmdzWzFdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMV0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgYXJnc1sxXS5hcHBseShudWxsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gUlRDUGVlckNvbm5lY3Rpb247XHJcbn07XHJcblxyXG59LHtcInNkcFwiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vLyBTRFAgaGVscGVycy5cclxudmFyIFNEUFV0aWxzID0ge307XHJcblxyXG4vLyBHZW5lcmF0ZSBhbiBhbHBoYW51bWVyaWMgaWRlbnRpZmllciBmb3IgY25hbWUgb3IgbWlkcy5cclxuLy8gVE9ETzogdXNlIFVVSURzIGluc3RlYWQ/IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZC85ODI4ODNcclxuU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCAxMCk7XHJcbn07XHJcblxyXG4vLyBUaGUgUlRDUCBDTkFNRSB1c2VkIGJ5IGFsbCBwZWVyY29ubmVjdGlvbnMgZnJvbSB0aGUgc2FtZSBKUy5cclxuU0RQVXRpbHMubG9jYWxDTmFtZSA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xyXG5cclxuLy8gU3BsaXRzIFNEUCBpbnRvIGxpbmVzLCBkZWFsaW5nIHdpdGggYm90aCBDUkxGIGFuZCBMRi5cclxuU0RQVXRpbHMuc3BsaXRMaW5lcyA9IGZ1bmN0aW9uKGJsb2IpIHtcclxuICByZXR1cm4gYmxvYi50cmltKCkuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XHJcbiAgICByZXR1cm4gbGluZS50cmltKCk7XHJcbiAgfSk7XHJcbn07XHJcbi8vIFNwbGl0cyBTRFAgaW50byBzZXNzaW9ucGFydCBhbmQgbWVkaWFzZWN0aW9ucy4gRW5zdXJlcyBDUkxGLlxyXG5TRFBVdGlscy5zcGxpdFNlY3Rpb25zID0gZnVuY3Rpb24oYmxvYikge1xyXG4gIHZhciBwYXJ0cyA9IGJsb2Iuc3BsaXQoJ1xcbm09Jyk7XHJcbiAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbihwYXJ0LCBpbmRleCkge1xyXG4gICAgcmV0dXJuIChpbmRleCA+IDAgPyAnbT0nICsgcGFydCA6IHBhcnQpLnRyaW0oKSArICdcXHJcXG4nO1xyXG4gIH0pO1xyXG59O1xyXG5cclxuLy8gcmV0dXJucyB0aGUgc2Vzc2lvbiBkZXNjcmlwdGlvbi5cclxuU0RQVXRpbHMuZ2V0RGVzY3JpcHRpb24gPSBmdW5jdGlvbihibG9iKSB7XHJcbiAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhibG9iKTtcclxuICByZXR1cm4gc2VjdGlvbnMgJiYgc2VjdGlvbnNbMF07XHJcbn07XHJcblxyXG4vLyByZXR1cm5zIHRoZSBpbmRpdmlkdWFsIG1lZGlhIHNlY3Rpb25zLlxyXG5TRFBVdGlscy5nZXRNZWRpYVNlY3Rpb25zID0gZnVuY3Rpb24oYmxvYikge1xyXG4gIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoYmxvYik7XHJcbiAgc2VjdGlvbnMuc2hpZnQoKTtcclxuICByZXR1cm4gc2VjdGlvbnM7XHJcbn07XHJcblxyXG4vLyBSZXR1cm5zIGxpbmVzIHRoYXQgc3RhcnQgd2l0aCBhIGNlcnRhaW4gcHJlZml4LlxyXG5TRFBVdGlscy5tYXRjaFByZWZpeCA9IGZ1bmN0aW9uKGJsb2IsIHByZWZpeCkge1xyXG4gIHJldHVybiBTRFBVdGlscy5zcGxpdExpbmVzKGJsb2IpLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XHJcbiAgICByZXR1cm4gbGluZS5pbmRleE9mKHByZWZpeCkgPT09IDA7XHJcbiAgfSk7XHJcbn07XHJcblxyXG4vLyBQYXJzZXMgYW4gSUNFIGNhbmRpZGF0ZSBsaW5lLiBTYW1wbGUgaW5wdXQ6XHJcbi8vIGNhbmRpZGF0ZTo3MDI3ODYzNTAgMiB1ZHAgNDE4MTk5MDIgOC44LjguOCA2MDc2OSB0eXAgcmVsYXkgcmFkZHIgOC44LjguOFxyXG4vLyBycG9ydCA1NTk5NlwiXHJcblNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlID0gZnVuY3Rpb24obGluZSkge1xyXG4gIHZhciBwYXJ0cztcclxuICAvLyBQYXJzZSBib3RoIHZhcmlhbnRzLlxyXG4gIGlmIChsaW5lLmluZGV4T2YoJ2E9Y2FuZGlkYXRlOicpID09PSAwKSB7XHJcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEyKS5zcGxpdCgnICcpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEwKS5zcGxpdCgnICcpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGNhbmRpZGF0ZSA9IHtcclxuICAgIGZvdW5kYXRpb246IHBhcnRzWzBdLFxyXG4gICAgY29tcG9uZW50OiBwYXJzZUludChwYXJ0c1sxXSwgMTApLFxyXG4gICAgcHJvdG9jb2w6IHBhcnRzWzJdLnRvTG93ZXJDYXNlKCksXHJcbiAgICBwcmlvcml0eTogcGFyc2VJbnQocGFydHNbM10sIDEwKSxcclxuICAgIGlwOiBwYXJ0c1s0XSxcclxuICAgIHBvcnQ6IHBhcnNlSW50KHBhcnRzWzVdLCAxMCksXHJcbiAgICAvLyBza2lwIHBhcnRzWzZdID09ICd0eXAnXHJcbiAgICB0eXBlOiBwYXJ0c1s3XVxyXG4gIH07XHJcblxyXG4gIGZvciAodmFyIGkgPSA4OyBpIDwgcGFydHMubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgIHN3aXRjaCAocGFydHNbaV0pIHtcclxuICAgICAgY2FzZSAncmFkZHInOlxyXG4gICAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyA9IHBhcnRzW2kgKyAxXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncnBvcnQnOlxyXG4gICAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCA9IHBhcnNlSW50KHBhcnRzW2kgKyAxXSwgMTApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd0Y3B0eXBlJzpcclxuICAgICAgICBjYW5kaWRhdGUudGNwVHlwZSA9IHBhcnRzW2kgKyAxXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndWZyYWcnOlxyXG4gICAgICAgIGNhbmRpZGF0ZS51ZnJhZyA9IHBhcnRzW2kgKyAxXTsgLy8gZm9yIGJhY2t3YXJkIGNvbXBhYmlsaXR5LlxyXG4gICAgICAgIGNhbmRpZGF0ZS51c2VybmFtZUZyYWdtZW50ID0gcGFydHNbaSArIDFdO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OiAvLyBleHRlbnNpb24gaGFuZGxpbmcsIGluIHBhcnRpY3VsYXIgdWZyYWdcclxuICAgICAgICBjYW5kaWRhdGVbcGFydHNbaV1dID0gcGFydHNbaSArIDFdO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gY2FuZGlkYXRlO1xyXG59O1xyXG5cclxuLy8gVHJhbnNsYXRlcyBhIGNhbmRpZGF0ZSBvYmplY3QgaW50byBTRFAgY2FuZGlkYXRlIGF0dHJpYnV0ZS5cclxuU0RQVXRpbHMud3JpdGVDYW5kaWRhdGUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcclxuICB2YXIgc2RwID0gW107XHJcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmZvdW5kYXRpb24pO1xyXG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5jb21wb25lbnQpO1xyXG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wcm90b2NvbC50b1VwcGVyQ2FzZSgpKTtcclxuICBzZHAucHVzaChjYW5kaWRhdGUucHJpb3JpdHkpO1xyXG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5pcCk7XHJcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnBvcnQpO1xyXG5cclxuICB2YXIgdHlwZSA9IGNhbmRpZGF0ZS50eXBlO1xyXG4gIHNkcC5wdXNoKCd0eXAnKTtcclxuICBzZHAucHVzaCh0eXBlKTtcclxuICBpZiAodHlwZSAhPT0gJ2hvc3QnICYmIGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyAmJlxyXG4gICAgICBjYW5kaWRhdGUucmVsYXRlZFBvcnQpIHtcclxuICAgIHNkcC5wdXNoKCdyYWRkcicpO1xyXG4gICAgc2RwLnB1c2goY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzKTsgLy8gd2FzOiByZWxBZGRyXHJcbiAgICBzZHAucHVzaCgncnBvcnQnKTtcclxuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCk7IC8vIHdhczogcmVsUG9ydFxyXG4gIH1cclxuICBpZiAoY2FuZGlkYXRlLnRjcFR5cGUgJiYgY2FuZGlkYXRlLnByb3RvY29sLnRvTG93ZXJDYXNlKCkgPT09ICd0Y3AnKSB7XHJcbiAgICBzZHAucHVzaCgndGNwdHlwZScpO1xyXG4gICAgc2RwLnB1c2goY2FuZGlkYXRlLnRjcFR5cGUpO1xyXG4gIH1cclxuICBpZiAoY2FuZGlkYXRlLnVzZXJuYW1lRnJhZ21lbnQgfHwgY2FuZGlkYXRlLnVmcmFnKSB7XHJcbiAgICBzZHAucHVzaCgndWZyYWcnKTtcclxuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS51c2VybmFtZUZyYWdtZW50IHx8IGNhbmRpZGF0ZS51ZnJhZyk7XHJcbiAgfVxyXG4gIHJldHVybiAnY2FuZGlkYXRlOicgKyBzZHAuam9pbignICcpO1xyXG59O1xyXG5cclxuLy8gUGFyc2VzIGFuIGljZS1vcHRpb25zIGxpbmUsIHJldHVybnMgYW4gYXJyYXkgb2Ygb3B0aW9uIHRhZ3MuXHJcbi8vIGE9aWNlLW9wdGlvbnM6Zm9vIGJhclxyXG5TRFBVdGlscy5wYXJzZUljZU9wdGlvbnMgPSBmdW5jdGlvbihsaW5lKSB7XHJcbiAgcmV0dXJuIGxpbmUuc3Vic3RyKDE0KS5zcGxpdCgnICcpO1xyXG59XHJcblxyXG4vLyBQYXJzZXMgYW4gcnRwbWFwIGxpbmUsIHJldHVybnMgUlRDUnRwQ29kZGVjUGFyYW1ldGVycy4gU2FtcGxlIGlucHV0OlxyXG4vLyBhPXJ0cG1hcDoxMTEgb3B1cy80ODAwMC8yXHJcblNEUFV0aWxzLnBhcnNlUnRwTWFwID0gZnVuY3Rpb24obGluZSkge1xyXG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDkpLnNwbGl0KCcgJyk7XHJcbiAgdmFyIHBhcnNlZCA9IHtcclxuICAgIHBheWxvYWRUeXBlOiBwYXJzZUludChwYXJ0cy5zaGlmdCgpLCAxMCkgLy8gd2FzOiBpZFxyXG4gIH07XHJcblxyXG4gIHBhcnRzID0gcGFydHNbMF0uc3BsaXQoJy8nKTtcclxuXHJcbiAgcGFyc2VkLm5hbWUgPSBwYXJ0c1swXTtcclxuICBwYXJzZWQuY2xvY2tSYXRlID0gcGFyc2VJbnQocGFydHNbMV0sIDEwKTsgLy8gd2FzOiBjbG9ja3JhdGVcclxuICAvLyB3YXM6IGNoYW5uZWxzXHJcbiAgcGFyc2VkLm51bUNoYW5uZWxzID0gcGFydHMubGVuZ3RoID09PSAzID8gcGFyc2VJbnQocGFydHNbMl0sIDEwKSA6IDE7XHJcbiAgcmV0dXJuIHBhcnNlZDtcclxufTtcclxuXHJcbi8vIEdlbmVyYXRlIGFuIGE9cnRwbWFwIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3JcclxuLy8gUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxyXG5TRFBVdGlscy53cml0ZVJ0cE1hcCA9IGZ1bmN0aW9uKGNvZGVjKSB7XHJcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XHJcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XHJcbiAgfVxyXG4gIHJldHVybiAnYT1ydHBtYXA6JyArIHB0ICsgJyAnICsgY29kZWMubmFtZSArICcvJyArIGNvZGVjLmNsb2NrUmF0ZSArXHJcbiAgICAgIChjb2RlYy5udW1DaGFubmVscyAhPT0gMSA/ICcvJyArIGNvZGVjLm51bUNoYW5uZWxzIDogJycpICsgJ1xcclxcbic7XHJcbn07XHJcblxyXG4vLyBQYXJzZXMgYW4gYT1leHRtYXAgbGluZSAoaGVhZGVyZXh0ZW5zaW9uIGZyb20gUkZDIDUyODUpLiBTYW1wbGUgaW5wdXQ6XHJcbi8vIGE9ZXh0bWFwOjIgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6dG9mZnNldFxyXG4vLyBhPWV4dG1hcDoyL3NlbmRvbmx5IHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnRvZmZzZXRcclxuU0RQVXRpbHMucGFyc2VFeHRtYXAgPSBmdW5jdGlvbihsaW5lKSB7XHJcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcclxuICByZXR1cm4ge1xyXG4gICAgaWQ6IHBhcnNlSW50KHBhcnRzWzBdLCAxMCksXHJcbiAgICBkaXJlY3Rpb246IHBhcnRzWzBdLmluZGV4T2YoJy8nKSA+IDAgPyBwYXJ0c1swXS5zcGxpdCgnLycpWzFdIDogJ3NlbmRyZWN2JyxcclxuICAgIHVyaTogcGFydHNbMV1cclxuICB9O1xyXG59O1xyXG5cclxuLy8gR2VuZXJhdGVzIGE9ZXh0bWFwIGxpbmUgZnJvbSBSVENSdHBIZWFkZXJFeHRlbnNpb25QYXJhbWV0ZXJzIG9yXHJcbi8vIFJUQ1J0cEhlYWRlckV4dGVuc2lvbi5cclxuU0RQVXRpbHMud3JpdGVFeHRtYXAgPSBmdW5jdGlvbihoZWFkZXJFeHRlbnNpb24pIHtcclxuICByZXR1cm4gJ2E9ZXh0bWFwOicgKyAoaGVhZGVyRXh0ZW5zaW9uLmlkIHx8IGhlYWRlckV4dGVuc2lvbi5wcmVmZXJyZWRJZCkgK1xyXG4gICAgICAoaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvbiAmJiBoZWFkZXJFeHRlbnNpb24uZGlyZWN0aW9uICE9PSAnc2VuZHJlY3YnXHJcbiAgICAgICAgICA/ICcvJyArIGhlYWRlckV4dGVuc2lvbi5kaXJlY3Rpb25cclxuICAgICAgICAgIDogJycpICtcclxuICAgICAgJyAnICsgaGVhZGVyRXh0ZW5zaW9uLnVyaSArICdcXHJcXG4nO1xyXG59O1xyXG5cclxuLy8gUGFyc2VzIGFuIGZ0bXAgbGluZSwgcmV0dXJucyBkaWN0aW9uYXJ5LiBTYW1wbGUgaW5wdXQ6XHJcbi8vIGE9Zm10cDo5NiB2YnI9b247Y25nPW9uXHJcbi8vIEFsc28gZGVhbHMgd2l0aCB2YnI9b247IGNuZz1vblxyXG5TRFBVdGlscy5wYXJzZUZtdHAgPSBmdW5jdGlvbihsaW5lKSB7XHJcbiAgdmFyIHBhcnNlZCA9IHt9O1xyXG4gIHZhciBrdjtcclxuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCc7Jyk7XHJcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBwYXJ0cy5sZW5ndGg7IGorKykge1xyXG4gICAga3YgPSBwYXJ0c1tqXS50cmltKCkuc3BsaXQoJz0nKTtcclxuICAgIHBhcnNlZFtrdlswXS50cmltKCldID0ga3ZbMV07XHJcbiAgfVxyXG4gIHJldHVybiBwYXJzZWQ7XHJcbn07XHJcblxyXG4vLyBHZW5lcmF0ZXMgYW4gYT1mdG1wIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxyXG5TRFBVdGlscy53cml0ZUZtdHAgPSBmdW5jdGlvbihjb2RlYykge1xyXG4gIHZhciBsaW5lID0gJyc7XHJcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XHJcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XHJcbiAgfVxyXG4gIGlmIChjb2RlYy5wYXJhbWV0ZXJzICYmIE9iamVjdC5rZXlzKGNvZGVjLnBhcmFtZXRlcnMpLmxlbmd0aCkge1xyXG4gICAgdmFyIHBhcmFtcyA9IFtdO1xyXG4gICAgT2JqZWN0LmtleXMoY29kZWMucGFyYW1ldGVycykuZm9yRWFjaChmdW5jdGlvbihwYXJhbSkge1xyXG4gICAgICBwYXJhbXMucHVzaChwYXJhbSArICc9JyArIGNvZGVjLnBhcmFtZXRlcnNbcGFyYW1dKTtcclxuICAgIH0pO1xyXG4gICAgbGluZSArPSAnYT1mbXRwOicgKyBwdCArICcgJyArIHBhcmFtcy5qb2luKCc7JykgKyAnXFxyXFxuJztcclxuICB9XHJcbiAgcmV0dXJuIGxpbmU7XHJcbn07XHJcblxyXG4vLyBQYXJzZXMgYW4gcnRjcC1mYiBsaW5lLCByZXR1cm5zIFJUQ1BSdGNwRmVlZGJhY2sgb2JqZWN0LiBTYW1wbGUgaW5wdXQ6XHJcbi8vIGE9cnRjcC1mYjo5OCBuYWNrIHJwc2lcclxuU0RQVXRpbHMucGFyc2VSdGNwRmIgPSBmdW5jdGlvbihsaW5lKSB7XHJcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIobGluZS5pbmRleE9mKCcgJykgKyAxKS5zcGxpdCgnICcpO1xyXG4gIHJldHVybiB7XHJcbiAgICB0eXBlOiBwYXJ0cy5zaGlmdCgpLFxyXG4gICAgcGFyYW1ldGVyOiBwYXJ0cy5qb2luKCcgJylcclxuICB9O1xyXG59O1xyXG4vLyBHZW5lcmF0ZSBhPXJ0Y3AtZmIgbGluZXMgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxyXG5TRFBVdGlscy53cml0ZVJ0Y3BGYiA9IGZ1bmN0aW9uKGNvZGVjKSB7XHJcbiAgdmFyIGxpbmVzID0gJyc7XHJcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XHJcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XHJcbiAgfVxyXG4gIGlmIChjb2RlYy5ydGNwRmVlZGJhY2sgJiYgY29kZWMucnRjcEZlZWRiYWNrLmxlbmd0aCkge1xyXG4gICAgLy8gRklYTUU6IHNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyci1pbnQ/XHJcbiAgICBjb2RlYy5ydGNwRmVlZGJhY2suZm9yRWFjaChmdW5jdGlvbihmYikge1xyXG4gICAgICBsaW5lcyArPSAnYT1ydGNwLWZiOicgKyBwdCArICcgJyArIGZiLnR5cGUgK1xyXG4gICAgICAoZmIucGFyYW1ldGVyICYmIGZiLnBhcmFtZXRlci5sZW5ndGggPyAnICcgKyBmYi5wYXJhbWV0ZXIgOiAnJykgK1xyXG4gICAgICAgICAgJ1xcclxcbic7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmV0dXJuIGxpbmVzO1xyXG59O1xyXG5cclxuLy8gUGFyc2VzIGFuIFJGQyA1NTc2IHNzcmMgbWVkaWEgYXR0cmlidXRlLiBTYW1wbGUgaW5wdXQ6XHJcbi8vIGE9c3NyYzozNzM1OTI4NTU5IGNuYW1lOnNvbWV0aGluZ1xyXG5TRFBVdGlscy5wYXJzZVNzcmNNZWRpYSA9IGZ1bmN0aW9uKGxpbmUpIHtcclxuICB2YXIgc3AgPSBsaW5lLmluZGV4T2YoJyAnKTtcclxuICB2YXIgcGFydHMgPSB7XHJcbiAgICBzc3JjOiBwYXJzZUludChsaW5lLnN1YnN0cig3LCBzcCAtIDcpLCAxMClcclxuICB9O1xyXG4gIHZhciBjb2xvbiA9IGxpbmUuaW5kZXhPZignOicsIHNwKTtcclxuICBpZiAoY29sb24gPiAtMSkge1xyXG4gICAgcGFydHMuYXR0cmlidXRlID0gbGluZS5zdWJzdHIoc3AgKyAxLCBjb2xvbiAtIHNwIC0gMSk7XHJcbiAgICBwYXJ0cy52YWx1ZSA9IGxpbmUuc3Vic3RyKGNvbG9uICsgMSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHBhcnRzLmF0dHJpYnV0ZSA9IGxpbmUuc3Vic3RyKHNwICsgMSk7XHJcbiAgfVxyXG4gIHJldHVybiBwYXJ0cztcclxufTtcclxuXHJcbi8vIEV4dHJhY3RzIHRoZSBNSUQgKFJGQyA1ODg4KSBmcm9tIGEgbWVkaWEgc2VjdGlvbi5cclxuLy8gcmV0dXJucyB0aGUgTUlEIG9yIHVuZGVmaW5lZCBpZiBubyBtaWQgbGluZSB3YXMgZm91bmQuXHJcblNEUFV0aWxzLmdldE1pZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xyXG4gIHZhciBtaWQgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPW1pZDonKVswXTtcclxuICBpZiAobWlkKSB7XHJcbiAgICByZXR1cm4gbWlkLnN1YnN0cig2KTtcclxuICB9XHJcbn1cclxuXHJcblNEUFV0aWxzLnBhcnNlRmluZ2VycHJpbnQgPSBmdW5jdGlvbihsaW5lKSB7XHJcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoMTQpLnNwbGl0KCcgJyk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGFsZ29yaXRobTogcGFydHNbMF0udG9Mb3dlckNhc2UoKSwgLy8gYWxnb3JpdGhtIGlzIGNhc2Utc2Vuc2l0aXZlIGluIEVkZ2UuXHJcbiAgICB2YWx1ZTogcGFydHNbMV1cclxuICB9O1xyXG59O1xyXG5cclxuLy8gRXh0cmFjdHMgRFRMUyBwYXJhbWV0ZXJzIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXHJcbi8vIEZJWE1FOiBmb3IgY29uc2lzdGVuY3kgd2l0aCBvdGhlciBmdW5jdGlvbnMgdGhpcyBzaG91bGQgb25seVxyXG4vLyAgIGdldCB0aGUgZmluZ2VycHJpbnQgbGluZSBhcyBpbnB1dC4gU2VlIGFsc28gZ2V0SWNlUGFyYW1ldGVycy5cclxuU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XHJcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uICsgc2Vzc2lvbnBhcnQsXHJcbiAgICAgICdhPWZpbmdlcnByaW50OicpO1xyXG4gIC8vIE5vdGU6IGE9c2V0dXAgbGluZSBpcyBpZ25vcmVkIHNpbmNlIHdlIHVzZSB0aGUgJ2F1dG8nIHJvbGUuXHJcbiAgLy8gTm90ZTI6ICdhbGdvcml0aG0nIGlzIG5vdCBjYXNlIHNlbnNpdGl2ZSBleGNlcHQgaW4gRWRnZS5cclxuICByZXR1cm4ge1xyXG4gICAgcm9sZTogJ2F1dG8nLFxyXG4gICAgZmluZ2VycHJpbnRzOiBsaW5lcy5tYXAoU0RQVXRpbHMucGFyc2VGaW5nZXJwcmludClcclxuICB9O1xyXG59O1xyXG5cclxuLy8gU2VyaWFsaXplcyBEVExTIHBhcmFtZXRlcnMgdG8gU0RQLlxyXG5TRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zLCBzZXR1cFR5cGUpIHtcclxuICB2YXIgc2RwID0gJ2E9c2V0dXA6JyArIHNldHVwVHlwZSArICdcXHJcXG4nO1xyXG4gIHBhcmFtcy5maW5nZXJwcmludHMuZm9yRWFjaChmdW5jdGlvbihmcCkge1xyXG4gICAgc2RwICs9ICdhPWZpbmdlcnByaW50OicgKyBmcC5hbGdvcml0aG0gKyAnICcgKyBmcC52YWx1ZSArICdcXHJcXG4nO1xyXG4gIH0pO1xyXG4gIHJldHVybiBzZHA7XHJcbn07XHJcbi8vIFBhcnNlcyBJQ0UgaW5mb3JtYXRpb24gZnJvbSBTRFAgbWVkaWEgc2VjdGlvbiBvciBzZXNzaW9ucGFydC5cclxuLy8gRklYTUU6IGZvciBjb25zaXN0ZW5jeSB3aXRoIG90aGVyIGZ1bmN0aW9ucyB0aGlzIHNob3VsZCBvbmx5XHJcbi8vICAgZ2V0IHRoZSBpY2UtdWZyYWcgYW5kIGljZS1wd2QgbGluZXMgYXMgaW5wdXQuXHJcblNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XHJcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xyXG4gIC8vIFNlYXJjaCBpbiBzZXNzaW9uIHBhcnQsIHRvby5cclxuICBsaW5lcyA9IGxpbmVzLmNvbmNhdChTRFBVdGlscy5zcGxpdExpbmVzKHNlc3Npb25wYXJ0KSk7XHJcbiAgdmFyIGljZVBhcmFtZXRlcnMgPSB7XHJcbiAgICB1c2VybmFtZUZyYWdtZW50OiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xyXG4gICAgICByZXR1cm4gbGluZS5pbmRleE9mKCdhPWljZS11ZnJhZzonKSA9PT0gMDtcclxuICAgIH0pWzBdLnN1YnN0cigxMiksXHJcbiAgICBwYXNzd29yZDogbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcclxuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtcHdkOicpID09PSAwO1xyXG4gICAgfSlbMF0uc3Vic3RyKDEwKVxyXG4gIH07XHJcbiAgcmV0dXJuIGljZVBhcmFtZXRlcnM7XHJcbn07XHJcblxyXG4vLyBTZXJpYWxpemVzIElDRSBwYXJhbWV0ZXJzIHRvIFNEUC5cclxuU0RQVXRpbHMud3JpdGVJY2VQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgcmV0dXJuICdhPWljZS11ZnJhZzonICsgcGFyYW1zLnVzZXJuYW1lRnJhZ21lbnQgKyAnXFxyXFxuJyArXHJcbiAgICAgICdhPWljZS1wd2Q6JyArIHBhcmFtcy5wYXNzd29yZCArICdcXHJcXG4nO1xyXG59O1xyXG5cclxuLy8gUGFyc2VzIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBhbmQgcmV0dXJucyBSVENSdHBQYXJhbWV0ZXJzLlxyXG5TRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcclxuICB2YXIgZGVzY3JpcHRpb24gPSB7XHJcbiAgICBjb2RlY3M6IFtdLFxyXG4gICAgaGVhZGVyRXh0ZW5zaW9uczogW10sXHJcbiAgICBmZWNNZWNoYW5pc21zOiBbXSxcclxuICAgIHJ0Y3A6IFtdXHJcbiAgfTtcclxuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XHJcbiAgdmFyIG1saW5lID0gbGluZXNbMF0uc3BsaXQoJyAnKTtcclxuICBmb3IgKHZhciBpID0gMzsgaSA8IG1saW5lLmxlbmd0aDsgaSsrKSB7IC8vIGZpbmQgYWxsIGNvZGVjcyBmcm9tIG1saW5lWzMuLl1cclxuICAgIHZhciBwdCA9IG1saW5lW2ldO1xyXG4gICAgdmFyIHJ0cG1hcGxpbmUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcclxuICAgICAgICBtZWRpYVNlY3Rpb24sICdhPXJ0cG1hcDonICsgcHQgKyAnICcpWzBdO1xyXG4gICAgaWYgKHJ0cG1hcGxpbmUpIHtcclxuICAgICAgdmFyIGNvZGVjID0gU0RQVXRpbHMucGFyc2VSdHBNYXAocnRwbWFwbGluZSk7XHJcbiAgICAgIHZhciBmbXRwcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxyXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1mbXRwOicgKyBwdCArICcgJyk7XHJcbiAgICAgIC8vIE9ubHkgdGhlIGZpcnN0IGE9Zm10cDo8cHQ+IGlzIGNvbnNpZGVyZWQuXHJcbiAgICAgIGNvZGVjLnBhcmFtZXRlcnMgPSBmbXRwcy5sZW5ndGggPyBTRFBVdGlscy5wYXJzZUZtdHAoZm10cHNbMF0pIDoge307XHJcbiAgICAgIGNvZGVjLnJ0Y3BGZWVkYmFjayA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxyXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1ydGNwLWZiOicgKyBwdCArICcgJylcclxuICAgICAgICAubWFwKFNEUFV0aWxzLnBhcnNlUnRjcEZiKTtcclxuICAgICAgZGVzY3JpcHRpb24uY29kZWNzLnB1c2goY29kZWMpO1xyXG4gICAgICAvLyBwYXJzZSBGRUMgbWVjaGFuaXNtcyBmcm9tIHJ0cG1hcCBsaW5lcy5cclxuICAgICAgc3dpdGNoIChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkpIHtcclxuICAgICAgICBjYXNlICdSRUQnOlxyXG4gICAgICAgIGNhc2UgJ1VMUEZFQyc6XHJcbiAgICAgICAgICBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLnB1c2goY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6IC8vIG9ubHkgUkVEIGFuZCBVTFBGRUMgYXJlIHJlY29nbml6ZWQgYXMgRkVDIG1lY2hhbmlzbXMuXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWV4dG1hcDonKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcclxuICAgIGRlc2NyaXB0aW9uLmhlYWRlckV4dGVuc2lvbnMucHVzaChTRFBVdGlscy5wYXJzZUV4dG1hcChsaW5lKSk7XHJcbiAgfSk7XHJcbiAgLy8gRklYTUU6IHBhcnNlIHJ0Y3AuXHJcbiAgcmV0dXJuIGRlc2NyaXB0aW9uO1xyXG59O1xyXG5cclxuLy8gR2VuZXJhdGVzIHBhcnRzIG9mIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBkZXNjcmliaW5nIHRoZSBjYXBhYmlsaXRpZXMgL1xyXG4vLyBwYXJhbWV0ZXJzLlxyXG5TRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uID0gZnVuY3Rpb24oa2luZCwgY2Fwcykge1xyXG4gIHZhciBzZHAgPSAnJztcclxuXHJcbiAgLy8gQnVpbGQgdGhlIG1saW5lLlxyXG4gIHNkcCArPSAnbT0nICsga2luZCArICcgJztcclxuICBzZHAgKz0gY2Fwcy5jb2RlY3MubGVuZ3RoID4gMCA/ICc5JyA6ICcwJzsgLy8gcmVqZWN0IGlmIG5vIGNvZGVjcy5cclxuICBzZHAgKz0gJyBVRFAvVExTL1JUUC9TQVZQRiAnO1xyXG4gIHNkcCArPSBjYXBzLmNvZGVjcy5tYXAoZnVuY3Rpb24oY29kZWMpIHtcclxuICAgIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybiBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcclxuICAgIH1cclxuICAgIHJldHVybiBjb2RlYy5wYXlsb2FkVHlwZTtcclxuICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcclxuXHJcbiAgc2RwICs9ICdjPUlOIElQNCAwLjAuMC4wXFxyXFxuJztcclxuICBzZHAgKz0gJ2E9cnRjcDo5IElOIElQNCAwLjAuMC4wXFxyXFxuJztcclxuXHJcbiAgLy8gQWRkIGE9cnRwbWFwIGxpbmVzIGZvciBlYWNoIGNvZGVjLiBBbHNvIGZtdHAgYW5kIHJ0Y3AtZmIuXHJcbiAgY2Fwcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xyXG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRwTWFwKGNvZGVjKTtcclxuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZUZtdHAoY29kZWMpO1xyXG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRjcEZiKGNvZGVjKTtcclxuICB9KTtcclxuICB2YXIgbWF4cHRpbWUgPSAwO1xyXG4gIGNhcHMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcclxuICAgIGlmIChjb2RlYy5tYXhwdGltZSA+IG1heHB0aW1lKSB7XHJcbiAgICAgIG1heHB0aW1lID0gY29kZWMubWF4cHRpbWU7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgaWYgKG1heHB0aW1lID4gMCkge1xyXG4gICAgc2RwICs9ICdhPW1heHB0aW1lOicgKyBtYXhwdGltZSArICdcXHJcXG4nO1xyXG4gIH1cclxuICBzZHAgKz0gJ2E9cnRjcC1tdXhcXHJcXG4nO1xyXG5cclxuICBjYXBzLmhlYWRlckV4dGVuc2lvbnMuZm9yRWFjaChmdW5jdGlvbihleHRlbnNpb24pIHtcclxuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZUV4dG1hcChleHRlbnNpb24pO1xyXG4gIH0pO1xyXG4gIC8vIEZJWE1FOiB3cml0ZSBmZWNNZWNoYW5pc21zLlxyXG4gIHJldHVybiBzZHA7XHJcbn07XHJcblxyXG4vLyBQYXJzZXMgdGhlIFNEUCBtZWRpYSBzZWN0aW9uIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mXHJcbi8vIFJUQ1J0cEVuY29kaW5nUGFyYW1ldGVycy5cclxuU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcclxuICB2YXIgZW5jb2RpbmdQYXJhbWV0ZXJzID0gW107XHJcbiAgdmFyIGRlc2NyaXB0aW9uID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XHJcbiAgdmFyIGhhc1JlZCA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignUkVEJykgIT09IC0xO1xyXG4gIHZhciBoYXNVbHBmZWMgPSBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLmluZGV4T2YoJ1VMUEZFQycpICE9PSAtMTtcclxuXHJcbiAgLy8gZmlsdGVyIGE9c3NyYzouLi4gY25hbWU6LCBpZ25vcmUgUGxhbkItbXNpZFxyXG4gIHZhciBzc3JjcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxyXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xyXG4gICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xyXG4gIH0pXHJcbiAgLmZpbHRlcihmdW5jdGlvbihwYXJ0cykge1xyXG4gICAgcmV0dXJuIHBhcnRzLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcclxuICB9KTtcclxuICB2YXIgcHJpbWFyeVNzcmMgPSBzc3Jjcy5sZW5ndGggPiAwICYmIHNzcmNzWzBdLnNzcmM7XHJcbiAgdmFyIHNlY29uZGFyeVNzcmM7XHJcblxyXG4gIHZhciBmbG93cyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYy1ncm91cDpGSUQnKVxyXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xyXG4gICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnICcpO1xyXG4gICAgcGFydHMuc2hpZnQoKTtcclxuICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCkge1xyXG4gICAgICByZXR1cm4gcGFyc2VJbnQocGFydCwgMTApO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcbiAgaWYgKGZsb3dzLmxlbmd0aCA+IDAgJiYgZmxvd3NbMF0ubGVuZ3RoID4gMSAmJiBmbG93c1swXVswXSA9PT0gcHJpbWFyeVNzcmMpIHtcclxuICAgIHNlY29uZGFyeVNzcmMgPSBmbG93c1swXVsxXTtcclxuICB9XHJcblxyXG4gIGRlc2NyaXB0aW9uLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XHJcbiAgICBpZiAoY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnUlRYJyAmJiBjb2RlYy5wYXJhbWV0ZXJzLmFwdCkge1xyXG4gICAgICB2YXIgZW5jUGFyYW0gPSB7XHJcbiAgICAgICAgc3NyYzogcHJpbWFyeVNzcmMsXHJcbiAgICAgICAgY29kZWNQYXlsb2FkVHlwZTogcGFyc2VJbnQoY29kZWMucGFyYW1ldGVycy5hcHQsIDEwKSxcclxuICAgICAgICBydHg6IHtcclxuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmNcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKGVuY1BhcmFtKTtcclxuICAgICAgaWYgKGhhc1JlZCkge1xyXG4gICAgICAgIGVuY1BhcmFtID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShlbmNQYXJhbSkpO1xyXG4gICAgICAgIGVuY1BhcmFtLmZlYyA9IHtcclxuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmMsXHJcbiAgICAgICAgICBtZWNoYW5pc206IGhhc1VscGZlYyA/ICdyZWQrdWxwZmVjJyA6ICdyZWQnXHJcbiAgICAgICAgfTtcclxuICAgICAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaChlbmNQYXJhbSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuICBpZiAoZW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMCAmJiBwcmltYXJ5U3NyYykge1xyXG4gICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goe1xyXG4gICAgICBzc3JjOiBwcmltYXJ5U3NyY1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyB3ZSBzdXBwb3J0IGJvdGggYj1BUyBhbmQgYj1USUFTIGJ1dCBpbnRlcnByZXQgQVMgYXMgVElBUy5cclxuICB2YXIgYmFuZHdpZHRoID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYj0nKTtcclxuICBpZiAoYmFuZHdpZHRoLmxlbmd0aCkge1xyXG4gICAgaWYgKGJhbmR3aWR0aFswXS5pbmRleE9mKCdiPVRJQVM6JykgPT09IDApIHtcclxuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig3KSwgMTApO1xyXG4gICAgfSBlbHNlIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1BUzonKSA9PT0gMCkge1xyXG4gICAgICAvLyB1c2UgZm9ybXVsYSBmcm9tIEpTRVAgdG8gY29udmVydCBiPUFTIHRvIFRJQVMgdmFsdWUuXHJcbiAgICAgIGJhbmR3aWR0aCA9IHBhcnNlSW50KGJhbmR3aWR0aFswXS5zdWJzdHIoNSksIDEwKSAqIDEwMDAgKiAwLjk1XHJcbiAgICAgICAgICAtICg1MCAqIDQwICogOCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBiYW5kd2lkdGggPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgICAgcGFyYW1zLm1heEJpdHJhdGUgPSBiYW5kd2lkdGg7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmV0dXJuIGVuY29kaW5nUGFyYW1ldGVycztcclxufTtcclxuXHJcbi8vIHBhcnNlcyBodHRwOi8vZHJhZnQub3J0Yy5vcmcvI3J0Y3J0Y3BwYXJhbWV0ZXJzKlxyXG5TRFBVdGlscy5wYXJzZVJ0Y3BQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XHJcbiAgdmFyIHJ0Y3BQYXJhbWV0ZXJzID0ge307XHJcblxyXG4gIHZhciBjbmFtZTtcclxuICAvLyBHZXRzIHRoZSBmaXJzdCBTU1JDLiBOb3RlIHRoYXQgd2l0aCBSVFggdGhlcmUgbWlnaHQgYmUgbXVsdGlwbGVcclxuICAvLyBTU1JDcy5cclxuICB2YXIgcmVtb3RlU3NyYyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxyXG4gICAgICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcclxuICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgICAgcmV0dXJuIG9iai5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XHJcbiAgICAgIH0pWzBdO1xyXG4gIGlmIChyZW1vdGVTc3JjKSB7XHJcbiAgICBydGNwUGFyYW1ldGVycy5jbmFtZSA9IHJlbW90ZVNzcmMudmFsdWU7XHJcbiAgICBydGNwUGFyYW1ldGVycy5zc3JjID0gcmVtb3RlU3NyYy5zc3JjO1xyXG4gIH1cclxuXHJcbiAgLy8gRWRnZSB1c2VzIHRoZSBjb21wb3VuZCBhdHRyaWJ1dGUgaW5zdGVhZCBvZiByZWR1Y2VkU2l6ZVxyXG4gIC8vIGNvbXBvdW5kIGlzICFyZWR1Y2VkU2l6ZVxyXG4gIHZhciByc2l6ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1yc2l6ZScpO1xyXG4gIHJ0Y3BQYXJhbWV0ZXJzLnJlZHVjZWRTaXplID0gcnNpemUubGVuZ3RoID4gMDtcclxuICBydGNwUGFyYW1ldGVycy5jb21wb3VuZCA9IHJzaXplLmxlbmd0aCA9PT0gMDtcclxuXHJcbiAgLy8gcGFyc2VzIHRoZSBydGNwLW11eCBhdHRy0ZZidXRlLlxyXG4gIC8vIE5vdGUgdGhhdCBFZGdlIGRvZXMgbm90IHN1cHBvcnQgdW5tdXhlZCBSVENQLlxyXG4gIHZhciBtdXggPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXJ0Y3AtbXV4Jyk7XHJcbiAgcnRjcFBhcmFtZXRlcnMubXV4ID0gbXV4Lmxlbmd0aCA+IDA7XHJcblxyXG4gIHJldHVybiBydGNwUGFyYW1ldGVycztcclxufTtcclxuXHJcbi8vIHBhcnNlcyBlaXRoZXIgYT1tc2lkOiBvciBhPXNzcmM6Li4uIG1zaWQgbGluZXMgYW5kIHJldHVybnNcclxuLy8gdGhlIGlkIG9mIHRoZSBNZWRpYVN0cmVhbSBhbmQgTWVkaWFTdHJlYW1UcmFjay5cclxuU0RQVXRpbHMucGFyc2VNc2lkID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XHJcbiAgdmFyIHBhcnRzO1xyXG4gIHZhciBzcGVjID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1tc2lkOicpO1xyXG4gIGlmIChzcGVjLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgcGFydHMgPSBzcGVjWzBdLnN1YnN0cig3KS5zcGxpdCgnICcpO1xyXG4gICAgcmV0dXJuIHtzdHJlYW06IHBhcnRzWzBdLCB0cmFjazogcGFydHNbMV19O1xyXG4gIH1cclxuICB2YXIgcGxhbkIgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcclxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcclxuICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcclxuICB9KVxyXG4gIC5maWx0ZXIoZnVuY3Rpb24ocGFydHMpIHtcclxuICAgIHJldHVybiBwYXJ0cy5hdHRyaWJ1dGUgPT09ICdtc2lkJztcclxuICB9KTtcclxuICBpZiAocGxhbkIubGVuZ3RoID4gMCkge1xyXG4gICAgcGFydHMgPSBwbGFuQlswXS52YWx1ZS5zcGxpdCgnICcpO1xyXG4gICAgcmV0dXJuIHtzdHJlYW06IHBhcnRzWzBdLCB0cmFjazogcGFydHNbMV19O1xyXG4gIH1cclxufTtcclxuXHJcbi8vIEdlbmVyYXRlIGEgc2Vzc2lvbiBJRCBmb3IgU0RQLlxyXG4vLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaWV0Zi1ydGN3ZWItanNlcC0yMCNzZWN0aW9uLTUuMi4xXHJcbi8vIHJlY29tbWVuZHMgdXNpbmcgYSBjcnlwdG9ncmFwaGljYWxseSByYW5kb20gK3ZlIDY0LWJpdCB2YWx1ZVxyXG4vLyBidXQgcmlnaHQgbm93IHRoaXMgc2hvdWxkIGJlIGFjY2VwdGFibGUgYW5kIHdpdGhpbiB0aGUgcmlnaHQgcmFuZ2VcclxuU0RQVXRpbHMuZ2VuZXJhdGVTZXNzaW9uSWQgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygpLnN1YnN0cigyLCAyMSk7XHJcbn07XHJcblxyXG4vLyBXcml0ZSBib2lsZGVyIHBsYXRlIGZvciBzdGFydCBvZiBTRFBcclxuLy8gc2Vzc0lkIGFyZ3VtZW50IGlzIG9wdGlvbmFsIC0gaWYgbm90IHN1cHBsaWVkIGl0IHdpbGxcclxuLy8gYmUgZ2VuZXJhdGVkIHJhbmRvbWx5XHJcbi8vIHNlc3NWZXJzaW9uIGlzIG9wdGlvbmFsIGFuZCBkZWZhdWx0cyB0byAyXHJcblNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlID0gZnVuY3Rpb24oc2Vzc0lkLCBzZXNzVmVyKSB7XHJcbiAgdmFyIHNlc3Npb25JZDtcclxuICB2YXIgdmVyc2lvbiA9IHNlc3NWZXIgIT09IHVuZGVmaW5lZCA/IHNlc3NWZXIgOiAyO1xyXG4gIGlmIChzZXNzSWQpIHtcclxuICAgIHNlc3Npb25JZCA9IHNlc3NJZDtcclxuICB9IGVsc2Uge1xyXG4gICAgc2Vzc2lvbklkID0gU0RQVXRpbHMuZ2VuZXJhdGVTZXNzaW9uSWQoKTtcclxuICB9XHJcbiAgLy8gRklYTUU6IHNlc3MtaWQgc2hvdWxkIGJlIGFuIE5UUCB0aW1lc3RhbXAuXHJcbiAgcmV0dXJuICd2PTBcXHJcXG4nICtcclxuICAgICAgJ289dGhpc2lzYWRhcHRlcm9ydGMgJyArIHNlc3Npb25JZCArICcgJyArIHZlcnNpb24gKyAnIElOIElQNCAxMjcuMC4wLjFcXHJcXG4nICtcclxuICAgICAgJ3M9LVxcclxcbicgK1xyXG4gICAgICAndD0wIDBcXHJcXG4nO1xyXG59O1xyXG5cclxuU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24gPSBmdW5jdGlvbih0cmFuc2NlaXZlciwgY2FwcywgdHlwZSwgc3RyZWFtKSB7XHJcbiAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24odHJhbnNjZWl2ZXIua2luZCwgY2Fwcyk7XHJcblxyXG4gIC8vIE1hcCBJQ0UgcGFyYW1ldGVycyAodWZyYWcsIHB3ZCkgdG8gU0RQLlxyXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMoXHJcbiAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmdldExvY2FsUGFyYW1ldGVycygpKTtcclxuXHJcbiAgLy8gTWFwIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXHJcbiAgc2RwICs9IFNEUFV0aWxzLndyaXRlRHRsc1BhcmFtZXRlcnMoXHJcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuZ2V0TG9jYWxQYXJhbWV0ZXJzKCksXHJcbiAgICAgIHR5cGUgPT09ICdvZmZlcicgPyAnYWN0cGFzcycgOiAnYWN0aXZlJyk7XHJcblxyXG4gIHNkcCArPSAnYT1taWQ6JyArIHRyYW5zY2VpdmVyLm1pZCArICdcXHJcXG4nO1xyXG5cclxuICBpZiAodHJhbnNjZWl2ZXIuZGlyZWN0aW9uKSB7XHJcbiAgICBzZHAgKz0gJ2E9JyArIHRyYW5zY2VpdmVyLmRpcmVjdGlvbiArICdcXHJcXG4nO1xyXG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XHJcbiAgICBzZHAgKz0gJ2E9c2VuZHJlY3ZcXHJcXG4nO1xyXG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XHJcbiAgICBzZHAgKz0gJ2E9c2VuZG9ubHlcXHJcXG4nO1xyXG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcclxuICAgIHNkcCArPSAnYT1yZWN2b25seVxcclxcbic7XHJcbiAgfSBlbHNlIHtcclxuICAgIHNkcCArPSAnYT1pbmFjdGl2ZVxcclxcbic7XHJcbiAgfVxyXG5cclxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XHJcbiAgICAvLyBzcGVjLlxyXG4gICAgdmFyIG1zaWQgPSAnbXNpZDonICsgc3RyZWFtLmlkICsgJyAnICtcclxuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIudHJhY2suaWQgKyAnXFxyXFxuJztcclxuICAgIHNkcCArPSAnYT0nICsgbXNpZDtcclxuXHJcbiAgICAvLyBmb3IgQ2hyb21lLlxyXG4gICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXHJcbiAgICAgICAgJyAnICsgbXNpZDtcclxuICAgIGlmICh0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eCkge1xyXG4gICAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHguc3NyYyArXHJcbiAgICAgICAgICAnICcgKyBtc2lkO1xyXG4gICAgICBzZHAgKz0gJ2E9c3NyYy1ncm91cDpGSUQgJyArXHJcbiAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgKyAnICcgK1xyXG4gICAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHguc3NyYyArXHJcbiAgICAgICAgICAnXFxyXFxuJztcclxuICAgIH1cclxuICB9XHJcbiAgLy8gRklYTUU6IHRoaXMgc2hvdWxkIGJlIHdyaXR0ZW4gYnkgd3JpdGVSdHBEZXNjcmlwdGlvbi5cclxuICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICtcclxuICAgICAgJyBjbmFtZTonICsgU0RQVXRpbHMubG9jYWxDTmFtZSArICdcXHJcXG4nO1xyXG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcclxuICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcclxuICAgICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XHJcbiAgfVxyXG4gIHJldHVybiBzZHA7XHJcbn07XHJcblxyXG4vLyBHZXRzIHRoZSBkaXJlY3Rpb24gZnJvbSB0aGUgbWVkaWFTZWN0aW9uIG9yIHRoZSBzZXNzaW9ucGFydC5cclxuU0RQVXRpbHMuZ2V0RGlyZWN0aW9uID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xyXG4gIC8vIExvb2sgZm9yIHNlbmRyZWN2LCBzZW5kb25seSwgcmVjdm9ubHksIGluYWN0aXZlLCBkZWZhdWx0IHRvIHNlbmRyZWN2LlxyXG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBzd2l0Y2ggKGxpbmVzW2ldKSB7XHJcbiAgICAgIGNhc2UgJ2E9c2VuZHJlY3YnOlxyXG4gICAgICBjYXNlICdhPXNlbmRvbmx5JzpcclxuICAgICAgY2FzZSAnYT1yZWN2b25seSc6XHJcbiAgICAgIGNhc2UgJ2E9aW5hY3RpdmUnOlxyXG4gICAgICAgIHJldHVybiBsaW5lc1tpXS5zdWJzdHIoMik7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgLy8gRklYTUU6IFdoYXQgc2hvdWxkIGhhcHBlbiBoZXJlP1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoc2Vzc2lvbnBhcnQpIHtcclxuICAgIHJldHVybiBTRFBVdGlscy5nZXREaXJlY3Rpb24oc2Vzc2lvbnBhcnQpO1xyXG4gIH1cclxuICByZXR1cm4gJ3NlbmRyZWN2JztcclxufTtcclxuXHJcblNEUFV0aWxzLmdldEtpbmQgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcclxuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XHJcbiAgdmFyIG1saW5lID0gbGluZXNbMF0uc3BsaXQoJyAnKTtcclxuICByZXR1cm4gbWxpbmVbMF0uc3Vic3RyKDIpO1xyXG59O1xyXG5cclxuU0RQVXRpbHMuaXNSZWplY3RlZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xyXG4gIHJldHVybiBtZWRpYVNlY3Rpb24uc3BsaXQoJyAnLCAyKVsxXSA9PT0gJzAnO1xyXG59O1xyXG5cclxuU0RQVXRpbHMucGFyc2VNTGluZSA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xyXG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcclxuICB2YXIgcGFydHMgPSBsaW5lc1swXS5zdWJzdHIoMikuc3BsaXQoJyAnKTtcclxuICByZXR1cm4ge1xyXG4gICAga2luZDogcGFydHNbMF0sXHJcbiAgICBwb3J0OiBwYXJzZUludChwYXJ0c1sxXSwgMTApLFxyXG4gICAgcHJvdG9jb2w6IHBhcnRzWzJdLFxyXG4gICAgZm10OiBwYXJ0cy5zbGljZSgzKS5qb2luKCcgJylcclxuICB9O1xyXG59O1xyXG5cclxuU0RQVXRpbHMucGFyc2VPTGluZSA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xyXG4gIHZhciBsaW5lID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnbz0nKVswXTtcclxuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cigyKS5zcGxpdCgnICcpO1xyXG4gIHJldHVybiB7XHJcbiAgICB1c2VybmFtZTogcGFydHNbMF0sXHJcbiAgICBzZXNzaW9uSWQ6IHBhcnRzWzFdLFxyXG4gICAgc2Vzc2lvblZlcnNpb246IHBhcnNlSW50KHBhcnRzWzJdLCAxMCksXHJcbiAgICBuZXRUeXBlOiBwYXJ0c1szXSxcclxuICAgIGFkZHJlc3NUeXBlOiBwYXJ0c1s0XSxcclxuICAgIGFkZHJlc3M6IHBhcnRzWzVdLFxyXG4gIH07XHJcbn1cclxuXHJcbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cclxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBTRFBVdGlscztcclxufVxyXG5cclxufSx7fV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbihmdW5jdGlvbiAoZ2xvYmFsKXtcclxuLypcclxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcclxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxyXG4gKiAgdHJlZS5cclxuICovXHJcbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBhZGFwdGVyRmFjdG9yeSA9IHJlcXVpcmUoJy4vYWRhcHRlcl9mYWN0b3J5LmpzJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gYWRhcHRlckZhY3Rvcnkoe3dpbmRvdzogZ2xvYmFsLndpbmRvd30pO1xyXG5cclxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXHJcbn0se1wiLi9hZGFwdGVyX2ZhY3RvcnkuanNcIjo0fV0sNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbi8qXHJcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXHJcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcclxuICogIHRyZWUuXHJcbiAqL1xyXG4gLyogZXNsaW50LWVudiBub2RlICovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcbi8vIFNoaW1taW5nIHN0YXJ0cyBoZXJlLlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRlcGVuZGVuY2llcywgb3B0cykge1xyXG4gIHZhciB3aW5kb3cgPSBkZXBlbmRlbmNpZXMgJiYgZGVwZW5kZW5jaWVzLndpbmRvdztcclxuXHJcbiAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICBzaGltQ2hyb21lOiB0cnVlLFxyXG4gICAgc2hpbUZpcmVmb3g6IHRydWUsXHJcbiAgICBzaGltRWRnZTogdHJ1ZSxcclxuICAgIHNoaW1TYWZhcmk6IHRydWUsXHJcbiAgfTtcclxuXHJcbiAgZm9yICh2YXIga2V5IGluIG9wdHMpIHtcclxuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdHMsIGtleSkpIHtcclxuICAgICAgb3B0aW9uc1trZXldID0gb3B0c1trZXldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVXRpbHMuXHJcbiAgdmFyIGxvZ2dpbmcgPSB1dGlscy5sb2c7XHJcbiAgdmFyIGJyb3dzZXJEZXRhaWxzID0gdXRpbHMuZGV0ZWN0QnJvd3Nlcih3aW5kb3cpO1xyXG5cclxuICAvLyBVbmNvbW1lbnQgdGhlIGxpbmUgYmVsb3cgaWYgeW91IHdhbnQgbG9nZ2luZyB0byBvY2N1ciwgaW5jbHVkaW5nIGxvZ2dpbmdcclxuICAvLyBmb3IgdGhlIHN3aXRjaCBzdGF0ZW1lbnQgYmVsb3cuIENhbiBhbHNvIGJlIHR1cm5lZCBvbiBpbiB0aGUgYnJvd3NlciB2aWFcclxuICAvLyBhZGFwdGVyLmRpc2FibGVMb2coZmFsc2UpLCBidXQgdGhlbiBsb2dnaW5nIGZyb20gdGhlIHN3aXRjaCBzdGF0ZW1lbnQgYmVsb3dcclxuICAvLyB3aWxsIG5vdCBhcHBlYXIuXHJcbiAgLy8gcmVxdWlyZSgnLi91dGlscycpLmRpc2FibGVMb2coZmFsc2UpO1xyXG5cclxuICAvLyBCcm93c2VyIHNoaW1zLlxyXG4gIHZhciBjaHJvbWVTaGltID0gcmVxdWlyZSgnLi9jaHJvbWUvY2hyb21lX3NoaW0nKSB8fCBudWxsO1xyXG4gIHZhciBlZGdlU2hpbSA9IHJlcXVpcmUoJy4vZWRnZS9lZGdlX3NoaW0nKSB8fCBudWxsO1xyXG4gIHZhciBmaXJlZm94U2hpbSA9IHJlcXVpcmUoJy4vZmlyZWZveC9maXJlZm94X3NoaW0nKSB8fCBudWxsO1xyXG4gIHZhciBzYWZhcmlTaGltID0gcmVxdWlyZSgnLi9zYWZhcmkvc2FmYXJpX3NoaW0nKSB8fCBudWxsO1xyXG4gIHZhciBjb21tb25TaGltID0gcmVxdWlyZSgnLi9jb21tb25fc2hpbScpIHx8IG51bGw7XHJcblxyXG4gIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXHJcbiAgdmFyIGFkYXB0ZXIgPSB7XHJcbiAgICBicm93c2VyRGV0YWlsczogYnJvd3NlckRldGFpbHMsXHJcbiAgICBjb21tb25TaGltOiBjb21tb25TaGltLFxyXG4gICAgZXh0cmFjdFZlcnNpb246IHV0aWxzLmV4dHJhY3RWZXJzaW9uLFxyXG4gICAgZGlzYWJsZUxvZzogdXRpbHMuZGlzYWJsZUxvZyxcclxuICAgIGRpc2FibGVXYXJuaW5nczogdXRpbHMuZGlzYWJsZVdhcm5pbmdzXHJcbiAgfTtcclxuXHJcbiAgLy8gU2hpbSBicm93c2VyIGlmIGZvdW5kLlxyXG4gIHN3aXRjaCAoYnJvd3NlckRldGFpbHMuYnJvd3Nlcikge1xyXG4gICAgY2FzZSAnY2hyb21lJzpcclxuICAgICAgaWYgKCFjaHJvbWVTaGltIHx8ICFjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbiB8fFxyXG4gICAgICAgICAgIW9wdGlvbnMuc2hpbUNocm9tZSkge1xyXG4gICAgICAgIGxvZ2dpbmcoJ0Nocm9tZSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcclxuICAgICAgICByZXR1cm4gYWRhcHRlcjtcclxuICAgICAgfVxyXG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGNocm9tZS4nKTtcclxuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cclxuICAgICAgYWRhcHRlci5icm93c2VyU2hpbSA9IGNocm9tZVNoaW07XHJcbiAgICAgIGNvbW1vblNoaW0uc2hpbUNyZWF0ZU9iamVjdFVSTCh3aW5kb3cpO1xyXG5cclxuICAgICAgY2hyb21lU2hpbS5zaGltR2V0VXNlck1lZGlhKHdpbmRvdyk7XHJcbiAgICAgIGNocm9tZVNoaW0uc2hpbU1lZGlhU3RyZWFtKHdpbmRvdyk7XHJcbiAgICAgIGNocm9tZVNoaW0uc2hpbVNvdXJjZU9iamVjdCh3aW5kb3cpO1xyXG4gICAgICBjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbih3aW5kb3cpO1xyXG4gICAgICBjaHJvbWVTaGltLnNoaW1PblRyYWNrKHdpbmRvdyk7XHJcbiAgICAgIGNocm9tZVNoaW0uc2hpbUFkZFRyYWNrUmVtb3ZlVHJhY2sod2luZG93KTtcclxuICAgICAgY2hyb21lU2hpbS5zaGltR2V0U2VuZGVyc1dpdGhEdG1mKHdpbmRvdyk7XHJcblxyXG4gICAgICBjb21tb25TaGltLnNoaW1SVENJY2VDYW5kaWRhdGUod2luZG93KTtcclxuICAgICAgY29tbW9uU2hpbS5zaGltTWF4TWVzc2FnZVNpemUod2luZG93KTtcclxuICAgICAgY29tbW9uU2hpbS5zaGltU2VuZFRocm93VHlwZUVycm9yKHdpbmRvdyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnZmlyZWZveCc6XHJcbiAgICAgIGlmICghZmlyZWZveFNoaW0gfHwgIWZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbiB8fFxyXG4gICAgICAgICAgIW9wdGlvbnMuc2hpbUZpcmVmb3gpIHtcclxuICAgICAgICBsb2dnaW5nKCdGaXJlZm94IHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xyXG4gICAgICAgIHJldHVybiBhZGFwdGVyO1xyXG4gICAgICB9XHJcbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZmlyZWZveC4nKTtcclxuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cclxuICAgICAgYWRhcHRlci5icm93c2VyU2hpbSA9IGZpcmVmb3hTaGltO1xyXG4gICAgICBjb21tb25TaGltLnNoaW1DcmVhdGVPYmplY3RVUkwod2luZG93KTtcclxuXHJcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1HZXRVc2VyTWVkaWEod2luZG93KTtcclxuICAgICAgZmlyZWZveFNoaW0uc2hpbVNvdXJjZU9iamVjdCh3aW5kb3cpO1xyXG4gICAgICBmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24od2luZG93KTtcclxuICAgICAgZmlyZWZveFNoaW0uc2hpbU9uVHJhY2sod2luZG93KTtcclxuICAgICAgZmlyZWZveFNoaW0uc2hpbVJlbW92ZVN0cmVhbSh3aW5kb3cpO1xyXG5cclxuICAgICAgY29tbW9uU2hpbS5zaGltUlRDSWNlQ2FuZGlkYXRlKHdpbmRvdyk7XHJcbiAgICAgIGNvbW1vblNoaW0uc2hpbU1heE1lc3NhZ2VTaXplKHdpbmRvdyk7XHJcbiAgICAgIGNvbW1vblNoaW0uc2hpbVNlbmRUaHJvd1R5cGVFcnJvcih3aW5kb3cpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ2VkZ2UnOlxyXG4gICAgICBpZiAoIWVkZ2VTaGltIHx8ICFlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24gfHwgIW9wdGlvbnMuc2hpbUVkZ2UpIHtcclxuICAgICAgICBsb2dnaW5nKCdNUyBlZGdlIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xyXG4gICAgICAgIHJldHVybiBhZGFwdGVyO1xyXG4gICAgICB9XHJcbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZWRnZS4nKTtcclxuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cclxuICAgICAgYWRhcHRlci5icm93c2VyU2hpbSA9IGVkZ2VTaGltO1xyXG4gICAgICBjb21tb25TaGltLnNoaW1DcmVhdGVPYmplY3RVUkwod2luZG93KTtcclxuXHJcbiAgICAgIGVkZ2VTaGltLnNoaW1HZXRVc2VyTWVkaWEod2luZG93KTtcclxuICAgICAgZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKHdpbmRvdyk7XHJcbiAgICAgIGVkZ2VTaGltLnNoaW1SZXBsYWNlVHJhY2sod2luZG93KTtcclxuXHJcbiAgICAgIC8vIHRoZSBlZGdlIHNoaW0gaW1wbGVtZW50cyB0aGUgZnVsbCBSVENJY2VDYW5kaWRhdGUgb2JqZWN0LlxyXG5cclxuICAgICAgY29tbW9uU2hpbS5zaGltTWF4TWVzc2FnZVNpemUod2luZG93KTtcclxuICAgICAgY29tbW9uU2hpbS5zaGltU2VuZFRocm93VHlwZUVycm9yKHdpbmRvdyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnc2FmYXJpJzpcclxuICAgICAgaWYgKCFzYWZhcmlTaGltIHx8ICFvcHRpb25zLnNoaW1TYWZhcmkpIHtcclxuICAgICAgICBsb2dnaW5nKCdTYWZhcmkgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XHJcbiAgICAgICAgcmV0dXJuIGFkYXB0ZXI7XHJcbiAgICAgIH1cclxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBzYWZhcmkuJyk7XHJcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXHJcbiAgICAgIGFkYXB0ZXIuYnJvd3NlclNoaW0gPSBzYWZhcmlTaGltO1xyXG4gICAgICBjb21tb25TaGltLnNoaW1DcmVhdGVPYmplY3RVUkwod2luZG93KTtcclxuXHJcbiAgICAgIHNhZmFyaVNoaW0uc2hpbVJUQ0ljZVNlcnZlclVybHMod2luZG93KTtcclxuICAgICAgc2FmYXJpU2hpbS5zaGltQ2FsbGJhY2tzQVBJKHdpbmRvdyk7XHJcbiAgICAgIHNhZmFyaVNoaW0uc2hpbUxvY2FsU3RyZWFtc0FQSSh3aW5kb3cpO1xyXG4gICAgICBzYWZhcmlTaGltLnNoaW1SZW1vdGVTdHJlYW1zQVBJKHdpbmRvdyk7XHJcbiAgICAgIHNhZmFyaVNoaW0uc2hpbVRyYWNrRXZlbnRUcmFuc2NlaXZlcih3aW5kb3cpO1xyXG4gICAgICBzYWZhcmlTaGltLnNoaW1HZXRVc2VyTWVkaWEod2luZG93KTtcclxuICAgICAgc2FmYXJpU2hpbS5zaGltQ3JlYXRlT2ZmZXJMZWdhY3kod2luZG93KTtcclxuXHJcbiAgICAgIGNvbW1vblNoaW0uc2hpbVJUQ0ljZUNhbmRpZGF0ZSh3aW5kb3cpO1xyXG4gICAgICBjb21tb25TaGltLnNoaW1NYXhNZXNzYWdlU2l6ZSh3aW5kb3cpO1xyXG4gICAgICBjb21tb25TaGltLnNoaW1TZW5kVGhyb3dUeXBlRXJyb3Iod2luZG93KTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICBsb2dnaW5nKCdVbnN1cHBvcnRlZCBicm93c2VyIScpO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIHJldHVybiBhZGFwdGVyO1xyXG59O1xyXG5cclxufSx7XCIuL2Nocm9tZS9jaHJvbWVfc2hpbVwiOjUsXCIuL2NvbW1vbl9zaGltXCI6NyxcIi4vZWRnZS9lZGdlX3NoaW1cIjo4LFwiLi9maXJlZm94L2ZpcmVmb3hfc2hpbVwiOjEwLFwiLi9zYWZhcmkvc2FmYXJpX3NoaW1cIjoxMixcIi4vdXRpbHNcIjoxM31dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG5cclxuLypcclxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcclxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxyXG4gKiAgdHJlZS5cclxuICovXHJcbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG52YXIgbG9nZ2luZyA9IHV0aWxzLmxvZztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJyksXHJcbiAgc2hpbU1lZGlhU3RyZWFtOiBmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIHdpbmRvdy5NZWRpYVN0cmVhbSA9IHdpbmRvdy5NZWRpYVN0cmVhbSB8fCB3aW5kb3cud2Via2l0TWVkaWFTdHJlYW07XHJcbiAgfSxcclxuXHJcbiAgc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJiAhKCdvbnRyYWNrJyBpblxyXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnb250cmFjaycsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX29udHJhY2s7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGYpIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9vbnRyYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgdmFyIG9yaWdTZXRSZW1vdGVEZXNjcmlwdGlvbiA9XHJcbiAgICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uO1xyXG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgICBpZiAoIXBjLl9vbnRyYWNrcG9seSkge1xyXG4gICAgICAgICAgcGMuX29udHJhY2twb2x5ID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAvLyBvbmFkZHN0cmVhbSBkb2VzIG5vdCBmaXJlIHdoZW4gYSB0cmFjayBpcyBhZGRlZCB0byBhbiBleGlzdGluZ1xyXG4gICAgICAgICAgICAvLyBzdHJlYW0uIEJ1dCBzdHJlYW0ub25hZGR0cmFjayBpcyBpbXBsZW1lbnRlZCBzbyB3ZSB1c2UgdGhhdC5cclxuICAgICAgICAgICAgZS5zdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcignYWRkdHJhY2snLCBmdW5jdGlvbih0ZSkge1xyXG4gICAgICAgICAgICAgIHZhciByZWNlaXZlcjtcclxuICAgICAgICAgICAgICBpZiAod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRSZWNlaXZlcnMpIHtcclxuICAgICAgICAgICAgICAgIHJlY2VpdmVyID0gcGMuZ2V0UmVjZWl2ZXJzKCkuZmluZChmdW5jdGlvbihyKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiByLnRyYWNrICYmIHIudHJhY2suaWQgPT09IHRlLnRyYWNrLmlkO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlY2VpdmVyID0ge3RyYWNrOiB0ZS50cmFja307XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XHJcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0ZS50cmFjaztcclxuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHJlY2VpdmVyO1xyXG4gICAgICAgICAgICAgIGV2ZW50LnRyYW5zY2VpdmVyID0ge3JlY2VpdmVyOiByZWNlaXZlcn07XHJcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XHJcbiAgICAgICAgICAgICAgcGMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBlLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHJlY2VpdmVyO1xyXG4gICAgICAgICAgICAgIGlmICh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFJlY2VpdmVycykge1xyXG4gICAgICAgICAgICAgICAgcmVjZWl2ZXIgPSBwYy5nZXRSZWNlaXZlcnMoKS5maW5kKGZ1bmN0aW9uKHIpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHIudHJhY2sgJiYgci50cmFjay5pZCA9PT0gdHJhY2suaWQ7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVjZWl2ZXIgPSB7dHJhY2s6IHRyYWNrfTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xyXG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdHJhY2s7XHJcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSByZWNlaXZlcjtcclxuICAgICAgICAgICAgICBldmVudC50cmFuc2NlaXZlciA9IHtyZWNlaXZlcjogcmVjZWl2ZXJ9O1xyXG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xyXG4gICAgICAgICAgICAgIHBjLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBwYy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCBwYy5fb250cmFja3BvbHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3JpZ1NldFJlbW90ZURlc2NyaXB0aW9uLmFwcGx5KHBjLCBhcmd1bWVudHMpO1xyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIGlmICghKCdSVENSdHBUcmFuc2NlaXZlcicgaW4gd2luZG93KSkge1xyXG4gICAgICB1dGlscy53cmFwUGVlckNvbm5lY3Rpb25FdmVudCh3aW5kb3csICd0cmFjaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBpZiAoIWUudHJhbnNjZWl2ZXIpIHtcclxuICAgICAgICAgIGUudHJhbnNjZWl2ZXIgPSB7cmVjZWl2ZXI6IGUucmVjZWl2ZXJ9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgc2hpbUdldFNlbmRlcnNXaXRoRHRtZjogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICAvLyBPdmVycmlkZXMgYWRkVHJhY2svcmVtb3ZlVHJhY2ssIGRlcGVuZHMgb24gc2hpbUFkZFRyYWNrUmVtb3ZlVHJhY2suXHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmXHJcbiAgICAgICAgISgnZ2V0U2VuZGVycycgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkgJiZcclxuICAgICAgICAnY3JlYXRlRFRNRlNlbmRlcicgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkge1xyXG4gICAgICB2YXIgc2hpbVNlbmRlcldpdGhEdG1mID0gZnVuY3Rpb24ocGMsIHRyYWNrKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHRyYWNrOiB0cmFjayxcclxuICAgICAgICAgIGdldCBkdG1mKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fZHRtZiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHRyYWNrLmtpbmQgPT09ICdhdWRpbycpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2R0bWYgPSBwYy5jcmVhdGVEVE1GU2VuZGVyKHRyYWNrKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHRtZiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kdG1mO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIF9wYzogcGNcclxuICAgICAgICB9O1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gYXVnbWVudCBhZGRUcmFjayB3aGVuIGdldFNlbmRlcnMgaXMgbm90IGF2YWlsYWJsZS5cclxuICAgICAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFNlbmRlcnMpIHtcclxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFNlbmRlcnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHRoaXMuX3NlbmRlcnMgPSB0aGlzLl9zZW5kZXJzIHx8IFtdO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRlcnMuc2xpY2UoKTsgLy8gcmV0dXJuIGEgY29weSBvZiB0aGUgaW50ZXJuYWwgc3RhdGUuXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgb3JpZ0FkZFRyYWNrID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRUcmFjaztcclxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrID0gZnVuY3Rpb24odHJhY2ssIHN0cmVhbSkge1xyXG4gICAgICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgICAgIHZhciBzZW5kZXIgPSBvcmlnQWRkVHJhY2suYXBwbHkocGMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICBpZiAoIXNlbmRlcikge1xyXG4gICAgICAgICAgICBzZW5kZXIgPSBzaGltU2VuZGVyV2l0aER0bWYocGMsIHRyYWNrKTtcclxuICAgICAgICAgICAgcGMuX3NlbmRlcnMucHVzaChzZW5kZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHNlbmRlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgb3JpZ1JlbW92ZVRyYWNrID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVUcmFjaztcclxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVRyYWNrID0gZnVuY3Rpb24oc2VuZGVyKSB7XHJcbiAgICAgICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICAgICAgb3JpZ1JlbW92ZVRyYWNrLmFwcGx5KHBjLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgdmFyIGlkeCA9IHBjLl9zZW5kZXJzLmluZGV4T2Yoc2VuZGVyKTtcclxuICAgICAgICAgIGlmIChpZHggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBjLl9zZW5kZXJzLnNwbGljZShpZHgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgdmFyIG9yaWdBZGRTdHJlYW0gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbTtcclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICAgIHBjLl9zZW5kZXJzID0gcGMuX3NlbmRlcnMgfHwgW107XHJcbiAgICAgICAgb3JpZ0FkZFN0cmVhbS5hcHBseShwYywgW3N0cmVhbV0pO1xyXG4gICAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgICBwYy5fc2VuZGVycy5wdXNoKHNoaW1TZW5kZXJXaXRoRHRtZihwYywgdHJhY2spKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHZhciBvcmlnUmVtb3ZlU3RyZWFtID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW07XHJcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XHJcbiAgICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgICBwYy5fc2VuZGVycyA9IHBjLl9zZW5kZXJzIHx8IFtdO1xyXG4gICAgICAgIG9yaWdSZW1vdmVTdHJlYW0uYXBwbHkocGMsIFtzdHJlYW1dKTtcclxuXHJcbiAgICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICAgIHZhciBzZW5kZXIgPSBwYy5fc2VuZGVycy5maW5kKGZ1bmN0aW9uKHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHMudHJhY2sgPT09IHRyYWNrO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZiAoc2VuZGVyKSB7XHJcbiAgICAgICAgICAgIHBjLl9zZW5kZXJzLnNwbGljZShwYy5fc2VuZGVycy5pbmRleE9mKHNlbmRlciksIDEpOyAvLyByZW1vdmUgc2VuZGVyXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJlxyXG4gICAgICAgICAgICAgICAnZ2V0U2VuZGVycycgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSAmJlxyXG4gICAgICAgICAgICAgICAnY3JlYXRlRFRNRlNlbmRlcicgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSAmJlxyXG4gICAgICAgICAgICAgICB3aW5kb3cuUlRDUnRwU2VuZGVyICYmXHJcbiAgICAgICAgICAgICAgICEoJ2R0bWYnIGluIHdpbmRvdy5SVENSdHBTZW5kZXIucHJvdG90eXBlKSkge1xyXG4gICAgICB2YXIgb3JpZ0dldFNlbmRlcnMgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFNlbmRlcnM7XHJcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U2VuZGVycyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbmRlcnMgPSBvcmlnR2V0U2VuZGVycy5hcHBseShwYywgW10pO1xyXG4gICAgICAgIHNlbmRlcnMuZm9yRWFjaChmdW5jdGlvbihzZW5kZXIpIHtcclxuICAgICAgICAgIHNlbmRlci5fcGMgPSBwYztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gc2VuZGVycztcclxuICAgICAgfTtcclxuXHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUnRwU2VuZGVyLnByb3RvdHlwZSwgJ2R0bWYnLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9kdG1mID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2R0bWYgPSB0aGlzLl9wYy5jcmVhdGVEVE1GU2VuZGVyKHRoaXMudHJhY2spO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2R0bWYgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZHRtZjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgdmFyIFVSTCA9IHdpbmRvdyAmJiB3aW5kb3cuVVJMO1xyXG5cclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xyXG4gICAgICBpZiAod2luZG93LkhUTUxNZWRpYUVsZW1lbnQgJiZcclxuICAgICAgICAhKCdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSkpIHtcclxuICAgICAgICAvLyBTaGltIHRoZSBzcmNPYmplY3QgcHJvcGVydHksIG9uY2UsIHdoZW4gSFRNTE1lZGlhRWxlbWVudCBpcyBmb3VuZC5cclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCAnc3JjT2JqZWN0Jywge1xyXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NyY09iamVjdDtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHN0cmVhbSkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIC8vIFVzZSBfc3JjT2JqZWN0IGFzIGEgcHJpdmF0ZSBwcm9wZXJ0eSBmb3IgdGhpcyBzaGltXHJcbiAgICAgICAgICAgIHRoaXMuX3NyY09iamVjdCA9IHN0cmVhbTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3JjKSB7XHJcbiAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnNyYyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghc3RyZWFtKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zcmMgPSAnJztcclxuICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xyXG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHJlY3JlYXRlIHRoZSBibG9iIHVybCB3aGVuIGEgdHJhY2sgaXMgYWRkZWQgb3JcclxuICAgICAgICAgICAgLy8gcmVtb3ZlZC4gRG9pbmcgaXQgbWFudWFsbHkgc2luY2Ugd2Ugd2FudCB0byBhdm9pZCBhIHJlY3Vyc2lvbi5cclxuICAgICAgICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XHJcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHNlbGYuc3JjKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcigncmVtb3ZldHJhY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBpZiAoc2VsZi5zcmMpIHtcclxuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoc2VsZi5zcmMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBzZWxmLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBzaGltQWRkVHJhY2tSZW1vdmVUcmFja1dpdGhOYXRpdmU6IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgLy8gc2hpbSBhZGRUcmFjay9yZW1vdmVUcmFjayB3aXRoIG5hdGl2ZSB2YXJpYW50cyBpbiBvcmRlciB0byBtYWtlXHJcbiAgICAvLyB0aGUgaW50ZXJhY3Rpb25zIHdpdGggbGVnYWN5IGdldExvY2FsU3RyZWFtcyBiZWhhdmUgYXMgaW4gb3RoZXIgYnJvd3NlcnMuXHJcbiAgICAvLyBLZWVwcyBhIG1hcHBpbmcgc3RyZWFtLmlkID0+IFtzdHJlYW0sIHJ0cHNlbmRlcnMuLi5dXHJcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldExvY2FsU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zID0gdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtcyB8fCB7fTtcclxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXMpLm1hcChmdW5jdGlvbihzdHJlYW1JZCkge1xyXG4gICAgICAgIHJldHVybiBwYy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW1JZF1bMF07XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgb3JpZ0FkZFRyYWNrID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRUcmFjaztcclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkVHJhY2sgPSBmdW5jdGlvbih0cmFjaywgc3RyZWFtKSB7XHJcbiAgICAgIGlmICghc3RyZWFtKSB7XHJcbiAgICAgICAgcmV0dXJuIG9yaWdBZGRUcmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXMgPSB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zIHx8IHt9O1xyXG5cclxuICAgICAgdmFyIHNlbmRlciA9IG9yaWdBZGRUcmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICBpZiAoIXRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXNbc3RyZWFtLmlkXSkge1xyXG4gICAgICAgIHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXNbc3RyZWFtLmlkXSA9IFtzdHJlYW0sIHNlbmRlcl07XHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW0uaWRdLmluZGV4T2Yoc2VuZGVyKSA9PT0gLTEpIHtcclxuICAgICAgICB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zW3N0cmVhbS5pZF0ucHVzaChzZW5kZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzZW5kZXI7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBvcmlnQWRkU3RyZWFtID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW07XHJcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xyXG4gICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zID0gdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtcyB8fCB7fTtcclxuXHJcbiAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgdmFyIGFscmVhZHlFeGlzdHMgPSBwYy5nZXRTZW5kZXJzKCkuZmluZChmdW5jdGlvbihzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcy50cmFjayA9PT0gdHJhY2s7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGFscmVhZHlFeGlzdHMpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJ1RyYWNrIGFscmVhZHkgZXhpc3RzLicsXHJcbiAgICAgICAgICAgICAgJ0ludmFsaWRBY2Nlc3NFcnJvcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHZhciBleGlzdGluZ1NlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCk7XHJcbiAgICAgIG9yaWdBZGRTdHJlYW0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgdmFyIG5ld1NlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCkuZmlsdGVyKGZ1bmN0aW9uKG5ld1NlbmRlcikge1xyXG4gICAgICAgIHJldHVybiBleGlzdGluZ1NlbmRlcnMuaW5kZXhPZihuZXdTZW5kZXIpID09PSAtMTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXNbc3RyZWFtLmlkXSA9IFtzdHJlYW1dLmNvbmNhdChuZXdTZW5kZXJzKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG9yaWdSZW1vdmVTdHJlYW0gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVN0cmVhbTtcclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XHJcbiAgICAgIHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXMgPSB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zIHx8IHt9O1xyXG4gICAgICBkZWxldGUgdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW0uaWRdO1xyXG4gICAgICByZXR1cm4gb3JpZ1JlbW92ZVN0cmVhbS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgb3JpZ1JlbW92ZVRyYWNrID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVUcmFjaztcclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlVHJhY2sgPSBmdW5jdGlvbihzZW5kZXIpIHtcclxuICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtcyA9IHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXMgfHwge307XHJcbiAgICAgIGlmIChzZW5kZXIpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zKS5mb3JFYWNoKGZ1bmN0aW9uKHN0cmVhbUlkKSB7XHJcbiAgICAgICAgICB2YXIgaWR4ID0gcGMuX3NoaW1tZWRMb2NhbFN0cmVhbXNbc3RyZWFtSWRdLmluZGV4T2Yoc2VuZGVyKTtcclxuICAgICAgICAgIGlmIChpZHggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHBjLl9zaGltbWVkTG9jYWxTdHJlYW1zW3N0cmVhbUlkXS5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChwYy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW1JZF0ubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBwYy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW1JZF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG9yaWdSZW1vdmVUcmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBzaGltQWRkVHJhY2tSZW1vdmVUcmFjazogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICB2YXIgYnJvd3NlckRldGFpbHMgPSB1dGlscy5kZXRlY3RCcm93c2VyKHdpbmRvdyk7XHJcbiAgICAvLyBzaGltIGFkZFRyYWNrIGFuZCByZW1vdmVUcmFjay5cclxuICAgIGlmICh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrICYmXHJcbiAgICAgICAgYnJvd3NlckRldGFpbHMudmVyc2lvbiA+PSA2NSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zaGltQWRkVHJhY2tSZW1vdmVUcmFja1dpdGhOYXRpdmUod2luZG93KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhbHNvIHNoaW0gcGMuZ2V0TG9jYWxTdHJlYW1zIHdoZW4gYWRkVHJhY2sgaXMgc2hpbW1lZFxyXG4gICAgLy8gdG8gcmV0dXJuIHRoZSBvcmlnaW5hbCBzdHJlYW1zLlxyXG4gICAgdmFyIG9yaWdHZXRMb2NhbFN0cmVhbXMgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlXHJcbiAgICAgICAgLmdldExvY2FsU3RyZWFtcztcclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0TG9jYWxTdHJlYW1zID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgIHZhciBuYXRpdmVTdHJlYW1zID0gb3JpZ0dldExvY2FsU3RyZWFtcy5hcHBseSh0aGlzKTtcclxuICAgICAgcGMuX3JldmVyc2VTdHJlYW1zID0gcGMuX3JldmVyc2VTdHJlYW1zIHx8IHt9O1xyXG4gICAgICByZXR1cm4gbmF0aXZlU3RyZWFtcy5tYXAoZnVuY3Rpb24oc3RyZWFtKSB7XHJcbiAgICAgICAgcmV0dXJuIHBjLl9yZXZlcnNlU3RyZWFtc1tzdHJlYW0uaWRdO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG9yaWdBZGRTdHJlYW0gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbTtcclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XHJcbiAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgIHBjLl9zdHJlYW1zID0gcGMuX3N0cmVhbXMgfHwge307XHJcbiAgICAgIHBjLl9yZXZlcnNlU3RyZWFtcyA9IHBjLl9yZXZlcnNlU3RyZWFtcyB8fCB7fTtcclxuXHJcbiAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgdmFyIGFscmVhZHlFeGlzdHMgPSBwYy5nZXRTZW5kZXJzKCkuZmluZChmdW5jdGlvbihzKSB7XHJcbiAgICAgICAgICByZXR1cm4gcy50cmFjayA9PT0gdHJhY2s7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGFscmVhZHlFeGlzdHMpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJ1RyYWNrIGFscmVhZHkgZXhpc3RzLicsXHJcbiAgICAgICAgICAgICAgJ0ludmFsaWRBY2Nlc3NFcnJvcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIC8vIEFkZCBpZGVudGl0eSBtYXBwaW5nIGZvciBjb25zaXN0ZW5jeSB3aXRoIGFkZFRyYWNrLlxyXG4gICAgICAvLyBVbmxlc3MgdGhpcyBpcyBiZWluZyB1c2VkIHdpdGggYSBzdHJlYW0gZnJvbSBhZGRUcmFjay5cclxuICAgICAgaWYgKCFwYy5fcmV2ZXJzZVN0cmVhbXNbc3RyZWFtLmlkXSkge1xyXG4gICAgICAgIHZhciBuZXdTdHJlYW0gPSBuZXcgd2luZG93Lk1lZGlhU3RyZWFtKHN0cmVhbS5nZXRUcmFja3MoKSk7XHJcbiAgICAgICAgcGMuX3N0cmVhbXNbc3RyZWFtLmlkXSA9IG5ld1N0cmVhbTtcclxuICAgICAgICBwYy5fcmV2ZXJzZVN0cmVhbXNbbmV3U3RyZWFtLmlkXSA9IHN0cmVhbTtcclxuICAgICAgICBzdHJlYW0gPSBuZXdTdHJlYW07XHJcbiAgICAgIH1cclxuICAgICAgb3JpZ0FkZFN0cmVhbS5hcHBseShwYywgW3N0cmVhbV0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgb3JpZ1JlbW92ZVN0cmVhbSA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlU3RyZWFtO1xyXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgcGMuX3N0cmVhbXMgPSBwYy5fc3RyZWFtcyB8fCB7fTtcclxuICAgICAgcGMuX3JldmVyc2VTdHJlYW1zID0gcGMuX3JldmVyc2VTdHJlYW1zIHx8IHt9O1xyXG5cclxuICAgICAgb3JpZ1JlbW92ZVN0cmVhbS5hcHBseShwYywgWyhwYy5fc3RyZWFtc1tzdHJlYW0uaWRdIHx8IHN0cmVhbSldKTtcclxuICAgICAgZGVsZXRlIHBjLl9yZXZlcnNlU3RyZWFtc1socGMuX3N0cmVhbXNbc3RyZWFtLmlkXSA/XHJcbiAgICAgICAgICBwYy5fc3RyZWFtc1tzdHJlYW0uaWRdLmlkIDogc3RyZWFtLmlkKV07XHJcbiAgICAgIGRlbGV0ZSBwYy5fc3RyZWFtc1tzdHJlYW0uaWRdO1xyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrID0gZnVuY3Rpb24odHJhY2ssIHN0cmVhbSkge1xyXG4gICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICBpZiAocGMuc2lnbmFsaW5nU3RhdGUgPT09ICdjbG9zZWQnKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbihcclxuICAgICAgICAgICdUaGUgUlRDUGVlckNvbm5lY3Rpb25cXCdzIHNpZ25hbGluZ1N0YXRlIGlzIFxcJ2Nsb3NlZFxcJy4nLFxyXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHN0cmVhbXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XHJcbiAgICAgIGlmIChzdHJlYW1zLmxlbmd0aCAhPT0gMSB8fFxyXG4gICAgICAgICAgIXN0cmVhbXNbMF0uZ2V0VHJhY2tzKCkuZmluZChmdW5jdGlvbih0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0ID09PSB0cmFjaztcclxuICAgICAgICAgIH0pKSB7XHJcbiAgICAgICAgLy8gdGhpcyBpcyBub3QgZnVsbHkgY29ycmVjdCBidXQgYWxsIHdlIGNhbiBtYW5hZ2Ugd2l0aG91dFxyXG4gICAgICAgIC8vIFtbYXNzb2NpYXRlZCBNZWRpYVN0cmVhbXNdXSBpbnRlcm5hbCBzbG90LlxyXG4gICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXHJcbiAgICAgICAgICAnVGhlIGFkYXB0ZXIuanMgYWRkVHJhY2sgcG9seWZpbGwgb25seSBzdXBwb3J0cyBhIHNpbmdsZSAnICtcclxuICAgICAgICAgICcgc3RyZWFtIHdoaWNoIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIHRyYWNrLicsXHJcbiAgICAgICAgICAnTm90U3VwcG9ydGVkRXJyb3InKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGFscmVhZHlFeGlzdHMgPSBwYy5nZXRTZW5kZXJzKCkuZmluZChmdW5jdGlvbihzKSB7XHJcbiAgICAgICAgcmV0dXJuIHMudHJhY2sgPT09IHRyYWNrO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKGFscmVhZHlFeGlzdHMpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKCdUcmFjayBhbHJlYWR5IGV4aXN0cy4nLFxyXG4gICAgICAgICAgICAnSW52YWxpZEFjY2Vzc0Vycm9yJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBjLl9zdHJlYW1zID0gcGMuX3N0cmVhbXMgfHwge307XHJcbiAgICAgIHBjLl9yZXZlcnNlU3RyZWFtcyA9IHBjLl9yZXZlcnNlU3RyZWFtcyB8fCB7fTtcclxuICAgICAgdmFyIG9sZFN0cmVhbSA9IHBjLl9zdHJlYW1zW3N0cmVhbS5pZF07XHJcbiAgICAgIGlmIChvbGRTdHJlYW0pIHtcclxuICAgICAgICAvLyB0aGlzIGlzIHVzaW5nIG9kZCBDaHJvbWUgYmVoYXZpb3VyLCB1c2Ugd2l0aCBjYXV0aW9uOlxyXG4gICAgICAgIC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC93ZWJydGMvaXNzdWVzL2RldGFpbD9pZD03ODE1XHJcbiAgICAgICAgLy8gTm90ZTogd2UgcmVseSBvbiB0aGUgaGlnaC1sZXZlbCBhZGRUcmFjay9kdG1mIHNoaW0gdG9cclxuICAgICAgICAvLyBjcmVhdGUgdGhlIHNlbmRlciB3aXRoIGEgZHRtZiBzZW5kZXIuXHJcbiAgICAgICAgb2xkU3RyZWFtLmFkZFRyYWNrKHRyYWNrKTtcclxuXHJcbiAgICAgICAgLy8gVHJpZ2dlciBPTk4gYXN5bmMuXHJcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHBjLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCduZWdvdGlhdGlvbm5lZWRlZCcpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbmV3U3RyZWFtID0gbmV3IHdpbmRvdy5NZWRpYVN0cmVhbShbdHJhY2tdKTtcclxuICAgICAgICBwYy5fc3RyZWFtc1tzdHJlYW0uaWRdID0gbmV3U3RyZWFtO1xyXG4gICAgICAgIHBjLl9yZXZlcnNlU3RyZWFtc1tuZXdTdHJlYW0uaWRdID0gc3RyZWFtO1xyXG4gICAgICAgIHBjLmFkZFN0cmVhbShuZXdTdHJlYW0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBwYy5nZXRTZW5kZXJzKCkuZmluZChmdW5jdGlvbihzKSB7XHJcbiAgICAgICAgcmV0dXJuIHMudHJhY2sgPT09IHRyYWNrO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gcmVwbGFjZSB0aGUgaW50ZXJuYWwgc3RyZWFtIGlkIHdpdGggdGhlIGV4dGVybmFsIG9uZSBhbmRcclxuICAgIC8vIHZpY2UgdmVyc2EuXHJcbiAgICBmdW5jdGlvbiByZXBsYWNlSW50ZXJuYWxTdHJlYW1JZChwYywgZGVzY3JpcHRpb24pIHtcclxuICAgICAgdmFyIHNkcCA9IGRlc2NyaXB0aW9uLnNkcDtcclxuICAgICAgT2JqZWN0LmtleXMocGMuX3JldmVyc2VTdHJlYW1zIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGludGVybmFsSWQpIHtcclxuICAgICAgICB2YXIgZXh0ZXJuYWxTdHJlYW0gPSBwYy5fcmV2ZXJzZVN0cmVhbXNbaW50ZXJuYWxJZF07XHJcbiAgICAgICAgdmFyIGludGVybmFsU3RyZWFtID0gcGMuX3N0cmVhbXNbZXh0ZXJuYWxTdHJlYW0uaWRdO1xyXG4gICAgICAgIHNkcCA9IHNkcC5yZXBsYWNlKG5ldyBSZWdFeHAoaW50ZXJuYWxTdHJlYW0uaWQsICdnJyksXHJcbiAgICAgICAgICAgIGV4dGVybmFsU3RyZWFtLmlkKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcclxuICAgICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxyXG4gICAgICAgIHNkcDogc2RwXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVwbGFjZUV4dGVybmFsU3RyZWFtSWQocGMsIGRlc2NyaXB0aW9uKSB7XHJcbiAgICAgIHZhciBzZHAgPSBkZXNjcmlwdGlvbi5zZHA7XHJcbiAgICAgIE9iamVjdC5rZXlzKHBjLl9yZXZlcnNlU3RyZWFtcyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihpbnRlcm5hbElkKSB7XHJcbiAgICAgICAgdmFyIGV4dGVybmFsU3RyZWFtID0gcGMuX3JldmVyc2VTdHJlYW1zW2ludGVybmFsSWRdO1xyXG4gICAgICAgIHZhciBpbnRlcm5hbFN0cmVhbSA9IHBjLl9zdHJlYW1zW2V4dGVybmFsU3RyZWFtLmlkXTtcclxuICAgICAgICBzZHAgPSBzZHAucmVwbGFjZShuZXcgUmVnRXhwKGV4dGVybmFsU3RyZWFtLmlkLCAnZycpLFxyXG4gICAgICAgICAgICBpbnRlcm5hbFN0cmVhbS5pZCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XHJcbiAgICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcclxuICAgICAgICBzZHA6IHNkcFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIFsnY3JlYXRlT2ZmZXInLCAnY3JlYXRlQW5zd2VyJ10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcclxuICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICB2YXIgaXNMZWdhY3lDYWxsID0gYXJndW1lbnRzLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnZnVuY3Rpb24nO1xyXG4gICAgICAgIGlmIChpc0xlZ2FjeUNhbGwpIHtcclxuICAgICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkocGMsIFtcclxuICAgICAgICAgICAgZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICB2YXIgZGVzYyA9IHJlcGxhY2VJbnRlcm5hbFN0cmVhbUlkKHBjLCBkZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgICAgYXJnc1swXS5hcHBseShudWxsLCBbZGVzY10pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICBpZiAoYXJnc1sxXSkge1xyXG4gICAgICAgICAgICAgICAgYXJnc1sxXS5hcHBseShudWxsLCBlcnIpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgYXJndW1lbnRzWzJdXHJcbiAgICAgICAgICBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseShwYywgYXJndW1lbnRzKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVwbGFjZUludGVybmFsU3RyZWFtSWQocGMsIGRlc2NyaXB0aW9uKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBvcmlnU2V0TG9jYWxEZXNjcmlwdGlvbiA9XHJcbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uO1xyXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCB8fCAhYXJndW1lbnRzWzBdLnR5cGUpIHtcclxuICAgICAgICByZXR1cm4gb3JpZ1NldExvY2FsRGVzY3JpcHRpb24uYXBwbHkocGMsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH1cclxuICAgICAgYXJndW1lbnRzWzBdID0gcmVwbGFjZUV4dGVybmFsU3RyZWFtSWQocGMsIGFyZ3VtZW50c1swXSk7XHJcbiAgICAgIHJldHVybiBvcmlnU2V0TG9jYWxEZXNjcmlwdGlvbi5hcHBseShwYywgYXJndW1lbnRzKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVE9ETzogbWFuZ2xlIGdldFN0YXRzOiBodHRwczovL3czYy5naXRodWIuaW8vd2VicnRjLXN0YXRzLyNkb20tcnRjbWVkaWFzdHJlYW1zdGF0cy1zdHJlYW1pZGVudGlmaWVyXHJcblxyXG4gICAgdmFyIG9yaWdMb2NhbERlc2NyaXB0aW9uID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihcclxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnbG9jYWxEZXNjcmlwdGlvbicpO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsXHJcbiAgICAgICAgJ2xvY2FsRGVzY3JpcHRpb24nLCB7XHJcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBvcmlnTG9jYWxEZXNjcmlwdGlvbi5nZXQuYXBwbHkodGhpcyk7XHJcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnJykge1xyXG4gICAgICAgICAgICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVwbGFjZUludGVybmFsU3RyZWFtSWQocGMsIGRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVRyYWNrID0gZnVuY3Rpb24oc2VuZGVyKSB7XHJcbiAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgIGlmIChwYy5zaWduYWxpbmdTdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxyXG4gICAgICAgICAgJ1RoZSBSVENQZWVyQ29ubmVjdGlvblxcJ3Mgc2lnbmFsaW5nU3RhdGUgaXMgXFwnY2xvc2VkXFwnLicsXHJcbiAgICAgICAgICAnSW52YWxpZFN0YXRlRXJyb3InKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBXZSBjYW4gbm90IHlldCBjaGVjayBmb3Igc2VuZGVyIGluc3RhbmNlb2YgUlRDUnRwU2VuZGVyXHJcbiAgICAgIC8vIHNpbmNlIHdlIHNoaW0gUlRQU2VuZGVyLiBTbyB3ZSBjaGVjayBpZiBzZW5kZXIuX3BjIGlzIHNldC5cclxuICAgICAgaWYgKCFzZW5kZXIuX3BjKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignQXJndW1lbnQgMSBvZiBSVENQZWVyQ29ubmVjdGlvbi5yZW1vdmVUcmFjayAnICtcclxuICAgICAgICAgICAgJ2RvZXMgbm90IGltcGxlbWVudCBpbnRlcmZhY2UgUlRDUnRwU2VuZGVyLicsICdUeXBlRXJyb3InKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgaXNMb2NhbCA9IHNlbmRlci5fcGMgPT09IHBjO1xyXG4gICAgICBpZiAoIWlzTG9jYWwpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKCdTZW5kZXIgd2FzIG5vdCBjcmVhdGVkIGJ5IHRoaXMgY29ubmVjdGlvbi4nLFxyXG4gICAgICAgICAgICAnSW52YWxpZEFjY2Vzc0Vycm9yJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNlYXJjaCBmb3IgdGhlIG5hdGl2ZSBzdHJlYW0gdGhlIHNlbmRlcnMgdHJhY2sgYmVsb25ncyB0by5cclxuICAgICAgcGMuX3N0cmVhbXMgPSBwYy5fc3RyZWFtcyB8fCB7fTtcclxuICAgICAgdmFyIHN0cmVhbTtcclxuICAgICAgT2JqZWN0LmtleXMocGMuX3N0cmVhbXMpLmZvckVhY2goZnVuY3Rpb24oc3RyZWFtaWQpIHtcclxuICAgICAgICB2YXIgaGFzVHJhY2sgPSBwYy5fc3RyZWFtc1tzdHJlYW1pZF0uZ2V0VHJhY2tzKCkuZmluZChmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICAgcmV0dXJuIHNlbmRlci50cmFjayA9PT0gdHJhY2s7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGhhc1RyYWNrKSB7XHJcbiAgICAgICAgICBzdHJlYW0gPSBwYy5fc3RyZWFtc1tzdHJlYW1pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChzdHJlYW0pIHtcclxuICAgICAgICBpZiAoc3RyZWFtLmdldFRyYWNrcygpLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgLy8gaWYgdGhpcyBpcyB0aGUgbGFzdCB0cmFjayBvZiB0aGUgc3RyZWFtLCByZW1vdmUgdGhlIHN0cmVhbS4gVGhpc1xyXG4gICAgICAgICAgLy8gdGFrZXMgY2FyZSBvZiBhbnkgc2hpbW1lZCBfc2VuZGVycy5cclxuICAgICAgICAgIHBjLnJlbW92ZVN0cmVhbShwYy5fcmV2ZXJzZVN0cmVhbXNbc3RyZWFtLmlkXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIHJlbHlpbmcgb24gdGhlIHNhbWUgb2RkIGNocm9tZSBiZWhhdmlvdXIgYXMgYWJvdmUuXHJcbiAgICAgICAgICBzdHJlYW0ucmVtb3ZlVHJhY2soc2VuZGVyLnRyYWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcGMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ25lZ290aWF0aW9ubmVlZGVkJykpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICB2YXIgYnJvd3NlckRldGFpbHMgPSB1dGlscy5kZXRlY3RCcm93c2VyKHdpbmRvdyk7XHJcblxyXG4gICAgLy8gVGhlIFJUQ1BlZXJDb25uZWN0aW9uIG9iamVjdC5cclxuICAgIGlmICghd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmIHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbikge1xyXG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cykge1xyXG4gICAgICAgIC8vIFRyYW5zbGF0ZSBpY2VUcmFuc3BvcnRQb2xpY3kgdG8gaWNlVHJhbnNwb3J0cyxcclxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC93ZWJydGMvaXNzdWVzL2RldGFpbD9pZD00ODY5XHJcbiAgICAgICAgLy8gdGhpcyB3YXMgZml4ZWQgaW4gTTU2IGFsb25nIHdpdGggdW5wcmVmaXhpbmcgUlRDUGVlckNvbm5lY3Rpb24uXHJcbiAgICAgICAgbG9nZ2luZygnUGVlckNvbm5lY3Rpb24nKTtcclxuICAgICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XHJcbiAgICAgICAgICBwY0NvbmZpZy5pY2VUcmFuc3BvcnRzID0gcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpO1xyXG4gICAgICB9O1xyXG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID1cclxuICAgICAgICAgIHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XHJcbiAgICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXHJcbiAgICAgIGlmICh3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xyXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBtaWdyYXRlIGZyb20gbm9uLXNwZWMgUlRDSWNlU2VydmVyLnVybCB0byBSVENJY2VTZXJ2ZXIudXJsc1xyXG4gICAgICB2YXIgT3JpZ1BlZXJDb25uZWN0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uO1xyXG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cykge1xyXG4gICAgICAgIGlmIChwY0NvbmZpZyAmJiBwY0NvbmZpZy5pY2VTZXJ2ZXJzKSB7XHJcbiAgICAgICAgICB2YXIgbmV3SWNlU2VydmVycyA9IFtdO1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwY0NvbmZpZy5pY2VTZXJ2ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBzZXJ2ZXIgPSBwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIXNlcnZlci5oYXNPd25Qcm9wZXJ0eSgndXJscycpICYmXHJcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybCcpKSB7XHJcbiAgICAgICAgICAgICAgdXRpbHMuZGVwcmVjYXRlZCgnUlRDSWNlU2VydmVyLnVybCcsICdSVENJY2VTZXJ2ZXIudXJscycpO1xyXG4gICAgICAgICAgICAgIHNlcnZlciA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VydmVyKSk7XHJcbiAgICAgICAgICAgICAgc2VydmVyLnVybHMgPSBzZXJ2ZXIudXJsO1xyXG4gICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChzZXJ2ZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGNDb25maWcuaWNlU2VydmVycyA9IG5ld0ljZVNlcnZlcnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgT3JpZ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcclxuICAgICAgfTtcclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSA9IE9yaWdQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XHJcbiAgICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gT3JpZ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgb3JpZ0dldFN0YXRzID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdGF0cztcclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbihzZWxlY3RvcixcclxuICAgICAgICBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcclxuICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XHJcblxyXG4gICAgICAvLyBJZiBzZWxlY3RvciBpcyBhIGZ1bmN0aW9uIHRoZW4gd2UgYXJlIGluIHRoZSBvbGQgc3R5bGUgc3RhdHMgc28ganVzdFxyXG4gICAgICAvLyBwYXNzIGJhY2sgdGhlIG9yaWdpbmFsIGdldFN0YXRzIGZvcm1hdCB0byBhdm9pZCBicmVha2luZyBvbGQgdXNlcnMuXHJcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdoZW4gc3BlYy1zdHlsZSBnZXRTdGF0cyBpcyBzdXBwb3J0ZWQsIHJldHVybiB0aG9zZSB3aGVuIGNhbGxlZCB3aXRoXHJcbiAgICAgIC8vIGVpdGhlciBubyBhcmd1bWVudHMgb3IgdGhlIHNlbGVjdG9yIGFyZ3VtZW50IGlzIG51bGwuXHJcbiAgICAgIGlmIChvcmlnR2V0U3RhdHMubGVuZ3RoID09PSAwICYmIChhcmd1bWVudHMubGVuZ3RoID09PSAwIHx8XHJcbiAgICAgICAgICB0eXBlb2YgYXJndW1lbnRzWzBdICE9PSAnZnVuY3Rpb24nKSkge1xyXG4gICAgICAgIHJldHVybiBvcmlnR2V0U3RhdHMuYXBwbHkodGhpcywgW10pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZml4Q2hyb21lU3RhdHNfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICB2YXIgc3RhbmRhcmRSZXBvcnQgPSB7fTtcclxuICAgICAgICB2YXIgcmVwb3J0cyA9IHJlc3BvbnNlLnJlc3VsdCgpO1xyXG4gICAgICAgIHJlcG9ydHMuZm9yRWFjaChmdW5jdGlvbihyZXBvcnQpIHtcclxuICAgICAgICAgIHZhciBzdGFuZGFyZFN0YXRzID0ge1xyXG4gICAgICAgICAgICBpZDogcmVwb3J0LmlkLFxyXG4gICAgICAgICAgICB0aW1lc3RhbXA6IHJlcG9ydC50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgIHR5cGU6IHtcclxuICAgICAgICAgICAgICBsb2NhbGNhbmRpZGF0ZTogJ2xvY2FsLWNhbmRpZGF0ZScsXHJcbiAgICAgICAgICAgICAgcmVtb3RlY2FuZGlkYXRlOiAncmVtb3RlLWNhbmRpZGF0ZSdcclxuICAgICAgICAgICAgfVtyZXBvcnQudHlwZV0gfHwgcmVwb3J0LnR5cGVcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICByZXBvcnQubmFtZXMoKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgICAgICAgc3RhbmRhcmRTdGF0c1tuYW1lXSA9IHJlcG9ydC5zdGF0KG5hbWUpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBzdGFuZGFyZFJlcG9ydFtzdGFuZGFyZFN0YXRzLmlkXSA9IHN0YW5kYXJkU3RhdHM7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzdGFuZGFyZFJlcG9ydDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcclxuICAgICAgdmFyIG1ha2VNYXBTdGF0cyA9IGZ1bmN0aW9uKHN0YXRzKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXAoT2JqZWN0LmtleXMoc3RhdHMpLm1hcChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgIHJldHVybiBba2V5LCBzdGF0c1trZXldXTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgdmFyIHN1Y2Nlc3NDYWxsYmFja1dyYXBwZXJfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgIGFyZ3NbMV0obWFrZU1hcFN0YXRzKGZpeENocm9tZVN0YXRzXyhyZXNwb25zZSkpKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzLmFwcGx5KHRoaXMsIFtzdWNjZXNzQ2FsbGJhY2tXcmFwcGVyXyxcclxuICAgICAgICAgIGFyZ3VtZW50c1swXV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBwcm9taXNlLXN1cHBvcnRcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIG9yaWdHZXRTdGF0cy5hcHBseShwYywgW1xyXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZShtYWtlTWFwU3RhdHMoZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKSkpO1xyXG4gICAgICAgICAgfSwgcmVqZWN0XSk7XHJcbiAgICAgIH0pLnRoZW4oc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gYWRkIHByb21pc2Ugc3VwcG9ydCAtLSBuYXRpdmVseSBhdmFpbGFibGUgaW4gQ2hyb21lIDUxXHJcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDUxKSB7XHJcbiAgICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxyXG4gICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XHJcbiAgICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XHJcbiAgICAgICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgICAgICAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgIG5hdGl2ZU1ldGhvZC5hcHBseShwYywgW2FyZ3NbMF0sIHJlc29sdmUsIHJlamVjdF0pO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgYXJnc1sxXS5hcHBseShudWxsLCBbXSk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICAgIGFyZ3NbMl0uYXBwbHkobnVsbCwgW2Vycl0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcHJvbWlzZSBzdXBwb3J0IGZvciBjcmVhdGVPZmZlciBhbmQgY3JlYXRlQW5zd2VyLiBBdmFpbGFibGUgKHdpdGhvdXRcclxuICAgIC8vIGJ1Z3MpIHNpbmNlIE01MjogY3JidWcvNjE5Mjg5XHJcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDUyKSB7XHJcbiAgICAgIFsnY3JlYXRlT2ZmZXInLCAnY3JlYXRlQW5zd2VyJ10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcclxuICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xyXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSB8fCAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJlxyXG4gICAgICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnKSkge1xyXG4gICAgICAgICAgICB2YXIgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICBuYXRpdmVNZXRob2QuYXBwbHkocGMsIFtyZXNvbHZlLCByZWplY3QsIG9wdHNdKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2hpbSBpbXBsaWNpdCBjcmVhdGlvbiBvZiBSVENTZXNzaW9uRGVzY3JpcHRpb24vUlRDSWNlQ2FuZGlkYXRlXHJcbiAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cclxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcclxuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XHJcbiAgICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJykgP1xyXG4gICAgICAgICAgICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA6XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKShhcmd1bWVudHNbMF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIHN1cHBvcnQgZm9yIGFkZEljZUNhbmRpZGF0ZShudWxsIG9yIHVuZGVmaW5lZClcclxuICAgIHZhciBuYXRpdmVBZGRJY2VDYW5kaWRhdGUgPVxyXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlO1xyXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCFhcmd1bWVudHNbMF0pIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzWzFdKSB7XHJcbiAgICAgICAgICBhcmd1bWVudHNbMV0uYXBwbHkobnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmF0aXZlQWRkSWNlQ2FuZGlkYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG4gIH1cclxufTtcclxuXHJcbn0se1wiLi4vdXRpbHMuanNcIjoxMyxcIi4vZ2V0dXNlcm1lZGlhXCI6Nn1dLDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4vKlxyXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxyXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXHJcbiAqICB0cmVlLlxyXG4gKi9cclxuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcbnZhciBsb2dnaW5nID0gdXRpbHMubG9nO1xyXG5cclxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gIHZhciBicm93c2VyRGV0YWlscyA9IHV0aWxzLmRldGVjdEJyb3dzZXIod2luZG93KTtcclxuICB2YXIgbmF2aWdhdG9yID0gd2luZG93ICYmIHdpbmRvdy5uYXZpZ2F0b3I7XHJcblxyXG4gIHZhciBjb25zdHJhaW50c1RvQ2hyb21lXyA9IGZ1bmN0aW9uKGMpIHtcclxuICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5tYW5kYXRvcnkgfHwgYy5vcHRpb25hbCkge1xyXG4gICAgICByZXR1cm4gYztcclxuICAgIH1cclxuICAgIHZhciBjYyA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHIgPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID8gY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xyXG4gICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIHIubWluID0gci5tYXggPSByLmV4YWN0O1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBvbGRuYW1lXyA9IGZ1bmN0aW9uKHByZWZpeCwgbmFtZSkge1xyXG4gICAgICAgIGlmIChwcmVmaXgpIHtcclxuICAgICAgICAgIHJldHVybiBwcmVmaXggKyBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIChuYW1lID09PSAnZGV2aWNlSWQnKSA/ICdzb3VyY2VJZCcgOiBuYW1lO1xyXG4gICAgICB9O1xyXG4gICAgICBpZiAoci5pZGVhbCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY2Mub3B0aW9uYWwgPSBjYy5vcHRpb25hbCB8fCBbXTtcclxuICAgICAgICB2YXIgb2MgPSB7fTtcclxuICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICBvY1tvbGRuYW1lXygnbWluJywga2V5KV0gPSByLmlkZWFsO1xyXG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XHJcbiAgICAgICAgICBvYyA9IHt9O1xyXG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJ21heCcsIGtleSldID0gci5pZGVhbDtcclxuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBvY1tvbGRuYW1lXygnJywga2V5KV0gPSByLmlkZWFsO1xyXG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHIuZXhhY3QgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xyXG4gICAgICAgIGNjLm1hbmRhdG9yeVtvbGRuYW1lXygnJywga2V5KV0gPSByLmV4YWN0O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIFsnbWluJywgJ21heCddLmZvckVhY2goZnVuY3Rpb24obWl4KSB7XHJcbiAgICAgICAgICBpZiAoclttaXhdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xyXG4gICAgICAgICAgICBjYy5tYW5kYXRvcnlbb2xkbmFtZV8obWl4LCBrZXkpXSA9IHJbbWl4XTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAoYy5hZHZhbmNlZCkge1xyXG4gICAgICBjYy5vcHRpb25hbCA9IChjYy5vcHRpb25hbCB8fCBbXSkuY29uY2F0KGMuYWR2YW5jZWQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNjO1xyXG4gIH07XHJcblxyXG4gIHZhciBzaGltQ29uc3RyYWludHNfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIGZ1bmMpIHtcclxuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uID49IDYxKSB7XHJcbiAgICAgIHJldHVybiBmdW5jKGNvbnN0cmFpbnRzKTtcclxuICAgIH1cclxuICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xyXG4gICAgaWYgKGNvbnN0cmFpbnRzICYmIHR5cGVvZiBjb25zdHJhaW50cy5hdWRpbyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgdmFyIHJlbWFwID0gZnVuY3Rpb24ob2JqLCBhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgaW4gb2JqICYmICEoYiBpbiBvYmopKSB7XHJcbiAgICAgICAgICBvYmpbYl0gPSBvYmpbYV07XHJcbiAgICAgICAgICBkZWxldGUgb2JqW2FdO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XHJcbiAgICAgIHJlbWFwKGNvbnN0cmFpbnRzLmF1ZGlvLCAnYXV0b0dhaW5Db250cm9sJywgJ2dvb2dBdXRvR2FpbkNvbnRyb2wnKTtcclxuICAgICAgcmVtYXAoY29uc3RyYWludHMuYXVkaW8sICdub2lzZVN1cHByZXNzaW9uJywgJ2dvb2dOb2lzZVN1cHByZXNzaW9uJyk7XHJcbiAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMuYXVkaW8pO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvbnN0cmFpbnRzICYmIHR5cGVvZiBjb25zdHJhaW50cy52aWRlbyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgLy8gU2hpbSBmYWNpbmdNb2RlIGZvciBtb2JpbGUgJiBzdXJmYWNlIHByby5cclxuICAgICAgdmFyIGZhY2UgPSBjb25zdHJhaW50cy52aWRlby5mYWNpbmdNb2RlO1xyXG4gICAgICBmYWNlID0gZmFjZSAmJiAoKHR5cGVvZiBmYWNlID09PSAnb2JqZWN0JykgPyBmYWNlIDoge2lkZWFsOiBmYWNlfSk7XHJcbiAgICAgIHZhciBnZXRTdXBwb3J0ZWRGYWNpbmdNb2RlTGllcyA9IGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA2NjtcclxuXHJcbiAgICAgIGlmICgoZmFjZSAmJiAoZmFjZS5leGFjdCA9PT0gJ3VzZXInIHx8IGZhY2UuZXhhY3QgPT09ICdlbnZpcm9ubWVudCcgfHxcclxuICAgICAgICAgICAgICAgICAgICBmYWNlLmlkZWFsID09PSAndXNlcicgfHwgZmFjZS5pZGVhbCA9PT0gJ2Vudmlyb25tZW50JykpICYmXHJcbiAgICAgICAgICAhKG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0U3VwcG9ydGVkQ29uc3RyYWludHMgJiZcclxuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRTdXBwb3J0ZWRDb25zdHJhaW50cygpLmZhY2luZ01vZGUgJiZcclxuICAgICAgICAgICAgIWdldFN1cHBvcnRlZEZhY2luZ01vZGVMaWVzKSkge1xyXG4gICAgICAgIGRlbGV0ZSBjb25zdHJhaW50cy52aWRlby5mYWNpbmdNb2RlO1xyXG4gICAgICAgIHZhciBtYXRjaGVzO1xyXG4gICAgICAgIGlmIChmYWNlLmV4YWN0ID09PSAnZW52aXJvbm1lbnQnIHx8IGZhY2UuaWRlYWwgPT09ICdlbnZpcm9ubWVudCcpIHtcclxuICAgICAgICAgIG1hdGNoZXMgPSBbJ2JhY2snLCAncmVhciddO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZmFjZS5leGFjdCA9PT0gJ3VzZXInIHx8IGZhY2UuaWRlYWwgPT09ICd1c2VyJykge1xyXG4gICAgICAgICAgbWF0Y2hlcyA9IFsnZnJvbnQnXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1hdGNoZXMpIHtcclxuICAgICAgICAgIC8vIExvb2sgZm9yIG1hdGNoZXMgaW4gbGFiZWwsIG9yIHVzZSBsYXN0IGNhbSBmb3IgYmFjayAodHlwaWNhbCkuXHJcbiAgICAgICAgICByZXR1cm4gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRldmljZXMpIHtcclxuICAgICAgICAgICAgZGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gZC5raW5kID09PSAndmlkZW9pbnB1dCc7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgZGV2ID0gZGV2aWNlcy5maW5kKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlcy5zb21lKGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZC5sYWJlbC50b0xvd2VyQ2FzZSgpLmluZGV4T2YobWF0Y2gpICE9PSAtMTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghZGV2ICYmIGRldmljZXMubGVuZ3RoICYmIG1hdGNoZXMuaW5kZXhPZignYmFjaycpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgIGRldiA9IGRldmljZXNbZGV2aWNlcy5sZW5ndGggLSAxXTsgLy8gbW9yZSBsaWtlbHkgdGhlIGJhY2sgY2FtXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRldikge1xyXG4gICAgICAgICAgICAgIGNvbnN0cmFpbnRzLnZpZGVvLmRldmljZUlkID0gZmFjZS5leGFjdCA/IHtleGFjdDogZGV2LmRldmljZUlkfSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2lkZWFsOiBkZXYuZGV2aWNlSWR9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMudmlkZW8pO1xyXG4gICAgICAgICAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuYyhjb25zdHJhaW50cyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjb25zdHJhaW50cy52aWRlbyk7XHJcbiAgICB9XHJcbiAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xyXG4gICAgcmV0dXJuIGZ1bmMoY29uc3RyYWludHMpO1xyXG4gIH07XHJcblxyXG4gIHZhciBzaGltRXJyb3JfID0gZnVuY3Rpb24oZSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZToge1xyXG4gICAgICAgIFBlcm1pc3Npb25EZW5pZWRFcnJvcjogJ05vdEFsbG93ZWRFcnJvcicsXHJcbiAgICAgICAgUGVybWlzc2lvbkRpc21pc3NlZEVycm9yOiAnTm90QWxsb3dlZEVycm9yJyxcclxuICAgICAgICBJbnZhbGlkU3RhdGVFcnJvcjogJ05vdEFsbG93ZWRFcnJvcicsXHJcbiAgICAgICAgRGV2aWNlc05vdEZvdW5kRXJyb3I6ICdOb3RGb3VuZEVycm9yJyxcclxuICAgICAgICBDb25zdHJhaW50Tm90U2F0aXNmaWVkRXJyb3I6ICdPdmVyY29uc3RyYWluZWRFcnJvcicsXHJcbiAgICAgICAgVHJhY2tTdGFydEVycm9yOiAnTm90UmVhZGFibGVFcnJvcicsXHJcbiAgICAgICAgTWVkaWFEZXZpY2VGYWlsZWREdWVUb1NodXRkb3duOiAnTm90QWxsb3dlZEVycm9yJyxcclxuICAgICAgICBNZWRpYURldmljZUtpbGxTd2l0Y2hPbjogJ05vdEFsbG93ZWRFcnJvcicsXHJcbiAgICAgICAgVGFiQ2FwdHVyZUVycm9yOiAnQWJvcnRFcnJvcicsXHJcbiAgICAgICAgU2NyZWVuQ2FwdHVyZUVycm9yOiAnQWJvcnRFcnJvcicsXHJcbiAgICAgICAgRGV2aWNlQ2FwdHVyZUVycm9yOiAnQWJvcnRFcnJvcidcclxuICAgICAgfVtlLm5hbWVdIHx8IGUubmFtZSxcclxuICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxyXG4gICAgICBjb25zdHJhaW50OiBlLmNvbnN0cmFpbnROYW1lLFxyXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICh0aGlzLm1lc3NhZ2UgJiYgJzogJykgKyB0aGlzLm1lc3NhZ2U7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICBzaGltQ29uc3RyYWludHNfKGNvbnN0cmFpbnRzLCBmdW5jdGlvbihjKSB7XHJcbiAgICAgIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEoYywgb25TdWNjZXNzLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKG9uRXJyb3IpIHtcclxuICAgICAgICAgIG9uRXJyb3Ioc2hpbUVycm9yXyhlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBnZXRVc2VyTWVkaWFfO1xyXG5cclxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cclxuICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XHJcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzID0ge1xyXG4gICAgICBnZXRVc2VyTWVkaWE6IGdldFVzZXJNZWRpYVByb21pc2VfLFxyXG4gICAgICBlbnVtZXJhdGVEZXZpY2VzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xyXG4gICAgICAgICAgdmFyIGtpbmRzID0ge2F1ZGlvOiAnYXVkaW9pbnB1dCcsIHZpZGVvOiAndmlkZW9pbnB1dCd9O1xyXG4gICAgICAgICAgcmV0dXJuIHdpbmRvdy5NZWRpYVN0cmVhbVRyYWNrLmdldFNvdXJjZXMoZnVuY3Rpb24oZGV2aWNlcykge1xyXG4gICAgICAgICAgICByZXNvbHZlKGRldmljZXMubWFwKGZ1bmN0aW9uKGRldmljZSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB7bGFiZWw6IGRldmljZS5sYWJlbCxcclxuICAgICAgICAgICAgICAgIGtpbmQ6IGtpbmRzW2RldmljZS5raW5kXSxcclxuICAgICAgICAgICAgICAgIGRldmljZUlkOiBkZXZpY2UuaWQsXHJcbiAgICAgICAgICAgICAgICBncm91cElkOiAnJ307XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICBnZXRTdXBwb3J0ZWRDb25zdHJhaW50czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGRldmljZUlkOiB0cnVlLCBlY2hvQ2FuY2VsbGF0aW9uOiB0cnVlLCBmYWNpbmdNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgZnJhbWVSYXRlOiB0cnVlLCBoZWlnaHQ6IHRydWUsIHdpZHRoOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIEEgc2hpbSBmb3IgZ2V0VXNlck1lZGlhIG1ldGhvZCBvbiB0aGUgbWVkaWFEZXZpY2VzIG9iamVjdC5cclxuICAvLyBUT0RPKEthcHRlbkphbnNzb24pIHJlbW92ZSBvbmNlIGltcGxlbWVudGVkIGluIENocm9tZSBzdGFibGUuXHJcbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSkge1xyXG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xyXG4gICAgICByZXR1cm4gZ2V0VXNlck1lZGlhUHJvbWlzZV8oY29uc3RyYWludHMpO1xyXG4gICAgfTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gRXZlbiB0aG91Z2ggQ2hyb21lIDQ1IGhhcyBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzIGFuZCBhIGdldFVzZXJNZWRpYVxyXG4gICAgLy8gZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIFByb21pc2UsIGl0IGRvZXMgbm90IGFjY2VwdCBzcGVjLXN0eWxlXHJcbiAgICAvLyBjb25zdHJhaW50cy5cclxuICAgIHZhciBvcmlnR2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEuXHJcbiAgICAgICAgYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcclxuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY3MpIHtcclxuICAgICAgcmV0dXJuIHNoaW1Db25zdHJhaW50c18oY3MsIGZ1bmN0aW9uKGMpIHtcclxuICAgICAgICByZXR1cm4gb3JpZ0dldFVzZXJNZWRpYShjKS50aGVuKGZ1bmN0aW9uKHN0cmVhbSkge1xyXG4gICAgICAgICAgaWYgKGMuYXVkaW8gJiYgIXN0cmVhbS5nZXRBdWRpb1RyYWNrcygpLmxlbmd0aCB8fFxyXG4gICAgICAgICAgICAgIGMudmlkZW8gJiYgIXN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICAgICAgIHRyYWNrLnN0b3AoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJycsICdOb3RGb3VuZEVycm9yJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gc3RyZWFtO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChzaGltRXJyb3JfKGUpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gRHVtbXkgZGV2aWNlY2hhbmdlIGV2ZW50IG1ldGhvZHMuXHJcbiAgLy8gVE9ETyhLYXB0ZW5KYW5zc29uKSByZW1vdmUgb25jZSBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgc3RhYmxlLlxyXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcclxuICAgIH07XHJcbiAgfVxyXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxufSx7XCIuLi91dGlscy5qc1wiOjEzfV0sNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbi8qXHJcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXHJcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcclxuICogIHRyZWUuXHJcbiAqL1xyXG4gLyogZXNsaW50LWVudiBub2RlICovXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBTRFBVdGlscyA9IHJlcXVpcmUoJ3NkcCcpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBzaGltUlRDSWNlQ2FuZGlkYXRlOiBmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIC8vIGZvdW5kYXRpb24gaXMgYXJiaXRyYXJpbHkgY2hvc2VuIGFzIGFuIGluZGljYXRvciBmb3IgZnVsbCBzdXBwb3J0IGZvclxyXG4gICAgLy8gaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYnJ0Yy1wYy8jcnRjaWNlY2FuZGlkYXRlLWludGVyZmFjZVxyXG4gICAgaWYgKCF3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlIHx8ICh3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlICYmICdmb3VuZGF0aW9uJyBpblxyXG4gICAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUucHJvdG90eXBlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIE5hdGl2ZVJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5SVENJY2VDYW5kaWRhdGU7XHJcbiAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oYXJncykge1xyXG4gICAgICAvLyBSZW1vdmUgdGhlIGE9IHdoaWNoIHNob3VsZG4ndCBiZSBwYXJ0IG9mIHRoZSBjYW5kaWRhdGUgc3RyaW5nLlxyXG4gICAgICBpZiAodHlwZW9mIGFyZ3MgPT09ICdvYmplY3QnICYmIGFyZ3MuY2FuZGlkYXRlICYmXHJcbiAgICAgICAgICBhcmdzLmNhbmRpZGF0ZS5pbmRleE9mKCdhPScpID09PSAwKSB7XHJcbiAgICAgICAgYXJncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYXJncykpO1xyXG4gICAgICAgIGFyZ3MuY2FuZGlkYXRlID0gYXJncy5jYW5kaWRhdGUuc3Vic3RyKDIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYXJncy5jYW5kaWRhdGUgJiYgYXJncy5jYW5kaWRhdGUubGVuZ3RoKSB7XHJcbiAgICAgICAgLy8gQXVnbWVudCB0aGUgbmF0aXZlIGNhbmRpZGF0ZSB3aXRoIHRoZSBwYXJzZWQgZmllbGRzLlxyXG4gICAgICAgIHZhciBuYXRpdmVDYW5kaWRhdGUgPSBuZXcgTmF0aXZlUlRDSWNlQ2FuZGlkYXRlKGFyZ3MpO1xyXG4gICAgICAgIHZhciBwYXJzZWRDYW5kaWRhdGUgPSBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShhcmdzLmNhbmRpZGF0ZSk7XHJcbiAgICAgICAgdmFyIGF1Z21lbnRlZENhbmRpZGF0ZSA9IE9iamVjdC5hc3NpZ24obmF0aXZlQ2FuZGlkYXRlLFxyXG4gICAgICAgICAgICBwYXJzZWRDYW5kaWRhdGUpO1xyXG5cclxuICAgICAgICAvLyBBZGQgYSBzZXJpYWxpemVyIHRoYXQgZG9lcyBub3Qgc2VyaWFsaXplIHRoZSBleHRyYSBhdHRyaWJ1dGVzLlxyXG4gICAgICAgIGF1Z21lbnRlZENhbmRpZGF0ZS50b0pTT04gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNhbmRpZGF0ZTogYXVnbWVudGVkQ2FuZGlkYXRlLmNhbmRpZGF0ZSxcclxuICAgICAgICAgICAgc2RwTWlkOiBhdWdtZW50ZWRDYW5kaWRhdGUuc2RwTWlkLFxyXG4gICAgICAgICAgICBzZHBNTGluZUluZGV4OiBhdWdtZW50ZWRDYW5kaWRhdGUuc2RwTUxpbmVJbmRleCxcclxuICAgICAgICAgICAgdXNlcm5hbWVGcmFnbWVudDogYXVnbWVudGVkQ2FuZGlkYXRlLnVzZXJuYW1lRnJhZ21lbnQsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGF1Z21lbnRlZENhbmRpZGF0ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3IE5hdGl2ZVJUQ0ljZUNhbmRpZGF0ZShhcmdzKTtcclxuICAgIH07XHJcbiAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlLnByb3RvdHlwZSA9IE5hdGl2ZVJUQ0ljZUNhbmRpZGF0ZS5wcm90b3R5cGU7XHJcblxyXG4gICAgLy8gSG9vayB1cCB0aGUgYXVnbWVudGVkIGNhbmRpZGF0ZSBpbiBvbmljZWNhbmRpZGF0ZSBhbmRcclxuICAgIC8vIGFkZEV2ZW50TGlzdGVuZXIoJ2ljZWNhbmRpZGF0ZScsIC4uLilcclxuICAgIHV0aWxzLndyYXBQZWVyQ29ubmVjdGlvbkV2ZW50KHdpbmRvdywgJ2ljZWNhbmRpZGF0ZScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKGUuY2FuZGlkYXRlKSB7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsICdjYW5kaWRhdGUnLCB7XHJcbiAgICAgICAgICB2YWx1ZTogbmV3IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUoZS5jYW5kaWRhdGUpLFxyXG4gICAgICAgICAgd3JpdGFibGU6ICdmYWxzZSdcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZTtcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIC8vIHNoaW1DcmVhdGVPYmplY3RVUkwgbXVzdCBiZSBjYWxsZWQgYmVmb3JlIHNoaW1Tb3VyY2VPYmplY3QgdG8gYXZvaWQgbG9vcC5cclxuXHJcbiAgc2hpbUNyZWF0ZU9iamVjdFVSTDogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICB2YXIgVVJMID0gd2luZG93ICYmIHdpbmRvdy5VUkw7XHJcblxyXG4gICAgaWYgKCEodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LkhUTUxNZWRpYUVsZW1lbnQgJiZcclxuICAgICAgICAgICdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSAmJlxyXG4gICAgICAgIFVSTC5jcmVhdGVPYmplY3RVUkwgJiYgVVJMLnJldm9rZU9iamVjdFVSTCkpIHtcclxuICAgICAgLy8gT25seSBzaGltIENyZWF0ZU9iamVjdFVSTCB1c2luZyBzcmNPYmplY3QgaWYgc3JjT2JqZWN0IGV4aXN0cy5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmF0aXZlQ3JlYXRlT2JqZWN0VVJMID0gVVJMLmNyZWF0ZU9iamVjdFVSTC5iaW5kKFVSTCk7XHJcbiAgICB2YXIgbmF0aXZlUmV2b2tlT2JqZWN0VVJMID0gVVJMLnJldm9rZU9iamVjdFVSTC5iaW5kKFVSTCk7XHJcbiAgICB2YXIgc3RyZWFtcyA9IG5ldyBNYXAoKSwgbmV3SWQgPSAwO1xyXG5cclxuICAgIFVSTC5jcmVhdGVPYmplY3RVUkwgPSBmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgaWYgKCdnZXRUcmFja3MnIGluIHN0cmVhbSkge1xyXG4gICAgICAgIHZhciB1cmwgPSAncG9seWJsb2I6JyArICgrK25ld0lkKTtcclxuICAgICAgICBzdHJlYW1zLnNldCh1cmwsIHN0cmVhbSk7XHJcbiAgICAgICAgdXRpbHMuZGVwcmVjYXRlZCgnVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pJyxcclxuICAgICAgICAgICAgJ2VsZW0uc3JjT2JqZWN0ID0gc3RyZWFtJyk7XHJcbiAgICAgICAgcmV0dXJuIHVybDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmF0aXZlQ3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XHJcbiAgICB9O1xyXG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCA9IGZ1bmN0aW9uKHVybCkge1xyXG4gICAgICBuYXRpdmVSZXZva2VPYmplY3RVUkwodXJsKTtcclxuICAgICAgc3RyZWFtcy5kZWxldGUodXJsKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGRzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NyYycpO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyYycsIHtcclxuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gZHNjLmdldC5hcHBseSh0aGlzKTtcclxuICAgICAgfSxcclxuICAgICAgc2V0OiBmdW5jdGlvbih1cmwpIHtcclxuICAgICAgICB0aGlzLnNyY09iamVjdCA9IHN0cmVhbXMuZ2V0KHVybCkgfHwgbnVsbDtcclxuICAgICAgICByZXR1cm4gZHNjLnNldC5hcHBseSh0aGlzLCBbdXJsXSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBuYXRpdmVTZXRBdHRyaWJ1dGUgPSB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUuc2V0QXR0cmlidXRlO1xyXG4gICAgd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLnNldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiAmJlxyXG4gICAgICAgICAgKCcnICsgYXJndW1lbnRzWzBdKS50b0xvd2VyQ2FzZSgpID09PSAnc3JjJykge1xyXG4gICAgICAgIHRoaXMuc3JjT2JqZWN0ID0gc3RyZWFtcy5nZXQoYXJndW1lbnRzWzFdKSB8fCBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuYXRpdmVTZXRBdHRyaWJ1dGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgc2hpbU1heE1lc3NhZ2VTaXplOiBmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIGlmICh3aW5kb3cuUlRDU2N0cFRyYW5zcG9ydCB8fCAhd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBicm93c2VyRGV0YWlscyA9IHV0aWxzLmRldGVjdEJyb3dzZXIod2luZG93KTtcclxuXHJcbiAgICBpZiAoISgnc2N0cCcgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsICdzY3RwJywge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuX3NjdHAgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHRoaXMuX3NjdHA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2N0cEluRGVzY3JpcHRpb24gPSBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xyXG4gICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKGRlc2NyaXB0aW9uLnNkcCk7XHJcbiAgICAgIHNlY3Rpb25zLnNoaWZ0KCk7XHJcbiAgICAgIHJldHVybiBzZWN0aW9ucy5zb21lKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xyXG4gICAgICAgIHZhciBtTGluZSA9IFNEUFV0aWxzLnBhcnNlTUxpbmUobWVkaWFTZWN0aW9uKTtcclxuICAgICAgICByZXR1cm4gbUxpbmUgJiYgbUxpbmUua2luZCA9PT0gJ2FwcGxpY2F0aW9uJ1xyXG4gICAgICAgICAgICAmJiBtTGluZS5wcm90b2NvbC5pbmRleE9mKCdTQ1RQJykgIT09IC0xO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGdldFJlbW90ZUZpcmVmb3hWZXJzaW9uID0gZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcclxuICAgICAgLy8gVE9ETzogSXMgdGhlcmUgYSBiZXR0ZXIgc29sdXRpb24gZm9yIGRldGVjdGluZyBGaXJlZm94P1xyXG4gICAgICB2YXIgbWF0Y2ggPSBkZXNjcmlwdGlvbi5zZHAubWF0Y2goL21vemlsbGEuLi5USElTX0lTX1NEUEFSVEEtKFxcZCspLyk7XHJcbiAgICAgIGlmIChtYXRjaCA9PT0gbnVsbCB8fCBtYXRjaC5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciB2ZXJzaW9uID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKTtcclxuICAgICAgLy8gVGVzdCBmb3IgTmFOICh5ZXMsIHRoaXMgaXMgdWdseSlcclxuICAgICAgcmV0dXJuIHZlcnNpb24gIT09IHZlcnNpb24gPyAtMSA6IHZlcnNpb247XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBnZXRDYW5TZW5kTWF4TWVzc2FnZVNpemUgPSBmdW5jdGlvbihyZW1vdGVJc0ZpcmVmb3gpIHtcclxuICAgICAgLy8gRXZlcnkgaW1wbGVtZW50YXRpb24gd2Uga25vdyBjYW4gc2VuZCBhdCBsZWFzdCA2NCBLaUIuXHJcbiAgICAgIC8vIE5vdGU6IEFsdGhvdWdoIENocm9tZSBpcyB0ZWNobmljYWxseSBhYmxlIHRvIHNlbmQgdXAgdG8gMjU2IEtpQiwgdGhlXHJcbiAgICAgIC8vICAgICAgIGRhdGEgZG9lcyBub3QgcmVhY2ggdGhlIG90aGVyIHBlZXIgcmVsaWFibHkuXHJcbiAgICAgIC8vICAgICAgIFNlZTogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3dlYnJ0Yy9pc3N1ZXMvZGV0YWlsP2lkPTg0MTlcclxuICAgICAgdmFyIGNhblNlbmRNYXhNZXNzYWdlU2l6ZSA9IDY1NTM2O1xyXG4gICAgICBpZiAoYnJvd3NlckRldGFpbHMuYnJvd3NlciA9PT0gJ2ZpcmVmb3gnKSB7XHJcbiAgICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA1Nykge1xyXG4gICAgICAgICAgaWYgKHJlbW90ZUlzRmlyZWZveCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgLy8gRkYgPCA1NyB3aWxsIHNlbmQgaW4gMTYgS2lCIGNodW5rcyB1c2luZyB0aGUgZGVwcmVjYXRlZCBQUElEXHJcbiAgICAgICAgICAgIC8vIGZyYWdtZW50YXRpb24uXHJcbiAgICAgICAgICAgIGNhblNlbmRNYXhNZXNzYWdlU2l6ZSA9IDE2Mzg0O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gSG93ZXZlciwgb3RoZXIgRkYgKGFuZCBSQVdSVEMpIGNhbiByZWFzc2VtYmxlIFBQSUQtZnJhZ21lbnRlZFxyXG4gICAgICAgICAgICAvLyBtZXNzYWdlcy4gVGh1cywgc3VwcG9ydGluZyB+MiBHaUIgd2hlbiBzZW5kaW5nLlxyXG4gICAgICAgICAgICBjYW5TZW5kTWF4TWVzc2FnZVNpemUgPSAyMTQ3NDgzNjM3O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBDdXJyZW50bHksIGFsbCBGRiA+PSA1NyB3aWxsIHJlc2V0IHRoZSByZW1vdGUgbWF4aW11bSBtZXNzYWdlIHNpemVcclxuICAgICAgICAgIC8vIHRvIHRoZSBkZWZhdWx0IHZhbHVlIHdoZW4gYSBkYXRhIGNoYW5uZWwgaXMgY3JlYXRlZCBhdCBhIGxhdGVyXHJcbiAgICAgICAgICAvLyBzdGFnZS4gOihcclxuICAgICAgICAgIC8vIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNjgzMVxyXG4gICAgICAgICAgY2FuU2VuZE1heE1lc3NhZ2VTaXplID1cclxuICAgICAgICAgICAgYnJvd3NlckRldGFpbHMudmVyc2lvbiA9PT0gNTcgPyA2NTUzNSA6IDY1NTM2O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2FuU2VuZE1heE1lc3NhZ2VTaXplO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgZ2V0TWF4TWVzc2FnZVNpemUgPSBmdW5jdGlvbihkZXNjcmlwdGlvbiwgcmVtb3RlSXNGaXJlZm94KSB7XHJcbiAgICAgIC8vIE5vdGU6IDY1NTM2IGJ5dGVzIGlzIHRoZSBkZWZhdWx0IHZhbHVlIGZyb20gdGhlIFNEUCBzcGVjLiBBbHNvLFxyXG4gICAgICAvLyAgICAgICBldmVyeSBpbXBsZW1lbnRhdGlvbiB3ZSBrbm93IHN1cHBvcnRzIHJlY2VpdmluZyA2NTUzNiBieXRlcy5cclxuICAgICAgdmFyIG1heE1lc3NhZ2VTaXplID0gNjU1MzY7XHJcblxyXG4gICAgICAvLyBGRiA1NyBoYXMgYSBzbGlnaHRseSBpbmNvcnJlY3QgZGVmYXVsdCByZW1vdGUgbWF4IG1lc3NhZ2Ugc2l6ZSwgc29cclxuICAgICAgLy8gd2UgbmVlZCB0byBhZGp1c3QgaXQgaGVyZSB0byBhdm9pZCBhIGZhaWx1cmUgd2hlbiBzZW5kaW5nLlxyXG4gICAgICAvLyBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTE0MjU2OTdcclxuICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLmJyb3dzZXIgPT09ICdmaXJlZm94J1xyXG4gICAgICAgICAgICYmIGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPT09IDU3KSB7XHJcbiAgICAgICAgbWF4TWVzc2FnZVNpemUgPSA2NTUzNTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIG1hdGNoID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoZGVzY3JpcHRpb24uc2RwLCAnYT1tYXgtbWVzc2FnZS1zaXplOicpO1xyXG4gICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIG1heE1lc3NhZ2VTaXplID0gcGFyc2VJbnQobWF0Y2hbMF0uc3Vic3RyKDE5KSwgMTApO1xyXG4gICAgICB9IGVsc2UgaWYgKGJyb3dzZXJEZXRhaWxzLmJyb3dzZXIgPT09ICdmaXJlZm94JyAmJlxyXG4gICAgICAgICAgICAgICAgICByZW1vdGVJc0ZpcmVmb3ggIT09IC0xKSB7XHJcbiAgICAgICAgLy8gSWYgdGhlIG1heGltdW0gbWVzc2FnZSBzaXplIGlzIG5vdCBwcmVzZW50IGluIHRoZSByZW1vdGUgU0RQIGFuZFxyXG4gICAgICAgIC8vIGJvdGggbG9jYWwgYW5kIHJlbW90ZSBhcmUgRmlyZWZveCwgdGhlIHJlbW90ZSBwZWVyIGNhbiByZWNlaXZlXHJcbiAgICAgICAgLy8gfjIgR2lCLlxyXG4gICAgICAgIG1heE1lc3NhZ2VTaXplID0gMjE0NzQ4MzYzNztcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbWF4TWVzc2FnZVNpemU7XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBvcmlnU2V0UmVtb3RlRGVzY3JpcHRpb24gPVxyXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0UmVtb3RlRGVzY3JpcHRpb247XHJcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgIHBjLl9zY3RwID0gbnVsbDtcclxuXHJcbiAgICAgIGlmIChzY3RwSW5EZXNjcmlwdGlvbihhcmd1bWVudHNbMF0pKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHJlbW90ZSBpcyBGRi5cclxuICAgICAgICB2YXIgaXNGaXJlZm94ID0gZ2V0UmVtb3RlRmlyZWZveFZlcnNpb24oYXJndW1lbnRzWzBdKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBtYXhpbXVtIG1lc3NhZ2Ugc2l6ZSB0aGUgbG9jYWwgcGVlciBpcyBjYXBhYmxlIG9mIHNlbmRpbmdcclxuICAgICAgICB2YXIgY2FuU2VuZE1NUyA9IGdldENhblNlbmRNYXhNZXNzYWdlU2l6ZShpc0ZpcmVmb3gpO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIG1heGltdW0gbWVzc2FnZSBzaXplIG9mIHRoZSByZW1vdGUgcGVlci5cclxuICAgICAgICB2YXIgcmVtb3RlTU1TID0gZ2V0TWF4TWVzc2FnZVNpemUoYXJndW1lbnRzWzBdLCBpc0ZpcmVmb3gpO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgZmluYWwgbWF4aW11bSBtZXNzYWdlIHNpemVcclxuICAgICAgICB2YXIgbWF4TWVzc2FnZVNpemU7XHJcbiAgICAgICAgaWYgKGNhblNlbmRNTVMgPT09IDAgJiYgcmVtb3RlTU1TID09PSAwKSB7XHJcbiAgICAgICAgICBtYXhNZXNzYWdlU2l6ZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNhblNlbmRNTVMgPT09IDAgfHwgcmVtb3RlTU1TID09PSAwKSB7XHJcbiAgICAgICAgICBtYXhNZXNzYWdlU2l6ZSA9IE1hdGgubWF4KGNhblNlbmRNTVMsIHJlbW90ZU1NUyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1heE1lc3NhZ2VTaXplID0gTWF0aC5taW4oY2FuU2VuZE1NUywgcmVtb3RlTU1TKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIGR1bW15IFJUQ1NjdHBUcmFuc3BvcnQgb2JqZWN0IGFuZCB0aGUgJ21heE1lc3NhZ2VTaXplJ1xyXG4gICAgICAgIC8vIGF0dHJpYnV0ZS5cclxuICAgICAgICB2YXIgc2N0cCA9IHt9O1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzY3RwLCAnbWF4TWVzc2FnZVNpemUnLCB7XHJcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbWF4TWVzc2FnZVNpemU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGMuX3NjdHAgPSBzY3RwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gb3JpZ1NldFJlbW90ZURlc2NyaXB0aW9uLmFwcGx5KHBjLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBzaGltU2VuZFRocm93VHlwZUVycm9yOiBmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIGlmICghKHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJlxyXG4gICAgICAgICdjcmVhdGVEYXRhQ2hhbm5lbCcgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5vdGU6IEFsdGhvdWdoIEZpcmVmb3ggPj0gNTcgaGFzIGEgbmF0aXZlIGltcGxlbWVudGF0aW9uLCB0aGUgbWF4aW11bVxyXG4gICAgLy8gICAgICAgbWVzc2FnZSBzaXplIGNhbiBiZSByZXNldCBmb3IgYWxsIGRhdGEgY2hhbm5lbHMgYXQgYSBsYXRlciBzdGFnZS5cclxuICAgIC8vICAgICAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNjgzMVxyXG5cclxuICAgIHZhciBvcmlnQ3JlYXRlRGF0YUNoYW5uZWwgPVxyXG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZURhdGFDaGFubmVsO1xyXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVEYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICB2YXIgZGF0YUNoYW5uZWwgPSBvcmlnQ3JlYXRlRGF0YUNoYW5uZWwuYXBwbHkocGMsIGFyZ3VtZW50cyk7XHJcbiAgICAgIHZhciBvcmlnRGF0YUNoYW5uZWxTZW5kID0gZGF0YUNoYW5uZWwuc2VuZDtcclxuXHJcbiAgICAgIC8vIFBhdGNoICdzZW5kJyBtZXRob2RcclxuICAgICAgZGF0YUNoYW5uZWwuc2VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBkYyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBhcmd1bWVudHNbMF07XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IGRhdGEubGVuZ3RoIHx8IGRhdGEuc2l6ZSB8fCBkYXRhLmJ5dGVMZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA+IHBjLnNjdHAubWF4TWVzc2FnZVNpemUpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJ01lc3NhZ2UgdG9vIGxhcmdlIChjYW4gc2VuZCBhIG1heGltdW0gb2YgJyArXHJcbiAgICAgICAgICAgIHBjLnNjdHAubWF4TWVzc2FnZVNpemUgKyAnIGJ5dGVzKScsICdUeXBlRXJyb3InKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9yaWdEYXRhQ2hhbm5lbFNlbmQuYXBwbHkoZGMsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICByZXR1cm4gZGF0YUNoYW5uZWw7XHJcbiAgICB9O1xyXG4gIH1cclxufTtcclxuXHJcbn0se1wiLi91dGlsc1wiOjEzLFwic2RwXCI6Mn1dLDg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4vKlxyXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxyXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXHJcbiAqICB0cmVlLlxyXG4gKi9cclxuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xyXG52YXIgc2hpbVJUQ1BlZXJDb25uZWN0aW9uID0gcmVxdWlyZSgncnRjcGVlcmNvbm5lY3Rpb24tc2hpbScpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgc2hpbUdldFVzZXJNZWRpYTogcmVxdWlyZSgnLi9nZXR1c2VybWVkaWEnKSxcclxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgdmFyIGJyb3dzZXJEZXRhaWxzID0gdXRpbHMuZGV0ZWN0QnJvd3Nlcih3aW5kb3cpO1xyXG5cclxuICAgIGlmICh3aW5kb3cuUlRDSWNlR2F0aGVyZXIpIHtcclxuICAgICAgaWYgKCF3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlKSB7XHJcbiAgICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGFyZ3MpIHtcclxuICAgICAgICAgIHJldHVybiBhcmdzO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcclxuICAgICAgICAgIHJldHVybiBhcmdzO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgLy8gdGhpcyBhZGRzIGFuIGFkZGl0aW9uYWwgZXZlbnQgbGlzdGVuZXIgdG8gTWVkaWFTdHJhY2tUcmFjayB0aGF0IHNpZ25hbHNcclxuICAgICAgLy8gd2hlbiBhIHRyYWNrcyBlbmFibGVkIHByb3BlcnR5IHdhcyBjaGFuZ2VkLiBXb3JrYXJvdW5kIGZvciBhIGJ1ZyBpblxyXG4gICAgICAvLyBhZGRTdHJlYW0sIHNlZSBiZWxvdy4gTm8gbG9uZ2VyIHJlcXVpcmVkIGluIDE1MDI1K1xyXG4gICAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDE1MDI1KSB7XHJcbiAgICAgICAgdmFyIG9yaWdNU1RFbmFibGVkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihcclxuICAgICAgICAgICAgd2luZG93Lk1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLCAnZW5hYmxlZCcpO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUsICdlbmFibGVkJywge1xyXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBvcmlnTVNURW5hYmxlZC5zZXQuY2FsbCh0aGlzLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIHZhciBldiA9IG5ldyBFdmVudCgnZW5hYmxlZCcpO1xyXG4gICAgICAgICAgICBldi5lbmFibGVkID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBPUlRDIGRlZmluZXMgdGhlIERUTUYgc2VuZGVyIGEgYml0IGRpZmZlcmVudC5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS93M2Mvb3J0Yy9pc3N1ZXMvNzE0XHJcbiAgICBpZiAod2luZG93LlJUQ1J0cFNlbmRlciAmJiAhKCdkdG1mJyBpbiB3aW5kb3cuUlRDUnRwU2VuZGVyLnByb3RvdHlwZSkpIHtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENSdHBTZW5kZXIucHJvdG90eXBlLCAnZHRtZicsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuX2R0bWYgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy50cmFjay5raW5kID09PSAnYXVkaW8nKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fZHRtZiA9IG5ldyB3aW5kb3cuUlRDRHRtZlNlbmRlcih0aGlzKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRyYWNrLmtpbmQgPT09ICd2aWRlbycpIHtcclxuICAgICAgICAgICAgICB0aGlzLl9kdG1mID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2R0bWY7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vIEVkZ2UgY3VycmVudGx5IG9ubHkgaW1wbGVtZW50cyB0aGUgUlRDRHRtZlNlbmRlciwgbm90IHRoZVxyXG4gICAgLy8gUlRDRFRNRlNlbmRlciBhbGlhcy4gU2VlIGh0dHA6Ly9kcmFmdC5vcnRjLm9yZy8jcnRjZHRtZnNlbmRlcjIqXHJcbiAgICBpZiAod2luZG93LlJUQ0R0bWZTZW5kZXIgJiYgIXdpbmRvdy5SVENEVE1GU2VuZGVyKSB7XHJcbiAgICAgIHdpbmRvdy5SVENEVE1GU2VuZGVyID0gd2luZG93LlJUQ0R0bWZTZW5kZXI7XHJcbiAgICB9XHJcblxyXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID1cclxuICAgICAgICBzaGltUlRDUGVlckNvbm5lY3Rpb24od2luZG93LCBicm93c2VyRGV0YWlscy52ZXJzaW9uKTtcclxuICB9LFxyXG4gIHNoaW1SZXBsYWNlVHJhY2s6IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgLy8gT1JUQyBoYXMgcmVwbGFjZVRyYWNrIC0tIGh0dHBzOi8vZ2l0aHViLmNvbS93M2Mvb3J0Yy9pc3N1ZXMvNjE0XHJcbiAgICBpZiAod2luZG93LlJUQ1J0cFNlbmRlciAmJlxyXG4gICAgICAgICEoJ3JlcGxhY2VUcmFjaycgaW4gd2luZG93LlJUQ1J0cFNlbmRlci5wcm90b3R5cGUpKSB7XHJcbiAgICAgIHdpbmRvdy5SVENSdHBTZW5kZXIucHJvdG90eXBlLnJlcGxhY2VUcmFjayA9XHJcbiAgICAgICAgICB3aW5kb3cuUlRDUnRwU2VuZGVyLnByb3RvdHlwZS5zZXRUcmFjaztcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG59LHtcIi4uL3V0aWxzXCI6MTMsXCIuL2dldHVzZXJtZWRpYVwiOjksXCJydGNwZWVyY29ubmVjdGlvbi1zaGltXCI6MX1dLDk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4vKlxyXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxyXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXHJcbiAqICB0cmVlLlxyXG4gKi9cclxuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24od2luZG93KSB7XHJcbiAgdmFyIG5hdmlnYXRvciA9IHdpbmRvdyAmJiB3aW5kb3cubmF2aWdhdG9yO1xyXG5cclxuICB2YXIgc2hpbUVycm9yXyA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6IHtQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InfVtlLm5hbWVdIHx8IGUubmFtZSxcclxuICAgICAgbWVzc2FnZTogZS5tZXNzYWdlLFxyXG4gICAgICBjb25zdHJhaW50OiBlLmNvbnN0cmFpbnQsXHJcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uYW1lO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIC8vIGdldFVzZXJNZWRpYSBlcnJvciBzaGltLlxyXG4gIHZhciBvcmlnR2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEuXHJcbiAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XHJcbiAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjKSB7XHJcbiAgICByZXR1cm4gb3JpZ0dldFVzZXJNZWRpYShjKS5jYXRjaChmdW5jdGlvbihlKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChzaGltRXJyb3JfKGUpKTtcclxuICAgIH0pO1xyXG4gIH07XHJcbn07XHJcblxyXG59LHt9XSwxMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XHJcbi8qXHJcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXHJcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcclxuICogIHRyZWUuXHJcbiAqL1xyXG4gLyogZXNsaW50LWVudiBub2RlICovXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpLFxyXG4gIHNoaW1PblRyYWNrOiBmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiYgISgnb250cmFjaycgaW5cclxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29udHJhY2snLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLl9vbnRyYWNrO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2sgPSBmKTtcclxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XHJcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0cmFjaztcclxuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdHJhY2t9O1xyXG4gICAgICAgICAgICAgIGV2ZW50LnRyYW5zY2VpdmVyID0ge3JlY2VpdmVyOiBldmVudC5yZWNlaXZlcn07XHJcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDVHJhY2tFdmVudCAmJlxyXG4gICAgICAgICgncmVjZWl2ZXInIGluIHdpbmRvdy5SVENUcmFja0V2ZW50LnByb3RvdHlwZSkgJiZcclxuICAgICAgICAhKCd0cmFuc2NlaXZlcicgaW4gd2luZG93LlJUQ1RyYWNrRXZlbnQucHJvdG90eXBlKSkge1xyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1RyYWNrRXZlbnQucHJvdG90eXBlLCAndHJhbnNjZWl2ZXInLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiB7cmVjZWl2ZXI6IHRoaXMucmVjZWl2ZXJ9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICAvLyBGaXJlZm94IGhhcyBzdXBwb3J0ZWQgbW96U3JjT2JqZWN0IHNpbmNlIEZGMjIsIHVucHJlZml4ZWQgaW4gNDIuXHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgaWYgKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXHJcbiAgICAgICAgISgnc3JjT2JqZWN0JyBpbiB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUpKSB7XHJcbiAgICAgICAgLy8gU2hpbSB0aGUgc3JjT2JqZWN0IHByb3BlcnR5LCBvbmNlLCB3aGVuIEhUTUxNZWRpYUVsZW1lbnQgaXMgZm91bmQuXHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyY09iamVjdCcsIHtcclxuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1velNyY09iamVjdDtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHN0cmVhbSkge1xyXG4gICAgICAgICAgICB0aGlzLm1velNyY09iamVjdCA9IHN0cmVhbTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICB2YXIgYnJvd3NlckRldGFpbHMgPSB1dGlscy5kZXRlY3RCcm93c2VyKHdpbmRvdyk7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICdvYmplY3QnIHx8ICEod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8XHJcbiAgICAgICAgd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uKSkge1xyXG4gICAgICByZXR1cm47IC8vIHByb2JhYmx5IG1lZGlhLnBlZXJjb25uZWN0aW9uLmVuYWJsZWQ9ZmFsc2UgaW4gYWJvdXQ6Y29uZmlnXHJcbiAgICB9XHJcbiAgICAvLyBUaGUgUlRDUGVlckNvbm5lY3Rpb24gb2JqZWN0LlxyXG4gICAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcclxuICAgICAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XHJcbiAgICAgICAgICAvLyAudXJscyBpcyBub3Qgc3VwcG9ydGVkIGluIEZGIDwgMzguXHJcbiAgICAgICAgICAvLyBjcmVhdGUgUlRDSWNlU2VydmVycyB3aXRoIGEgc2luZ2xlIHVybC5cclxuICAgICAgICAgIGlmIChwY0NvbmZpZyAmJiBwY0NvbmZpZy5pY2VTZXJ2ZXJzKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdJY2VTZXJ2ZXJzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGNDb25maWcuaWNlU2VydmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIHZhciBzZXJ2ZXIgPSBwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldO1xyXG4gICAgICAgICAgICAgIGlmIChzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybHMnKSkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZXJ2ZXIudXJscy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICB2YXIgbmV3U2VydmVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmVyLnVybHNbal1cclxuICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHNlcnZlci51cmxzW2pdLmluZGV4T2YoJ3R1cm4nKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1NlcnZlci51c2VybmFtZSA9IHNlcnZlci51c2VybmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdTZXJ2ZXIuY3JlZGVudGlhbCA9IHNlcnZlci5jcmVkZW50aWFsO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChuZXdTZXJ2ZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2gocGNDb25maWcuaWNlU2VydmVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBjQ29uZmlnLmljZVNlcnZlcnMgPSBuZXdJY2VTZXJ2ZXJzO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cyk7XHJcbiAgICAgIH07XHJcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPVxyXG4gICAgICAgICAgd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZTtcclxuXHJcbiAgICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXHJcbiAgICAgIGlmICh3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xyXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gd2luZG93Lm1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbjtcclxuICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5tb3pSVENJY2VDYW5kaWRhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2hpbSBhd2F5IG5lZWQgZm9yIG9ic29sZXRlIFJUQ0ljZUNhbmRpZGF0ZS9SVENTZXNzaW9uRGVzY3JpcHRpb24uXHJcbiAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cclxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcclxuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XHJcbiAgICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJykgP1xyXG4gICAgICAgICAgICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA6XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKShhcmd1bWVudHNbMF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIHN1cHBvcnQgZm9yIGFkZEljZUNhbmRpZGF0ZShudWxsIG9yIHVuZGVmaW5lZClcclxuICAgIHZhciBuYXRpdmVBZGRJY2VDYW5kaWRhdGUgPVxyXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlO1xyXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCFhcmd1bWVudHNbMF0pIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzWzFdKSB7XHJcbiAgICAgICAgICBhcmd1bWVudHNbMV0uYXBwbHkobnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmF0aXZlQWRkSWNlQ2FuZGlkYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcclxuICAgIHZhciBtYWtlTWFwU3RhdHMgPSBmdW5jdGlvbihzdGF0cykge1xyXG4gICAgICB2YXIgbWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICBPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICBtYXAuc2V0KGtleSwgc3RhdHNba2V5XSk7XHJcbiAgICAgICAgbWFwW2tleV0gPSBzdGF0c1trZXldO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIG1hcDtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIG1vZGVyblN0YXRzVHlwZXMgPSB7XHJcbiAgICAgIGluYm91bmRydHA6ICdpbmJvdW5kLXJ0cCcsXHJcbiAgICAgIG91dGJvdW5kcnRwOiAnb3V0Ym91bmQtcnRwJyxcclxuICAgICAgY2FuZGlkYXRlcGFpcjogJ2NhbmRpZGF0ZS1wYWlyJyxcclxuICAgICAgbG9jYWxjYW5kaWRhdGU6ICdsb2NhbC1jYW5kaWRhdGUnLFxyXG4gICAgICByZW1vdGVjYW5kaWRhdGU6ICdyZW1vdGUtY2FuZGlkYXRlJ1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbmF0aXZlR2V0U3RhdHMgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzO1xyXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uKFxyXG4gICAgICBzZWxlY3RvcixcclxuICAgICAgb25TdWNjLFxyXG4gICAgICBvbkVyclxyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybiBuYXRpdmVHZXRTdGF0cy5hcHBseSh0aGlzLCBbc2VsZWN0b3IgfHwgbnVsbF0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oc3RhdHMpIHtcclxuICAgICAgICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDgpIHtcclxuICAgICAgICAgICAgc3RhdHMgPSBtYWtlTWFwU3RhdHMoc3RhdHMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA1MyAmJiAhb25TdWNjKSB7XHJcbiAgICAgICAgICAgIC8vIFNoaW0gb25seSBwcm9taXNlIGdldFN0YXRzIHdpdGggc3BlYy1oeXBoZW5zIGluIHR5cGUgbmFtZXNcclxuICAgICAgICAgICAgLy8gTGVhdmUgY2FsbGJhY2sgdmVyc2lvbiBhbG9uZTsgbWlzYyBvbGQgdXNlcyBvZiBmb3JFYWNoIGJlZm9yZSBNYXBcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBzdGF0cy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXQpIHtcclxuICAgICAgICAgICAgICAgIHN0YXQudHlwZSA9IG1vZGVyblN0YXRzVHlwZXNbc3RhdC50eXBlXSB8fCBzdGF0LnR5cGU7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICBpZiAoZS5uYW1lICE9PSAnVHlwZUVycm9yJykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gQXZvaWQgVHlwZUVycm9yOiBcInR5cGVcIiBpcyByZWFkLW9ubHksIGluIG9sZCB2ZXJzaW9ucy4gMzQtNDNpc2hcclxuICAgICAgICAgICAgICBzdGF0cy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXQsIGkpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRzLnNldChpLCBPYmplY3QuYXNzaWduKHt9LCBzdGF0LCB7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6IG1vZGVyblN0YXRzVHlwZXNbc3RhdC50eXBlXSB8fCBzdGF0LnR5cGVcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHN0YXRzO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4ob25TdWNjLCBvbkVycik7XHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIHNoaW1SZW1vdmVTdHJlYW06IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gfHxcclxuICAgICAgICAncmVtb3ZlU3RyZWFtJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XHJcbiAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgIHV0aWxzLmRlcHJlY2F0ZWQoJ3JlbW92ZVN0cmVhbScsICdyZW1vdmVUcmFjaycpO1xyXG4gICAgICB0aGlzLmdldFNlbmRlcnMoKS5mb3JFYWNoKGZ1bmN0aW9uKHNlbmRlcikge1xyXG4gICAgICAgIGlmIChzZW5kZXIudHJhY2sgJiYgc3RyZWFtLmdldFRyYWNrcygpLmluZGV4T2Yoc2VuZGVyLnRyYWNrKSAhPT0gLTEpIHtcclxuICAgICAgICAgIHBjLnJlbW92ZVRyYWNrKHNlbmRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxufSx7XCIuLi91dGlsc1wiOjEzLFwiLi9nZXR1c2VybWVkaWFcIjoxMX1dLDExOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuLypcclxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcclxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxyXG4gKiAgdHJlZS5cclxuICovXHJcbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxudmFyIGxvZ2dpbmcgPSB1dGlscy5sb2c7XHJcblxyXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24od2luZG93KSB7XHJcbiAgdmFyIGJyb3dzZXJEZXRhaWxzID0gdXRpbHMuZGV0ZWN0QnJvd3Nlcih3aW5kb3cpO1xyXG4gIHZhciBuYXZpZ2F0b3IgPSB3aW5kb3cgJiYgd2luZG93Lm5hdmlnYXRvcjtcclxuICB2YXIgTWVkaWFTdHJlYW1UcmFjayA9IHdpbmRvdyAmJiB3aW5kb3cuTWVkaWFTdHJlYW1UcmFjaztcclxuXHJcbiAgdmFyIHNoaW1FcnJvcl8gPSBmdW5jdGlvbihlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOiB7XHJcbiAgICAgICAgSW50ZXJuYWxFcnJvcjogJ05vdFJlYWRhYmxlRXJyb3InLFxyXG4gICAgICAgIE5vdFN1cHBvcnRlZEVycm9yOiAnVHlwZUVycm9yJyxcclxuICAgICAgICBQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InLFxyXG4gICAgICAgIFNlY3VyaXR5RXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InXHJcbiAgICAgIH1bZS5uYW1lXSB8fCBlLm5hbWUsXHJcbiAgICAgIG1lc3NhZ2U6IHtcclxuICAgICAgICAnVGhlIG9wZXJhdGlvbiBpcyBpbnNlY3VyZS4nOiAnVGhlIHJlcXVlc3QgaXMgbm90IGFsbG93ZWQgYnkgdGhlICcgK1xyXG4gICAgICAgICd1c2VyIGFnZW50IG9yIHRoZSBwbGF0Zm9ybSBpbiB0aGUgY3VycmVudCBjb250ZXh0LidcclxuICAgICAgfVtlLm1lc3NhZ2VdIHx8IGUubWVzc2FnZSxcclxuICAgICAgY29uc3RyYWludDogZS5jb25zdHJhaW50LFxyXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICh0aGlzLm1lc3NhZ2UgJiYgJzogJykgKyB0aGlzLm1lc3NhZ2U7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgLy8gZ2V0VXNlck1lZGlhIGNvbnN0cmFpbnRzIHNoaW0uXHJcbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICB2YXIgY29uc3RyYWludHNUb0ZGMzdfID0gZnVuY3Rpb24oYykge1xyXG4gICAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMucmVxdWlyZSkge1xyXG4gICAgICAgIHJldHVybiBjO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciByZXF1aXJlID0gW107XHJcbiAgICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHIgPSBjW2tleV0gPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID9cclxuICAgICAgICAgICAgY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xyXG4gICAgICAgIGlmIChyLm1pbiAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgIHIubWF4ICE9PSB1bmRlZmluZWQgfHwgci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXF1aXJlLnB1c2goa2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICByLiBtaW4gPSByLm1heCA9IHIuZXhhY3Q7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjW2tleV0gPSByLmV4YWN0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZGVsZXRlIHIuZXhhY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIGMuYWR2YW5jZWQgPSBjLmFkdmFuY2VkIHx8IFtdO1xyXG4gICAgICAgICAgdmFyIG9jID0ge307XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG9jW2tleV0gPSB7bWluOiByLmlkZWFsLCBtYXg6IHIuaWRlYWx9O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2Nba2V5XSA9IHIuaWRlYWw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjLmFkdmFuY2VkLnB1c2gob2MpO1xyXG4gICAgICAgICAgZGVsZXRlIHIuaWRlYWw7XHJcbiAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHIpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBkZWxldGUgY1trZXldO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChyZXF1aXJlLmxlbmd0aCkge1xyXG4gICAgICAgIGMucmVxdWlyZSA9IHJlcXVpcmU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGM7XHJcbiAgICB9O1xyXG4gICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XHJcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XHJcbiAgICAgIGxvZ2dpbmcoJ3NwZWM6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xyXG4gICAgICBpZiAoY29uc3RyYWludHMuYXVkaW8pIHtcclxuICAgICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy5hdWRpbyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGNvbnN0cmFpbnRzLnZpZGVvKSB7XHJcbiAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMudmlkZW8pO1xyXG4gICAgICB9XHJcbiAgICAgIGxvZ2dpbmcoJ2ZmMzc6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIG9uU3VjY2VzcywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBvbkVycm9yKHNoaW1FcnJvcl8oZSkpO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXHJcbiAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgZ2V0VXNlck1lZGlhXyhjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIC8vIFNoaW0gZm9yIG1lZGlhRGV2aWNlcyBvbiBvbGRlciB2ZXJzaW9ucy5cclxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMpIHtcclxuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7Z2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcclxuICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH0sXHJcbiAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9XHJcbiAgICB9O1xyXG4gIH1cclxuICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPVxyXG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgfHwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcclxuICAgICAgICAgIHZhciBpbmZvcyA9IFtcclxuICAgICAgICAgICAge2tpbmQ6ICdhdWRpb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ30sXHJcbiAgICAgICAgICAgIHtraW5kOiAndmlkZW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9XHJcbiAgICAgICAgICBdO1xyXG4gICAgICAgICAgcmVzb2x2ZShpbmZvcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcblxyXG4gIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDEpIHtcclxuICAgIC8vIFdvcmsgYXJvdW5kIGh0dHA6Ly9idWd6aWwubGEvMTE2OTY2NVxyXG4gICAgdmFyIG9yZ0VudW1lcmF0ZURldmljZXMgPVxyXG4gICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcy5iaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xyXG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiBvcmdFbnVtZXJhdGVEZXZpY2VzKCkudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBpZiAoZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpIHtcclxuICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgZTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gIH1cclxuICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQ5KSB7XHJcbiAgICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxyXG4gICAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XHJcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGMpIHtcclxuICAgICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYykudGhlbihmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgICAvLyBXb3JrIGFyb3VuZCBodHRwczovL2J1Z3ppbC5sYS84MDIzMjZcclxuICAgICAgICBpZiAoYy5hdWRpbyAmJiAhc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCkubGVuZ3RoIHx8XHJcbiAgICAgICAgICAgIGMudmlkZW8gJiYgIXN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCkge1xyXG4gICAgICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICAgICAgdHJhY2suc3RvcCgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKCdUaGUgb2JqZWN0IGNhbiBub3QgYmUgZm91bmQgaGVyZS4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTm90Rm91bmRFcnJvcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyZWFtO1xyXG4gICAgICB9LCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHNoaW1FcnJvcl8oZSkpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgfVxyXG4gIGlmICghKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPiA1NSAmJlxyXG4gICAgICAnYXV0b0dhaW5Db250cm9sJyBpbiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFN1cHBvcnRlZENvbnN0cmFpbnRzKCkpKSB7XHJcbiAgICB2YXIgcmVtYXAgPSBmdW5jdGlvbihvYmosIGEsIGIpIHtcclxuICAgICAgaWYgKGEgaW4gb2JqICYmICEoYiBpbiBvYmopKSB7XHJcbiAgICAgICAgb2JqW2JdID0gb2JqW2FdO1xyXG4gICAgICAgIGRlbGV0ZSBvYmpbYV07XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdmFyIG5hdGl2ZUdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxyXG4gICAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XHJcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGMpIHtcclxuICAgICAgaWYgKHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgYy5hdWRpbyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBjID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjKSk7XHJcbiAgICAgICAgcmVtYXAoYy5hdWRpbywgJ2F1dG9HYWluQ29udHJvbCcsICdtb3pBdXRvR2FpbkNvbnRyb2wnKTtcclxuICAgICAgICByZW1hcChjLmF1ZGlvLCAnbm9pc2VTdXBwcmVzc2lvbicsICdtb3pOb2lzZVN1cHByZXNzaW9uJyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5hdGl2ZUdldFVzZXJNZWRpYShjKTtcclxuICAgIH07XHJcblxyXG4gICAgaWYgKE1lZGlhU3RyZWFtVHJhY2sgJiYgTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUuZ2V0U2V0dGluZ3MpIHtcclxuICAgICAgdmFyIG5hdGl2ZUdldFNldHRpbmdzID0gTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUuZ2V0U2V0dGluZ3M7XHJcbiAgICAgIE1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLmdldFNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG9iaiA9IG5hdGl2ZUdldFNldHRpbmdzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICAgICAgcmVtYXAob2JqLCAnbW96QXV0b0dhaW5Db250cm9sJywgJ2F1dG9HYWluQ29udHJvbCcpO1xyXG4gICAgICAgIHJlbWFwKG9iaiwgJ21vek5vaXNlU3VwcHJlc3Npb24nLCAnbm9pc2VTdXBwcmVzc2lvbicpO1xyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKE1lZGlhU3RyZWFtVHJhY2sgJiYgTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUuYXBwbHlDb25zdHJhaW50cykge1xyXG4gICAgICB2YXIgbmF0aXZlQXBwbHlDb25zdHJhaW50cyA9IE1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludHM7XHJcbiAgICAgIE1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludHMgPSBmdW5jdGlvbihjKSB7XHJcbiAgICAgICAgaWYgKHRoaXMua2luZCA9PT0gJ2F1ZGlvJyAmJiB0eXBlb2YgYyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgIGMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGMpKTtcclxuICAgICAgICAgIHJlbWFwKGMsICdhdXRvR2FpbkNvbnRyb2wnLCAnbW96QXV0b0dhaW5Db250cm9sJyk7XHJcbiAgICAgICAgICByZW1hcChjLCAnbm9pc2VTdXBwcmVzc2lvbicsICdtb3pOb2lzZVN1cHByZXNzaW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuYXRpdmVBcHBseUNvbnN0cmFpbnRzLmFwcGx5KHRoaXMsIFtjXSk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQ0KSB7XHJcbiAgICAgIHJldHVybiBnZXRVc2VyTWVkaWFfKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpO1xyXG4gICAgfVxyXG4gICAgLy8gUmVwbGFjZSBGaXJlZm94IDQ0KydzIGRlcHJlY2F0aW9uIHdhcm5pbmcgd2l0aCB1bnByZWZpeGVkIHZlcnNpb24uXHJcbiAgICB1dGlscy5kZXByZWNhdGVkKCduYXZpZ2F0b3IuZ2V0VXNlck1lZGlhJyxcclxuICAgICAgICAnbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEnKTtcclxuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKS50aGVuKG9uU3VjY2Vzcywgb25FcnJvcik7XHJcbiAgfTtcclxufTtcclxuXHJcbn0se1wiLi4vdXRpbHNcIjoxM31dLDEyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuLypcclxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcclxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxyXG4gKiAgdHJlZS5cclxuICovXHJcbid1c2Ugc3RyaWN0JztcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHNoaW1Mb2NhbFN0cmVhbXNBUEk6IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICdvYmplY3QnIHx8ICF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCEoJ2dldExvY2FsU3RyZWFtcycgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRMb2NhbFN0cmVhbXMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xvY2FsU3RyZWFtcykge1xyXG4gICAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbFN0cmVhbXM7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZiAoISgnZ2V0U3RyZWFtQnlJZCcgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdHJlYW1CeUlkID0gZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgICBpZiAodGhpcy5fbG9jYWxTdHJlYW1zKSB7XHJcbiAgICAgICAgICB0aGlzLl9sb2NhbFN0cmVhbXMuZm9yRWFjaChmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgICAgICAgaWYgKHN0cmVhbS5pZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICByZXN1bHQgPSBzdHJlYW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fcmVtb3RlU3RyZWFtcykge1xyXG4gICAgICAgICAgdGhpcy5fcmVtb3RlU3RyZWFtcy5mb3JFYWNoKGZ1bmN0aW9uKHN0cmVhbSkge1xyXG4gICAgICAgICAgICBpZiAoc3RyZWFtLmlkID09PSBpZCkge1xyXG4gICAgICAgICAgICAgIHJlc3VsdCA9IHN0cmVhbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZiAoISgnYWRkU3RyZWFtJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xyXG4gICAgICB2YXIgX2FkZFRyYWNrID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRUcmFjaztcclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xvY2FsU3RyZWFtcykge1xyXG4gICAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9sb2NhbFN0cmVhbXMuaW5kZXhPZihzdHJlYW0pID09PSAtMSkge1xyXG4gICAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zLnB1c2goc3RyZWFtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHBjID0gdGhpcztcclxuICAgICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICAgX2FkZFRyYWNrLmNhbGwocGMsIHRyYWNrLCBzdHJlYW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRUcmFjayA9IGZ1bmN0aW9uKHRyYWNrLCBzdHJlYW0pIHtcclxuICAgICAgICBpZiAoc3RyZWFtKSB7XHJcbiAgICAgICAgICBpZiAoIXRoaXMuX2xvY2FsU3RyZWFtcykge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2NhbFN0cmVhbXMgPSBbc3RyZWFtXTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fbG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zLnB1c2goc3RyZWFtKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF9hZGRUcmFjay5jYWxsKHRoaXMsIHRyYWNrLCBzdHJlYW0pO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYgKCEoJ3JlbW92ZVN0cmVhbScgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcclxuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2xvY2FsU3RyZWFtcykge1xyXG4gICAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2xvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2NhbFN0cmVhbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICAgIHZhciB0cmFja3MgPSBzdHJlYW0uZ2V0VHJhY2tzKCk7XHJcbiAgICAgICAgdGhpcy5nZXRTZW5kZXJzKCkuZm9yRWFjaChmdW5jdGlvbihzZW5kZXIpIHtcclxuICAgICAgICAgIGlmICh0cmFja3MuaW5kZXhPZihzZW5kZXIudHJhY2spICE9PSAtMSkge1xyXG4gICAgICAgICAgICBwYy5yZW1vdmVUcmFjayhzZW5kZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2hpbVJlbW90ZVN0cmVhbXNBUEk6IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICdvYmplY3QnIHx8ICF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCEoJ2dldFJlbW90ZVN0cmVhbXMnIGluIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XHJcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0UmVtb3RlU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZW1vdGVTdHJlYW1zID8gdGhpcy5fcmVtb3RlU3RyZWFtcyA6IFtdO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYgKCEoJ29uYWRkc3RyZWFtJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29uYWRkc3RyZWFtJywge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb25hZGRzdHJlYW07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGYpIHtcclxuICAgICAgICAgIHZhciBwYyA9IHRoaXM7XHJcbiAgICAgICAgICBpZiAodGhpcy5fb25hZGRzdHJlYW0pIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbmFkZHN0cmVhbSk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbmFkZHN0cmVhbXBvbHkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbmFkZHN0cmVhbSA9IGYpO1xyXG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29uYWRkc3RyZWFtcG9seSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdHJlYW1zLmZvckVhY2goZnVuY3Rpb24oc3RyZWFtKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCFwYy5fcmVtb3RlU3RyZWFtcykge1xyXG4gICAgICAgICAgICAgICAgcGMuX3JlbW90ZVN0cmVhbXMgPSBbXTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHBjLl9yZW1vdGVTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHBjLl9yZW1vdGVTdHJlYW1zLnB1c2goc3RyZWFtKTtcclxuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2FkZHN0cmVhbScpO1xyXG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbSA9IHN0cmVhbTtcclxuICAgICAgICAgICAgICBwYy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2hpbUNhbGxiYWNrc0FQSTogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ29iamVjdCcgfHwgIXdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgcHJvdG90eXBlID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZTtcclxuICAgIHZhciBjcmVhdGVPZmZlciA9IHByb3RvdHlwZS5jcmVhdGVPZmZlcjtcclxuICAgIHZhciBjcmVhdGVBbnN3ZXIgPSBwcm90b3R5cGUuY3JlYXRlQW5zd2VyO1xyXG4gICAgdmFyIHNldExvY2FsRGVzY3JpcHRpb24gPSBwcm90b3R5cGUuc2V0TG9jYWxEZXNjcmlwdGlvbjtcclxuICAgIHZhciBzZXRSZW1vdGVEZXNjcmlwdGlvbiA9IHByb3RvdHlwZS5zZXRSZW1vdGVEZXNjcmlwdGlvbjtcclxuICAgIHZhciBhZGRJY2VDYW5kaWRhdGUgPSBwcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlO1xyXG5cclxuICAgIHByb3RvdHlwZS5jcmVhdGVPZmZlciA9IGZ1bmN0aW9uKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XHJcbiAgICAgIHZhciBvcHRpb25zID0gKGFyZ3VtZW50cy5sZW5ndGggPj0gMikgPyBhcmd1bWVudHNbMl0gOiBhcmd1bWVudHNbMF07XHJcbiAgICAgIHZhciBwcm9taXNlID0gY3JlYXRlT2ZmZXIuYXBwbHkodGhpcywgW29wdGlvbnNdKTtcclxuICAgICAgaWYgKCFmYWlsdXJlQ2FsbGJhY2spIHtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuICAgICAgfVxyXG4gICAgICBwcm9taXNlLnRoZW4oc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHByb3RvdHlwZS5jcmVhdGVBbnN3ZXIgPSBmdW5jdGlvbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG4gICAgICB2YXIgb3B0aW9ucyA9IChhcmd1bWVudHMubGVuZ3RoID49IDIpID8gYXJndW1lbnRzWzJdIDogYXJndW1lbnRzWzBdO1xyXG4gICAgICB2YXIgcHJvbWlzZSA9IGNyZWF0ZUFuc3dlci5hcHBseSh0aGlzLCBbb3B0aW9uc10pO1xyXG4gICAgICBpZiAoIWZhaWx1cmVDYWxsYmFjaykge1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgICB9XHJcbiAgICAgIHByb21pc2UudGhlbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHdpdGhDYWxsYmFjayA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG4gICAgICB2YXIgcHJvbWlzZSA9IHNldExvY2FsRGVzY3JpcHRpb24uYXBwbHkodGhpcywgW2Rlc2NyaXB0aW9uXSk7XHJcbiAgICAgIGlmICghZmFpbHVyZUNhbGxiYWNrKSB7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICAgIH1cclxuICAgICAgcHJvbWlzZS50aGVuKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKTtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgfTtcclxuICAgIHByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uID0gd2l0aENhbGxiYWNrO1xyXG5cclxuICAgIHdpdGhDYWxsYmFjayA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG4gICAgICB2YXIgcHJvbWlzZSA9IHNldFJlbW90ZURlc2NyaXB0aW9uLmFwcGx5KHRoaXMsIFtkZXNjcmlwdGlvbl0pO1xyXG4gICAgICBpZiAoIWZhaWx1cmVDYWxsYmFjaykge1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgICB9XHJcbiAgICAgIHByb21pc2UudGhlbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH07XHJcbiAgICBwcm90b3R5cGUuc2V0UmVtb3RlRGVzY3JpcHRpb24gPSB3aXRoQ2FsbGJhY2s7XHJcblxyXG4gICAgd2l0aENhbGxiYWNrID0gZnVuY3Rpb24oY2FuZGlkYXRlLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG4gICAgICB2YXIgcHJvbWlzZSA9IGFkZEljZUNhbmRpZGF0ZS5hcHBseSh0aGlzLCBbY2FuZGlkYXRlXSk7XHJcbiAgICAgIGlmICghZmFpbHVyZUNhbGxiYWNrKSB7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICAgIH1cclxuICAgICAgcHJvbWlzZS50aGVuKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKTtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgfTtcclxuICAgIHByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSB3aXRoQ2FsbGJhY2s7XHJcbiAgfSxcclxuICBzaGltR2V0VXNlck1lZGlhOiBmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIHZhciBuYXZpZ2F0b3IgPSB3aW5kb3cgJiYgd2luZG93Lm5hdmlnYXRvcjtcclxuXHJcbiAgICBpZiAoIW5hdmlnYXRvci5nZXRVc2VyTWVkaWEpIHtcclxuICAgICAgaWYgKG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEpIHtcclxuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYS5iaW5kKG5hdmlnYXRvcik7XHJcbiAgICAgIH0gZWxzZSBpZiAobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyAmJlxyXG4gICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEpIHtcclxuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY29uc3RyYWludHMsIGNiLCBlcnJjYikge1xyXG4gICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpXHJcbiAgICAgICAgICAudGhlbihjYiwgZXJyY2IpO1xyXG4gICAgICAgIH0uYmluZChuYXZpZ2F0b3IpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBzaGltUlRDSWNlU2VydmVyVXJsczogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICAvLyBtaWdyYXRlIGZyb20gbm9uLXNwZWMgUlRDSWNlU2VydmVyLnVybCB0byBSVENJY2VTZXJ2ZXIudXJsc1xyXG4gICAgdmFyIE9yaWdQZWVyQ29ubmVjdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbjtcclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKSB7XHJcbiAgICAgIGlmIChwY0NvbmZpZyAmJiBwY0NvbmZpZy5pY2VTZXJ2ZXJzKSB7XHJcbiAgICAgICAgdmFyIG5ld0ljZVNlcnZlcnMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBjQ29uZmlnLmljZVNlcnZlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHZhciBzZXJ2ZXIgPSBwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldO1xyXG4gICAgICAgICAgaWYgKCFzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybHMnKSAmJlxyXG4gICAgICAgICAgICAgIHNlcnZlci5oYXNPd25Qcm9wZXJ0eSgndXJsJykpIHtcclxuICAgICAgICAgICAgdXRpbHMuZGVwcmVjYXRlZCgnUlRDSWNlU2VydmVyLnVybCcsICdSVENJY2VTZXJ2ZXIudXJscycpO1xyXG4gICAgICAgICAgICBzZXJ2ZXIgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlcnZlcikpO1xyXG4gICAgICAgICAgICBzZXJ2ZXIudXJscyA9IHNlcnZlci51cmw7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBzZXJ2ZXIudXJsO1xyXG4gICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2goc2VydmVyKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcGNDb25maWcuaWNlU2VydmVycyA9IG5ld0ljZVNlcnZlcnM7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ldyBPcmlnUGVlckNvbm5lY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpO1xyXG4gICAgfTtcclxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPSBPcmlnUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xyXG4gICAgLy8gd3JhcCBzdGF0aWMgbWV0aG9kcy4gQ3VycmVudGx5IGp1c3QgZ2VuZXJhdGVDZXJ0aWZpY2F0ZS5cclxuICAgIGlmICgnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uKSB7XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gT3JpZ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9LFxyXG4gIHNoaW1UcmFja0V2ZW50VHJhbnNjZWl2ZXI6IGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgLy8gQWRkIGV2ZW50LnRyYW5zY2VpdmVyIG1lbWJlciBvdmVyIGRlcHJlY2F0ZWQgZXZlbnQucmVjZWl2ZXJcclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiZcclxuICAgICAgICAoJ3JlY2VpdmVyJyBpbiB3aW5kb3cuUlRDVHJhY2tFdmVudC5wcm90b3R5cGUpICYmXHJcbiAgICAgICAgLy8gY2FuJ3QgY2hlY2sgJ3RyYW5zY2VpdmVyJyBpbiB3aW5kb3cuUlRDVHJhY2tFdmVudC5wcm90b3R5cGUsIGFzIGl0IGlzXHJcbiAgICAgICAgLy8gZGVmaW5lZCBmb3Igc29tZSByZWFzb24gZXZlbiB3aGVuIHdpbmRvdy5SVENUcmFuc2NlaXZlciBpcyBub3QuXHJcbiAgICAgICAgIXdpbmRvdy5SVENUcmFuc2NlaXZlcikge1xyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1RyYWNrRXZlbnQucHJvdG90eXBlLCAndHJhbnNjZWl2ZXInLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiB7cmVjZWl2ZXI6IHRoaXMucmVjZWl2ZXJ9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgc2hpbUNyZWF0ZU9mZmVyTGVnYWN5OiBmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIHZhciBvcmlnQ3JlYXRlT2ZmZXIgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZU9mZmVyO1xyXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVPZmZlciA9IGZ1bmN0aW9uKG9mZmVyT3B0aW9ucykge1xyXG4gICAgICB2YXIgcGMgPSB0aGlzO1xyXG4gICAgICBpZiAob2ZmZXJPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIC8vIHN1cHBvcnQgYml0IHZhbHVlc1xyXG4gICAgICAgICAgb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gPSAhIW9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZUF1ZGlvO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYXVkaW9UcmFuc2NlaXZlciA9IHBjLmdldFRyYW5zY2VpdmVycygpLmZpbmQoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcclxuICAgICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5zZW5kZXIudHJhY2sgJiZcclxuICAgICAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kZXIudHJhY2sua2luZCA9PT0gJ2F1ZGlvJztcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gPT09IGZhbHNlICYmIGF1ZGlvVHJhbnNjZWl2ZXIpIHtcclxuICAgICAgICAgIGlmIChhdWRpb1RyYW5zY2VpdmVyLmRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2Jykge1xyXG4gICAgICAgICAgICBpZiAoYXVkaW9UcmFuc2NlaXZlci5zZXREaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgICBhdWRpb1RyYW5zY2VpdmVyLnNldERpcmVjdGlvbignc2VuZG9ubHknKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhdWRpb1RyYW5zY2VpdmVyLmRpcmVjdGlvbiA9ICdzZW5kb25seSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoYXVkaW9UcmFuc2NlaXZlci5kaXJlY3Rpb24gPT09ICdyZWN2b25seScpIHtcclxuICAgICAgICAgICAgaWYgKGF1ZGlvVHJhbnNjZWl2ZXIuc2V0RGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgYXVkaW9UcmFuc2NlaXZlci5zZXREaXJlY3Rpb24oJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgYXVkaW9UcmFuc2NlaXZlci5kaXJlY3Rpb24gPSAnaW5hY3RpdmUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyA9PT0gdHJ1ZSAmJlxyXG4gICAgICAgICAgICAhYXVkaW9UcmFuc2NlaXZlcikge1xyXG4gICAgICAgICAgcGMuYWRkVHJhbnNjZWl2ZXIoJ2F1ZGlvJyk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIC8vIHN1cHBvcnQgYml0IHZhbHVlc1xyXG4gICAgICAgICAgb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW8gPSAhIW9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdmlkZW9UcmFuc2NlaXZlciA9IHBjLmdldFRyYW5zY2VpdmVycygpLmZpbmQoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcclxuICAgICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5zZW5kZXIudHJhY2sgJiZcclxuICAgICAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kZXIudHJhY2sua2luZCA9PT0gJ3ZpZGVvJztcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW8gPT09IGZhbHNlICYmIHZpZGVvVHJhbnNjZWl2ZXIpIHtcclxuICAgICAgICAgIGlmICh2aWRlb1RyYW5zY2VpdmVyLmRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2Jykge1xyXG4gICAgICAgICAgICB2aWRlb1RyYW5zY2VpdmVyLnNldERpcmVjdGlvbignc2VuZG9ubHknKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodmlkZW9UcmFuc2NlaXZlci5kaXJlY3Rpb24gPT09ICdyZWN2b25seScpIHtcclxuICAgICAgICAgICAgdmlkZW9UcmFuc2NlaXZlci5zZXREaXJlY3Rpb24oJ2luYWN0aXZlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbyA9PT0gdHJ1ZSAmJlxyXG4gICAgICAgICAgICAhdmlkZW9UcmFuc2NlaXZlcikge1xyXG4gICAgICAgICAgcGMuYWRkVHJhbnNjZWl2ZXIoJ3ZpZGVvJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBvcmlnQ3JlYXRlT2ZmZXIuYXBwbHkocGMsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG4gIH1cclxufTtcclxuXHJcbn0se1wiLi4vdXRpbHNcIjoxM31dLDEzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuLypcclxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcclxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxyXG4gKiAgdHJlZS5cclxuICovXHJcbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGxvZ0Rpc2FibGVkXyA9IHRydWU7XHJcbnZhciBkZXByZWNhdGlvbldhcm5pbmdzXyA9IHRydWU7XHJcblxyXG4vKipcclxuICogRXh0cmFjdCBicm93c2VyIHZlcnNpb24gb3V0IG9mIHRoZSBwcm92aWRlZCB1c2VyIGFnZW50IHN0cmluZy5cclxuICpcclxuICogQHBhcmFtIHshc3RyaW5nfSB1YXN0cmluZyB1c2VyQWdlbnQgc3RyaW5nLlxyXG4gKiBAcGFyYW0geyFzdHJpbmd9IGV4cHIgUmVndWxhciBleHByZXNzaW9uIHVzZWQgYXMgbWF0Y2ggY3JpdGVyaWEuXHJcbiAqIEBwYXJhbSB7IW51bWJlcn0gcG9zIHBvc2l0aW9uIGluIHRoZSB2ZXJzaW9uIHN0cmluZyB0byBiZSByZXR1cm5lZC5cclxuICogQHJldHVybiB7IW51bWJlcn0gYnJvd3NlciB2ZXJzaW9uLlxyXG4gKi9cclxuZnVuY3Rpb24gZXh0cmFjdFZlcnNpb24odWFzdHJpbmcsIGV4cHIsIHBvcykge1xyXG4gIHZhciBtYXRjaCA9IHVhc3RyaW5nLm1hdGNoKGV4cHIpO1xyXG4gIHJldHVybiBtYXRjaCAmJiBtYXRjaC5sZW5ndGggPj0gcG9zICYmIHBhcnNlSW50KG1hdGNoW3Bvc10sIDEwKTtcclxufVxyXG5cclxuLy8gV3JhcHMgdGhlIHBlZXJjb25uZWN0aW9uIGV2ZW50IGV2ZW50TmFtZVRvV3JhcCBpbiBhIGZ1bmN0aW9uXHJcbi8vIHdoaWNoIHJldHVybnMgdGhlIG1vZGlmaWVkIGV2ZW50IG9iamVjdC5cclxuZnVuY3Rpb24gd3JhcFBlZXJDb25uZWN0aW9uRXZlbnQod2luZG93LCBldmVudE5hbWVUb1dyYXAsIHdyYXBwZXIpIHtcclxuICBpZiAoIXdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbikge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICB2YXIgcHJvdG8gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xyXG4gIHZhciBuYXRpdmVBZGRFdmVudExpc3RlbmVyID0gcHJvdG8uYWRkRXZlbnRMaXN0ZW5lcjtcclxuICBwcm90by5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24obmF0aXZlRXZlbnROYW1lLCBjYikge1xyXG4gICAgaWYgKG5hdGl2ZUV2ZW50TmFtZSAhPT0gZXZlbnROYW1lVG9XcmFwKSB7XHJcbiAgICAgIHJldHVybiBuYXRpdmVBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbiAgICB2YXIgd3JhcHBlZENhbGxiYWNrID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICBjYih3cmFwcGVyKGUpKTtcclxuICAgIH07XHJcbiAgICB0aGlzLl9ldmVudE1hcCA9IHRoaXMuX2V2ZW50TWFwIHx8IHt9O1xyXG4gICAgdGhpcy5fZXZlbnRNYXBbY2JdID0gd3JhcHBlZENhbGxiYWNrO1xyXG4gICAgcmV0dXJuIG5hdGl2ZUFkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgW25hdGl2ZUV2ZW50TmFtZSxcclxuICAgICAgd3JhcHBlZENhbGxiYWNrXSk7XHJcbiAgfTtcclxuXHJcbiAgdmFyIG5hdGl2ZVJlbW92ZUV2ZW50TGlzdGVuZXIgPSBwcm90by5yZW1vdmVFdmVudExpc3RlbmVyO1xyXG4gIHByb3RvLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihuYXRpdmVFdmVudE5hbWUsIGNiKSB7XHJcbiAgICBpZiAobmF0aXZlRXZlbnROYW1lICE9PSBldmVudE5hbWVUb1dyYXAgfHwgIXRoaXMuX2V2ZW50TWFwXHJcbiAgICAgICAgfHwgIXRoaXMuX2V2ZW50TWFwW2NiXSkge1xyXG4gICAgICByZXR1cm4gbmF0aXZlUmVtb3ZlRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfVxyXG4gICAgdmFyIHVud3JhcHBlZENiID0gdGhpcy5fZXZlbnRNYXBbY2JdO1xyXG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50TWFwW2NiXTtcclxuICAgIHJldHVybiBuYXRpdmVSZW1vdmVFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIFtuYXRpdmVFdmVudE5hbWUsXHJcbiAgICAgIHVud3JhcHBlZENiXSk7XHJcbiAgfTtcclxuXHJcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCAnb24nICsgZXZlbnROYW1lVG9XcmFwLCB7XHJcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gdGhpc1snX29uJyArIGV2ZW50TmFtZVRvV3JhcF07XHJcbiAgICB9LFxyXG4gICAgc2V0OiBmdW5jdGlvbihjYikge1xyXG4gICAgICBpZiAodGhpc1snX29uJyArIGV2ZW50TmFtZVRvV3JhcF0pIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lVG9XcmFwLFxyXG4gICAgICAgICAgICB0aGlzWydfb24nICsgZXZlbnROYW1lVG9XcmFwXSk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXNbJ19vbicgKyBldmVudE5hbWVUb1dyYXBdO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChjYikge1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWVUb1dyYXAsXHJcbiAgICAgICAgICAgIHRoaXNbJ19vbicgKyBldmVudE5hbWVUb1dyYXBdID0gY2IpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIFV0aWxpdHkgbWV0aG9kcy5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgZXh0cmFjdFZlcnNpb246IGV4dHJhY3RWZXJzaW9uLFxyXG4gIHdyYXBQZWVyQ29ubmVjdGlvbkV2ZW50OiB3cmFwUGVlckNvbm5lY3Rpb25FdmVudCxcclxuICBkaXNhYmxlTG9nOiBmdW5jdGlvbihib29sKSB7XHJcbiAgICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykge1xyXG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcmd1bWVudCB0eXBlOiAnICsgdHlwZW9mIGJvb2wgK1xyXG4gICAgICAgICAgJy4gUGxlYXNlIHVzZSBhIGJvb2xlYW4uJyk7XHJcbiAgICB9XHJcbiAgICBsb2dEaXNhYmxlZF8gPSBib29sO1xyXG4gICAgcmV0dXJuIChib29sKSA/ICdhZGFwdGVyLmpzIGxvZ2dpbmcgZGlzYWJsZWQnIDpcclxuICAgICAgICAnYWRhcHRlci5qcyBsb2dnaW5nIGVuYWJsZWQnO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIERpc2FibGUgb3IgZW5hYmxlIGRlcHJlY2F0aW9uIHdhcm5pbmdzXHJcbiAgICogQHBhcmFtIHshYm9vbGVhbn0gYm9vbCBzZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHdhcm5pbmdzLlxyXG4gICAqL1xyXG4gIGRpc2FibGVXYXJuaW5nczogZnVuY3Rpb24oYm9vbCkge1xyXG4gICAgaWYgKHR5cGVvZiBib29sICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJndW1lbnQgdHlwZTogJyArIHR5cGVvZiBib29sICtcclxuICAgICAgICAgICcuIFBsZWFzZSB1c2UgYSBib29sZWFuLicpO1xyXG4gICAgfVxyXG4gICAgZGVwcmVjYXRpb25XYXJuaW5nc18gPSAhYm9vbDtcclxuICAgIHJldHVybiAnYWRhcHRlci5qcyBkZXByZWNhdGlvbiB3YXJuaW5ncyAnICsgKGJvb2wgPyAnZGlzYWJsZWQnIDogJ2VuYWJsZWQnKTtcclxuICB9LFxyXG5cclxuICBsb2c6IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIGlmIChsb2dEaXNhYmxlZF8pIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3MgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHN1Z2dlc3RpbmcgdGhlIG1vZGVybiBhbmQgc3BlYy1jb21wYXRpYmxlIEFQSS5cclxuICAgKi9cclxuICBkZXByZWNhdGVkOiBmdW5jdGlvbihvbGRNZXRob2QsIG5ld01ldGhvZCkge1xyXG4gICAgaWYgKCFkZXByZWNhdGlvbldhcm5pbmdzXykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLndhcm4ob2xkTWV0aG9kICsgJyBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlICcgKyBuZXdNZXRob2QgK1xyXG4gICAgICAgICcgaW5zdGVhZC4nKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBCcm93c2VyIGRldGVjdG9yLlxyXG4gICAqXHJcbiAgICogQHJldHVybiB7b2JqZWN0fSByZXN1bHQgY29udGFpbmluZyBicm93c2VyIGFuZCB2ZXJzaW9uXHJcbiAgICogICAgIHByb3BlcnRpZXMuXHJcbiAgICovXHJcbiAgZGV0ZWN0QnJvd3NlcjogZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICB2YXIgbmF2aWdhdG9yID0gd2luZG93ICYmIHdpbmRvdy5uYXZpZ2F0b3I7XHJcblxyXG4gICAgLy8gUmV0dXJuZWQgcmVzdWx0IG9iamVjdC5cclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIHJlc3VsdC5icm93c2VyID0gbnVsbDtcclxuICAgIHJlc3VsdC52ZXJzaW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBGYWlsIGVhcmx5IGlmIGl0J3Mgbm90IGEgYnJvd3NlclxyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8ICF3aW5kb3cubmF2aWdhdG9yKSB7XHJcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIGJyb3dzZXIuJztcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSkgeyAvLyBGaXJlZm94LlxyXG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdmaXJlZm94JztcclxuICAgICAgcmVzdWx0LnZlcnNpb24gPSBleHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxyXG4gICAgICAgICAgL0ZpcmVmb3hcXC8oXFxkKylcXC4vLCAxKTtcclxuICAgIH0gZWxzZSBpZiAobmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSkge1xyXG4gICAgICAvLyBDaHJvbWUsIENocm9taXVtLCBXZWJ2aWV3LCBPcGVyYS5cclxuICAgICAgLy8gVmVyc2lvbiBtYXRjaGVzIENocm9tZS9XZWJSVEMgdmVyc2lvbi5cclxuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnY2hyb21lJztcclxuICAgICAgcmVzdWx0LnZlcnNpb24gPSBleHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxyXG4gICAgICAgICAgL0Nocm9tKGV8aXVtKVxcLyhcXGQrKVxcLi8sIDIpO1xyXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzICYmXHJcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvRWRnZVxcLyhcXGQrKS4oXFxkKykkLykpIHsgLy8gRWRnZS5cclxuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnZWRnZSc7XHJcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcclxuICAgICAgICAgIC9FZGdlXFwvKFxcZCspLihcXGQrKSQvLCAyKTtcclxuICAgIH0gZWxzZSBpZiAod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmXHJcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQXBwbGVXZWJLaXRcXC8oXFxkKylcXC4vKSkgeyAvLyBTYWZhcmkuXHJcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ3NhZmFyaSc7XHJcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcclxuICAgICAgICAgIC9BcHBsZVdlYktpdFxcLyhcXGQrKVxcLi8sIDEpO1xyXG4gICAgfSBlbHNlIHsgLy8gRGVmYXVsdCBmYWxsdGhyb3VnaDogbm90IHN1cHBvcnRlZC5cclxuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnTm90IGEgc3VwcG9ydGVkIGJyb3dzZXIuJztcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufTtcclxuXHJcbn0se31dfSx7fSxbM10pKDMpXHJcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=