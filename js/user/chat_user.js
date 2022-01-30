$(function () {
    var img_type = ["png", "jpg", "jpeg", "gif", "tiff"];
    var Service_id = "3";

    layui.use("layer", function () {
        var layer = layui.layer;
    })
    var ws;
    if ($.cookie("is_login") == 'false' || $.cookie("is_login") === undefined) {
        location.href = "/user/login.html";
    }
    ws = new WebSocket("ws://127.0.0.1:8000/data/wstest/");

    ws.onopen = function () {
        console.log("已建立连接");
    }

    $("#send_btn").click(function () {
        var content = $("#msg_input").val();
        if (content == "") {
            layer.msg("不能发送空白消息");
            return;
        }
        var new_content = "";
        for (var i = 0; i < content.length; i++) {
            if (content[i] == "\n" || content[i] == "\r" || content[i] == "\a" || content[i] == "\b" || content[i] == "\v" || content[i] == "\t") {
                new_content += "<br>";
            } else {
                new_content += content[i];
            }
        }
        var date = new Date();
        var oSendContent = {
            text: new_content,  // 内容
            to: Service_id,  // 给客服发送
            time: date.getTime(),  // 时间戳
            type: "text",
        };
        ws.send(JSON.stringify(oSendContent));  // 发送
        $("#msg_input").val("");
        var html = '<div class="msg_box layui-clear"><div class="send">' +
            '<img src="' + $("#header_head_photo").attr("src") + '" alt="" class="user_head"><div class="content">' +
            new_content + '</div></div></div>';
        $("#content_history").append(html);
        $("#content_history").children(":last").get(0).scrollIntoView(false);
    })

    ws.onmessage = function (msg) {
        // console.log(msg.data);
        var data = JSON.parse(msg.data);
        // console.log(data);
        var from_name = data.name;
        var from_id = data.id;
        var head = data.head;
        var time = data.time;
        var content = data.content;
        var media_url = data.media_url;
        var type = data.type;
        // console.log(content);
        if (type=="text"){
            var html = '<div class="msg_box layui-clear"><div class="recv">' +
            '<img src="' + app_root + media_url + head + '" alt="" class="user_head"><div class="content">' +
            content + '</div></div></div>';
        }else if(type=="file"){
            var file_name = content.split("/upload_files/chat_file/")[1];
            var html = '<div class="msg_box layui-clear"><div class="recv">' +
            '<img src="' + app_root + media_url + head + '" alt="" class="user_head"><div class="content">' +
            '<a href="' + content + '" target="_blank">' + file_name + '</a></div></div></div>';
        }else if(type=="image"){
            var file_name = content.split("/upload_files/chat_file/")[1];
            var html = '<div class="msg_box layui-clear"><div class="recv">' +
            '<img src="' + app_root + media_url + head + '" alt="" class="user_head"><div class="content">' +
            '<a href="'+content+'" target="_blank"><img src="' + content + '" target="_blank" alt="'+file_name+'" width="50" height="50" /></a></div></div></div>';
        }
        $("#content_history").append(html);
        $("#content_history").children(":last").get(0).scrollIntoView(false);
    }

    // 获取文件
    $("#get_file_btn").click(function () {
        $("#get_file").click();
    })

    $("#get_file").change(function () {
        var file = this.files[0];
        var file_split = file.name.split(".")
        var file_type = file_split[file_split.length-1];
        console.log(file_type);
        if (img_type.indexOf(file_type)!=-1){
            var type = "image";
        }
        else{
            var type = "file"
        }
        var date = new Date()
        var time = date.getTime();
        var formData = new FormData();

        formData.append("chat_file", file);
        formData.append("time", time);
        formData.append("to", Service_id);
        formData.append("type", type);

        $.ajax({
            url: app_root + "/data/chat_file",
            type: "post",
            dataType: "json",
            data: formData,
            processData: false, // 告诉jQuery不要去处理发送的数据
            contentType: false, // 告诉jQuery不要去设置Content-Type请求头
            xhrFields: {
                withCredentials: true // 发送Ajax时，Request header中会带上 Cookie 信息。
            },
            crossDomain: true,
        }).done(function (msg) {
            console.log(msg);
            if (msg.state == "ok") {
                var file_name = msg.msg.file_name;
                var from_id = msg.msg.from_id;
                var from_name = msg.msg.from_name;
                var text = msg.msg.text;
                var time = msg.msg.time;
                var to = msg.msg.to;

                var new_content = "";

                for (var i = 0; i < file_name.length; i++) {
                    if (file_name[i] == "\n" || file_name[i] == "\r" || file_name[i] == "\b" || file_name[i] == "\v" || file_name[i] == "\t") {
                        console.log(file_name[i])
                        new_content += "<br>";
                    } else {
                        new_content += file_name[i];
                    }
                }
                if(type=="file"){
                    var html = '<div class="msg_box layui-clear"><div class="send">' +
                    '<img src="' + $("#header_head_photo").attr("src") + '" alt="" class="user_head"><div class="content">' +
                    '<a href="' + text + '" target="_blank">' + new_content + '</a></div></div></div>';
                }else if(type=="image"){
                    var html = '<div class="msg_box layui-clear"><div class="send">' +
                    '<img src="' + $("#header_head_photo").attr("src") + '" alt="" class="user_head"><div class="content">' +
                    '<a href="'+text+'" target="_blank"><img src="' + text + '" target="_blank" alt="'+new_content+'" width="50" height="50" /></a></div></div></div>';
                }

                $("#content_history").append(html);
                $("#content_history").children(":last").get(0).scrollIntoView(false);

            }
        }).fail(function (e) {
            console.log(e);
        })

    })



})
