namespace sec;

entity users {
key   USERID        : String;
      PASSWORD      : String;
      USERNAME      : String;
      ALIAS         : String;
      FIRSTNAME     : String;
      LASTNAME      : String;
      BIRTHDAYDATE  : String;
      COMPANYID     : Integer;
      COMPANYNAME   : String;
      COMPANYALIAS  : String;
      CEDIID        : String;
      EMPLOYEEID    : String;
      EMAIL         : String;
      PHONENUMBER   : String;
      EXTENSION     : String;
      DEPARTMENT    : String;
      FUNCTION      : String;
      STREET        : String;
      POSTALCODE    : Integer;
      CITY          : String;
      REGION        : String;
      STATE         : String;
      COUNTRY       : String;
      AVATAR        : String;

      ROLES         : Composition of many userroles;
      DETAIL_ROW    : Composition of one userdetailrow;
}

entity userroles {
    key ROLEID     : String;
        ROLEIDSAP  : String;
        parent     : Association to users;
}

entity userdetailrow {
    ACTIVED         : Boolean;
    DELETED         : Boolean;
    DETAIL_ROW_REG  : Composition of many userrowreg;
}

entity userrowreg {
        CURRENT : Boolean;
        REGDATE : DateTime;
        REGTIME : DateTime;
        REGUSER : String;
        parent  : Association to userdetailrow;
}
