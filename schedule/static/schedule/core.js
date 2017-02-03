var $container = $("body");

var tasks = [];
var gofetch;

var $viewportcont;
var create_viewport = function() {
    if ( $viewportcont != null )
        return;

    $viewportcont = $("<div class='viewportcont'>").appendTo( "body" );
}

var update_viewport = function() {
    if ( $viewportcont == null )
        create_viewport();

    $viewportcont.html("");

    var step = ( rightbound.getTime() - leftbound.getTime() ) / 10;

    for(var time=leftbound.getTime(); time<=rightbound.getTime()-step; time += step) {
        var newthing = $("<div class='rule'>").appendTo( $viewportcont );
        mystart = new Date(time);
        myend = new Date(time + step);

        newthing.append( $("<div class='time'>").html( mystart ) )

        newthing.css( {
            "width": viewportwidth * step / (rightbound.getTime() - leftbound.getTime()),
            "left": viewportwidth * (time - leftbound.getTime()) / (rightbound.getTime() - leftbound.getTime())
        });
    }
}

var leftbound;
var rightbound;

$(document).ready( function() {
    today_morning = new Date();
    today_morning.setHours(0);

    today_night = new Date();
    today_night.setHours(23);

    leftbound = today_morning;
    rightbound = today_night;

    viewportwidth = 1000;
    viewportheight = 500;

    update_viewport();

    var $goback = $("<div class='left arrow'><</div>").appendTo($container);
    $goback.click( function() {
        leftbound.setHours( leftbound.getHours() - 24 );
        rightbound.setHours( rightbound.getHours() - 24 );
        update_viewport();
        gofetch();
    });
    var $goforward = $("<div class='right arrow'>></div>").appendTo($container);
    $goforward.click( function() {
        leftbound.setHours( leftbound.getHours() + 24 );
        rightbound.setHours( rightbound.getHours() + 24 );
        update_viewport();
        gofetch();
    });

    var tooltipping = false;
    var $tooltip = $("<div class='tooltip'>").appendTo( "body" );
    var set_tooltip = function( l, t, task, $leave_el ) {
        tooltipping = true;
        $tooltip.html("");
        $tooltip.append( "<a href='/tree/" + task.id + "'>" + task.title + "</a>" );
        $tooltip.toggle( true );
        $tooltip.css( {
            "left": l,
            "top": t
        })
        $leave_el.mouseleave( function() {
            $tooltip.toggle( false );
            tooltipping = false;
        })
    }

    var bar = function( info ) {
        this.info = info;
        this.start = new Date( this.info['start'] );
        this.end = new Date( this.info['end'] );

        this.render();
    };

    bar.prototype.render = function() {
        var _this = this;


        this.$html = $("<div class='task'>").appendTo( $container );

        var escape_fn;

        this.state = 'idle';
        this.$leftbar = $("<div class='bar left'>");
        this.$leftbar.click( function() {
            if( _this.state != 'idle' ) return;
            _this.state = 'dragl';

            setTimeout( function() {
                $(document).on( "click.escapefn", escape_fn );
            }, 100 );
        });
        this.$rightbar = $("<div class='bar right'>");
        this.$rightbar.click( function() {
            if( _this.state != 'idle' ) return;
            _this.state = 'dragr';

            setTimeout( function() {
                $(document).on( "click.escapefn", escape_fn );
            }, 100 );
        });

        escape_fn = function(e) {
            if( _this.state == 'dragl') {
                _this.start = new Date( leftbound.getTime() + ( rightbound.getTime() - leftbound.getTime() ) * _this.draggedx / (viewportwidth) );
                _this.server_update_l()
            }

            if( _this.state == 'dragr') {
                _this.end = new Date( leftbound.getTime() + ( rightbound.getTime() - leftbound.getTime() ) * _this.draggedx / (viewportwidth) );
                _this.server_update_r()
            }

            _this.update_info();

            _this.state = 'idle';
            $(document).off( "click.escapefn" );
        }

        this.$html.append( this.$leftbar, this.$rightbar )

        this.$info = $("<div class='info'>").appendTo( this.$html );
        this.update_info();

/*        this.$html.mouseover( function(e) {
            if( tooltipping )
                return;

            set_tooltip( e.pageX - 50, e.pageY - 50, _this.info.task, _this.$html )
        })*/

        this.update_position();
    }

    bar.prototype.update_info = function() {
        this.$info.html("");
        this.$info.append( $("<a href='/tree/" + this.info.task.id + "'>" + this.info.task.title + "</a><br>") )
        this.$info.append( ( ( this.end.getTime() - this.start.getTime() ) / (3600*1000) ).toFixed(2) + " hours<br>" )
        function justTime( t ) {
            return t.getHours() + ":" + t.getSeconds();
        }
        this.$info.append( justTime( this.start ) + " - " + justTime( this.end ) + "<br>" )
        this.$info.append( $("<a href='/core/deletetime?id=" + this.info.id + "'>Delete</a><br>") )
    }

    bar.prototype.server_update_l = function() {
        $.ajax( {
            "method":"POST",
            "data":{
                start: this.start.toISOString(),
                id: this.info.id
            },
            "url": "/core/timestart",
            "success": function( resp ) {
            }
        } );
    }

    bar.prototype.server_update_r = function() {
        $.ajax( {
            "method":"POST",
            "data":{
                end: this.end.toISOString(),
                id: this.info.id
            },
            "url": "/core/timeend",
            "success": function( resp ) {
            }
        } );
    }

    bar.prototype.forceL = function(x) {
        var l = viewportwidth * (this.start.getTime() - leftbound.getTime() ) / (rightbound.getTime() - leftbound.getTime());
        var w = viewportwidth * (this.end.getTime() - leftbound.getTime() ) / (rightbound.getTime() - leftbound.getTime());
        w -= l;

        w -= (x - l);
        l = x;
        this.draggedx = x;

        this.$html.css( {
            "left": l,
            "width": w,
        });
    }

    bar.prototype.forceR = function(x) {
        var l = viewportwidth * (this.start.getTime() - leftbound.getTime() ) / (rightbound.getTime() - leftbound.getTime());
        var w = viewportwidth * (this.end.getTime() - leftbound.getTime() ) / (rightbound.getTime() - leftbound.getTime());
        w -= l;

        w -= (l+w) - x;
        this.draggedx = x;

        this.$html.css( {
            "left": l,
            "width": w,
        });
    }

    bar.prototype.update_position = function() {
        var l = viewportwidth * (this.start.getTime() - leftbound.getTime() ) / (rightbound.getTime() - leftbound.getTime());
        var w = viewportwidth * (this.end.getTime() - leftbound.getTime() ) / (rightbound.getTime() - leftbound.getTime());
        w -= l;
        var t = 300;
        var h = 100;

        this.$html.css( {
            "left": l,
            "top": t,
            "width": w,
            "height": h
        })
    };

    bar.prototype.destroy = function() {
        this.$html.remove();
    }

    gofetch = function() {
        console.log( leftbound, rightbound );
        $.ajax( {
            "method":"POST",
            "data":{
                start: leftbound.toISOString(),
                end: rightbound.toISOString()
            },
            "url": "/core/gettimes",
            "success": function( resp ) {
                resp = $.parseJSON( resp );
                for( var i in tasks )
                    tasks[i].destroy();
                tasks = [];
                for( var i in resp )
                    tasks.push( new bar( resp[i] ) );
            }
        } );
    }

    gofetch();
} );

var mouseX;
var mouseY;
$(document).mousemove( function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
})

setInterval( function() {
    for( var i in tasks ) {
        if( tasks[i].state == 'idle' ) continue;
        if( tasks[i].state == 'dragl' ) tasks[i].forceL( mouseX );
        if( tasks[i].state == 'dragr' ) tasks[i].forceR( mouseX );
    }
}, 50 )