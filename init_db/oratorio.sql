-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 18 Des 2025 pada 06.01
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `oratorio`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `alembic_version`
--

CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `alembic_version`
--

INSERT INTO `alembic_version` (`version_num`) VALUES
('abcd1234');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ar_destinations`
--

CREATE TABLE `ar_destinations` (
  `id` int(11) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `marker_image` varchar(500) DEFAULT NULL,
  `mind_file` varchar(255) DEFAULT NULL,
  `glb_model` varchar(500) DEFAULT NULL,
  `qr_link` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ar_destinations`
--

INSERT INTO `ar_destinations` (`id`, `slug`, `name`, `location`, `description`, `thumbnail`, `marker_image`, `mind_file`, `glb_model`, `qr_link`, `created_at`) VALUES
(1, NULL, 'Candi Borobudur', 'Magelang, Jawa Tengah', 'Candi Buddha terbesar di dunia.', NULL, 'borobudur.jpg', 'borobudur.mind', 'borobudur.glb', NULL, '2025-11-26 20:33:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `destinations`
--

CREATE TABLE `destinations` (
  `destination_id` int(11) NOT NULL,
  `destination_name` varchar(150) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `total_visits` int(11) DEFAULT NULL,
  `recent_visits` int(11) DEFAULT NULL,
  `rating` float DEFAULT NULL,
  `reviews_count` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `destinations`
--

INSERT INTO `destinations` (`destination_id`, `destination_name`, `location`, `description`, `image_url`, `total_visits`, `recent_visits`, `rating`, `reviews_count`, `created_at`) VALUES
(1, 'Candi Borobudur', 'Magelang, Jawa Tengah', 'Candi Buddha terbesar di dunia dan situs warisan dunia UNESCO.', '/assets/borobudur.jpg', 10500, 1200, 4.9, 3400, '2025-11-03 02:24:33'),
(2, 'Candi Prambanan', 'Sleman, Yogyakarta', 'Kompleks candi Hindu terbesar di Indonesia.', '/assets/prambanan.jpg', 9500, 890, 4.8, 2900, '2025-11-03 02:24:33'),
(3, 'Monumen Nasional', 'Jakarta Pusat', 'Tugu peringatan perjuangan Indonesia.', '/assets/monas.jpg', 8700, 770, 4.7, 2500, '2025-11-03 02:24:33'),
(4, 'Jam Gadang', 'Bukittinggi, Sumatera Barat', 'Menara jam ikonik peninggalan Belanda.', '/assets/jamgadang.jpg', 7600, 690, 4.6, 2100, '2025-11-03 02:24:33'),
(5, 'Tugu Yogyakarta', 'Yogyakarta', 'Ikon kota Yogyakarta dan simbol perjuangan rakyat.', '/assets/tugujogja.jpg', 8100, 720, 4.5, 1800, '2025-11-03 02:24:33'),
(6, 'Monumen Kresek', 'Madiun, Jawa Timur', 'Monumen peringatan pertempuran PKI Madiun 1948.', '/assets/monumenkresek.jpg', 6400, 510, 4.4, 1300, '2025-11-03 02:24:33');

-- --------------------------------------------------------

--
-- Struktur dari tabel `favorites`
--

CREATE TABLE `favorites` (
  `fav_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `history`
--

CREATE TABLE `history` (
  `history_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `action` varchar(64) NOT NULL DEFAULT 'scan_start',
  `model_type` varchar(16) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `started_at` datetime NOT NULL DEFAULT current_timestamp(),
  `ended_at` datetime DEFAULT NULL,
  `duration_seconds` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `history`
--

INSERT INTO `history` (`history_id`, `user_id`, `user_email`, `destination_id`, `action`, `model_type`, `ip_address`, `user_agent`, `started_at`, `ended_at`, `duration_seconds`, `metadata`) VALUES
(1, 7, 'tes11@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-11 03:33:24', NULL, NULL, '{\"from\": \"scan_page\"}'),
(2, 6, 'tes11@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-10 08:58:35', '2025-12-10 08:58:36', 1, '{\"from\": \"scan_page\", \"duration\": 1}'),
(3, 6, 'tes11@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-10 08:52:19', NULL, NULL, '{\"from\": \"scan_page\"}'),
(4, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-10 08:58:54', '2025-12-10 08:58:56', 2, '{\"from\": \"scan_page\", \"duration\": 2}'),
(5, 8, 'yogaardian114@student.uns.ac.id', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-11 08:16:17', '2025-12-11 08:16:18', 1, '{\"from\": \"scan_page\", \"duration\": 1}'),
(6, NULL, NULL, 1, 'scan_start', 'AR', NULL, NULL, '2025-12-13 13:39:14', NULL, NULL, NULL),
(7, NULL, NULL, 1, 'scan_start', 'AR', NULL, NULL, '2025-12-14 19:53:53', NULL, NULL, NULL),
(8, NULL, NULL, 1, 'scan_start', 'AR', NULL, NULL, '2025-12-14 19:57:36', NULL, NULL, NULL),
(9, NULL, NULL, 1, 'scan_start', 'AR', NULL, NULL, '2025-12-14 20:00:59', NULL, NULL, NULL),
(10, 9, 'tes13@gmail.com', 5, 'scan_success', 'AR', NULL, NULL, '2025-12-14 20:01:32', NULL, NULL, NULL),
(11, NULL, NULL, 1, 'scan_start', 'AR', NULL, NULL, '2025-12-14 21:42:05', NULL, NULL, NULL),
(12, NULL, NULL, 4, 'scan_start', 'AR', NULL, NULL, '2025-12-14 22:46:41', NULL, NULL, NULL),
(13, 9, 'tes13@gmail.com', 5, 'scan_success', 'AR', NULL, NULL, '2025-12-15 00:11:19', NULL, NULL, NULL),
(14, 9, 'tes13@gmail.com', 5, 'scan_success', 'AR', NULL, NULL, '2025-12-15 00:11:26', NULL, NULL, NULL),
(15, 9, 'tes13@gmail.com', 5, 'scan_success', 'AR', NULL, NULL, '2025-12-15 00:11:54', NULL, NULL, NULL),
(16, 9, 'tes13@gmail.com', 5, 'scan_success', 'AR', NULL, NULL, '2025-12-15 00:12:17', NULL, NULL, NULL),
(17, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-15 13:42:21', NULL, NULL, NULL),
(18, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-15 15:18:21', NULL, NULL, NULL),
(19, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-15 15:18:58', NULL, NULL, NULL),
(20, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-15 15:30:32', NULL, NULL, NULL),
(21, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-15 23:31:52', NULL, NULL, NULL),
(22, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 04:41:37', NULL, NULL, NULL),
(23, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 05:01:24', NULL, NULL, NULL),
(24, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 06:13:29', NULL, NULL, NULL),
(25, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 06:14:02', NULL, NULL, NULL),
(26, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 06:17:15', NULL, NULL, NULL),
(27, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 06:17:26', NULL, NULL, NULL),
(28, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 06:18:25', NULL, NULL, NULL),
(29, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-16 06:18:25', NULL, NULL, NULL),
(30, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 06:18:25', NULL, NULL, NULL),
(31, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 06:18:31', NULL, NULL, NULL),
(32, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 06:18:40', NULL, NULL, NULL),
(33, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 06:19:01', NULL, NULL, NULL),
(34, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 06:24:26', NULL, NULL, NULL),
(35, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 06:24:45', NULL, NULL, NULL),
(36, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 06:24:49', NULL, NULL, NULL),
(37, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 06:38:24', NULL, NULL, NULL),
(38, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 06:38:37', NULL, NULL, NULL),
(39, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 12:22:03', NULL, NULL, NULL),
(40, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 12:28:27', NULL, NULL, NULL),
(41, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 12:29:54', NULL, NULL, NULL),
(42, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-16 12:29:54', NULL, NULL, NULL),
(43, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 12:29:54', NULL, NULL, NULL),
(44, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 12:30:05', NULL, NULL, NULL),
(45, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 12:45:35', NULL, NULL, NULL),
(46, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 12:45:49', NULL, NULL, NULL),
(47, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 13:43:40', NULL, NULL, NULL),
(48, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 13:43:52', NULL, NULL, NULL),
(49, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 14:53:44', NULL, NULL, NULL),
(50, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 14:53:52', NULL, NULL, NULL),
(51, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 16:06:33', NULL, NULL, NULL),
(52, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 16:06:45', NULL, NULL, NULL),
(53, 9, 'tes13@gmail.com', 1, 'general_scan_success', 'Native_General_A', NULL, NULL, '2025-12-16 16:08:05', NULL, NULL, NULL),
(54, 9, 'tes13@gmail.com', 1, 'general_scan_success', 'Native_General_A', NULL, NULL, '2025-12-16 16:09:13', NULL, NULL, NULL),
(55, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 16:12:48', NULL, NULL, NULL),
(56, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 16:26:46', NULL, NULL, NULL),
(57, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 17:58:45', NULL, NULL, NULL),
(58, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 17:58:54', NULL, NULL, NULL),
(59, 9, 'tes13@gmail.com', 1, 'general_scan_success', 'Native_General_A', NULL, NULL, '2025-12-16 17:59:32', NULL, NULL, NULL),
(60, 9, 'tes13@gmail.com', 1, 'general_scan_success', 'Native_General_A', NULL, NULL, '2025-12-16 18:00:20', NULL, NULL, NULL),
(61, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 18:01:15', NULL, NULL, NULL),
(62, 9, 'tes13@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-16 18:01:20', NULL, NULL, NULL),
(63, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 18:02:53', NULL, NULL, NULL),
(64, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-16 18:03:30', NULL, NULL, NULL),
(65, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 03:07:10', NULL, NULL, NULL),
(66, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 03:07:10', NULL, NULL, NULL),
(67, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 03:07:10', NULL, NULL, NULL),
(68, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 03:07:14', NULL, NULL, NULL),
(69, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 03:07:18', NULL, NULL, NULL),
(70, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 03:07:18', NULL, NULL, NULL),
(71, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 03:07:18', NULL, NULL, NULL),
(72, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 06:40:53', NULL, NULL, NULL),
(73, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 06:41:08', NULL, NULL, NULL),
(74, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 06:41:09', NULL, NULL, NULL),
(75, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 06:41:09', NULL, NULL, NULL),
(76, 15, 'yoga@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-17 06:41:25', '2025-12-17 06:41:24', 5, NULL),
(77, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 06:49:57', NULL, NULL, NULL),
(78, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 07:08:48', NULL, NULL, NULL),
(79, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 07:08:48', NULL, NULL, NULL),
(80, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 07:08:48', NULL, NULL, NULL),
(81, 15, 'yoga@gmail.com', 1, 'general_scan_success', 'Native_General_A', NULL, NULL, '2025-12-17 07:09:04', '2025-12-17 07:09:04', 5, NULL),
(82, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 07:43:50', NULL, NULL, NULL),
(83, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 07:43:52', NULL, NULL, NULL),
(84, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 07:43:52', NULL, NULL, NULL),
(85, 9, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 07:43:52', NULL, NULL, NULL),
(86, 9, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 07:43:55', NULL, NULL, NULL),
(87, 15, 'yoga@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 08:36:19', NULL, NULL, NULL),
(88, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:36:19', NULL, NULL, NULL),
(89, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:36:20', NULL, NULL, NULL),
(90, 15, 'yoga@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 08:40:57', NULL, NULL, NULL),
(91, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:41:22', NULL, NULL, NULL),
(92, 15, 'yoga@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 08:41:23', NULL, NULL, NULL),
(93, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:41:23', NULL, NULL, NULL),
(94, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:42:05', NULL, NULL, NULL),
(95, 15, 'yoga@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 08:42:05', NULL, NULL, NULL),
(96, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:42:05', NULL, NULL, NULL),
(97, 15, 'yoga@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 08:42:07', NULL, NULL, NULL),
(98, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:47:09', NULL, NULL, NULL),
(99, NULL, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:47:21', NULL, NULL, NULL),
(100, NULL, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 08:47:22', NULL, NULL, NULL),
(101, NULL, 'tes13@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:47:22', NULL, NULL, NULL),
(102, 15, 'yoga@gmail.com', 1, 'native_scan_success', 'Native_Camera', NULL, NULL, '2025-12-17 08:47:28', '2025-12-17 08:47:20', 5, NULL),
(103, 15, 'yoga@gmail.com', 1, 'general_scan_success', 'Native_General_A', NULL, NULL, '2025-12-17 08:48:38', '2025-12-17 08:48:30', 5, NULL),
(104, 15, 'yoga@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:50:23', NULL, NULL, NULL),
(105, 18, 'yoga2@gmail.com', 1, 'scan_start', 'AR', NULL, NULL, '2025-12-17 08:50:49', NULL, NULL, NULL),
(106, NULL, 'tes13@gmail.com', 1, 'scan_end', 'AR', NULL, NULL, '2025-12-17 08:51:30', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `rating` float DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `top_destinations`
--

CREATE TABLE `top_destinations` (
  `id` int(11) NOT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `popularity_score` float DEFAULT NULL,
  `rank_position` int(11) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `top_destinations`
--

INSERT INTO `top_destinations` (`id`, `destination_id`, `popularity_score`, `rank_position`, `last_updated`) VALUES
(1, 1, 0.95, 1, '2025-11-03 02:24:33'),
(2, 2, 0.89, 2, '2025-11-03 02:24:33'),
(3, 3, 0.85, 3, '2025-11-03 02:24:33'),
(4, 4, 0.78, 4, '2025-11-03 02:24:33'),
(5, 5, 0.72, 5, '2025-11-03 02:24:33'),
(6, 6, 0.65, 6, '2025-11-03 02:24:33');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','user','guide') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(4) DEFAULT 1,
  `phone` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `hometown` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`, `created_at`, `is_active`, `phone`, `dob`, `hometown`) VALUES
(1, 'Admin Oratorio', 'admin@oratorio.com', 'admin123', 'admin', '2025-11-03 02:24:33', 1, NULL, NULL, NULL),
(6, 'tes@gmail.com', 'tes@gmail.com', 'scrypt:32768:8:1$KJoKF16C99RP3bUg$eaf836515e857ac7299b4e2565c9a5a1f0f1d36e43e9bbf6f25bdef70dae19b5416afc20e429aa84d7af4448b60ea589b0f55b5aa573ec311690aabb83ccf978', 'user', '2025-11-16 07:55:15', 1, NULL, NULL, NULL),
(7, 'tes11@gmail.com', 'tes11@gmail.com', 'scrypt:32768:8:1$BcaeboCghbAMqlD3$d509f3d22b98c18efecf0bd26950b088e872acdcfe08cb70eb7dace9386d3b0ab3c39b840f5b2be66715765fa21a7c950ee6753584399d0f2e2ec9c9ba5e0612', 'user', '2025-11-16 07:57:37', 1, NULL, NULL, NULL),
(8, 'yogaardian114', 'yogaardian114@student.uns.ac.id', 'scrypt:32768:8:1$gughXWKPgmvIjf5U$a0a46ec83bd1149c96274a85af8b35882c689d48e1662dcc2b14de7790309bf0738be468efeff3120b2bf97873ea3aec7f08f485195a2104a031c99bd9cff233', 'user', '2025-11-26 17:16:46', 1, NULL, NULL, NULL),
(9, 'tes13', 'tes13@gmail.com', 'scrypt:32768:8:1$YEcIb9OIk28NVITF$450c6dfebbe535aafdc3de72203ab6d42b3e14120ebd91b11f98ec64b7fa5b5c584d1d049f779f5a4b028cf9e6f7079a6ba238f9fb60bc4b2d1a8742deeff76d', 'user', '2025-11-27 04:27:13', 1, NULL, NULL, NULL),
(10, 'tess12', 'tess12@gmail.com', 'scrypt:32768:8:1$DZN2QfIUMa0ra9E6$69a9d54a4eb10e269940c00dc4157f0d6ecbef0ba79ec5e188706f5a5ce264818df38ba1da2f0c58729386e5158706410ed0f853548c2da856be5598abf7c426', 'user', '2025-12-05 08:33:00', 1, NULL, NULL, NULL),
(12, 'tes111', 'tes111@gmail.com', 'scrypt:32768:8:1$aSR2GbIfZ6cfg6uW$905909a6e4e56bda51d6c12ee0b66b5a27883405c6e05c7a6f7564f1716ec983d94964bda382ae20a5f53bb56d24065b7467887cc396a18c3d9884c36e5adebc', 'user', '2025-12-11 06:44:35', 1, NULL, NULL, NULL),
(13, 'yogs', 'yogs@gmail.com', 'scrypt:32768:8:1$B2vBrTssXEsUHTpI$332279580de716c921d1d8cdca55a75dfac610b4c4804fba847c08c65bb902d1c73e2baa9c5a3ed8db67664940fcc95e3c6973b5665dbde61e1f83348109015d', 'user', '2025-12-11 08:17:46', 1, NULL, NULL, NULL),
(14, '1', '1@gmail.com', 'scrypt:32768:8:1$jCofdPD7sVZbgnms$c21d8936a30adf23491156f6d2bee7670158666cd0e1122c04aade4ab86a9c46fcd885cc04ff5666fa9780fb3a403b7cb5fdd624398017ddf80985e401028b2f', 'user', '2025-12-14 22:55:19', 1, NULL, NULL, NULL),
(15, 'yoga', 'yoga@gmail.com', 'scrypt:32768:8:1$2cQJQkvh63fsjEVB$f62e788643290f20d4294af6882071c5fb875f8108fa1382e217419917adfaefdd2f603751cd3f7b5031aec47f91b7e0fc70abf8d7f877b5e1ce948217e0c499', 'user', '2025-12-17 02:54:39', 1, '', NULL, ''),
(16, 'yogaa', 'yogaa@gmail.com', 'scrypt:32768:8:1$kMCUQQya7CWXHXQP$21a3bef3653dee60e6900ef3071ab0298321a4ac81d5cfc29e57af4b296f2d476389edc42f60c3b527240d281f8f00a8a115ce95e70afb7b8a45e10dddbc80eb', 'user', '2025-12-17 02:57:16', 1, NULL, NULL, NULL),
(17, 'yogs1', 'yogs1@gmail.com', 'scrypt:32768:8:1$c7roZoJPmwqEamP6$fef5093a79413ab55509462f4be38f1131e4a2194b07ea2755e1103e7217aa5399a4ab53e9c7d2cd81b2139b3f4e45c619414745ca876e1995642fd6108e9e2c', 'user', '2025-12-17 08:35:06', 1, NULL, NULL, NULL),
(18, 'yoga2', 'yoga2@gmail.com', 'scrypt:32768:8:1$aijuke5UStuNh6z0$a4ff124fa7e7494b1debdac6c64bf9de8600b92b7ebf4ebccdfd8adb1663f81d9e241ed451fc3aae5876100c9e516e71d6673092cb5ee0820f028669d49e713f', 'user', '2025-12-17 08:46:48', 1, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `alembic_version`
--
ALTER TABLE `alembic_version`
  ADD PRIMARY KEY (`version_num`);

--
-- Indeks untuk tabel `ar_destinations`
--
ALTER TABLE `ar_destinations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indeks untuk tabel `destinations`
--
ALTER TABLE `destinations`
  ADD PRIMARY KEY (`destination_id`);

--
-- Indeks untuk tabel `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`fav_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indeks untuk tabel `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `destination_id` (`destination_id`),
  ADD KEY `started_at` (`started_at`);

--
-- Indeks untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indeks untuk tabel `top_destinations`
--
ALTER TABLE `top_destinations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `ar_destinations`
--
ALTER TABLE `ar_destinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `destinations`
--
ALTER TABLE `destinations`
  MODIFY `destination_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `favorites`
--
ALTER TABLE `favorites`
  MODIFY `fav_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `history`
--
ALTER TABLE `history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT untuk tabel `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `top_destinations`
--
ALTER TABLE `top_destinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`destination_id`);

--
-- Ketidakleluasaan untuk tabel `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`destination_id`);

--
-- Ketidakleluasaan untuk tabel `top_destinations`
--
ALTER TABLE `top_destinations`
  ADD CONSTRAINT `top_destinations_ibfk_1` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`destination_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
