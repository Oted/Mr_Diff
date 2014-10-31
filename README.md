Mr Diff
=========

Diffing json very smoothly
```
../mr_differ> node
> var md = require('./')
hey im mr diff
> md.diff({a:1},{a:2})
[ { action: 'updated',
    path: 'a',
    newData: 2,
    oldData: 1 } ]
```
