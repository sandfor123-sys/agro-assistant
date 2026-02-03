const localDb = require('./src/lib/localDb').default;

async function test() {
    console.log('Testing Parcel Update...');
    const parcelUpdateQuery = `
        UPDATE parcelle 
        SET nom_parcelle = $1, superficie = $2, date_semis = $3, statut = $4
        WHERE id_parcelle = $5 AND id_utilisateur = $6
    `;
    const params = ['Updated Parcel', 5.5, '2026-01-01', 'termine', 1768933620584, 1];

    // Mock data for test
    localDb.data.parcelle = [{
        id_parcelle: 1768933620584,
        nom_parcelle: 'Test',
        superficie: 2.4,
        id_culture: 1,
        date_semis: '2025-12-12',
        statut: 'en_cours',
        id_utilisateur: 1
    }];

    await localDb.query(parcelUpdateQuery, params);

    const updated = localDb.data.parcelle[0];
    console.log('Updated Parcel:', updated);

    if (updated.nom_parcelle === 'Updated Parcel' && updated.superficie === 5.5 && updated.statut === 'termine') {
        console.log('✅ Parcel Update Test Passed');
    } else {
        console.log('❌ Parcel Update Test Failed');
    }

    console.log('\nTesting Stock Update (Set)...');
    const stockUpdateQuery = `UPDATE stock SET quantite_actuelle = $1, date_derniere_maj = $2 WHERE id_stock = $3 AND id_utilisateur = $4`;
    const stockParams = [100, '2026-01-27', 1, 1];

    localDb.data.stock = [{
        id_stock: 1,
        id_utilisateur: 1,
        id_intrant: 1,
        quantite_actuelle: 50,
        date_derniere_maj: '2026-01-20'
    }];

    await localDb.query(stockUpdateQuery, stockParams);
    console.log('Updated Stock:', localDb.data.stock[0]);

    if (localDb.data.stock[0].quantite_actuelle === 100) {
        console.log('✅ Stock Set Test Passed');
    } else {
        console.log('❌ Stock Set Test Failed');
    }

    console.log('\nTesting Stock Update (Adjust)...');
    const stockAdjustQuery = `UPDATE stock SET quantite_actuelle = GREATEST(0, COALESCE(quantite_actuelle, 0) + $1), date_derniere_maj = $2 WHERE id_intrant = $3 AND id_utilisateur = $4`;
    const adjustParams = [-10, '2026-01-27', 1, 1];

    await localDb.query(stockAdjustQuery, adjustParams);
    console.log('Adjusted Stock:', localDb.data.stock[0]);

    if (localDb.data.stock[0].quantite_actuelle === 90) {
        console.log('✅ Stock Adjust Test Passed');
    } else {
        console.log('❌ Stock Adjust Test Failed');
    }
}

test().catch(console.error);
