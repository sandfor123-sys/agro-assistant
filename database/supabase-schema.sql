-- Création des tables pour AgriAssist Platform
-- Exécuter ce script dans Supabase SQL Editor

-- Extension pour les UUID (si nécessaire)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des cultures
CREATE TABLE IF NOT EXISTS culture (
    id_culture SERIAL PRIMARY KEY,
    nom_culture VARCHAR(100) NOT NULL,
    couleur VARCHAR(20) DEFAULT '#10b981',
    cycle_vie_jours INTEGER DEFAULT 120,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    nom VARCHAR(50),
    prenom VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255),
    telephone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des parcelles
CREATE TABLE IF NOT EXISTS parcelle (
    id_parcelle SERIAL PRIMARY KEY,
    nom_parcelle VARCHAR(100) NOT NULL,
    superficie DECIMAL(10,2) NOT NULL,
    id_culture INTEGER REFERENCES culture(id_culture),
    date_semis DATE NOT NULL,
    statut VARCHAR(20) DEFAULT 'en_cours',
    id_utilisateur INTEGER REFERENCES utilisateur(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des intrants
CREATE TABLE IF NOT EXISTS intrant (
    id_intrant SERIAL PRIMARY KEY,
    nom_intrant VARCHAR(100) NOT NULL,
    type_intrant VARCHAR(50), -- 'engrais', 'pesticide', 'semence', etc.
    unite_mesure VARCHAR(20) DEFAULT 'kg',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des stocks
CREATE TABLE IF NOT EXISTS stock (
    id_stock SERIAL PRIMARY KEY,
    id_intrant INTEGER REFERENCES intrant(id_intrant),
    id_utilisateur INTEGER REFERENCES utilisateur(id_utilisateur),
    quantite DECIMAL(10,2) NOT NULL DEFAULT 0,
    date_achat DATE,
    cout_unitaire DECIMAL(10,2),
    fournisseur VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des alertes
CREATE TABLE IF NOT EXISTS alerte (
    id_alerte SERIAL PRIMARY KEY,
    id_parcelle INTEGER REFERENCES parcelle(id_parcelle),
    id_utilisateur INTEGER REFERENCES utilisateur(id_utilisateur),
    type_alerte VARCHAR(50), -- 'maladie', 'ravageur', 'meteo', etc.
    description TEXT NOT NULL,
    gravite VARCHAR(20) DEFAULT 'moyenne', -- 'faible', 'moyenne', 'elevee'
    statut VARCHAR(20) DEFAULT 'ouverte', -- 'ouverte', 'en_cours', 'resolue'
    date_alerte DATE DEFAULT CURRENT_DATE,
    date_resolution DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS tache (
    id_tache SERIAL PRIMARY KEY,
    id_parcelle INTEGER REFERENCES parcelle(id_parcelle),
    id_utilisateur INTEGER REFERENCES utilisateur(id_utilisateur),
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    type_tache VARCHAR(50), -- 'semis', 'recolte', 'traitement', etc.
    date_echeance DATE,
    statut VARCHAR(20) DEFAULT 'a_faire', -- 'a_faire', 'en_cours', 'terminee'
    priorite VARCHAR(20) DEFAULT 'normale', -- 'basse', 'normale', 'elevee'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des données de base pour les cultures
INSERT INTO culture (nom_culture, couleur, cycle_vie_jours, description) VALUES
('Maïs', '#f59e0b', 120, 'Culture de maïs doux ou grain'),
('Blé', '#eab308', 110, 'Culture de blé tendre'),
('Tomate', '#ef4444', 90, 'Culture de tomates industrielles'),
('Pomme de terre', '#a16207', 100, 'Culture de pommes de terre'),
('Carotte', '#fb923c', 80, 'Culture de carottes'),
('Salade', '#84cc16', 60, 'Culture de salades'),
('Courgette', '#22c55e', 70, 'Culture de courgettes'),
('Poivron', '#f97316', 85, 'Culture de poivrons'),
('Chou', '#16a34a', 95, 'Culture de choux'),
('Oignon', '#ca8a04', 110, 'Culture d''oignons');

-- Insertion des intrants de base
INSERT INTO intrant (nom_intrant, type_intrant, unite_mesure, description) VALUES
('Engrais NPK 15-15-15', 'engrais', 'kg', 'Engrais complet équilibré'),
('Urée 46%', 'engrais', 'kg', 'Engrais azoté'),
('Superphosphate', 'engrais', 'kg', 'Engrais phosphaté'),
('Potasse', 'engrais', 'kg', 'Engrais potassique'),
('Fongicide cuivre', 'pesticide', 'L', 'Traitement fongicide à base de cuivre'),
('Insecticide pyrèthre', 'pesticide', 'L', 'Insecticide naturel'),
('Herbicide total', 'pesticide', 'L', 'Désherbant non sélectif'),
('Semences maïs', 'semence', 'kg', 'Semences certifiées de maïs'),
('Semences blé', 'semence', 'kg', 'Semences certifiées de blé'),
('Semences tomate', 'semence', 'g', 'Semences de tomates');

-- Création d'un utilisateur par défaut (vous pouvez changer ces valeurs)
INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, telephone) VALUES
('Utilisateur', 'Test', 'test@agriassist.com', 'password123', '0123456789');

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_parcelle_utilisateur ON parcelle(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_parcelle_culture ON parcelle(id_culture);
CREATE INDEX IF NOT EXISTS idx_alerte_utilisateur ON alerte(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_alerte_statut ON alerte(statut);
CREATE INDEX IF NOT EXISTS idx_stock_utilisateur ON stock(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_tache_utilisateur ON tache(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_tache_statut ON tache(statut);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parcelle_updated_at 
    BEFORE UPDATE ON parcelle 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
