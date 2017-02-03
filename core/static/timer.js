var timer = {};

$(document).ready( function() {



    var start, lastserverpush;
    var debt_start, debt_start_day, debt_start_week;
    var state = 0;
    var current_task = null;
    var timer_interval, server_interval;
    var taskinfo;
    var minimize, maximize;
    var $title

    var timeid;

    $.ajax( {
        method: "POST",
        url: "/core/getcurrenttime",
        success: function( resp ) {
            if( resp == "0" ) return;
            resp = $.parseJSON( resp )
            debt_start = resp['task']['used'];
            timeid = resp['id'];
            maximize();
            $title.html( resp['task']['title'] );
            for( var j in resp['task']['parents'] ) {
                if (j == 0) continue;
                $parent = $("<div class='parent'>").appendTo( $title );
                $parent.html( " < " + resp['task']['parents'][j].title );
            }

            timer.pushtimer();
        }
    })


    var $timer = $("<div class='timer'>").appendTo( $("body") );
    var $links = $("<div class='links'>").appendTo( $timer );
    $title = $("<div class='title'>").appendTo( $timer );
    var $time = $("<div class='time'>").appendTo( $timer );/*
    var $time_day = $("<div class='time'>").appendTo( $timer );
    var $time_week = $("<div class='time'>").appendTo( $timer );*/
    var $timeb = $("<div class='time budget'>").appendTo( $timer );


    var addlink = function(name, fn) {
        var $newlink = $("<div class='link'>").appendTo( $links );
        $newlink.html( name );
        $newlink.click( fn );
        return $newlink;
    }


    var toggle = function(state) {
        $(".timer .title").toggle( state );
        $(".timer .time").toggle( state );
        $(".timer .time").toggle( state );
    }

    var $minbtn;
    minimize = function(){
        toggle( false );
        $minbtn.html( "maximize" );
        minimized_state = true;
    }
    maximize = function(){
        toggle( true );
        $minbtn.html( "minimize" );
        minimized_state = false;
    }

    var minimized_state = true;
    $minbtn = addlink( "maximize", function() {
        if (minimized_state == true) {
            maximize();
        } else {
            minimize();
        }
    });


    addlink( "stop", function() {
        timer.stop();
    } );

    addlink( "start", function() {
        if( current_task == null ) {
            alert( "No task in the timer" );
            return;
        }
        timer.start( current_task );
    })

    addlink( "goto", function() {
        window.location = "/tree/" + current_task.info.id;
    })

    var time_string = function( secs ) {
        var hours = ( (secs / 3600) | 0 );
        var minutes = ( (secs / 60) % 60 | 0 );
        var seconds = (secs % 60) | 0;

        if (hours < 10)
            hours = "0" + hours;
        if (minutes < 10)
            minutes = "0" + minutes;
        if (seconds < 10)
            seconds = "0" + seconds;

        var timestr = hours + ":" + minutes + ":" + seconds;
        return timestr;
    }

    timer.start = function( task ) {
        if( state == 1 ) {
            alert( "Stop current timer" );
            return;
        }

        current_task = task;

        $.ajax( {
            "url": "/core/newtime",
            "method": "POST",
            "data": {
                "task": current_task.info.id
            },
            "success": function(resp) {
                timeid = parseInt(resp);

                $timeb.html( time_string( current_task.info.amt * 60 * 60 | 0 ) )

                timerstart = Date.now();
                if( current_task.info.used == null )
                    current_task.info.used = 0;
/*
                if( current_task.info.used_day == null )
                    current_task.info.used_day = 0;

                if( current_task.info.used_week == null )
                    current_task.info.used_week = 0;
*/
                debt_start = current_task.info.used;/*
                debt_start_day = current_task.info.used_day;
                debt_start_week = current_task.info.used_week;
*/
                maximize();
                $title.html( current_task.info.title );

                for( var j in current_task.info.parents ) {
                    if (j == 0) continue;
                    $parent = $("<div class='parent'>").appendTo( $title );
                    $parent.html( " < " + current_task.info.parents[j].title );
                }
                timer.pushtimer();
            }
        } );
    }

    timer.pushtimer = function() {
        if( state == 1 )
            return;

        start = Date.now();
        //lastserverpush = Date.now();

        timer.update();
        timer_interval = setInterval( function() {
            timer.update();
        }, 100 );/*
        server_interval = setInterval( function() {
            timer.server_update();
        }, 10000 );*/

        state = 1;
    }

    timer.stop = function() {
        if( state == 0 )
            return;
        state = 0;

        $.ajax( {
            "url": "/core/timeend",
            "method": "POST",
            "data": {
                "id": timeid
            },
            "success": function() {
                clearInterval( timer_interval );
            }
        } );

        //clearInterval( server_interval );
        //timer.server_update();
    }
/*
    timer.server_update = function() {
        var diff = (((Date.now() - lastserverpush) / 1000) | 0);

        $.ajax( {
            "url": "/core/timerlog",
            "method": "POST",
            "data": {
                "diff": diff,
                "task": current_task.info.id
            }
        } );

        console.log( current_task.info.used, "USED" );
        current_task.info.used += diff;

        lastserverpush = Date.now();
    }
*/
    timer.update = function() {
        var diff = (((Date.now() - start) / 1000) | 0);
        /*
        current = debt_start + diff;
        current_day = debt_start_day + diff;
        current_week = debt_start_week + diff;

        current_task.info.used = current;
        current_task.info.used_day = current_day;
        current_task.info.used_week = current_week;

        current_task.$amt_used.update();
        current_task.$amt_used_day.update();
        current_task.$amt_used_week.update();
        */
        $time.html( time_string( diff + debt_start ) );/*
        $time_day.html( time_string( current_task.getsumrealreal_day() * 3600 ) );
        $time_week.html( time_string( current_task.getsumrealreal_week() * 3600 ) );*/
    }
});