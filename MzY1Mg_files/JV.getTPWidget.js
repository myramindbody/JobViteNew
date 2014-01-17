var JV = JV || {};
JV.TPW = (function(){
    function getParams(){
    	var rootScriptDir = "__assets__/";
    	var rootDir = "TalentNetwork/";
        var scripts = document.getElementsByTagName("script"),
            length = scripts.length
            i=0;

         for (i=0 ; i < length; i++) {
          if ((scripts[i].src).indexOf("JV.getTPWidget.js" ) > -1) {        
              var url = scripts[i].src.split("?");
              var tnUrlIndex = url[0].indexOf(rootDir);
              var assetsUrlIndex = url[0].indexOf(rootScriptDir);
              if(tnUrlIndex > -1) {
                  url[0] = url[0].substring(0, tnUrlIndex + rootDir.length);
              }
              else if(assetsUrlIndex > -1) {
                  url[0] = url[0].substring(0, assetsUrlIndex) + rootDir;
              }
              var pos = url[0].indexOf(':');
              if (pos > 0) {
                  url[0] = url[0].substring(pos+1);
              }
              return url;
          }
         }
    };
    function escapeHtml(string) {
    	return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    return {//
        init: function(){        	
            var jvcontainer = document.getElementById("jv-widgetContainer"),
                url = getParams(),               
                name = 'jv-twp-iframe', t, d, myFrame;
                try {
                t = escapeHtml(document.getElementById('jv-TPWTitle').innerHTML),
                d = escapeHtml(document.getElementById('jv-TPWMessage').innerHTML),
                name = t+'-|jv|-'+d;
                } catch (e) {}
                myFrame = '<iframe name ="'+name+'" id="jv-widget" src="'+url[0]+'widget/widgetContainer.html?'+url[1]+'" scrolling="no" frameborder="0" style="border:none;" height="380px" width="251px" >Widget Cannot be loaded !!!</iframe>';
            	jvcontainer.innerHTML = myFrame;  
        }
    };
}());

JV.TPW.init();
