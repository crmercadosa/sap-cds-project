using { sec as mysec } from '../models/sec-values';

@impl: 'src/api/controllers/sec-values-controller.js'

service ValuesRoute @(path:'/api/values') {

    entity values as projection on mysec.values;

    @Core.Description: 'Get all values or some values if LABELID is provided'
    @path : 'getallvalues'
    function getallvalues(
        LABELID: String
    )
    returns array of values;

    @Core.Description: 'Add one Value'
    @path : 'addonevalue'
    action addonevalue(
        value: values
    )
    returns array of values;

    @Core.Description: 'Update one value'
    @path : 'updateonevalue'
    action updateonevalue(
        value: values
    )
    returns array of values;

    @Core.Description: 'Logical delete of a value'
    @path : 'delvaluelogically'
    action delvaluelogically(
        value: values
    )
    returns array of values;

    @Core.Description: 'Physical delete of a value'
    @path : 'delvaluephysically'
    action delvaluephysically(
        value: values
    )
    returns array of values;

}
