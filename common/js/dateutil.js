/**
 * Created by Administrator on 14-12-15.
 * 日期类型转换工具
 */

/**
 * 日期转字符串
 * @param data
 * @returns {yyyy-MM-dd}
 */
function date2String(data) {
    var datetime = new Date();
    datetime.setTime(data);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    return year + "-" + month + "-" + date;
}

/**
 * 时间戳转字符串
 * @param time
 * @returns {yyyy-MM-dd HH:mm:ss}
 */
function timeStamp2String(time) {
    var datetime = new Date();
    datetime.setTime(time);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var hour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
    var minute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var second = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}


/**
 * 时间戳转字符串
 * @param time
 * @returns {yyyy-MM-dd}
 */
function timeStamp2DateStr(time) {
    var datetime = new Date();
    datetime.setTime(time);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    return year + "/" + month + "/" + date;
}

/**
 * 时间戳转字符串
 * @param time
 * @returns {HH:mm}
 */
function timeStamp2Hm(time, runSeconds) {
    var datetime = new Date();
    datetime.setTime(time);
    var hour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
    var minute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();

    if (typeof (runSeconds) != "undefined") {
        var datetime2 = new Date();
        datetime2.setTime(time + runSeconds * 1000);
        var hour2 = datetime2.getHours() < 10 ? "0" + datetime2.getHours() : datetime2.getHours();
        var minute2 = datetime2.getMinutes() < 10 ? "0" + datetime2.getMinutes() : datetime2.getMinutes();
        return hour + ":" + minute + " ~ " + hour2 + ":" + minute2;
    }
    return hour + ":" + minute;
}

function timeStampToHm(time, runSeconds) {
    var datetime2 = new Date();
    datetime2.setTime(time + runSeconds * 1000);
    var hour2 = datetime2.getHours() < 10 ? "0" + datetime2.getHours() : datetime2.getHours();
    var minute2 = datetime2.getMinutes() < 10 ? "0" + datetime2.getMinutes() : datetime2.getMinutes();
    return hour2 + ":" + minute2;

}

function hmToHm(hour,minute, runSeconds) {
    var datetime2 = new Date();
    datetime2.setHours(hour);
    datetime2.setMinutes(minute)
    datetime2.setTime(datetime2.getTime() + runSeconds * 1000);
    var hour2 = datetime2.getHours() < 10 ? "0" + datetime2.getHours() : datetime2.getHours();
    var minute2 = datetime2.getMinutes() < 10 ? "0" + datetime2.getMinutes() : datetime2.getMinutes();
    return hour2 + ":" + minute2;

}
