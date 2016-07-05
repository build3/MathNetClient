var cur_xml;

function appletGetXML(target){
    cur_xml = document.applet.getXML();
    $('#'+target).val(cur_xml);
}

function appletSetXML(source){
    cur_xml = $('#'+source).val();
    document.applet.setXML(cur_xml);
}

function appletEvalXML(source){
    cur_xml = $('#'+source).val();
    document.applet.evalXML(cur_xml);
}
function appletSetExtXML(xml){
    cur_xml = document.applet.getXML(); 
    console.log("got to appletSetExtXML");
    xml = xml.replace(/&lt;/g,'<').replace(/&gt;/g, '>');
    xml = JSON.parse(xml);

    var cur_json = x2js.xml_str2json(cur_xml);
    var new_json = x2js.xml_str2json(xml);
    //console.log(cur_json);
    //console.log(new_json);
    cur_json.geogebra.construction = new_json.geogebra.construction;


    $("#xmlView").val(xml);
    //console.log(xml);
    
    var final_xml = x2js.json2xml_str(cur_json);
    document.applet.setXML(final_xml);
}
function clearApplet(){
    document.applet.reset();
}
function ggbOnInit(arg) {
    var applet = document.ggbApplet;
    applet.registerAddListener(listener);
    applet.registerRemoveListener(listener);
    applet.registerUpdateListener(listener);
    console.log(arg);
}
function check_xml(xml, socket){
    var old_xml = cur_xml;
    cur_xml = xml;
    if(old_xml /*!= cur_xml*/){
        var $messages = $("#messages");
        $messages.append(sessionStorage.getItem("username") + ' has changed the xml.<br/>');
        console.log("diff xml, socket call!");
        var username = sessionStorage.getItem('username');
        var class_id = sessionStorage.getItem('class_id');
        var group_id = sessionStorage.getItem('group_id');
        socket.xml_change(username, class_id, group_id, cur_xml);
    }
}
function listener(obj){
    console.log("i am listening");
    check_xml(document.applet.getXML(), socket);
}

function appletInit(){
    var params = {"id":"applet","width":800,"height":600,"perspective":"AG","showAlgebraInput":true,"showToolBarHelp":false,"showMenubar":true,"enableLabelDrags":false,"showResetIcon":false,"showToolbar":true,"useBrowserForJS":true,"enableShiftDragZoom":true,"errorDialogsActive":true,"enableRightClick":false,"ggbBase64":"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","language":"en","country":"US","isPreloader":false,"screenshotGenerator":false,"preventFocus":false};
    var applet = new GGBApplet(params, true);
    applet.setJavaCodebase('geogebra/Java/4.2', 'true');
    //applet.setHTML5Codebase('/', 'true');
    applet.inject('appletContainer', 'auto');
}
