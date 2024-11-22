export class User {
    constructor(id, username, first_name, last_name, email, password, date_of_birth, description, profile_photo, role_id) {
        this.id = id;
        this.username = username;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.date_of_birth = date_of_birth;
        this.description = description;
        this.profile_photo = profile_photo;
        this.role_id = role_id;
    }
}