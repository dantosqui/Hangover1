class Pagination {
    static BuildPagination(collection, limit, page, total){
        return {
            
            collection: collection,
            pagination: {
                limit: limit, 
                page: page,
                nextPage: this.VerifyTotal(limit, parseInt(page)+1, total),
                total: total
            }

            //offset+1*limit menor / menor o igual al total?
        };
        
    }

    static VerifyTotal(limit, page, total){
        return (parseInt(page))*limit < total;
    }

    
}

export default Pagination