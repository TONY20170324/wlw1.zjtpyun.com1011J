/**
 * Copyright(c) 2004-2014,浙江托普仪器有限公司
 * All rights reserved
 * 版    本：V1.0.0
 * 摘    要：环境调控页面关于控制设备的js方法
 * 作    者：yhq
 * 日    期：2015-06-04 13:30
 */

var mode = ['auto', 'manual'], state = ['stop', 'plus', 'minus'], act = ['enable', 'disable'];
var msghtml = ''
    + '<div class="dialog modal fade msg-popup">'
    + '<div class="modal-dialog modal-sm">'
    + '<div class="modal-content">'
    + '<div class="modal-body text-center"></div>'
    + '</div>'
    + '</div>'
    + '</div>';

var $msgbox;
var offTimer;

var deviceType = 1;//设备类型1是控制设备,2是传感器
var runStatus = "";//运行状态

var flag = false;//防止重复多次请求
//设备的列表
var tmpList = null;
var syncSum = 0;//记录同步的标记
//获取当前终端的设备
function getCtrlDevices() {
    syncSum = 0;
    var params = {
        pageIndex: 1,
        pageSize: 50,
        terminalId: terminalId,
        status: -1,
        ts: new Date().getTime()
    };
    $.ajax({
        url: "/device/deviceStatus",
        data: params,
        type: "get",
        dataType: "json",
        success: function (data) {
            flag = false;
            var container = $("#ctrlList");
            if (data.code == SUCCESS) {
                var list = data.data;
                tmpList = list;
                if (list.length == 0) {
                    container.html('<h3 class="text-danger" style="margin:10px 10px;text-align: center;">无控制设备</h3>');
                    return false;
                }
                container.html("");
                var d;
                var content = "";
                for (var index = 0; index < list.length; index++) {
                    d = list[index];
                    content += getDeviceRow(d, index);
                    //var content = getDeviceRow(d, index);
                    //var row = $(content);
                    // console.log("isSync:"+d.isSync)
                    if (d.isSync == "0") {
                        syncSum++;
                    }
                    //row.appendTo(container);
                    // row.fadeIn(1000);
                }
                //console.log(content);
                container.html(content);
                initMode();
                // console.log(syncSum)
                //如果所有的都同步完成了，隐藏提示窗口
                if (syncSum == 0) {
                    if (null != $msgbox) {
                        $msgbox.modal('hide');
                    }
                }
            } else {
                container.html('<h3 class="text-danger" style="margin:10px 10px;text-align: center;">无控制设备</h3>');
            }

        }
    });
}

//获取一行设备内容
function getDeviceRow(d, index) {
    var presetToken = d.presetToken;
    if (!presetToken) {
        presetToken = "-1";
    }
    var ctrlStatus = d.ctrlStatus;
    var content = '<div class="env-item" id="device' + d.deviceId + '">'
        + '<input type="hidden"  class="dataval"  id="val' + d.deviceId + '" sync="' + d.ctrlSync
        + '"  deviceId="' + d.deviceId + '" index="' + index + '" videoId=' + d.cameraDeviceId + ' typeId="'
        + d.ctrlTypeId + '" status="' + ctrlStatus + '" devSd="' + d.devSd + '" presetToken="' + presetToken + '">'
        + '<div class="e-name">' + d.deviceName + '</div>';
    if (d.ctrlMethod == 0) {//手动
        content += '<a href="#ctrlSet" kesrc="#ctrlSet" class="e-mode"  terminal_type="' + d.devSd + '"  >' +
        '<div class="e-slider" data-state="manual" deviceId="' + d.deviceId + '" title="' + d.deviceName + '"></div></a>';
    } else {//自动
        content += '<a name="ctrlSet" class="e-mode">' +
        '<div class="e-slider marganer" data-state="auto" deviceId="' + d.deviceId + '"></div></a>';
    }
    if (d.cameraDeviceId == 0) {
        //   content += '<a class="btn-connect"  style="display: none;" onclick=\'linkTo("' + d.deviceName + '",' + d.deviceId + ',' + index + ')\' id="link' + d.deviceId + '"></a>';
    } else {
        //    content += '<a class="btn-connect btn-unconnect"   style="display: none;" onclick=\'delPreset("' + d.presetToken + '",' + d.deviceId + ',"' + d.deviceName + '",' + index + ')\' id="link' + d.deviceId + '"></a>';
    }
    content += '<div class="e-state">'
    + getDeviceStatus(d)//+ getDeviceStatus(ctrlStatus, d.devSd, d.presetToken, d.deviceId)
    + '</div>';
    content += '</div>';
    return content;
}

//根据设备的状态返回图标
function getDeviceStatus(d) {
    var ctrlStatus = d.ctrlStatus,
        devSd = d.devSd,
        upName = $.trim(d.upName),
        downName = $.trim(d.downName),
        stopName = $.trim(d.stopName);
    var s = "";
    //terminalType = parseInt(terminalType);
    //单片机传过来的终端类型0x11,0x12,0x13,0x14,0x15
    if (terminalType >= 16 && terminalType <= 32) {
        if (null == upName || "" == upName || upName.length == 0) {
            upName = "增加";
        }
        if (null == downName || "" == downName || downName.length == 0) {
            downName = "减小";
        }
        if (null == stopName || "" == stopName || stopName.length == 0) {
            stopName = "停止";
        }
        switch (devSd) {
            case 1://减小设备关联
                if ("1" == ctrlStatus) {//状态1减小
                    s = '<div data-role="minus" data-value="open">' + downName + '</div>' +
                    '<div data-role="stop" data-value="close" needSet="false">' + stopName + '</div>';
                } else if ("3" == ctrlStatus) {//状态3停止
                    s = '<div data-role="minus" data-value="close" needSet="true">' + downName + '</div>' +
                    '<div data-role="stop" data-value="open">' + stopName + '</div>';
                } else {
                    s = '<div data-role="minus" data-value="close" needSet="true">' + downName + '</div>' +
                    '<div data-role="stop" data-value="close" needSet="false">' + stopName + '</div>';
                }
                break;
            case 2://增加设备关联
                // console.log(ctrlStatus)
                if ("2" == ctrlStatus || "1" == ctrlStatus) {//2增加1打开
                    s = '<div data-role="plus" data-value="open">' + upName + '</div>' +
                    '<div data-role="stop" data-value="close" needSet="false">' + stopName + '</div>';
                } else if ("3" == ctrlStatus) {//3停止
                    s = '<div data-role="plus" data-value="close" needSet="true">' + upName + '</div>' +
                    '<div data-role="stop" data-value="open">' + stopName + '</div>';
                } else {
                    s = '<div data-role="plus" data-value="close" needSet="true">' + upName + '</div>' +
                    '<div data-role="stop" data-value="close" needSet="false">' + stopName + '</div>';
                }
                break;
            case 3://增加减小设备关联
                if (ctrlStatus == "3") {//3停止
                    s = '<div data-role="plus" data-value="close" needSet="true">' + upName + '</div>' +
                    '<div data-role="stop" data-value="open">' + stopName + '</div>' +
                    '<div data-role="minus" data-value="close" needSet="true">' + downName + '</div>';
                } else if (ctrlStatus == "2") {//2增加
                    s = '<div data-role="plus" data-value="open">' + upName + '</div>' +
                    '<div data-role="stop" data-value="close" needSet="false">' + stopName + '</div>' +
                    '<div data-role="minus" data-value="close" needSet="true">' + downName + '</div>';
                } else if (ctrlStatus == "1") {//1减小
                    s = '<div data-role="plus" data-value="close" needSet="true">' + upName + '</div>' +
                    '<div data-role="stop" data-value="close" needSet="false">' + stopName + '</div>' +
                    '<div data-role="minus" data-value="open">' + downName + '</div>';
                } else {
                    s = '<div data-role="plus" data-value="close" needSet="true">' + upName + '</div>' +
                    '<div data-role="stop" data-value="close" needSet="false">' + stopName + '</div>' +
                    '<div data-role="minus" data-value="close" needSet="true">' + downName + '</div>';
                }
                break;
        }
    }
    return s;
}

//获取操作的运行方式
function getRunStatus(deviceId, statusName) {
    var r = $("#val" + deviceId);
    var curStatus = r.attr('status');
    var index = r.attr("index");
    deviceType = 1;
    var status = 0;
    switch (statusName) {
        case "close":
            status = 0;
            break;
        case "start":
        case "minus":
            status = 1;
            break;
        case "open":
        case "plus":
            status = 2;
            break;
        case "stop":
        case "fold":
            status = 3;
            break;
        default:
            status = 5;
            break;
    }
    runStatus = status;
    return status;
}

//开始控制
function startCtrl(deviceId, runtime) {
    var url = "/device/DeviceCtrl";
    var r = $("#val" + deviceId);
    var index = r.attr("index");
    var sd = r.attr('devSd');
    var devId = r.attr('deviceId');
    var params = {
        terminalId: terminalId,
        terminalName: terminalName,
        deviceId: devId,
        devSd: sd,
        typeId: r.attr('typeId'),
        status: runStatus,
        runTime: runtime,
        terminalType:terminalType,
        serialNum:serialNum
    };
    $.ajax({
        url: url,
        data: params,
        type: "post",
        dataType: "json",
        cache: false,
        success: function (data) {
            if (data.code == SUCCESS) {
                //var d = tmpList[index];
                //$("#val" + deviceId).attr("sync", 1);
                //var content = getDeviceRow(d, index);
                //$("#device" + deviceId).html($(content).html());
                ////重新设置那一行的样式
                //var eState = $("#device" + deviceId).find(".e-mode").next();
                //eState.data('action', act[0]);
                //init_State(eState)
                parent.$.fancybox.close();//关闭弹出层
                popup("控制指令已发送，请等待30秒,暂时无法控制其它设备", 30 * 1000);
                if (timerDevice != null)
                    clearInterval(timerDevice);
                timerDevice = setInterval(getCtrlDevices, 1000 * 5);
            } else {
                alert(data.message);
                parent.$.fancybox.close();//关闭弹出层
            }
        }
    });
}

//控制设备运行
function setRunStatus(deviceId, statusName, runtime) {
    if (!terminalStatus) {
        tips("当前终端网络断开,无法进行控制操作!");
        return false;
    }
    runStatus = getRunStatus(deviceId, statusName);
    if (deviceType == 1) {
        startCtrl(deviceId, runtime);
    }
}

var popup = function (message, offTime) {
    if (!$msgbox) {
        $msgbox = $(msghtml);
        $('body').append($msgbox);
    }
    $msgbox.find(".modal-body").html(message);
    $msgbox.modal({show: true, backdrop: false});
    if (offTime == undefined) {
        offTime = 1500;
    }
    clearTimeout(offTimer);
    offTimer = setTimeout(function () {
        $msgbox.modal('hide');
    }, offTime);
};

//==========================================================================================
// 初始化 状态  停/增加/减少
function init_State(o) {
    // 清除事件
    o.find('div').off();
    // 获取状态
    var a = o.data("action");
    // 只有在手动情况下 才能绑定事件
    if (a == 'enable') {
        bindIt();
    }
    // 不管如何 都要初始化样式
    CssIt();
    // 初始化样式
    function CssIt() {
        o.find("div").each(function () {
            var m = $(this), role = m.data('role'), v = m.data('value');
            var rcss = 's-' + (a == 'enable' ? "" : "disable") + " s-" + v;
            // 添加 i 标签 用于显示开光状态
            if (m.find('i').length < 1) {
                $("<i>").appendTo(m);
            }
            m.removeClass().addClass(rcss);
            if (a == 'enable') {
                m.attr("href", "#runtimeSet");
            }
        });
    }

    // 绑定事件
    function bindIt() {
        //// 点击事件
        //o.find("div").on("click", function () {
        //    var m = $(this), v = m.data('value');
        //    if (v == 'close') {
        //        setRunStatus(m.parent().parent().find("input").attr("deviceid"), m.data('role'));
        //    }
        //    //o.find("div").data('value', 'close');
        //    //m.data('value', 'open');
        //    //send_action(m);
        //    CssIt();
        //});
        o.find("div").each(function () {
            var that = $(this);
            // 划过事件
            that.hover(function () {
                $(this).addClass('s-hover');
            }, function () {
                $(this).removeClass('s-hover');
            });

            var v = that.data('value');
            if (v == 'close') {
                var deviceId = that.parent().parent().find("input").attr("deviceid");
                var needSet = that.attr("needSet");
                if ("true" == needSet) {//需要设置控制时间就弹出层
                    that.fancybox({
                        'titlePosition': 'outside',
                        'transitionIn': 'elastic',
                        'transitionOut': 'elastic',
                        'autoDimensions': false,
                        'width': 220,
                        'height': 230,
                        'padding': 0,
                        'topRatio': 0.4,
                        'leftRatio': 0.92,
                        'scrolling': 'no',
                        closeBtn: false,
                        afterLoad: function () {
                            var title = that.parent().parent().find(".e-name").html();
                            $("#runtimeSetTitle").html(title);
                            $("#deviceId").val(deviceId);
                            $("#role").val(that.data('role'));
                            $.ajax({
                                url: "/station/ctrl/getCtrlById",
                                data: {
                                    deviceId: deviceId
                                },
                                type: "get",
                                dataType: "json",
                                cache: false,
                                success: function (data) {
                                    if (data.code != 1) {
                                        alert(data.message);
                                        $.fancybox.close();
                                        return;
                                    }
                                    var d = data.data;
                                    $("#runTime").val(d.runTime / 60);//秒转化成分钟
                                }
                            });
                            vali();
                        },
                        afterClose: function () {
                            jQuery('#runtimeSetForm').validationEngine("hideAll");
                        }
                    });
                } else {//不需要设置控制时间就直接设置运行状态
                    that.on("click", function () {
                        setRunStatus(deviceId, that.data('role'), null);
                    });
                }
            }
        });
    }
}

//初始化模式
function initMode() {
    // 选择模式
    $(".e-mode").each(function () {
        var m = $(this);
        var that = m.find(".e-slider");
        // 向右滑动
        var r = function () {
            that.stop(true, true).animate({'left': '45px'}).data('state', mode[1]);
            b(1);
        };
        // 向左滑动
        var l = function () {
            that.stop(true, true).animate({'left': '5px'}).data('state', mode[0]);
            b(0);
        };
        // 操作按钮
        var b = function (flag) {
            var eState = m.next();
            eState.data('action', act[flag]);
            init_State(eState);
        };
        // init
        that.data('state') == mode[1] ? l() : r();

        // click event
        m.on("click", function () {
            var v = that.data('state');
            if (v == mode[1]) {
                setMode(m.parent().find("input").attr("deviceid"), v == mode[1] ? 0 : 1, null, null);
            }
        });
    });
    if (terminalType != 22) { //终端类型 不等于22
        bindSetBox();
    }

}

//========================设置上下限弹出层部分================================
/**
 * add by yhq on 2015-06-24
 * 绑定弹出层
 */
function bindSetBox() {
    $(".e-mode").each(function () {
        var m = $(this);
        var that = m.find(".e-slider");
        var v = that.data('state');
        if (v == mode[0]) {
            m.fancybox({
                'titlePosition': 'outside',
                'transitionIn': 'elastic',
                'transitionOut': 'elastic',
                'autoDimensions': false,
                'width': 220,
                'height': 230,
                'padding': 0,
                'topRatio': 0.4,
                'leftRatio': 0.92,
                'scrolling': 'no',
                closeBtn: false,
                afterLoad: function () {
                    var deviceId = that.attr("deviceid");
                    var title = that.attr("title");
                    $("#ctrlSetTitle").html(title);
                    $("#ctrlId").val(deviceId);
                    $.ajax({
                        url: "/station/ctrl/getCtrlById",
                        data: {
                            deviceId: deviceId
                        },
                        type: "get",
                        dataType: "json",
                        cache: false,
                        success: function (data) {
                            if (data.code != 1) {
                                alert(data.message);
                                $.fancybox.close();
                                return;
                            }
                            var d = data.data;
                            //$("#max").val(d.max);
                            //$("#min").val(d.min);
                            $("#snsUpVal").val(d.snsUpVal);
                            $("#snsLowVal").val(d.snsLowVal);
                            $(".s1-input").each(function () {
                                $(this).find(".sensorUnit").text(data.message);
                            });
                        }
                    });
                    validate();
                },
                afterClose: function () {
                    jQuery('#dsForm').validationEngine("hideAll");
                }
            });
        }
    });
}

/**
 * add by yhq on 2015-06-24
 * 设置控制模式
 * @param deviceId
 * @param ctrlMode
 * @param snsUpVal
 * @param snsLowVal
 */
function setMode(deviceId, ctrlMode, snsUpVal, snsLowVal) {
    //设置模式，手动（0）或自动（1）
    $.ajax({
        url: "/ctrl/SetRunMod2",
        data: {
            deviceId: deviceId,
            ctrlMethod: ctrlMode,
            snsUpVal: snsUpVal,
            snsLowVal: snsLowVal,
            terminalType:terminalType,
            serialNum:serialNum
        },
        type: "post",
        dataType: "json",
        cache: false,
        success: function (data) {
            if (data.code == SUCCESS) {
                $.fancybox.close();//关闭弹出层
                popup("请耐心等待30秒，控制指令已发送，暂时无法控制其它设备", 30 * 1000);
                if (timerDevice != null)
                    clearInterval(timerDevice);
                timerDevice = setInterval(getCtrlDevices, 1000 * 5);
                //v == mode[1] ? l() : r();
                //send_action(that);
            } else {
                alert(data.message);
                $.fancybox.close();//关闭弹出层
            }
        }
    });
}

function validate() {
    $('#dsForm').validationEngine('detach');
    jQuery('#dsForm').validationEngine({
        showOneMessage: true,
        //addPromptClass: 'formError-noArrow formError-text',
        promptPosition: 'topLeft',
        maxErrorsPerField: 1,
        scroll: false,
        onValidationComplete: saveSet
    });
}

/**
 * 保存报警设置
 */
function saveSet(form, status) {
    //var max = $("#max").val();
    //var min = $("#min").val();
    var snsUpVal = $("#snsUpVal").val();
    var snsLowVal = $("#snsLowVal").val();
    var deviceId = $("#ctrlId").val();
    if (status == true) {
        setMode(deviceId, 1, snsUpVal, snsLowVal);
    }
    return false;
}

/**
 * 比较上下限值
 * @param field
 * @param rules
 * @param i
 * @param options
 * @returns {jQuery.validationEngineLanguage.allRules.LowGreaterUp.alertText|*}
 */
function compareUpLow(field, rules, i, options) {
    //var max = parseInt($("#max").val());
    //var min = parseInt($("#min").val());
    var snsUpVal = parseFloat($("#snsUpVal").val());
    var snsLowVal = parseFloat($("#snsLowVal").val());
    //console.log("lowVal:"+lowVal+ ">upVal:"+ upVal+"  ="+(lowVal > upVal))
    if (snsLowVal > snsUpVal) {
        return options.allrules.LowGreaterUp.alertText;
    }
    return false;
}

//========================设置控制时间弹出层部分2015-10-13================================
//绑定设置控制时间弹出层
function bindRuntimeBox() {

}

//验证框架
function vali() {
    $('#runtimeSetform').validationEngine('detach');
    jQuery('#runtimeSetform').validationEngine({
        showOneMessage: true,
        //addPromptClass: 'formError-noArrow formError-text',
        promptPosition: 'topLeft',
        maxErrorsPerField: 1,
        scroll: false,
        onValidationComplete: saveRuntime
    });
}

/**
 * 保存报警设置
 */
function saveRuntime(form, status) {
    var runtime = $("#runTime").val();
    var deviceId = $("#deviceId").val();
    if (status == true) {
        setRunStatus(deviceId, $('#role').val(), runtime);//设置状态
    }
}