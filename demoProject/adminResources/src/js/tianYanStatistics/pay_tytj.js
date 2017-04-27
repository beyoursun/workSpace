var pingan_sdk_appid;
var pingan_sdk_vn;
var pingan_sdk_vc;

var insurantTemp = JSON.parse(sessionStorage.getItem('productData'));
if (insurantTemp) {
    if (window.location.origin.indexOf('test') == -1 && window.location.origin.indexOf('localhost') == -1) {
        pingan_sdk_appid = '134D94707C924A2AAC710E6BFBAE4D31';
    } else {
        pingan_sdk_appid = '89F2A227101F471F9865DF00BB979B2C';
    }
    pingan_sdk_vn = 'noCar_1.21.0';
    pingan_sdk_vc = insurantTemp.ACCOUNT || 'noCar_20170426';
    insurantAddScript('https://dn-mailattachments.qbox.me/h5sdk001.js');
};

var insurantTimer = setInterval(function() {
    var temp = JSON.parse(sessionStorage.getItem('productData'));
    if (typeof SKAPP != 'undefined' && $('#gotopay').length > 0 && temp) {
        var _planCode = temp.planInfoList[0].localProMap.planCode,
            _planName = temp.planInfoList[0].localProMap.planName;
        SKAPP.onEvent('nl_pdname0_btn', '产品名称', { pdn: _planName });
        SKAPP.onEvent('nl_insured0_page', '被保人信息填写页', { pdc: _planCode });
        $('#gotopay').click(function() {
            SKAPP.onEvent('nl_pay0_btn', '支付按钮', { pdc: _planCode });
        });
        $('#clause').click(function() {
            SKAPP.onEvent('nl_clause0_btn', '适用条款按钮', { pdc: _planCode });
        });
        $('#statement').click(function() {
            SKAPP.onEvent('nl_note0_btn', '投保人声明按钮', { pdc: _planCode });
        });
        $('.icon-tel').click(function() {
            SKAPP.onEvent('nl_call0_btn', '拨打95511按钮', { pdc: _planCode });
        });
        clearInterval(insurantTimer);
    }
}, 30);

function insurantAddScript(url) {
    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement('script');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', url);
    head.appendChild(js);
}
