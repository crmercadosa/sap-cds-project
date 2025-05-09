namespace sec;

entity values {
    COMPANYID   :String;
    CEDIID      :String;
    LABELID     :String;
    VALUEPAID   :String;
KEY VALUEID     :String;
    VALUE       :String;
    ALIAS       :String;
    SEQUENCE    :Integer;
    IMAGE       :String;
    DESCRIPTION :String;
    DETAIL_ROW    : Composition of one valuedetailrow;
}

entity valuedetailrow {
    ACTIVED         : Boolean;
    DELETED         : Boolean;
    DETAIL_ROW_REG  : Composition of many valuerowreg;
}

entity valuerowreg {
        CURRENT : Boolean;
        REGDATE : DateTime;
        REGTIME : DateTime;
        REGUSER : String;
        parent  : Association to valuedetailrow;
}