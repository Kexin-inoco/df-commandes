// Vérifie un numéro SIRET : exactement 14 chiffres. Algorithme de Luhn : en partant
// du premier chiffre à gauche, on double un chiffre sur deux (le 1er, le 3e, le 5e...),
// on retranche 9 à tout résultat supérieur à 9, on additionne tous les chiffres obtenus ;
// le total doit être un multiple de 10. Renvoie true ou false.
function validerSiret(numero) {
    if (typeof numero !== "string" || !/^\d{14}$/.test(numero)) {
        return false;
    }

    let somme = 0;
    let double = false;

    for (let i = numero.length - 1; i >= 0; i--) {
        let chiffre = parseInt(numero[i]);

        if (double) {
            chiffre *= 2;
            if (chiffre > 9) {
                chiffre -= 9;
            }
        }

        somme += chiffre;
        double = !double;
    }

    return somme % 10 === 0;
}

const assert = require("node:assert/strict");

assert.strictEqual(validerSiret("12345678900007"), true);
assert.strictEqual(validerSiret("12345678900008"), false);
assert.strictEqual(validerSiret("1234567890000"), false);
assert.strictEqual(validerSiret("1234567890000A"), false);

console.log("4 tests au vert");