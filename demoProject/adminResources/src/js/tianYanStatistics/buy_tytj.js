var pingan_sdk_appid;
var pingan_sdk_vn;
var pingan_sdk_vc;

var productDetailFirstTimer = setInterval(function() {
    var productDetailTemp = JSON.parse(sessionStorage.getItem('productData'));
    if (productDetailTemp) {
        if (window.location.origin.indexOf('test') == -1 && window.location.origin.indexOf('localhost') == -1) {
            pingan_sdk_appid = '134D94707C924A2AAC710E6BFBAE4D31';
        } else {
            pingan_sdk_appid = '89F2A227101F471F9865DF00BB979B2C';
        }
        pingan_sdk_vn = 'noCar_1.21.0';
        pingan_sdk_vc = productDetailTemp.ACCOUNT || 'noCar_20170426';
        productDetailAddScript('https://dn-mailattachments.qbox.me/h5sdk001.js');
        clearInterval(productDetailFirstTimer);
    }
}, 30);

var productDetailSecondTimer = setInterval(function() {
    var temp = JSON.parse(sessionStorage.getItem('productData'));
    if (typeof SKAPP != 'undefined' && $('#J-btn-buy').length > 0 && temp) {
        var _planCode = temp.planInfoList[0].localProMap.planCode,
            _planName = temp.planInfoList[0].localProMap.planName;
        SKAPP.onEvent('nl_pdname0_btn', '产品名称', { pdn: _planName });
        SKAPP.onEvent('nl_select0_page', '套餐选择页', { pdc: _planCode });
        $('#J-btn-buy').click(function() {
            SKAPP.onEvent('nl_buy0_btn', '购买按钮', { pdc: _planCode });
        });
        $('.icon-tel').click(function() {
            SKAPP.onEvent('nl_call0_btn', '拨打95511按钮', { pdc: _planCode });
        });
        clearInterval(productDetailSecondTimer);
    }
}, 30);

function productDetailAddScript(url) {
    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement('script');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', url);
    head.appendChild(js);
}
