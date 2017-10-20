/**
 *
 * <BR>All rights reserved
 * <BR>版    本：V2.0.0
 * <BR>摘    要：视频控制页面操作视频的js
】
 */
//视频窗口的大小
var winWidth = 843;
var winHeight = 560;

var isOk = false;
var cameraList = null;//保存视频设备
var cameraSum = 0;//登录成功的不是录像机的总数
var maxWinId = 1;//保存当前的窗口数

// 全局保存当前选中窗口
var g_iWndIndex = 0; //可以不用设置这个变量，有窗口参数的接口中，不用传值
var winStreamType = Array();//保存各个窗口的清晰度
var winsCameras = Array();//保存窗口对应的视频设备信息
var camerasWinIds = Array();//保存已打开的视频设备对应的窗口编号
var openWinIds = ",";//保存已打开的视频窗口编号
var winsChannels = Array();//保存窗口对应的通道号
var winsCameraTypes = Array();//保存窗口对应的摄像头的类型（1:球机, 2:除球机以外（如：枪机））

var allFinish = true;//加载全部时是否已全部加载完成
var openSuccNum = 0;//加载全部时保存打开成功的设备数量
$(function () {
    // 初始化插件参数及插入插件
    WebVideoCtrl.I_InitPlugin(winWidth, winHeight, {
        iWndowType: 1,//设置默认的视频窗口分割个数
        cbSelWnd: function (xmlDoc) {
            g_iWndIndex = $(xmlDoc).find("SelectWnd").eq(0).text();
            if (winStreamType[g_iWndIndex] == 1 || winStreamType[g_iWndIndex] == 2) {
                $("#streamType").val(winStreamType[g_iWndIndex]);//设置该窗口清晰度
            } else {
                $("#streamType").val(2);//设置该窗口清晰度
            }
        }
    });

    // 检查插件是否已经安装过
    if (-1 == WebVideoCtrl.I_CheckPluginInstall()) {
        if (confirm("您还未安装过插件，请下载WebComponents.exe并进行安装！ \n提示：安装完成后请重启您的浏览器! 您还可以点击控制控制面板的下载插件按钮进行下载\n是否立即下载？")) {
            downloadFile();
        }
    } else {
        WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");
    }

    //绑定切换窗口个数按钮的点击事件（视频监控页面才有）
    $("div[class='laynine'] span").click(function () {
        $Mark = $(this).attr("alt");
        setLaynineCss($Mark);
        $("#wins").val($Mark);
        changeWndNum($Mark);
    });

    //码流的改变（清晰度）
    $("#streamType").change(function () {
        var obj = $("li[winId='" + g_iWndIndex + "']");
        var camera = obj.data("camera");
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
        if (null == camera || null == oWndInfo) {
            $("#streamType").val(2);
            alert("该窗口无任何视频，不能切换清晰度！");
            return;
        }
        $StreamType = $(this).val();
        if ($StreamType == 1) {
            if (confirm("提示:\n    转换为高清，清晰度将会提高，同时也将对宽带的要求提高！\n是否进行转换？")) {
                changeStreamType(camera, $StreamType);
            } else {
                $("#streamType").val(2);
            }
        } else {
            if (confirm("提示:\n    转换为流畅，对宽带的要求降低，但同时清晰度将也会下降！\n是否进行转换？")) {
                changeStreamType(camera, $StreamType);
            } else {
                $("#streamType").val(1);
            }
        }
    });

    //全屏
    $(".fullscreen").click(function () {
        WebVideoCtrl.I_FullScreen(true);
    });

    //点击打开图片抓取文件夹时
    $("#screenShot").click(function () {
        $nowPath = $("#shortPath").val();
        if ($nowPath != "") {
            //路径不为空时
            var szDirPath = WebVideoCtrl.I_OpenFileDlg(1);
        } else {
            //抓图存储的路劲为空时
            alert("抱歉，抓图保存路径暂未设置，请先进行设置");
            clickOpenFileDlg('shortPath', 0);
        }
    });

    //抓图
    $("#downPicture").click(function () {
        clickSetLocalCfg();//获取路径
        $nowPath = $("#previewPicPath").val();
        if ($nowPath != "") {
            $re = clickCapturePic();
            if ($re)
                popup("抓图成功！", 2 * 1000);
            else
                popup("抓图失败！", 2 * 1000);
        } else {
            alert("抱歉，抓图保存路径暂未设置，请先进行设置");
            clickOpenFileDlg('previewPicPath', 0);
        }
    });

    //关闭(停止一个窗口预览)
    $("#stopOne").click(function () {
        stopOne(g_iWndIndex);
    });

    //结束全部
    $("#stopAll").click(function () {
        stopAll();
    });

    //加载全部
    $("#startAll").click(function () {
        startAll();
    });
});

/**
 * 视频插件下载
 */
function downloadFile() {
    location.href = 'http://down.zjtpyq.com/hikplug/WebComponents.exe';
}

//更改某个窗口的码流状态
function changeStreamType(camera, sType) {
    if (null == camera || undefined == camera) {
        return;
    }
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        szIP = camera.streamUrl,
        iChannelID = camera.channel || 1,
        bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false;

    if ("" == szIP) {
        return;
    }

    if (oWndInfo != null) {// 已经在播放了，先停止
        WebVideoCtrl.I_Stop();
    }

    var iRet = WebVideoCtrl.I_StartRealPlay(szIP, {
        iStreamType: sType,
        iChannelID: iChannelID,
        bZeroChannel: bZeroChannel
    });
    winStreamType[g_iWndIndex] = $StreamType;//保存该窗口清晰度

    if (0 == iRet) {//开始预览成功
    } else {
    }
}

// 设置本地参数
function clickSetLocalCfg() {
    var arrXml = [];

    arrXml.push("<LocalConfigInfo>");
    arrXml.push("<PackgeSize>" + $("#packSize").val() + "</PackgeSize>");
    arrXml.push("<PlayWndType>" + $("#wndSize").val() + "</PlayWndType>");
    arrXml.push("<BuffNumberType>" + $("#netsPreach").val() + "</BuffNumberType>");
    arrXml.push("<RecordPath>" + $("#recordPath").val() + "</RecordPath>");
    arrXml.push("<CapturePath>" + $("#previewPicPath").val() + "</CapturePath>");
    arrXml.push("<PlaybackFilePath>" + $("#playbackFilePath").val() + "</PlaybackFilePath>");
    arrXml.push("<PlaybackPicPath>" + $("#playbackPicPath").val() + "</PlaybackPicPath>");
    arrXml.push("<DownloadPath>" + $("#downloadPath").val() + "</DownloadPath>");
    arrXml.push("<IVSMode>" + $("#rulesInfo").val() + "</IVSMode>");
    arrXml.push("<CaptureFileFormat>" + $("#captureFileFormat").val() + "</CaptureFileFormat>");
    arrXml.push("<ProtocolType>" + $("#protocolType").val() + "</ProtocolType>");
    arrXml.push("</LocalConfigInfo>");

    var iRet = WebVideoCtrl.I_SetLocalCfg(arrXml.join(""));

    if (0 == iRet) {//本地配置设置成功
    } else {
    }
}

// 打开选择框 0：文件夹  1：文件
function clickOpenFileDlg(id, iType) {
    var szDirPath = WebVideoCtrl.I_OpenFileDlg(iType);
    if (szDirPath != -1 && szDirPath != "" && szDirPath != null) {
        $("#" + id).val(szDirPath);
    }
}

// 抓图
function clickCapturePic() {
    var re = false;
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        var szChannelID = $("#channels").val(),
            szPicName = oWndInfo.szIP + "_" + szChannelID + "_" + new Date().getTime(),
            iRet = WebVideoCtrl.I_CapturePic(szPicName);
        if (0 == iRet) {//抓图成功
            re = true;
        } else {
            re = false;
        }
    }
    return re;
}

/**
 * 获取视频设备
 */
function getCameraDevices(stationId) {
    var params = {
        stationId: stationId,
        deviceTypeId: 7,
        branch: 7,
        ts: new Date().getTime()
    };
    $.ajax({
        url: "/camera/getCameras",
        data: params,
        type: "get",
        dataType: "json",
        success: function (data) {
            var container = $("#presetNode");
            if (data.code != SUCCESS || data.list.length == 0) {//查询失败
                container.html('<h3 class="text-danger" style="margin:10px 10px;text-align: center;">暂无视频设备</h3>');
            } else {
                container.html('<ul id="cameraList" style="overflow: hidden;width: 115px;padding-left: 8px;"></ul>');
                cameraList = data.list;
                loadCameras();
            }
        }
    });
}

//===================================新的处理方案2015-10-22=================================
//解析视频设备列表
function loadCameras() {
    //清空视频控制选项卡中的视频设备列表
    $("#cameraList").html("");

    if (null != cameraList) {
        cameraSum = cameraList.length;//设置设备的数量
        setCameraList();//加载视频列表

        isOk = true;
        setWndNum();//设置窗口分割数
    }
}

//加载视频控制选项卡中视频设备列表，视频回放选项卡中录像机下拉框
function setCameraList() {
    for (var i = 0; i < cameraList.length; i++) {
        var camera = cameraList[i];
        var deviceName = camera.device.deviceName;
        if (deviceName.length > 4) {
            deviceName = deviceName.substr(0, 3) + "...";
        }
        var li = $('<li onclick="cameraClick(this);">').addClass("mask").data("camera", camera);
        $('<a href="javascript:void(0)">').addClass("dlist").attr("title", camera.device.deviceName).html(deviceName).appendTo(li);
        var img = $('<img class="sourceType"/>');
        img.appendTo(li);
        setCameraType(camera.deviceStyle, img);
        $("#cameraList").append(li);
    }
}

/**
 * 点击视频设备开始预览
 */
function cameraClick(obj) {
    if (!isOk) {
        if (!confirm("视频设备未全部加载完成，是否仍继续（不推荐）？")) {
            return;
        }
    }
    if(!allFinish){//点击加载全部按钮后未全部加载完
        alert("未全部加载完成，请稍等！");
        return;
    }
    //var state = $(obj).find("a").attr("class");
    //if (state == "video-fail ListPub") {
    //    alert('抱歉，本设备不可读取，请检查网络与设备的状态是否正常！');
    //    return;
    //}
    var ob = $(obj).find(".sourceType").eq(0);
    if (ob.attr("title").indexOf("解析中") > 0) {
        alert("正在连接设备，请稍等！");
        return;
    }
    var camera = $(obj).data("camera");
    var channelId = camera.channel;
    var key = camera.deviceId + "_" + channelId;
    if (null != camerasWinIds[key] && undefined != camerasWinIds[key]) {
        alert("该视频已在" + camerasWinIds[key] + "号窗口打开！");
        return;
    }
    setCameraType(null, ob);//设置加载图标
    try {
        //var iRets = WebVideoCtrl.I_Logout(camera.streamUrl);
        var iRet = WebVideoCtrl.I_Login(camera.streamUrl, 1, camera.httpPort, camera.username, camera.pwd, {
            success: function (xmlDoc) {//登录成功
                setCameraType(camera.deviceStyle, ob);
                startPlay(g_iWndIndex, camera, obj);
            },
            error: function () {//登录失败
                setCameraType(camera.deviceStyle, ob);
                changeState(obj, -1);
            }
        });
        if (-1 == iRet) {//已登录
            setCameraType(camera.deviceStyle, ob);
            startPlay(g_iWndIndex, camera, obj);
        }
    } catch (e) {
        setCameraType(camera.deviceStyle, ob);
        changeState(obj, -1);
    }
}

/**
 * 设置设备类型图标
 */
function setCameraType(deviceStyle, obj) {
    if (deviceStyle == 1) {//网络录像机
        obj.attr("src", "/resources/img/hjcon/videocorder.png").attr("title", "网络录像机");
    } else if (deviceStyle == 2) {
        obj.attr("src", "/resources/img/hjcon/monitor.png").attr("title", "监控摄像头");
    } else {
        obj.attr("src", "/resources/img/jk/loading.gif").attr("title", "努力解析中...");
    }
}

/**
 * 开始预览
 * @param winId 播放的窗口号
 * @param camera 播放的视频设备对象
 * @param obj
 */
function startPlay(winId, camera, obj) {
    // 开始预览
    winId = parseInt(winId, 10);
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId),
        szIP = camera.streamUrl,
        iStreamType = parseInt($("#streamType").val(), 10),
        iChannelID = camera.channel || 1,
        bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false;
    if ("" == szIP) {
        return;
    }
    if (oWndInfo != null) {// 已经在播放了，先停止
        stopOne(winId);
    }
    var iRet = WebVideoCtrl.I_StartRealPlay(szIP, {
        iWndIndex: winId,
        iStreamType: iStreamType,
        iChannelID: iChannelID,
        bZeroChannel: bZeroChannel
    });
    winStreamType[winId] = iStreamType;//保存该窗口清晰度
    if (0 == iRet) {//预览成功
        $(obj).attr('winId', winId);
        winsCameras[winId] = camera;//保存窗口对应的视频设备信息
        var key = camera.deviceId + "_" + iChannelID;
        camerasWinIds[key] = winId;//保存已打开的视频设备对应的窗口编号
        openWinIds += winId + ",";//保存已打开的视频窗口编号
        winsChannels[winId] = iChannelID;//保存窗口对应的通道号
        winsCameraTypes[winId] = camera.cameraType;//保存窗口对应的类型（球机或枪机）
        changeState(obj, 1);
        return true;
    } else {
        changeState(obj, -1);
        return false;
    }
}

//===================================新方案end==============================================

/**
 * 解析完设备列表，设置窗口分割数
 */
function setWndNum() {
    //判断当前总视频数量,并更改窗口布局（1x1,2x2,3x3,4x4）
    if (cameraSum <= 1) {
        $('#wins').val('1');
        changeWndNum(1);
    } else if (cameraSum <= 4) {
        $('#wins').val('2');
        changeWndNum(2);
    } else if (cameraSum <= 9) {
        $('#wins').val('3');
        changeWndNum(3);
    } else if (cameraSum <= 16) {
        $('#wins').val('4');
        changeWndNum(4);
    } else {
        $('#wins').val('6');
        changeWndNum(6);
    }
}

/**
 * 窗口分割数，同时设置图标选中的样式
 */
function changeWndNum(iType) {
    iType = parseInt(iType, 10);
    maxWinId = iType * iType;//设置最大的窗口数
    setLaynineCss(iType);
    if (-1 != WebVideoCtrl.I_CheckPluginInstall()) {
        WebVideoCtrl.I_ChangeWndNum(iType);
    }
}

/**
 * 设置控制视频窗口个数的九宫格的样式（视频监控页面才有）
 * @param idx
 */
function setLaynineCss(idx) {
    $("div[class='laynine'] span:eq(0)").removeAttr("class").attr("class", "lin linone");
    $("div[class='laynine'] span:eq(1)").removeAttr("class").attr("class", "lin lintow");
    $("div[class='laynine'] span:eq(2)").removeAttr("class").attr("class", "lin linsh");
    $("div[class='laynine'] span:eq(3)").removeAttr("class").attr("class", "lin linfour");
    $("div[class='laynine'] span:eq(4)").removeAttr("class").attr("class", "lin linfive");
    if (idx <= 1) {
        $("div[class='laynine'] span:eq(0)").removeAttr("class").attr("class", "lin linone2");
    }
    if (idx == 2) {
        $("div[class='laynine'] span:eq(1)").removeAttr("class").attr("class", "lin lintow2");
    }
    if (idx == 3) {
        $("div[class='laynine'] span:eq(2)").removeAttr("class").attr("class", "lin linsh2");
    }
    if (idx == 4) {
        $("div[class='laynine'] span:eq(3)").removeAttr("class").attr("class", "lin linfour2");
    }
    if (idx == 6) {
        $("div[class='laynine'] span:eq(4)").removeAttr("class").attr("class", "lin linfive2");
    }
}

/**
 * 改变视频列表的状态
 * @param obj 页面中设备状态的容器对象或者窗口编号
 * @param state
 */
function changeState(obj, state) {
    if (typeof (obj) == "object") {
        obj = $(obj);
    } else {
        obj = $("li[winId='" + obj + "']");
    }
    if (state == 0) {//待机状态
        obj.find("a").removeAttr("class").attr("class", "video-off ListPub");
    } else if (state == 1) {//播放状态
        obj.find("a").removeAttr("class").attr("class", "video-on ListPub");
    } else if (state == -1) {//失败状态
        obj.find("a").removeAttr("class").attr("class", "video-fail ListPub");
        alert("抱歉，本设备不可读取，请检查网络与设备的状态是否正常！");
    }
}

// PTZ控制 9为自动，1,2,3,4,5,6,7,8为方向PTZ
var g_bPTZAuto = false;
function mouseDownPTZControl(iPTZIndex) {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
        bZeroChannel = $("#channels option").eq($("#channels").get(0).selectedIndex).attr("bZero") == "true" ? true : false,
        iPTZSpeed = $("#ptzspeed").val(),
        bStop = false;
    if (bZeroChannel) {// 零通道不支持云台
        return;
    }

    if (oWndInfo != null) {
        if (9 == iPTZIndex && g_bPTZAuto) {
            iPTZSpeed = 0;// 自动开启后，速度置为0可以关闭自动
            bStop = true;
        } else {
            g_bPTZAuto = false;// 点击其他方向，自动肯定会被关闭
            bStop = false;
        }

        WebVideoCtrl.I_PTZControl(iPTZIndex, bStop, {
            iPTZSpeed: iPTZSpeed,
            success: function (xmlDoc) {
                if (9 == iPTZIndex) {
                    g_bPTZAuto = !g_bPTZAuto;
                }
            },
            error: function () {
            }
        });
    }
}

// 方向PTZ停止
function mouseUpPTZControl() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(1, true, {
            success: function (xmlDoc) {//停止云台成功
            },
            error: function () {
            }
        });
    }
}

/**
 * 画面放大（变倍+）
 * @constructor
 */
function PTZZoomIn() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(10, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//调焦+成功
            },
            error: function () {
            }
        });
    }
}

/**
 * 画面放大（变倍-）
 * @constructor
 */
function PTZZoomout() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(11, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//调焦-成功
            },
            error: function () {
            }
        });
    }
}

/**
 * 变倍停止
 * @constructor
 */
function PTZZoomStop() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(11, true, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//调焦停止成功
            },
            error: function () {
            }
        });
    }
}

/**
 * 聚焦+
 * @constructor
 */
function PTZFocusIn() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(12, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//聚焦+成功
            },
            error: function () {
            }
        });
    }
}

/**
 * 聚焦-
 * @constructor
 */
function PTZFoucusOut() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(13, false, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//聚焦-成功
            },
            error: function () {
            }
        });
    }
}

/**
 * 聚焦停止
 * @constructor
 */
function PTZFoucusStop() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        WebVideoCtrl.I_PTZControl(12, true, {
            iWndIndex: g_iWndIndex,
            success: function (xmlDoc) {//聚焦停止成功
            },
            error: function () {
            }
        });
    }
}

// 打开声音
function clickOpenSound() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        var allWndInfo = WebVideoCtrl.I_GetWindowStatus();
        // 循环遍历所有窗口，如果有窗口打开了声音，先关闭
        for (var i = 0, iLen = allWndInfo.length; i < iLen; i++) {
            oWndInfo = allWndInfo[i];
            if (oWndInfo.bSound) {
                WebVideoCtrl.I_CloseSound(oWndInfo.iIndex);
                break;
            }
        }

        var iRet = WebVideoCtrl.I_OpenSound();
        if (0 == iRet) {//打开声音成功
        } else {
        }
    }
}

// 关闭声音
function clickCloseSound() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_CloseSound();
        if (0 == iRet) {//关闭声音成功
        } else {
        }
    }
}

//停止一个窗口预览
function stopOne(winId) {
    winId = parseInt(winId);
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(winId);
    if (oWndInfo != null) {
        var iRet = WebVideoCtrl.I_Stop(winId);
        if (0 == iRet) {//停止预览成功
            //现将当前窗口播放中的设备状态变为待机
            var liObj = $("li[winId='" + winId + "']");
            if (liObj.find("a").attr("class") == "video-on ListPub") {
                liObj.find("a").attr("class", "video-off ListPub");
                var cam = liObj.data("camera");
                var k = cam.deviceId + "_" + cam.channel;
                //删除原来视频设备打开对应的窗口号
                delete camerasWinIds[k];//= null;
            }
            $("li[winId='" + winId + "']").removeAttr("winId");

            winStreamType[winId] = null;//winStreamType = winStreamType.splice(winId, 1);//删除当前窗口对应的清晰度
            winsCameras[winId] = null;//winsCameras.splice(winId, 1);//删除当前窗口对应的视频设备信息
            //delete camerasWinIds[k];//删除当前设备对应的窗口号
            openWinIds = openWinIds.replace("," + winId + ",", ",");//删除当前打开的窗口号
            winsChannels[winId] = null;//winsChannels.splice(winId, 1);//删除当前窗口对应的通道号
            winsCameraTypes[winId] = null;//winsCameraTypes.splice(winId, 1);//删除当前窗口对应的摄像头类型
            //winsPresetIds[winId] = null;//winsPresetIds.splice(winId, 1);//删除当前窗口对应的预置点id
        }
    }
}

// 停止全部预览
function stopAll() {
    if (maxWinId == "" || maxWinId == null) {
        maxWinId = 16;
    }
    for (var i = 0; i < maxWinId; i++) {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(i);
        if (oWndInfo != null) {
            var iRet = WebVideoCtrl.I_Stop(i);
            if (0 == iRet) {//停止预览成功
            } else {
            }
        }
    }
    winStreamType.length = 0;//清空各窗口对应的清晰度
    winsCameras.length = 0;//清空各窗口对应的视频设备信息
    camerasWinIds = Array();//清空设备对应的窗口号
    openWinIds = ",";//清空已打开的窗口号
    winsChannels.length = 0;//清空窗口对应的通道号
    winsCameraTypes.length = 0;//清空窗口对应的摄像头类型
    //winsPresetIds.length = 0;//清空各窗口对应的预置点id
    $("#cameraList li").each(function () {//改变正在播放视频的样式
        var state = $(this).find("a").attr("class");
        //现将当前窗口播放中的列表状态变为待机
        if (state == "video-on ListPub") {
            $(this).find("a").attr("class", "video-off ListPub");
        }
        $(this).removeAttr("winId");
    });
}

// 手动加载全部预览
function startAll() {
    if (!isOk) {
        alert("视频设备未全部加载完成,请稍等！");
        return;
    }
    allFinish = false;
    stopAll();//新停止所有播放窗口
    setTimeout(function () {
        //登录设备
        startOne(0);//开启第一个设备
    }, 1000);
}

/**
 * 一个一个播放
 * @param idx
 * @returns {boolean}
 */
function startOne(idx) {
    //窗口已全部打开或者视频设备已全部打开，就不往下执行了
    if (openSuccNum >= maxWinId || idx >= cameraList.length) {
        allFinish = true;
        return false;
    }
    var obj = $("#cameraList li").eq(idx);
    var ob = obj.find(".sourceType").eq(0);
    var camera = obj.data("camera");
    setCameraType(null, ob);//设置加载图标
    checkLogin(camera, idx, obj);
}

/**
 * 验证登录是否成功
 * @param camera
 * @param idx
 * @param obj
 */
function checkLogin(camera, idx, obj) {
    var ob = obj.find(".sourceType").eq(0);
    try {
        var iRet = WebVideoCtrl.I_Login(camera.streamUrl, 1, camera.httpPort, camera.username, camera.pwd, {
            success: function (xmlDoc) {//登录成功
                setCameraType(camera.deviceStyle, ob);
                var result = startPlay(openSuccNum, camera, obj);
                if (result) {
                    openSuccNum++;
                }
                startOne(++idx);
            },
            error: function () {//登录失败
                setCameraType(camera.deviceStyle, ob);
                changeState(obj, -1);
                startOne(++idx);
            }
        });
        if (-1 == iRet) {//已登录
            setCameraType(camera.deviceStyle, ob);
            var result = startPlay(openSuccNum, camera, obj);
            if (result) {
                openSuccNum++;
            }
            startOne(++idx);
        }
    } catch (e) {
        setCameraType(camera.deviceStyle, ob);
        changeState(obj, -1);
        startOne(++idx);
    }
}
