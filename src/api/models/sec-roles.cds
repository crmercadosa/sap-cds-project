namespace sec;

entity roles {
  key ROLEID    : String;
      ROLENAME  : String;
      DESCRIPTION : String;

      PRIVILEGES : Composition of many roleprivileges;
      DETAIL_ROW : Composition of one roledetailrow;
}

entity roleprivileges {
    key PROCESSID : String;
        PRIVILEGEID : array of String;
        parent      : Association to roles;
}


entity roledetailrow {
    ACTIVED         : Boolean default true;
    DELETED         : Boolean default false;
    DETAIL_ROW_REG  : Composition of many rolerowreg;
}

entity rolerowreg {
    key ID : UUID;
        CURRENT : Boolean;
        REGDATE : DateTime;
        REGTIME : DateTime;
        REGUSER : String;
        parent  : Association to roledetailrow;
}
