var gulp = require('gulp'),
    yargs = require('yargs').argv,//获取运行gulp命令时附加的命令行参数
    replace = require('gulp-replace-task'),//对文件中的字符串进行替换
    browserSync = require('browser-sync'),//启动静态服务器
    livereload = require('gulp-livereload'),
    watch = require('gulp-watch'),
    browserify = require('browserify'),
    src = 'src',
    jsHint = require('gulp-jshint'),
    CONTEXT_PATH = '/',
    replace_patterns = [
        {
            match: 'CONTEXT_PATH',
            replacement: yargs.r ? CONTEXT_PATH : ''
        }
    ];

// 处理完JS文件后返回流
gulp.task('js', function () {
    return gulp.src('src/**/*.js')
            .pipe(jsHint({
                
            }))
            .pipe(jsHint.reporter('default'))

});



gulp.task('js-watch', browserSync.reload);

// startPath: 'src/step01.html?template=common|common|common&templateType=health&color=green'
gulp.task('server', function () {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: "./"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: 'src/productDetail.html?keyCode=NfaZsA'
    });
    gulp.watch("src/**/*", ['js-watch']);
});


gulp.task('default',['server'],function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});