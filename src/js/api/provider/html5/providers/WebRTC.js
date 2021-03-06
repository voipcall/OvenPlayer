/**
 * Created by hoho on 2018. 6. 11..
 */
import Provider from "api/provider/html5/Provider";
import WebRTCLoader from "api/provider/html5/providers/WebRTCLoader";
import {isWebRTC} from "utils/validator";
import {errorTrigger} from "api/provider/utils";
import {PROVIDER_WEBRTC, STATE_IDLE} from "api/constants";

/**
 * @brief   webrtc provider extended core.
 * @param   container player element.
 * @param   playerConfig    config.
 * */

const WebRTC = function(element, playerConfig, adTagUrl){
    let that = {};
    let webrtcLoader = null;
    let superDestroy_func  = null;

    let spec = {
        name : PROVIDER_WEBRTC,
        element : element,
        mse : null,
        listener : null,
        canSeek : false,
        isLive : false,
        seeking : false,
        state : STATE_IDLE,
        buffer : 0,
        framerate : 0,
        currentQuality : -1,
        currentSource : -1,
        qualityLevels : [],
        sources : [],
        adTagUrl : adTagUrl
    };

    that = Provider(spec, playerConfig, function(source){
        if(isWebRTC(source.file, source.type)){
            OvenPlayerConsole.log("WEBRTC : onBeforeLoad : ", source);
            if(webrtcLoader){
                webrtcLoader.destroy();
                webrtcLoader = null;
            }

            let loadCallback = function(stream){

                if (element.srcObject) {
                    element.srcObject = null;
                }

                element.srcObject = stream;
                that.play();
            };

            let resetCallback = function () {
                that.pause();
            };

            webrtcLoader = WebRTCLoader(that, source.file, resetCallback, loadCallback, errorTrigger);

            webrtcLoader.connect().catch(function(error){
                //that.destroy();
                //Do nothing
            });
        }
    });
    superDestroy_func = that.super('destroy');

    OvenPlayerConsole.log("WEBRTC PROVIDER LOADED.");


    that.destroy = () =>{
        if(webrtcLoader){
            webrtcLoader.destroy();
            webrtcLoader = null;
        }
        OvenPlayerConsole.log("WEBRTC :  PROVIDER DESTROYED.");

        superDestroy_func();

    };
    return that;
};


export default WebRTC;
