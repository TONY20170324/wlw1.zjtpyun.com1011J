/**
 * Copyright(c) 2004-2014,浙江托普仪器有限公司
 * All rights reserved
 * 摘    要：实时数据页面的js方法
 * 作    者：liuxd
 * 日    期：2015-05-06 11:45
 */
var windArr = [180];//, 181];//风速风向
var dataPageList = new Array();
var dataNameList = new Array();
var SUCCESS = 1;//表示查询成功
var stationId = 1;
var terminalId;//终端id
var type = 1;
var flushTime = 1000 * 6;//刷新频率
var pageNum = 1;//保存当前页码
var timer;
var linkSrc = "/resources/img/va/icon/link.png";//连接状态图标
var unlinkSrc = "/resources/img/va/icon/unlink.png";//断开状态图标
var powerSrc0 = "/resources/img/va/icon/battery0.png";//电池电量图标
var powerSrc1 = "/resources/img/va/icon/battery20.png";//电池电量图标20%
var powerSrc2 = "/resources/img/va/icon/battery40.png";//电池电量图标40%
var powerSrc3 = "/resources/img/va/icon/battery60.png";//电池电量图标60%
var powerSrc4 = "/resources/img/va/icon/battery80.png";//电池电量图标80%
var powerSrc5 = "/resources/img/va/icon/battery.png";//电池电量图标100%
var chargeSrc = "/resources/img/va/icon/battery_charging.gif";//正在充电图标
var pErrorSrc = "";//电池电量异常

var ipPort = "http://" + qiye_zbl;

var cqSrc1 = ipPort + "/index.php/InsectRealtimeData/getNewPicture";   //虫情照片
var cqSrc2 = ipPort + "/index.php/InsectRealtimeData/index";           //点击虫情照片
var cqSrc3 = ipPort + "/index.php/InsectAlarmList/index.html";         //点击虫情状态
var cqSrc4 = ipPort + "/index.php/InsectRealtimeData/manual_pic";      //点击虫情拍一张
var cqSrc5 = ipPort + "/index.php/InsectRemoteSet/index.html";         //点击虫情设置

var mqSrc1 = ipPort + "/index.php/Seeding/getNewPicture";              //苗情照片
var mqSrc2 = ipPort + "/index.php/Seeding/index";                      //点击苗情照片
var mqSrc3 = ipPort + "/index.php/Seeding/timing_photograph.html";                      //点击苗情设置

var sqSrc1 = ipPort + "/index.php/Picture/getNewPicture";              //苗情照片
var sqSrc2 = ipPort + "/index.php/Picture/index";                      //点击苗情照片
var cqType = 1;
var mqType = 3;
var sqType = 2;

var paramList = new Array();//保存获取传感器当前值的查询条件
//延时加载
var pageCount = 0;//总页数
//var pageNum = 1;//保存当前页码.当前加载的page
var pageShowNum;//当前显示的num.第一次等于1，最小值为1，最大值为总页数。
//pageCount>pageNum && pageNum=pageShowNum的时候加载下一页
//每次发送请求进行判断。（实际上是第一次和最后一次才获取数据）
//获取完数据后，再div的后面append
//加载内容
function test2() {

}

//    $(document).ready(function () {
//        $("a[name=sensor]").fancybox({
//            'titlePosition': 'outside',
//            'overlayColor': '#fff',
//            'overlayOpacity': 0.01,
//            'transitionIn': 'elastic',
//            'transitionOut': 'elastic',
//            'autoDimensions': false,
//            'width': 1040,
//            'height': 370,
//            'padding': 10,
//            'scrolling': 'no',
//            //'type':'iframe'
//            'onStart':function(){
//                alert("aaa");
//            }
//        });
//        //terminalSelected();
//    });

//选择终端，分页获取该终端下所有的传感器信息
//function terminalSelected() {
//    return;
//    alert("type:"+type);
//    terminalId = $("#terminalList").val();
//    alert(terminalId);
//    if (terminalId == null || terminalId.length == 0) {
//        alert("请先选择终端！");
//        return;
//    }
//    goTOPage(1);//查询第一页数据
//}
//
////翻页
//function goTOPage(currentPage) {
//    if (timer) {
//        window.clearTimeout(timer);
//    }
//    pageNum = currentPage;
//    if (currentPage == null) {
//        pageNum = $("#goPage").val();
//    }
//    getAllSensor(type);
//}

//获取终端下所有传感器信息
function getAllSensor(_type) {
    stationId = getCookie("stationId");
    showDeviceDiv();
    showTerminalSelect();
    if (terminalId == 0 || terminalId == null || terminalId == -1) {
        var greyHTML = "";
        greyHTML = getSensorHTMLDefault();
        $("#band8").html(greyHTML);
        return;
    }
    $.ajax({
        type: "GET",
        url: '/pages/data/getAllSensor',
        data: {'pageSize': 8, "pageNo": pageNum, "terminalId": terminalId, "branch": _type},
        dataType: "json",
        async: false,
        cache: false,
        success: function (data) {
            if (data.code != SUCCESS) {//查询没有成功时
                alert(data.message);//输出提示信息
                return false;
            }
            pageNum = data.pageNo;//前端传过去的页数可能有错误，所以把返回来的正确的当前页数再赋给全局变量pageNum
            if (data.list.length == 0) {
                var greyHTML = "";
                greyHTML = getSensorHTMLDefault();
                $("#band8").html(greyHTML);
                return;
            }
            pageCount = data.pageCount;//获取总数 lxd2015-04-22
            //动态拼接传感器列表

            setSensorList(data);

            flashArrow();

            //弹出层
            if ($("[name=sensor]").length > 0) {
                $("a[name=sensor]").fancybox({
                    'titlePosition': 'outside',
                    'overlayColor': '#fff',
                    'overlayOpacity': 0.01,
                    'transitionIn': 'elastic',
                    'transitionOut': 'elastic',
                    'autoDimensions': false,
                    'width': 1024,
                    'height': 390,
                    'padding': 0,
                    'scrolling': 'no',
                    'type': 'iframe'
                });
            }
            //timer = window.setInterval(getSensorValue, flushTime);//根据频率刷新传感器数据
            //getSensorValue();
        },
        error: function () {
        }
    });
}

//动态拼接传感器列表
function setSensorList(data) {
    if (pageNum == 1) {
        $("#band8").html("");
    }
    $("#sensorList").html("");//先清空原来的传感器列表
    paramList.length = 0;//清空数组
    var perLien = 4;//每行记录数
    var list = data.list;//获取传感器列表
    var listSize = list.length;


    //计算行数
    var line = listSize / perLien;
    if (listSize % perLien > 0) {
        line = line + 1;
    }
    var terminalName = $("#terminalList option:selected").text();//获取终端名称
    var listHTML = "";
    var divNum = 0;
    listHTML += '<div class="sa-lay section fp-section fp-table" style="width:1200px; height:800px;">';
    for (var i = 1; i <= line; i++) {
        for (var j = perLien * (i - 1); j < i * perLien && j < listSize; j++) {
            var obj = list[j];
//                var params = {};
//                params.terminalId = terminalId;
//                params.snsType = obj.device.sensor.sensorType;
//                params.snsTag = obj.device.sensor.sensorTag;
            //用于刷新数据时的查询条件
            var jsonStr = {
                terminalId: terminalId,
                snsType: obj.device.sensorType,
                snsTag: obj.device.sensorTag,
                capIntv: obj.device.capIntv3
            };
            paramList.push(jsonStr);

            //var sensorMark = obj.device.sensor.sensorMark;
            //var sensorTypeId = parseInt(obj.device.sensor.sensorType).toString(16).toLocaleUpperCase();//obj.device.sensor.sensorTag.toString(16);
            var tag = /*padLeft(sensorTypeId, 2) + */padLeft(obj.device.sensorTag, 2);
            var sensorUnit = obj.sensorUnit == "" ? "" : "(" + obj.sensorUnit + ")";//传感器单位
            var sensorType = obj.device.sensorTypeId;
            if ($.inArray(sensorType, windArr) > -1) {//风速风向
                sensorUnit = "";
            }
            //var power = obj.power < 1 ? "/resources/img/va/icon/battery.png" : "/images/icon/battery.png";
            //listHTML += '<a id="' + sensorMark + '" name="sensor" class="content-box span2" href="#data" kesrc="#data">' +

            listHTML += '<div class="item4">';
            if (obj.alarmType == 1000 || obj.alarmType == 0) {
                listHTML += '<div class="sa-panel sa-green" id="sa-panel-' + obj.device.deviceId + '">';
            } else {
                listHTML += '<div class="sa-panel sa-warn" id="sa-panel-' + obj.device.deviceId + '">';
            }
            listHTML += '<div class="sa-header">';
            listHTML += '<div class="sa-header-con">';
            listHTML += '<h2 class="sa-title">' + obj.device.deviceName + '- ['+obj.device.sensorTag+']' + '</h2>';
            listHTML += '</div>';
            listHTML += '<div class="sa-header-right">';
            listHTML += '<div class="sa-nav-btns">';
            listHTML += setLinkStatus(obj.alarmType, obj.device.deviceId, obj.value);
            listHTML += setPowerStatus(obj.power, obj.device.deviceId);//设置电池状态

            ////按钮权限控制
            //setbuttonPermission(listHTML, obj.device.deviceName, obj.device.deviceId);

            if (perType == "ALL" || perType.indexOf("op_alarm_set") >= 0) {
                listHTML += '<a class="icon i2 i32 icon-config dataset" href="#dataset" title="' + obj.device.deviceName + '" deviceId="' + obj.device.deviceId + '" kesrc="#dataset" name="dataset"   title="设置"></a>';
            } else {
                //listHTML += '<a class="icon i2 i32 icon-config" href="#" title="' + obj.device.deviceName + '" deviceId="' + obj.device.deviceId + '" title="设置"></a>';
            }
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '<div class="sa-content">';
            listHTML += '<div class="sa-con-inner">';
            listHTML += '<div class="sa-inner-content no-bg"  style="width:266px;">';
            listHTML += '<div class="data-qixiang"  data-width="1024">';
            listHTML += '<a name="sensor" onclick="alarmDel(' + obj.device.deviceId + ');" href="/data/sensorData?sensorId=' + obj.device.deviceId + '&terminalName=' + encodeURI(encodeURI(terminalName)) + '&sensorName=' + encodeURI(encodeURI(obj.device.deviceName)) + '&sensorTag=' + tag + '&sensorUnit=' + encodeURI(encodeURI(sensorUnit)) + '&upVal=' + obj.device.upVal + '&lowVal=' + obj.device.lowVal + '">';
            listHTML += '<div class="data-up">';
            listHTML += '<i><img class="data-img" src="' + obj.picPath + '"></i>';
            listHTML += setSensorValue(obj);
            listHTML += '<p>' + sensorUnit + '</p>';
            listHTML += '</div>';
            listHTML += '</a>';
            listHTML += '<div class="chart-down">';
            //listHTML+='<iframe width="100%" height="100%"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="yes" src="sensorMinData.do?sensorId='+obj.device.deviceId+'&terminalName='+encodeURI(encodeURI(terminalName))+'&sensorName='+encodeURI(encodeURI(obj.device.deviceName))+'&sensorTag='+tag+'&sensorUnit='+encodeURI(encodeURI(sensorUnit))+'"></iframe>';
            listHTML += '<div id="sub_' + pageNum + '_' + divNum + '"  style="width: 266px; height: 100px;"><div align="center" style="padding-top:45px; height: 100px;">正在加载...</div></div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '<div class="sa-footer">';
            listHTML += '<div class="sa-footer-con"></div>';
            listHTML += '<div class="sa-footer-right"></div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';

            //listHTML += '<div class="content-box span2" style="width:300px;"><a id="' + obj.device.deviceId + '" name="sensor"  ' +
            //'href="sensorData.do?sensorId=' + obj.device.deviceId + '&terminalName=' + encodeURI(encodeURI(terminalName)) +
            //'&sensorName=' + encodeURI(encodeURI(obj.device.deviceName)) + '&sensorTag=' + tag +
            //'&sensorUnit=' + encodeURI(encodeURI(sensorUnit)) + '" kesrc="#data">' +
            //'<img src="' + obj.picPath + '">' +
            //'<h4>' + obj.device.deviceName + '</h4></a>';
            ////alert(obj.alarmType);//--test
            //listHTML += setSensorValueUnit(obj.device.sensorType, obj.value, obj.alarmType, sensorUnit);//设置值
            ////listHTML += '<h5>' + sensorUnit + '</h5>
            //listHTML +='<div style="width:100%; height:100px;"><iframe width="100%" height="100%"  frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="yes" src="sensorMinData.do?sensorId='+obj.device.deviceId+'&amp;terminalName=%25E5%25A4%25A7%25E6%25A3%259A2%25E5%258F%25B7&amp;sensorName=%25E5%259C%259F%25E5%25A3%25A4%25E6%25B8%25A9%25E5%25BA%25A602&amp;sensorTag=02&amp;sensorUnit=(%25E2%2584%2583)"></iframe></div>';
            //listHTML +='<div class="clearfix"></div>' + '<span class="device-infor">';
            //listHTML += setLinkStatus(obj.alarmType);//设置连接状态
            //listHTML += setPowerStatus(obj.power);//设置电池状态
            //listHTML += '<a class="btn btn-mini btn-primary dataset" deviceId="' + obj.device.deviceId + '" href="#dataset" kesrc="#dataset">设置</a>'
            //listHTML += '<div class="clearfix"></div></span></div>';
            var num = (pageNum - 1) * 8 + divNum;
            dataPageList[num] = obj.page;
            dataNameList[num] = obj.device.deviceName;
            divNum++;
        }
        //$("div.row" + i).html(listHTML);


    }
    //$("#sensorList").html(listHTML);//alert("pageNo=" + data.pageNo + ", recordCount=" + data.recordCount);//--test
    //setPagination(data.pageNo, data.recordCount, data.pageCount);

    listHTML += '<div>';
    //alert(listHTML);
    $("#band8").append(listHTML);

    bindFancybox();

    for (var i = 0; i < divNum; i++) {
        //数据展示
        //setLine('sub_'+pageNum+'_'+i, (pageNum-1)*8+i);
        //var divId='sub_'+pageNum+'_'+i;
        var divId = 'sub_' + pageNum + '_' + i;
        var dataIndex = (pageNum - 1) * 8 + i;
        setLineStot(divId, dataIndex);
    }

    for (var i = 0; i < listSize; i++) {
        var obj = list[i];
        subscribe(obj.device.deviceId);

    }

    //pageNum+'_'+listSize
    //将每个图表的数据放入到list中，依次读取，根据当前页码，获取数据进行展示。
    //for();
    if (data.recordCount == 0) {
        paginationDisabled();
    }
}

//设置传感器当前值
function setSensorValue(obj) {
    var deviceId = obj.device.deviceId;
    var sensorType = obj.device.sensorTypeId;
    var alarmType = obj.alarmType;
    var sensorVal = obj.value;
    if (sensorVal == null) {
        sensorVal = "--";
    } else {
        if ($.inArray(sensorType, windArr) > -1) {//风速风向
            sensorVal = obj.windName;
        } else {
            sensorVal = setPrecision(sensorType, sensorVal);//设置数据精度
        }
    }
    //默认为正常
    var str = '<h2 class="text-green" id="node_value_' + deviceId + '">' + sensorVal + '</h2>';

    if (alarmType == -1 || alarmType == -2) {
        str = '<h2 class="text-green" id="node_value_' + deviceId + '">' + sensorVal + '</h2>';
    }
    return str;
}

//设置传感器当前值
function setSensorValueBak(sensorType, sensorValue, alarmType) {
    var sensorVal = sensorValue == null ? "--" : setPrecision(sensorType, sensorValue);//设置数据精度
    //默认为正常
    var str = '<h2 class="valgreen">' + sensorVal + '</h2>';
    if (sensorVal == "--") {
        str = '<h2 class="valred ">--</h2>';
    } else {
        if (alarmType == -1 || alarmType == -2/* || !terminalStatus*/) {
            str = '<h2 class="valred ">--</h2>';
            //$("a.content-box h2").hover("#006dcc");//不起作用
        } else if (alarmType == 1) {//超下限
            str = '<h2 class="vargrey ">' + sensorVal + '</h2>';
        } else if (alarmType == 2) {//超上限
            str = '<h2 class="valred ">' + sensorVal + '</h2>';
        }
    }
    return str;
}


//设置传感器当前值和单位
function setSensorValueUnit(sensorType, sensorValue, alarmType, unit) {
    var sensorVal = sensorValue == null ? "--" : setPrecision(sensorType, sensorValue);//设置数据精度
    //默认为正常
    var str = '<h2 class="valgreen">' + sensorVal + '&nbsp;' + unit + '</h2>';
    if (sensorVal == "--") {
        str = '<h2 class="valred ">--</h2>';
    } else {
        if (alarmType == -1 || alarmType == -2/* || !terminalStatus*/) {
            str = '<h2 class="valred ">--</h2>';
            //$("a.content-box h2").hover("#006dcc");//不起作用
        } else if (alarmType == 1) {//超下限
            str = '<h2 class="vargrey ">' + sensorVal + '&nbsp;' + unit + '</h2>';
        } else if (alarmType == 2) {//超上限
            str = '<h2 class="valred ">' + sensorVal + '&nbsp;' + unit + '</h2>';
        }
    }
    return str;
}


//设置连接状态
function setLinkStatus(alarmType, deviceId) {
    var str = '<a id="node_link_' + deviceId + '" name="node_link_name" class="icon i2 i32 bg-white" data-placement="bottom" data-toggle="popover" data-trigger="hover" title="" data-content="连接" data-original-title="连接状态">' +
        '<i class="icon i2 i32 icon-link"></i>' +
        '</a>';
    if (alarmType == -1 || alarmType == 1000 || !terminalStatus) {
        str = '<a id="node_link_' + deviceId + '" class="icon i2 i32 bg-white" data-placement="bottom" data-toggle="popover" data-trigger="hover" title="" data-content="断开" data-original-title="连接状态">' +
        '<i class="icon i2 i32 icon-unlink"></i>' +
        '</a>';
    }
    return str;
}

//设置连接状态
function setLinkStatus(alarmType, deviceId, sensorValue) {
    var str = '<a id="node_link_' + deviceId + '" name="node_link_name" class="icon i2 i32 bg-white" data-placement="bottom" data-toggle="popover" data-trigger="hover" title="" data-content="连接" data-original-title="连接状态">' +
        '<i class="icon i2 i32 icon-link"></i>' +
        '</a>';
    if (alarmType == -1 || alarmType == 1000 || !terminalStatus || sensorValue == null) {
        str = '<a id="node_link_' + deviceId + '" class="icon i2 i32 bg-white" data-placement="bottom" data-toggle="popover" data-trigger="hover" title="" data-content="断开" data-original-title="连接状态">' +
        '<i class="icon i2 i32 icon-unlink"></i>' +
        '</a>';
    }
    return str;
}

//设置连接状态
function setCameraLinkStatus(alarmType, deviceId) {
    var str = '<li><a id="node_link_' + deviceId + '" class="va va-link" data-placement="bottom" data-toggle="popover" data-trigger="hover" title="" data-content="连接" data-original-title="连接状态"></a></li>';
    return str;
}
//设置连接状态
function setLinkStatusBak(alarmType) {
    var str = '<img class="pull-left" src="' + linkSrc + '" title="连接">';
    if (alarmType == -1 || alarmType == 1000 || !terminalStatus) {
        str = '<img class="pull-left" src="' + unlinkSrc + '" title="断开">';
    }
    return str;
}
//设置电池状态
function setPowerStatus(power, deviceId) {
    var str = "";
    var powerTitle = "";
    if (power >= 0 && power < 6) {
        powerTitle = "电池电量" + power * 20 + "%";
    } else if (power == 6) {
        powerTitle = "正在充电";
    } else {
        powerTitle = "电池电量" + "100%";
    }

    str += '<a  id="node_power_' + deviceId + '" class="icon i2 i32 bg-white" data-placement="bottom" data-toggle="popover" data-trigger="hover" title="" data-content="' + powerTitle + '" data-original-title="电源状态">';

    switch (power) {
        case 0:
            str += '<img class="battery" src="/resources/img/battery/battery0.png">';
            break;
        case 1:
            str += '<img class="battery" src="/resources/img/battery/battery20.png">';
            break;
        case 2:
            str += '<img class="battery" src="/resources/img/battery/battery40.png">';
            break;
        case 3:
            str += '<img class="battery" src="/resources/img/battery/battery60.png">';
            break;
        case 4:
            str += '<img class="battery" src="/resources/img/battery/battery80.png">';
            break;
        case 5:
            str += '<img class="battery" src="/resources/img/battery/battery.png">';
            break;
        case 6:
            str += '<img class="battery" src="/resources/img/battery/battery_charging.gif">';
            break;
        default ://默认为满格
            str += '<img class="battery" src="/resources/img/battery/battery.png">';
            break;
    }

    str += "</a>";
    return str;
}

//设置电池状态
function setPowerStatusBak(power) {
    var str = "";
    var powerTitle = "电池电量" + power * 20 + "%";
    switch (power) {
        case 0:
            str = "<img class='pull-right' src='" + powerSrc0 + "' title='" + powerTitle + "'>";
            break;
        case 1:
            str = "<img class='pull-right' src='" + powerSrc1 + "' title='" + powerTitle + "'>";
            break;
        case 2:
            str = "<img class='pull-right' src='" + powerSrc2 + "' title='" + powerTitle + "'>";
            break;
        case 3:
            str = "<img class='pull-right' src='" + powerSrc3 + "' title='" + powerTitle + "'>";
            break;
        case 4:
            str = "<img class='pull-right' src='" + powerSrc4 + "' title='" + powerTitle + "'>";
            break;
        case 5:
            str = "<img class='pull-right' src='" + powerSrc5 + "' title='" + powerTitle + "'>";
            break;
        case 6:
            str = "<img class='pull-right' src='" + chargeSrc + "' title='正在充电'>";
            break;
        default ://默认为满格
            //str = "<img class='pull-right' src='" + pErrorSrc + "' title='电池异常'>";
            str = "<img class='pull-right' src='" + powerSrc5 + "' title='电池电量100%'>";
            break;
    }
//        if(power >= 0 && power < 6){
//
//        }else if(power == 6){
//            str = "<img class='pull-right' src='" + chargeSrc + "' title='正在充电'>";
//        }else{
//            str = "<img class='pull-right' src='" + pErrorSrc + "' title='电池异常'>";
//        }
    return str;
}

//从jedis中获取传感器当前数据，刷新页面的值
function getSensorValue() {
    ////alert("paramList=" + eval(paramList));//--test
    //var postData = {paramList: paramList};
    //var jsonStr = JSON.stringify(postData);//转为json字符串
    ////alert("jsonStr=" + jsonStr);//--test
    //$.ajax({
    //    type: "GET",
    //    //url: '/data/getAllSensor',
    //    url: '/pages/data/getSnsVals',
    //    data: {reqJsonStr: jsonStr},//reqJsonStr:表示传递json字符串
    //    dataType: "json",
    //    cache: false,
    //    success: function (data) {
    //        //alert("data=" + data.length);//--test
    //        //var list = data.list;
    //        for (var i = 0; i < data.length; i++) {
    //            var id = "#" + data[i].deviceId;
    //            var alarmType = data[i].alarmType;
    //
    //            //更新当前值
    //            var oldClass = $(id).find("h2").attr("class");
    //            //alert("oldClass=" + oldClass);//--test
    //            var newValue = data[i].value == null ? "--" : data[i].value;
    //            if (newValue == "--") {
    //                $(id).find("h2").removeClass(oldClass).addClass("valred");
    //            } else {
    //                if (alarmType == -1 || alarmType == -2/* || !terminalStatus*/) {//报警时或终端断开显示红色
    //                    // $(id).find(".val").css("color","#ff0000");
    //                    newValue = "--";
    //                    $(id).find("h2").removeClass(oldClass).addClass("valred");
    //                } else if (alarmType == 1) {//超下限
    //                    $(id).find("h2").removeClass(oldClass).addClass("vargrey");
    //                } else if (alarmType == 2) {//超上限
    //                    $(id).find("h2").removeClass(oldClass).addClass("valred");
    //                } else {//不报警改为原来的颜色
    //                    //alert("id1=" + $(id).find("h2"));//--test
    //                    $(id).find("h2").removeClass(oldClass).addClass("valgreen");
    //                }
    //            }
    //            if (newValue == "--") {
    //                $(id).find("h2").html(newValue);//修改当前值
    //            } else {
    //                //console.log(setPrecision(data[i].snsType, newValue)+"  snsType: "+data[i].snsType+"    newValue:"+newValue);
    //                $(id).find("h2").html(setPrecision(data[i].sensorType, newValue));//修改当前值
    //            }
    //
    //            //更新连接状态
    //            if (alarmType == -1 || alarmType == 1000 || !terminalStatus) {
    //                $(id).find(".pull-left").attr("src", unlinkSrc);//更新图标
    //                $(id).find(".pull-left").attr("title", "断开");//更新状态
    //            } else {
    //                $(id).find(".pull-left").attr("src", linkSrc);
    //                $(id).find(".pull-left").attr("title", "连接");
    //            }
    //
    //            //更新电量
    //            var powerTitle = "电池电量" + data[i].power * 20 + "%";
    //            switch (data[i].power) {
    //                case 0:
    //                    $(id).find(".pull-right").attr("src", powerSrc0);//更新图标
    //                    $(id).find(".pull-right").attr("title", powerTitle);//更新电量
    //                    break;
    //                case 1:
    //                    $(id).find(".pull-right").attr("src", powerSrc1);
    //                    $(id).find(".pull-right").attr("title", powerTitle);
    //                    break;
    //                case 2:
    //                    $(id).find(".pull-right").attr("src", powerSrc2);
    //                    $(id).find(".pull-right").attr("title", powerTitle);
    //                    break;
    //                case 3:
    //                    $(id).find(".pull-right").attr("src", powerSrc3);
    //                    $(id).find(".pull-right").attr("title", powerTitle);
    //                    break;
    //                case 4:
    //                    $(id).find(".pull-right").attr("src", powerSrc4);
    //                    $(id).find(".pull-right").attr("title", powerTitle);
    //                    break;
    //                case 5:
    //                    $(id).find(".pull-right").attr("src", powerSrc5);
    //                    $(id).find(".pull-right").attr("title", powerTitle);
    //                    break;
    //                case 6:
    //                    $(id).find(".pull-right").attr("src", chargeSrc);
    //                    $(id).find(".pull-right").attr("title", "正在充电");
    //                    break;
    //                default ://默认为满格
    //                    //$(id).find(".pull-right").attr("src", pErrorSrc);
    //                    //$(id).find(".pull-right").attr("title", "电池异常");
    //                    $(id).find(".pull-right").attr("src", powerSrc5);
    //                    $(id).find(".pull-right").attr("title", "电池电量100%");
    //                    break;
    //            }
    //            //$(id).find(".pull-right").attr("title", power);//更新电量
    //        }
    //    },
    //    error: function () {
    //    }
    //});
}


//lxd 总控
function getAllDevice(_type) {
    if (_type == null) {
        _type = 1;
    }
    //for(var i=1; i<=7; i++){
    //    if(i ==_type){
    //        $("#title"+i).css("color","#0088cc");
    //    }else{
    //        $("#title"+i).css("color","#82c02a");
    //    }
    //}

    showDeviceDiv();
    //获取类别
    //获取终端
    //判断发送的ajax请求
    type = _type;//植保类
    //terminal=1053;

    switch (_type) {
        case 1  :
            getAllSensor(1);
            break;
        case 2  :
            getAllSensor(2);
            break;
        case 3  :
            getAllSensor(3);
            break;
        case 4  :
            getAllSensor(4);
            break;
        case 5  :
            getAllImage(5);
            break;
        case 6  :
            getAllImage(6);
            break;
        case 7  :
            getAllCamera(7);
            break;
        default :
            break;
    }
}

//获取终端下所有图片
function getAllImage(_type) {
    stationId = getCookie("stationId");
    hideTerminalSelect();
    $.ajax({
        type: "GET",
        url: '/pages/data/getAllImage',
        data: {'pageSize': 8, "pageNo": pageNum, "stationId": stationId, "branch": _type},
        dataType: "json",
        async: false,
        cache: false,
        success: function (data) {
            if (data.code != SUCCESS) {//查询没有成功时
                alert(data.message);//输出提示信息
                return false;
            }
            pageNum = data.pageNo;//前端传过去的页数可能有错误，所以把返回来的正确的当前页数再赋给全局变量pageNum

            if (data.list.length == 0) {
                var greyHTML = "";
                if (type == 5) {
                    greyHTML = getImageHTMLDefault();
                } else {
                    greyHTML = getImageHTMLDefault2();
                }
                $("#band8").html(greyHTML);
                return;
            }
            //临时增加 begin 当只有1条的时候跳转
            if (data.list.length == 1 && pageNum == 1) {
                var obj = data.list[0];
                var hrefStr = '';
                if (obj.device.deviceTypeId == 3) {   //虫情
                    if (obj.device.isShowLink == 0) {
                        hrefStr = '/insect/realtime/data?linkcode=1&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&source=1';
                    } else {
                        //链接到php页面add by zhangyc on 2015-07-03
                        hrefStr = '/data/realzbl_data?linkcode=1&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&source=1';
                    }
                } else if (obj.device.deviceTypeId == 5 || obj.device.deviceTypeId == 8) {   //苗情
                    if (obj.device.isShowLink == 0) {
                        hrefStr = '/data/realzwtx_data?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&source=1';
                    } else {
                        //链接到php页面add by yhq on 2015-07-03
                        hrefStr = '/data/realzwtx_data_bak?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&source=1';
                    }
                } else if (obj.device.deviceTypeId == 6) {   //墒情
                    if (obj.device.isShowLink == 0) {
                        hrefStr = '/data/realzwtx_data?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + sqType + '&source=1';
                    } else {
                        //链接到php页面add by yhq on 2015-07-03
                        hrefStr = '/data/realzwtx_data_bak?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + sqType + '&source=1';
                    }
                }

                if (obj.device.deviceTypeId == 3 || obj.device.deviceTypeId == 5 || obj.device.deviceTypeId == 6 || obj.device.deviceTypeId == 8) {
                    window.location.href = hrefStr;
                    return;
                }
            }
            //临时增加 end;

            pageCount = data.pageCount;//获取总数 lxd2015-04-22
            //动态拼接传感器列表
            setImageList(data);
            flashArrow();

            if ($("[name=imageset]").length > 0) {
                $("a[name=imageset]").fancybox({
                    'titlePosition': 'outside',
                    'overlayColor': '#fff',
                    'overlayOpacity': 0.01,
                    'transitionIn': 'elastic',
                    'transitionOut': 'elastic',
                    'autoDimensions': false,
                    'width': 370,
                    'height': 373,

                    'padding': 10,

                    'scrolling': 'no',
                    'type': 'iframe'
                });
            }
            //弹出层
            if ($("[name=image]").length > 0) {
                $("a[name=image]").fancybox({
                    'titlePosition': 'outside',
                    'overlayColor': '#fff',
                    'overlayOpacity': 0.01,
                    'transitionIn': 'elastic',
                    'transitionOut': 'elastic',
                    'autoDimensions': false,
                    'width': 650,
                    'height': 800,
                    'padding': 10,
                    'scrolling': 'no',
                    'type': 'iframe'
                });
            }


            //弹出层

            timer = window.setInterval(getSensorValue, flushTime);//根据频率刷新传感器数据
            //getSensorValue();
        },
        error: function () {
        }
    });
}

var newWin = null;
/**
 * 设置拍照时间
 */
function setPhotoTime(deviceId, deviceName) {
    var url = "/station/device/intervalList?deviceId=" + deviceId + "&deviceName=" + encodeURI(deviceName);
    newWin = window.open(url);
}

//动态拼接传感器列表
function setImageList(data) {
    if (pageNum == 1) {
        $("#band8").html("");
    }
    $("#sensorList").html("");//先清空原来的传感器列表
    paramList.length = 0;//清空数组
    var perLien = 4;//每行记录数
    var list = data.list;//获取传感器列表
    objList = data.list;//获取传感器列表;
    var listSize = list.length;
    //计算行数
    var line = listSize / perLien;
    if (listSize % perLien > 0) {
        line = line + 1;
    }
    var terminalName = $("#terminalList option:selected").text();//获取终端名称
    //alert("terminalName=" + terminalName);//--test
    var listHTML = "";
    listHTML += '<div class="sa-lay section fp-section fp-table" style="width:1200px; height:800px;">';
    for (var i = 1; i <= line; i++) {
        //$("#sensorList").append("<div class='row-fluid row" + i + "'></div>");
        for (var j = perLien * (i - 1); j < i * perLien && j < listSize; j++) {
            var obj = list[j];
//                var params = {};
//                params.terminalId = terminalId;
//                params.snsType = obj.device.sensor.sensorType;
//                params.snsTag = obj.device.sensor.sensorTag;
            //用于刷新数据时的查询条件
            var jsonStr = {
                terminalId: terminalId,
                snsType: 2,
                snsTag: 1,
                capIntv: 2
            };
            paramList.push(jsonStr);

            //var sensorMark = obj.device.sensor.sensorMark;
            //var sensorTypeId = parseInt(obj.device.sensor.sensorType).toString(16).toLocaleUpperCase();//obj.device.sensor.sensorTag.toString(16);
            //var tag = /*padLeft(sensorTypeId, 2) + */padLeft(9, 2);
            ////var sensorUnit = obj.sensorUnit == "" ? "" : "(" + obj.sensorUnit + ")";
            ////var power = obj.power < 1 ? "/images/icon/battery.png" : "/images/icon/battery.png";
            ////listHTML += '<a id="' + sensorMark + '" name="sensor" class="content-box span2" href="#data" kesrc="#data">' +
            //listHTML += '<div class="content-box span2"><a href="javascript:void(0);" id="' + obj.device.deviceId + '"  >' +
            //'<img src=" ">' +
            //'<h4>' + obj.device.deviceName + '</h4></a>';
            ////alert(obj.alarmType);//--test
            ////listHTML += setSensorValue(9, obj.value, 9);//设置值
            ////listHTML += '<h5>' + 123 + '</h5>';
            ////TODO 虫情苗情墒情分类
            //listHTML += '<div class="clearfix"></div>' + '<span class="device-infor">';

            listHTML += '<div class="item4">';
            listHTML += '<div class="sa-panel sa-green sa-green2">';
            listHTML += '<div class="sa-header">';
            listHTML += '<div class="sa-header-con">';
            listHTML += '<h2 class="sa-title">' + obj.device.deviceName + '</h2>';
            listHTML += '</div>';
            listHTML += '<div class="sa-header-right">';
            listHTML += '<div class="sa-nav-btns">';
            if (obj.device.deviceTypeId == 3) {
                if (obj.device.isShowLink == 0) {
                    listHTML += '<a class="icon i2 i32 icon-view" href="/insect/alarm/list?linkcode=2&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&random=' + Math.random() + '" title="状态"></a>';
                    if (perType == "ALL" || perType.indexOf("op_insect_pyz") > 0) {
                        listHTML += '<a class="icon i2 i32 icon-photo" href="/insect/realtime/data/manual_pic?linkcode=3&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&random=' + Math.random() + '" title="拍一张"></a>';
                    } else {
                        //listHTML += '<a class="icon i2 i32 icon-photo" href="javascript:void(0);" title="拍一张"></a>';
                    }
                    if (perType == "ALL" || perType.indexOf("op_insect_set") > 0) {
                        listHTML += '<a class="icon i2 i32 icon-config" href="/insect/remote/set?linkcode=4&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&random=' + Math.random() + '" title="设置"></a>';
                    } else {
                        //listHTML += '<a class="icon i2 i32 icon-config" href="javascript:void(0);" title="设置"></a>';
                    }

                } else {
                    //链接到php页面add by zhangyc on 2015-07-03
                    listHTML += '<a class="icon i2 i32 icon-view" href="/data/realzbl_data?linkcode=2&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&random=' + Math.random() + '" title="状态"></a>';
                    listHTML += '<a class="icon i2 i32 icon-photo" href="/data/realzbl_data/manual_pic?linkcode=3&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&random=' + Math.random() + '" title="拍一张"></a>';
                    listHTML += '<a class="icon i2 i32 icon-config" href="/data/realzbl_data?linkcode=4&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&random=' + Math.random() + '" title="设置"></a>';
                }
            } else if (obj.device.deviceTypeId == 5 || obj.device.deviceTypeId == 8) {
                listHTML += setLinkStatus(1);
                listHTML += setPowerStatus(5);//设置电池状态
                if (obj.device.deviceTypeId == 5) {
                    if (perType == "ALL" || perType.indexOf("op_insect_set") > 0) {
                        listHTML += '<a name="imageset" class="icon i2 i32 icon-config" href="' + mqSrc3 + '" title="设置"  kesrc="#phplink2"></a>';
                    } else {
                        //listHTML += '<a class="icon i2 i32 icon-config" href="javascript:void(0);" title="设置"  kesrc="#phplink2"></a>';
                    }
                }
                if (obj.device.deviceTypeId == 8) {
                    listHTML += '<a name="intervalset" class="icon i2 i32 icon-config" href="javascript:setPhotoTime(' + obj.device.deviceId + ',\'' + obj.device.deviceName + '\');" title="设置"></a>';
                }
            }
            if (obj.device.deviceTypeId == 6) {
                listHTML += setLinkStatus(1, obj.device.deviceId);
                listHTML += '</a>';
                listHTML += setPowerStatus(5, obj.device.deviceId);//设置电池状态
                //listHTML += '<a class="icon i2 i32 icon-list"  data-toggle="tip-menu" data-token="#ID"></a>';
                listHTML += '<a class="icon i2 i32 icon-list" hover="hide"  target="next.tip-menu"></a>';
                listHTML += '<div class="tip-menu hide">';
                listHTML += '<a href="/data/realqxl?terminalId=' + obj.device.deviceId + '&random=' + Math.random() + '" class="m1"><i class="icon icon-01"></i>气象类</a><span class="divider"></span>' +
                '<a href="/data/realtrl?terminalId=' + obj.device.deviceId + '&random=' + Math.random() + '"><i class="icon icon-02"></i>土壤类</a>';
                listHTML += '</div>';
            }
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '<div class="sa-content">';
            listHTML += '<div class="sa-con-inner">';
            listHTML += '<div class="sa-inner-content"  style="height:192px;">';
            if (obj.device.deviceTypeId == 3) {   //虫情
                if (obj.device.isShowLink == 0) {
                    listHTML += '<a href="/insect/realtime/data?linkcode=1&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&random=' + Math.random() + '">';
                } else {
                    //链接到php页面add by zhangyc on 2015-07-03
                    listHTML += '<a href="/data/realzbl_data?linkcode=1&terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&random=' + Math.random() + '">';
                }
                listHTML += '<div class="img-con" style="width:266px;">';
                if (obj.device.isShowLink == 0) {
                    listHTML += '<img  src="' + pic_cq + obj.picUrl +'?x-oss-process=style/mq-thumb"/>';
                } else {
                    listHTML += '<img src="' + cqSrc1 + '?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + cqType + '&source=1' + '&random=' + Math.random() + '" alt="">';
                }
                listHTML += '</div>';
                listHTML += '</a>';
            } else if (obj.device.deviceTypeId == 5 || obj.device.deviceTypeId == 8) {   //苗情
                listHTML += '<div class="img-con" style="width:266px;">';
                if (obj.device.isShowLink == 0) {
                    listHTML += '<a href="/data/realzwtx_data?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&source=1' + '&random=' + Math.random() + '" kesrc="#phplink">';
                } else {
                    //链接到php页面add by yhq on 2015-07-03
                    listHTML += '<a href="/data/realzwtx_data_bak?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&source=1' + '&random=' + Math.random() + '" kesrc="#phplink">';
                }
                if (obj.device.isShowLink == 0) {
                    //listHTML += '<img  src="'+pic_mq+obj.picUrl+'"/>'
                    listHTML += '<img  src="' + picThumbUrl + encodeURI(obj.picUrl) +'?x-oss-process=style/mq-thumb"/>';
                } else {
                    listHTML += '<img src="' + mqSrc1 + '?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + mqType + '&source=1' + '&random=' + Math.random() + '" alt="">';
                }
                listHTML += '</a>';
                listHTML += '</div>';
            }
            if (obj.device.deviceTypeId == 6) {   //墒情
                listHTML += '<div class="img-con" style="width:266px;">';
                if (obj.device.isShowLink == 0) {
                    listHTML += '<a href="/data/realzwtx_data?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + sqType + '&source=1' + '&random=' + Math.random() + '" kesrc="#phplink">';
                } else {
                    //链接到php页面add by yhq on 2015-07-03
                    listHTML += '<a href="/data/realzwtx_data_bak?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + sqType + '&source=1' + '&random=' + Math.random() + '" kesrc="#phplink">';
                }
                if (obj.device.isShowLink == 0) {
                    //listHTML += '<img  src="'+pic_sq+obj.picUrl+'"/>'
                    listHTML += '<img  src="' + picThumbUrl + encodeURI(obj.picUrl) +'?x-oss-process=style/mq-thumb"/>';
                } else {
                    listHTML += '<img  src="' + sqSrc1 + '?terminal_id=' + obj.device.terminalId + '&device_id=' + obj.device.deviceId + '&device_type=' + sqType + '&source=1' + '&random=' + Math.random() + '" alt="">';

                }
                listHTML += '</a>';
                listHTML += '</div>';
            }
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';

            listHTML += '<div class="sa-footer">';
            listHTML += '<div class="sa-footer-con"></div>';
            listHTML += '<div class="sa-footer-right"></div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';

            //var link="http://www.baidu.com";
            //if(obj.device.deviceTypeId==3){
            //    listHTML += '<a href="javascript:void(0);">状态</a>&nbsp;&nbsp;';
            //    listHTML += '<a onclick="showLinkDiv()" kesrc="#imageset">拍一张</a>&nbsp;&nbsp;';
            //    listHTML += "<a href=\"javascript:showDetail("+j+", '"+link+"');\">设置</a>";
            //}else if(obj.device.deviceTypeId==5){
            //    listHTML += setLinkStatus(1);//设置连接状态
            //    listHTML += setPowerStatus(7);//设置电池状态
            //    listHTML += "<a href=\"javascript:showDetail("+j+", '"+link+"');\">设置</a>";
            //}else if(obj.device.deviceTypeId==6){
            //    listHTML += setLinkStatus(1);//设置连接状态
            //    listHTML += setPowerStatus(7);//设置电池状态
            //    listHTML += "<a href=\"javascript:showDetail("+j+", '"+link+"');\">数据</a>";
            //}


        }
        //$("div.row" + i).html(listHTML);

        bindFancybox();
    }
    //$("#sensorList").html(listHTML);//alert("pageNo=" + data.pageNo + ", recordCount=" + data.recordCount);//--test
    //setPagination(data.pageNo, data.recordCount, data.pageCount);

    listHTML += '<div>';
    //alert(listHTML);
    $("#band8").append(listHTML);
    if (data.recordCount == 0) {
        paginationDisabled();
    }
}

//获取终端下所有视频
function getAllCamera(_type) {
    stationId = getCookie("stationId");
    hideTerminalSelect();
    $.ajax({
        type: "GET",
        url: '/pages/data/getAllCamera',
        data: {'pageSize': 8, "pageNo": pageNum, "stationId": stationId, "branch": _type},
        dataType: "json",
        async: false,
        cache: false,
        success: function (data) {
            //alert("code=" + data.code);//--test
            //(data.list);//--test
            //alert(data.msg);//--test
            //alert(data.pageNo);//--test
            if (data.code != SUCCESS) {//查询没有成功时
                alert(data.message);//输出提示信息
                return false;
            }
            if (data.list.length == 0) {
                var greyHTML = "";
                greyHTML = getVedioHTMLDefault();
                $("#band8").html(greyHTML);
                return;
            }
            //临时增加 begin 当只有1条的时候跳转
            if (data.list.length == 1 && pageNum == 1) {
                var obj = data.list[0];
                var hrefStr = '';
                hrefStr = '/ctrl/disaster.do?terminalId=' + obj.device.terminalId + '&cameraId=' + obj.device.deviceId;

                window.location.href = hrefStr;
                return;
            }
            //临时增加 end;
            pageNum = data.pageNo;//前端传过去的页数可能有错误，所以把返回来的正确的当前页数再赋给全局变量pageNum

            pageCount = data.pageCount;//获取总数 lxd2015-04-22
            //动态拼接传感器列表
            setCameraList(data);

            //刷新箭头
            flashArrow();
            //弹出层
            //$("a[name=sensor]").fancybox({
            //    'titlePosition': 'outside',
            //    'overlayColor': '#fff',
            //    'overlayOpacity': 0.01,
            //    'transitionIn': 'elastic',
            //    'transitionOut': 'elastic',
            //    'autoDimensions': false,
            //    'width': 1010,
            //    'height': 370,
            //    'padding': 10,
            //    'scrolling': 'no',
            //    'type': 'iframe'
            //});
            timer = window.setInterval(getSensorValue, flushTime);//根据频率刷新传感器数据
            //getSensorValue();
        },
        error: function () {
        }
    });
}

//动态拼接视频列表
function setCameraList(data) {
    if (pageNum == 1) {
        $("#band8").html("");
    }
    showDeviceDiv();
    $("#pagination").hide();
    $("#sensorList").html("");//先清空原来的传感器列表
    paramList.length = 0;//清空数组
    var perLien = 4;//每行记录数
    var list = data.list;//获取传感器列表
    var listSize = list.length;
    //计算行数
    var line = listSize / perLien;
    if (listSize % perLien > 0) {
        line = line + 1;
    }
    var terminalName = $("#terminalList option:selected").text();//获取终端名称
    //alert("terminalName=" + terminalName);//--test
    var listHTML = "";
    listHTML += '<div class="sa-lay section fp-section fp-table" style="width:1200px; height:800px;">';
    for (var i = 1; i <= line; i++) {
        //$("#sensorList").append("<div class='row-fluid row" + i + "'></div>");
        for (var j = perLien * (i - 1); j < i * perLien && j < listSize; j++) {
            var obj = list[j];
//                var params = {};
//                params.terminalId = terminalId;
//                params.snsType = obj.device.sensor.sensorType;
//                params.snsTag = obj.device.sensor.sensorTag;
            //用于刷新数据时的查询条件
            var jsonStr = {
                terminalId: terminalId,
                snsType: 2,
                snsTag: 1,
                capIntv: 2
            };
            paramList.push(jsonStr);

            //var sensorMark = obj.device.sensor.sensorMark;
            //var sensorTypeId = parseInt(obj.device.sensor.sensorType).toString(16).toLocaleUpperCase();//obj.device.sensor.sensorTag.toString(16);
            var tag = /*padLeft(sensorTypeId, 2) + */padLeft(9, 2);
            //var sensorUnit = obj.sensorUnit == "" ? "" : "(" + obj.sensorUnit + ")";
            //var power = obj.power < 1 ? "/images/icon/battery.png" : "/images/icon/battery.png";
            //listHTML += '<a id="' + sensorMark + '" name="sensor" class="content-box span2" href="#data" kesrc="#data">' +
            //listHTML += '<div class="content-box span2"><a href="javascript:void(0);" id="' + obj.device.deviceId + '">' +
            //'<img src=" ">' +
            //'<h4>' + obj.device.deviceName + '</h4></a>';
            ////alert(obj.alarmType);//--test
            ////listHTML += setSensorValue(9, obj.value, 9);//设置值
            ////listHTML += '<h5>' + 123 + '</h5>' ;
            //listHTML += '<div class="clearfix"></div>'+'<span class="device-infor">';
            ////listHTML += '<img class="pull-left" src="' + linkSrc + '" title="状态">';//设置连接状态
            ////listHTML += '<img class="pull-right" src="' + powerSrc0 + '" title="历史">';//设置电池状态
            ////listHTML += '<a href="javascript:void(0);">状态</a>&nbsp;&nbsp;'
            //listHTML += setLinkStatus(1);//设置连接状态
            //listHTML += '<a href="/ctrl/disaster.do?terminalId='+obj.device.terminalId+'&cameraId='+obj.device.deviceId+'">关联</a>&nbsp;&nbsp;'
            //listHTML += '<a href="javascript:void(0);">历史</a>'
            //listHTML += '<div class="clearfix"></div></span></div>';

            listHTML += '<div class="item4">';
            listHTML += '<div class="sa-panel sa-movie">';
            listHTML += '<div class="sa-header">';
            listHTML += '<center>';
            listHTML += '<h2 class="sa-title">' + obj.device.deviceName + '</h2>';
            listHTML += '</center>';
            listHTML += '</div>';
            listHTML += '<div class="sa-content">';
            listHTML += '<div class="sa-con-inner">';
            listHTML += '<div class="sa-inner-content">';
            listHTML += '<div class="movie-con">';
            listHTML += '<img  src="/resources/img/demo/zhibao-demo.png" alt="" >';
            listHTML += '</div>';
            listHTML += '<a href="/ctrl/disaster.do?terminalId=' + obj.device.terminalId + '&cameraId=' + obj.device.deviceId + '">';
            listHTML += '<div class="play-con"></div>';
            listHTML += '</a>';
            listHTML += '<div class="va-btns">';
            listHTML += '<ul>';
            listHTML += setCameraLinkStatus(1, obj.device.deviceId);
            listHTML += '<li><a href="/ctrl/disaster.do?terminalId=' + obj.device.terminalId + '&cameraId=' + obj.device.deviceId + '" class="va va-target"></a></li>';
            listHTML += '<li><a href="#" class="va va-clock"></a></li>';
            listHTML += '</ul>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '<div class="sa-footer">';
            listHTML += '<div class="sa-footer-con"></div>';
            listHTML += '<div class="sa-footer-right"></div>';
            listHTML += '</div>';
            listHTML += '</div>';
            listHTML += '</div>';
        }
        //$("div.row" + i).html(listHTML);

        //bindFancybox();
    }
    //$("#sensorList").html(listHTML);//alert("pageNo=" + data.pageNo + ", recordCount=" + data.recordCount);//--test
    //setPagination(data.pageNo, data.recordCount, data.pageCount);

    listHTML += '<div>';
    //alert(listHTML);
    $("#band8").append(listHTML);
    if (data.recordCount == 0) {
        paginationDisabled();
    }
}

function showDeviceDiv() {
    $("#sensorList").show();
    $("#pagination").show();
    $("#sensorLink").hide();
}
function showLinkDiv() {
    $("#sensorList").hide();
    $("#sensorLink").show();
}

function showTerminalSelect() {
    $("#terminalListLabel").show();
    $("#terminalList").show();
}
function hideTerminalSelect() {
    $("#terminalListLabel").hide();
    $("#terminalList").hide();
}

//为div赋值
function showDetail(index, link) {
    var obj = objList[index];
    showLinkDiv();//显示内容
    //为div赋值
    //根据obj的类别，显示不同内容
    var leftLinkHtml = "";

    leftLinkHtml += '<input type="button" onclick="showDeviceDiv();"value="返回">';
    leftLinkHtml += '<div>';

    if (obj.device.deviceTypeId == 3) {
        leftLinkHtml += '<a href="javascript:void(0);">状态</a>&nbsp;&nbsp;';
        leftLinkHtml += '<a onclick="showLinkDiv()" kesrc="#imageset">拍一张</a>&nbsp;&nbsp;';
        leftLinkHtml += '<a href="javascript:void(0);">设置</a>';

    } else if (obj.device.deviceTypeId == 5) {
        leftLinkHtml += setLinkStatus(1);//设置连接状态
        leftLinkHtml += setPowerStatus(7);//设置电池状态
        leftLinkHtml += '<a href="javascript:void(0);">设置</a>';
    } else if (obj.device.deviceTypeId == 6) {
        leftLinkHtml += setLinkStatus(1);//设置连接状态
        leftLinkHtml += setPowerStatus(7);//设置电池状态
        leftLinkHtml += '<a href="javascript:void(0);">数据</a>';
    }

    leftLinkHtml += '</div>';
    $("#leftLink").html(leftLinkHtml);
    showIframe(link);
}
function showIframe(link) {
    $("#rightIframe").attr("src", link);
}

//全局变量,存储数据用于页面显示
var objList = "";

function setLineStot(divId, divNum) {
    setTimeout(function () {
        setLine(divId, divNum)
    }, 1);
}

//画图表
function setLine(divId, divNum) {
    var sensorName = dataNameList[divNum];
    var sensorTag = "02";
    var sensorUnit = "CC";
    var dataList = dataPageList[divNum].list;

    //var beginTime   = new Date().getTime()-1000*24*60*60;
    //var endTime     = new Date().getTime();
    //var interval=180;//180分钟
    //var cate = jointX(beginTime, endTime, interval);
    //cate = eval(cate);


    Highcharts.setOptions({
        global: {
            useUTC: false//一开始数据曲线生成时是否动画效果
        }
    });
    var marginBottom = 25;
    if (dataList.length == 0) {
        marginBottom = 5;
    }
    var marginRight = 15;

    //options.xAxis.categories = cate;
    $("#" + divId).highcharts({
        chart: {
            //renderTo:"sensorDataLine",
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            //zoomType:'x',//拖动鼠标进行缩放
            marginRight: marginRight,
            //marginLeft: 15,
            marginBottom: marginBottom,
            //plotBorderWidth: 1,
            backgroundColor: '#F1F1F1',
            events: {
                //监听图表加载完成事件
                //load: //setInterval(getSensorData, flushTime)
                load: function () {
                    var series = this.series[0];
//                        setInterval(function () {
//                            getSensorData(series);
//                        }, flushTime);//实时刷新数据
                }
            }
        },
        title: {//标题
            text: "",
            style: {
                fontWeight: 'bold',//字体加粗
                fontSize: 20
            }
        },
        xAxis: {//x轴
            type: 'datetime',
            //gridLineWidth:1,//网格线宽度
            labels: {
                x: 0,//调节x轴偏移
                rotation: 0, // 调节倾斜角度偏移
                style: {
                    fontSize: 10
                },
                formatter: function () {
                    return Highcharts.dateFormat('%H', this.value);
                }
            },
            //categories:cate,
            min: new Date().getTime() - 1000 * 24 * 60 * 60,
            max: new Date().getTime(),
            startOnTick: false,//是否强制轴以刻度开始
            endOnTick: false,
            minPadding: 0,
            tickmarkPlacement: "on",//标记(文字)显示的位置，on表示在正对位置上。
            tickPixelInterval: 25,
            tickLength: 3
            //tickInterval: 2*60*60*1000
        },
        yAxis: {//y轴
            title: {
                text: ''
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808089'
            }],
            //min: 0,
            lineWidth: 1,
            tickPixelInterval: 20,
            labels: {
                style: {
                    fontSize: 10
                }
            }
        },
        tooltip: {//鼠标上移曲线的提示
            style: {
                fontSize: 12,
                padding: 3
            },
            formatter: function () {
                return Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                    '数值：' + setPrecision2(sensorName, this.y);//Highcharts.numberFormat(this.y, 2);
            },
            crosshairs: {//交叉点是否显示的一条纵线
                width: 1,
                color: 'gray',
                dashStyle: 'shortdot'
            }
        },
        legend: {//是否显示图例
            enabled: false
        },
        credits: {
            enabled: false//去掉右下角highcharts.com的链接
        },
        plotOptions: {
            series: {
                marker: {
                    radius: 3,  //曲线点半径，默认是4
                    symbol: 'circle' //曲线点类型："circle", "square", "diamond", "triangle","triangle-down"，默认是"circle"
                }
            }
        },
        exporting: {
            enabled: false
        },
        series: [{
            //turboThreshold: 1440,//设置最大数据量
            name: '',
            data: (function () {//加载初始数据
                var data = [];
                var lastVal = 0;
                for (var i = dataList.length - 1; i >= 0; i--) {
                    data.push({
                        x: dataList[i].datetime,
                        y: dataList[i].value
                    });
                }
                if (dataList.length > 0) {
                    //把最新数据的采集时间付给实时刷新时的开始时间
                    beginTime = dataList[0].datetime;
                }
                return data;
            }())
        }]
    });
}


function getSensorHTMLDefault() {
    var greyHTML = '';
    greyHTML += '<div class="sa-lay section fp-section fp-table" style="width:1200px;">';
    greyHTML += '<div class="item4">';
    greyHTML += '<div class="sa-panel sa-gray">';
    greyHTML += '<div class="sa-header">';
    greyHTML += '<div class="sa-header-con">';
    greyHTML += '<h2 class="sa-title" style="color:#000000">暂无传感器</h2>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-header-right">';
    greyHTML += '<div class="sa-nav-btns">';
    greyHTML += setLinkStatus(-1, 1);
    greyHTML += setPowerStatus(0, 1);//设置电池状态
    greyHTML += '<a class="icon i2 i32 icon-config dataset" href="#" kesrc="#" name="dataset"   title="设置"></a>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';

    greyHTML += '<div class="sa-content">';
    greyHTML += '<div class="sa-con-inner">';
    greyHTML += '<div class="sa-inner-content no-bg"  style="width:266px;">';
    greyHTML += '<div class="data-qixiang"  data-width="1024">';
    greyHTML += '<div class="data-up">';
    greyHTML += '<i><img class="data-img" src="/resources/images/sensoricon/n-gray.png"></i>';
    greyHTML += '<h2 class="text-gray">--</h2>';
    greyHTML += '<p></p>';
    greyHTML += '</div>';
    greyHTML += '<div class="chart-down">';
    greyHTML += '<div style="width: 266px; height: 100px;">';
    greyHTML += '<img src="/resources/img/demo/ss/chart-gray.png" alt=""></div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-footer">';
    greyHTML += '<div class="sa-footer-con"></div>';
    greyHTML += '<div class="sa-footer-right"></div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    return greyHTML;
}


function getImageHTMLDefault() {
    var greyHTML = '';
    greyHTML += '<div class="sa-lay section fp-section fp-table" style="width:1200px; height:800px;">';
    greyHTML += '<div class="item4">';
    greyHTML += '<div class="sa-panel sa-gray">';
    greyHTML += '<div class="sa-header">';
    greyHTML += '<div class="sa-header-con">';
    greyHTML += '<h2 class="sa-title" style="color:#000000">暂无植保类设备</h2>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-header-right">';
    greyHTML += '<div class="sa-nav-btns">';
    greyHTML += '<a class="icon i2 i32 icon-view" href="#" title="状态"></a>';
    greyHTML += '<a class="icon i2 i32 icon-photo" href="#" title="拍一张"></a>';
    greyHTML += '<a class="icon i2 i32 icon-config" href="#" title="设置"></a>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-content">';
    greyHTML += '<div class="sa-con-inner">';
    greyHTML += '<div class="sa-inner-content"  style="height:192px;">';
    greyHTML += '<div class="img-con" style="width:266px;">';
    greyHTML += '<img src="/resources/img/demo/no-img.png" alt="" class="">';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-footer">';
    greyHTML += '<div class="sa-footer-con"></div>';
    greyHTML += '<div class="sa-footer-right"></div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    return greyHTML;
}


function getImageHTMLDefault2() {
    var greyHTML = '';
    greyHTML += '<div class="sa-lay section fp-section fp-table" style="width:1200px;">';
    greyHTML += '<div class="item4">';
    greyHTML += '<div class="sa-panel sa-gray">';
    greyHTML += '<div class="sa-header">';
    greyHTML += '<div class="sa-header-con">';
    greyHTML += '<h2 class="sa-title" style="color:#000000">暂无作物图像设备</h2>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-header-right">';
    greyHTML += '<div class="sa-nav-btns">';
    greyHTML += setLinkStatus(-1);
    greyHTML += setPowerStatus(0);//设置电池状态
    greyHTML += '<a name="imageset" class="icon i2 i32 icon-config" href="#" title="设置"></a>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-content">';
    greyHTML += '<div class="sa-con-inner">';
    greyHTML += '<div class="sa-inner-content"  style="height:192px;">';
    greyHTML += '<div class="img-con" style="width:266px;">';
    greyHTML += '<a name="image"  href="#" kesrc="#phplink">';
    greyHTML += '<img src="/resources/img/demo/no-img.png" alt="">';
    greyHTML += '</a>';
    greyHTML += '</div>';
    greyHTML += '<a href="#">';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-footer">';
    greyHTML += '<div class="sa-footer-con"></div>';
    greyHTML += '<div class="sa-footer-right"></div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    return greyHTML;
}


function getVedioHTMLDefault() {
    var greyHTML = '';
    greyHTML += '<div class="sa-lay section fp-section fp-table" style="width:1200px;">';
    greyHTML += '<div class="item4">';
    greyHTML += '<div class="sa-panel sa-movie">';
    greyHTML += '<div class="sa-header">';
    greyHTML += '<center>';
    greyHTML += '<h2 class="sa-title">暂无视频设备</h2>';
    greyHTML += '</center>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-content">';
    greyHTML += '<div class="sa-con-inner">';
    greyHTML += '<div class="sa-inner-content">';
    greyHTML += '<div class="movie-con">';
    greyHTML += '<img  src="/resources/img/demo/video-img.png" alt="" >';
    greyHTML += '</div>';
    greyHTML += '<div class="play-con"></div>';
    greyHTML += '<div class="va-btns">';
    greyHTML += '<ul>';
    greyHTML += setCameraLinkStatus(1, 1);
    greyHTML += '<li><a href="#" class="va va-target"></a></li>';
    greyHTML += '<li><a href="#" class="va va-clock"></a></li>';
    greyHTML += '</ul>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '<div class="sa-footer">';
    greyHTML += '<div class="sa-footer-con"></div>';
    greyHTML += '<div class="sa-footer-right"></div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    greyHTML += '</div>';
    return greyHTML;
}


function alarmDel(deviceId) {
    //判断div当前样式，如果为报警则继续，如果为绿则结束
    var className = $("#sa-panel-" + deviceId).attr("class");
    if (className.indexOf("warn") > 0) {
        //ajax异步删除报警，成功后切换颜色
        $.ajax({
            type: "get",
            url: '/pages/data/delAlarmRecord',
            data: {'stationId': deviceId},
            dataType: "json",
            cache: false,
            success: function (data) {
                $("#sa-panel-" + deviceId).attr("class", "sa-panel sa-green");
            }
        });
    }
}


$(function () {
    $("#nprogress_div").ajaxStart(function () {
        NProgress.start();
    })
    $("#nprogress_div").ajaxComplete(function () {
        NProgress.done();
    })
})
