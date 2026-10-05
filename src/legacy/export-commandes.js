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
        var clientsParId = new Map();
        for (var k = 0; k < clients.length; k++) {
          clientsParId.set(clients[k].id, clients[k]);
        }
        var totauxParCommande = new Map();
        for (var j = 0; j < lignes.length; j++) {
          var resume = totauxParCommande.get(lignes[j].commande_id);
          if (!resume) {
            resume = { nb: 0, tot: 0 };
            totauxParCommande.set(lignes[j].commande_id, resume);
          }
          resume.nb = resume.nb + 1;
          resume.tot = resume.tot + lignes[j].quantite * lignes[j].prix_unitaire;
        }
        var actifs = new Set();
        for (var i = 0; i < commandes.length; i++) {
          var c = commandes[i];
          if (c.statut == 'annulee') {
            continue;
          }
          var cl = clientsParId.get(c.client_id) || null;
          var totaux = totauxParCommande.get(c.id);
          var nb = totaux ? totaux.nb : 0;
          var tot = totaux ? totaux.tot : 0;
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
          actifs.add(c.client_id);
        }
        csv = csv + '# clients actifs;' + actifs.size + '\n';
        callback(null, csv);
      });
    });
  });
}

module.exports = { exporterCommandes: exporterCommandes };
