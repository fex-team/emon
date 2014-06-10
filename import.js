/**
 * 开发版本的文件导入
 */
(function () {
    var paths = [
        'core/emon.js',
        'core/Class.js',
        'core/browser.js',
        'core/utils.js',
        'core/module.js',
        'core/editor.js',
        'core/command.js',
        'core/dtd.js',
        'core/module.js',
        'core/event.js',
        'core/domUtils.js',
        'core/selection.js',
        'core/range.js',
        'core/editor.event.js',
        'core/editor.module.js',
        'core/editor.command.js',
        'core/selection.js',
        'core/keymap.js',
        'core/editor.lang.js',
        'core/editor.defaultoptions.js'

    ],
    baseURL = 'src/', doc = document;
    while (paths.length) {
        doc.write('<script type="text/javascript" src="' + baseURL + paths.shift() + '"></script>');
    }
})();