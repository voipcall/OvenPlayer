/**
 * Created by hoho on 2018. 7. 20..
 */
import OvenTemplate from "view/engine/OvenTemplate";
import PlayButton from "view/components/controls/playButton";
import FrameButtons from "view/components/controls/frameButtons";
import VolumeButton from "view/components/controls/volumeButton";
import ProgressBar from "view/components/controls/progressBar";
import PlaylistPanel from "view/components/controls/playlistPanel";
import LA$ from 'utils/likeA$';
import TimeDisplay from "view/components/controls/timeDisplay";
import FullScreenButton from "view/components/controls/fullScreenButton";
import Panels, {generateMainData} from "view/components/controls/settingPanel/main";
import PanelManager from "view/global/PanelManager";
import {
    READY,
    CONTENT_META, CONTENT_LEVEL_CHANGED, CONTENT_TIME_MODE_CHANGED,
    STATE_AD_LOADED,
    AD_CHANGED,
    STATE_AD_PLAYING,
    STATE_AD_PAUSED,
    STATE_AD_COMPLETE,
    OME_P2P_MODE,
    PROVIDER_RTMP,
    ERROR
} from "api/constants";
const Controls = function($container, api){
    let volumeButton = "", playButton= "", progressBar = "", timeDisplay = "", fullScreenButton = "", frameButtons = "", hasPlaylist = false;

    let webrtc_is_p2p_mode = false;
    let isLiveMode = false;

    let panelManager = PanelManager();
    const $root = LA$("#"+api.getContainerId());
    let lastContentMeta = {};

    hasPlaylist = api.getPlaylist().length > 1 ? true : false;
    let playlistPanel = "";
    let setPanelMaxHeight = function(){
        if($root.find(".ovp-setting-panel")){
            $root.find(".ovp-setting-panel").css("max-height",  $root.height() - $root.find(".ovp-bottom-panel").height() + "px");
        }
    };

    const onRendered = function($current, template){

        let initTimeDisplay = function(data){
            if(timeDisplay){
                timeDisplay.destroy();
            }
            timeDisplay = TimeDisplay($current.find(".ovp-left-controls"), api, data);
        };
        let initProgressBar = function(isAd){
            if(progressBar){
                progressBar.destroy();
            }
            progressBar = ProgressBar($current.find(".ovp-progressbar-container"), api, isAd);
        };
        let initFrameJumpButtons = function(){
            if(frameButtons){
                frameButtons.destroy();
            }
            frameButtons = FrameButtons($current.find(".ovp-controls"), api);
        };

        playButton = PlayButton($current.find(".ovp-left-controls"), api);
        volumeButton = VolumeButton($current.find(".ovp-left-controls"), api);
        fullScreenButton = FullScreenButton($current.find(".ovp-right-controls"), api);


        api.on(CONTENT_META, function(data){
            data.isP2P = webrtc_is_p2p_mode;
            lastContentMeta = data;
            initTimeDisplay(data);
            if(api.getFramerate() > 0){
                //initFrameJumpButtons();
            }else{
                if(frameButtons){
                    frameButtons.destroy();
                }
            }

            if(data.duration === Infinity){
                isLiveMode = true;
                //live
                if(progressBar){
                    progressBar.destroy();
                }
            }else{
                //vod
                initProgressBar(false);
            }

        }, template);

        api.on("resize", function(size){
            setPanelMaxHeight();
        },template);

        api.on(OME_P2P_MODE, function(isP2P){
            webrtc_is_p2p_mode = isP2P;
        }, template);



        api.on(AD_CHANGED, function(ad){
            if(ad.isLinear){
                if(progressBar){
                    progressBar.destroy();
                }
                initProgressBar(true);
                if(timeDisplay){
                    timeDisplay.destroy();
                }
                $root.addClass("linear-ad");
            }else{
                $root.removeClass("linear-ad");
            }
        }, template);

        api.on(STATE_AD_COMPLETE, function(){
            initTimeDisplay(lastContentMeta);
            if(progressBar){
                progressBar.destroy();
            }
            $root.removeClass("linear-ad");
            if(isLiveMode){

            }else{
                initProgressBar(false);
            }

        }, template);



    };
    const onDestroyed = function(template){
        api.off(CONTENT_META, null, template);
        api.off(STATE_AD_COMPLETE, null, template);
        api.off(AD_CHANGED, null, template);
        api.off(OME_P2P_MODE, null, template);
        if(timeDisplay){
            timeDisplay.destroy();
        }
        if(playButton){
            playButton.destroy();
        }
        if(progressBar){
            progressBar.destroy();
        }
        if(fullScreenButton){
            fullScreenButton.destroy();
        }
        if(volumeButton){
            volumeButton.destroy();
        }

        api.off("resize", null, template);

    };
    const events = {
        "mouseleave .ovp-controls" : function(event, $current, template){
            event.preventDefault();
            volumeButton.setMouseDown(false);
            $current.find(".ovp-volume-slider-container").removeClass("active");
        },
        "click .ovp-setting-button" : function(event, $current, template){
            event.preventDefault();
            if(panelManager.size() > 0){
                panelManager.clear();
            }else{
                let panelData = generateMainData(api);
                panelManager.add(Panels($current, api, panelData));
            }
        },
        "click .ovp-playlist-button" : function(event, $current, template){
            event.preventDefault();
            playlistPanel = PlaylistPanel($current, api);
        }
    };

    return OvenTemplate($container, "Controls",  hasPlaylist , events, onRendered, onDestroyed);
};

export default Controls;
