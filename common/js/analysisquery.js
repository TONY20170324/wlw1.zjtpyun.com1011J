/**
 * Copyright(c) 2004-2014,浙江托普仪器有限公司
 * All rights reserved
 * 版    本：V1.0.0
 * 摘    要：统计分析页面的js方法
 * 作    者：yhq
 * 日    期：2015-01-13 16:59
 */
var SUCCESS = 1;//表示查询成功
var branch = 0;//保存tab，从1之后也是代表分支号
var branchClass = "";
var terminalId;//保存终端id
var beginTime = null;//开始时间
var endTime = null;//结束时间
var interval = 30;//时间间隔
var dataList;//对比分析时，保存传感器的原始数据
var pageNum = 1;//保存当前页码
var totalCount = 0;//记录总数
var isSucc = true;
var options = {//highcharts初始设置
    chart: {
        defaultSeriesType: 'spline',
        renderTo: 'analysisLine',
        plotBorderWidth: 0,
        //plotBorderColor: "#666666",
        height: 530
    },
    title: {  //图表标题
        text: '对比分析数据',
        style: {
            fontWeight: 'bold',//字体加粗
            fontSize: 20
        }
    },
    xAxis: {
        categories: [],
        type: 'datetime',
        //gridLineWidth:1,//网格线宽度
        labels: {
            x: 0,//调节x轴偏移
            rotation: 0, // 调节倾斜角度偏移
            formatter: function () {
                var formatStr = "";
                if (interval == 30) {
                    formatStr = '%m-%d<br/>%H:%M';
                }
                if (interval == 180) {
                    formatStr = '%m-%d<br/>%H:00';
                }
                if (interval == 1440) {
                    formatStr = '%m-%d';
                }
                return Highcharts.dateFormat(formatStr, this.value);
            }
        },
        tickmarkPlacement: "on",//标记(文字)显示的位置，on表示在正对位置上。
        lineColor: "#666666",//设置x轴的颜色
        tickColor: "#666666",//设置刻度的颜色
        tickLength: 5,//x轴刻度高
        lineWidth: 2,//轴线本身宽度
        //ordinal:false,//把x轴无数据的部分隐藏起来
        startOnTick: true,//是否强制轴以刻度开始
        //endOnTick: true,
        minPadding: 0,
        showEmpty: true//是否显示轴线和标题，当轴不包含数据时
    },
    yAxis: {//y轴
        title: {
            text: ''
        },
        tickPositions: [-30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], // 指定y轴坐标点的值
        labels: {
            enabled: true
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808089'
        }],
        //min: 0,//设置最小值
        tickPixelInterval: 100,
        lineColor: "#666666",//设置y轴的颜色
        lineWidth: 2,
        showEmpty: true//是否显示轴线和标题，当轴不包含数据时
    },
    tooltip: {
        style: {
            fontSize: 12,
            padding: 3
        },
        formatter: function () {
            var dataTime = this.x;
            //获取总的series
            var seriesObjs = this.series.chart.series;
            //当前series
            var curSeries = this.series;
            //所在series数组内的序号
            var index = -1;
            //通过for查找当前series所在序号
            for (var i = 0; i < seriesObjs.length; i++) {
                if (curSeries.name == seriesObjs[i].name) {
                    index = i;
                    break;
                }
            }
            //得到该点的真实值
            var trueData = getTrueData(dataTime, index);
            //根据不同的时间间隔设置x轴时间不同的格式化
            var formatStr = "%Y-%m-%d";
            if (interval == 30) {
                formatStr += ' %H:%M';
            }
            if (interval == 180) {
                formatStr += ' %H:00';
            }
            if (interval == 1440) {
            }
            return '<b>' + this.series.name + '</b><br/>' +
                Highcharts.dateFormat(formatStr, this.x) + '<br/>' +
                setPrecision2(this.series.name, trueData);//Highcharts.numberFormat(trueData, 2);
        },
        crosshairs: {//交叉点是否显示的一条纵线
            width: 1,
            color: 'gray',
            dashStyle: 'shortdot'
        }
    },
    plotOptions: {
        series: {
            connectNulls: true, //连接数据为null的前后点
            animation: true//是否在显示图表的时候使用动画
        },
        spline: {
            marker: {
                //enabled: false//去掉曲线上面的点，当只有一个数据时曲线展示的效果是空的
                //radius: 10
            }
        }
    },
    credits: {
        enabled: false//去掉右下角highcharts.com的链接
    },
    exporting: {
        enabled: true,
        scale: 1,//导出的图片和屏幕显示的对比倍数或者放大因素，默认为2
        sourceWidth: 1313,//当导出时原始图的宽度，除非明确设置了图表的宽度。光栅图像被导出时的宽度是乘以scale(定义的倍数)。
        sourceHeight: 550
    },
    series: []
};

AM.ready('init2');

//加载站点下拉框
$(document).ready(function () {
    Highcharts.setOptions({
        global: {
            useUTC: false//曲线使用的时间标准
        },
        lang: {//汉化
            contextButtonTitle: "图片导出",
            printChart: "图片打印",
            downloadJPEG: "下载JPEG图片",
            downloadPDF: "下载PDF文档",
            downloadPNG: "下载PNG图片",
            downloadSVG: "下载SVG矢量图"
        }
    });
});

//获取鼠标上移曲线时的该点的真实值
function getTrueData(dataTime, index) {
    //alert("index=" + index);//--test
    //alert("dataTime=" + Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", dataTime));//--test
    for (var i = 0; i < dataList.length; i++) {
        if (dataList[i][0] == dataTime) {
            return dataList[i][index + 1];
        }
    }
}

//设置分支类型及默认时间，并取第一页数据(终端切换的时候有问题，弃用)
//$(function () {
//    $(".branch").on("click", function () {
//        //换tab时，先清空分页组件
//        $("#pagination").html("");
//        branch = $(this).attr("data-index");
//        branchClass = $(this).parent().attr("data-target");
//        //alert(branchClass+"kkk"+branch);//--test
//        if (branch == 0) {
//            $("#export").css("display", "none");
//            $("#pagination").css("display", "none");
//            getAnalysisData();//获取对比分析数据
//        } else {
//            $("#export").css("display", "block");
//            $("#pagination").css("display", "block");
//            goTOPage(1);//获取第一页数据
//        }
//        //chgTableWidth(branch);
//    })
//});

//设置分支类型及默认时间，并取第一页数据
function setBranchAndTime(type, cssStr) {
    //换tab时，先清空分页组件
    $("#pagination").html("");
    branch = type;
    //var idx = 0;
    //if(branch == 1){
    //    idx = 2;
    //}else if(branch == 2){
    //    idx = 1;
    //}else if(branch == 3){
    //    idx = 4;
    //}else if(branch == 4){
    //    idx = 3;
    //}
    //branchClass = $("[data-toggle=tab]").eq(idx).attr("data-target");
    branchClass = cssStr;
    if (branch == 0) {
        $("#export").css("display", "none");
        $("#pagination").css("display", "none");
        getAnalysisData();//获取对比分析数据
    } else {
        $("#export").css("display", "block");
        $("#pagination").css("display", "block");
        goTOPage(1);//获取第一页数据
    }
    //chgTableWidth(branch);
}

//选择终端，分页获取该终端下同一分支类型的传感器历史数据
function terminalSelected() {
    terminalId = $("#terminalList").val();
    if (terminalId == null || terminalId.length == 0) {
        alert("请先选择终端！");
        return;
    }
    //$("#branch0").click();
    //setBranchAndTime(0);

    //模拟点击分支事件
    //$(function () {
    $("[data-toggle=tab]").eq(0).find("a").click();
    //})

    ////清空分页组件
    //$("#pagination").html("");
    ////tab切换到对比分析
    //branch = 0;
    //$("#export").css("display", "none");
    //$("#pagination").css("display", "none");
    //getAnalysisData();//获取对比分析数据
    ////chgTableWidth(branch);
}


//查询按钮
function dataSelect() {
    if (branch == 0) {
        getAnalysisData();
    } else {
        goTOPage(1);//获取第一页数据
    }
}

//检查时间区间是否设置正确
function checkDate(maxDateInv) {
    beginTime = $("#beginTime").val();
    endTime = $("#endTime").val();
    //当开始时间和结束时间有为空时，就设置默认时间
    if (beginTime == "" || endTime == "") {
        setDefaultTime(beginTime, endTime, 24, "beginTime", "endTime");
    }
    var dateErrorStr = "";
    //判断时间区间是否合法，应为半小时到1个月
    var checkFlag = checkTime2(beginTime, endTime, 30, maxDateInv);
    //时间区间不合法时提示用户
    if (checkFlag != 0) {
        dateErrorStr = "时间区间选择有误";
        if (checkFlag == 1) {
            dateErrorStr += "，开始时间应小于结束时间！";
        } else if (checkFlag == 2) {
            dateErrorStr += "，应为半个小时到" + parseInt(maxDateInv / 60 / 24) + "天之间！";
        }
    }
    return dateErrorStr;
}

//获取对比数据
function getAnalysisData() {
    //var terminalId = $("#terminalList").val();
    if (terminalId == null || terminalId.length == 0) {
        alert("请先选择终端！");
        return;
    }
    //beginTime = $("#beginTime").val();
    //endTime = $("#endTime").val();
    ////开始和结束时间有空值时，设置默认时间
    //setDefaultTime(beginTime, endTime, 24, "beginTime", "endTime");
    ////判断时间区间是否合法，应为半小时到1个月
    //var checkFlag = checkTime2(beginTime, endTime, 30, 1 * 30 * 24 * 60);
    ////时间区间不合法时提示用户
    //if (checkFlag != 0) {
    //    var s = "时间区间选择有误";
    //    if(checkFlag == 1){
    //        s += "，开始时间应小于结束时间！";
    //    }else if(checkFlag == 2){
    //        s += "，应为半个小时到30天之间！";
    //    }
    //    alert(s);
    //    return;
    //}

    //时间区间设置有误时，提示用户
    var errorStr = checkDate(1 * 30 * 24 * 60);
    if (errorStr != "") {
        alert(errorStr);
        return;
    }
    //计算曲线上时间间隔
    interval = setPeriod(beginTime, endTime);
    //alert("interval=" + interval);//--test
    $.ajax({
        type: "GET",
        url: '/data/getDataStat',
        data: {
            stationId:getCookie("stationId"),
            terminalId: terminalId,
            beginTime: beginTime,
            endTime: endTime,
            branchList:branchList
        },
        dataType: "json",
        cache: false,
        success: function (data) {
            //alert("code=" + data.code);//--test
            if (data.code != SUCCESS) {
                //alert(data.message);
                if (data.code == 3) {
                    data.queryField = "";
                    data.list = "";
                }
            }
            //设置数据曲线
            setLine(data);
        },
        error: function () {
        }
    });
}

//设置对比曲线
function setLine(data) {
    dataList = data.list;//console.log(dataList);//--test
    //拼接x轴坐标
    var cate = jointX(beginTime, endTime, interval);
    cate = eval(cate);
    //alert("cate= " + cate);//--test
    var timeList = new Array();//保存各个时间点
    timeList = cate.toString().split(",");//console.log(timeList);//--test
    var sensorMap = data.queryField;//获取传感器名称等信息
    var series = "[";
    $.each(sensorMap, function (key, value) {//遍历传感器map
        //alert(sensorMap[i] + "   " + i);//--test
        //alert(value + "   " + key);//--test
        series += "{allowPointSelect: true, name:'" + value + "',data:[";
        var arr = new Array();//保存一个传感器的一组数据
        for (var i = dataList.length - 1; i >= 0; i--) {
            var dl = dataList[i][key] + "";
            //alert("dataList[i][key]=" + dl);
            if (dl == "--" || dl == "") {
                continue;
            }
            arr.push(setPrecision2(value, dataList[i][key]));//数据缩放之前先设置精度
        }
        var step = 1;//数量级
        if (arr.length > 0) {
            var min = Math.min.apply(null, arr);//获取数组中的最小值
            var max = Math.max.apply(null, arr);
            //需要把数据缩放在-30至100之间
            if (max > 0) {
                if (max <= 10) {
                    for (max *= 10; max <= 100;) {
                        step *= 10;
                        max = max * 10;
                    }
                } else {
                    for (; max > 100;) {
                        step *= 0.1;
                        max = max / 10;
                    }
                }
            } else if (max < 0) {
                for (max *= 10; max >= -30;) {
                    step *= 10;
                    max = max * 10;
                }
            }
            if (min * step < -30) {
                for (; min * step < -30;) {
                    step *= 0.1;
                }
            }

            var str = value;//alert("str=" + str);
            if (step >= 1) {
                str += "[" + step + ":1]";
            } else {
                str += "[1:" + Math.round(1 / step) + "]";
            }
            series = series.replace(value, str);
            //alert("series=" + series);
        }
        //拼接曲的数据
        for (var i = 0; i < timeList.length; i++) {
            for (var j = dataList.length - 1; j >= 0; j--) {
                if (new Date(parseInt(dataList[j][0])).getTime() == timeList[i]) {
                    //series += "['" + dataList[j][0] + "',";
                    var d = dataList[j][key] + "";
                    if (d == "" || d == "--") {
                        d = null;
                    } else {
                        d = setPrecision2(value, d) * step;//先设置精度再缩放
                    }
                    //series += d + "],";
                    series += d + ",";
                    break;
                }
            }
            if (j < 0) {
                //series += "['" + timeList[i] + "',null],";
                series += null + ",";
            }
        }
        if (series.charAt(series.length - 1) == ",") {
            series = series.substr(0, series.length - 1);
        }
        series += "]},";
    });
    //alert(series);//--test
    if (series.charAt(series.length - 1) == ",") {
        series = series.substr(0, series.length - 1);
    }
    series += "]";
    series = eval(series);
    //console.log(series);//--test

    //设置highcharts中的一些参数
    if (series.length > 0) {
        options.title.text = "对比分析数据";
    } else {
        options.title.text = "暂无任何传感器";
    }
    options.xAxis.categories = cate;
    var step = Math.ceil(timeList.length / 15);//Math.ceil()向上取整,有小数就整数部分加1
    //alert("step=" + step);//--test
    options.xAxis.tickInterval = step;
    options.series = series;
    options.chart.type = "spline";
    new Highcharts.Chart(options);//绘制曲线
}

//翻页
function goTOPage(currentPage) {
    pageNum = currentPage;
    if (currentPage == null) {
        pageNum = $("#goPage").val();
    }
    getAllSensorData(true);
}

//获取终端同一分支所有传感器的数据
function getAllSensorData(isSelect) {
    isSucc = true;
    if (terminalId == null || terminalId == 0) {
        alert("请先选择终端！");
        isSucc = false;
        return false;
    }
    //时间区间设置有误时，提示用户
    var errorStr = checkDate(3 * 30 * 24 * 60);
    if (errorStr != "") {
        alert(errorStr);
        isSucc = false;
        return;
    }
    $.ajax({
        type: "GET",
        url: '/data/getDataStatPage',
        data: {
            stationId:getCookie("stationId"),
            "terminalId": terminalId,
            "branch": branch,
            "beginTime": beginTime,
            "endTime": endTime,
            "pageSize": 10,
            "pageNo": pageNum
        },
        dataType: "json",
        cache: false,
        async: false,//等ajax执行完后再返回，同步
        success: function (data) {
            //alert(data.code);//--test
            if (data.code != SUCCESS) {//查询失败
                //$("#thead" + branch).html("");
                //$("#tbody" + branch).html("");
                //$("#branch" + branch).hide();alert(branch)
                $(branchClass).html('<div class="well"><h2 class="text-danger">暂无任何传感器</h2></div>');
                $("#pagination").html("");
                //alert(data.message);
                isSucc = false;
                return;
            }
            totalCount = data.recordCount;//记录总数
            if (isSelect) {//查询的时候更新表格，导出的时候不更新
                //$(branchClass).html('<table class="table">' +
                //'<thead id="thead' + branch + '"></thead>' +
                //'<tbody id="tbody' + branch + '"></tbody>' +
                //'</table>');
                $(branchClass).html('<table class="table">' +
                '<thead></thead><tbody></tbody>' +
                '</table>');
                //设置表格及数据
                setTable(data, function () {
                    scrollTable($(branchClass),//$("#tbody" + branch).parent().parent(),
                        {autohidemode: true, perfectscroll: true, useBothWheelAxes: true});
                });
            }
        },
        error: function () {
        }
    });
}

//设置表格头及数据
function setTable(data, callback) {
    //$("#branch" + branch).show();
    var sensorThead = data.queryField;//获取表格头
    //alert(sensorThead);//--test
    var sensorSize = 0;
    var width = 200;
    var theadHTML = "<tr><th width='200'>时间</th>";
    $.each(sensorThead, function (i) {//拼接表格头
        //alert(sensorThead[i]);//--test
        var leng = sensorThead[i].length * 13 > 145 ? 145 : sensorThead[i].length * 13;
        //console.log(leng);//--test
        theadHTML += "<th id='" + branch + i + "' width='" + leng + "'>" + sensorThead[i] + "</th>";
        sensorSize++;
        width += leng;
    });
    theadHTML += "</tr>";
    $(branchClass).find("thead").html(theadHTML);//"$("#thead" + branch).html(theadHTML);

    var dataList = data.list;
    //alert("dataList.length=" + dataList.length);//--test
    //alert(new Date(1424838600000));
    //alert("dataList[0][0]=" + dataList[0][0]);//--test
    var tbodyHTML = "";
    for (var j = 0; j < dataList.length; j++) {//拼接表格内容
        tbodyHTML += "<tr>" +
        "<td>" + formatDate(new Date(parseInt(dataList[j][0]))) + "</td>";
        for (var k = 1; k <= sensorSize; k++) {
            var d = dataList[j][k] + "";
            if (d != "" && d != "--") {
                var sensorName = $("#" + branch + "sensor" + k).text();//获取表格头传感器名称
                d = setPrecision2(sensorName, d);
            }
            tbodyHTML += "<td>" + d + "</td>";
        }
        tbodyHTML += "</tr>";
    }
    //alert(tbodyHTML)
    if (sensorSize != 0 && dataList.length == 0) {
        //tbodyHTML = '<tr><td colspan="' + (sensorSize + 1) + '">暂无数据</td></tr>';
    }
    $(branchClass).find("tbody").html(tbodyHTML);//$("#tbody" + branch).html(tbodyHTML);
    //console.log($("#tbody" + branch).parent().parent())

    setPagination(data.pageNo, data.recordCount, data.pageCount);
    if (data.recordCount == 0) {
        paginationDisabled();
        //console.log("该终端该时间段内没有任何数据！");
        //alert("该终端该时间段内没有任何数据！");
    }
    if (callback) {
        callback();
    }
}

function scrollTable(obj, config, callback) {
    var l = 0, t = $(obj);
    t.css({
        width: '1158px',
        'margin-left': "20px",
        'padding': "0px"
    });
    t.find("table th").each(function (i) {
        l = parseInt($(this).attr('width')) + l;
    });
    var css = {
        'width': Math.max(l, 1158) + "px",
        'height': 'auto'
        //'border-bottom':'1px solid #d5d5d5'
    };
    var x = $("<div>").css(css);
    var m = t.find('table');
    m.clone().css(css).appendTo(x);
    x.appendTo(t);
    m.remove();             // t.find('table').css(css);

    var opt = {
        cursorcolor: "#339933",
        cursoropacitymax: 1,
        touchbehavior: false,
        cursorwidth: "5px",
        cursorborder: "0",
        cursorborderradius: "5px",
        railVertical: false,
        autohidemode: true,
        nicescroll: false,
        perfectscroll: false,
        wheelSpeed: 2,
        wheelPropagation: true,
        minScrollbarLength: 20
    };
    $.extend(true, opt, config);
    if (opt.nicescroll) {
        AM.ready('nicescroll', function () {
            t.niceScroll(opt);
        });
    } else if (opt.perfectscroll) {
        AM.ready('perfectscrollbar', 'perfectscrollbar.css', function () {
            t.css("position", 'relative');
            t.perfectScrollbar(opt);
        });
    } else {
        t.css('overflow-x', 'scroll');
    }
    if (callback) callback();
}

//导出数据
function exportData() {
    getAllSensorData(false);//先查询数据条数及提交之前的判断
    if (!isSucc) {
        return;
    }
    //alert("totalCount=" + totalCount);//--test
    if (totalCount > 8000) {
        alert("对不起，数据已大于8000条，不能导出！");
        return;
    }
    if (totalCount <= 0) {
        alert("对不起，没有可导出的数据！");
        return;
    }
    var terminalName = $("#terminalList option:selected").text();//获取终端名称
    //alert("terminalName=" + terminalName);//--test
    var beginTime = $("#beginTime").val();
    var endTime = $("#endTime").val();
    var exportType = $("#exportType").val();//获取导出类型
    window.location.href = "/data/export/exportDataStat?terminalId=" + terminalId +
    "&terminalName=" + encodeURI(encodeURI(terminalName)) +
    "&branch=" + branch + "&beginTime=" + beginTime + "&endTime=" + endTime +
    "&exportType=" + exportType + "&pageSize=" + totalCount;
}
