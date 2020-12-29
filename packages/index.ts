import DataLoader from 'dataloader'
import * as Users from './resolvers/user'


export const Loader: any = {
    [Users.name]: new DataLoader(Users.resolver,Users.options)
}