import {DataSource} from 'typeorm';
import {UserEntity} from '../entity/user.entity.js';


export const myDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "200593",
    database: "untitled6",
    entities: [UserEntity],
    logging: true,
    synchronize: true,
})