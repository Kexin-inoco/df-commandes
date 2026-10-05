"use strict";

function validerReference(reference) {
  return (
    typeof reference === "string" &&
    reference.length <= 20 &&
    /^[A-Z0-9]+(?:-[A-Z0-9]+){1,3}$/.test(reference)
  );
}

module.exports = { validerReference };
