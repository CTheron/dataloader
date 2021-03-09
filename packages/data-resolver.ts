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

export async function dataResolver<E>(describe: IDescribe, row: E) {
    const { schema } = describe
    const rt:any = { ...row }
    return Object.keys(rt).reduce(async (pre, next) => {
        if (schema[next]) {
            const { key, loader } = schema[next]
            pre[next] = await Loader(loader)
                .loadMany([...rt[next]])
                ?.map((el: any) => (key ? el[key] : el)) || rt[next]
        } else {
            pre[next] = rt[next]
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
