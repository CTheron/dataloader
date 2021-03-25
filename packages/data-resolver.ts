import { from, of, Observable, forkJoin } from 'rxjs'
import { map, filter, concatMap, reduce, expand } from 'rxjs/operators'
import { camelCase } from 'lodash'
import api from './schema.json'
import { Loader } from './index'
import { ModelPropertyDTO, EAggType, IDescribe, showField, ILoaderDto } from './types'

const AGG_TYPES = Object.values(EAggType)


const getSchema = async () => {
  return api as unknown as ModelPropertyDTO
}


/** 数据恢复
 * @param 字段类型
 * @returns 每行的恢复数据
 */
export async function dataResolver(describe: IDescribe, row:any) {
    const { schema } = describe
    return Object.keys(row).reduce((pre, next) => {
        if (schema[next]) {
            const { loader } = schema[next]
            let mapArray = []
            const toString = Object.prototype.toString
            switch (toString.call(row[next])) {
                case '[object Array]':
                    mapArray = [...row[next]]
                    break
                default:
                    mapArray = [row[next]]
                    break
            }
            Loader[loader].loadMany(mapArray).then((e: any[]) => {
                pre[next] = e
            })
        } else {
            pre[next] = row[next]
        }
        return pre
    }, {} as { [key: string]: any })
}

/** Sync Observable
 * It will transform schema to a new object
 * @param properties origin schema
 * @returns Observable
 */
const schemaDto$: (properties: ModelPropertyDTO[]) => Observable<ILoaderDto> = (properties) =>
    from(properties).pipe(
        expand((prop: ModelPropertyDTO) => from(Object.values(prop.properties || {})).pipe(
            map(subProp => ({
                ...subProp,
                property_name: `${prop.property_name}.${subProp.property_name}`,
            }))
        )),
        filter(prop => {
            const propTag = camelCase(prop.property_tag) as EAggType
            return AGG_TYPES.includes(propTag)
        }),
        reduce((memo: ILoaderDto, prop: ModelPropertyDTO) => {
            const propTag = camelCase(prop.property_tag) as EAggType
            return {
                ...memo,
                [prop.property_name]: {
                    loader: propTag,
                    key: showField[prop.property_tag],
                },
            }
        }, {})
    )
