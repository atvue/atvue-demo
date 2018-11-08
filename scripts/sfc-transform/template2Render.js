const compiler = require( 'vue-template-compiler' )
const transpile = require('vue-template-es2015-compiler')
const NullSFCScriptExport = 'export default {}'
const babel = require( '@babel/core' )
const babelPluginImportBview = require( '../babel-helper/babel-plugin-import-bview' )
const babelPluginDefault2Export = require( '../babel-helper/babel-plugin-default2export' )
/**
 * 1、parse function do template scritpt -> vue Object literal
 
 * 2、script part
    * do two things

    * 2.1、import { Button } from 'bview';   ->   import Buttom from '@/components/button'
    
    * 2.2、export default {                       export const demo = {
            components: {                               components: {
                Button ,                     ->              Button ,
            }                                           }
        }                                         }
 * 
 */
const parse = content => {
    return new Promise( ( r , j ) => {
        if ( content === undefined || content === null || content.trim() === '' ) {
            return j( new Error( '解析的vue文件内容不能为空' ) )
        }
        let vueDescriptor = compiler.parseComponent( content ) ,
            { template, script } = vueDescriptor,
            scriptTxt = script ? script.content : NullSFCScriptExport ,
            templateTxt = template ? template.content : '' ,
            result = compiler.compile( templateTxt ),
            { render , errors } = result ,
            toFuncRender = transpile( `function render () { ${ render } }` )
        if ( errors.length > 0 ) {
            let parseTemplateError = new Error( `编译vue的template文件出错，${errors}` )
            return j( parseTemplateError )
        }
        babel.transformAsync( scriptTxt , {
            ast: true ,
            code: false ,
            sourceType: 'module' ,
            plugins:[
                [ babelPluginImportBview , { libraryName: 'bview' } ] ,
                [ babelPluginDefault2Export , { render: toFuncRender } ] ,
            ]
        } ).then( ( { ast } ) => {
            babel
                .transformFromAstAsync( ast )
                .then( ( { code } ) => {
                    r( code )
                } )
                .catch( j )
        } )
        .catch( j )
    } )
}
/* 
const tmp = `<template>
    <div>
        <Button type="primary">Primary</Button>
        <Button>Default</Button>
        <Button type="dashed">Dashed</Button>
        <Button type="danger">Danger</Button>
    </div>
</template>

<script>
import { Button , Modal } from 'bview'
export default {
    components: { Button } ,
}
</script>
`
parse( tmp ).then( data => {
    console.log( data )
} ) */


exports.parse = parse