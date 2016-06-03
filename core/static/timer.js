var timer = {};

$(document).ready( function() {
    var $timer = $("<div class='timer'>").appendTo( $("body") );
    var $links = $("<div class='links'>").appendTo( $timer );
    var $title = $("<div class='title'>").appendTo( $timer );
    var $time = $("<div class='time'>").appendTo( $timer );
    var $timeb = $("<div class='time budget'>").appendTo( $timer );

    var $stoplink = $("<div class='link'>").appendTo( $links );
    $stoplink.html( "Stop" );
    $stoplink.click( function() {
        timer.stop();
    } );

    var start, lastserverpush;
    var debt = 0;

    var state = 0;

    var current_task;

    var timer_interval, server_interval;

    var time_string = function( secs ) {
        var hours = ( (secs / 3600) | 0 );
        var minutes = ( (secs / 60) % 60 | 0 );
        var seconds = (secs % 60);

        if (hours < 10)
            hours = "0" + hours;
        if (minutes < 10)
            minutes = "0" + minutes;
        if (seconds < 10)
            seconds = "0" + seconds;

        var timestr = hours + ":" + minutes + ":" + seconds;
        return timestr;
    }

    timer.start = function( taskinfo ) {
        if( state == 1 ) {
            alert( "Stop current timer" );
            return;
        }
        state = 1;

        $timeb.html( time_string( taskinfo.amt * 60 * 60 | 0 ) )

        current_task = taskinfo;

        timerstart = Date.now();
        if( taskinfo.used == null )
            taskinfo.used = 0;
        debt = taskinfo.used;

        $timer.toggle( true );
        $title.html( taskinfo.title );

        start = Date.now();
        lastserverpush = Date.now();

        timer.update();
        timer_interval = setInterval( function() {
            timer.update();
        }, 100 );
        server_interval = setInterval( function() {
            timer.server_update();
        }, 10000 );
    }

    timer.stop = function() {
        if( state == 0 )
            return;
        state = 0;

        clearInterval( timer_interval );
        clearInterval( server_interval );
        timer.server_update();
    }

    timer.server_update = function() {
        var diff = (((Date.now() - lastserverpush) / 1000) | 0);

        $.ajax( {
            "url": "/core/timerlog",
            "method": "POST",
            "data": {
                "diff": diff,
                "task": current_task.id
            }
        } )

        lastserverpush = Date.now();
    }

    timer.update = function() {
        var diff = (((Date.now() - start) / 1000) | 0);
        diff += debt;

        $time.html( time_string(diff) );
    }
});