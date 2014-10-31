var Hoek        = require("hoek"),
    Traverse    = require('traverse'),
    internals   = {};
 
function Mr_Diff() {
    console.log('hey im mr diff');
};

/**
 *  Compare two object and returns the difference between them
 *  each entry in the returned represents one diff between priginal and challenger 
 *  
 *  ex:
 *  { 
 *    action : 'deleted'
 *    path: 'stock.0.deleted',
 *    newData: undefined,
 *    oldData: undefined
 *  }
 */
Mr_Diff.prototype.diff = function(original, challenger) {
    var difference  = internals.deepDiffMapper.map(original, challenger),
        nodes       = Traverse(difference).paths(),
        updatePaths = [];
  
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i],
            path,
            changes,
            data;
        
        if (node.length < 2) {
            continue;
        }

        if (node[node.length-1] === 'type') {
            path    = node.join('.');
            changes = Hoek.reach(difference, path);
            
            if (changes !== 'unchanged') {
                updatePaths.push({
                    'action'    : changes,
                    'path'      : node.slice(0, -1).join('.'),
                    'newData'   : Hoek.reach(challenger, node.slice(0, -1).join('.')),
                    'oldData'   : Hoek.reach(original, node.slice(0, -1).join('.'))
                 });
            }
        }
    }
   
   return updatePaths;
};


/**
 *  Deep diff mapper, diffs two given objects and returns the defference, used by the 
 *  products-updater to compare a new product with a given one.
 *
 *  Called with .map
 */
internals.deepDiffMapper = function() {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function(obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                return {type: this.compareValues(obj1, obj2), data: obj1 || obj2};
            }

            var diff = {};
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }

                var value2 = undefined;
                if ('undefined' != typeof(obj2[key])) {
                    value2 = obj2[key];
                }

                diff[key] = this.map(obj1[key], value2);
            }
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) {
                    continue;
                }

                diff[key] = this.map(undefined, obj2[key]);
            }

            return diff;

        },
        compareValues: function(value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if ('undefined' == typeof(value1)) {
                return this.VALUE_CREATED;
            }
            if ('undefined' == typeof(value2)) {
                return this.VALUE_DELETED;
            }

            return this.VALUE_UPDATED;
        },
        isFunction: function(obj) {
            return {}.toString.apply(obj) === '[object Function]';
        },
        isArray: function(obj) {
            return {}.toString.apply(obj) === '[object Array]';
        },
        isObject: function(obj) {
            return {}.toString.apply(obj) === '[object Object]';
        },
        isValue: function(obj) {
            return !this.isObject(obj) && !this.isArray(obj);
        }
    }
}();

module.exports = exports = new Mr_Diff();
