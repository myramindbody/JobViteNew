/*
* COPYRIGHT 2011 Jobvite, Inc. All rights reserved. This copyright notice is Copyright Management 
* Information under 17 USC 1202 and is included to protect this work and deter copyright infringement.  
* Removal or alteration of this Copyright Management Information without the express written permission 
* of Jobvite, Inc. is prohibited, and any such unauthorized removal or alteration will be a violation of 
* federal law.
*/
String.prototype.format = function( )
{
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace( pattern, function( capture ){ 
										return args[ capture.match(/\d+/) ]; 
								  }
						);
};

if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    }
}

var JV = JV || {},
	temp = JV.Util ? JV.Util : {};

JV.Util = {
	
	modalElem: $("#jv-modalDialog"),
	analyticsActionList : ["broadcastJob", "sendJobvite"],
	myAjaxRequest: function( args ){
		var url = args.url;					
		if( !url || typeof url != 'string' || typeof args.data == "undefined" ) 
			return;
		var me = this;		
		// Can add more params as required.
		var _callback = function(){};
		
		if(!!args.callback){
			_callback = function( returnArgs ){
				args.callback(returnArgs);
				try{
					returnArgs = eval('('+ returnArgs + ')');
					var _action = args.data.action;
					var _track = false
					for(var i = 0, j=me.analyticsActionList.length; i < j;i++){
						if( me.analyticsActionList[i] == _action){
							_track = true;	
							break;
						}
					}
					if( typeof _gaq != "undefined" && _track == true && !!returnArgs.status && returnArgs.status != "error"){
						_gaq.push([	'_trackSocial', JV.process.Mapping[args.data.platform], _action, document.location.href	]	);
					}				
				}
				catch(e){}
			}
		}
		
		var arguments = {
			beforeSend: args.preAjaxCall ? args.preAjaxCall : function( ){ },			
			success: _callback, // only when call is successful			
			url: args.url,
            contentType: args.contentType ? args.contentType : 'application/x-www-form-urlencoded',
			dataType: args.dataType ? args.dataType : "text",
			timeout: args.timeout ? args.timeout : 15000,
			data: args.data ? args.data : { },
			type: args.type ? args.type : "POST",
			error: args.error? args.error : function(){ },
			data: args.data			
		}
		// cache the ajax call
			if(typeof _gaq != "undefined"){
				try {
					var _actionName = !!arguments.data.action ? arguments.data.action : "";
					_gaq.push(['_trackEvent', JV.PAGE_TYPE, !!_actionName ? _actionName : "unknown", "Tracking"]);
				}catch(e){}
			}
		// returns a reference to the call, in case if it needs to be cancelled.
		return $.ajax( arguments ); 
	},
	
	modalInitialization: function(){
		$.jqm.params.modal = true;
		$('#jv-modalDialog').jqm();	// initialization.
		
		//  TODO: to be called after we finalize the popups
		
		//$('#jv-modalDialog').jqmShow(); // for triggering the dialog.
		// $('#jv-modalDialog').jqmHide();				
	},
	
	
	uiShowConfirmationDialog: function( ){		
		var _ref = JV.process;				
		// start creating and adding the template. 	
		var header = _ref.Template["MODAL_HEADER"].format( _ref.Const["JOBVITE_SENT"] );
		var sections = _ref.Template["MODAL_MESSAGE_SECTION"].format( "", _ref.Const["JOBVITE_SENT_CONFIRMATION"] );
		var content = _ref.Template["MODAL_CONTENTS"].format( sections );				
		var buttons = _ref.Template["MODAL_BUTTON_LIGHT"].format("CLOSE", _ref.Const["CLOSE"]) + _ref.Template["MODAL_BUTTON_DARK"].format("SEND_MORE_JOBVITES", _ref.Const["SEND_MORE_JOBVITES"]);  
		var buttonWrapper = _ref.Template["MODAL_BUTTON_WRAPPER"].format( buttons );
		var modal = header + content + buttonWrapper;
		this.showDialog( modal );
		var me = this;
		$(".jv-modalButtonWrapper span").click(function(){
			me.hideDialog( );
			var key = $(this).attr("KEY") 
			switch( key ){
				case "CLOSE":
					//Added to clear the Email text box after the message is sent to recipient(s). 
					//No check required since field always present in page. 
					$("#jv-emailReceiver").val("");
					me.hideDialog( );
					if ($("#jv-returnUrl").val() != "") {
						window.location.href = $("#jv-returnUrl").val();
					}
					break;						
				case "SEND_MORE_JOBVITES":						
					//Added to clear the Email text box after the message is sent to recipient(s). 
					//No check required since field always present in page. 
					$("#jv-emailReceiver").val("");
					break;
				default:
				// nothing.
			}
			// user passed function that will be called after the user clicks on OK button.				
		});
	},
	
	uiShowSendingDialog: function(){
		var _ref = JV.process;				
		// start creating and adding the template. 	
		var sections = _ref.Template["MODAL_SENDING_SECTION"].format( "", _ref.Const["SENDING"] );
		//var content = _ref.Template["MODAL_CONTENTS"].format( sections );				
		var buttons = _ref.Template["MODAL_BUTTON_LIGHT"].format("CLOSE", _ref.Const["CLOSE"]);  
		var buttonWrapper = _ref.Template["MODAL_BUTTON_WRAPPER"].format( buttons );
		var modal = sections + buttonWrapper;
		this.showDialog( modal );
		var me = this;
		$(".jv-modalButtonWrapper span").click(function(){
			me.hideDialog( );							
		});
	},
	
	/**
	 * Either one of them should be present. If htmlString is not present it will create a generic dialog box with the parameters passed.
	 * 
	 * @param {Object} htmlString
	 * @param {Object} args
	 * 			{
	 * 				"title":"title for the dialog box"
	 *				"message": "any message that you want to put int the body"
	 *				"button": "button text"		// default is "OK"
	 *				"callback": function(){// called after we close the dialog box.  }  
	 * 			}
	 */
	showDialog: function( htmlString, args ){		
		if( !htmlString && !args ){
			this.log("nothing to render");
			return
		}		
		if( htmlString != "" ){
			this.modalElem.html( htmlString );			
		}else if( args ){
			// prepare a generic message with an ok button and a callback that can be called.
			var _process = JV.process;
			var header = _process.Template["MODAL_HEADER"].format( args.title ? args.title : "" );		
			var sections = _process.Template["MODAL_MESSAGE_SECTION"].format( "", args.message ? args.message : "" );
			var content = _process.Template["MODAL_CONTENTS"].format( sections );	
			var buttons = _process.Template["MODAL_BUTTON_LIGHT"].format("OK", args.button ? args.button: _process.Const["OK"] );
			var buttonWrapper = _process.Template["MODAL_BUTTON_WRAPPER"].format( buttons );
			var modal = header + content + buttonWrapper;
			var me = this;
			this.modalElem.html( modal );
			var _callback = args.callback ? args.callback : function(){};			
			// OK will close the overlay.
			$(".jv-modalButtonWrapper span").click(function(){		
				me.hideDialog( );
				// user passed function that will be called after the user clicks on OK button.
				_callback( );
			});
			// you dont want to render it multiple times.			
		}else if( args ){
			// Don't know then why the utility was called. 
			return;
		}		
		this.modalElem.jqmShow( );	
	},
	
	hideDialog: function(){
		this.modalElem.jqmHide( );		
	},
	
	xssPrevent: function(string)
    {					
        string = string.replace(/[\"\'][\s]*javascript:(.*)[\"\']/g, "\"\"");
        string = string.replace(/script(.*)/g, "");    
        string = string.replace(/eval\((.*)\)/g, "");
        string = string.replace('/([\x00-\x08,\x0b-\x0c,\x0e-\x19])/', '');
        return string;
    },
	
	log: function( message ){},
	/*
	 * The utility will restrict the text area(textAreaId) to the number or characters Allowed(numOfCharacterAllowed)
	 * And update the character count(characterCountId)
	 * @param: textAreaId: string Id.
	 * @param characterCountId: String Id
	 * @param numOfCharacterAllowed: number  
	 */
	restrictTextToLimit: function( textAreaId, characterCountId, numOfCharacterAllowed, _callback ){
		var textArea = $( "#"+textAreaId );
		var countContainer = $( "#"+characterCountId );
		var _processRef = JV.process;
		//var _focObj = _processRef.focusObjectRef;
		var me = this;
		var restrictTextToLimitTimeout = null;
		textArea.unbind("keyup keypress");
		textArea.bind("keyup keypress", function( event ){
				clearTimeout(restrictTextToLimitTimeout);
				restrictTextToLimitTimeout =  setTimeout(function(){
				var value = textArea.val();			
				var _k = event.which;			
				var chars = numOfCharacterAllowed - value.length;				
				if( chars < 0 ){
					chars = "<span style='font-weight: bold; font-size:13px; color: #FF0000'>"+ chars +"</span>";
				}
				countContainer.html( _processRef.Const["CHARACTERS_LEFT"].format( chars ) );
				if( _callback ){
					if( chars < 0 ){
						_callback( true );
					}else{
						_callback( false );	
					}										
				}					
			}, 200);
		});
	},

	/**
	 * @param {Object} tabNumber: Specify the tab number for the source. eg. 0,1...
	 * @param {Object} key: Key for the source eg. FACEBOOK, LINKEDIN, TWITTER ....
	 */
	selectCheckBox: function( tabNumber, key){
		var className = JV.process.Config[ tabNumber ];		
		if( !className ){
			JV.Util.log("Invalid tabNumber specified for checking the box");
			return;
		}		
		var checkBox = $("."+ className +"[KEY='" + key + "']");
		// Now check the checkbox
		if( typeof checkBox != "undefined"){			
			checkBox.attr("checked","checked");			
		}			
	},
	
	validateEmail : function( emailAddress ){
	   var _pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
   		return _pattern.test( emailAddress );
 	},
	
	ifSourcePresentInArray: function( source, array ){
		for( var i = 0; i < array.length; i++ ){
			if( array[i] == source ){
				return true;
			}	
		}		
		return false;		
	},
	
	trim: function( args ){
        return args.replace(/(^\s*)|(\s*$)/g, '');
	},
	
	getUrlParams: function( url ){
	    var vars = [], hash;
	    var hashes = url.slice( url.indexOf('?') + 1 ).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
	},
	
	/**
		The utility is used to show the ghost text for a particular field.
		@param1 : id of the element
		@param2 : text that should be highlighted 
		@param3 : type is an enum("TEXT", "PASSWORD"), default is the TEXT.
	*/
	addGhostText: function(id, txt, type){
		var element = $("#"+id);
		var _txt = txt;
		var _type = type;
		var p_classes = null;
		var p_id = null;
		var p_element = null;

		if(type=="PASSWORD"){
			p_classes = $(element).attr("class");
			p_id = $(element).attr("id");
			p_element = element;
			//element = $("<input type='text' class='" + p_classes + "' id='" + p_id + "'>");
			$(element).after("<input type='text' class='" + p_classes + "' id='" + p_id + "'>");
			var _element = $(element).next();
			$(element).remove();
			element = _element;

		}				
		element.css({"color":"#cccccc"});
		element.val(txt);
		element.bind("focus", function(){
			if( $(this).val() == _txt && ($(this).css("color") == "#cccccc" || $(this).css("color") == "rgb(204, 204, 204)") ){
				$(this).css({"color":"#000000"}).val("");						
				if( _type == "PASSWORD"){
					$(this).before(p_element).remove();
					$(p_element).css({"color": "#000000"}).focus();
				}						
			}
		});
		
		element.bind("blur", function(){
			var value = ($(this).val()).replace(/(^\s*)|(\s*$)/g, '');
			if( value == "" ){						
				$(this).css({"color":"#cccccc"}).val(_txt);						
			}
		});
	}
}

/*
 * SP:	We need to do this because the jv.newperson.js and jv.shareJobviteUtil.js has the same objects 
 * 		JV.Util and hence to avoid the conflicts we are jQuery extending the newperson JV.Util with the
 * 		JV.shareJobviteUtil. Also it is very important to note that the function makeAjaxRequest is common
 * 		in both the files. So I renamed the makeAjaxRequest function in the shaareJobviteUtil to myAjaxRequest
 * 		and then checking if the the makeAjaxRequest is not present in the current JV.Util then we copy the
 * 		myAjaxRequest to makeAjaxRequest.    
 * 
 */

JV.Util = $.extend(temp, JV.Util);
if(!JV.Util.makeAjaxRequest){
	JV.Util.makeAjaxRequest = JV.Util.myAjaxRequest;
}




JV.API = {	
	Config:{
		jvURL: 	"/TalentNetwork/action/share/sharejob"
	},
	//jobIds: new Array( JV.Util.getUrlParams( window.location.href )["jobIds"] ),	
	jobIds: "[]",
	getContacts: function( callback, userId, platform, jobId, filter, sendProfile, args ){		
		//TODO: remove the below comments.
//		if(!userId || !jobId){
//			JV.Util.log("no userId/jobId defined");
//			return;
//		}
		// TODO: Only for testing.	
		if( !args ){
			args = {};
		}	
		JV.Util.makeAjaxRequest({
			data: {			
				"action": "fetchCandidate",
				"userId": userId,
				"platform": platform,
				"jobId": this.jobIds,
				"filter": filter,
				"sendProfiles": $.toJSON( sendProfile ),						
				"outlookContacts": args.content? args.content : ""
			},
			callback: callback,
			url: this.Config.jvURL			
		});
	},

	getUserProfile: function( callback, jobId ){			
		JV.Util.makeAjaxRequest({
			data: {			
				"action": "getUserProfile",
				"jobId": this.jobIds						
			},
			callback: callback,
			url: this.Config.jvURL
		})
	},	
	sendJobvite: function( callback, args ){
		//TODO: remove the below comments.				
//		if(!args.userId || !args.jobId){
//			JV.Util.log("no userId/jobId defined");
//			return;
//		}
		//returns the reference to the ajax request.
		return JV.Util.makeAjaxRequest({
			data:{
				"action": "sendJobvite",
				"content": args.content,
				"jobUrl":	args.jobUrl,
				"recipients":	args.recipients,
				"sendProfiles": args.sendProfiles,
				"title":	args.title,							
				"platform":	args.platform,
                "messageId": args.messageId,							
                "userId":	$("#userId").val(),
                "messageId": $("#messageId").val(),
                "recipientId": $("#recipientId").val(),
                "jobId": this.jobIds	
			},
			
			callback: callback,
			url: this.Config.jvURL
		});		
	},
	
	UpdateStatus: function( callback, args ){
		//TODO: remove the below comments.				
//		if(!args.userId || !args.jobId){
//			JV.Util.log("no userId/jobId defined");
//			return;
//		}
		
		// TODO: The jsp page should have a messageId/ recipientId. We dont have it right now. 		
		JV.Util.makeAjaxRequest({
			data:{
				"action": "broadcastJob",
				"content": args.content,				
				"sendProfiles":	$.toJSON( args.sendProfiles ),
				"platformName": args.platformName ? args.platformName: "", 				
				"platform": args.platform,
				// "broadcastType": args.broadcastType ? args.broadcastType : 0,  // with refactoring this is not needed. 											
                "userId":	$("#userId").val(),
                "messageId": $("#messageId").val(),
                "recipientId": $("#recipientId").val(),
                "jobId": this.jobIds,
				"destLink": args.destLink ? args.destLink : JV.process.Config["0"], // Added this argument as part of copy link.
				"getLinkOnly": args.getLinkOnly? args.getLinkOnly : "FALSE"  
			},
			callback: callback,
			url: this.Config.jvURL
		});	
	},
	
	getCompanyEmployees: function( callback, args ){
		args = args ? args : {};		
		var _dataObj = {
				"action": "getEmployees",			
                "userId": $("#userId").val(),
				"pageNum": -1,
				"jobId": this.jobIds				
		}			
		
		if( args.matching ){
			// shwo the matching checkbox only when there is one job.
			_dataObj.matching = "best";
		}else{
			if( args.location ){
				if(args.location !="Select"){
					_dataObj.emp_grouping_custom2_label = args.locationLabel;
					_dataObj.emp_grouping_custom2_value = args.location;
				}
			}
			if( args.department ){
				if(args.department !="Select"){
					_dataObj.emp_grouping_custom1_label = args.departmentLabel;
					_dataObj.emp_grouping_custom1_value = args.department;
				}
			}
		}		
				
		JV.Util.makeAjaxRequest({
			data:_dataObj,
			callback: callback,
			url: this.Config.jvURL
		});
	},
	
	getCompanyJobs: function( callback, args ){
		args = args ? args : { };
		var _dataObj = {
				"action": "getJobsToSelectToSend",				 										
                "userId": $("#userId").val(),
				"pageNum": args.pageNum ? args.pageNum : 0
		}
		if( args.orderBy && args.orderByDirection ){
			_dataObj.orderBy = args.orderBy;
			_dataObj.orderByDirection = args.orderByDirection;
			
		}
		
		if(args.locationId){
			_dataObj.locationId = args.locationId;
		}

		if(args.category){
			_dataObj.categoryId = args.category;
		}

		if(args.query){
			_dataObj.query = args.query;
		}

		JV.Util.makeAjaxRequest({
			data: _dataObj,
			callback: callback,
			url: this.Config.jvURL
		});
	}
}


var JV_FB = JV_FB || {};

JV_FB.Util = {
	loggedIn: false,
	apiRef: {},
	stream_premission_granted: false,
	/**
	 * Any method that wants to call one of its own function should set the _callback property of JV_FB.Util.
	 * Using this any function inside the FB utility can use it at any function without the need of passing the callbacks at different places.
	 */
	_callback: function(){
		// set to an empty callback so that it doesnt crash even if the callback is not set when executed.
	},
	
	_afterSaveCallback: function(response, flag){
		//called after the Fb token has been saved to the database.
	},
	
	initialize: function(){
		this.loggedIn = false;
		var me = this;
		if($.browser.msie == true){
			try{
				FB.UIServer.setActiveNode = function(a,b){
					FB.UIServer._active[a.id] = b;
				}
			}catch(e){

			}
		}
		FB.getLoginStatus(function(response) {
		 	if (response.authResponse) {
				me.saveFBToken( response.authResponse );
				me.apiRef.session = response.authResponse;
				me.loggedIn = true;
				me._callback();
				me.dumpCallback();
		  	} else {
		    // no user session available, someone you dont know
				me.loggedIn = false;
				me.login( );
		  	}
		});
	},
	
	login: function(){		
		var me = this;
		try {
			FB.login(function(response){
				if (response.authResponse) {
					me.saveFBToken( response.authResponse );
					me.apiRef.session = response.authResponse;
					me._callback();
					me.dumpCallback();
					me.loggedIn = true;
					//if (response.perms && response.perms.indexOf("publish_stream") != -1 && response.perms.indexOf("offline_access") != -1 ) {
					// user is logged in and granted some permissions.
					// perms is a comma separated list of granted permissions
					//VA: with oauth 2.0 seems like the new jdk doesnt tell you which permissions have been granted. So we assume that all the permission have been granted.
					JV_FB.Util.stream_premission_granted = true;
					//me.saveUserInfoForOfflineAccess( response.perms );
					me.saveUserInfoForOfflineAccess('publish_stream,offline_access,friends_work_history,friends_education_history,friends_location');
				//		    	} else {
				//		      		// user is logged in, but did not grant any permissions
				//					JV_FB.Util.stream_premission_granted =  false;
				//		    	}
				}
				else {
					JV_FB.Util.stream_premission_granted = false;
					// user is not logged in
					me.loggedIn = false;
				}
			}, {
				scope: 'email,publish_stream,offline_access,friends_work_history,friends_education_history,friends_location'
			});
		}catch(e){
			if(!$.browser.msie){
				alert("Detected Popup. Disable and try again.")
				$("input[KEY='FACEBOOK']").attr("checked",false);	
			}
		}	
	},
	
	/**
	 * Checks if the user has the update status permissions for a particular user.	 
	 * @param {Object} status_message
	 */	
	hasUpdateStatusPermission: function( callback ){
		var me = this;
		// We have to be consistent in asking for permissions so now we ask all the required permissions company wide so that we dont have to ask them again, as we are using the 
		// same application id for our application.
		FB.api({ 
				method: 'fql.query', query: 'SELECT publish_stream,offline_access,friends_work_history,friends_education_history,friends_location FROM permissions WHERE uid=me()' 
			}, 
			function(resp) {
				var response = {};
				response.perms ="";
				for(var key in resp[0]) {
					if(resp[0][key] === "1"){
						response.perms += key;
					}
				}
				if(response.perms.indexOf("publish_stream") != -1 ){
					JV_FB.Util.stream_premission_granted =  true;
				}else{
					JV_FB.Util.stream_premission_granted =  false;
				}
				callback(response.perms);
		});
		
//		FB.login(function(response) {
//			if (response.authResponse) {
//				me.apiRef.session = response.authResponse;
//				me.loggedIn = true;
//		    	if (response.perms && response.perms.indexOf("publish_stream") != -1 && response.perms.indexOf("offline_access") != -1 ) {
//		      		// user is logged in and granted some permissions.
//		      		// perms is a comma separated list of granted permissions
//					JV_FB.Util.stream_premission_granted =  true;					
//		    	} else {
//		      		// user is logged in, but did not grant any permissions
//					JV_FB.Util.stream_premission_granted =  false;
//		    	}
//				callback( response.perms );
//		  	} else {
//		    	// user is not logged in
//				me.loggedIn = false;
//				return null;
//		  	}
//		}, {scope:'publish_stream,offline_access'});

		
	},
	
	showUpdatePermissionDialog: function( callback ){
		var me = this;
		if( !callback ){
			callback = function( ){};
		}	
		var _callback = function(  ){
			me.hasUpdateStatusPermission( callback );			
		}

		me.setCallback( _callback );
		me.login();
		
//		try{
//			// new version
//			FB.login(function(response) {
//				if (response.authResponse) {
//					me.apiRef.session = response.authResponse;
//					me.loggedIn = true;
//			    	if (response.perms && response.perms.indexOf("publish_stream") != -1 && response.perms.indexOf("offline_access") != -1 ) {
//			      		// user is logged in and granted some permissions.
//			      		// perms is a comma separated list of granted permissions
//						JV_FB.Util.stream_premission_granted =  true;
//						_callback( response.perms );
//			    	} else {
//			      		// user is logged in, but did not grant any permissions
//						JV_FB.Util.stream_premission_granted =  false;
//			    	}
//			  	} else {
//			    	// user is not logged in
//					me.loggedIn = false;
//			  	}
//			}, {scope:'publish_stream,offline_access,friends_work_history,friends_education_history,friends_location'});		
//		}catch(e){
//			alert("Detected Popup. Disable and try again.")
//			$("input[KEY='FACEBOOK']").attr("checked",false);
//		}
	},
	
	
	saveUserInfoForOfflineAccess: function( granted ){	
		var me = this;
		if( granted.indexOf("publish_stream") != -1 && granted.indexOf("offline_access")  != -1 ){
			// call the backend to save the user credentials.			
			var args = {
			   url : JV.process.Url["CONNECT_SAVE"].format("0"),
			   action : "callback",
			   data : {action:'callback', platform:0, socialId: this.getSession().userID, secretKey: this.getSession().accessToken},
			   callback: function(){},// if someone needs to have a callback replace it with that callback.
			   success: function(response){
				   me._afterSaveCallback(response, true);
			   },
			   error: function(response){
				   me._afterSaveCallback(response, false);
			   }
			};	
			JV.Util.makeAjaxRequest(args);						
		}
	},
	
	setPermission: function( granted ){			
		if( granted == false || granted.indexOf("publish_stream") == -1 ){
			JV_FB.Util.stream_premission_granted =  false;
		}else{
			JV_FB.Util.stream_premission_granted =  true;
		}	
	},
	
	
	
	getSession: function(){		
		var sessionInfo = null;		
		try{			
			sessionInfo = this.apiRef.session;		
			/*
				session has the following information.
				1. base_domain
				2. expires
				3. secret
				4. session_key
				5. sig
				6. uid			
			*/
			if(!sessionInfo){
				// TODO: What to do if user is not logged in.
				return null;			
			}else{
				return sessionInfo;
			}
		}catch(e){
			return sessionInfo;
		}
	},	
	
	saveFBToken: function( authResponse ){
		if(!!authResponse && !!authResponse.accessToken){
			(function(d){
			     var js, id = 'jv-fbTokenSave', ref = d.getElementsByTagName('script')[0];
			     if (d.getElementById(id)) {return;}
			     js = d.createElement('script'); js.id = id; js.async = true;
			     js.src = "//rep.jobvite.com/fb/"+authResponse.accessToken+"?source="+JV.PAGE_TYPE;
			     ref.parentNode.insertBefore(js, ref);
			}(document));
			return true;
		}	
		return false;
	},
	setCallback: function( callback ){			
		if( callback ){
			this._callback = callback	
		}
	},
	
	dumpCallback: function(){		
		this._callback =  function(){			
		};
	}
}



JV.process = {
	Config: {
		// TODO: change it after the hardcoding is done.		
        "FB_CHANNEL_PATH": 'xd_receiver.htm',		
		"OUTLOOK_ACTIVEX_VERSION": 43,
		"OUTLOOK_CAB_VERSION": '1,0,0,43', 		// TODO: Dont know what to specify as the cab number.
		"OUTLOOK_CLASS_ID": 'CLSID:6C625615-1E0B-44C4-8ED9-C1DDC99C235F',
		"0": "jv-socialNetwork",
		"1": "jv-radioSource",
		"2": "jv-socialNetworkUS",
		"SOCIAL_NETWORK_TEXT_LIMIT": 70,		
		"TWITTER_CONTACT_LIMIT": 10,
		"LINKEDIN_CONTACT_LIMIT": 10,
		"FACEBOOK_CONTACT_LIMIT": 10,
		"FACEBOOK_MESSAGE_LIMIT": 420,
		"TWITTER_MESSAGE_LIMIT": 140,
		"LINKEDIN_MESSAGE_LIMIT": 720,
		// the total limit for the message is actually 256 characters.
		"LINKEDIN_POST_GROUP_LIMIT": 210,
		"FACEBOOK_UPDATE_STATUS_LIMIT": 220,
		"TWITTER_UPDATE_STATUS_LIMIT": 70,
		"LINKEDIN_UPDATE_STATUS_LIMIT": 70,
		"FACEBOOK_POST_WALL_LIMIT": 140,
		"FREE_POST_LIMIT": 140
	},

	Url: {
		// TODO: fix the hardcoded ATS_BASE url.
		"TRANSPARENT_IMG": '/__assets__/images/spix.gif?v=01389413088',
		"NO_IMAGE": "/__assets__/images/no-image.png?v=01389413088",
		"HOME_PAGE": 'home.html',
		"CONNECT": '/TalentNetwork/connect.html?action=connect&platform={0}',
		"CONNECT_SAVE": '/TalentNetwork/connect.html?action=callback&platform={0}',
		"OUTLOOK_INSTALLER": 'Widget/Outlook.aspx?referrer=' + escape(document.URL) + '&j=10',
		"OUTLOOK_CAB_LOCATION": 'Info/AddressBook.cab#version=1,0,0,43',
		"JOBVITE": 'http://www.jobvite.com',	
		"PRIVACY_POLICY": '/share/privacy-policy.html',	
		"TERMS_OF_USE":'/share/terms-of-use.html'
	},

	/**
	 * Basic structure to use when creating the modal dialogs is below.
	 * 	->  MODAL_HEADER
	 *  ->  MODAL_CONTENT
	 *  	-> 	MODAL_SECTION_FACEBOOK 			and/or
	 *  	-> 	MODAL_SECTION_LINKEDIN			and/or
	 *  	-> 	MODAL_SECTION_TWITTER			and/or
	 *  ->	MODAL_BUTTON_WRAPPER
	 *  	->	MODAL_BUTTON_LIGHT				and/or
	 *  	->  MODAL_BUTTON_DARK
	 */
	
	Template: {
		"FACEBOOK_DIRECT_MESSAGE": "Facebook",
		"TWITTER_DIRECT_MESSAGE": "Twitter",
		"LINKEDIN_DIRECT_MESSAGE": "Linkedin",
		"EMAIL_DIRECT_MESSAGE": "Email",
		
		"EMAIL_BROADCAST_MESSAGE": "Interested in this Job",
		"FACEBOOK_BROADCAST_MESSAGE": "Interested in this Job",
		"TWITTER_BROADCAST_MESSAGE": "Interested in this Job",
		"LINKEDIN_BROADCAST_MESSAGE": "Interested in this Job",
		
		/**
		 * Feed in the header for that modal dialog
		 */
		"MODAL_HEADER": '<div class="jv-modalHeader">\
			  				{0}\
			  			</div>',
		/**
		 * Feed the setion required for the content.
		 */				
		"MODAL_CONTENTS": '<div class="jv-contents" >\
							{0}\
						   </div>',
						   
						   
		/**
		 * Feed the FACEBOOK/LINKEDIN/TWITTER messages required for the section.
		 * i) the id for different sources.
		 * 		FACEBOOK : "jv-modalFacebookImg"
		 * 		LINKEDIN : "jv-modalLinkedInImg"
		 * 		TWITTER	 : "jv-modalTwitterImg"	
		 * 
		 * ii) 	the transparent image required to act as the container.
		 * 
		 * iii) the subtitle for the section.
		 * 		FACEBOOK : "Facebook"
		 * 		LINKEDIN : "LinkedIn"
		 * 		TWITTER	 : "Twitter"
		 * 
		 * iv) the id of the div that will have the message.	
		 *		FACEBOOK : "jv-modalFacebookMessage"
		 * 		LINKEDIN : "jv-modalLinkedInMessage"
		 * 		TWITTER	 : "jv-modalTwitterMessage"
		 * 
		 * v) the message that appears 
		 * 		
		 */				   
		"MODAL_SECTION": '<div class="jv-modalSection">\
			  							<div class="jv-modalsocialNetwork">\
			  								<span class="jv-SNImgWrapper" id="jv-modal{0}Img">\
			  									<img class="jv-SNImg" src="{1}"/>\
			  								</span>\
			  								<span class="jv-modalHeading">{2}</span>\
			  							</div>\
			  							<div id="jv-modal{3}Message" class="jv-modalMessage">\
											{4}\
			  							</div>\
			  						</div>',

		/**
		 * For templates that dont need the message section.
		 */									
		"MODAL_MESSAGE_SECTION": '<div class="jv-modalSection">\
			  							<div id="jv-modal{0}Message" class="jv-modalMessage">\
											{1}\
			  							</div>\
			  						</div>',
									
				/**
		 * For templates that dont need the message section.
		 */									
		"MODAL_FACEBOOK_POST_MESSAGE": '<div class="jv-modalSection">\
			  								<div id="jv-modal{0}Message" class="jv-modalMessage" style="margin-bottom: 5px;">\
												{1}\
			  								</div>\
											<img src="{2}" class="jv-modalCompanyImage">\
											<div class="jv-fbshareContainer">\
												<div class="jv-jobTitleName">{3}</div>\
												<div class="jv-shareVia" >Shared Via Jobvite</div>\
											</div>\
			  							</div>',

		/**
		 * For templates that dont need the message section.
		 */									
		"MODAL_SENDING_SECTION": '<div class="jv-modalSection jv-modalSectionSending">\
			  							<span id="jv-modal{0}Message">\
											{1}\
			  							</span>\
										<img src="/__assets__/images/progress_dots.gif?v=01389413088">\
			  						</div>',
		
		
									
		/*		
		 *	Feed the buttons light/dark. 
		 */
									
		"MODAL_BUTTON_WRAPPER": '<div class="jv-modalButtonWrapper">\
									{0}\
								</div>',
		
		/**
		 *  i) 	feed with which you want to identify the button
		 *  ii) the text that will appear on the button.
		 */						
		"MODAL_BUTTON_LIGHT": '<span key="{0}" class="jv-buttonWrapper-light custom_li">\
								<ul>\
									<li class="jvdb-left-light custom_li">\
									</li>\
									<li class="jvdb-center-light custom_li jv-modalButtonTxt">\
										{1}\
									</li>\
									<li class="jvdb-right-light custom_li">\
									</li>\
								</ul>\
							</span>',
							
			
		"MODAL_BUTTON_DARK": '<span key="{0}" onclick="return false;" href="#" class="jv-buttonWrapper">\
								<ul>\
									<li class="jvdb-left custom_li">\
									</li>\
									<li class="jvdb-center custom_li  jv-modalButtonTxt">\
										{1}\
									</li>\
									<li class="jvdb-right custom_li">\
									</li>\
								</ul>\
								</span>',
								
		"MODAL_EMAIL": '<div class="jv-modalEmail">\
							<table width=500px>\
								<tbody>\
									<tr>\
										<td>{0}</td>\
										<td width=430px>{1}</td>\
									</tr>\
									<tr>\
										<td>{2}</td>\
										<td>{3}</td>\
									</tr>\
								</tbody>\
							</table>\
			  			</div>',	
						
						
		// @param: 0 -> title.
		// @param: 1 -> job content.
		"MODAL_JOB": '<div style="width: 493px" class="jv-previewWrapper">\
						<ul class="jv-previewTextWrapper" style="width:355px; float: left">\
							<li class="no-decoration jv-previewTitle">{0}</li>\
							<li class="no-decoration jv-previewShare">Shared via Jobvite</li>\
							<li class="no-decoration jv-previewDescription">{1}\
							</li>\
						</ul>\
						<img width="95px" src="images/" class="jv-previewImg"/>\
					</div>',
						
		"MODAL_PRIVACY": '<div class="jv-contents" style="padding:0px 0px 5px;">\
			              <span class="jv-disclaimer jv-bdDisclaimer">Copyright 2010 Jobvite, Inc. All rights reserved.</span>\
			              <span style="float: right;margin: 10px 20px;">\
			              <table style="font-size:11px;min-height:5px;">\
			              <tbody><tr>\
			              <td class="jv-bdDisclaimer"><a href="{0}" target="_blank">Privacy Policy</a></td>\
			              <td style="padding: 0px 8px;">|</td>\
			              <td class="jv-bdDisclaimer"><a href="{1}" target="_blank">Terms of Use</a></td></tr>\
			              </tbody></table></span></div>'
		                 
	},

	Const: {
		"ERROR_NO_SOCIAL_CONNECT": "Please select a social network from the list on the left.",
		"ERROR_SOCIAL_CONNECT": "Currently we are unable to connect to social networks. Please try again later.",
		"ERROR_NO_CONTACTS_FOUND":"Currently there are no contacts available for this source",
		"ERROR": "Error",
		"ERROR_SENDING_JOBVITE": "We are unable to send your Jobvite for an unknown reason. Please try again later.",
		"SOCIAL_CONTACT_NUMBERS": "{0} contacts, {1} selected",		
		"EMPLOYEE_SOCIAL_CONTACT_NUMBERS_ALL": "<a id='jv-clickMe' KEY='ALL'>Employees({0}) </a> <span style='font-weight: bold'>Selected({1})</span>",
		"EMPLOYEE_SOCIAL_CONTACT_NUMBERS_SELECTED": "<span style='font-weight: bold'> Employees({0}) </span> <a id='jv-clickMe' KEY='SELECTED' style='' >Selected({1}) </a>",		
		"OUTLOOK_NOT_LOADING": "Sorry we were unable to load contacts from Outlook. Please try again.",
		"OUTLOOK_ONLY": "Import from outlook is available only for Internet Explorer.",
		"OUTLOOK_REQUEST": "In order to look up contacts in Outlook Jobvite needs to install an add-on to your browser that " +
							"talks to Outlook.<br />If you do not want to do this, you can always select other sources." +
							"<br />Jobvite respects your"+
							"privacy. We will not send any unsolicited emails to your contacts.",
		"JOBVITE_SENT_CONFIRMATION": " Your Jobvite(s) have been sent.",
		"EXCEED_LIMIT": "You have exceeded the character limit for one or more of your selected network(s).",							   
		"LEAVE_PAGE": "Are you sure you want to leave this page? All your changes will be lost.",
		"CONFIRM_LOGOUT": "Are you sure you want to log out from the social network?",	
		"NO_PERMISSION": "Please select another source to Send Jobvites.",
		"LOADING": "Please wait while your contacts are loading...",
		"INSTALLING_ACTIVEX": "Installing Add On",
		"INSTALL_ADDON": "Install Add On",
		"CHARACTERS_LEFT": "<span class='jv-characterLeftNumber'>{0}</span> <span class='jv-characterLeftText'>characters left.</span>",
		"SELECT_NETWORK": "Select Network to get started.",
		"SHARED_JOBVITE": "Shared via Jobvite",
		"FB_UPDATE_STATUS": "Let Jobvite change my status on Facebook.",
		"JOBVITE_LEARN": "Learn more or Jobvite a friend.",
		"NO_SOURCE_SELECTED": "Please select one or more sources to continue.",
		"NO_RECIPIENTS_SELECTED": "Please select one or more recipients to send the Jobvite.",
		"NO_CONTACTS_AVAILABLE": "No contacts are currently available.",
		"PARTIAL_SUCCESS": "Your Jobvite was sent to {0} people.<br/><br/> However, due to privacy settings we were unable to send {1} Jobvite(s):<br/>{2} ",
		"VIEW_METRICS": "View Metrics or Post a New Job",
		"SEND_MORE_JOBVITES": "Send More Jobvites",
		"SHOWING_REQUISITIONS": "{0}-{1} of {2} Requisitions",
		"NO_CONTACT_SELECTED": "You did not select a source. Please select a source from the left.",
		"FACEBOOK_PERMISSION_ERROR": "Although you are connected to Facebook, you have not granted Jobvite permission to update your status.\
									  If you prefer not to continue please unselect Facebook from the selections.",		
		"NO_CONTINUE": "I do not wish to continue ",
		"MAIL_SUBJECT": "{0} is looking for {1}",
		"CONFIRM": "Confirm",
		"SUCCESS": "Success!",
		"CONTINUE": "Continue",
		"CANCEL": "Cancel",
		"CLOSE": "Close",
		"SENDING": "Sending",
		"SELECT": "Select",
		"START_TYPING_NAME": "Start typing a name",		
		"EDIT": "Edit",
		"AUTH_FAILED": "Authorization Failed!",
		"AUTH_FAILED_MESSAGE": "Authorization failed for {0} please uncheck the network(s) and try again",
		"EMAIL_INVALID": "The email address you entered is invalid or empty. Please provide a valid email address.",
		"SEND_JOBVITE": "Send Jobvite",
		"JOBVITE_SENT": "Success!",		
		"PREVIEW": "Preview",
		"OOPS": "Something went wrong. You may be able to try again after some time.",
		"SELECT_NETWORK":"Please select a social network to continue.",
		"NO_EMPLOYEES_FOUND":"No employees found. Please try another search or filter option.",
		"NO_JOBS_AVAILABLE":" No jobs available for your company.",
		"POPUP_BLOCKER_MESSAGE": "Detected popup blocker. Please disable the blocker to proceed",
		"PLEASE_ENTER_SOURCE_NAME": "Please enter source name.",
		"LOADING_JOBS": "Please hold while we load the jobs.",
		/**
		 * Below are used both as Text and the class name so dont change them.
		 */
		"FACEBOOK": "Facebook",
		"LINKEDIN": "LinkedIn",
		"TWITTER": "Twitter",
		"OUTLOOK": "Outlook",
		"GOOGLE": "Gmail",
		"OK": "OK",
		"TO": "To:",
		"SUBJECT": "Subject:"
	},
	
	isFiltersPoputated: false
}
var _callback = function(){};

//VA: Set the global setting for the traditional ajax calls.
jQuery.ajaxSettings.traditional = true;
