import { Options, BatchLoadFn } from 'dataloader'

export const name = 'User'

export const resolver: BatchLoadFn<any, any> = (keys: number[]) => {
  return Promise.all([...keys])
}

export const options: Options<any, any> = {
    cache: true,
}
