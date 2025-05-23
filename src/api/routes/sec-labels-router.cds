using { sec as mysec } from '../models/sec-labels';

@impl: 'src/api/controllers/sec-labels-controller.js'

service LabelsRoute @(path:'/api/labels') {

    entity labels as projection on mysec.labes;

    @Core.Description: 'Get all labels or one label if LABELID is provided'
    @path : 'getalllabels'
    function getalllabels(
        LABELID: String
    )
    returns array of labels;

    @Core.Description: 'Add one Label'
    @path : 'addonelabel'
    action addonelabel(
        label: labels
    )
    returns array of labels;

    @Core.Description: 'Update one label'
    @path : 'updateonelabel'
    action updateonelabel(
        label: labels
    )
    returns array of labels;

    @Core.Description: 'Logical delete of a label'
    @path : 'dellabellogically'
    action dellabellogically(
        label: labels
    )
    returns array of labels;

    
    @Core.Description: 'Logical activate of a label'
    @path : 'actlabellogically'
    action actlabellogically(
        label: labels
    )
    returns array of labels;

    @Core.Description: 'Physical delete of a label'
    @path : 'dellabelphysically'
    action dellabelphysically(
        label: labels
    )
    returns array of labels;

}
