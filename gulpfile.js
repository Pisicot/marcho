const { src, dest, watch, parallel, series } = require("gulp");

const scss         = require("gulp-sass")(require('sass'));
const concat       = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const uglify       = require("gulp-uglify");
const imagemin     = require("gulp-imagemin");
const del          = require("del");
const browserSync  = require("browser-sync").create();

function browsersync () {
    browserSync.init ({
        server: {
            baseDir: 'app/'
        },
        notify: false
    })
}

function styles() {
    return src("app/scss/style.scss") // для одного файла
        /* src (
            [
                "app/scss/style.scss",
                "app/scss/main.scss"   // для объединения несколькик файлов в один с помощью gulp-concat
            ]
        ) */
        .pipe(scss({outputStyle: "compressed"})) // для .min.css
        //.pipe(scss({outputStyle: "expanded"})) // развернутый(нормальный) css
        //.pipe(scss()) // просто переводит в css как написано в scss
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
} 

function img () {
    return src('app/img/**/*.*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {
                    name: 'removeViewBox',
                    active: true
                },
                {
                    name: 'cleanupIDs',
                    active: false
                }
            ]
        })
    ]))
    .pipe(dest('dist/img'))
}

function build () {
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js',
    ],
    {base: 'app'}
    )
    .pipe(dest('dist'))
}

function cleanDist() {
    return del('dist')
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.img = img;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, img, build);

exports.default = parallel (styles, scripts, browsersync, watching);
