
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function filter( parent ) {
    if( parent == "" ) {
        for( var i in elements )
            elements[i].$html.toggle( true );
        return;
    }

    for( var i in elements ) {
        parents = elements[i].info.parents;
        hasThatParent = false;
        for( var j in parents )
            if( parents[j].id == parent.id )
                hasThatParent = true;

        elements[i].$html.toggle( hasThatParent );
    }
}

var elements = [];

function el( info ) {
    var _this = this;

    elements.push( this );

    this.$html = $("<div>");
    this.info = info;

    var set_context_menu, unset_context_menu, $context_menu;

    $cm_button = $("<div class='button cm'>").appendTo( this.$html);
    $cm_button.on("click", function(e) {
        set_context_menu(e);
    });

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

        new_button( "doing now", function() {
            timer.start( _this );
        } );

        new_button( "add to today", function() {

        } );

        new_button( "go to tree", function() {
            window.location = "/tree/" + _this.info.id;
        })

        new_button( "close", function() {
        } );

        $cm_button.off( "click" )
        $cm_button.on( "click", unset_context_menu );
    }

    unset_context_menu = function(e) {
        $context_menu.remove();
        $cm_button.on( "click.cm", set_context_menu );
    }

    $amt_budget = $("<div class='amt budget'>").html( this.info.amt + " hours" );
    $amt_budget.appendTo( this.$html );

    this.$amt_used = $("<div class='amt used'>").appendTo( this.$html );
    this.$amt_used.update = function() {
        var used = _this.getsumrealreal();
        if ( used == 0 )
            _this.$amt_used.html( "" );
        else
            _this.$amt_used.html( used + " hours" );
    }
    this.$amt_used.update();

    $title = $("<div class='title'>").html( this.info.title );
    $title.appendTo( this.$html );

    for( var j in this.info.parents ) {
        if (j == 0) continue;
        $parent = $("<div class='parent'>").appendTo( this.$html );
        $parent.html( " < " + this.info.parents[j].title )
        var _p = this.info.parents[j];
        $parent.click( ( function(_p) {
            return function() {
                filter( _p );
            }
        } )(_p) );
    }
}

el.prototype.getsumrealreal = function() {
    var mine = this.info.used / 3600;
    for( var i in this.children )
        mine += this.children[i].getsumrealreal();
    return round(mine, 2);
}



$(document).ready( function() {
    $cont = $("<div>").appendTo( "body" );

    for( var i in info) {
        var newel = new el( info[i] );

        $cont.append( newel.$html );
    }
})