using {sec as mysec} from '../models/sec-users';

@impl: 'src/api/controllers/sec-users-controller.js'

service UsersRoute @(path:'/api/users') {

    entity users as projection on mysec.users;

    @Core.Description: 'get-all-users'
    @path: 'getallusers'
        function getallusers()
        returns array of users;

    @Core.Description: 'add-one-user'
    @path: 'addoneuser'
        action addoneuser(user: users)
        returns array of users;
    
    @Core.Description: 'update-one-user'
    @path: 'updateoneuser'
        action updateoneuser(user: users)
        returns array of users;

    @Core.Description: 'delete-logical-user'
    @path :'deluserlogically'
        action deluserlogically(USERID: String) 
        returns array of users;
    
    @Core.Description: 'delete-physical-user'
    @path :'deluserphysically'
        action deluserphysically(USERID: String) 
        returns array of users;
}
