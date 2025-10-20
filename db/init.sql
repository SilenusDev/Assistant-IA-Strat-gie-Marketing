-- ============================================
-- POC Assistant IA Marketing - Base de données
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- CRÉATION DES TABLES
-- ============================================

-- Table scenario_status
CREATE TABLE IF NOT EXISTS scenario_status (
    code VARCHAR(20) PRIMARY KEY,
    label VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO scenario_status (code, label) VALUES
('draft', 'Brouillon'),
('ready', 'Prêt');

-- Table scenarios
CREATE TABLE IF NOT EXISTS scenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    thematique VARCHAR(150) NOT NULL,
    description TEXT,
    statut VARCHAR(20) DEFAULT 'draft' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_thematique (thematique),
    FOREIGN KEY (statut) REFERENCES scenario_status(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table objectifs
CREATE TABLE IF NOT EXISTS objectifs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table cibles
CREATE TABLE IF NOT EXISTS cibles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(120) NOT NULL UNIQUE,
    persona TEXT,
    segment VARCHAR(120),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table ressources
CREATE TABLE IF NOT EXISTS ressources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('article', 'video', 'webinar', 'cas_client', 'autre') NOT NULL,
    titre VARCHAR(150) NOT NULL,
    url VARCHAR(255),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table plans
CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scenario_id INT NOT NULL,
    resume TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
    INDEX idx_scenario (scenario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table plan_items
CREATE TABLE IF NOT EXISTS plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    format VARCHAR(60) NOT NULL,
    message TEXT NOT NULL,
    canal VARCHAR(60) NOT NULL,
    frequence VARCHAR(60),
    kpi VARCHAR(80),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_plan (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scenario_id INT,
    auteur ENUM('user', 'assistant', 'system') NOT NULL,
    contenu TEXT NOT NULL,
    role_action VARCHAR(60),
    ttl DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
    INDEX idx_scenario_created (scenario_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table recherches
CREATE TABLE IF NOT EXISTS recherches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scenario_id INT NOT NULL,
    requete VARCHAR(180) NOT NULL,
    resultat TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tables de liaison
CREATE TABLE IF NOT EXISTS scenario_objectifs (
    scenario_id INT NOT NULL,
    objectif_id INT NOT NULL,
    priorite SMALLINT,
    PRIMARY KEY (scenario_id, objectif_id),
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
    FOREIGN KEY (objectif_id) REFERENCES objectifs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scenario_cibles (
    scenario_id INT NOT NULL,
    cible_id INT NOT NULL,
    maturite ENUM('awareness', 'consideration', 'decision'),
    PRIMARY KEY (scenario_id, cible_id),
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cible_id) REFERENCES cibles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scenario_ressources (
    scenario_id INT NOT NULL,
    ressource_id INT NOT NULL,
    utilisation VARCHAR(120),
    PRIMARY KEY (scenario_id, ressource_id),
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
    FOREIGN KEY (ressource_id) REFERENCES ressources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERTION DES DONNÉES (dataset.json)
-- ============================================

-- Scénario 1: Cas clients & thought leadership SaaS
INSERT INTO scenarios (nom, thematique, description) VALUES
('Cas clients & thought leadership SaaS', 'cas clients / success stories', '{"budget_limite_video": true, "pas_de_ressources_design": false, "localisation_contenus": false}');

INSERT INTO objectifs (label, description) VALUES
('améliorer la notoriété + crédibilité', 'Renforcer la présence de marque et la crédibilité');

INSERT INTO cibles (label, persona, segment) VALUES
('Directeurs Marketing / CMO', 'Directeurs Marketing et CMO', 'SaaS B2B');

INSERT INTO ressources (type, titre) VALUES
('article', 'étude de cas produit X'),
('article', 'article fonctionnalité Y'),
('video', 'témoignage client version courte'),
('autre', 'book comparatif'),
('autre', 'Newsletter'),
('autre', 'Base Contacts'),
('autre', 'Site Web');

INSERT INTO scenario_objectifs (scenario_id, objectif_id) VALUES (1, 1);
INSERT INTO scenario_cibles (scenario_id, cible_id, maturite) VALUES (1, 1, 'consideration');
INSERT INTO scenario_ressources (scenario_id, ressource_id) VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7);

-- Scénario 2: SEO + content hub pour PME industrielle
INSERT INTO scenarios (nom, thematique, description) VALUES
('SEO + content hub pour PME industrielle', 'refonte site & SEO content hub', '{"budget_limite_design": true, "pas_de_équipes internes content": true, "localisation_contenus": false}');

INSERT INTO objectifs (label) VALUES
('augmenter le trafic organique + génération de leads');

INSERT INTO cibles (label, persona, segment) VALUES
('Responsable Marketing / Directeur Digital', 'Responsable Marketing ou Directeur Digital', 'PME industrielle');

INSERT INTO ressources (type, titre) VALUES
('article', 'quelques articles techniques anciens');

INSERT INTO scenario_objectifs (scenario_id, objectif_id) VALUES (2, 2);
INSERT INTO scenario_cibles (scenario_id, cible_id, maturite) VALUES (2, 2, 'awareness');
INSERT INTO scenario_ressources (scenario_id, ressource_id) VALUES (2, 8);

-- Scénario 3: Automation & nurturance pour solution B2B
INSERT INTO scenarios (nom, thematique, description) VALUES
('Automation & nurturance pour solution B2B', 'marketing automation / lead nurturing', '{"pas_de_budget_externe": false, "complexité_technique": true, "localisation_contenus": false}');

INSERT INTO objectifs (label) VALUES
('qualifier les leads + accélérer conversion');

INSERT INTO cibles (label, persona, segment) VALUES
('Responsable Marketing & Acquisition', 'Responsable Marketing et Acquisition', 'Service B2B / SaaS');

INSERT INTO ressources (type, titre) VALUES
('article', 'guide sur le marketing automation'),
('autre', 'schéma funnel'),
('autre', 'checklist automatisation'),
('autre', 'ebook intro');

INSERT INTO scenario_objectifs (scenario_id, objectif_id) VALUES (3, 3);
INSERT INTO scenario_cibles (scenario_id, cible_id, maturite) VALUES (3, 3, 'consideration');
INSERT INTO scenario_ressources (scenario_id, ressource_id) VALUES (3, 9), (3, 10), (3, 11), (3, 12), (3, 5), (3, 6), (3, 7);

-- Scénario 4: LinkedIn Advocacy & personal branding dirigeants
INSERT INTO scenarios (nom, thematique, description) VALUES
('LinkedIn Advocacy & personal branding dirigeants', 'advocacy / leadership / personal branding', '{"pas_de_contenu_existant": true, "budget_limite": false, "localisation_contenus": false}');

INSERT INTO objectifs (label) VALUES
('augmenter la visibilité des dirigeants + thought leadership');

INSERT INTO cibles (label, persona, segment) VALUES
('CEO / CMO / Dirigeant', 'CEO, CMO ou Dirigeant', 'Entreprises B2B / grands comptes');

INSERT INTO scenario_objectifs (scenario_id, objectif_id) VALUES (4, 4);
INSERT INTO scenario_cibles (scenario_id, cible_id, maturite) VALUES (4, 4, 'consideration');
INSERT INTO scenario_ressources (scenario_id, ressource_id) VALUES (4, 6), (4, 7);

-- Scénario 5: Content international & localisation
INSERT INTO scenarios (nom, thematique, description) VALUES
('Content international & localisation', 'localisation / adaptation internationale', '{"budget_localisation": true, "nécessité_de_traducteurs": true, "complexité_locale": true}');

INSERT INTO objectifs (label) VALUES
('déployer le contenu sur plusieurs marchés / langues');

INSERT INTO cibles (label, persona, segment) VALUES
('Responsable Marketing International', 'Responsable Marketing International', 'SaaS / Tech B2B');

INSERT INTO ressources (type, titre) VALUES
('article', 'articles en français'),
('video', 'vidéo corporate FR'),
('autre', 'guide français');

INSERT INTO scenario_objectifs (scenario_id, objectif_id) VALUES (5, 5);
INSERT INTO scenario_cibles (scenario_id, cible_id, maturite) VALUES (5, 5, 'decision');
INSERT INTO scenario_ressources (scenario_id, ressource_id) VALUES (5, 13), (5, 14), (5, 15), (5, 5), (5, 6), (5, 7);

-- Scénario 6: Maintenance de contenu & optimisation SEO
INSERT INTO scenarios (nom, thematique, description) VALUES
('Maintenance de contenu & optimisation SEO', 'audit + mise à jour contenu existant', '{"volumes_grands": true, "ressources_rédactionnelles_limitées": true, "localisation_contenus": false}');

INSERT INTO objectifs (label) VALUES
('améliorer le ROI du contenu existant et le SEO');

INSERT INTO cibles (label, persona, segment) VALUES
('Responsable Contenu / SEO', 'Responsable Contenu ou SEO', 'PME / Entreprises B2B');

INSERT INTO ressources (type, titre) VALUES
('article', '50 articles publiés depuis 3 ans'),
('autre', 'quelques visuels anciens'),
('autre', 'ebook ancien');

INSERT INTO scenario_objectifs (scenario_id, objectif_id) VALUES (6, 6);
INSERT INTO scenario_cibles (scenario_id, cible_id, maturite) VALUES (6, 6, 'consideration');
INSERT INTO scenario_ressources (scenario_id, ressource_id) VALUES (6, 16), (6, 17), (6, 18), (6, 5), (6, 6), (6, 7);

-- Scénario 7: Sales Content pour accompagner les commerciaux
INSERT INTO scenarios (nom, thematique, description) VALUES
('Sales Content pour accompagner les commerciaux', 'Sales Content / supports commerciaux', '{"budget_design": true, "ressources internes limitées": true, "localisation_contenus": false}');

INSERT INTO objectifs (label) VALUES
('équiper les commerciaux avec du contenu convaincant');

INSERT INTO cibles (label, persona, segment) VALUES
('VP Sales / Directeur Commercial', 'VP Sales ou Directeur Commercial', 'Entreprise B2B / solution complexe');

INSERT INTO ressources (type, titre) VALUES
('article', 'articles de leadership'),
('autre', 'schémas techniques'),
('video', 'démonstrations produit'),
('cas_client', 'cas client'),
('autre', 'white paper');

INSERT INTO scenario_objectifs (scenario_id, objectif_id) VALUES (7, 7);
INSERT INTO scenario_cibles (scenario_id, cible_id, maturite) VALUES (7, 7, 'consideration');
INSERT INTO scenario_ressources (scenario_id, ressource_id) VALUES (7, 19), (7, 20), (7, 21), (7, 22), (7, 23), (7, 5), (7, 6), (7, 7);

-- Scénario 8: Expansion vers un nouveau marché / nouvelle verticalité
INSERT INTO scenarios (nom, thematique, description) VALUES
('Expansion vers un nouveau marché / nouvelle verticalité', 'nouveau marché vertical', '{"aucun contenu": true, "budget_test": true, "besoin de recherche de marché": true}');

INSERT INTO objectifs (label) VALUES
('tester un vertical / marché de niche B2B');

INSERT INTO cibles (label, persona, segment) VALUES
('Responsable marketing vertical', 'Responsable marketing vertical', 'vertical niche (ex : IoT, nettoyage industriel)');

INSERT INTO scenario_objectifs (scenario_id, objectif_id) VALUES (8, 8);
INSERT INTO scenario_cibles (scenario_id, cible_id, maturite) VALUES (8, 8, 'awareness');
INSERT INTO scenario_ressources (scenario_id, ressource_id) VALUES (8, 7);

-- ============================================
-- FIN DE L'INITIALISATION
-- ============================================
