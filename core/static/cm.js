function cmfn(_this, $cm_button, render_children) {

    var set_context_menu;
    var unset_context_menu = function(e) {
        $context_menu.remove();
        $cm_button.on( "click.cm", set_context_menu );
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
            return $btn;
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

        var $add_to_today;
        $add_to_today = new_button( "add to today", function() {
            $.ajax( {
                "data": {
                    "id": _this.info.id
                },
                //this actually adds and removes from today
                "url": "/quicklists/addtotoday",
                "method": "POST",
                "success": function( resp ) {
                    if( _this.info.in_today ) {
                        $add_to_today.html("add from today");
                        _this.info.in_today = false;
                    } else {
                        $add_to_today.html("remove from today");
                        _this.info.in_today = true;
                    }
                }
            } );
        });

        if(_this.info.in_today)
            $add_to_today.html("remove from today");


        new_button( "duplicate me", function() {
            $.ajax( {
                "method": "POST",
                "url": "/node/duplicate",
                "data": {
                    "id":_this.info.id
                },
                "success": function(resp) {
                    var newchild = new node( _this.info );

                    var recurse = function( me, twin ) {
                        for( var i in me.children ) {
                            newnode = new node( me.children[i].info );
                            newnode.info.used = 0;
                            twin.addchild( newnode );

                            recurse( me.children[i], newnode );
                        }
                    }
                    newchild.info.used = 0;

                    _this.parents[0].addchild( newchild );
                }
            } );
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
            timer.start( _this );
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
    };

    return set_context_menu;
};