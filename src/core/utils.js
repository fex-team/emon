var utils = Utils = Emon.Utils = {
    extend: function(t) {
        var a = arguments,
            notCover = this.isBoolean(a[a.length - 1]) ? a[a.length - 1] : false,
            len = this.isBoolean(a[a.length - 1]) ? a.length - 1 : a.length;
        for (var i = 1; i < len; i++) {
            var x = a[i];
            for (var k in x) {
                if (!notCover || !t.hasOwnProperty(k)) {
                    t[k] = x[k];
                }
            }
        }
        return t;
    },

    trim: function ( str ) {
        return str.replace( /(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '' );
    },
    each: function ( obj, iterator, context ) {
        if ( obj == null ) return;
        if ( obj.length === +obj.length ) {
            for ( var i = 0, l = obj.length; i < l; i++ ) {
                if ( iterator.call( context, i, obj[ i ], obj ) === false )
                    return false;
            }
        } else {
            for ( var key in obj ) {
                if ( obj.hasOwnProperty( key ) ) {
                    if ( iterator.call( context, key, obj[ key ], obj ) === false )
                        return false;
                }
            }
        }
    },

    keys: function ( plain ) {
        var keys = [];
        for ( var key in plain ) {
            if ( plain.hasOwnProperty( key ) ) {
                keys.push( key );
            }
        }
        return keys;
    },
    proxy: function ( fn, context ) {
        return function () {
            return fn.apply( context, arguments );
        };
    },
    indexOf: function ( array, item, start ) {
        var index = -1;
        start = this.isNumber( start ) ? start : 0;
        this.each( array, function ( v, i ) {
            if ( i >= start && v === item ) {
                index = i;
                return false;
            }
        } );
        return index;
    },
    argsToArray: function ( args,index ) {
        return Array.prototype.slice.call( args, index || 0 );
    },
    clonePlainObject:function (source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (utils.isObject(tmp) || utils.isArray(tmp)) {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clonePlainObject(source[i], target[i])
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    },
    compareObject:function(source,target){
        var tmp;
        if(this.isEmptyObject(source) !== this.isEmptyObject(target)){
            return false
        }
        if(this.getObjectLength(source) != this.getObjectLength(target)){
            return false;
        }
        for(var p in source){
            if(source.hasOwnProperty(p)){
                tmp = source[p];
                if(target[p] === undefined){
                    return false;
                }
                if (this.isObject(tmp) || this.isArray(tmp)) {
                    if(this.isObject(target[p]) !== this.isObject(tmp)){
                        return false;
                    }
                    if(this.isArray(tmp) !== this.isArray(target[p])){
                        return false;
                    }
                    if(this.compareObject(tmp, target[p]) === false){
                        return false
                    }
                } else {
                    if(tmp != target[p]){
                        return false
                    }
                }
            }
        }
        return true;
    },
    getObjectLength:function(obj){
        if (this.isArray(obj) || this.isString(obj)) return obj.length;
        var count = 0;
        for (var key in obj) if (obj.hasOwnProperty(key)) count++;
        return count;
    },
    isEmptyObject:function (obj) {
        if (obj == null) return true;
        if (this.isArray(obj) || this.isString(obj)) return obj.length === 0;
        for (var key in obj) if (obj.hasOwnProperty(key)) return false;
        return true;
    },

    loadFile:function () {
        var tmpList = [];

        function getItem(doc, obj) {
            try {
                for (var i = 0, ci; ci = tmpList[i++];) {
                    if (ci.doc === doc && ci.url == (obj.src || obj.href)) {
                        return ci;
                    }
                }
            } catch (e) {
                return null;
            }

        }

        return function (doc, obj, fn) {
            var item = getItem(doc, obj);
            if (item) {
                if (item.ready) {
                    fn && fn();
                } else {
                    item.funs.push(fn)
                }
                return;
            }
            tmpList.push({
                doc:doc,
                url:obj.src || obj.href,
                funs:[fn]
            });
            if (!doc.body) {
                var html = [];
                for (var p in obj) {
                    if (p == 'tag')continue;
                    html.push(p + '="' + obj[p] + '"')
                }
                doc.write('<' + obj.tag + ' ' + html.join(' ') + ' ></' + obj.tag + '>');
                return;
            }
            if (obj.id && doc.getElementById(obj.id)) {
                return;
            }
            var element = doc.createElement(obj.tag);
            delete obj.tag;
            for (var p in obj) {
                element.setAttribute(p, obj[p]);
            }
            element.onload = element.onreadystatechange = function () {
                if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                    item = getItem(doc, obj);
                    if (item.funs.length > 0) {
                        item.ready = 1;
                        for (var fi; fi = item.funs.pop();) {
                            fi();
                        }
                    }
                    element.onload = element.onreadystatechange = null;
                }
            };
//            element.onerror = function () {
//                throw Error('The load ' + (obj.href || obj.src) + ' fails,check the url settings of file ')
//            };
            doc.getElementsByTagName("head")[0].appendChild(element);
        }
    }(),
    clone:function (source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (typeof tmp == 'object') {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clone(source[i], target[i])
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    },
    unhtml:function (str, reg) {
        return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp);)?/g, function (a, b) {
            if (b) {
                return a;
            } else {
                return {
                    '<':'&lt;',
                    '&':'&amp;',
                    '"':'&quot;',
                    '>':'&gt;',
                    "'":'&#39;'
                }[a]
            }
        }) : '';
    }

};

Utils.each( [ 'String', 'Function', 'Array', 'Number', 'RegExp', 'Object' ], function ( i, v ) {
    Emon.Utils[ 'is' + v ] = function ( obj ) {
        return Object.prototype.toString.apply( obj ) == '[object ' + v + ']';
    }
} );