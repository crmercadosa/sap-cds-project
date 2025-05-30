namespace sec;

entity labes {
    COMPANYID   :String;
    CEDIID      :String;
KEY LABELID     :String;
    LABEL       :String;
    INDEX       :String;
    COLLECTION  :String;
    SECTION     :String;
    SEQUENCE    :Integer;
    IMAGE       :String;
    DESCRIPTION :String;
    DETAIL_ROW    : Composition of one labeluserdetailrow;
}

entity labeluserdetailrow {
    ACTIVED         : Boolean;
    DELETED         : Boolean;
    DETAIL_ROW_REG  : Composition of many labeluserrowreg;
}

entity labeluserrowreg {
        CURRENT : Boolean;
        REGDATE : DateTime;
        REGTIME : DateTime;
        REGUSER : String;
        parent  : Association to labeluserdetailrow;
}
entity ztvalues {
  key LABELID : String;
      VALUES  : Array of String;
}