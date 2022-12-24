const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
// const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webpCss = require('gulp-webp-css')
const nunjucksRender = require('gulp-nunjucks-render');
const webpHtmlNosvg = require('gulp-webp-html-nosvg')
const del = require('del');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');



function browsersync() {
    browserSync.init({
        server: {
            baseDir: "dist/"
        }
    });
};

function fileincludehtml() {
    return src(['app/index.html'])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        
        .pipe(dest('dist/'))
};
// function nunjucks() {
//     return src('app/*.njk')
//         .pipe(nunjucksRender())
//         .pipe(dest('app'))
//         .pipe(browserSync.stream())
// };
function styles() {
    return src([
        'app/scss/style.scss',
    ])
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(webpCss())
        .pipe(dest('app/css'))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream())
        


}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/jq-accordion/src/js/jquery.accordion.js',
        'app/js/main.js',

    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(dest('dist/js'))
}


function imagesbuild() {
    return src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))

        .pipe(dest('dist/images'))
}

function webpHtml() {
    return src('./app/**.*.html')
        .pipe(webpHtmlNosvg())
        .pipe(dest('dist'))
}
function webpcss() {
    return src('app/css/style.min.css')
        .pipe(webpCss())
        .pipe(dest('dist/css/'))
}
function webpimage() {
    return src('app/images/**/*.*')
        .pipe(newer("app/images/**/*.*"))
        .pipe(webp())
        .pipe(dest('dist/images/'))
}
function fonts() {
    return src('app/fonts/*.*')
        .pipe(dest('dist/fonts'))
}
function build() {
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js'
    ], { base: 'app' })
        .pipe(webpHtmlNosvg())
        .pipe(webp())
        .pipe(dest('dist'))
}

function cleanDist() {
    return del('dist')
}

function waching() {
    watch(['app/scss/**/*.scss', 'app/style/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
   
    watch(['app/**/*.html'], fileincludehtml);
    watch(['app/images/**/*.*'], imagesbuild)
    // watch(['app/**/*.html'], webpHtml);
    watch(['app/**/*.html']).on('change', browserSync.reload);


}


exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.waching = waching;
exports.imagesbuild = imagesbuild;
exports.fileincludehtml = fileincludehtml;
exports.cleanDist = cleanDist;
exports.webpHtml = webpHtml
exports.webpcss = webpcss
exports.fonts = fonts


exports.webpimage = webpimage
exports.build = series(cleanDist, imagesbuild, build, webpimage, webpcss, fonts);


exports.default = parallel(fileincludehtml, styles, scripts,fonts, imagesbuild,  browsersync, waching);