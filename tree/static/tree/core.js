var awaitingInput = false;
var awaitingInputCallback = null;
var byid = {}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function node( info ) {
    var _this = this;

    this.info = info;
    this.children = [];
    this.parents = [];

    byid[ this.info.id ] = this;

    this.amt_actual = 0;

    for (var i in info.children) {
        var child = new node( info.children[i] );
        this.addchild( child );
    }

    this.renderings = [];
};

node.prototype.render = function() {
    var _this = this;

    var toggle_children, render_children;
    var set_context_menu, unset_context_menu;
    var $context_menu;

    var $html = $("<div class='node'>");


    var $expandcontract = $("<div class='button expandcontract small'>").appendTo($html);
    $expandcontract.click( function() {
        // This is where we receive input, i.e. when rebasing a task
        if( awaitingInput ) {
            awaitingInputCallback( _this.info.id );
            awaitingInput = false;
            return;
        }
        toggle_children();
    } );
    var $cm_button = $("<div class='button cm'>").appendTo($html);
    $cm_button.on("click", function(e) {
        set_context_menu(e);
    });



    var $title = $("<div class='title'>").appendTo( $html );
    $title.html( this.info.title );
    $title.click( function() {
        var newtitle = prompt( "Enter new title...", _this.info.title );
        if (newtitle == null) return;
        _this.info.title = newtitle;
        _this.sendinfotoserver();
        $title.html( _this.info.title );
    } )



    this.$amt_used = $("<div class='amt used'>").appendTo( $html );
    this.$amt_used.update = function() {
        var used = _this.getsumrealreal();
        if ( used == 0 )
            _this.$amt_used.html( "" );
        else
            _this.$amt_used.html( used + " hours" );
    }
    this.$amt_used.update();



    var $amt_budget = $("<div class='amt budget'>").appendTo( $html );

    // Just for now. Database stupidity
    if (this.info.amt == null)
        this.info.amt = 0

    $amt_budget.update = function() {
        $amt_budget.html( _this.info.amt + " hours" );
    }
    $amt_budget.update();
    $amt_budget.click( function() {
        var newamt = prompt( "Enter new amount...", _this.info.amt );
        if( newamt == null ) return;
        if( newamt.split(":").length > 1 ) {
            var hours=0;
            var sp = newamt.split(":");
            if( sp[0] != "" ) hours = parseInt( sp[0] );
            if( sp[1] != "" ) hours += parseInt( sp[1] ) / 60;

            newamt = round(hours,2);
        }
        _this.info.amt = parseFloat(newamt);
        _this.sendinfotoserver();
        $amt_budget.update();

        //Update all the parents
        var parent = _this;
        while( typeof parent != 'undefined' ) {
            parent.$amt_sum.update();
            //Will break for multiple parents...
            parent = parent.parents[0];
        }
    } )


    //var $amt_sum = $("<div class='amt'>").appendTo( $html );

    //$amt_sum.update = function() {
    //    $amt_sum.html( _this.getsumreal() + " hours");
    //}
    //$amt_sum.update();


    this.$amt_sum = $("<div class='amt'>").appendTo( $html );

    this.$amt_sum.update = function() {
        var sum = 0;
        for( var i in _this.children )
            sum += _this.children[i].getsumreal()

        if (sum == 0)
            _this.$amt_sum.html( "" );
        else
            _this.$amt_sum.html( sum + " hours");
    }
    this.$amt_sum.update();






    var children_toggle_state = false;
    var $children = $("<div class='children'>").appendTo( $html );


    toggle_children = function() {
        children_toggle_state = !children_toggle_state;

        $children.toggle(children_toggle_state);
        if( children_toggle_state ) {
            $expandcontract.toggleClass( "small", false );
            $expandcontract.toggleClass( "big", true );
        } else {
            $expandcontract.toggleClass( "small", true );
            $expandcontract.toggleClass( "big", false );
        }

        localStorage[ "toggle:" + _this.info.id ] = children_toggle_state ? "true":"false";
    }


    render_children = function() {
        $children.html("");
        for( var i in _this.children )
            $children.append( _this.children[i].render() );
    }

    set_context_menu = function(e) {
        $context_menu = $("<div class='context_menu'>").appendTo( "body" );
        $context_menu.css( {
            "left": e.pageX,
            "top": e.pageY
        } );

        var new_button = function( name, fn ) {
            $btn = $("<div class='item'>").appendTo( $context_menu );
            $btn.html( name );
            $btn.click( function() {
                unset_context_menu();
                fn();
            } );
        }

        new_button( "new child", function() {
            var title = prompt( "Enter title please" );
            if( title == null ) return;

            var newchild = new node( {
                "children": [],
                "title": title
            } );

            $.ajax( {
                "data": {
                    "info": JSON.stringify( newchild.info ),
                    "parent": _this.info.id
                },
                "url": "/node/addchild",
                "method": "POST",
                "success": function( resp ) {
                    newchild.info.id = parseInt(resp);
                }
            } );

            _this.addchild( newchild );
            render_children();
        } );

        new_button( "move me", function() {
            awaitingInput = true;
            awaitingInputCallback = function( id ) {
                _this.info.parent = id;
                _this.sendinfotoserver();

                _this.parents[0].removechild( _this.info.id )
                byid[id].addchild( new node( _this.info ) )

                for( var i in byid[id].renderings )
                    byid[id].renderings[i].render_children()
            }
        } );

        new_button( "move my time", function() {
            awaitingInput = true;
            awaitingInputCallback = function( id ) {
                $.ajax( {
                    "method": "POST",
                    "url": "/node/movetime",
                    "data": {
                        "from":_this.info.id,
                        "to": id
                    },
                    "success": function(e) {
                        byid[id].info.used += _this.info.used;
                        _this.info.used = 0;

                        _this.$amt_used.update();
                        byid[id].$amt_used.update();
                    }
                } )
            }
        } );

        new_button( "doing now", function() {
            timer.start( _this.info );
        } );

        new_button( "zoom", function() {
            window.location = "/tree/" + _this.info.id
        });


        new_button( "delete", function() {
            if( !confirm( "Are you sure??" ) ) return;
            $.ajax( {
                "method": "POST",
                "url": "/node/delete",
                "data": {"id":_this.info.id},
                "success": function(e) {
                    for( var i in _this.parents ) {
                        _this.parents[i].removechild( _this.info.id )
                    }
                    render_children();
                }
            } )
        } );


        new_button( "close", function() {
        } );

        $cm_button.off( "click" )
        $cm_button.on( "click", unset_context_menu );
    }

    unset_context_menu = function(e) {
        $context_menu.remove();
        $cm_button.on( "click.cm", set_context_menu );
    }

    render_children();
    if( localStorage[ "toggle:" + _this.info.id ] == "true" )
        toggle_children();

    this.renderings.push( {
        html:$html,
        render_children:render_children
    } );

    return $html
}

node.prototype.getsumreal = function() {
    if( this.info.amt != 0 )
        return this.info.amt;

    var sum = 0;
    for(var i in this.children) {
        sum += this.children[i].getsumreal();
    };
    return sum;
}

node.prototype.getsumrealreal = function() {
    var mine = this.info.used / 3600;
    for( var i in this.children )
        mine += this.children[i].getsumrealreal();
    return round(mine, 2);
}

node.prototype.sendinfotoserver = function() {
    $.ajax({
        "method": "POST",
        "url": "/node/update",
        "data": {
            "info": JSON.stringify(this.info)
        }
    })
}

node.prototype.removechild = function( childid ) {
    var todelete = []
    for( var i in this.children ) {
        if( this.children[i].info.id == childid )
            todelete.push( i );
    }

    for( var i in todelete )
        this.children.splice( todelete[i], 1 );

    for( var i in this.renderings )
        this.renderings[i].render_children()
}

node.prototype.addchild = function( newchild ) {
    this.children.push( newchild );
    newchild.parents.push( this );
}

$(document).ready( function() {
    $heading = $("<div class='heading'>").appendTo( $("body") );
    for( var i=parents.length-1; i>=0; i-- ) {
        $( "<a class='parent'>" )
            .html( parents[i].title )
            .attr( "href", "/tree/" + parents[i].id )
            .appendTo( $heading );
    }

    $cont = $("<div>").appendTo( $("body") );
    var root = new node(info);
    $cont.append( root.render() );
} );