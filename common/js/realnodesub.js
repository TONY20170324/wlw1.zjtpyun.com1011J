//node.js 消息订阅接收 JS 封装类
//需要引入 jQuery 和 socket.io
//实例化的时候设定 IP  PORT

//var client = new NodeClient("192.168.1.19", "5295");
var client = new NodeClient(node_ip, node_port);
$(document).ready(function () {

    if (!client.connect()) {
        alert(client.getError());
    }

    /**
     接受消息 */
    client.onMessage(function (data) {
        if(data.match.toString().indexOf("sensor_")>=0){
            var sensorId = getSensorIdFromNode(data.match.toString());
            var jsonObj = getJsonObj(data.content);
            setNewData(sensorId, jsonObj);
        }else if(data.match.toString().indexOf("terminal_")>=0){
            var sensorId = getTerminalIdFromNode(data.match.toString());
            var jsonObj = getJsonObj(data.content);
            setNewData(sensorId, jsonObj);

            if(jsonObj.stat==0){
                terminalStatus==true;
            }else{
                terminalStatus==false;
                $("[name=node_link_name]").attr("data-content", "断开");
                var str='<i class="icon i2 i32 icon-unlink"></i>';
                $("[name=node_link_name]").html(str);

            }

        }

    });

});

//订阅
function subscribe(divId){
    client.subscribe("^sensor_"+divId+"$");
}
//订阅
function subscribeTerminal(terminalId){
    client.subscribe("^terminal_"+terminalId+"$");
}//订阅
function unsubscribe(divId){
    client.unsubscribe("sensor_*");
}function unsubscribeTerminal(divId){
    client.unsubscribe("terminal_"+divId);
}

//是否符合规则，TODO 正则
//解析出id，TODO 正则
function getSensorIdFromNode(str){
    return str.substring("sensor_".length, str.length);
}//解析出id，TODO 正则
function getTerminalIdFromNode(str){
    return str.substring("terminal_".length);
}
//获得json转对象
function getJsonObj(str){
    if(typeof(str) == "object"){
        return str;
    }
    return JSON.parse(str);
}

function setNewSensorData(sensorId, jsonObj){
    if(jsonObj.value != undefined){
        $("#node_value_"+sensorId).html(jsonObj.value);
    }
    if(jsonObj.alarm != undefined){
        if(jsonObj.alarm!=1000 && jsonObj.alarm!=0){
            $("#sa-panel-" + sensorId).attr("class", "sa-panel sa-warn");
        }
    }
    //if(jsonObj.link != undefined){
    //    if(jsonObj.link == -1 || jsonObj.link == 1000 || !terminalStatus){
    //        $("#node_link_"+sensorId).attr("data-content", "断开");
    //        var str='<i class="icon i2 i32 icon-unlink"></i>';
    //        $("#node_link_"+sensorId).html(str);
    //    }else{
    //        $("#node_link_"+sensorId).attr("data-content", "连接");
    //        var str='<i class="icon i2 i32 icon-link"></i>';
    //        $("#node_link_"+sensorId).html(str);
    //    }
    //}
    if(jsonObj.power != undefined){
        var power=jsonObj.power;
        var powerTitle = "";
        if(power>=0 || power<6){
            powerTitle = "电池电量" + power * 20 + "%";
        }else if(power==6){
            powerTitle = "正在充电";
        }else{
            powerTitle = "电池电量" + "100%";
        }

        $("#node_power_"+sensorId).attr("data-content", powerTitle);

        var str = "";
        switch (power) {
            case 0:
                str = '<img class="battery" src="/resources/img/battery/battery0.png">';
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

        $("#node_power_"+sensorId).html(str);
    }
}