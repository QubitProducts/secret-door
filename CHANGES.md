### 1.1.1

* fix handleMessage where the hoisted targetOrigin was referring to a unhoisted variable in certain scenarios

### 1.1.0

* use a safer JSON implementation - don't ever call Array.prototype.toJSON when calling JSON.stringify - it breaks on some old websites that have old versions of prototype.js library that has incompatible Array.prototype.toJSON

