var awaitingInput = false;
var awaitingInputCallback = null;
var byid = {}

function round(value, decimals) {
    return value.toFixed( decimals );//Number(Math.round(value+'e'+decimals)+'e-'+decimals);
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
    $expandcontract.toggleClass( "haschildren", (this.children.length > 0));

    var $cm_button = $("<div class='button cm'>").appendTo($html);
    $cm_button.on("click", function(e) {
        set_context_menu(e);
    });



    var $title = $("<div class='title'>").appendTo( $html );
    var tit;
    if( typeof this.info.parents != 'undefined' ) {
        tit = "";
        for( var i=0; i<this.info.parents.length; i++ )
            tit += this.info.parents[i].title + " < ";
    } else {
        tit = this.info.title;
    }
    $title.html( tit );
    $title.click( function() {
        var newtitle = prompt( "Enter new title...", _this.info.title );
        if (newtitle == null) return;
        _this.info.title = newtitle;
        _this.sendinfotoserver();
        $title.html( _this.info.title );
    } )



    this.$amt_used_day = $("<div class='amt used'>").appendTo( $html );
    this.$amt_used_day.update = function() {
        var used = _this.getsumrealreal_day();
        if ( used == 0 )
            _this.$amt_used_day.html( "" );
        else
            _this.$amt_used_day.html( round(used,2) );
    }
    this.$amt_used_day.update();


    this.$amt_used_week = $("<div class='amt used'>").appendTo( $html );
    this.$amt_used_week.update = function() {
        var used = _this.getsumrealreal_week();
        if ( used == 0 )
            _this.$amt_used_week.html( "" );
        else
            _this.$amt_used_week.html( round(used,2) );
    }
    this.$amt_used_week.update();


    this.$amt_used = $("<div class='amt used'>").appendTo( $html );
    this.$amt_used.update = function() {
        var used = _this.getsumrealreal();
        if ( used == 0 )
            _this.$amt_used.html( "" );
        else
            _this.$amt_used.html( round(used,2) );
    }
    this.$amt_used.update();

    var $amt_budget = $("<div class='amt budget'>").appendTo( $html );

    // Just for now. Database stupidity
    if (this.info.amt == null)
        this.info.amt = 0

    $amt_budget.update = function() {
        $amt_budget.html( _this.info.amt  );
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
            _this.$amt_sum.html( round(sum,2));
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

    set_context_menu = cmfn(this, $cm_button, render_children);

    unset_context_menu = function(e) {
        $context_menu.remove();
        $cm_button.on( "click.cm", set_context_menu );
    }

    render_children();
    if( localStorage[ "toggle:" + _this.info.id ] == "true" )
        toggle_children();

    this.renderings.push( {
        html:$html,
        render_children:render_children,
        $expandcontract:$expandcontract
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
    return mine;
}

node.prototype.getsumrealreal_week = function() {
    var mine = this.info.used_week / 3600;
    for( var i in this.children )
        mine += this.children[i].getsumrealreal_week();
    return mine;
}

node.prototype.getsumrealreal_day = function() {
    var mine = this.info.used_day / 3600;
    for( var i in this.children )
        mine += this.children[i].getsumrealreal_day();
    return mine;
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

    for( var i in this.renderings ) {
        this.renderings[i].render_children();
        this.renderings[i].$expandcontract.toggleClass( "haschildren", (this.children.length > 0));
    }
}

node.prototype.addchild = function( newchild ) {
    this.children.push( newchild );
    newchild.parents.push( this );

    for( var i in this.renderings ) {
        this.renderings[i].render_children();
        this.renderings[i].$expandcontract.toggleClass( "haschildren", (this.children.length > 0));
    }
}

$(document).ready( function() {
    $heading = $("<div class='heading'>").appendTo( $("body") );
    $heading.html( "Your quicklists below:" );

    $cont = $("<div>").appendTo( $("body") );

    //First so it's above everything
    $cont.append(
        $("<div class='amtrule a'>"),
        $("<div class='amtrule b'>"),
        $("<div class='amtrule c'>"),
        $("<div class='amtrule d'>"),
        $("<div class='amtrule e'>")
    )

    for( var i=0; i<info.length; i++ ) {
        info[i]['used'] = 0;
        info[i]['used_day'] = 0;
        info[i]['used_week'] = 0;
        $cont.append( (new node(info[i])).render() )
    }
} );