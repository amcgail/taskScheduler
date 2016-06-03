function el( info ) {
    var _this = this;

    this.$html = $("<div>");
    this.info = info;

    var set_context_menu, unset_context_menu;

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
            timer.start( _this.info );
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

    $title = $("<div class='amt budget'>").html( this.info.amt + " hours" );
    $title.appendTo( this.$html );

    $title = $("<div class='title'>").html( this.info.title );
    $title.appendTo( this.$html );

    for( var j in this.info.parents ) {
        if (j == 0) continue;
        $parent = $("<div class='parent'>").appendTo( this.$html );
        $parent.html( " < " + this.info.parents[j].title )
    }
}


$(document).ready( function() {
    $cont = $("<div>").appendTo( "body" );

    for( var i in info) {
        var newel = new el( info[i] );

        $cont.append( newel.$html );
    }
})