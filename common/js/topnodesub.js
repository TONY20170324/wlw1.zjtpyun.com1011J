//node.js 消息订阅接收 JS 封装类
//需要引入 jQuery 和 socket.io
//实例化的时候设定 IP  PORT


function NodeClient(ip, port) {

    this.ip = ip || "127.0.0.1";
    this.port = port || 8155;

    var m_Error = "";
    //设置错误
    var setError = function (err) {
        m_Error = err;
    }

    this.getError = function () {
        return m_Error;
    }
    this.connect = function () {
        if (!("io" in window)) {
            setError("io not defined");
            return false;
        }
        socket = io.connect('http://' + this.ip + ':' + this.port);
        return true;
    }
	//订阅方法
    this.subscribe = function (target) {
        socket.emit('subscribe', {destination:target});
    }
	//取消订阅方法
    this.unsubscribe = function (target) {
        socket.emit('unsubscribe', {destination:target});
    }
	//消息发布方法
    this.publish = function (target,msg) {
        socket.emit('publish', { content: msg,destination:target});
    }

    //错误回调设置
    this.onError = function (callback) {
        socket.on('error', function (data) {
            callback(data);
        });


    }

    //消息回调设置
    this.onMessage = function (callback) {
        socket.on('message', function (data) {
            callback(data);
        });


    }



}
