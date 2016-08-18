"use strict";
$(function() {

    var $leave_group_button = $('#leave_group');
    var $coord_change_buttons = $('.change_coord');
    var $update_xml_button = $('#update_xml_button');
    var $randomizeColors_button = $('#randomizeColors_button');



    $coord_change_buttons.bind('click', function(event) {
        var x = parseInt($(event.target).attr('data-x'));
        var y = parseInt($(event.target).attr('data-y'));
        socket.coordinate_change(sessionStorage.getItem('username'),
                                 sessionStorage.getItem('class_id'),
                                 sessionStorage.getItem('group_id'),
                                 x,
                                 y
                                );
    });
    
    $leave_group_button.bind('click', function() {
        socket.group_leave(sessionStorage.getItem('username'),
                           sessionStorage.getItem('class_id'),
                           sessionStorage.getItem('group_id'),
                           false
                          );
    });

    $update_xml_button.bind('click', function(e){
        e.preventDefault();
        check_xml(document.applet.getXML(), socket);
    });

    $randomizeColors_button.bind('click', function(e){
        e.preventDefault();
        randomizeColors(document.applet);
    });

});
