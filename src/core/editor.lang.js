//添加多语言模块
Emon.extendClass( EmonEditor, {
    getLang: function ( path ) {

        var lang = EM.LANG[ this.getOptions( 'lang' ) ];
        if ( !lang ) {
            throw Error( "not import language file" );
        }
        path = ( path || "" ).split( "." );
        for ( var i = 0, ci; ci = path[ i++ ]; ) {
            lang = lang[ ci ];
            if ( !lang ) break;
        }
        return lang;
    }
} );