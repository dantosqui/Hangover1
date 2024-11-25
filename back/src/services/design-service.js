
import { DesignRepository } from "../../repositories/design-repository.js";

export default class DesignService {
    constructor (){
        this.bd = new DesignRepository();
    }

    async get(userId, designId){
        const response = await this.bd.get(userId, designId);
        return response;
    }

    async save(userId, designId, images,data){
        const response = await this.bd.save(userId, designId, images,data);
        return response;
    }
}