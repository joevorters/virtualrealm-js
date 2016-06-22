"use strict";

module.exports = Object.create(Array.prototype, {
  getFnByName: {
    value: function getFnByName(name) {
      for (let i = 0; i < this.length; ++i)
        if (name === this[i].name) return this[i];
      return null;
    }
  }
});
