import pg from 'pg';
import { DBConfig } from "./dbconfig.js";

export class DesignRepository {
    constructor() {
        const { Client } = pg;
        this.DBClient = new Client(DBConfig);
        this.DBClient.connect();
    }

    async get(userId, designId) {
        const sql = `SELECT 
        json_build_object (
            'front_image', front_image,
            'back_image',back_image
            'design_data', design_data
        ) AS info FROM designs WHERE id_creator_user = $1 AND id = $2`;
        const values = [userId, designId];
        
        const design = (await this.DBClient.query(sql, values)).rows[0];
        
        if(design){
            return JSON.stringify(design);
        }
        else{
            return false;
        }
    }

    async save(userId, designId, front_image,back_image,data){
        let sql;
        let values;

    
        if(designId === undefined){
            sql = "INSERT INTO designs (last_edit, id_creator_user,parent_id,front_image,back_image,design_data) VALUES (CURRENT_TIMESTAMP, $1, null, $2,$3,$4) returning id";
            values = [userId, front_image,back_image,data];
        }
        else{
            sql = "UPDATE designs SET front_image = $3, back_image = $4, last_edit = CURRENT_TIMESTAMP, design_data=$5 WHERE id_creator_user = $1 AND id = $2 returning id";
            values = [userId, designId, front_image,back_image,data];
        }
        
        
        const saved = await this.DBClient.query(sql, values);
          // Esto imprimirá las filas retornadas
        return saved.rows[0].id;
    }
}
   
   
   /* import pg from 'pg';
    import { DBConfig } from "./dbconfig.js";

    export class DesignRepository {
        constructor() {
            const { Client } = pg;
            this.DBClient = new Client(DBConfig);
            this.DBClient.connect();
        }

        async get(userId, designId) {
            const sql = `SELECT 
            json_build_object (
                'image', image,
                'design_data', design_data
            ) AS info FROM designs WHERE id_creator_user = $1 AND id = $2`;
            const values = [userId, designId];
            
            const design = (await this.DBClient.query(sql, values)).rows[0];
            console.log(design);
            if(design){
                return JSON.stringify(design);
            }
            else{
                return false;
            }
        }

        async save(userId, designId, image,data){
            let sql;
            let values;

            if(!designId === false){
                sql = "INSERT INTO designs (last_edit, id_creator_user,parent_id,image,design_data) VALUES (CURRENT_TIMESTAMP, $1, null, $2,$3) returning id";
                values = [userId, image,data];
            }
            else{   
                sql = "UPDATE designs SET image = $3, last_edit = CURRENT_TIMESTAMP, design_data=$4 WHERE id_creator_user = $1 AND id = $2 returning id";
                values = [userId, designId, image,data];
            }
            
            
            const saved = await this.DBClient.query(sql, values);
            console.log(saved.rows.length > 0);  // Esto imprimirá las filas retornadas
            return saved.rows.length > 0;
        }
    }*/