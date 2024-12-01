
import { DesignRepository } from "../../repositories/design-repository.js";

export default class DesignService {
    constructor (){
        this.bd = new DesignRepository();
    }

    async get(userId, designId){
        const response = await this.bd.get(userId, designId);
        return response;
    }

    async save(userId, designId, front_image, back_image,data){
        const response = await this.bd.save(userId, designId, front_image, back_image,data);
        return response;
    }
}