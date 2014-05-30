/**
 * 开发版本的文件导入
 */
(function (){
    var paths  = [
            'src/core/emon.js'
        ],
        baseURL = getBaseBir();

    for (var i=0,pi;pi = paths[i++];) {
        document.write('<script type="text/javascript" src="'+ baseURL + pi +'"></script>');
    }

    function getBaseBir(){
        var srcipts = document.getElementsByTagName('script'),
            src = srcipts[srcipts.length - 1].src;

        if (src) {
            var a = document.createElement('a');
            a.href = src;
            a.href = a.href;
            return a.protocol + '//' + a.host + a.pathname.substr(0, a.pathname.lastIndexOf('/') + 1);
        }
        return '';
    }

})();
