"use strict";

//escapes most strings to not break general forms
function escapeStr(str) 
{
    if (str)
        return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=><|\/@])/g,'\\$1');      

    return str;
}

/**
 * function ping response
 * checks time and update ping
 */
 function ping_response(time) {
    var d = new Date();
    //console.log(d.getTime() - time)
    $('.ping').html("Ping: " + (d.getTime() - time).toString());
 }

 
//displays server error on client side
function server_error(error) {
    var str = error;

    if (str.indexOf("Invalid username") !== -1) {
        $username.css("border-color", "red");
        $error_username.show();
    }
    else if (str.indexOf("invalid.") !== -1) {
        $class_id.css("border-color", "red");
        $error_class_id.show();
    }
    else {
        console.log(error);
        sessionStorage.setItem('error', error);
        location.reload();
    }
}


//shows class_view and sets sessionStorage for class_id and username, then calls groups_get
function login_response(username, class_id) {
    $login_view.hide();
    $class_view.show();
    $group_view.hide();

    username = username.replace(/&lt;/g,'<').replace(/&gt;/g, '>');

    sessionStorage.setItem('class_id', class_id);
    sessionStorage.setItem('username', username);
    socket.groups_get(username, class_id);
}

//shows login_view, and removes class_id and username from sessionStorage 
//if logout was not a disconnect
function logout_response(disconnect) {
    $login_view.show();
    $class_view.hide();
    $group_view.hide();


    $error_username.hide();
    $error_class_id.hide();

    $class_id.css("border-color", null);
    $username.css("border-color", null);

    $class_id.val("");
    $username.val("");
    
    if(!disconnect){
        sessionStorage.removeItem('class_id');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('group_id');
        sessionStorage.removeItem('toolbar');
        //sessionStorage.removeItem('group_colors');
        sessionStorage.removeItem('properties');

    }
}

//populates $groups with buttons with info from groups.
function groups_get_response(username, class_id, groups) {
    $groups.empty();
    for (var i in groups){
        var button = '<input type="button" class="btn btn-md btn-primary " style="margin: 0em 1em 1em 0em" id="grp' + groups[i].grp_name + '" value="Group ';
        button += groups[i].grp_name + ' - '+ groups[i].num;
        button += '" />';
        $groups.append(button);
    }
}

//increments group_size if status is true (user is joining group), else decrements
function group_numbers_response(username, class_id, group_id, status, group_size){
    var group_size = (status ? group_size++ : group_size--);
    $("#grp" + group_id).val('Group ' + group_id + ' - ' + group_size);
}

//resets $messages and $people, sets group_id in sessionStorage, then calls group_info
// and get_settings
function group_join_response(username, class_id, group_id, group_size) {
    $login_view.hide();
    $class_view.hide();
    $group_view.show();

    var params = {
                "container":"appletContainer",
                "id":"applet",
                "width":$applet.innerWidth(),
                "height":$applet.innerWidth()*0.53,
                "perspective":"AG",
                "showAlgebraInput":true,
                "showToolBarHelp":false,
                "showMenubar":true,
                "enableLabelDrags":false,
                "showResetIcon":true,
                "showToolbar":true,
                "allowStyleBar":false,
                "useBrowserForJS":true,
                "enableShiftDragZoom":true,
                "errorDialogsActive":true,
                "enableRightClick":false,
                "enableCAS":false,
                "enable3d":false,
                "isPreloader":false,
                "screenshotGenerator":false,
                "preventFocus":false
    };

    appletInit(params);
    
    sessionStorage.setItem('group_id', group_id);

    socket.group_info(username, class_id, group_id, true);
    socket.get_settings(class_id, group_id);
}

// shows class_view, and removes group_id from sessionStorage if disconnect is not true
function group_leave_response(username, class_id, group_id, disconnect) {
    // This function must call socket.groups_get(username, class_id)

    $login_view.hide();
    $class_view.show();
    $group_view.hide();
    if(!disconnect){
        sessionStorage.removeItem('group_id');
    }    
}

// populates $people with members array values, and appends join/leave message
// based on status. removes #username if leave
function group_info_response(username, class_id, group_id, members, status) {
    var current_user = sessionStorage.getItem('username');
    var current_group = sessionStorage.getItem('group_id');
    
    if(status){
        for (var i in members) {
            members[i].member_info = JSON.parse(members[i].member_info);
            var member = members[i].member_name.replace(/&lt;/g,'<').replace(/&gt;/g, '>');
            if(member == current_user) {
                $group_name.html('Group: ' + current_group + ', ' + members[i].member_name); //only update this for the new member
            }
        }
    } 
}//members is undefined if group_info_response is triggered by group_leave, so short circuit it on status.

//handler for xml_change response, appends message to chatbox, and calls appletSetExtXML()
function xml_change_response(username, class_id, group_id, xml, toolbar, properties, obj_xml, obj_label, obj_cmd_str) {
    socket.group_color(sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));
    if(properties !== null){
        sessionStorage.setItem('properties', JSON.stringify(properties));
    } else if (properties === null && sessionStorage.getItem('properties') !== null){
        properties = JSON.parse(sessionStorage.getItem('properties'));
    }
    appletSetExtXML(xml, toolbar, properties, null, username, obj_xml, obj_label, obj_cmd_str);
    ggbOnInit('socket_call', false);
}

//handler for xml_update response, appends message to chatbox, and calls appletSetExtXML() (mathnet)
//TODO: Get rid of other params and keep only data
function xml_update_response(username, class_id, group_id, xml, toolbar, properties, obj_xml, obj_label, obj_cmd_str, type_of_req, recv_xml_update_ver, new_update, data){
    if(!is_xml_update_queue_empty && new_update){
        xml_update_queue.enqueue(data);
        return;
    }
    xml_update_ver = xml_update_ver + 1;
    socket.group_color(sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));
    if(properties !== null){
        sessionStorage.setItem('properties', JSON.stringify(properties));
    } else if (properties === null && sessionStorage.getItem('properties') !== null){
        properties = JSON.parse(sessionStorage.getItem('properties'));
    }
    appletUpdate(xml, toolbar, properties, null, username, obj_xml, obj_label, obj_cmd_str, type_of_req);
    ggbOnInit('socket_call', false);
}

function p2p_get_xml_response(username, class_id, group_id){
    socket.applet_xml(document.applet.getXML(), username, class_id, group_id, xml_update_ver);
}

function applet_xml_response(username, class_id, group_id, xml, properties, received_xml_update_ver){
    xml_update_ver = received_xml_update_ver == undefined ? 0 : received_xml_update_ver;
    if(xml == undefined){
        xml = '{}';
    }
    /*
    if(properties !== null){
        sessionStorage.setItem('properties', JSON.stringify(properties));
    } else if (properties === null && sessionStorage.getItem('properties') !== null){
        properties = JSON.parse(sessionStorage.getItem('properties'));
    }
    if(!toolbar){
        toolbar = sessionStorage.getItem('toolbar');
    }*/
    p2pAppletSetXML(xml, toolbar, properties, null, username, null, null, parseInt($("#grp" + sessionStorage.group_id).val().slice(-1)));
    ggbOnInit('socket_call', true);
}

function process_msgs_in_queue(){
    var curr_user = sessionStorage.getItem('username');
    while(!xml_update_queue.isEmpty()){
        var update = xml_update_queue.dequeue();
        //if((update.username == curr_user && update.xml_update_ver > xml_update_ver) || (update.username != curr_user && update.xml_update_ver >= xml_update_ver)){
            xml_update_response(update.username, update.class_id, update.group_id, update.xml, update.toolbar, update.properties, update.obj_xml, update.obj_label, update.obj_cmd_str, update.type_of_req, update.recv_xml_update_ver, false, update.data);
        //}
    }
    is_xml_update_queue_empty = true;
}

//calls appletSetExtXML() to update the local geogebra applet.
function get_xml_response(username, class_id, group_id, xml,toolbar, properties){
    if(xml == undefined){
        xml = '{}';
    }
    if(properties !== null){
        sessionStorage.setItem('properties', JSON.stringify(properties));
    } else if (properties === null && sessionStorage.getItem('properties') !== null){
        properties = JSON.parse(sessionStorage.getItem('properties'));
    }
    if(!toolbar){
        toolbar = sessionStorage.getItem('toolbar');
    }
    
    appletSetExtXML(xml, toolbar, properties, null, username, null, null); //mathnet
    ggbOnInit('socket_call', false);
}

// updates $class_settings based on settings array
function get_settings_response(class_id, settings) {
    $class_settings.html('');

    for (var setting in settings) {
        var setting_item = "<li>" + setting + ": " + settings[setting] + "</li>";
        $class_settings.append(setting_item);
        if (setting == "Hide Options" ){
            settings[setting] ? (
                $("#display-settings").hide(), 
                $("#display-settings input:checkbox").prop('checked', ''),
                $("#display-settings #show_points").prop('checked', true)
            ) : (
                $("#display-settings").show()
            );//hide display options if certain global is turned on.
        }
    }
}

//adds a new group button
function add_group_response() {
    var group_number = $groups.children().length + 1;
    var button = '<input type="button" class="btn btn-md btn-primary " style="margin: 0em 1em 1em 0em" id="grp' + group_number + '" value="Group ';
    button += group_number + ' - '+ 0;
    button += '" />';
    $groups.append(button);
}

//removes last group button
function delete_group_response() {
    $('#buttons input').last().remove();
    $('#buttons > li:last').remove();
}

function delete_student_class_response() {
    delete sessionStorage.class_id;
    delete sessionStorage.group_id;
    delete sessionStorage.username;
}

function group_color_response(colors) {
    //sessionStorage.setItem('group_colors', colors);
}

function ggbOnInit(arg, should_process_queue){

    document.applet.registerAddListener("addListener");
    document.applet.registerUpdateListener("updateListener");
    document.applet.registerRemoveListener("removeListener");

    socket.group_color(sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));

    if(arg != 'socket_call'){
        socket.p2p_get_xml(sessionStorage.getItem('username'),sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));
    }

    $(window).resize(function() {
        document.applet.setHeight($(window).height()/1.3);
    });

    if(should_process_queue){
        process_msgs_in_queue();
    }
}

//This function registers listeners on geogebra initialization 
function ggbOnInit_old(arg) {
    if(arg != 'socket_call'){
        //localStorage.setItem('setNewXML', 'true');
    }
    //document.applet.registerAddListener("object_added_listener");
    document.applet.registerAddListener("addLock");
    document.applet.registerUpdateListener("Update");
    document.applet.registerRemoveListener("Update");

    //document.applet.registerAddListener("updateColors");
    socket.group_color(sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));
    if(arg != 'socket_call'){
        socket.get_xml(sessionStorage.getItem('username'),sessionStorage.getItem('class_id'),sessionStorage.getItem('group_id'));
    }
    $(window).resize(function() {
        document.applet.setHeight($(window).height()/1.3);
    });
}

$step_size_slider.bind('mousemove', function() {
    stepSize = $step_size_slider.val()/10;
    $step_size_label.text($step_size_slider.val()/10);
});
