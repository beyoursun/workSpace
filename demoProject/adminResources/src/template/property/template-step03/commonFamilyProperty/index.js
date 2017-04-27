(function () {
  var g = JSON.parse(sessionStorage.getItem("submit"));
  var a = parseInt(g.insuredMaxAge),
    f = parseInt(g.insuredMiniAge),
    h = g.insuredLimitedSex,
    b = g.planName;
  var e = JSON.parse(sessionStorage.getItem("applicantInfo"));
  var c = {
    getBirthdayAndSex: function (i) {
      var j = new Object();
      var l, n, k, m;
      if (i.length == 15) {
        l = i.substring(6, 8);
        n = i.substring(8, 10);
        k = i.substring(10, 12);
        j.cBirthday = "19" + l + "-" + n + "-" + k;
        m = i.substring(13, 14)
      } else {
        if (i.length == 18) {
          l = i.substring(6, 10);
          n = i.substring(10, 12);
          k = i.substring(12, 14);
          j.cBirthday = l + "-" + n + "-" + k;
          m = i.substring(16, 17)
        }
      }
      if (m % 2 == 1) {
        j.cSex = "M"
      } else {
        j.cSex = "F"
      }
      return j
    }
  };
  var d = {
    initInsurant: function (mtype) {
      return '<div class="shade-sec" id="shadeSec"><div class="insurant-sec"><p class="label-title insurant-title vPopWin-title">'+mtype+'被保险人信息</p><div class="label-collections" id="insurantDatas"><div class="label-item"><div class="label insurant-label-text"><p>家庭关系</p></div><div class="label insurant-input triangle"><select id="relationshipWithInsured" class="insurant-label-select"><option value="01">本人</option><option value="02">父母</option><option value="03">子女</option><option value="04">配偶</option><option value="05">其他</option></select></div></div><div class="label-item"><div class="label insurant-label-text"><p class="label-space">姓名</p></div><div class="label insurant-input"><input type="text" placeholder="必填" id="insurantName"></div></div><div id="insurant-man-id-datas"><div class="label-item"><div class="label insurant-label-text"><p>证件类型</p></div><div class="label insurant-input triangle"><select id="insurantCertType" class="insurant-label-select"><option value="01">身份证</option><option value="02">护照</option><option value="03">军官证</option><option value="04">驾驶证</option><option value="05">港澳回乡证或台胞证</option><option value="06">其他</option></select></div></div><div class="label-item"><div class="label insurant-label-text"><p>证件号码</p></div><div class="label insurant-input"><input type="text" placeholder="必填" id="insurantCertNo"></div></div><div class="label-item" style="display:none" id="birthData"><div class="label insurant-label-text"><p>出生日期</p></div><div class="label insurant-input"><input class="" type="text" id="insurantCertBirthday" placeholder="请点击选择出生日期"></div></div><div class="label-item" style="display:none" id="sexData"><div class="label insurant-label-text"><p class="label-space">性别</p></div><p class="label sexbox insurant-input"><label for="insurant-boy" class="label sexBox"><span class="sexText">男</span><input type="radio" name="sex" value="M" id="insurant-boy"></label><label for="insurant-girl" class="label sexBox"><span class="sexText">女</span><input type="radio" name="sex" value="F" id="insurant-girl"></label></p></div></div><div id="error" class="errorText" align="center"></div><div class="insurant-btn"><input type="button" class="cancel submitBut" id="insurantCancel" value="取消"><input type="button" class="confirm submitBut" id="insurantConfirm" value="确定"></div></div></div></div>'
    },
    initstruc: function () {
      $("#insurantCertType").on("change", function () {
        $("#error").text("");
        if ($("#insurantCertType").val() == "01") {
          $("#birthData").hide();
          $("#sexData").hide()
        } else {
          $("#birthData").show();
          $("#sexData").show();
          $("#insurant-boy").prop("checked", "true")
        }
        $("#insurantCertNo").val("")
      })
    },
    initDateTime: function () {
      $("#insurantCertBirthday").datetimePicker({
        title: "出生日期",
        min: "1900-01-01",
        max: "2020-01-01",
        yearSplit: "-",
        monthSplit: "-",
        datetimeSplit: " ",
        times: function () {
          return []
        },
        onChange: function (j, i, k) {}
      })
    },
    init: function () {
      $(".title").text(b);
      $(".loading").hide();
      var i = JSON.parse(sessionStorage.getItem("insurantInfo"));
      var dz = JSON.parse(sessionStorage.getItem("addressMsg"));
      var j = "",
        k = g.discount ? g.discount : "" ;
      if (g) {
        if (k == "") {
          j = g.amount
        } else {
          j = g.discountAmount
        }
      }
      $("#show-amount").text(j);
      if (i) {
        $("#show-name").text(i.insurantName);
        $("#detailAddress").val(i.detailAddress);
      } else {
        $("#show-name").text(e.applicantName);
        if(dz){
        	$("#detailAddress").val(dz.detailAddress);
        };
      }
      d.queryProvinceList()
    },
    renderApplicant: function (i) {
      $("#insurantName").val(i.applicantName);
      $("#insurantCertType").val(i.applicantCertType);
      $("#insurantCertNo").val(i.applicantCertNo);
      if (i.applicantCertType == "01") {
        $("#birthData").hide();
        $("#sexData").hide()
      } else {
        $("#birthData").show();
        $("#insurantCertBirthday").val(i.applicantBirthday);
        $("#sexData").show();
        $("#insurant-boy").val() == i.applicantGender ? $("#insurant-boy").prop("checked", "true") : $("#insurant-girl").prop("checked", "true")
      }
      d.initstruc();
      d.initDateTime()
    },
    renderInsurant: function (i) {
      $("#relationshipWithInsured").val(i.relationshipWithInsured);
      $("#insurantName").val(i.insurantName);
      $("#insurantCertType").val(i.insurantCertType);
      $("#insurantCertNo").val(i.insurantCertNo);
      if (i.insurantCertType == "01") {
        $("#birthData").hide();
        $("#sexData").hide()
      } else {
        $("#birthData").show();
        $("#insurantCertBirthday").val(i.insurantCertBirthday);
        $("#sexData").show();
        $("#insurant-boy").val() == i.insurantCertSex ? $("#insurant-boy").prop("checked", "true") : $("#insurant-girl").prop("checked", "true")
      }
      d.initstruc();
      d.initDateTime()
    },
    checkData: function () {
      $("#error").text("");
      if ($("#insurantName").val() == "") {
        $("#error").text("被保人姓名不能为空！");
        return false
      }
      if ($("#insurantName").val() != "") {
        if (!validate.checkName($("#insurantName").val(), $("#error"))) {
          return false
        }
      }
      if ($("#insurantCertNo").val() == "") {
        $("#error").text("被保人证件号码不能为空！");
        return false
      }
      if ($("#insurantCertType").val() == "01" && $("#insurantCertNo").val() != "") {
        if (!validate.checkCertNo($("#insurantCertNo").val(), $("#error"))) {
          return false
        }
        if (!validate.checkSexLimit(validate.getSex($("#insurantCertNo").val()), h, $("#error"), "2")) {
          return false
        }
        if (!validate.checkCertNoAge($("#insurantCertNo").val(), "2", f, a, $("#error"))) {
          return false
        }
      }
      if ($("#insurantCertType").val() != "01" && $("#insurantCertBirthday").val() == "") {
        $("#error").text("出生日期不应为空！");
        return false
      }
      if ($("#insurantCertType").val() != "01" && $("#insurantCertBirthday").val() != "") {
        if (!validate.checkOtherTypeAge($("#insurantCertBirthday").val(), "2", f, a, $("#error"))) {
          return false
        }
      }
      if ($("#insurantCertType").val() != "01") {
        var i = $("#insurant-boy").is(":checked") ? "M" : "F";
        if (!validate.checkSexLimit(i, h, $("#error"), "2")) {
          return false
        }
      }
      return true
    },
    checkApplicantData: function (j) {
      $("#errorMain").text("");
      if (j.insurantName == "") {
        $("#errorMain").text("被保人姓名不能为空！");
        return false
      }
      if (j.insurantName != "") {
        if (!validate.checkName(j.insurantName, $("#errorMain"))) {
          return false
        }
      }
      if (j.insurantCertNo == "") {
        $("#errorMain").text("被保人证件号码不能为空！");
        return false
      }
      if (j.insurantCertType == "01" && j.insurantCertNo != "") {
        if (!validate.checkCertNo(j.insurantCertNo, $("#errorMain"))) {
          return false
        }
        if (!validate.checkSexLimit(validate.getSex(j.insurantCertNo), h, $("#errorMain"), "2")) {
          return false
        }
        if (!validate.checkCertNoAge(j.insurantCertNo, "2", f, a, $("#errorMain"))) {
          return false
        }
      }
      if (j.insurantCertType != "01" && j.insurantCertBirthday == "") {
        $("#errorMain").text("出生日期不应为空！");
        return false
      }
      if (j.insurantCertType != "01" && j.insurantCertBirthday != "") {
        if (!validate.checkOtherTypeAge(j.insurantCertBirthday, "2", f, a, $("#errorMain"))) {
          return false
        }
      }
      if (j.insurantCertType != "01") {
        var i = j.insurantCertSex;
        if (!validate.checkSexLimit(i, h, $("#errorMain"), "2")) {
          return false
        }
      }
      return true
    },
    //提交表单前数据监测
    checkDatasBeforeSend:function(){
    	//监测是否有被保人信息
    	var pd=JSON.parse(sessionStorage.getItem('productData')),
    	  ifInsurantNull=$(".show-insurant").length<1,
    		ifProvinceNull=$("#province").val()=="00",
    		ifCityNull=$("#city").val()=="00",
    		ifDetailAddressNull=($("#detailAddress").val()).replace(/\s/g,"")=="",
    		mediaSourceLimit="PACZ_CBPS",
    		mediaSourceChk=pd.accountInfo.mediaSource==mediaSourceLimit,
    		notAllowCity=330200;
    	if(ifInsurantNull){
    		$("#errorMain").text("被保人信息不能为空，请修改！");
    		return false;
    	};
    	if(ifProvinceNull){
    		$("#errorMain").text("请选择省份信息");
    		return false;
    	};
    	if(ifCityNull){
    		$("#errorMain").text("请选择城市信息");
    		return false;
    	}else if(mediaSourceChk && $("#city").val()==notAllowCity){
    		$("#errorMain").text("抱歉，暂不支持此地区投保");
    		return false;
    	};
    	if(ifDetailAddressNull){
    		$("#errorMain").text("请输入详细地址信息");
    		return false;
    	};
    	$("#errorMain").text("");
    	return true;
    },
    saveInsurantInfoToSessionStorage: function () {
      var i = {},dz = {};
      i.relationshipWithInsured = $("#relationshipWithInsured").val();
      i.insurantName = $("#insurantName").val();
      i.insurantCertType = $("#insurantCertType").val();
      i.insurantCertNo = $("#insurantCertNo").val();
      if ($("#insurantCertType").val() == "01") {
        var j = c.getBirthdayAndSex($("#insurantCertNo").val());
        i.insurantCertBirthday = j.cBirthday;
        i.insurantCertSex = j.cSex
      } else {
        i.insurantCertBirthday = $("#insurantCertBirthday").val();
        i.insurantCertSex = $("#insurant-boy").is(":checked") ? "M" : "F"
      }
      i.province = $("#province").val()+":"+$('#province option[value="'+$("#province").val()+'"]').text();
      i.city = $('#city option[value="'+$("#city").val()+'"]').text();
      i.detailAddress = $("#detailAddress").val();
      sessionStorage.setItem("insurantInfo", JSON.stringify(i));
      dz.provinceCode = $("#province").val();
      dz.cityCode = $("#city").val();
      dz.detailAddress = $("#detailAddress").val();
      sessionStorage.setItem("addressMsg", JSON.stringify(dz));
      console.warn("insured数据已缓存")
    },
    cloneApplicantInfo: function (j) {
      var i = {},dz = {};
      i.relationshipWithInsured = "01";
      i.insurantName = j.applicantName;
      i.insurantCertType = j.applicantCertType;
      i.insurantCertNo = j.applicantCertNo;
      i.insurantCertBirthday = j.applicantBirthday;
      i.insurantCertSex = j.applicantGender;
 	  i.province = $("#province").val()+":"+$('#province option[value="'+$("#province").val()+'"]').text();
      i.city = $('#city option[value="'+$("#city").val()+'"]').text();
      i.detailAddress = $("#detailAddress").val();
      dz.provinceCode = $("#province").val();
      dz.cityCode = $("#city").val();
      dz.detailAddress = $("#detailAddress").val();
      sessionStorage.setItem("addressMsg", JSON.stringify(dz));
      console.warn("applicant数据已缓存")
      return i
    },
    sendForm: function () {
      var j = JSON.parse(sessionStorage.getItem("insurantInfo"));
      if (!j) {
        j = d.cloneApplicantInfo(e);
        if (!d.checkApplicantData(j)) {
          return
        }
      }
      var m = $.extend({}, g, e, j);
      var l = [];
      for (var k in m) {
        if (typeof (m[k]) == "object") {
          continue
        }
        l.push('<input type="hidden" name="' + k + '" value="' + m[k] + '">')
      }
      inutArr = l.join("");
      $("#sendForm").append(l);
      $("#sendForm").attr({
        action: "/icp/mobile_single_insurance/newConfirmInsurance.do",
        method: "post",
        target: "_self"
      });
      $("#sendForm").submit()
    },
    announcement: function (j) {
      var l, i, m, n, o, k, p, planCode, protocal;
      switch (j) {
        case 1:
          l = "保险条款";
          i = "";
          m = "#sytk";
          o = document.createElement("iframe");
          //        p = "https://test-iicp-dmzstg.pingan.com.cn/icp_core_dmz/web/55062.html";
          planCode = g.planCode;
          protocal = window.location.href.indexOf('https') === 0 ? 'https' : 'http';
          p = protocal + '://' + window.location.host + '/icp_core_dmz/web/' + planCode + '.html';
          o.setAttribute("id", "miuisProvision");
          document.body.appendChild(o);
          $("#miuisProvision").attr("src", p);
          break;
        case 2:
          l = "投保人声明";
//        i = g.insuranceClause;
          i = g.policyHolderDeclare;
          m = "#tbsm";
          break
      }
      $("header #contaitentTitle").html(l);
      $("#cui_tbsm_container").html(i);
      window.history.pushState({
        title: m
      }, m, window.location.href + m);
      window.onpopstate = function (q) {
        j === 1 && document.body.removeChild(document.getElementById("miuisProvision"));
        $("#sytkInfo").hide();
        $("#mainInfo").show()
      };
      $("#sytkInfo").show();
      $("#mainInfo").hide()
    },
    queryProvinceList: function () {
      $("#province").empty();
      //  var i = "template/property/template-step03/commonFamilyProperty/queryProvincesAndCities.json";
      //	icp/mobile_single_insurance/queryProvincesAndCities.do
      var i = "../../mobile_single_insurance/queryProvincesAndCities.do";
      $.ajax({
        type: "get",
        dataType: "json",
        url: i,
        data: {
          method: "getProvinceList"
        },
        success: function (k) {
          var n = k.mesgCode;
          if (n == "0000") {
            var l = k.provinceList;
            console.warn(l);
            for (var m = 0; m < l.length; m++) {
              var o = $('<option value="' + l[m].provinceCode + '" >' + l[m].provinceName + "</option>");
              $("#province").append(o)
            }
            var dz = JSON.parse(sessionStorage.getItem("addressMsg"));
            if (dz) {
              $("#province").val(dz.provinceCode);
              d.queryCityList(dz.provinceCode)
            } else {
              d.queryCityList(l[0].provinceCode)
            }
          } else {
            alert(k.resultMsg)
          }
        }
      })
    },
    queryCityList: function (i) {
      $("#city").empty();
      var j = "../../mobile_single_insurance/queryProvincesAndCities.do";
      $.ajax({
        type: "get",
        dataType: "json",
        url: j,
        data: {
          method: "getCityList",
          provinceCode: i
        },
        success: function (l) {
          if (l.mesgCode == "0000") {
            //          var m = l.cityList[i];
            var m = l.cityList;
            console.info(m);
            for (var n = 0; n < m.length; n++) {
              var o = $('<option value="' + m[n].cityCode + '" >' + m[n].cityChineseName + "</option>");
              $("#city").append(o)
            }
            var dz = JSON.parse(sessionStorage.getItem("addressMsg"));
            if (dz && dz.cityCode != "") {
              $("#city").val(dz.cityCode)
            }
          } else {
            alert(l.resultMsg)
          }
        }
      })
    }
  };
  d.init();
  $("#modify-info").on("click", function () {
    var j = d.initInsurant("修改");
    $("body").append(j);
    var i = JSON.parse(sessionStorage.getItem("insurantInfo"));
    if (i) {
      d.renderInsurant(i)
    } else {
      d.renderApplicant(e)
    }
  });
  $(document).on("click", "#insurantCancel", function () {
    $("#shadeSec").remove()
  });
  $(document).on("click", "#insurantConfirm", function () {
    if (!d.checkData()) {
      return
    }
    d.saveInsurantInfoToSessionStorage();
    $("#shadeSec").remove();
    $("#errorMain").text("");
    d.init()
  });
  $("#isAgree").on("click", function () {
    var i = $("#gotopay").hasClass("btn-buy-disabled");
    if ($("#isAgree").prop("checked")) {
      i && $("#gotopay").removeClass("btn-buy-disabled")
    } else {
      i || $("#gotopay").addClass("btn-buy-disabled")
    }
  });
  $("#clause").on("click", function () {
    d.announcement(1)
  });
  $("#statement").on("click", function () {
    d.announcement(2)
  });
  $("#gotopay").on("click", function () {
    if ($("#isAgree").prop("checked") && d.checkDatasBeforeSend()) {
//    d.saveInsurantInfoToSessionStorage();
      d.sendForm()
    }
  });
  $("#insurant-back").on("click", function () {
    sessionStorage.removeItem("insurantInfo");
    sessionStorage.removeItem("addressMsg");
    $("#detailAddress").empty();
  });
  $("#province").on("change", function () {
    var i = JSON.parse(sessionStorage.getItem("insurantInfo"));
    var dz = JSON.parse(sessionStorage.getItem("addressMsg"));
    if (i) {
      i.city = "";
      sessionStorage.setItem("insurantInfo", JSON.stringify(i));
    }
    if (dz) {
      dz.cityCode = "";
      sessionStorage.setItem("addressMsg", JSON.stringify(dz));
    }
    var j = $(this).val();
    d.queryCityList(j)
  })
})();