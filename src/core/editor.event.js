// 事件机制
Emon.extendClass( EmonEditor, {
    _initEvents: function () {
        this._eventCallbacks = {};
        this._bindEvents();
    },
    _bindEvents: function () {
        var me = this,
            doc = me.document,
            win = me.window;
        me._proxyDomEvent = utils.bind(me._proxyDomEvent, me);
        domUtils.on(doc, ['click', 'contextmenu', 'mousedown', 'keydown', 'keyup', 'keypress', 'mouseup', 'mouseover', 'mouseout', 'selectstart'],  this._firePharse.bind( this ));
        domUtils.on(win, ['focus', 'blur'],  this._firePharse.bind( this ));
        domUtils.on(me.body,'drop',function(e){
            //阻止ff下默认的弹出新页面打开图片
            if(browser.gecko && e.stopPropagation) { e.stopPropagation(); }
            me._interactChange(e)
        });
        domUtils.on(doc, ['mouseup', 'keydown'], function (evt) {
            //特殊键不触发selectionchange
            if (evt.type == 'keydown' && (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)) {
                return;
            }
            if (evt.button == 2)return;
            me._interactChange(evt)
        });

    },
    _resetEvents: function () {
        this._initEvents();
        this._bindEvents();
    },


    _firePharse: function ( e ) {
//        //只读模式下强了所有的事件操作
//        if(this.readOnly === true){
//            return false;
//        }
        var beforeEvent, preEvent, executeEvent;

        if ( e.type == 'DOMMouseScroll' ) {
            e.type = 'mousewheel';
            e.wheelDelta = e.originEvent.wheelDelta = e.originEvent.detail * 120;
        }

        beforeEvent = new EmonEvent( 'before' + e.type, e, true );
        if ( this._fire( beforeEvent ) ) {
            return;
        }
        preEvent = new EmonEvent( 'pre' + e.type, e, false );
        executeEvent = new EmonEvent( e.type, e, false );

        this._fire( preEvent );
        this._fire( executeEvent );
        this._fire( new EmonEvent( 'after' + e.type, e, false ) );

        if ( ~'mousedown mouseup keydown keyup'.indexOf( e.type ) ) {
            this._interactChange( e );
        }
    },
    _interactChange: function ( e ) {
        var me = this;

        clearTimeout( this._interactTimeout );
        this._interactTimeout = setTimeout( function () {
            var stoped = me._fire( new EmonEvent( 'beforeinteractchange' ) );
            if ( stoped ) {
                return;
            }
            me._fire( new EmonEvent( 'preinteractchange' ) );
            me._fire( new EmonEvent( 'interactchange' ) );
        }, 20 );
    },
    _listen: function ( type, callback ) {
        var callbacks = this._eventCallbacks[ type ] || ( this._eventCallbacks[ type ] = [] );
        callbacks.push( callback );
    },
    _fire: function ( e ) {


        var status = this.getStatus();

        var callbacks = this._eventCallbacks[ e.type.toLowerCase() ] || [];

        if ( status ) {

            callbacks = callbacks.concat( this._eventCallbacks[ status + '.' + e.type.toLowerCase() ] || [] );
        }



        if ( callbacks.length === 0 ) {
            return;
        }
        var lastStatus = this.getStatus();

        for ( var i = 0; i < callbacks.length; i++ ) {

            callbacks[ i ].call( this, e );


            if ( this.getStatus() != lastStatus || e.shouldStopPropagationImmediately() ) {
                break;
            }
        }
        return e.shouldStopPropagation();
    },
    on: function ( name, callback ) {
        var km = this;
        utils.each( name.split( /\s+/ ), function ( i, n ) {
            km._listen( n.toLowerCase(), callback );
        } );
        return this;
    },
    off: function ( name, callback ) {

        var types = name.split( /\s+/ );
        var i, j, callbacks, removeIndex;
        for ( i = 0; i < types.length; i++ ) {

            callbacks = this._eventCallbacks[ types[ i ].toLowerCase() ];
            if ( callbacks ) {
                removeIndex = null;
                for ( j = 0; j < callbacks.length; j++ ) {
                    if ( callbacks[ j ] == callback ) {
                        removeIndex = j;
                    }
                }
                if ( removeIndex !== null ) {
                    callbacks.splice( removeIndex, 1 );
                }
            }
        }
    },
    fire: function ( type, params ) {
        var e = new EmonEvent( type, params );
        this._fire( e );
        return this;
    },
    trigger : function(type,params){
        return this.fire(type,params)
    }
} );