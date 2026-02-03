const localDb = require('./src/lib/localDb').default;

async function test() {
    let allPassed = true;

    // Reset data
    localDb.data.parcelle = [{
        id_parcelle: 1,
        nom_parcelle: 'Test',
        superficie: 2,
        id_culture: 1,
        date_semis: '2025-01-01',
        statut: 'en_cours',
        id_utilisateur: 1
    }];
    localDb.data.stock = [{
        id_stock: 1,
        id_utilisateur: 1,
        id_intrant: 1,
        quantite_actuelle: 50,
        date_derniere_maj: '2025-01-01'
    }];

    // Test Parcel Update
    const parcelQuery = "UPDATE parcelle SET nom_parcelle = $1, superficie = $2 WHERE id_parcelle = $3 AND id_utilisateur = $4";
    await localDb.query(parcelQuery, ['Updated', 10, 1, 1]);
    if (localDb.data.parcelle[0].nom_parcelle !== 'Updated' || localDb.data.parcelle[0].superficie !== 10) {
        console.log('Parcel Update Failed');
        allPassed = false;
    }

    // Test Stock Set
    const stockSetQuery = "UPDATE stock SET quantite_actuelle = $1, date_derniere_maj = $2 WHERE id_stock = $3 AND id_utilisateur = $4";
    await localDb.query(stockSetQuery, [100, '2025-01-02', 1, 1]);
    if (localDb.data.stock[0].quantite_actuelle !== 100) {
        console.log('Stock Set Failed');
        allPassed = false;
    }

    // Test Stock Adjust
    const stockAdjustQuery = "UPDATE stock SET quantite_actuelle = GREATEST(0, COALESCE(quantite_actuelle, 0) + $1), date_derniere_maj = $2 WHERE id_intrant = $3 AND id_utilisateur = $4";
    await localDb.query(stockAdjustQuery, [-20, '2025-01-02', 1, 1]);
    if (localDb.data.stock[0].quantite_actuelle !== 80) {
        console.log('Stock Adjust Failed');
        allPassed = false;
    }

    if (allPassed) {
        console.log('--- ALL TESTS PASSED ---');
    } else {
        console.log('--- SOME TESTS FAILED ---');
    }
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
