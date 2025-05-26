using { sec as mysec } from '../models/sec-roles';

@impl: 'src/api/controllers/sec-roles-controller.js'

service RolesRoute @(path:'/api/roles') {

  entity roles as projection on mysec.roles;

  @Core.Description: 'Get all roles or one role if ROLEID is provided'
  @path : 'getallroles'
  function getallroles(
    ROLEID: String
  )
  returns array of roles;

  @Core.Description: 'Add one role'
  @path : 'addonerole'
  action addonerole(
    role: roles
  )
  returns array of roles;

  @Core.Description: 'Update one role'
  @path : 'updateonerole'
  action updateonerole(
    role: roles
  )
  returns array of roles;

  @Core.Description: 'Logical delete of a role'
  @path : 'delrolelogically'
  action delrolelogically(
    role: roles
  )
  returns array of roles;

  @Core.Description: 'Physical delete of a role'
  @path : 'delrolephysically'
  action delrolephysically(
    role: roles
  )
  returns array of roles;

  @Core.Description: 'Get full role detail including users and privileges'
  @path : 'getroledetails'
  function getroledetails(
    ROLEID: String
  )
  returns array of roles;

  @Core.Description: 'Get only users related to a role'
  @path : 'getroleusers'
  function getroleusers(
    ROLEID: String
  )
  returns array of {
    USERID: String;
    USERNAME: String;
    COMPANYNAME: String;
  };

  
}
