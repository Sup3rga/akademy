-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 06, 2022 at 01:47 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `akademy`
--

-- --------------------------------------------------------

--
-- Table structure for table `annee_academique`
--

CREATE TABLE `annee_academique` (
  `id` int(11) NOT NULL,
  `academie` varchar(9) NOT NULL,
  `debut` date NOT NULL,
  `fin` date DEFAULT NULL,
  `annee_debut` int(11) NOT NULL,
  `annee_fin` int(11) NOT NULL,
  `etat` enum('O','F') NOT NULL DEFAULT 'F'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `cours`
--

CREATE TABLE `cours` (
  `id` int(11) NOT NULL,
  `code` varchar(9) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `niveau` int(11) NOT NULL,
  `session` int(11) NOT NULL,
  `coefficient` int(11) NOT NULL,
  `titulaire` int(11) NOT NULL,
  `suppleant` int(11) DEFAULT NULL,
  `annee_academique` int(11) NOT NULL,
  `etat` enum('E','D','S','N') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `dispensation`
--

CREATE TABLE `dispensation` (
  `id` int(11) NOT NULL,
  `jour` int(11) NOT NULL,
  `heure_debut` varchar(8) NOT NULL,
  `heure_fin` varchar(8) NOT NULL,
  `cours` int(11) NOT NULL,
  `tp` tinyint(1) NOT NULL,
  `annee_academique` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `economat_frais`
--

CREATE TABLE `economat_frais` (
  `id` int(11) NOT NULL,
  `planification` int(11) NOT NULL,
  `balance` double NOT NULL,
  `etudiant` int(11) NOT NULL,
  `txn` varchar(100) NOT NULL,
  `date_acquitation` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `economat_planification`
--

CREATE TABLE `economat_planification` (
  `id` int(11) NOT NULL,
  `niveau` int(11) NOT NULL,
  `montant` double NOT NULL,
  `date_echeance` datetime NOT NULL,
  `date_limite` datetime NOT NULL,
  `description` text NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `etudiants`
--

CREATE TABLE `etudiants` (
  `id` int(11) NOT NULL,
  `identite` int(11) NOT NULL,
  `niveau` int(11) NOT NULL,
  `personne_reference` varchar(255) NOT NULL,
  `telephone_reference` varchar(15) NOT NULL,
  `annee_academique` int(11) NOT NULL,
  `etat` enum('A','E','T','D') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `filieres`
--

CREATE TABLE `filieres` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `annee_academique` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `hierarchie`
--

CREATE TABLE `hierarchie` (
  `id` int(11) NOT NULL,
  `notation` varchar(255) NOT NULL,
  `effectif` int(11) NOT NULL,
  `affectation` int(11) DEFAULT NULL,
  `valeur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `fichier` varchar(255) NOT NULL,
  `date_upload` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `individu`
--

CREATE TABLE `individu` (
  `id` int(11) NOT NULL,
  `code` varchar(9) DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `sexe` enum('F','M') DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `lieu_naissance` varchar(255) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `nif` varchar(15) DEFAULT NULL,
  `ninu` varchar(20) DEFAULT NULL,
  `poste` int(100) DEFAULT NULL,
  `telephone` varchar(15) DEFAULT NULL,
  `photo` int(11) DEFAULT NULL,
  `memo` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `librairie`
--

CREATE TABLE `librairie` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `rayon` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `niveau`
--

CREATE TABLE `niveau` (
  `id` int(11) NOT NULL,
  `filiere` int(11) NOT NULL,
  `notation` varchar(50) NOT NULL,
  `annee` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `session` int(11) NOT NULL,
  `id_etu` int(11) NOT NULL,
  `id_cours` int(11) NOT NULL,
  `note` double NOT NULL,
  `annee_academique` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `professeurs`
--

CREATE TABLE `professeurs` (
  `id` int(11) NOT NULL,
  `identite` int(11) NOT NULL,
  `niveau_etude` enum('Licence','Master','Doctorat') NOT NULL,
  `status_matrimoniale` varchar(50) NOT NULL,
  `salaire` double NOT NULL,
  `etat` enum('A','E','C','M') NOT NULL DEFAULT 'M',
  `annee_academique` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rayons`
--

CREATE TABLE `rayons` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `recommandation_livre`
--

CREATE TABLE `recommandation_livre` (
  `id` int(11) NOT NULL,
  `cours` int(11) NOT NULL,
  `livre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `salle`
--

CREATE TABLE `salle` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `capacite` int(11) NOT NULL,
  `niveau` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text NOT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `sessiontrace`
--

CREATE TABLE `sessiontrace` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `token` text NOT NULL,
  `last_seen` datetime NOT NULL,
  `permanent` int(11) NOT NULL,
  `online` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `identite` int(11) NOT NULL,
  `pseudo` varchar(100) NOT NULL,
  `passcode` text NOT NULL,
  `etat` enum('actif','inactif') NOT NULL DEFAULT 'actif',
  `access` varchar(255) NOT NULL,
  `date_creation` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `annee_academique`
--
ALTER TABLE `annee_academique`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `academie` (`academie`);

--
-- Indexes for table `cours`
--
ALTER TABLE `cours`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `uk_nom_niveau` (`nom`,`niveau`),
  ADD KEY `fk_titulaire` (`titulaire`),
  ADD KEY `fk_suppleant` (`suppleant`),
  ADD KEY `fk_niveau` (`niveau`),
  ADD KEY `fk_annee` (`annee_academique`);

--
-- Indexes for table `dispensation`
--
ALTER TABLE `dispensation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cours` (`cours`),
  ADD KEY `fk_cours_aca` (`annee_academique`);

--
-- Indexes for table `economat_frais`
--
ALTER TABLE `economat_frais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_frais_plan` (`planification`),
  ADD KEY `fk_frais_etu` (`etudiant`);

--
-- Indexes for table `economat_planification`
--
ALTER TABLE `economat_planification`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `etudiants`
--
ALTER TABLE `etudiants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identite` (`identite`),
  ADD KEY `niveau` (`niveau`),
  ADD KEY `annee_academique` (`annee_academique`);

--
-- Indexes for table `filieres`
--
ALTER TABLE `filieres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`),
  ADD KEY `fk_fac_year` (`annee_academique`);

--
-- Indexes for table `hierarchie`
--
ALTER TABLE `hierarchie`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_duo` (`notation`,`affectation`),
  ADD KEY `affectation` (`affectation`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `individu`
--
ALTER TABLE `individu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nif` (`nif`),
  ADD UNIQUE KEY `ninu` (`ninu`),
  ADD UNIQUE KEY `telephone` (`telephone`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `photo` (`photo`),
  ADD KEY `fk_hierarchie` (`poste`);

--
-- Indexes for table `librairie`
--
ALTER TABLE `librairie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_book_rayons` (`rayon`);

--
-- Indexes for table `niveau`
--
ALTER TABLE `niveau`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_duo_annee` (`filiere`,`annee`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_etu_cours_annee` (`id_etu`,`id_cours`,`annee_academique`),
  ADD KEY `id_cours` (`id_cours`),
  ADD KEY `annee_academique` (`annee_academique`);

--
-- Indexes for table `professeurs`
--
ALTER TABLE `professeurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identite` (`identite`);

--
-- Indexes for table `rayons`
--
ALTER TABLE `rayons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `recommandation_livre`
--
ALTER TABLE `recommandation_livre`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rec_livre` (`livre`),
  ADD KEY `fk_rec_cours` (`cours`);

--
-- Indexes for table `salle`
--
ALTER TABLE `salle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_salle_niveau` (`niveau`);

--
-- Indexes for table `sessiontrace`
--
ALTER TABLE `sessiontrace`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_sess` (`user`);

--
-- Indexes for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_pseudo` (`pseudo`),
  ADD UNIQUE KEY `identite` (`identite`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `annee_academique`
--
ALTER TABLE `annee_academique`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cours`
--
ALTER TABLE `cours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dispensation`
--
ALTER TABLE `dispensation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `economat_frais`
--
ALTER TABLE `economat_frais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `economat_planification`
--
ALTER TABLE `economat_planification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `etudiants`
--
ALTER TABLE `etudiants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `filieres`
--
ALTER TABLE `filieres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hierarchie`
--
ALTER TABLE `hierarchie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `individu`
--
ALTER TABLE `individu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `librairie`
--
ALTER TABLE `librairie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `niveau`
--
ALTER TABLE `niveau`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `professeurs`
--
ALTER TABLE `professeurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rayons`
--
ALTER TABLE `rayons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recommandation_livre`
--
ALTER TABLE `recommandation_livre`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salle`
--
ALTER TABLE `salle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessiontrace`
--
ALTER TABLE `sessiontrace`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cours`
--
ALTER TABLE `cours`
  ADD CONSTRAINT `fk_annee` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_niveau` FOREIGN KEY (`niveau`) REFERENCES `niveau` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_suppleant` FOREIGN KEY (`suppleant`) REFERENCES `professeurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_titulaire` FOREIGN KEY (`titulaire`) REFERENCES `professeurs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dispensation`
--
ALTER TABLE `dispensation`
  ADD CONSTRAINT `dispensation_ibfk_1` FOREIGN KEY (`cours`) REFERENCES `cours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cours_aca` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`);

--
-- Constraints for table `economat_frais`
--
ALTER TABLE `economat_frais`
  ADD CONSTRAINT `fk_frais_etu` FOREIGN KEY (`etudiant`) REFERENCES `etudiants` (`id`),
  ADD CONSTRAINT `fk_frais_plan` FOREIGN KEY (`planification`) REFERENCES `economat_planification` (`id`);

--
-- Constraints for table `etudiants`
--
ALTER TABLE `etudiants`
  ADD CONSTRAINT `etudiants_ibfk_1` FOREIGN KEY (`identite`) REFERENCES `individu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `etudiants_ibfk_2` FOREIGN KEY (`niveau`) REFERENCES `niveau` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `etudiants_ibfk_3` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `filieres`
--
ALTER TABLE `filieres`
  ADD CONSTRAINT `fk_fac_year` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hierarchie`
--
ALTER TABLE `hierarchie`
  ADD CONSTRAINT `hierarchie_ibfk_1` FOREIGN KEY (`affectation`) REFERENCES `filieres` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `individu`
--
ALTER TABLE `individu`
  ADD CONSTRAINT `fk_hierarchie` FOREIGN KEY (`poste`) REFERENCES `hierarchie` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `individu_ibfk_1` FOREIGN KEY (`photo`) REFERENCES `images` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `librairie`
--
ALTER TABLE `librairie`
  ADD CONSTRAINT `fk_book_rayons` FOREIGN KEY (`rayon`) REFERENCES `rayons` (`id`);

--
-- Constraints for table `niveau`
--
ALTER TABLE `niveau`
  ADD CONSTRAINT `niveau_ibfk_1` FOREIGN KEY (`filiere`) REFERENCES `filieres` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`id_etu`) REFERENCES `etudiants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notes_ibfk_2` FOREIGN KEY (`id_cours`) REFERENCES `cours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notes_ibfk_3` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `professeurs`
--
ALTER TABLE `professeurs`
  ADD CONSTRAINT `fk_identite_prof` FOREIGN KEY (`identite`) REFERENCES `individu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `professeurs_ibfk_1` FOREIGN KEY (`identite`) REFERENCES `individu` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recommandation_livre`
--
ALTER TABLE `recommandation_livre`
  ADD CONSTRAINT `fk_rec_cours` FOREIGN KEY (`cours`) REFERENCES `cours` (`id`),
  ADD CONSTRAINT `fk_rec_livre` FOREIGN KEY (`livre`) REFERENCES `librairie` (`id`);

--
-- Constraints for table `salle`
--
ALTER TABLE `salle`
  ADD CONSTRAINT `fk_salle_niveau` FOREIGN KEY (`niveau`) REFERENCES `niveau` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessiontrace`
--
ALTER TABLE `sessiontrace`
  ADD CONSTRAINT `fk_user_sess` FOREIGN KEY (`user`) REFERENCES `utilisateurs` (`id`);

--
-- Constraints for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`identite`) REFERENCES `individu` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
