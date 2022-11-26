-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 15, 2022 at 09:54 PM
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
-- Table structure for table `affectation_devoir`
--

CREATE TABLE `affectation_devoir` (
  `id` int(11) NOT NULL,
  `etudiant` int(11) NOT NULL,
  `devoir` int(11) NOT NULL,
  `return_date` datetime DEFAULT NULL,
  `note` double NOT NULL,
  `posting_date` datetime DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL
) ;

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
  `etat` enum('O','F') NOT NULL DEFAULT 'F',
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `annee_academique`
--

INSERT INTO `annee_academique` (`id`, `academie`, `debut`, `fin`, `annee_debut`, `annee_fin`, `etat`, `version`) VALUES
(1, '2022-2023', '2022-08-01', '2023-06-23', 2022, 2023, 'O', '1.0.0'),
(2, '2021-2022', '2021-10-04', '2022-06-17', 2021, 2022, 'F', '1.0.0'),
(3, '2023-2024', '2023-09-04', '2024-06-13', 2023, 2024, 'F', '1.0.0'),
(4, '2019-2020', '2019-09-02', '2020-06-12', 2019, 2020, 'F', '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `composition`
--

CREATE TABLE `composition` (
  `id` int(11) NOT NULL,
  `salle_exam` int(11) NOT NULL,
  `etudiant` int(11) NOT NULL,
  `statut` enum('P','A','R') DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL
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
  `coefficient` double NOT NULL,
  `titulaire` int(11) NOT NULL,
  `suppleant` int(11) DEFAULT NULL,
  `annee_academique` int(11) NOT NULL,
  `etat` enum('E','D','S','N') NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `cours`
--

INSERT INTO `cours` (`id`, `code`, `nom`, `niveau`, `session`, `coefficient`, `titulaire`, `suppleant`, `annee_academique`, `etat`, `version`) VALUES
(1, 'GEO-2012', 'Géométrie', 24, 5, 100, 15, NULL, 1, 'E', '1.0.2'),
(2, 'MAT-0001', 'Analyse I', 24, 5, 100, 16, NULL, 1, 'E', '1.0.2');

-- --------------------------------------------------------

--
-- Table structure for table `cours_trace`
--

CREATE TABLE `cours_trace` (
  `id` int(11) NOT NULL,
  `indexe` int(11) NOT NULL,
  `movement` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `posting_date` datetime NOT NULL,
  `version` varchar(50) DEFAULT NULL
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
  `salle` int(11) NOT NULL,
  `salle_classe` int(11) NOT NULL,
  `annee_academique` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `dispensation_trace`
--

CREATE TABLE `dispensation_trace` (
  `id` int(11) NOT NULL,
  `indexe` int(11) NOT NULL,
  `movement` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `posting_date` datetime NOT NULL,
  `version` varchar(50) DEFAULT NULL
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
  `date_acquitation` datetime NOT NULL,
  `version` varchar(50) DEFAULT NULL
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
  `description` text NOT NULL,
  `version` varchar(50) DEFAULT NULL
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
  `etat` enum('A','E','T','D') NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `etudiants`
--

INSERT INTO `etudiants` (`id`, `identite`, `niveau`, `personne_reference`, `telephone_reference`, `etat`, `version`) VALUES
(29, 54, 23, 'Jean François', '3423-2342', 'A', '1.0.0'),
(30, 55, 23, 'Cassandre Méhu', '3234-2322', 'A', '1.0.0'),
(31, 56, 24, 'Mathieu Méhu', '4233-2321', 'A', '1.0.0'),
(32, 57, 24, 'Jacques Michel', '3432-3533', 'A', '1.0.1');

-- --------------------------------------------------------

--
-- Table structure for table `examens`
--

CREATE TABLE `examens` (
  `id` int(11) NOT NULL,
  `cours` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `period` int(11) NOT NULL,
  `duration` time NOT NULL,
  `etat` enum('E','T','A') NOT NULL DEFAULT 'A',
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `exam_period`
--

CREATE TABLE `exam_period` (
  `id` int(11) NOT NULL,
  `session` int(11) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `niveau` int(11) NOT NULL,
  `etat` enum('E','T','A') DEFAULT 'A',
  `annee_academique` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `filieres`
--

CREATE TABLE `filieres` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `suivant` int(11) DEFAULT NULL,
  `annee_academique` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `filieres`
--

INSERT INTO `filieres` (`id`, `nom`, `suivant`, `annee_academique`, `version`) VALUES
(37, 'Primaire', NULL, 1, '1.0.0'),
(38, '3e Cycle', 37, 1, '1.0.0'),
(39, 'Nouveau Secondaire', 38, 1, '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `hierarchie`
--

CREATE TABLE `hierarchie` (
  `id` int(11) NOT NULL,
  `notation` varchar(255) NOT NULL,
  `effectif` int(11) NOT NULL,
  `affectation` int(11) DEFAULT NULL,
  `valeur` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `fichier` varchar(255) NOT NULL,
  `date_upload` datetime NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `fichier`, `date_upload`, `version`) VALUES
(24, '1664566056.jpg', '2022-09-30 15:27:36', '1.0.0'),
(25, '1664738713.jpeg', '2022-10-02 15:25:13', '1.0.0'),
(26, '1664988142.jpg', '2022-10-05 12:42:22', '1.0.0'),
(27, '1664989772.jpg', '2022-10-05 13:09:33', '1.0.0'),
(28, '1664990040.jpeg', '2022-10-05 13:14:00', '1.0.0'),
(29, '1664990158.jpeg', '2022-10-05 13:15:58', '1.0.0');

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
  `memo` text DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `individu`
--

INSERT INTO `individu` (`id`, `code`, `nom`, `prenom`, `sexe`, `adresse`, `email`, `lieu_naissance`, `date_naissance`, `nif`, `ninu`, `poste`, `telephone`, `photo`, `memo`, `version`) VALUES
(41, NULL, 'Core', 'Infinite', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1.0.0'),
(54, NULL, 'Jean', 'Pierre', 'M', 'Champin, Cap-Haitien, Haiti', NULL, 'Cap-Haitien, Haiti', '2007-12-05', NULL, NULL, NULL, NULL, 29, NULL, '1.0.0'),
(55, NULL, 'Alcide', 'Mélinda Angeline', 'F', 'Vertières, Cap-Haitien, Haiti', NULL, 'Cap-Haitien, Haiti', '2010-12-04', NULL, NULL, NULL, NULL, 27, NULL, '1.0.0'),
(56, NULL, 'Méhu', 'Mélinda', 'F', 'Vaudreuil, Plaine-du-Nord, Haiti', NULL, 'Jacmel, Haiti', '2007-12-04', NULL, NULL, NULL, NULL, 28, NULL, '1.0.0'),
(57, NULL, 'Jacques', 'Michelin Gérard', 'M', 'Cité-du-Peuple, Cap-Haitien, Haiti', NULL, 'Limonade, Haiti', '2005-12-02', NULL, NULL, NULL, NULL, 24, NULL, '1.0.1'),
(58, NULL, 'Jean', 'Brie Larvane', 'F', 'Vertières, Cap-Haitien, Haiti', 'brie.larvaj@gmail.com', 'Kenscoff, Haiti', '1995-03-21', '423-123-232-3', '1232312232', NULL, '4322-1223', 25, '', '1.0.0'),
(59, NULL, 'Pierre', 'Maxime Hérald', 'M', 'Rue 20 H, Cap-Haitien, Haiti', 'herald.pierre@gmail.com', 'Cap-Haitien, Haiti', '1980-05-27', '322-121-212-3', '2312131212', NULL, '4323-3212', 26, '', '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `librairie`
--

CREATE TABLE `librairie` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `rayon` int(11) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `niveau`
--

CREATE TABLE `niveau` (
  `id` int(11) NOT NULL,
  `filiere` int(11) NOT NULL,
  `notation` varchar(50) NOT NULL,
  `annee` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `niveau`
--

INSERT INTO `niveau` (`id`, `filiere`, `notation`, `annee`, `version`) VALUES
(21, 37, '1ère AF', 1, '1.0.0'),
(22, 37, '2ème AF', 2, '1.0.0'),
(23, 38, '7ème AF', 1, '1.0.0'),
(24, 39, 'NS I', 1, '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `note` double NOT NULL,
  `composition` int(11) NOT NULL,
  `date_evaluation` datetime NOT NULL,
  `version` varchar(50) DEFAULT NULL
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
  `annee_academique` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `professeurs`
--

INSERT INTO `professeurs` (`id`, `identite`, `niveau_etude`, `status_matrimoniale`, `salaire`, `etat`, `annee_academique`, `version`) VALUES
(15, 58, 'Licence', 'Célibataire', 0, 'M', 1, '1.0.0'),
(16, 59, 'Master', 'Marié(e)', 0, 'M', 1, '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `promotion`
--

CREATE TABLE `promotion` (
  `id` int(11) NOT NULL,
  `salle_classe` int(11) NOT NULL,
  `etudiant` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rayons`
--

CREATE TABLE `rayons` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `recommandation_livre`
--

CREATE TABLE `recommandation_livre` (
  `id` int(11) NOT NULL,
  `cours` int(11) NOT NULL,
  `livre` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `salle`
--

CREATE TABLE `salle` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `capacite` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ;

--
-- Dumping data for table `salle`
--

INSERT INTO `salle` (`id`, `code`, `capacite`, `nom`, `description`, `version`) VALUES
(2, 'B-3342', 40, 'Margarette Papillon', 'Dans le batiment 3', '1.0.0'),
(7, 'S-1001', 45, 'Jean-Paul Sartre', 'C\'est une excellente salle', '1.0.0'),
(8, 'A-2312', 50, 'Margarette P', 'C\'est une autre salle dédiée à Margarette Papillon.', '1.0.0'),
(9, 'a-2341', 30, 'A', 'C\'est une première', '1.0.0'),
(10, 'P-2333', 34, 'B', 'Une deuxième !', '1.0.0'),
(11, 'P-3212', 30, 'A', 'Une autre première.', '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `salle_classe`
--

CREATE TABLE `salle_classe` (
  `id` int(11) NOT NULL,
  `salle` int(11) NOT NULL,
  `niveau` int(11) NOT NULL,
  `annee_academique` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `salle_classe`
--

INSERT INTO `salle_classe` (`id`, `salle`, `niveau`, `annee_academique`, `version`) VALUES
(1, 9, 21, 1, '1.0.0'),
(2, 10, 21, 1, '1.0.0'),
(5, 2, 23, 1, '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `salle_examen`
--

CREATE TABLE `salle_examen` (
  `id` int(11) NOT NULL,
  `examen` int(11) NOT NULL,
  `salle` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `suivant` int(11) DEFAULT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `annee_academique` int(11) NOT NULL,
  `etat` enum('E','T','A') NOT NULL DEFAULT 'A',
  `version` varchar(50) DEFAULT NULL
) ;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `numero`, `suivant`, `date_debut`, `date_fin`, `annee_academique`, `etat`, `version`) VALUES
(5, 1, 24, '2022-09-12', '2022-11-24', 1, 'E', '1.0.0'),
(24, 2, NULL, '2023-01-09', '2023-03-31', 1, 'A', '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `sessiontrace`
--

CREATE TABLE `sessiontrace` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `token` text NOT NULL,
  `last_seen` datetime NOT NULL,
  `private` int(11) NOT NULL,
  `permanent` int(11) NOT NULL,
  `ip` varchar(255) NOT NULL,
  `online` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ;

--
-- Dumping data for table `sessiontrace`
--

INSERT INTO `sessiontrace` (`id`, `user`, `token`, `last_seen`, `private`, `permanent`, `ip`, `online`, `version`) VALUES
(88, 9, 'ss_Aa5a59A37b7047cB2A_033.07f000000001', '2022-08-30 09:33:46', 0, 0, '127.0.0.1', 1, '1.0.0'),
(89, 9, 'eef@0051_2@e85923F3', '2022-08-30 09:33:46', 1, 0, '127.0.0.1', 1, '1.0.0'),
(90, 9, 'ss_e24e4_2397_86888_B592f6.07f000000001', '2022-08-31 06:43:25', 0, 0, '127.0.0.1', 1, '1.0.0'),
(91, 9, '5E&@5e_2_&20&5&F3_', '2022-08-31 06:43:25', 1, 0, '127.0.0.1', 1, '1.0.0'),
(92, 9, 'ss_1917234fe_06bf96c98c30.07f000000001', '2022-08-31 05:36:34', 0, 0, '127.0.0.1', 1, '1.0.0'),
(93, 9, 'B_6fA13ecc1BF3a7Ae353a4acea9ccC', '2022-08-31 05:36:34', 1, 0, '127.0.0.1', 1, '1.0.0'),
(94, 9, 'ss__7B3_6298CA25a_2_ee6c_e70f49_a4.07f000000001', '2022-08-31 11:03:55', 0, 0, '127.0.0.1', 1, '1.0.0'),
(95, 9, '&B5741f235294b96C068381b&_&&3_', '2022-08-31 11:03:56', 1, 0, '127.0.0.1', 1, '1.0.0'),
(96, 9, 'ss_c73a99a38985216fe_143BE58.07f000000001', '2022-08-31 07:49:28', 0, 0, '127.0.0.1', 1, '1.0.0'),
(97, 9, 'a68fc39_A7&834@c2@9A_87510', '2022-08-31 07:49:28', 1, 0, '127.0.0.1', 1, '1.0.0'),
(98, 9, 'ss_76c2A53489f000_f23eA8_8_e2B1c6e7.07f000000001', '2022-09-07 23:34:19', 0, 0, '127.0.0.1', 1, '1.0.0'),
(99, 9, '6ecBa5&E&c91@7C271b@6507F_', '2022-09-07 23:34:19', 1, 0, '127.0.0.1', 1, '1.0.0'),
(100, 9, 'ss_2f89_651893_65204b7a39528_fc40Ef.07f000000001', '2022-09-10 17:48:45', 0, 0, '127.0.0.1', 1, '1.0.0'),
(101, 9, '&71864BF10cbc3@a7_593098@8&87', '2022-09-10 17:48:45', 1, 0, '127.0.0.1', 1, '1.0.0'),
(102, 9, 'ss__5a_61f39ce998275753c3_848831.07f000000001', '2022-09-21 05:09:03', 0, 0, '127.0.0.1', 1, '1.0.0'),
(103, 9, '@A1ee2B0be@_&c4&e&e7715', '2022-09-21 05:09:03', 1, 0, '127.0.0.1', 1, '1.0.0'),
(104, 9, 'ss_7F_5449281284b10C747646.07f000000001', '2022-09-26 14:41:13', 0, 0, '127.0.0.1', 1, '1.0.0'),
(105, 9, '@78070E46&4f8237b864f1@615F0', '2022-09-26 14:41:13', 1, 0, '127.0.0.1', 1, '1.0.0'),
(106, 9, 'ss_a30c65B27__2f274__eE5a_8Fa3C8.07f000000001', '2022-09-27 12:24:35', 0, 0, '127.0.0.1', 1, '1.0.0'),
(107, 9, '53b8e454@214&4Aa11b1692fEEc0', '2022-09-27 12:24:35', 1, 0, '127.0.0.1', 1, '1.0.0'),
(108, 9, 'ss_c9588_74C46bF74643fe6c5B5BB3_3b5.07f000000001', '2022-09-27 12:31:50', 0, 0, '127.0.0.1', 1, '1.0.0'),
(109, 9, '0&2B_&9476@347a421', '2022-09-27 12:31:50', 1, 0, '127.0.0.1', 1, '1.0.0'),
(110, 9, 'ss_9_602a307f589ce9339f2e_6655__ca.07f000000001', '2022-09-30 11:47:26', 0, 0, '127.0.0.1', 1, '1.0.0'),
(111, 9, 'c0&575_e1bc_2817', '2022-09-30 11:47:26', 1, 0, '127.0.0.1', 1, '1.0.0'),
(112, 9, 'ss_af29A_0412e24E114319A13.07f000000001', '2022-09-30 14:14:17', 0, 0, '127.0.0.1', 1, '1.0.0'),
(113, 9, '6671c93ea020_@36@723_', '2022-09-30 14:14:17', 1, 0, '127.0.0.1', 1, '1.0.0'),
(114, 9, 'ss_6C_e8a_1_E5b66e063e40_9_.07f000000001', '2022-10-11 13:06:06', 0, 0, '127.0.0.1', 1, NULL),
(115, 9, '297b7bebA&2_e6b032@af24&b_c50646', '2022-10-11 13:06:06', 1, 0, '127.0.0.1', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `surveillant`
--

CREATE TABLE `surveillant` (
  `id` int(11) NOT NULL,
  `id_surveillant` int(11) NOT NULL,
  `salle_examen` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `system_pref`
--

CREATE TABLE `system_pref` (
  `id` varchar(255) NOT NULL,
  `metadata` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `system_pref`
--

INSERT INTO `system_pref` (`id`, `metadata`) VALUES
('version', '1.0.3');

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
  `scheme` varchar(50) NOT NULL,
  `access` text NOT NULL,
  `date_creation` datetime NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `identite`, `pseudo`, `passcode`, `etat`, `scheme`, `access`, `date_creation`, `version`) VALUES
(9, 41, 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 'actif', 'admin', '0,1,2,3,4,5,6,7,8,9,100,101,102,103,104,110,120,121,122,130,140,150,160,170,171,172,173,174,175,176,177,178,180,181,182,183,190,200,210,220,230,240,250,260,270,280,281,282,283,284,285,286,287,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,310,320,330,340,350,360,370,380,390,400,410,420,430,440', '2021-11-19 14:38:22', '1.0.0');

-- --------------------------------------------------------

--
-- Table structure for table `work`
--

CREATE TABLE `work` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `cours` int(11) NOT NULL,
  `date_emission` datetime NOT NULL,
  `date_remise` datetime NOT NULL,
  `quota` double NOT NULL,
  `final` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `type_remise` enum('P','L') NOT NULL,
  `bareme` int(11) NOT NULL,
  `version` varchar(50) DEFAULT NULL
) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `affectation_devoir`
--
ALTER TABLE `affectation_devoir`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_work_etu` (`etudiant`,`devoir`),
  ADD KEY `fk_assign_work` (`devoir`);

--
-- Indexes for table `annee_academique`
--
ALTER TABLE `annee_academique`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `academie` (`academie`);

--
-- Indexes for table `composition`
--
ALTER TABLE `composition`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_salle_composition` (`salle_exam`),
  ADD KEY `fk_composition_candidat` (`etudiant`);

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
  ADD KEY `fk_annee` (`annee_academique`),
  ADD KEY `fk_course_session` (`session`);

--
-- Indexes for table `cours_trace`
--
ALTER TABLE `cours_trace`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dispensation`
--
ALTER TABLE `dispensation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cours` (`cours`),
  ADD KEY `fk_cours_aca` (`annee_academique`),
  ADD KEY `fk_dispensation_salle` (`salle`),
  ADD KEY `fk_dispensation_salle_classe` (`salle_classe`);

--
-- Indexes for table `dispensation_trace`
--
ALTER TABLE `dispensation_trace`
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `niveau` (`niveau`);

--
-- Indexes for table `examens`
--
ALTER TABLE `examens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_exam_cours` (`cours`),
  ADD KEY `fk_exams_period` (`period`);

--
-- Indexes for table `exam_period`
--
ALTER TABLE `exam_period`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_period_niveau` (`niveau`),
  ADD KEY `fk_exam_annee` (`annee_academique`),
  ADD KEY `fk_period_session` (`session`);

--
-- Indexes for table `filieres`
--
ALTER TABLE `filieres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`),
  ADD UNIQUE KEY `uk_next_level` (`suivant`),
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
  ADD KEY `fk_note_compo` (`composition`);

--
-- Indexes for table `professeurs`
--
ALTER TABLE `professeurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identite` (`identite`);

--
-- Indexes for table `promotion`
--
ALTER TABLE `promotion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_promotion_etudiant_salle` (`etudiant`,`salle_classe`),
  ADD KEY `fk_promotion_salle_classe` (`salle_classe`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `salle_classe`
--
ALTER TABLE `salle_classe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_room_ay` (`annee_academique`),
  ADD KEY `fk_room_class` (`salle`),
  ADD KEY `fk_room_niveau` (`niveau`);

--
-- Indexes for table `salle_examen`
--
ALTER TABLE `salle_examen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_salle_exam` (`examen`),
  ADD KEY `fk_salle_seance_examen` (`salle`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_next_session` (`suivant`),
  ADD KEY `fk_session_academic` (`annee_academique`);

--
-- Indexes for table `sessiontrace`
--
ALTER TABLE `sessiontrace`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_sess` (`user`);

--
-- Indexes for table `surveillant`
--
ALTER TABLE `surveillant`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_surveillant_user` (`id_surveillant`),
  ADD KEY `fk_salle_surveillance` (`salle_examen`);

--
-- Indexes for table `system_pref`
--
ALTER TABLE `system_pref`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_pseudo` (`pseudo`),
  ADD UNIQUE KEY `identite` (`identite`);

--
-- Indexes for table `work`
--
ALTER TABLE `work`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_work_cours` (`cours`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `affectation_devoir`
--
ALTER TABLE `affectation_devoir`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `annee_academique`
--
ALTER TABLE `annee_academique`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `composition`
--
ALTER TABLE `composition`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cours`
--
ALTER TABLE `cours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cours_trace`
--
ALTER TABLE `cours_trace`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dispensation`
--
ALTER TABLE `dispensation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `dispensation_trace`
--
ALTER TABLE `dispensation_trace`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `examens`
--
ALTER TABLE `examens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_period`
--
ALTER TABLE `exam_period`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `filieres`
--
ALTER TABLE `filieres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `hierarchie`
--
ALTER TABLE `hierarchie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `individu`
--
ALTER TABLE `individu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `librairie`
--
ALTER TABLE `librairie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `niveau`
--
ALTER TABLE `niveau`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `professeurs`
--
ALTER TABLE `professeurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `promotion`
--
ALTER TABLE `promotion`
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
-- AUTO_INCREMENT for table `salle_classe`
--
ALTER TABLE `salle_classe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `salle_examen`
--
ALTER TABLE `salle_examen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessiontrace`
--
ALTER TABLE `sessiontrace`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `surveillant`
--
ALTER TABLE `surveillant`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `work`
--
ALTER TABLE `work`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `affectation_devoir`
--
ALTER TABLE `affectation_devoir`
  ADD CONSTRAINT `fk_assign_etu` FOREIGN KEY (`etudiant`) REFERENCES `etudiants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assign_work` FOREIGN KEY (`devoir`) REFERENCES `work` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `composition`
--
ALTER TABLE `composition`
  ADD CONSTRAINT `fk_composition_candidat` FOREIGN KEY (`etudiant`) REFERENCES `etudiants` (`id`),
  ADD CONSTRAINT `fk_salle_composition` FOREIGN KEY (`salle_exam`) REFERENCES `salle_examen` (`id`);

--
-- Constraints for table `cours`
--
ALTER TABLE `cours`
  ADD CONSTRAINT `fk_annee` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_course_session` FOREIGN KEY (`session`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_niveau` FOREIGN KEY (`niveau`) REFERENCES `niveau` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_suppleant` FOREIGN KEY (`suppleant`) REFERENCES `professeurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_titulaire` FOREIGN KEY (`titulaire`) REFERENCES `professeurs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dispensation`
--
ALTER TABLE `dispensation`
  ADD CONSTRAINT `dispensation_ibfk_1` FOREIGN KEY (`cours`) REFERENCES `cours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cours_aca` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`),
  ADD CONSTRAINT `fk_dispensation_salle` FOREIGN KEY (`salle`) REFERENCES `salle` (`id`),
  ADD CONSTRAINT `fk_dispensation_salle_classe` FOREIGN KEY (`salle_classe`) REFERENCES `salle_classe` (`id`);

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
  ADD CONSTRAINT `etudiants_ibfk_2` FOREIGN KEY (`niveau`) REFERENCES `niveau` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `examens`
--
ALTER TABLE `examens`
  ADD CONSTRAINT `fk_exam_cours` FOREIGN KEY (`cours`) REFERENCES `cours` (`id`),
  ADD CONSTRAINT `fk_exams_period` FOREIGN KEY (`period`) REFERENCES `exam_period` (`id`);

--
-- Constraints for table `exam_period`
--
ALTER TABLE `exam_period`
  ADD CONSTRAINT `fk_exam_annee` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`),
  ADD CONSTRAINT `fk_period_niveau` FOREIGN KEY (`niveau`) REFERENCES `niveau` (`id`),
  ADD CONSTRAINT `fk_period_session` FOREIGN KEY (`session`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `filieres`
--
ALTER TABLE `filieres`
  ADD CONSTRAINT `fk_fac_year` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_next_level` FOREIGN KEY (`suivant`) REFERENCES `filieres` (`id`);

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
  ADD CONSTRAINT `fk_note_compo` FOREIGN KEY (`composition`) REFERENCES `composition` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `professeurs`
--
ALTER TABLE `professeurs`
  ADD CONSTRAINT `fk_identite_prof` FOREIGN KEY (`identite`) REFERENCES `individu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `professeurs_ibfk_1` FOREIGN KEY (`identite`) REFERENCES `individu` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion`
--
ALTER TABLE `promotion`
  ADD CONSTRAINT `fk_promotion_etudiant` FOREIGN KEY (`etudiant`) REFERENCES `etudiants` (`id`),
  ADD CONSTRAINT `fk_promotion_salle_classe` FOREIGN KEY (`salle_classe`) REFERENCES `salle_classe` (`id`);

--
-- Constraints for table `recommandation_livre`
--
ALTER TABLE `recommandation_livre`
  ADD CONSTRAINT `fk_rec_cours` FOREIGN KEY (`cours`) REFERENCES `cours` (`id`),
  ADD CONSTRAINT `fk_rec_livre` FOREIGN KEY (`livre`) REFERENCES `librairie` (`id`);

--
-- Constraints for table `salle_classe`
--
ALTER TABLE `salle_classe`
  ADD CONSTRAINT `fk_room_ay` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`),
  ADD CONSTRAINT `fk_room_class` FOREIGN KEY (`salle`) REFERENCES `salle` (`id`),
  ADD CONSTRAINT `fk_room_niveau` FOREIGN KEY (`niveau`) REFERENCES `niveau` (`id`);

--
-- Constraints for table `salle_examen`
--
ALTER TABLE `salle_examen`
  ADD CONSTRAINT `fk_salle_exam` FOREIGN KEY (`examen`) REFERENCES `examens` (`id`),
  ADD CONSTRAINT `fk_salle_seance_examen` FOREIGN KEY (`salle`) REFERENCES `salle` (`id`);

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_next_session` FOREIGN KEY (`suivant`) REFERENCES `sessions` (`id`),
  ADD CONSTRAINT `fk_session_academic` FOREIGN KEY (`annee_academique`) REFERENCES `annee_academique` (`id`);

--
-- Constraints for table `sessiontrace`
--
ALTER TABLE `sessiontrace`
  ADD CONSTRAINT `fk_user_sess` FOREIGN KEY (`user`) REFERENCES `utilisateurs` (`id`);

--
-- Constraints for table `surveillant`
--
ALTER TABLE `surveillant`
  ADD CONSTRAINT `fk_salle_surveillance` FOREIGN KEY (`salle_examen`) REFERENCES `salle_examen` (`id`),
  ADD CONSTRAINT `fk_surveillant_user` FOREIGN KEY (`id_surveillant`) REFERENCES `individu` (`id`);

--
-- Constraints for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`identite`) REFERENCES `individu` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work`
--
ALTER TABLE `work`
  ADD CONSTRAINT `fk_work_cours` FOREIGN KEY (`cours`) REFERENCES `cours` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
