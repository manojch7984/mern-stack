-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 23, 2023 at 02:06 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `studentreact`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(150) NOT NULL,
  `password` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2b$10$dkJpVPke13bWn20YQmydYupm7N9bvlhCGAyMO8hP8lN.bAlYTA9W6');

-- --------------------------------------------------------

--
-- Table structure for table `class`
--

CREATE TABLE `class` (
  `id` int(11) NOT NULL,
  `classname` varchar(150) NOT NULL,
  `section` varchar(150) NOT NULL,
  `entrydate` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class`
--

INSERT INTO `class` (`id`, `classname`, `section`, `entrydate`) VALUES
(1, '1', 'A', '2023-08-21'),
(2, '2', 'B', '2023-08-23');

-- --------------------------------------------------------

--
-- Table structure for table `publicnotice`
--

CREATE TABLE `publicnotice` (
  `id` int(11) NOT NULL,
  `noticetitle` varchar(150) NOT NULL,
  `noticemessage` varchar(500) NOT NULL,
  `entrydate` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `publicnotice`
--

INSERT INTO `publicnotice` (`id`, `noticetitle`, `noticemessage`, `entrydate`) VALUES
(1, 'Notice for Public', 'Candidate must carry an original photo identity card having the same Date of Birth (including Date, Month & Year) as printed on the Admission 452', '2023-08-23'),
(2, 'School Re-Open', 'Now Start the school from Tomorrow', '2023-08-23');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `studentname` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `classname` int(150) NOT NULL,
  `gender` varchar(150) NOT NULL,
  `birth` varchar(150) NOT NULL,
  `studentid` varchar(150) NOT NULL,
  `image` varchar(150) NOT NULL,
  `password` varchar(150) NOT NULL,
  `father` varchar(150) NOT NULL,
  `mother` varchar(150) NOT NULL,
  `contact` varchar(150) NOT NULL,
  `altcontact` varchar(150) NOT NULL,
  `address` varchar(150) NOT NULL,
  `entrydate` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `studentname`, `email`, `classname`, `gender`, `birth`, `studentid`, `image`, `password`, `father`, `mother`, `contact`, `altcontact`, `address`, `entrydate`) VALUES
(1, 'aa', 'aa@gmail.com', 1, 'Male', '2023-08-22', 'fdsws132', 'image_1692692891107.jpeg', '$2b$10$dpc7xHCmutRqKB/jfehc7.xgSWnl2vffgv64bmBlooj3q44mLnpRq', 'aaf', 'aam', '9858895984', '4118484871', 'abc, 123 ,XYZ', '2023-08-22'),
(2, 'kk', 'kk@gmail.com', 2, 'Male', '2023-08-23', 'kk123kk', 'image_1692790234664.svg', '$2b$10$ukluk7wBBhKBJXJWCLzCjOQK1.5hVRBvUOHwMxxn.MQ0xsOdeYMba', 'kka', 'kki', '1234******', '9876******', 'Bhopal , (MP), XYZ, 123', '2023-08-23');

-- --------------------------------------------------------

--
-- Table structure for table `studentnotice`
--

CREATE TABLE `studentnotice` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `classname` int(150) NOT NULL,
  `message` varchar(150) NOT NULL,
  `entrydate` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `studentnotice`
--

INSERT INTO `studentnotice` (`id`, `title`, `classname`, `message`, `entrydate`) VALUES
(1, 'Exam', 1, '1 class exam date 2023-08-30', '2023-08-22'),
(3, 'Festivals', 2, 'Holiday on 28-9-2023', '2023-08-23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `class`
--
ALTER TABLE `class`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `publicnotice`
--
ALTER TABLE `publicnotice`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classname_Id` (`classname`);

--
-- Indexes for table `studentnotice`
--
ALTER TABLE `studentnotice`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classname_Id` (`classname`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `class`
--
ALTER TABLE `class`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `publicnotice`
--
ALTER TABLE `publicnotice`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `studentnotice`
--
ALTER TABLE `studentnotice`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `classname_Id` FOREIGN KEY (`classname`) REFERENCES `class` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `studentnotice`
--
ALTER TABLE `studentnotice`
  ADD CONSTRAINT `classnameId` FOREIGN KEY (`classname`) REFERENCES `class` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
