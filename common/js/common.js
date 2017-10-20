/**
 * 设备的状态
 * @returns {Map}
 */
function getStatus() {
    var map = new Map();
    map.put("-1", "全部");
    map.put("0", "关闭");
    map.put("1", "开启");
    map.put("2", "展开");
    map.put("3", "收拢");
    map.put("4", "停止");
    map.put("41", "开停");
    map.put("42", "关停");
    map.put("5", "异常");
    return map;
}
/**
 * 关闭弹出窗口
 */
function closeBox() {
    parent.$.fancybox.close();
}
//日志打印
//log = {
//    debug: function (str) {
//        try {
//            if ("console" in window)
//                console.log(str);
//        } catch (ex) {
//            //alert(ex.message)
//        }
//    }
//}
/**
 * 位数不足左边补0
 * @param number 需要处理的数字
 * @param length 需要的长度
 * @param char 填补的字符
 * @returns {string}
 */
function padLeft(number, length, char) {
    return (Array(length).join(char || "0") + number ).slice(-length);
}


/**
 * 时间格式化
 * @param date 需要格式化的日期，date类型
 * @param parrent 格式
 * @returns {string} 返回yyyy-MM-dd hh:mm:ss格式的日期字符串
 */
function formatDate(date, parrent) {
    //为了兼容ie，对时间字符串进行处理
    //date = date.replace(/-/g,"/");

    date = new Date(date);
    var fullYear = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month.toString().length == 1) {
        month = "0" + month;
    }
    var day = date.getDate();
    if (day.toString().length == 1) {
        day = "0" + day;
    }
    var hour = date.getHours();
    if (hour.toString().length == 1) {
        hour = "0" + hour;
    }
    var min = date.getMinutes();
    if (min.toString().length == 1) {
        min = "0" + min;
    }
    var sec = date.getSeconds();
    if (sec.toString().length == 1) {
        sec = "0" + sec;
    }
    var dateStr = "";
    parrent = $.trim(parrent);
    if (typeof(parrent) == "string" && null != parrent && "" != parrent) {
        if (parrent.indexOf("yyyy") > -1) {
            dateStr += fullYear;
        }
        if (parrent.indexOf("MM") > -1) {
            dateStr += "-" + month;
        }
        if (parrent.indexOf("dd") > -1) {
            dateStr += "-" + day;
        }
        if (parrent.indexOf("hh") > -1) {
            dateStr += " " + hour;
        }
        if (parrent.indexOf("mm") > -1) {
            dateStr += ":" + min;
        }
        if (parrent.indexOf("ss") > -1) {
            dateStr += ":" + sec;
        }
        if (dateStr.charAt(0) == "-" || dateStr.charAt(0) == " " || dateStr.charAt(0) == ":") {
            dateStr = dateStr.substr(1, dateStr.length - 1);
        }
    } else {
        dateStr = fullYear + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    }
    return dateStr;
}


/**
 * 判断时间区间是否合法
 * @param beginTime 开始时间，string类型
 * @param endTime 结束时间，string类型
 * @param min 最小区间
 * @param max 最大区间
 * @returns {boolean}
 */
function checkTime(beginTime, endTime, min, max) {
    //为了兼容ie，对时间字符串进行处理
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");

    var time = (new Date(endTime).getTime() - new Date(beginTime).getTime()) / 1000 / 60;//转化成分钟
    if (time <= 0) {//开始时间大于等于结束时间
        return false;
    }
    if (min != null) {
        if (time < min) {
            return false;
        }
    }
    if (max != null) {
        if (time > max) {
            return false;
        }
    }
    return true;
}


/**
 * 判断时间区间是否合法
 * @param beginTime 开始时间，string类型
 * @param endTime 结束时间，string类型
 * @param min 最小区间
 * @param max 最大区间
 * @returns {number}
 */
function checkTime2(beginTime, endTime, min, max) {
    //为了兼容ie，对时间字符串进行处理
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");

    var time = (new Date(endTime).getTime() - new Date(beginTime).getTime()) / 1000 / 60;//转化成分钟
    if (time <= 0) {//开始时间大于等于结束时间
        return 1;
    }
    if (min != null) {
        if (time < min) {
            return 2;
        }
    }
    if (max != null) {
        if (time > max) {
            return 2;
        }
    }
    return 0;
}

/**
 * 设置默认时间，前提条件：页面中有全局变量beginTime,endTime
 * @param beginTime 开始时间，string类型
 * @param endTime 结束时间，string类型
 * @param hourLength 默认时间长度，以小时为单位
 * @param beginTimeContainer 开始时间显示的容器
 * @param endTimeContainer 结束时间显示的容器
 */
function setDefaultTime(begin_time, end_time, hourLength, beginTimeContainer, endTimeContainer) {
    //为了兼容ie，对时间字符串进行处理
    begin_time = begin_time.replace(/-/g, "/");
    end_time = end_time.replace(/-/g, "/");

    //开始和结束时间有空值时，设置默认时间
    if (begin_time == "" || end_time == "") {
        var now = new Date();
        var ago = new Date(now);//now.setDate(now.getDate() - 1);
        if (begin_time == "") {
            if (end_time == "") {//开始和结束时间都为空时，设置为当前最近的24小时
                ago.setHours(ago.getHours() - hourLength);
                beginTime = formatDate(ago);
                endTime = formatDate(now);
            } else {//只有开始时间为空时，设置为结束时间之前的24小时
                ago = new Date(end_time);
                ago.setHours(ago.getHours() - hourLength);
                beginTime = formatDate(ago);
            }
        } else {
            if (end_time == "") {//只有结束时间为空时，设置开始时间之后的24小时
                ago = new Date(begin_time);
                ago.setHours(ago.getHours() + hourLength);
                endTime = formatDate(ago);
                if (ago > now) {
                    endTime = formatDate(now);
                }
            }
        }
        $("#" + beginTimeContainer).val(beginTime);
        $("#" + endTimeContainer).val(endTime);
    }
}

/**
 * 根据开始时间和结束时间区间设置采集间隔
 * @param beginTime 开始时间，string类型
 * @param endTime 结束时间，string类型
 * @returns {number}
 */
function setPeriod(beginTime, endTime) {
    //为了兼容ie，对时间字符串进行处理
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");

    var time = (new Date(endTime).getTime() - new Date(beginTime).getTime()) / 1000 / 60;//转化成分钟
    var interval = 30;//默认采集间隔为30分钟
    //时间区间大于半个小时小于一天，采集间隔为30分钟
    if (time >= 30 && time <= 24 * 60) {
        interval = 30;
    }
    //时间区间大于一天小于一星期，采集间隔为3小时
    if (time > 24 * 60 && time <= 7 * 24 * 60) {
        interval = 180;
    }
    //时间区间大于一星期小于1个月，采集间隔为一天
    if (time > 7 * 24 * 60 && time <= 1 * 30 * 24 * 60) {
        interval = 1440;
    }
    return interval;
}

/**
 * 保留n位小数
 * @param num 表示要四舍五入的数
 * @param n 表示要保留的小数位数
 * @returns {number}
 */
function decimal(num, n) {
    if (isNaN(num)) {//如果不是数字
        return num;
    }
    var vv = Math.pow(10, n);
    return Math.round(num * vv) / vv;
}

/**
 * 强制保留n位小数
 * @param num
 * @param n
 * @returns {string|*}
 */
function decimal2(num, n) {
    if (isNaN(num)) {//如果不是数字
        return num;
    }
    num = decimal(num, n);
    var str = num.toString();
    var rs = str.indexOf('.');
    if (n > 0) {
        if (rs < 0) {
            rs = str.length;
            str += '.';
        }
        while (str.length <= rs + n) {
            str += '0';
        }
    }
    return str;
}

function getSensorTypeNameScaleArrs(){
    var sensorTypeNameScaleArrs =
        [
            [161, '土壤温度', 1],
            [162, '土壤水分', 1],
            [163, '土壤盐分', 2],
            [164, '土壤pH', 1],
            [165, '土壤紧实度	', 1],
            [166, '茎杆微变', 3],
            [167, '果实膨大', 3],
            [168, '植物茎流', 3],
            [170, '叶面温度', 1],
            [171, '树干生长', 2],
            [172, '土壤水势', 1],
            [173, '土壤热通量', 1],
            [176, '雨量', 1],
            [177, '空气温度', 1],
            [178, '空气湿度', 1],
            [179, '露点温度', 1],
            [180, '风向', 0],
            [181, '风速', 3],
            [182, '雨量', 1],
            [183, '蒸发', 1],
            [184, '大气压', 0],
            [185, '二氧化碳', 0],
            [186, '光照强度', 0],
            [187, '光量子', 0],
            [188, '紫外辐射', 0],
            [189, '总辐射', 0],
            [190, '叶面湿度', 1],
            [191, '蒸发', 1],
            [193, '甲醛', 2],
            [194, '一氧化碳', 0],
            [196, '氨气', 1],
            [197, 'PM2.5', 0],
            [198, 'PM10', 3],
            [199, '硫化氢', 1],
            [209, '余氯', 2],
            [200, '噪音', 1],
            [210, '浊度', 2],
            [211, '水体pH', 1],
            [212, '水温', 1],
            [213, '溶解氧', 2],
            [214, '氨氮', 2],
            [215, '氧化还原电位', 0],
            [216, '水体电导', 0],
            [217, '水位', 0]
        ];

    return sensorTypeNameScaleArrs;
}

/**
 * 根据传感器类型设置传感器数据精度
 * @param sensorType 传感器类型
 * @param num 数据
 * @returns {*}
 */
function setPrecision(sensorType, num) {
    if (isNaN(num)) {//如果不是数字
        return num;
    }

    var sensorTypeNameScaleArrs = getSensorTypeNameScaleArrs();

    var str = num;
    //获得精度
    var scale = 1;
    for(var i=0; i<sensorTypeNameScaleArrs.length; i++){
        var sensorTypeNameScaleArr = sensorTypeNameScaleArrs[i];
        if(sensorTypeNameScaleArr[0] == sensorType){
            scale = sensorTypeNameScaleArr[2];
            break;
        }
    }

    //设置精度
    if(scale == 0){
        str = decimal(num, 0);
    }else{
        str = decimal2(num, scale);
    }

    return str;
}

/**
 * 根据传感器名称设置传感器数据精度
 * @param sensorName 传感器名称
 * @param num
 * @returns {*}
 */
function setPrecision2(sensorName, num) {
    if (isNaN(num)) {//如果不是数字
        return num;
    }

    var sensorTypeNameScaleArrs = getSensorTypeNameScaleArrs();

    var str = num;
    //获得精度
    var scale = 1;
    for(var i=0; i<sensorTypeNameScaleArrs.length; i++){
        var sensorTypeNameScaleArr = sensorTypeNameScaleArrs[i];
        if(sensorName.indexOf(sensorTypeNameScaleArr[1]) >= 0 ){
            scale = sensorTypeNameScaleArr[2];
            break;
        }
    }

    //设置精度
    if(scale == 0){
        str = decimal(num, 0);
    }else{
        str = decimal2(num, scale);
    }

    return str;

}

/**
 * 当记录数为0时，设置分页控件中的跳转按钮等失去作用
 */
function paginationDisabled() {
    $("#goPage").attr("disabled", true);
    $(".btn-goto").attr("disabled", true);
}
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * 根据时间间隔拼接x轴刻度
 * @param beginTime 开始时间
 * @param endTime 结束时间
 * @param interval 时间间隔
 * @returns {string}
 */
function jointX(beginTime, endTime, interval) {
    //为了兼容ie，对时间字符串进行处理
    beginTime = beginTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");

    //拼接x轴坐标
    var cate = "[";
    //var timeList = new Array();//保存各个时间点
    var datetime = new Date(beginTime);
    //alert("beginTime=" + beginTime);//--TEST
    //alert("datetime=" + datetime);//--TEST
    if (interval == 30) {
        if (!((datetime.getMinutes() == 0 || datetime.getMinutes() == 30) && datetime.getSeconds() == 0)) {
            datetime.setMinutes(30 * parseInt(datetime.getMinutes() / 30) + 30);
            datetime.setSeconds(0);
        }
        //alert("datetime=" + formatDate(datetime));//--TEST
        //每半小时拼接x坐标轴
        while (datetime <= new Date(endTime)) {
            cate += "'" + datetime.getTime() + "',";
            //timeList.push(datetime.getTime());
            datetime.setMinutes(datetime.getMinutes() + 30);
        }
    } else if (interval == 180) {
        if (!(datetime.getHours() % 3 == 0 && datetime.getMinutes() == 0 && datetime.getSeconds() == 0)) {
            datetime.setHours(3 * parseInt(datetime.getHours() / 3) + 3);
            datetime.setMinutes(0);
            datetime.setSeconds(0);
        }
        //alert("datetime=" + formatDate(datetime));//--TEST
        //每3小时拼接x坐标轴
        while (datetime <= new Date(endTime)) {
            cate += "'" + datetime.getTime() + "',";
            //timeList.push(datetime.getTime());
            datetime.setHours(datetime.getHours() + 3);
        }
    } else if (interval == 1440) {
        //if (datetime.getHours() != 0 || datetime.getMinutes() != 0 || datetime.getSeconds() != 0) {
        //    datetime.setDate(datetime.getDate() + 1);
        //    datetime.setHours(0);
        //    datetime.setMinutes(0);
        //    datetime.setSeconds(0);
        //}
        //时间间隔为天时，直接忽略时分秒
        datetime.setHours(0);
        datetime.setMinutes(0);
        datetime.setSeconds(0);
        //每一天拼接x坐标轴
        while (datetime <= new Date(endTime)) {
            cate += "'" + datetime.getTime() + "',";
            //timeList.push(datetime.getTime());
            datetime.setDate(datetime.getDate() + 1);
        }
    }
    if (cate.charAt(cate.length - 1) == ",") {
        cate = cate.substr(0, cate.length - 1);
    }
    cate += "]";
    return cate;
}
