// Export comptable des commandes, lancé chaque nuit par le cabinet comptable.
// Ne pas toucher : ça marche. (JM, 2021)
var TVA = 0.2;

function requete(db, sql, params, cb) {
  setImmediate(function () {
    var resultat;
    try {
      var stmt = db.prepare(sql);
      resultat = stmt.all.apply(stmt, params);
    } catch (e) {
      cb(e);
      return;
    }
    cb(null, resultat);
  });
}

function formaterMontant(montant) {
  var arrondi = Math.round(montant * 100) / 100;
  var texte = String(arrondi);
  if (texte.indexOf('.') == -1) {
    return texte + ',00';
  }
  var parties = texte.split('.');
  if (parties[1].length == 1) {
    parties[1] = parties[1] + '0';
  }
  return parties[0] + ',' + parties[1];
}

function exporterCommandes(db, depuis, callback) {
  var csv = 'numero;date;client;ville;nb_lignes;total_ht;total_ttc\n';
  requete(db, 'SELECT * FROM commandes WHERE date >= ? ORDER BY date, id', [depuis], function (err, commandes) {
    if (err) {
      callback(err);
      return;
    }
    requete(db, 'SELECT * FROM lignes_commande', [], function (err2, lignes) {
      if (err2) {
        callback(err2);
        return;
      }
      requete(db, 'SELECT * FROM clients', [], function (err3, clients) {
        if (err3) {
          callback(err3);
          return;
        }
        var actifs = [];
        for (var i = 0; i < commandes.length; i++) {
          var c = commandes[i];
          var cl = null;
          for (var k = 0; k < clients.length; k++) {
            if (clients[k].id == c.client_id) {
              cl = clients[k];
            }
          }
          var nb = 0;
          var tot = 0;
          for (var j = 0; j < lignes.length; j++) {
            if (lignes[j].commande_id == c.id) {
              nb = nb + 1;
              tot = tot + lignes[j].quantite * lignes[j].prix_unitaire;
            }
          }
          if (c.statut == 'annulee') {
            continue;
          }
          var htTxt = formaterMontant(tot);
          var ttcTxt = formaterMontant(tot * (1 + TVA));
          var nom = cl ? cl.nom : 'INCONNU';
          if (nom.indexOf(';') != -1) {
            nom = nom.replace(/;/g, ',');
          }
          var ville = cl ? cl.ville : '';
          if (ville.indexOf(';') != -1) {
            ville = ville.replace(/;/g, ',');
          }
          csv = csv + c.id + ';' + c.date + ';' + nom + ';' + ville + ';' + nb + ';' + htTxt + ';' + ttcTxt + '\n';
          var deja = false;
          for (var m = 0; m < actifs.length; m++) {
            if (actifs[m] == c.client_id) {
              deja = true;
            }
          }
          if (!deja) {
            actifs.push(c.client_id);
          }
        }
        csv = csv + '# clients actifs;' + actifs.length + '\n';
        callback(null, csv);
      });
    });
  });
}

module.exports = { exporterCommandes: exporterCommandes };
