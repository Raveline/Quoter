"use strict"

exports.removeFromIfExist = function(array, matcher) {
    var searched = array.filter(matcher);
    if (searched.length > 0) {
        var to_remove = searched[0];
        var idx_to_remove = array.indexOf(to_remove);
        array.splice(idx_to_remove, 1);
    }
    return array;
}

