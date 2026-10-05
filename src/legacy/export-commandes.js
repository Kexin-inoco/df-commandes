// Export comptable des commandes, lancé chaque nuit par le cabinet comptable.
// Ne pas toucher : ça marche. (JM, 2021)
const TVA = 0.2;
const ENTETE_CSV = 'numero;date;client;ville;nb_lignes;total_ht;total_ttc\n';

function requete(db, sql, params, callback) {
  setImmediate(() => {
    let resultat;
    try {
      const stmt = db.prepare(sql);
      resultat = stmt.all(...params);
    } catch (error) {
      callback(error);
      return;
    }
    callback(null, resultat);
  });
}

function formaterMontant(montant) {
  const arrondi = Math.round(montant * 100) / 100;
  const texte = String(arrondi);
  if (texte.indexOf('.') === -1) {
    return `${texte},00`;
  }
  const parties = texte.split('.');
  if (parties[1].length === 1) {
    parties[1] += '0';
  }
  return `${parties[0]},${parties[1]}`;
}

function indexerLignes(lignes) {
  const totauxParCommande = new Map();
  for (const ligne of lignes) {
    let resume = totauxParCommande.get(ligne.commande_id);
    if (!resume) {
      resume = { nb: 0, total: 0 };
      totauxParCommande.set(ligne.commande_id, resume);
    }
    resume.nb += 1;
    resume.total += ligne.quantite * ligne.prix_unitaire;
  }
  return totauxParCommande;
}

function indexerClients(clients) {
  return new Map(clients.map((client) => [client.id, client]));
}

function formaterChamp(valeur) {
  return valeur.replace(/;/g, ',');
}

function formaterCommande(commande, client, resume) {
  const nbLignes = resume ? resume.nb : 0;
  const total = resume ? resume.total : 0;
  const nom = client ? formaterChamp(client.nom) : 'INCONNU';
  const ville = client ? formaterChamp(client.ville) : '';
  const totalHt = formaterMontant(total);
  const totalTtc = formaterMontant(total * (1 + TVA));
  return `${commande.id};${commande.date};${nom};${ville};${nbLignes};${totalHt};${totalTtc}\n`;
}

function genererCsv(commandes, clientsParId, totauxParCommande) {
  const actifs = new Set();
  let csv = ENTETE_CSV;
  for (const commande of commandes) {
    if (commande.statut === 'annulee') {
      continue;
    }
    csv += formaterCommande(
      commande,
      clientsParId.get(commande.client_id),
      totauxParCommande.get(commande.id),
    );
    actifs.add(commande.client_id);
  }
  return `${csv}# clients actifs;${actifs.size}\n`;
}

function chargerClients(db, commandes, lignes, callback) {
  requete(db, 'SELECT * FROM clients', [], (error, clients) => {
    if (error) {
      callback(error);
      return;
    }
    const csv = genererCsv(commandes, indexerClients(clients), indexerLignes(lignes));
    callback(null, csv);
  });
}

function chargerLignes(db, commandes, callback) {
  requete(db, 'SELECT * FROM lignes_commande', [], (error, lignes) => {
    if (error) {
      callback(error);
      return;
    }
    chargerClients(db, commandes, lignes, callback);
  });
}

function exporterCommandes(db, depuis, callback) {
  requete(db, 'SELECT * FROM commandes WHERE date >= ? ORDER BY date, id', [depuis], (error, commandes) => {
    if (error) {
      callback(error);
      return;
    }
    chargerLignes(db, commandes, callback);
  });
}

module.exports = { exporterCommandes };
