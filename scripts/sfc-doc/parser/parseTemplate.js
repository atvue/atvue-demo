const slotDefaultName = 'default'

function walk( node , slotsRes ) {
    // debugger;
    let { children } = node;
    if (children !== undefined && children.length > 0) {
        children.forEach((ele, index, array) => {
            if (ele.tag === 'slot') {
                let { children, attrsMap } = ele;

                // slot 关键属性
                // 名称：匿名 or 具名 -> attrsMap是否有name属性
                // 其他属性原样拼接到description
                let otherAttrs = [];
                if (attrsMap !== undefined) {
                    Object.keys(attrsMap).forEach(k => {
                        if (k !== 'name') {
                            otherAttrs.push(`${k}: ${attrsMap[k]}`);
                        }
                    });
                }
                // debugger;
                let slot = {
                    children,
                    attrsMap,
                    describe: undefined,
                    isAnonymous: attrsMap.name !== undefined ? false : true,
                    name: attrsMap.name !== undefined ? attrsMap.name : slotDefaultName
                };
                // slot说明查找上一个comment节点
                try {
                    let commentNode = array[index - 1];
                    // debugger;
                    if ( commentNode && commentNode.isComment ) {
                        slot.describe = commentNode.text;
                    }
                } catch (error) {
                    console.log( error )
                }
                // 追加slot上的其他属性
                if (otherAttrs.length > 0) {
                    slot.describe = `${
                        slot.describe
                    }，slot上其他属性：${otherAttrs.join('，')}`;
                }
                slotsRes.push(slot);
                // slot不再继续遍历子元素
            } else {
                walk( ele , slotsRes );
            }
        });
    }
}


module.exports = astTpl => {
    let slotsRes = [];
    if ( astTpl ) {
        walk( astTpl , slotsRes ) ;
    } else {
        console.warn( `sfc-doc/parse/parseTemplate.js astTpl = ` , astTpl )
    }
    // debugger;
    return slotsRes;
};
