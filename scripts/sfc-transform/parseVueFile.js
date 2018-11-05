const compiler = require('vue-template-compiler');
var transpile = require('vue-template-es2015-compiler');

const babel = require('@babel/core');
const babelPluginInsertVueTemplate = require('./babel-plugin-insert-vue-template');
const NullSFCScriptExport = 'export default {}'
function toFunction(code) {
    return transpile('function render () {' + code + '}');
}

module.exports = function(content) {
    return new Promise((resolve, reject) => {
        if (content === '' || content === null || content.trim() === '') {
            throw 'parseVueFile 请填入需要转换vue的SFC文件内容';
        }
        let vueDescriptor = compiler.parseComponent(content), // , { pad: 'line' }
            { template, script } = vueDescriptor,
            scriptTxt = script ? script.content : NullSFCScriptExport ,
            templateTxt = template ? template.content : '' ,
            result = compiler.compile(templateTxt),
            { render, errors } = result;

        let toFuncRender = toFunction(render);
        // console.log(toFuncRender);

        let optoins = {
            ast: true,
            code: false,
            sourceType: 'module',
            plugins: [
                [
                    '@babel/plugin-transform-modules-commonjs',
                    { strictMode: true }
                ],
                [babelPluginInsertVueTemplate, { renderBody: toFuncRender }]
            ]
        };
        if (errors.length > 0) {
            throw `编译vue的template文件出错，${errors}`;
        }
        babel
            .transformAsync(scriptTxt, optoins)
            .then(({ ast }) => {
                babel
                    .transformFromAstAsync(ast)
                    .then(({ code }) => {
                        resolve(code);
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
};
