(function(){
	var $type = $("#applicantCertType"),
	    $input = $("#numInput"),
	    $name = $("#linkManName"),
	    $typeNo = $("#for-paperNo1"),
	    $mobile = $("#linkManMobileTelephone"),
	    $email = $("#applicantEmail"),
	    $err = $("#err");
	    var urlP = JSON.parse(window.sessionStorage.getItem('urlParameters'));
	    var submit = JSON.parse(window.sessionStorage.getItem('submit'));
	    var productData = JSON.parse(window.sessionStorage.getItem('productData')),
	    minage = productData.planInfoList[0].localProMap.applicantMiniAge,
	    maxage = productData.planInfoList[0].localProMap.applicantMaxAge,
	    limitsex = productData.planInfoList[0].localProMap.applicantLimitedSex;
	    applicantStatement = productData.planInfoList[0].localProMap.applicantStatement,
	    planCode = productData.planInfoList[0].localProMap.planCode,
	    activityStartTime = productData.planInfoList[0].localProMap.activityStartTime || 0,
	    activityEndTime = productData.planInfoList[0].localProMap.activityEndTime || 0;
	var ApplicantInfo = {
		init : function(){
			ErrWarn.creat();
			this.render();
			$("#amount").text(submit.amount);
			this.readRule();
			this.selectType();
			this.initDateTime();
			this.getAjaxData();
			this.pay();
		},
		inputChange:function(){
			$input.on('change',function(){
				if($input.val() == '0'){
					$input.val('1');
				}
			})
		},
		render:function(){
			var info = JSON.parse(window.sessionStorage.getItem('applicantInfo'));
			if(info){
				$("#linkManName").val(info.applicantName);
				if(info.applicantCertType == '01'){
					$("#applicantCertType").val('01');
					$("#birthData").hide();
					$("#sexData").hide();
				}else{
					$("#applicantCertType").val(info.applicantCertType);
					$("#birthData").show();
					$("#sexData").show();
					$("#J-datePicker").val(info.applicantBirthday);
					info.applicantGender == 'M'?$("#boy").attr('checked',true):$("#girl").attr('checked',true);
				};
				$("#for-paperNo1").val(info.applicantCertNo);
				$("#linkManMobileTelephone").val(info.telephone);
				$("#applicantEmail").val(info.applicantEmail);
			};
			if ($("header").css("background-color") != 'rgb(255, 255, 255)') {
				$("#goBackImg").hide();
				$("#goBack").show();
				$("#tkBackImg").hide();
				$("#tkBack").show();
				$(".title").css('color','#fff');
			};
			$('.loading').hide();
		},
		selectType:function(){
			$type.on('change',function(){
				$(".label-select").css('width','76px');
				if($type.val() === '01'){
					$("#birthData").hide();
					$("#sexData").hide();
				}else{
					if($type.val() == '05'){
						$(".label-select").css('width','160px');
					}
					$("#birthData").show();
					$("#sexData").show();
				}
				$typeNo.val('');
			})
		},
		initDateTime:function(){
			$("#J-datePicker").datetimePicker(
				{
					title:"出生日期",
					min:"1900-01-01",
					max:"2100-01-01",
					yearSplit:"-",
					monthSplit:"-",
					datetimeSplit:" ",
					times:function(){return[]},
					onChange:function(i,h,j){}
				}
			)
		},
		getAjaxData:function(){
			var productInfo = {
				productName:'个人银行卡盗失险'
			}
			var productDetail= JSON.parse(window.sessionStorage.getItem('productInfo')) || productInfo;
			if(productDetail){
				$("#productName").text(productDetail.productName);
				$(".loading").hide();
			};
		},
		checkData:function(){
			var _that = this;
			if($name.val() == ''){
				ErrWarn.errShow('投保人姓名不能为空');
				return false;
			};
			if($typeNo.val() == ''){
				ErrWarn.errShow('证件号码不能为空');
				return false;
			};
			if($type.val() == '01' && $typeNo.val() != ''){
				if(!validate.checkCertNo($typeNo.val(),$err.find('p'))){
					ErrWarn.errShow('身份证格式不正确');
					return false;
				};
				if(!validate.checkCertNoAge($typeNo.val(),'1',minage,maxage,$err.find('p'))){
					ErrWarn.errShow('投保人必须在'+minage+'到'+maxage+'周岁之间');
					return false;
				};
				if(!validate.checkSexLimit(validate.getSex($typeNo.val()),limitsex,$err.find('p'),'1')){
					ErrWarn.errShow('投保人性别必须是'+limitsex);
					return false;
				}
			};
			if($type.val() != '01' && $typeNo.val() != ''){
				if($("#J-datePicker").val() == ''){
					ErrWarn.errShow('请选择出生日期');
					return false;
				};
				if(!validate.checkOtherTypeAge($("#J-datePicker").val(),'1',minage,maxage,$err.find('p'))){
					ErrWarn.errShow('投保人必须在'+minage+'到'+maxage+'周岁之间');
					return false;
				};
				if(!validate.checkSexLimit($("#boy").is(":checked")?"M":"F",limitsex,$err.find('p'),'1')){
					ErrWarn.errShow('投保人性别必须是'+limitsex);
					return false;
				}
			};
			if($mobile.val() == ''){
				ErrWarn.errShow('手机号码不能为空');
				return false;
			};
			if(!validate.checkMobile($mobile.val(),$err.find('p'))){
				ErrWarn.errShow('手机号码格式不正确');
				return false;
			};
			if($email.val() == ''){
				ErrWarn.errShow('邮箱不能为空');
				return false;
			}
			if(!validate.checkEmail($email.val(),$err.find('p'))){
				ErrWarn.errShow('邮箱格式不正确');
				return false;
			}
			if(!$("#checkbox_send").is(':checked')){
				ErrWarn.errShow('请勾选并阅读声明和条款');
				return false;
			}
			return true;
		},
		pay:function(){
			var _that = this;
			$("#pay").on('click',function(){
				if(!_that.checkData()){
					console.log('验证不通过');
				}else{
					$("#pay p").text('正在支付...');
					$(".loading").show();
					var payData = $.extend({},submit,_that.getApplicantInfo());
					var url = '/icp/mobile_single_insurance/newGenProConfirmInsurance.do'
					$.ajax({
						url: url,
			            type: 'post',
			            data: payData,
			            success: function(res) {
			                res = typeof res === 'object' ? res : JSON.parse(res);
			                if (res.code === '00') {
			                	var ciph = urlP.ciph || '',
			                	flag = urlP.flag || '',
			                	agentNo=urlP.agentNo || '',
			                	keyCode = urlP.keyCode || '',
			                	styleUrl = productData.color || '',
			                	activityTime = activityStartTime + '|' + activityEndTime;
			                	var remark = agentNo +'|'+ flag +'|'+ ciph +'|'+ keyCode + '|' + styleUrl + '|' + activityTime;
			                    window.location.href = res.payUrl+'&remark='+remark;
			                } else {
			                    alert(res.msg);
			                    $("#pay p").text('支付');
			                };
			                $(".loading").hide();
			            },
			            error: function() {
			               alert('网络出错，请刷新页面');
			               $("#pay p").text('支付');
			               $(".loading").hide();
			            }
					})
				}
			})
		},
		getApplicantInfo:function(){
			var applicantInfo = {},birth,sex,arr,applicantCertNo;
			if($("#applicantCertType").val() == '01'){
				applicantCertNo = $("#for-paperNo1").val().replace(/[X|x]/,'*');
				arr = validate.getSFZBirthDay($("#for-paperNo1").val());
				birth = arr[1];sex = arr[0];
			}else{
				birth = $("#J-datePicker").val();
				sex = $("#boy").is(":checked")?'M':'F';
				applicantCertNo = $("#for-paperNo1").val();
			};
			applicantInfo.applicantName = $("#linkManName").val();
			applicantInfo.applicantCertType = $("#applicantCertType").val();
			applicantInfo.applicantCertNo = applicantCertNo;
			applicantInfo.applicantBirthday = birth;
			applicantInfo.applicantGender = sex;
			applicantInfo.telephone = $("#linkManMobileTelephone").val();
			applicantInfo.applicantEmail = $("#applicantEmail").val();
			applicantInfo.secondMediaSource = urlP.agentNo||urlP.userId;
			applicantInfo.keyCode = urlP.keyCode;
			window.sessionStorage.setItem('applicantInfo',JSON.stringify(applicantInfo));
			return applicantInfo;
		},
		announcement: function (id) {
	      var g, d,h, i, j, f, k,protocal,c;
	      switch (id) {
	        case 1:
	          	g = "保险条款";
	          	h = "#sytk";
	          	j = document.createElement("iframe");
	          	protocal = window.location.href.indexOf('https') === 0 ? 'https' : 'http';
	         	k = protocal + '://' + window.location.host + '/icp_core_dmz/web/' + planCode + '.html';
	          	j.setAttribute("id", "miuisProvision");
	          	//document.body.appendChild(j);
	          	$("#hideInsuranceClause").append(j);
	          	$("#miuisProvision").attr("src", k);
	          	break;
	        case 2:
	          	g = "投保声明";
	          	h = "#tbsm";
	          	d = applicantStatement;
	          	break;
	      }
	      $("#title").text(g);
	      $("#hideContent").html(d);
	      $(".contaitent").hide();
	      $(".footer").hide();
	      $("#hideInsuranceClause").show();
	      window.history.pushState({title: h}, h, window.location.href + h);
	      window.onpopstate = function (e) {
	      	if(id == 1){
	      	$("#miuisProvision").remove();
	      	};
	        $("#hideInsuranceClause").hide();
	        $(".contaitent").show();
	        $(".footer").show();
	      };
	    },
	    readRule:function(){
	    	var _that = this;
	    	$("#confirm_know_bxtk").on("click", function () {
			    _that.announcement(1)
			 });
			  $("#confirm_know_tbxz").on("click", function () {
			    _that.announcement(2)
			});
	    }
	};
	ApplicantInfo.init();
	
		
	$("body").on('click','.go-back',function(){
		var ciph = urlP.ciph||'',flag = urlP.flag||'';
		window.location.href = './productDetail.html?keyCode='+urlP.keyCode+'&agentNo='+urlP.agentNo+'&ciph='+ciph+'&flag='+flag;
	});
})();
