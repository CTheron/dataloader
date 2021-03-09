// 后台指定元模型字段配置参数(可扩展)
export type ModelPropertyDTO = {
    property_name: string;
    property_label: string;
    property_tag: string;
    property_type: string;
    validate_rule: string;
    properties?: { [key: string]: ModelPropertyDTO };
}

export enum BusinessModel {
    User = 'user'
}

export enum EAggType {
    User = 'user',
}

export const showField: { [key: string]: string } = {
    user: 'name',
}

export interface ILoaderDto {
    [key: string]: {
        loader: EAggType;
        key: string;
    };
}

export interface IDescribe {
    model?: string; // 指定元模型
    schema: ILoaderDto; // 字段配置类型
}