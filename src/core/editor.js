var EmonEditor = Emon.EmonEditor = Emon.createClass( "EmonEditor", {
    constructor: function () {
        var _guid = 0;
        return  function(id,options){
            this.guid = 'EmonEditor' + _guid++;

            this._options = utils.extend( window.EMON_CONFIG || {}, options );

            this.setOption( EM.defaultOptions,true );

            this._rootContainer = utils.isString(id) ? document.getElementById(id) : id;

            this._initContainer();

            Emon.instants[this.guid] = this;
        }

    }(),

    _initContainer:function(){
        var me = this;


        me._rootContainer.style.zIndex = me.getOption('zIndex');

        var _html = ( ie && browser.version < 9  ? '' : '<!DOCTYPE html>') +
            '<html xmlns=\'http://www.w3.org/1999/xhtml\' class=\'view\' ><head>' +
            '<style type=\'text/css\'>' +
            //设置四周的留边
            '.view{padding:0;word-wrap:break-word;cursor:text;height:90%;}\n' +
            //设置默认字体和字号
            //font-family不能呢随便改，在safari下fillchar会有解析问题
            'body{margin:8px;font-family:sans-serif;font-size:16px;}' +
            //设置段落间距
            'p{margin:5px 0;}</style>' +
            (me.getOption('initialStyle') ? '<style>' + me.getOption('initialStyle') + '</style>' : '') +
            '</head><body class=\'view\' ></body>' +
            '<script type=\'text/javascript\' ' + (ie ? 'defer=\'defer\'' : '' ) +' id=\'_initialScript\'>' +
            'setTimeout(function(){editor = window.parent.EM.instants[\'' + me.guid + '\'];editor._initSetup(document);},0);' +
            'var _tmpScript = document.getElementById(\'_initialScript\');_tmpScript.parentNode.removeChild(_tmpScript);</script></html>';
        me._rootContainer.appendChild(domUtils.createElement(document, 'iframe', {
                id: 'ueditor_' + me._guid,
                width: "100%",
                height: "100%",
                frameborder: "0",
                src: 'javascript:void(function(){document.open();' +
                    'document.write("' + _html + '");document.close();}())'
            }));
        me._rootContainer.style.overflow = 'hidden';


    },
    _initQuote : function(doc){
        var me = this;
        if (ie) {
            doc.body.disabled = true;
            doc.body.contentEditable = true;
            doc.body.disabled = false;
        } else {
            doc.body.contentEditable = true;
        }
        doc.body.spellcheck = false;
        me.document = doc;
        me.window = doc.defaultView || doc.parentWindow;
        me.iframe = me.window.frameElement;
        me.body = doc.body;
    },
    _initSetup : function(doc){

        this._initQuote(doc);

        this._initEvents();

        this._initSelection();

        this._initStatus();

        this._initShortcutKey();

        this._initContextmenu();

        this._initModules();

        this._initContent();

        if ( this.getOption( 'readOnly' ) === true ) {
            this.setDisabled();
        }
        this.fire( 'ready' );
    },
    _initSelection : function(){
        this.selection = new Emon.Selection(this.document);
    },

    _initContent:function(){

    },
    getOption: function ( key ) {
        return key ? this._options[key] : this._options;
    },

    setOption: function ( key, val,notCover ) {
        var obj = {};
        if (utils.isString(key)) {
            obj[key] = val
        } else {
            obj = key;
            notCover = val;
        }
        utils.extend(this._options, obj, !notCover);
    },


    _initShortcutKey: function () {
        this._shortcutkeys = {};
        this._bindshortcutKeys();
    },

    addShortcutKeys: function ( cmd, keys ) {
        var obj = {}, km = this;
        if ( keys ) {
            obj[ cmd ] = keys
        } else {
            obj = cmd;
        }
        utils.each( obj, function ( k, v ) {
            km._shortcutkeys[ k.toLowerCase() ] = v;
        } );

    },
    getShortcutKey: function ( cmdName ) {
        return this._shortcutkeys[ cmdName ]
    },
    _bindshortcutKeys: function () {
        var me = this,
            shortcutkeys = this._shortcutkeys;

        function checkkey( key, keyCode, e ) {
            switch ( key ) {
                case 'ctrl':
                case 'cmd':
                    if ( e.ctrlKey || e.metaKey ) {
                        return true;
                    }
                    break;
                case 'alt':
                    if ( e.altKey ) {
                        return true
                    }
                    break;
                case 'shift':
                    if ( e.shiftKey ) {
                        return true;
                    }

            }
            if ( keyCode == keymap[ key ] ) {
                return true;
            }
            return false
        }
        me.on( 'keydown', function ( e ) {

            var originEvent = e.originEvent;
            var keyCode = originEvent.keyCode || originEvent.which;
            for ( var i in shortcutkeys ) {
                var keys = shortcutkeys[ i ].toLowerCase().split( '+' );
                var current = 0;
                utils.each( keys, function ( i, k ) {
                    if ( checkkey( k, keyCode, originEvent ) ) {
                        current++;
                    }
                } );

                if ( current == keys.length ) {
                    if ( me.queryCommandState( i ) != -1 )
                        me.execCommand( i );
                    originEvent.preventDefault();
                    break;
                }

            }
        } );
    },
    _initContextmenu: function () {
        this.contextmenus = [];
    },
    addContextmenu: function ( item ) {
        if ( utils.isArray( item ) ) {
            this.contextmenus = this.contextmenus.concat( item );
        } else {
            this.contextmenus.push( item );
        }

        return this;
    },
    getContextmenu: function () {
        return this.contextmenus;
    },
    _initStatus: function () {
        this._status = "normal";
        this._rollbackStatus = "normal";
    },
    setStatus: function ( status ) {
        if ( status ) {
            this._rollbackStatus = this._status;
            this._status = status;
        } else {
            this._status = '';
        }
        return this;
    },
    rollbackStatus: function () {
        this._status = this._rollbackStatus;
    },
    getStatus: function () {
        return this._status;
    },
    setDisabled: function () {
        var me = this;
        //禁用命令
        me.bkqueryCommandState = me.queryCommandState;
        me.bkqueryCommandValue = me.queryCommandValue;
        me.queryCommandState = function ( type ) {
            var cmd = this._getCommand( type );
            if ( cmd && cmd.enableReadOnly === false ) {
                return me.bkqueryCommandState.apply( me, arguments );
            }
            return -1;
        };
        me.queryCommandValue = function ( type ) {
            var cmd = this._getCommand( type );
            if ( cmd && cmd.enableReadOnly === false ) {
                return me.bkqueryCommandValue.apply( me, arguments );
            }
            return null;
        };
        this.setStatus( 'readonly' );


        me.fire( 'interactchange' );
    },
    setEnabled: function () {
        var me = this;

        if ( me.bkqueryCommandState ) {
            me.queryCommandState = me.bkqueryCommandState;
            delete me.bkqueryCommandState;
        }
        if ( me.bkqueryCommandValue ) {
            me.queryCommandValue = me.bkqueryCommandValue;
            delete me.bkqueryCommandValue;
        }

        this.rollbackStatus();

        me.fire( 'interactchange' );
    }
} );
