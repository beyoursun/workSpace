; (function(global) {

    var PShare = function() {

        var Version = '0.0.1',
            Bools = {
                checkObjType: function(a) {
                    return Object.prototype.toString.call(a) === '[object Object]';
                },
                checkFunType: function(a) {
                    return "function" == typeof a;
                },
                checkWechat: function() {
                    return "micromessenger" == navigator.userAgent.toLowerCase().match(/MicroMessenger/i) ? !0 : !1;
                },
                checkIsInclude: function(name) {
                    var js = /js$/i.test(name);
                    var resource = document.getElementsByTagName(js ? 'script' : 'shareLink');
                    var length = resource.length;
                    for (var index = 0; index < length; index++) {
                        if (resource[index][js ? 'src' : 'href'].indexOf(name) != -1)
                            return true;
                    }
                    return false;
                }
            },
            wechatData = {},
            Getters = {
                http: function(uri, method, data, headers, success, error) {
                    var xhr = new XMLHttpRequest();
                    xhr.open(method, uri, true);
                    if (headers) {
                        for (var p in headers) {
                            xhr.setRequestHeader(p, headers[p]);
                        }
                    }
                    xhr.addEventListener('readystatechange', function(e) {
                        if (xhr.readyState === 4) {
                            if (String(xhr.status).match(/^2\d\d$/)) {
                                success(xhr.responseText);
                            } else {
                                error(xhr);
                            }
                        }
                    });
                    xhr.send(data);
                },

                get: function(uri, data, success, error) {
                    this.http(uri, 'GET', data, null, success, error);
                },

                post: function(uri, data, success, error) {
                    if (typeof data === 'object' && !(data instanceof String || (FormData && data instanceof FormData))) {
                        var params = [];
                        for (var p in data) {
                            if (data[p] instanceof Array) {
                                for (var i = 0; i < data[p].length; i++) {
                                    params.push(encodeURIComponent(p) + '[]=' + encodeURIComponent(data[p][i]));
                                }
                            } else {
                                params.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
                            }
                        }
                        data = params.join('&');
                    }

                    this.http(uri, 'POST', data || null, {
                        "Content-type": "application/x-www-form-urlencoded"
                    }, success, error);
                },

                jsLoader: function(src, load, error) {
                    var script = document.createElement('script');
                    script.src = src;
                    script.addEventListener('load', load);
                    script.addEventListener('error', error);
                    (document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(script);
                },

                setShareInfo: function(assigns) {

                    var _self = this;

                    if (!Bools.checkWechat() && Bools.checkObjType(assigns)) {

                        console.log('in wechat');
                        wechatData.shareshareTitle = assigns.shareshareTitle;
                        wechatData.shareshareDesc = assigns.shareshareDesc;
                        wechatData.shareshareImgUrl = assigns.shareshareImgUrl;
                        wechatData.shareshareLink = assigns.shareshareLink;

                        if (!Bools.checkIsInclude('jweixin-1.0.0.js')) {
                            _self.jsLoader('https://res.wx.qq.com/open/js/jweixin-1.0.0.js', function() {

                                var url = window.location.href.split('#')[0];
                                var testUrl = 'https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js';
                                var uri = window.location.origin + '/icp/mobile_single_insurance/wechatShare.do';

                                // TODO
                                // 调用 .do 需要使用后post方法
                                _self.get(testUrl, {
                                    url: url
                                }, function(data) {
                                    // data = typeof data === 'object' ? data : JSON.parse(data);
                                    if (data) {
                                        wechatData.appId = data.appId;
                                        wechatData.timestamp = data.timestamp;
                                        wechatData.nonceStr = data.noncestr;
                                        wechatData.signature = data.signature;
                                    }
                                    _self.configWxShare();

                                }, function(e) {
                                    throw new Error(e);
                                })
                            }, function(e) {
                                throw new Error(e);
                            })
                        } else {
                            _self.configWxShare();
                        }
                    } else {
                        console.log('no wechat')
                    }
                },

                configWxShare: function() {

                    // 配置微信分享
                    console.log('configWxShare');

                    wx.config({
                        debug: false,
                        appId: wechatData.appId, // 必填，公众号的唯一标识
                        timestamp: wechatData.timestamp, // 必填，生成签名的时间戳
                        nonceStr: wechatData.conststr, // 必填，生成签名的随机串
                        signature: wechatData.signature, // 必填，签名
                        jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ']
                    });
                    wx.ready(function() {
                        wx.checkJsApi({
                            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ'],
                            fail: function(res) {
                                console.log("微信版本过低，请升级到新版本！");
                            }
                        });

                        wx.onMenuShareTimeline({
                            shareTitle: wechatData.shareDesc,
                            shareLink: wechatData.shareLink,
                            shareImgUrl: wechatData.shareImgUrl,
                            success: function(res) {
                                console.log("分享到朋友圈成功！");
                            },
                            fail: function(res) {
                                console.log("分享到朋友圈失败！");
                            }
                        });

                        wx.onMenuShareAppMessage({
                            shareTitle: wechatData.shareTitle,
                            shareDesc: wechatData.shareDesc,
                            shareLink: wechatData.shareLink,
                            shareImgUrl: wechatData.shareImgUrl,
                            success: function(res) {
                                console.log("分享到微信好友成功！");
                            },
                            fail: function(res) {
                                console.log("分享到微信好友失败！");
                            }
                        });

                        wx.onMenuShareQQ({
                            shareTitle: wechatData.shareTitle,
                            shareDesc: wechatData.shareDesc,
                            shareLink: wechatData.shareLink,
                            shareImgUrl: wechatData.shareImgUrl,
                            success: function(res) {
                                console.log("分享到QQ好友成功！");
                            },
                            fail: function(res) {
                                console.log("分享到QQ好友失败！");
                            }
                        });
                    });

                }
            },

            Engine = {
                initWXShare: function() {
                    console.log('init');
                },

                startRun: function(assign) {
                    Getters.setShareInfo(assign);
                }
            };

        return {
            ready: function() {
                console.log('ready');
            },

            init: function(assign) {
                Engine.startRun(assign);
            }
        }
    }();

    PShare.ready();
    global.iShare = function(Config) {
        PShare.init(Config);
    }
})(this)

// <script src="MyShare.js"></script>
// <script>
// 	iShare({
// 	 shareshareTitle:'分享标题', //
// 	 shareshareDesc:'分享详情', //
// 	 shareshareImgUrl:'https://xxx', //产品首页的图片链接，取绝对路径
// 	 shareshareLink:'', //取首页URL
// 	})
// </script>
