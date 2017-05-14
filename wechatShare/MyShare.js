"use strict";
(function(root) {

    // Store setTimeout reference so promise-polyfill will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    var setTimeoutFunc = setTimeout;

    function noop() {}

    // Polyfill for Function.prototype.bind
    function bind(fn, thisArg) {
        return function() {
            fn.apply(thisArg, arguments);
        };
    }

    function Promise(fn) {
        if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
        if (typeof fn !== 'function') throw new TypeError('not a function');
        this._state = 0;
        this._handled = false;
        this._value = undefined;
        this._deferreds = [];

        doResolve(fn, this);
    }

    function handle(self, deferred) {
        while (self._state === 3) {
            self = self._value;
        }
        if (self._state === 0) {
            self._deferreds.push(deferred);
            return;
        }
        self._handled = true;
        Promise._immediateFn(function() {
            var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
            if (cb === null) {
                (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                return;
            }
            var ret;
            try {
                ret = cb(self._value);
            } catch (e) {
                reject(deferred.promise, e);
                return;
            }
            resolve(deferred.promise, ret);
        });
    }

    function resolve(self, newValue) {
        try {
            // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
            if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
            if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                var then = newValue.then;
                if (newValue instanceof Promise) {
                    self._state = 3;
                    self._value = newValue;
                    finale(self);
                    return;
                } else if (typeof then === 'function') {
                    doResolve(bind(then, newValue), self);
                    return;
                }
            }
            self._state = 1;
            self._value = newValue;
            finale(self);
        } catch (e) {
            reject(self, e);
        }
    }

    function reject(self, newValue) {
        self._state = 2;
        self._value = newValue;
        finale(self);
    }

    function finale(self) {
        if (self._state === 2 && self._deferreds.length === 0) {
            Promise._immediateFn(function() {
                if (!self._handled) {
                    Promise._unhandledRejectionFn(self._value);
                }
            });
        }

        for (var i = 0, len = self._deferreds.length; i < len; i++) {
            handle(self, self._deferreds[i]);
        }
        self._deferreds = null;
    }

    function Handler(onFulfilled, onRejected, promise) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.promise = promise;
    }

    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     */
    function doResolve(fn, self) {
        var done = false;
        try {
            fn(function(value) {
                if (done) return;
                done = true;
                resolve(self, value);
            }, function(reason) {
                if (done) return;
                done = true;
                reject(self, reason);
            });
        } catch (ex) {
            if (done) return;
            done = true;
            reject(self, ex);
        }
    }

    Promise.prototype['catch'] = function(onRejected) {
        return this.then(null, onRejected);
    };

    Promise.prototype.then = function(onFulfilled, onRejected) {
        var prom = new(this.constructor)(noop);

        handle(this, new Handler(onFulfilled, onRejected, prom));
        return prom;
    };

    Promise.all = function(arr) {
        var args = Array.prototype.slice.call(arr);

        return new Promise(function(resolve, reject) {
            if (args.length === 0) return resolve([]);
            var remaining = args.length;

            function res(i, val) {
                try {
                    if (val && (typeof val === 'object' || typeof val === 'function')) {
                        var then = val.then;
                        if (typeof then === 'function') {
                            then.call(val, function(val) {
                                res(i, val);
                            }, reject);
                            return;
                        }
                    }
                    args[i] = val;
                    if (--remaining === 0) {
                        resolve(args);
                    }
                } catch (ex) {
                    reject(ex);
                }
            }

            for (var i = 0; i < args.length; i++) {
                res(i, args[i]);
            }
        });
    };

    Promise.resolve = function(value) {
        if (value && typeof value === 'object' && value.constructor === Promise) {
            return value;
        }

        return new Promise(function(resolve) {
            resolve(value);
        });
    };

    Promise.reject = function(value) {
        return new Promise(function(resolve, reject) {
            reject(value);
        });
    };

    Promise.race = function(values) {
        return new Promise(function(resolve, reject) {
            for (var i = 0, len = values.length; i < len; i++) {
                values[i].then(resolve, reject);
            }
        });
    };

    // Use polyfill for setImmediate for performance gains
    Promise._immediateFn = (typeof setImmediate === 'function' && function(fn) { setImmediate(fn); }) ||
        function(fn) {
            setTimeoutFunc(fn, 0);
        };

    Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
        if (typeof console !== 'undefined' && console) {
            console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
        }
    };

    /**
     * Set the immediate function to execute callbacks
     * @param fn {function} Function to execute
     * @deprecated
     */
    Promise._setImmediateFn = function _setImmediateFn(fn) {
        Promise._immediateFn = fn;
    };

    /**
     * Change the function to execute on unhandled rejection
     * @param {function} fn Function to execute on unhandled rejection
     * @deprecated
     */
    Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
        Promise._unhandledRejectionFn = fn;
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Promise;
    } else if (!root.Promise) {
        root.Promise = Promise;
    }

})(this);


// polyfill for Promise
if (!window.Promise) {
    window.Promise = Promise;
}


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
            http: function(uri, method, data, headers) {
                return new Promise(function(resolve, reject) {
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
                                resolve(xhr.responseText);
                            } else {
                                reject(xhr);
                            }
                        }
                    });
                    xhr.send(data);
                });
            },

            get: function(uri) {
                return this.http(uri, 'GET', null);
            },

            post: function(uri, data) {
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

                return this.http(uri, 'POST', data || null, {
                    "Content-type": "application/x-www-form-urlencoded"
                });
            },

            jsLoader: function(src) {
                return new Promise(function(resolve, reject) {
                    var script = document.createElement('script');
                    script.src = src;
                    script.addEventListener('load', resolve);
                    script.addEventListener('error', reject);
                    (document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(script);
                })
            },

            setShareInfo: function(assigns) {

                var _self = this;

                if (Bools.checkWechat() && Bools.checkObjType(assigns)) {

                    wechatData.shareshareTitle = assigns.shareshareTitle;
                    wechatData.shareshareDesc = assigns.shareshareDesc;
                    wechatData.shareshareImgUrl = assigns.shareshareImgUrl;
                    wechatData.shareshareLink = assigns.shareshareLink;

                    if (!Bools.checkIsInclude('jweixin-1.0.0.js')) {
                        _self.jsLoader('https://res.wx.qq.com/open/js/jweixin-1.0.0.js').then(function() {

                            var url = window.location.href.split('#')[0];
                            var testUrl = 'https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js';
                            var uri = window.location.origin + '/icp/mobile_single_insurance/wechatShare.do';

                            // TODO
                            // 调用 .do 需要使用后post方法
                            _self.get(testUrl, {
                                url: url
                            }).then(function(data) {
                                console.log(typeof data);
                                // data = typeof data === 'object' ? data : JSON.parse(data);
                                if (data) {
                                    wechatData.appId = data.appId;
                                    wechatData.timestamp = data.timestamp;
                                    wechatData.nonceStr = data.noncestr;
                                    wechatData.signature = data.signature;

                                }
                                _self.configWxShare();

                            }).catch(function(e) {
                                throw e;
                            })
                        }).catch(function(e) {
                            throw e;
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

                console.log(wx);
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
                console.log('ss');
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
var iShare = function(Config) {
    PShare.init(Config);
}





// <script src="MyShare.js"></script>
// <script>
// 	iShare({
// 	 shareshareTitle:'分享标题', //
// 	 shareshareDesc:'分享详情', //
// 	 shareshareImgUrl:'https://xxx', //产品首页的图片链接，取绝对路径
// 	 shareshareLink:'', //取首页URL
// 	})
// </script>
